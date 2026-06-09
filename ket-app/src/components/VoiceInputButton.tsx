import { useState, useEffect, useRef } from 'react';
import { usePronunciationChecker } from '../hooks/usePronunciationChecker';

interface VoiceInputButtonProps {
  expectedText: string;      // 期望的文本内容（用于评分）
  label?: string;            // 按钮下方的文字说明
  size?: 'normal' | 'large' | 'xlarge';  // 按钮尺寸
  onResult?: (result: { score: number; transcript: string }) => void;  // 评分结果回调
  showScore?: boolean;       // 是否显示评分
  className?: string;        // 自定义样式
}

export function VoiceInputButton({
  expectedText,
  label = '点击发音',
  size = 'large',
  onResult,
  showScore = true,
  className = '',
}: VoiceInputButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [transcript, setTranscript] = useState('');
  const [showPlayback, setShowPlayback] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // 使用发音检查器
  const { checkPronunciation, isChecking } = usePronunciationChecker();

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // 播放回放
        const audioUrl = URL.createObjectURL(audioBlob);
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = audioUrl;
        }

        // 评分
        if (expectedText) {
          const result = await checkPronunciation(expectedText, audioBlob);
          setScore(result.score);
          setTranscript(result.transcript);
          onResult?.(result);
        }

        // 停止所有音轨
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('无法访问麦克风:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setShowPlayback(true);
    }
  };

  // 播放回放
  const playPlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.play();
    }
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  // 尺寸样式映射
  const sizeStyles = {
    normal: 'w-20 h-20 text-4xl',
    large: 'w-28 h-28 text-5xl',
    xlarge: 'w-36 h-36 text-6xl',
  };

  // 评分颜色
  const getScoreColor = (s: number | null) => {
    if (s === null) return 'text-gray-400';
    if (s >= 90) return 'text-green-500';
    if (s >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (s: number | null) => {
    if (s === null) return '';
    if (s >= 90) return '优秀！';
    if (s >= 70) return '良好';
    return '需改进';
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* 主录音按钮 */}
      <div className="relative">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isChecking}
          className={`
            ${sizeStyles[size]}
            rounded-full 
            transition-all duration-300
            active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center
            relative
            ${isRecording
              ? 'bg-gradient-to-br from-red-400 to-pink-600 animate-pulse shadow-lg shadow-red-300'
              : 'bg-gradient-to-br from-blue-400 to-purple-600 hover:from-blue-500 hover:to-purple-700 shadow-lg hover:shadow-2xl'
            }
            text-white
          `}
          title={isRecording ? '点击停止录音' : '点击开始录音'}
        >
          {isChecking ? (
            <span className="text-2xl">⏳</span>
          ) : isRecording ? (
            <span className="text-5xl">⏹️</span>
          ) : (
            <span className="text-5xl">🎤</span>
          )}
        </button>

        {/* 录音中动画效果 */}
        {isRecording && (
          <>
            <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
              <span className="text-white text-xs">●</span>
            </div>
          </>
        )}
      </div>

      {/* 按钮文字说明 */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {isRecording && (
          <p className="text-xs text-red-500 mt-1 animate-pulse">录音中...</p>
        )}
        {isChecking && (
          <p className="text-xs text-yellow-500 mt-1">评分中...</p>
        )}
      </div>

      {/* 评分结果显示 */}
      {showScore && score !== null && (
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {score}分
          </p>
          <p className={`text-xs ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </p>
          {transcript && (
            <p className="text-xs text-gray-500 mt-1">
              你说的是：{transcript}
            </p>
          )}
        </div>
      )}

      {/* 录音回放 */}
      {showPlayback && !isRecording && (
        <div className="flex items-center gap-2">
          <button
            onClick={playPlayback}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-xs"
          >
            🔊 播放回放
          </button>
          <audio ref={audioPlayerRef} className="hidden" />
        </div>
      )}

      {/* 期望文本提示 */}
      {expectedText && (
        <p className="text-xs text-gray-400 text-center">
          请朗读：<span className="font-medium text-gray-600">{expectedText}</span>
        </p>
      )}
    </div>
  );
}
