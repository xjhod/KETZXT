// 听力音频播放桥：本地 mp3 优先 + 系统 TTS 兜底，读本机语速/循环配置。
// ListeningPage 与 WrongPage（错题真重做）共用同一套播放逻辑。

import { audioFileUrl, playAudioEl, speakText, ttsFallbackAllowed } from './utils/audio';
import { readRate, readLoop, playTimes } from './utils/listeningPlayback';

function playAudioOnce(id: string, fallbackText: string, rate: number): Promise<void> {
  const fallback = ttsFallbackAllowed() ? fallbackText : '';
  return new Promise((resolve) => {
    let settled = false;
    const once = () => { if (!settled) { settled = true; resolve(); } };
    playAudioEl(audioFileUrl(id), rate).then((ok) => {
      if (ok) {
        once();
      } else if (fallback) {
        speakText(fallback, { rate, onEnd: once });
      } else {
        once();
      }
    });
  });
}

/** 按用户配置连播（循环开=2遍）；第三参仅为兼容旧调用的硬编码 rate，会被忽略 */
export async function playAudioFile(id: string, fallbackText: string, _legacyRate?: number): Promise<void> {
  const rate = readRate();
  const times = playTimes(readLoop());
  for (let i = 0; i < times; i++) {
    await playAudioOnce(id, fallbackText, rate);
  }
}
