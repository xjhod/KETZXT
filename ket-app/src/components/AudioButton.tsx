import { useState, useEffect, useCallback } from 'react';

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

  // 播放语音
  const playSpeech = useCallback(async (rate = playbackRate) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    setIsPlaying(true);
    window.speechSynthesis.cancel();
    
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = rate;
    utter.pitch = 1.0;
    
    utter.onend = () => {
      setIsPlaying(false);
      setPlayCount(prev => prev + 1);
      if (isLooping) {
        setTimeout(() => playSpeech(rate), 500);
      }
    };
    
    utter.onerror = () => {
      setIsPlaying(false);
    };
    
    window.speechSynthesis.speak(utter);
  }, [text, playbackRate, isLooping]);

  // 停止播放（文件 + TTS 统一停止）
  const stopAll = () => {
    audioElRef.current?.pause();
    audioElRef.current = null;
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  };

  // 优先播放预生成音频文件；失败/缺失时回退到 TTS
  const playFile = useCallback(() => {
    if (!audioSrc) { playSpeech(); return; }
    setIsPlaying(true);
    const el = new Audio(audioSrc);
    audioElRef.current = el;
    el.onended = () => {
      audioElRef.current = null;
      setIsPlaying(false);
      setPlayCount(prev => prev + 1);
      if (isLooping) setTimeout(playFile, 500);
    };
    el.onerror = () => {
      audioElRef.current = null;
      playSpeech();
    };
    el.play().catch(() => {
      audioElRef.current = null;
      playSpeech();
    });
  }, [audioSrc, isLooping, playSpeech]);

  // 组件卸载时停止播放
  useEffect(() => {
    return () => {
      audioElRef.current?.pause();
      audioElRef.current = null;
      window.speechSynthesis?.cancel();
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
            playFile();
          }
        }}
        disabled={!text || (maxPlays ? playCount >= maxPlays : false)}
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
