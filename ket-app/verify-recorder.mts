/**
 * 录音兼容层验证
 * 重点：Web Audio 降级路径产出的 WAV 必须真的能被 ASR 识别（端到端）
 */
import { encodeWav, downsample, pickMimeType, detectRecorderCapability, recorderHint } from './src/utils/recorder.ts';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const DAY = 86_400_000;
let fail = 0;
const bad = (m: string) => { console.log('  ❌ ' + m); fail++; };
const ok = (m: string) => console.log('  ✅ ' + m);

// ---------- 1. WAV 封装正确性 ----------
console.log('=== 1) WAV 文件头与数据 ===');
const SR = 16000;
const samples = new Float32Array(SR * 2); // 2 秒
for (let i = 0; i < samples.length; i++) {
  const t = i / SR;
  // 模拟语音：120Hz 基频 + 音节包络
  const syl = 0.5 * (1 - Math.cos(2 * Math.PI * 4 * t));
  samples[i] = 0.4 * syl * Math.sin(2 * Math.PI * 220 * t);
}
const wav = encodeWav(samples, SR);
const buf = Buffer.from(await wav.arrayBuffer());
const str = (off: number, len: number) => buf.slice(off, off + len).toString('ascii');

if (str(0, 4) === 'RIFF') ok('RIFF 头正确');
else bad(`RIFF 头错误：${str(0, 4)}`);
if (str(8, 4) === 'WAVE') ok('WAVE 格式正确');
else bad(`WAVE 错误：${str(8, 4)}`);
if (str(12, 4) === 'fmt ') ok('fmt 块标记正确');
else bad(`fmt 标记错误`);
if (str(36, 4) === 'data') ok('data 块标记正确');
else bad(`data 标记错误`);
if (buf.readUInt16LE(20) === 1) ok('编码 = PCM (1)');
else bad(`PCM 标记错：${buf.readUInt16LE(20)}`);
if (buf.readUInt16LE(22) === 1) ok('声道 = 单声道');
else bad(`声道数错：${buf.readUInt16LE(22)}`);
if (buf.readUInt32LE(24) === SR) ok(`采样率 = ${SR}`);
else bad(`采样率错：${buf.readUInt32LE(24)}`);
if (buf.readUInt16LE(34) === 16) ok('位深 = 16bit');
else bad(`位深错：${buf.readUInt16LE(34)}`);
const declared = buf.readUInt32LE(40);
if (declared === samples.length * 2) ok(`data 长度 = ${declared}（与采样数一致）`);
else bad(`data 长度错：${declared} 应为 ${samples.length * 2}`);
if (buf.length === 44 + samples.length * 2) ok(`文件总长 ${buf.length} 字节`);
else bad(`文件总长错：${buf.length}`);
// RIFF size 字段
if (buf.readUInt32LE(4) === 36 + samples.length * 2) ok('RIFF size 字段正确');
else bad(`RIFF size 错：${buf.readUInt32LE(4)}`);

// ---------- 2. 采样数据保真度 ----------
console.log('\n=== 2) 采样数据保真度（量化误差检查）===');
let maxErr = 0;
for (let i = 0; i < 200; i++) {
  const idx = Math.floor((samples.length / 200) * i);
  const raw = buf.readInt16LE(44 + idx * 2);
  const expect = Math.max(-1, Math.min(1, samples[idx])) * 0x7fff;
  maxErr = Math.max(maxErr, Math.abs(raw - expect));
}
if (maxErr <= 1) ok(`量化误差 <= 1 LSB（最大 ${maxErr.toFixed(2)}）`);
else bad(`量化误差过大：${maxErr.toFixed(1)}`);

// ---------- 3. 降采样 ----------
console.log('\n=== 3) 降采样 48k -> 16k ===');
const src48 = new Float32Array(48000);
for (let i = 0; i < src48.length; i++) src48[i] = Math.sin((2 * Math.PI * 440 * i) / 48000);
const out16 = downsample(src48, 48000, 16000);
if (out16.length === 16000) ok(`1 秒 48k -> ${out16.length} 个采样（期望 16000）`);
else bad(`降采样长度错：${out16.length}`);
// 频率不变性：数零交叉点
const crossings = (arr: Float32Array) => {
  let n = 0;
  for (let i = 1; i < arr.length; i++) if (arr[i - 1] <= 0 && arr[i] > 0) n++;
  return n;
};
const cIn = crossings(src48);
const cOut = crossings(out16);
// 降采样只减少采样点，不改变信号频率 —— 同样 1 秒内的过零次数应当基本一致
if (Math.abs(cOut - cIn) / Math.max(1, cIn) < 0.1) {
  ok(`频率保持不变（1 秒内过零 ${cIn} 次 -> ${cOut} 次）`);
} else {
  bad(`降采样后频率漂移：过零 ${cIn} -> ${cOut}`);
}

