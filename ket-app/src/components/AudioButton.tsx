import { useState, useEffect, useCallback } from 'react';

interface AudioButtonProps {
  text: string;           // 要播放的文本
  label?: string;         // 按钮下方的文字说明
  size?: 'normal' | 'large' | 'xlarge';  // 按钮尺寸
  showSpeedControl?: boolean;  // 是否显示速度控制
  showLoopControl?: boolean;   // 是否显示循环控制
  maxPlays?: number;      // 最大播放次数（可选）
  className?: string;     // 自定义样式
}

export function AudioButton({
  text,
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
  const [ttsReady, setTtsReady] = useState(false);

  // Initialize speechSynthesis voices on mount
  // Mobile browsers (especially Android Edge) need this to load TTS engine
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setTtsReady(true);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Some browsers need a kick to load voices
    window.speechSynthesis.getVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // 播放语音 — with fallback for mobile browsers
  const playSpeech = useCallback(async (rate = playbackRate) => {
    if (typeof window === 'undefined') return;

    // Try Web Speech API first
    if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
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
        // Fallback to Audio API if speechSynthesis fails
        playWithAudioFallback(text, rate);
      };

      // Try to speak — if no voices, onerror should fire
      window.speechSynthesis.speak(utter);

      // Safety timeout: if nothing happens in 3s, try fallback
      setTimeout(() => {
        if (window.speechSynthesis && !window.speechSynthesis.speaking) {
          setIsPlaying(false);
          playWithAudioFallback(text, rate);
        }
      }, 3000);
    } else {
      // No speechSynthesis at all — use Audio fallback
      playWithAudioFallback(text, rate);
    }
  }, [text, playbackRate, isLooping]);

  // Fallback TTS using Audio API (works on mobile browsers without speechSynthesis)
  const playWithAudioFallback = (text: string, rate: number) => {
    try {
      // Use Google Translate TTS as fallback (works in browsers)
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob&ttsspeed=${rate}`;
      const audio = new Audio(url);
      audio.crossOrigin = 'anonymous';
      audio.onended = () => {
        setIsPlaying(false);
        setPlayCount(prev => prev + 1);
        if (isLooping) {
          setTimeout(() => playSpeech(rate), 500);
        }
      };
      audio.onerror = () => {
        setIsPlaying(false);
      };
      audio.play().catch(() => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  // 停止播放
  const stopSpeech = () => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  };

  // 组件卸载时停止播放
  useEffect(() => {
    return () => {
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
            stopSpeech();
          } else if (!maxPlays || playCount < maxPlays) {
            playSpeech();
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
