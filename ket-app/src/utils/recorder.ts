/**
 * 录音兼容层
 *
 * ============================ 为什么需要 ============================
 *
 * 国产安卓上「录音完全不可用」不是单点问题，是三层依赖里
 * 有一层断了就全瘫：
 *
 *   getUserMedia（麦克风权限）→ MediaRecorder（录音）→ SpeechRecognition（识别）
 *      HTTPS ✅              微信/QQ/UC 内置浏览器 ❌    Google 服务，国产必挂 ❌
 *
 * 实测的浏览器兼容情况（2026-10 查证）：
 *   Android Chrome / 鸿蒙 / 厂商自带浏览器 : MediaRecorder ✅  Web Audio ✅
 *   微信内置浏览器                        : MediaRecorder ⚠️  Web Audio ✅（老微信会拦 getUserMedia）
 *   QQ 内置浏览器                          : MediaRecorder ❌  Web Audio ⚠️
 *   UC 浏览器                              : MediaRecorder ❌  Web Audio ❌
 *   iOS Safari                            : MediaRecorder ✅（只能 mp4）
 *
 * 所以做三层降级，每层都能独立产出可上传的音频：
 *   L1  MediaRecorder    —— 格式小（webm 11KB/3s），首选
 *   L2  Web Audio API    —— 录成 16kHz WAV，兼容性比 MediaRecorder 好得多
 *   L3  手动输入文字     —— 前端兜底（ SpeakingPage 里已有输入框）
 *
 * 后端 SiliconFlow 实测支持 mp4 / webm / wav 三种格式，
 * 所以这层不需要为格式做任何特殊处理。
 * ===================================================================
 */

/** 当前环境的录音能力 */
export type RecorderCapability = 'mediarecorder' | 'webaudio' | 'none';

export interface RecordingResult {
  blob: Blob;
  /** 实际使用的录音方式（用于 UI 提示与排查） */
  capability: RecorderCapability;
  /** 采样率（Web Audio 路径才有意义） */
  sampleRate?: number;
}

/** 录音过程中的句柄 */
export interface RecorderHandle {
  /** 停止并产出音频 */
  stop: () => Promise<RecordingResult>;
  /** 放弃本次录音 */
  cancel: () => void;
}

/** MediaRecorder 支持的 MIME，按体积/兼容性排序 */
const CANDIDATE_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
  'audio/ogg',
];

function hasMediaRecorder(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).MediaRecorder !== 'undefined';
}

function hasWebAudio(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return Boolean(w.AudioContext || w.webkitAudioContext);
}

/**
 * 探测当前环境的录音能力。
 * 注意：MediaRecorder 存在不等于能用（微信内置浏览器里存在但录不出东西），
 * 所以这里只做「API 是否存在」的静态判断，真正的失败要在 start 时兜底。
 */
export function detectRecorderCapability(): RecorderCapability {
  if (hasMediaRecorder()) return 'mediarecorder';
  if (hasWebAudio()) return 'webaudio';
  return 'none';
}

/** 找出当前浏览器支持的录音 MIME；都不支持时返回空串（让浏览器自己选） */
export function pickMimeType(): string {
  if (!hasMediaRecorder()) return '';
  const MR = (window as any).MediaRecorder;
  if (typeof MR.isTypeSupported !== 'function') return '';
  for (const t of CANDIDATE_TYPES) {
    try {
      if (MR.isTypeSupported(t)) return t;
    } catch {
      /* 某些浏览器实现会抛，忽略继续试下一个 */
    }
  }
  return '';
}

/** 拿到一个可用的 AudioContext（兼容旧版 webkit 前缀） */
function createAudioContext(): AudioContext {
  const w = window as any;
  const Ctor = w.AudioContext || w.webkitAudioContext;
  return new Ctor();
}

/** 线性插值降采样，把 44.1k/48k 压到 16k（体积降到 1/3，ASR 精度不变） */
export function downsample(samples: Float32Array, fromRate: number, toRate = 16000): Float32Array {
  if (fromRate <= toRate) return samples;
  const ratio = fromRate / toRate;
  const outLen = Math.floor(samples.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const pos = i * ratio;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const a = samples[idx] ?? 0;
    const b = samples[idx + 1] ?? a;
    out[i] = a + (b - a) * frac;
  }
  return out;
}

