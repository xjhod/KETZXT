// ========== 统一音频播放工具 ==========
// 解决两类 Android Chrome 已知问题：
// 1) 路径：应用部署在 /KETZXT/ 子路径下，绝对路径 /audio/xxx.mp3 会 404，
//    必须用 import.meta.env.BASE_URL 拼接出 /KETZXT/audio/xxx.mp3。
// 2) 卡住：Android 上 SpeechSynthesisUtterance.onend 经常不触发；
//    <audio> 元素在部分情况下 onended 也不触发。两处都加看门狗超时兜底，
//    确保 isPlaying / 录音状态一定会复位。
// 注：不依赖 translate.google.com（中国大陆被墙），优先用本地 mp3 文件，
//    文本回退用系统内置 speechSynthesis（不依赖网络）。

// ========== 全局播放控制（跨组件停止）==========
// 保持对"当前正在播放的 <audio> 与 TTS 取消函数"的引用，
// 以便组件卸载（如返回主页）时调用 stopAllAudio() 立即停掉，
// 避免音频/朗读在离开页面后仍在后台继续播放。
let currentAudioEl: HTMLAudioElement | null = null;
let currentAudioDone: (() => void) | null = null;
let currentTtsCancel: (() => void) | null = null;

/** 立即停止当前任何正在播放的音频 <audio> 与系统 TTS。组件卸载时应调用。 */
export function stopAllAudio(): void {
  if (currentAudioEl) {
    try { currentAudioEl.pause(); currentAudioEl.currentTime = 0; } catch { /* ignore */ }
    currentAudioEl = null;
  }
  if (currentAudioDone) {
    try { currentAudioDone(); } catch { /* ignore */ }
    currentAudioDone = null;
  }
  if (currentTtsCancel) {
    try { currentTtsCancel(); } catch { /* ignore */ }
    currentTtsCancel = null;
  }
  try {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  } catch { /* ignore */ }
}

/** 是否安卓设备（用于决定是否允许依赖浏览器 TTS 回退） */
export function isAndroidDevice(): boolean {
  try {
    return /Android/i.test(navigator.userAgent || '');
  } catch {
    return false;
  }
}

/**
 * 是否允许在"文件播放失败"时回退浏览器 TTS。
 * 注意区分两个 API：
 *  - speechSynthesis（TTS 朗读）：Android Chrome 调用设备「本地 TTS 引擎」
 *    （Google TTS / 厂商引擎），离线可用，不被墙。
 *  - SpeechRecognition（ASR 识别）：才走 Google 服务器，中国大陆被墙。
 * 原实现把两者混为一谈、在安卓禁用 TTS 回退，导致 mp3 播放失败时彻底无声。
 * 这里统一允许回退：mp3 正常时不触发，仅在 mp3 失败时兜底出声。
 */
export function ttsFallbackAllowed(): boolean {
  return true;
}

