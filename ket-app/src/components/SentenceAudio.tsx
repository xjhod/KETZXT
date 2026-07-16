// ========== 行内句子音频按钮 ==========
// 用于短文精读每一段的"跟读"小喇叭。复用 audio.ts 的 playAudioEl（优先预生成 mp3，
// 安卓可靠、自动适配 /KETZXT/ 子路径），支持常速 / 慢速(0.75x)跟读，卸载自动停。
import { useState, useEffect, useRef } from 'react';
import { audioFileUrl, playAudioEl, stopAllAudio, speakText, ttsFallbackAllowed } from '../utils/audio';

interface SentenceAudioProps {
  audioId: string;   // 音频 id，对应 public/audio/{audioId}.mp3
  text?: string;     // 英文原文，用于 mp3 播放失败时的 TTS 兜底朗读（确保短文一定能出声）
}

export function SentenceAudio({ audioId, text }: SentenceAudioProps) {
  const [playing, setPlaying] = useState<false | 'normal' | 'slow'>(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function play(mode: 'normal' | 'slow') {
    if (playing) {
      stopAllAudio();
      setPlaying(false);
      return;
    }
    setPlaying(mode);
    const rate = mode === 'slow' ? 0.75 : 1;
    const ok = await playAudioEl(audioFileUrl(audioId), rate);
    // mp3 加载/播放失败（如个别 ROM 对隐藏 audio 不播放）时，回退系统 TTS 朗读英文原文
    if (!ok && text && ttsFallbackAllowed()) {
      await new Promise<void>((res) => {
        speakText(text, { rate, onEnd: res });
      });
    }
    if (mounted.current) setPlaying(false);
  }

  return (
    <span className="inline-flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={() => play('normal')}
        title="播放"
        className={`w-8 h-8 rounded-full flex items-center justify-center text-base transition-colors ${
          playing === 'normal'
            ? 'bg-blue-600 text-white animate-pulse'
            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
        }`}
      >
        {playing === 'normal' ? '⏸' : '🔊'}
      </button>
      <button
        type="button"
        onClick={() => play('slow')}
        title="慢速跟读"
        className={`px-2 h-8 rounded-full text-xs font-medium transition-colors ${
          playing === 'slow'
            ? 'bg-amber-500 text-white animate-pulse'
            : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
        }`}
      >
        {playing === 'slow' ? '⏸' : '0.75x'}
      </button>
    </span>
  );
}