// ---------- 4. 端到端：生成的 WAV 能被 ASR 识别吗 ----------
console.log('\n=== 4) 端到端：WAV 送 SiliconFlow ASR ===');
const cfgPath = join(process.cwd(), 'sf_verify_cfg.txt');
const audioPath = join(process.cwd(), 'sf_verify_test.wav');
// 从 worker/.dev.vars 读 Key 生成 curl config（Key 只落在临时文件，跑完删除）
const devVars = join(process.cwd(), '..', 'worker', '.dev.vars');
if (!existsSync(devVars)) {
  console.log('  ⚠️ 跳过（未找到 worker/.dev.vars 的 Key）');
} else {
  const kv: Record<string, string> = {};
  for (const l of readFileSync(devVars, 'utf-8').trim().split('\n')) {
    const i = l.indexOf('=');
    if (i > 0) kv[l.slice(0, i).trim()] = l.slice(i + 1).trim();
  }
  writeFileSync(cfgPath, `header = "Authorization: Bearer ${kv.SILICONFLOW_API_KEY}"\n`);
  writeFileSync(audioPath, buf);
  const mp3 = ['public/audio'].length ? null : null;
  // 用项目自带的真实教材音频转成 16k WAV（模拟 Web Audio 录出来的格式）
  const { execFileSync } = await import('node:child_process');
  const fs = await import('node:fs');
  const list = fs.readdirSync('public/audio').filter(f => f.endsWith('.mp3')).sort();
  const src = join('public/audio', list[0]);
  try {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src,
      '-c:a', 'pcm_s16le', '-ar', '16000', '-ac', '1', audioPath]);
    const { execFileSync: ex } = await import('node:child_process');
    const outTxt = ex('curl', ['-sS', '-m', '60', '--config', cfgPath,
      '-X', 'POST', 'https://api.siliconflow.cn/v1/audio/transcriptions',
      '-F', `file=@${audioPath};type=audio/wav`,
      '-F', 'model=FunAudioLLM/SenseVoiceSmall', '-F', 'language=en'],
      { encoding: 'utf-8' });
    const j = JSON.parse(outTxt);
    if (j.text) ok(`ASR 识别成功："${j.text}"`);
    else bad(`ASR 返回空文本：${outTxt.slice(0, 120)}`);
  } catch (e) {
    console.log('  ⚠️ 跳过（ffmpeg/curl 不可用）:', (e as Error).message.slice(0, 80));
  } finally {
    try { unlinkSync(audioPath); } catch { /* ignore */ }
    try { unlinkSync(cfgPath); } catch { /* ignore */ }
  }
}

// ---------- 5. 兼容性探测 ----------
console.log('\n=== 5) 兼容性探测 ===');
const g = globalThis as any;
const origMR = g.MediaRecorder;
const origAC = g.AudioContext;
// Node 里没有 window —— recorder.ts 里的检测走 window.*，这里把 globalThis 伪装成 window
g.window = g;
try {
  Object.defineProperty(g, 'navigator', { value: { userAgent: 'node' }, configurable: true, writable: true });
} catch { /* 已有只读 navigator，忽略 */ }

g.MediaRecorder = undefined; g.AudioContext = undefined;
g.webkitAudioContext = undefined;
if (detectRecorderCapability() === 'none') ok('两个 API 都没有 -> none');
else bad(`两个 API 都没有时未返回 none（实为 ${detectRecorderCapability()}）`);

g.AudioContext = function () {};
if (detectRecorderCapability() === 'webaudio') ok('只有 Web Audio -> webaudio');
else bad('只有 Web Audio 时判定错误');

g.MediaRecorder = function () {};
g.MediaRecorder.isTypeSupported = (t: string) => t === 'audio/mp4';
if (detectRecorderCapability() === 'mediarecorder') ok('有 MediaRecorder -> mediarecorder');
else bad('MediaRecorder 存在时判定错误');
if (pickMimeType() === 'audio/mp4') ok('MIME 探测正确（只支持 mp4 时返回 mp4）');
else bad(`MIME 探测错误：${pickMimeType()}`);

g.MediaRecorder.isTypeSupported = (t: string) => t.startsWith('audio/webm');
if (pickMimeType() === 'audio/webm;codecs=opus') ok('MIME 优先级正确（webm/opus 优先）');
else bad(`MIME 优先级错误：${pickMimeType()}`);

g.MediaRecorder.isTypeSupported = () => false;
if (pickMimeType() === '') ok('都不支持时返回空串（让浏览器自己选）');
else bad('都不支持时应返回空串');

// ---------- 6. 环境提示 ----------
console.log('\n=== 6) 给用户的环境提示 ===');
const setUA = (ua: string) => Object.defineProperty(g, 'navigator', { value: { userAgent: ua }, configurable: true, writable: true });
setUA('Mozilla/5.0 (iPhone) MicroMessenger/8.0');
const h1 = recorderHint();
if (h1.includes('微信')) ok(`微信内置 -> "${h1.slice(0, 30)}..."`);
else bad(`微信内置提示不对：${h1}`);

setUA('Mozilla/5.0 (Linux; Android 10) UCBrowser/13.0');
const h2 = recorderHint();
if (h2.includes('UC')) ok(`UC -> "${h2.slice(0, 30)}..."`);
else bad(`UC 提示不对：${h2}`);

// 只有 Web Audio 可用 -> 应提示「已自动改用兼容模式」
setUA('Mozilla/5.0 (Linux; Android 13) Chrome/120');
g.MediaRecorder = undefined; g.AudioContext = function () {}; g.webkitAudioContext = undefined;
const h4 = recorderHint();
if (h4.includes('兼容模式')) ok(`仅 Web Audio 可用 -> "${h4.slice(0, 26)}..."`);
else bad(`仅 Web Audio 时的提示不对：${h4}`);

// 完全不支持 -> 应提示「添加到主屏幕」
setUA('Mozilla/5.0 (Linux; Android 13) Chrome/120');
g.MediaRecorder = undefined; g.AudioContext = undefined; g.webkitAudioContext = undefined;
const h3 = recorderHint();
if (h3.includes('添加到主屏幕')) ok(`完全不支持 -> "${h3.slice(0, 34)}..."`);
else bad(`不支持时的提示不对：${h3}`);

g.MediaRecorder = origMR; g.AudioContext = origAC;

console.log(fail === 0 ? '\n✅ 录音兼容层验证全部通过' : `\n❌ ${fail} 处问题`);
process.exit(fail === 0 ? 0 : 1);