/** 拼接正确的音频文件 URL（适配 GitHub Pages 子路径） */
export function audioFileUrl(id: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}audio/${id}.mp3`;
}

/**
 * 通过 <audio> 元素播放（文件或音频 URL）。
 * 始终会在 ended / error / 超时(30s) 之一时 resolve，绝不永久挂起。
 * @returns true=正常播放结束, false=出错（可据此回退 TTS）
 */
// 移动端（尤其 Android Chrome）对"每次 new Audio() 且不挂载 DOM"的音频
// 首声易静音 / play() 失败。复用单一全局 audio 元素并挂载到 body 可显著提升可靠性。
let sharedAudio: HTMLAudioElement | null = null;
function getSharedAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined' || !window.HTMLAudioElement) return null;
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = 'auto';
    // 安卓/iOS 内联播放，避免部分浏览器进入全屏/外部播放器
    try { (sharedAudio as any).playsInline = true; } catch { /* ignore */ }
    try {
      // 不要用 display:none：部分安卓/国产浏览器（X5、UC、华为 WebView 等）
      // 对渲染树外的 <audio> 不加载、不播放，导致点击无声。
      // 改为移出视口 + 不可见，但保留在渲染树中，兼容性最好。
      sharedAudio.setAttribute(
        'style',
        'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;'
      );
      document.body.appendChild(sharedAudio);
    } catch {
      /* 无 document.body 等极端环境：不挂载也能 play()，忽略 */
    }
  }
  return sharedAudio;
}

// ========== 安卓 Chrome 音频解锁 ==========
// 安卓 Chrome 要求音频播放必须由「用户手势」触发。部分机型在首次点击播放时
// 会因音频上下文未被唤醒而偶发无声(需再点一次才响)。这里在应用启动即监听
// 首次任意交互(点击/触摸)，用一段静音 wav 触发手势内播放来唤醒音频上下文，
// 之后真实音频的 play() 即在已解锁状态下执行，根除首播无声。
let audioUnlockArmed = false;
let audioUnlocked = false;
function armAudioUnlock(): void {
  if (audioUnlockArmed || typeof document === 'undefined') return;
  audioUnlockArmed = true;
  const unlock = () => {
    if (audioUnlocked) return;
    audioUnlocked = true;
    try {
      // 一段极短的静音 wav，仅用于触发手势内播放以唤醒音频上下文(不发出声音)
      const silent = new Audio(
        'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAD//w=='
      );
      silent.volume = 0;
      const p = silent.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch {
      /* ignore */
    }
    document.removeEventListener('touchstart', unlock);
    document.removeEventListener('mousedown', unlock);
    document.removeEventListener('click', unlock);
  };
  document.addEventListener('touchstart', unlock, { passive: true });
  document.addEventListener('mousedown', unlock);
  document.addEventListener('click', unlock);
}

export function playAudioEl(src: string, rate = 1): Promise<boolean> {
  armAudioUnlock(); // 确保首次交互已尝试唤醒音频上下文(安卓首播兜底)
  stopAllAudio(); // 先停掉上一段，避免叠音 / 离开后仍播放
  return new Promise((resolve) => {
    try {
      const el = getSharedAudio();
      if (!el) {
        resolve(false);
        return;
      }
      el.playbackRate = rate;
      let settled = false;
      const done = (ok: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(wd);
        if (currentAudioEl === el) currentAudioEl = null;
        if (currentAudioDone === done) currentAudioDone = null;
        resolve(ok);
      };
      currentAudioEl = el;
      currentAudioDone = done;
      el.onended = () => done(true);
      el.onerror = () => done(false);
      el.src = src;
      try { el.load(); } catch { /* ignore */ }
      const p = el.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => done(false)); // 自动播放策略拦截等：标记失败，由调用方决定是否回退
      }
      // 看门狗：防止任何情况下 onended 不触发而永久卡住
      const wd = setTimeout(() => done(true), 30000);
    } catch {
      resolve(false);
    }
  });
}

/**
 * 系统内置 TTS 朗读（speechSynthesis），带看门狗。
 * @returns 取消函数（调用即停止朗读并触发 onEnd）
 */
export function speakText(
  text: string,
  opts: { rate?: number; lang?: string; onStart?: () => void; onEnd?: () => void } = {}
): () => void {
  stopAllAudio(); // 先停掉上一段音频 / TTS，避免叠音
  if (
    typeof window === 'undefined' ||
    !window.speechSynthesis ||
    !window.SpeechSynthesisUtterance
  ) {
    opts.onEnd?.();
    return () => {};
  }

  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = opts.lang || 'en-US';
  utter.rate = opts.rate ?? 1.0;
  utter.pitch = 1.0;

  // 选择英文语音，提升 Android 兼容性（部分设备默认无英文 voice 会静音）
  try {
    const voices = synth.getVoices();
    const en =
      voices.find((v) => /^en(-|_)/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang));
    if (en) utter.voice = en;
  } catch {
    /* ignore */
  }

  let ended = false;
  let wd: ReturnType<typeof setTimeout>;
  const finish = () => {
    if (ended) return;
    ended = true;
    clearTimeout(wd);
    if (currentTtsCancel === cancel) currentTtsCancel = null;
    opts.onEnd?.();
  };

  utter.onstart = () => {
    opts.onStart?.();
  };
  utter.onend = finish;
  utter.onerror = finish;

  // 看门狗：Android 上 onend 常不触发，按文本长度估算时长，强制结束
  const estMs = Math.min(
    30000,
    Math.max(1500, (text.length / 11) * (1000 / (opts.rate ?? 1.0)) + 1500)
  );
  wd = setTimeout(finish, estMs);

  // Android 首句静音 workaround：若处于 paused 状态则 resume
  try {
    if (synth.paused) synth.resume();
  } catch {
    /* ignore */
  }
  synth.speak(utter);

  // 返回取消函数
  const cancel = () => {
    try {
      synth.cancel();
    } catch {
      /* ignore */
    }
    finish();
  };
  currentTtsCancel = cancel; // 记录，便于 stopAllAudio 停掉
  return cancel;
}

// ========== 启动音频解锁监听 ==========
// 应用加载即武装监听，等用户首次交互(点击/触摸)自动唤醒音频上下文，
// 使安卓 Chrome 上的真实音频播放不再偶发无声。
armAudioUnlock();
