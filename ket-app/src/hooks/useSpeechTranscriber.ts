import { useState, useRef, useCallback, useMemo, useEffect } from 'react';

// ========== 真实语音转录 Hook ==========
// 基于浏览器内置 Web Speech API（SpeechRecognition / webkitSpeechRecognition）
// 纯前端、免费、无需大模型、无需后端密钥
// 与 usePronunciationChecker 的区别：本 hook 面向「整句/段落转录」，
// 适合口语 Part1/Part2 的自由回答场景。

export interface UseSpeechTranscriberReturn {
  isListening: boolean;
  transcript: string;      // 已确定的最终文本（累积）
  interim: string;         // 临时识别文本
  error: string | null;
  supported: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

// 复用发音 hook 的浏览器检测逻辑
function isSpeechRecognitionSupported(): boolean {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return !!SR;
}

export function useSpeechTranscriber(): UseSpeechTranscriberReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const finalRef = useRef(''); // 累积的最终文本

  // 看门狗：Android 上 SpeechRecognition 既不 onend 也不 onerror 时会一直 hang，
  // 导致 isListening 永远为 true（按钮卡在“录音中”）。超时强制复位。
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  const supported = useMemo(() => isSpeechRecognitionSupported(), []);

  const start = useCallback(() => {
    setError(null);
    finalRef.current = '';
    setTranscript('');
    setInterim('');

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError('您的浏览器不支持语音识别，请使用 Chrome 或 Edge 浏览器。');
      return;
    }

    // 清理上一次实例
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) { /* ignore */ }
    }

    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.lang = 'en-US';
    recognition.interimResults = true;  // 实时显示临时结果
    recognition.continuous = true;       // 持续监听（适合长段回答）
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interimStr = '';
      let finalStr = finalRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          finalStr += res[0].transcript + ' ';
        } else {
          interimStr += res[0].transcript;
        }
      }

      finalRef.current = finalStr;
      setTranscript(finalStr.trim());
      setInterim(interimStr);
    };

    recognition.onerror = (event: any) => {
      const msgMap: Record<string, string> = {
        'no-speech': '没有检测到声音，请大声清晰地回答后重试',
        'audio-capture': '找不到麦克风，请检查设备是否已连接',
        'not-allowed': '麦克风权限被拒绝，请点击地址栏左侧图标允许访问',
        'service-not-allowed': '当前浏览器或网络环境不支持语音识别，建议用 Chrome 打开',
        'network': '网络错误，请检查连接后重试',
        'aborted': '已取消',
      };
      const friendly = msgMap[event.error] || `识别出错：${event.error || '未知错误'}`;
      setError(friendly);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      clearWatchdog();
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      setIsListening(true);
      // 连续监听模式下，超时自动停止，避免长时间卡在“录音中”
      watchdogRef.current = setTimeout(() => {
        try { recognition.stop(); } catch (_) { /* ignore */ }
        setIsListening(false);
        recognitionRef.current = null;
        setError('识别超时，请重试（安卓上语音识别可能不稳定）');
      }, 45000);
    } catch (err) {
      console.error('Speech transcriber start error:', err);
      setError('启动语音识别失败，请刷新页面后重试');
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearWatchdog();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) { /* ignore */ }
    }
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    clearWatchdog();
    finalRef.current = '';
    setTranscript('');
    setInterim('');
    setError(null);
  }, []);

  // 卸载时清理看门狗
  useEffect(() => () => clearWatchdog(), [clearWatchdog]);

  return { isListening, transcript, interim, error, supported, start, stop, reset };
}
