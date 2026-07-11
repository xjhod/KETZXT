// ========== 统一音频播放工具 ==========
// 解决两类 Android Chrome 已知问题：
// 1) 路径：应用部署在 /KETZXT/ 子路径下，绝对路径 /audio/xxx.mp3 会 404，
//    必须用 import.meta.env.BASE_URL 拼接出 /KETZXT/audio/xxx.mp3。
// 2) 卡住：Android 上 SpeechSynthesisUtterance.onend 经常不触发；
//    <audio> 元素在部分情况下 onended 也不触发。两处都加看门狗超时兜底，
//    确保 isPlaying / 录音状态一定会复位。
// 注：不依赖 translate.google.com（中国大陆被墙），优先用本地 mp3 文件，
//    文本回退用系统内置 speechSynthesis（不依赖网络）。

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
export function playAudioEl(src: string, rate = 1): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const el = new Audio(src);
      el.playbackRate = rate;
      let settled = false;
      const done = (ok: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(wd);
        resolve(ok);
      };
      el.onended = () => done(true);
      el.onerror = () => done(false);
      el.play().catch(() => done(false));
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
  return () => {
    try {
      synth.cancel();
    } catch {
      /* ignore */
    }
    finish();
  };
}
