import { useState, useEffect, useRef, useCallback } from 'react';
import { speakText, playAudioEl, ttsFallbackAllowed } from '../utils/audio';

interface AudioButtonProps {
  text: string;           // 要播放的文本（无预生成音频时走 TTS）
  audioSrc?: string;      // 可选：优先播放的预生成音频文件（/audio/xxx.mp3）
  label?: string;         // 按钮下方的文字说明
  size?: 'normal' | 'large' | 'xlarge';  // 按钮尺寸
  showSpeedControl?: boolean;  // 是否显示速度控制
  showLoopControl?: boolean;   // 是否显示循环控制
  maxPlays?: number;      // 最大播放次数（可选）
  className?: string;     // 自定义样式
}

export function AudioButton({
  text,
  audioSrc,
  label = '播放发音',
  size = 'large',
  showSpeedControl = false,
  showLoopControl = false,
  maxPlays,
  className = '',
}: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const cancelRef = useRef<() => void>(() => {});
  const loopRef = useRef(isLooping);
  loopRef.current = isLooping;
  const playingRef = useRef(false);

  // 浏览器语音合成(TTS)可用性检测：部分国产手机浏览器不支持 speechSynthesis
  const ttsAvailable = typeof window !== 'undefined' && !!window.speechSynthesis;

  // 统一停止（文件 + TTS），并复位状态（防止 Android 上卡在播放态）
  const stopAll = useCallback(() => {
    audioElRef.current?.pause();
    audioElRef.current = null;
    cancelRef.current();
    cancelRef.current = () => {};
    playingRef.current = false;
    setIsPlaying(false);
  }, []);

  // 播放一次（文件优先，失败回退 TTS；始终会结束，绝不卡住）
  const playOnce = useCallback(async (rate: number): Promise<void> => {
    if (audioSrc) {
      const ok = await playAudioEl(audioSrc, rate);
      if (!ok && text && ttsFallbackAllowed()) {
        await new Promise<void>((res) => {
          cancelRef.current = speakText(text, { rate, onEnd: res });
        });
      }
    } else if (text) {
      await new Promise<void>((res) => {
        cancelRef.current = speakText(text, { rate, onEnd: res });
      });
    }
  }, [audioSrc, text]);

  // 主播放流程（支持循环；靠 playingRef 与 loopRef 控制退出）
  const play = useCallback(async () => {
    if ((!text && !audioSrc) || playingRef.current) return;
    playingRef.current = true;
    setIsPlaying(true);
    setPlayCount((p) => p + 1);
    do {
      await playOnce(playbackRate);
    } while (loopRef.current && playingRef.current);
    playingRef.current = false;
    cancelRef.current = () => {};
    setIsPlaying(false);
  }, [audioSrc, text, playbackRate, playOnce]);

  // 组件卸载时停止播放
  useEffect(() => {
    return () => {
      audioElRef.current?.pause();
      audioElRef.current = null;
      cancelRef.current();
    };
  }, []);

  // 尺寸样式映射
  const sizeStyles = {
    normal: 'w-20 h-20 text-4xl',
    large: 'w-28 h-28 text-5xl',
    xlarge: 'w-36 h-36 text-6xl',
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* 主播放按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isPlaying) {
            stopAll();
          } else if (!maxPlays || playCount < maxPlays) {
            play();
          }
        }}
        disabled={
          (!text && !audioSrc) ||
          (maxPlays ? playCount >= maxPlays : false) ||
          (!audioSrc && !ttsAvailable)
        }
        className={`
          ${sizeStyles[size]}
          rounded-full 
          bg-gradient-to-br from-blue-400 to-blue-600
          hover:from-blue-500 hover:to-blue-700
          text-white
          shadow-lg hover:shadow-2xl
          transition-all duration-300
          active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center
          relative
          ${isPlaying ? 'animate-pulse' : ''}
        `}
        title={isPlaying ? '点击停止' : '点击播放'}
      >
        {isPlaying ? '⏸️' : '🔊'}

        {/* 播放中动画效果 */}
        {isPlaying && (
          <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ping" />
        )}
      </button>

      {/* 按钮文字说明 */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {!audioSrc && !ttsAvailable && (
          <p className="text-xs text-amber-500 mt-1">⚠️ 当前浏览器不支持语音播放</p>
        )}
        {maxPlays && (
          <p className="text-xs text-gray-400 mt-1">
            剩余 {maxPlays - playCount} 次
          </p>
        )}
        {!maxPlays && playCount > 0 && (
          <p className="text-xs text-gray-400 mt-1">已播放 {playCount} 次</p>
        )}
      </div>

      {/* 速度控制 */}
      {showSpeedControl && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-500">速度：</span>
          {[0.5, 0.75, 1.0, 1.25, 1.5].map(rate => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              className={`
                px-3 py-1 rounded-full text-xs font-medium
                transition-all duration-200
                ${playbackRate === rate
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }
              `}
            >
              {rate}x
            </button>
          ))}
        </div>
      )}

      {/* 循环控制 */}
      {showLoopControl && (
        <button
          onClick={() => setIsLooping(!isLooping)}
          className={`
            px-4 py-2 rounded-lg text-xs font-medium
            transition-all duration-200
            ${isLooping
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }
          `}
        >
          🔄 {isLooping ? '循环开启' : '循环关闭'}
        </button>
      )}
    </div>
  );
}