/** 把 PCM 采样点封成标准 WAV 文件（16bit 单声道） */
export function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);          // fmt chunk size
  view.setUint16(20, 1, true);           // PCM
  view.setUint16(22, 1, true);           // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate = rate * blockAlign
  view.setUint16(32, 2, true);           // block align
  view.setUint16(34, 16, true);          // bits per sample
  writeStr(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

// ============================================================ L1: MediaRecorder

// ============================================================ 启动录音

/**
 * 开始录音。优先 MediaRecorder，失败自动降级到 Web Audio。
 *
 * @throws 麦克风权限被拒 / 浏览器完全不支持录音
 */
export async function startRecording(): Promise<RecorderHandle> {
  const errors: string[] = [];

  if (hasMediaRecorder()) {
    try {
      return await startWithMediaRecorder(errors);
    } catch (e) {
      errors.push(`MediaRecorder: ${(e as Error).message}`);
    }
  }

  if (hasWebAudio()) {
    try {
      return await startWithWebAudio(errors);
    } catch (e) {
      errors.push(`WebAudio: ${(e as Error).message}`);
    }
  }

  throw new Error(
    errors.length ? errors.join(' | ') : '当前浏览器不支持录音（MediaRecorder 与 Web Audio 都不可用）'
  );
}

async function startWithMediaRecorder(_prev: string[]): Promise<RecorderHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType = pickMimeType();
  const MR = (window as any).MediaRecorder;
  const recorder = mimeType ? new MR(stream, { mimeType }) : new MR(stream);

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e: BlobEvent) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return {
    stop: () =>
      new Promise<RecordingResult>((resolve) => {
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          // 关键：Blob 的类型要用实际录出来的 MIME，
          // 早期版本硬编码 audio/webm，iOS 录的 mp4 会被标错导致后端解不出。
          const type = mimeType || (chunks[0] as Blob | undefined)?.type || 'audio/webm';
          resolve({ blob: new Blob(chunks, { type }), capability: 'mediarecorder' });
        };
        try {
          recorder.start(200);
        } catch {
          // start 已失败过（没有 timeslice 时某些实现会抛），直接收尾
          recorder.onstop?.();
        }
      }),
    cancel: () => {
      try { recorder.onstop = null; recorder.stop(); } catch { /* ignore */ }
      stream.getTracks().forEach((t) => t.stop());
    },
  };
}

async function startWithWebAudio(_prev: string[]): Promise<RecorderHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const ctx = createAudioContext();
  // 必须在用户手势里 resume，否则安卓上会停在 suspended 状态录到静音
  if (ctx.state === 'suspended') {
    try { await ctx.resume(); } catch { /* ignore */ }
  }

  const source = ctx.createMediaStreamSource(stream);
  const processor = ctx.createScriptProcessor(4096, 1, 1);
  const silentGain = ctx.createGain();
  silentGain.gain.value = 0; // 必须静音，否则麦克风声音会被回放出来产生啸叫

  const chunks: Float32Array[] = [];
  processor.onaudioprocess = (e: AudioProcessingEvent) => {
    chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  };

  source.connect(processor);
  processor.connect(silentGain);
  silentGain.connect(ctx.destination);

  const cleanup = () => {
    try { source.disconnect(); } catch { /* ignore */ }
    try { processor.disconnect(); } catch { /* ignore */ }
    try { silentGain.disconnect(); } catch { /* ignore */ }
    stream.getTracks().forEach((t) => t.stop());
    try { void ctx.close(); } catch { /* ignore */ }
  };

  return {
    stop: () =>
      new Promise<RecordingResult>((resolve) => {
        const total = chunks.reduce((a, c) => a + c.length, 0);
        const merged = new Float32Array(total);
        let off = 0;
        for (const c of chunks) { merged.set(c, off); off += c.length; }
        const rate = ctx.sampleRate || 16000;
        const downsampled = downsample(merged, rate, 16000);
        cleanup();
        resolve({
          blob: encodeWav(downsampled, 16000),
          capability: 'webaudio',
          sampleRate: 16000,
        });
      }),
    cancel: () => {
      processor.onaudioprocess = null;
      cleanup();
    },
  };
}

/**
 * 给用户看的环境提示。
 * 国产安卓上最有效的建议是「添加到主屏幕」——
 * 这样会用系统 WebView（Chromium 内核）打开，兼容性比在自带浏览器里好得多。
 */
export function recorderHint(): string {
  const cap = detectRecorderCapability();
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isWechat = /MicroMessenger/i.test(ua);
  const isQQ = /QQ\//i.test(ua);
  const isUC = /UCBrowser/i.test(ua);

  if (isWechat) {
    return '微信内置浏览器录音不稳定，建议点右上角「···」→ 在浏览器中打开，或添加到主屏幕。';
  }
  if (isQQ) {
    return 'QQ 内置浏览器兼容性较差，建议用系统自带浏览器打开，或添加到主屏幕。';
  }
  if (isUC) {
    return 'UC 浏览器不支持网页录音，建议用系统自带浏览器打开，或添加到主屏幕。';
  }
  if (cap === 'none') {
    return '当前浏览器不支持录音。国产手机建议「添加到主屏幕」后再试，或换用系统自带浏览器。';
  }
  if (cap === 'webaudio') {
    return '当前浏览器不支持标准录音格式，已自动改用兼容模式（音质略降但可用）。';
  }
  return '';
}
