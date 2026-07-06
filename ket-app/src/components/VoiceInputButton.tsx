import { useEffect } from 'react';
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
  const { isRecording, result, error, startRecord, stopRecord, reset } = usePronunciationChecker();

  // 将结果通知父组件
  useEffect(() => {
    if (result) {
      onResult?.(result);
    }
  }, [result]);

  // 点击按钮：开始/停止录音
  const handleClick = () => {
    if (isRecording) {
      stopRecord();
    } else {
      reset();
      startRecord(expectedText);
    }
  };

  // 尺寸样式映射
  const sizeStyles = {
    normal: 'w-20 h-20 text-4xl',
    large: 'w-28 h-28 text-5xl',
    xlarge: 'w-36 h-36 text-6xl',
  };

  // 评分颜色
  const getScoreColor = (s: number): string => {
    if (s >= 90) return 'text-green-500';
    if (s >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* 主录音按钮 */}
      <div className="relative">
        <button
          onClick={handleClick}
          disabled={!expectedText}
          className={`
            ${sizeStyles[size]}
            rounded-full 
            transition-all duration-300
            active:scale-95
            flex items-center justify-center
            relative
            ${isRecording
              ? 'bg-gradient-to-br from-red-400 to-pink-600 animate-pulse shadow-lg shadow-red-300'
              : 'bg-gradient-to-br from-blue-400 to-purple-600 hover:from-blue-500 hover:to-purple-700 shadow-lg hover:shadow-2xl'
            }
            text-white
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title={isRecording ? '点击停止录音' : '点击开始录音'}
        >
          {isRecording ? (
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
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>

      {/* 评分结果显示 */}
      {showScore && result && (
        <div className="text-center p-3 bg-gray-50 rounded-xl max-w-xs">
          <p className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
            {result.score}分
          </p>
          <p className={`text-xs ${getScoreColor(result.score)}`}>
            {result.feedback}
          </p>
          {result.recognizedText && (
            <p className="text-xs text-gray-500 mt-1">
              识别结果：{result.recognizedText}
            </p>
          )}
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
