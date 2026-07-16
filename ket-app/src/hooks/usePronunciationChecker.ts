import { useState, useRef, useEffect, useCallback } from 'react';

// ========== 发音评分 Hook ==========
// 方案A: Web Speech API 文本匹配评分（免费、离线可用）
// 预留接口: 后续可接入 Azure Pronunciation Assessment API 实现专业级评分

export interface PronunciationResult {
  score: number;           // 0-100 分
  level: 'perfect' | 'excellent' | 'good' | 'fair' | 'poor';
  feedback: string;        // 中文反馈语
  recognizedText: string;   // 识别出的文字
  targetWord: string;       // 目标单词
}

export interface UsePronunciationCheckerReturn {
  // 状态
  isRecording: boolean;
  result: PronunciationResult | null;
  error: string | null;
  
  // 操作
  startRecord: (targetWord: string) => void;
  stopRecord: () => void;
  reset: () => void;
}

// ---------- Levenshtein 编辑距离相似度 ----------
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // 删除
        matrix[i][j - 1] + 1,      // 插入
        matrix[i - 1][j - 1] + cost // 替换
      );
    }
  }
  return matrix[b.length][a.length];
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;
  const dist = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  return Math.round((1 - dist / maxLen) * 100);
}

// ---------- 常见变形词（复数/过去式/ing/er/est 等）----------
function getVariations(word: string): string[] {
  const w = word.toLowerCase();
  return [
    w + 's', w + 'es',          // 复数
    w + 'ed',                   // 过去式（规则）
    w.replace(/e$/, '') + 'ing', // ing 形式
    w + 'ing',                  // 直接加 ing
    w.replace(/y$/, 'ies'),     // y→ies 复数
    w + 'er', w + 'est',       // 比较级/最高级
    w + 'ly',                   // 副词形式
    w + 's\'', w + '\'s',      // 所有格（去掉撇号）
    w + 's\'s',
  ];
}

// ---------- 浏览器支持检测 ----------
export function isSpeechRecognitionSupported(): boolean {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return !!SR;
}

// ---------- 核心评分算法 ----------
function scorePronunciation(target: string, recognized: string): PronunciationResult {
  const t = target.toLowerCase().trim().replace(/[^a-z]/g, '');
  const r = recognized.toLowerCase().trim();

  if (!r) {
    return { score: 0, level: 'poor', feedback: '没有识别到声音，请再试一次', recognizedText: r, targetWord: target };
  }

  // 1. 完全匹配 → 100分
  if (t === r.replace(/[^a-z\s]/g, '').replace(/\s+/g, '')) {
    return { score: 100, level: 'perfect', feedback: '完美发音！🎉', recognizedText: r, targetWord: target };
  }

  // 2. 识别文字包含目标词（用户说了句子）→ 95分
  const wordsInRecognized = r.split(/\s+/).filter(Boolean).map(w => w.replace(/[^a-z]/g, ''));
  if (wordsInRecognized.includes(t)) {
    return { score: 95, level: 'excellent', feedback: '很棒！发音准确 ✓', recognizedText: r, targetWord: target };
  }

  // 3. 常见语法变形匹配 → 85分
  const variations = getVariations(t);
  for (const v of variations) {
    if (wordsInRecognized.includes(v) || r.replace(/[^a-z]/g, '') === v) {
      return { score: 85, level: 'good', feedback: '很好！注意单词形式', recognizedText: r, targetWord: target };
    }
  }

  // 4. 编辑距离相似度
  const sim = similarity(t, r.replace(/[^a-z]/g, ''));
  if (sim >= 75) {
    return { score: sim, level: 'good', feedback: '接近了！再练习一下', recognizedText: r, targetWord: target };
  }
  if (sim >= 50) {
    return { score: Math.max(40, sim - 10), level: 'fair', feedback: '继续加油！仔细听发音', recognizedText: r, targetWord: target };
  }
  if (sim >= 30) {
    return { score: 25, level: 'poor', feedback: '差距较大，先听标准发音再试', recognizedText: r, targetWord: target };
  }

  // 5. 完全不匹配
  return { score: 10, level: 'poor', feedback: '没听清，请点击🔊听标准发音后再读', recognizedText: r, targetWord: target };
}

// ---------- 主 Hook ----------
export function usePronunciationChecker(): UsePronunciationCheckerReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentTargetRef = useRef('');
  const recognitionRef = useRef<any>(null);

  // 看门狗：Android 上 SpeechRecognition 既不 onend 也不 onerror 时会一直 hang，
  // 导致 isRecording 永远为 true（麦克风按钮卡在“录音中”）。超时强制复位。
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  const startRecord = (targetWord: string) => {
    setError(null);
    setResult(null);
    currentTargetRef.current = targetWord;

    // 检查浏览器支持
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError('您的浏览器不支持语音功能，请使用 Chrome 浏览器。');
      alert('⚠️ 您的浏览器不支持语音功能，请使用 Chrome 浏览器。');
      return;
    }

    // 清理上次的实例
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) { /* ignore */ }
    }

    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 3; // 获取多个候选结果，提高准确率

    recognition.onresult = (event: any) => {
      clearWatchdog();
      setIsRecording(false);

      // 尝试所有候选结果，选最佳匹配
      let bestResult: PronunciationResult | null = null;
      const results = event.results[0];

      for (let i = 0; i < results.length && i < 3; i++) {
        const transcript = results[i]?.transcript?.trim() || '';
        if (!transcript) continue;

        const scored = scorePronunciation(targetWord, transcript);
        if (!bestResult || scored.score > bestResult.score) {
          bestResult = scored;
        }
      }

      if (bestResult) {
        setResult(bestResult);
      } else {
        setError('未能识别到内容，请重试');
      }

      recognitionRef.current = null;
    };

    recognition.onend = () => {
      clearWatchdog();
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: any) => {
      clearWatchdog();
      setIsRecording(false);
      recognitionRef.current = null;
      const msgMap: Record<string, string> = {
        'no-speech': '没有检测到声音，请大声清晰地朗读后重试',
        'audio-capture': '找不到麦克风，请检查设备是否已连接',
        'not-allowed': '麦克风权限被拒绝，请点击地址栏左侧图标允许访问',
        'service-not-allowed': '当前浏览器或网络环境不支持语音识别，建议用 Chrome 浏览器打开',
        'network': '网络错误，请检查连接后重试',
        'aborted': '已取消',
      };
      const friendly = msgMap[event.error];
      if (friendly) {
        setError(friendly);
      } else {
        setError(`识别出错：${event.error || '未知错误'}`);
      }
    };

    try {
      recognition.start();
      setIsRecording(true);
      // 超时强制复位，防止安卓上识别 hang 导致麦克风按钮卡住
      watchdogRef.current = setTimeout(() => {
        try { recognition.stop(); } catch (_) { /* ignore */ }
        setIsRecording(false);
        recognitionRef.current = null;
        setError('识别超时，请重试（安卓上语音识别可能不稳定）');
      }, 20000);
    } catch (err) {
      console.error('Pronunciation record start error:', err);
      setError('启动录音失败，请刷新页面后重试');
      setIsRecording(false);
      recognitionRef.current = null;
    }
  };

  const stopRecord = () => {
    clearWatchdog();
    const rec = recognitionRef.current;
    if (rec) {
      try {
        // Android Chrome 上 recognition.stop() 常不触发 onend，导致实例悬挂、
        // 麦克风一直占用、"点停止停不下来"。abort() 会立即终止并释放麦克风，
        // 按规范触发 onend，是安卓上最可靠的停止方式；stop() 仅作 fallback。
        rec.abort();
      } catch (_) {
        try { rec.stop(); } catch (_) { /* ignore */ }
      }
    }
    setIsRecording(false);
    recognitionRef.current = null;
    // 兜底看门狗：个别 ROM 上 abort 后仍不触发 onend，短延时强制复位，
    // 保证按钮一定能从"录音中"退出（麦克风真正释放）。
    watchdogRef.current = setTimeout(() => {
      setIsRecording(false);
      recognitionRef.current = null;
    }, 800);
  };

  const reset = () => {
    clearWatchdog();
    setResult(null);
    setError(null);
  };

  // 卸载时清理看门狗
  useEffect(() => () => clearWatchdog(), [clearWatchdog]);

  return { isRecording, result, error, startRecord, stopRecord, reset };
}
