import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { allThemes, spellingQuestions, matchingQuestions, fillBlankQuestions } from '../data/vocabulary';
import { useProgressStore } from '../store/useProgressStore';
import { usePronunciationChecker, isSpeechRecognitionSupported } from '../hooks/usePronunciationChecker';
import { AudioButton } from '../components/AudioButton';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { audioFileUrl, playAudioEl, speakText, ttsFallbackAllowed } from '../utils/audio';

// ========== 常量 ==========
const SESSION_SIZE = 10;

// ========== 语音识别 Hook ==========
function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startListening = () => {
    setError(null);

    // 检查浏览器支持
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError('您的浏览器不支持语音识别，请使用 Chrome 浏览器。');
      alert('⚠️ 您的浏览器不支持语音识别，请使用 Chrome 浏览器。');
      return;
    }

    // 如果正在监听，先停止上一次
    if ((window as any).__currentRecognition) {
      try { (window as any).__currentRecognition.abort(); } catch (_) { /* ignore */ }
    }

    const recognition = new SR();
    (window as any).__currentRecognition = recognition;

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e: any) => {
      const result = e.results[0]?.[0]?.transcript?.trim()?.toLowerCase();
      if (result) {
        setTranscript(result);
      } else {
        setError('未能识别到内容，请重试');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      (window as any).__currentRecognition = null;
    };

    recognition.onerror = (e: any) => {
      setIsListening(false);
      (window as any).__currentRecognition = null;
      const msgMap: Record<string, string> = {
        'no-speech': '没有检测到声音，请大声清晰地朗读单词后重试',
        'audio-capture': '找不到麦克风，请检查设备是否已连接',
        'not-allowed': '麦克风权限被拒绝，请在浏览器地址栏左侧点击🔒图标允许麦克风访问',
        'network': '网络错误，请检查网络连接后重试',
        'aborted': '识别已取消',
      };
      const msg = msgMap[e.error] || `识别出错：${e.error || '未知错误'}`;
      setError(msg);
    };

    try {
      recognition.start();
      setIsListening(true);
      setTranscript('');
    } catch (err) {
      console.error('SpeechRecognition start error:', err);
      setError('启动失败，请刷新页面后重试');
      setIsListening(false);
      (window as any).__currentRecognition = null;
    }
  };

  return { transcript, isListening, startListening, setTranscript, speechError: error, clearError: () => setError(null) };
}

// ========== 结果总结页 ==========
function SessionResult({ correct, total, onBack, onRetry }: { correct: number; total: number; onBack: () => void; onRetry: () => void }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="text-center py-10">
      <p className="text-5xl mb-4">{pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪'}</p>
      <h3 className="text-xl font-bold text-gray-800 mb-2">练习完成！</h3>
      <div className="inline-flex items-center gap-6 my-6 px-8 py-4 bg-gray-50 rounded-2xl">
        <div>
          <p className="text-3xl font-bold text-blue-600">{correct} / {total}</p>
          <p className="text-xs text-gray-400">正确数</p>
        </div>
        <div className="w-px h-10 bg-gray-200" />
        <div>
          <p className={`text-3xl font-bold ${pct >= 80 ? 'text-green-500' : pct >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>{pct}%</p>
          <p className="text-xs text-gray-400">正确率</p>
        </div>
      </div>
      <div className="flex justify-center gap-3 mt-4">
        <button onClick={onRetry} className="btn-primary">再来一轮</button>
        <button onClick={onBack} className="btn-secondary">返回主题列表</button>
      </div>
    </div>
  );
}

// ========== 单词发音工具函数（优先预生成 mp3，失败回退 TTS）==========
async function speakWord(id: string, text: string) {
  const ok = await playAudioEl(audioFileUrl(id));
  if (!ok && text && ttsFallbackAllowed()) speakText(text, { rate: 0.85 });
}

// ========== 单词卡片学习（每次10题）==========
function WordCards({ themeId, onBack }: { themeId: string; onBack: () => void }) {
  const theme = allThemes.find(t => t.id === themeId);
  if (!theme) return <div className="text-center py-20 text-gray-400">主题未找到，请返回重新选择</div>;
  const [sessionWords] = useState(() => {
    const shuffled = [...theme.words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(SESSION_SIZE, shuffled.length));
  });
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const word = sessionWords[idx];

  // 发音评分 Hook
  const { isRecording, result: proResult, error: proError, startRecord, reset: resetPro } = usePronunciationChecker();
  const speechSupported = typeof window !== 'undefined' && isSpeechRecognitionSupported();

  // 切换单词时自动朗读英语发音 + 重置发音评分
  useEffect(() => {
    if (word) {
      setFlipped(false);
      resetPro();
      const timer = setTimeout(() => { if (typeof window !== 'undefined') speakWord(word.id, word.en); }, 300);
      return () => clearTimeout(timer);
    }
  }, [idx]);

  // 全部学完
  if (idx >= sessionWords.length) {
    return (
      <SessionResult
        correct={sessionWords.length}
        total={sessionWords.length}
        onBack={onBack}
        onRetry={() => { setIdx(0); setFlipped(false); }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">← 返回主题列表</button>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-500">{theme.nameZh} · 学习卡片</span>
      </div>

      {/* 进度条 */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
        <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${((idx + 1) / sessionWords.length) * 100}%` }} />
      </div>

      {/* 卡片 */}
      <div className="flex justify-center my-6" onClick={() => !proResult && setFlipped(!flipped)}>
        <div className={`w-full max-w-md min-h-80 rounded-2xl shadow-lg transition-all duration-300 ${flipped ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'} border flex flex-col items-center justify-center p-6 relative overflow-hidden`}>
          {flipped ? (
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700 mb-2">{word.zh}</p>
              <p className="text-sm text-gray-400 mb-1">{word.phonetic}</p>
              <div className="mb-2 flex justify-center">
              <AudioButton
                text={word.en}
                audioSrc={audioFileUrl(word.id)}
                label="播放发音"
                size="large"
              />
              </div>
              <p className="text-sm text-gray-600 italic">"{word.example}"</p>
              <p className="text-xs text-gray-400 mt-1">{word.exampleZh}</p>
            </div>
          ) : (
            <div className="text-center w-full">
              <p className="text-3xl font-bold text-gray-800 mb-1">{word.en}</p>
              <p className="text-sm text-gray-400 mb-1">{word.phonetic}</p>
              <p className="text-lg font-medium text-blue-600 mb-3">{word.zh}</p>
              
              {/* 发音评分按钮 - 增大按钮尺寸 */}
              <div className="flex justify-center gap-4 mb-2">
              <AudioButton
                text={word.en}
                audioSrc={audioFileUrl(word.id)}
                label="播放发音"
                size="large"
              />
                {speechSupported ? (
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); startRecord(word.en); }}
                      disabled={isRecording}
                      className={`
                        w-28 h-28 rounded-full 
                        text-5xl
                        transition-all duration-300
                        active:scale-95
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center
                        relative
                        ${isRecording
                          ? 'bg-gradient-to-br from-red-400 to-pink-600 text-white shadow-lg shadow-red-300 animate-pulse'
                          : 'bg-gradient-to-br from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white shadow-lg hover:shadow-2xl'
                        }
                      `}
                      title={isRecording ? '正在录音...点击停止' : '点击开始录音'}
                    >
                      {isRecording ? '🎙️' : '🎤'}
                      
                      {/* 录音中动画效果 */}
                      {isRecording && (
                        <>
                          <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                            <span className="text-white text-xs">●</span>
                          </div>
                        </>
                      )}
                    </button>
                    <span className="text-xs text-gray-500">读一读</span>
                  </div>
                ) : (
                  <span
                    className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-400 cursor-help"
                    title="请使用 Chrome 浏览器体验发音评分功能"
                  >
                    🎙️ 读一读（需 Chrome）
                  </span>
                )}
              </div>

              {/* 发音评分结果 */}
              {proResult && (
                <div className={`mt-2 p-2 rounded-xl text-xs ${
                  proResult.level === 'perfect' ? 'bg-green-50 text-green-700' :
                  proResult.level === 'excellent' ? 'bg-green-50 text-green-700' :
                  proResult.level === 'good' ? 'bg-blue-50 text-blue-700' :
                  proResult.level === 'fair' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  <p className="font-bold text-lg">{proResult.score} 分</p>
                  <p>{proResult.feedback}</p>
                  <p className="text-gray-400 mt-1">你说的是：{proResult.recognizedText}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); resetPro(); }}
                    className="text-xs underline mt-1"
                  >重新读</button>
                </div>
              )}

              {/* 例句（学习模式始终展示） */}
              {!proResult && !isRecording && (
                <p className="text-xs text-gray-400 mt-2">"{word.example}"</p>
              )}
              {isRecording && (
                <p className="text-xs text-red-400 mt-2 animate-pulse">请大声朗读单词...</p>
              )}
              {proError && (
                <div className="mt-2 p-2 rounded-lg bg-red-50 text-red-600 text-xs text-left">
                  <p className="font-medium">⚠️ {proError}</p>
                  {proError.includes('不支持') && (
                    <p className="mt-1 text-red-500">建议：复制链接到 Chrome 浏览器打开，或点击 🔊 朗读按钮跟读。</p>
                  )}
                  {proError.includes('权限') && (
                    <p className="mt-1 text-red-500">建议：点击地址栏左侧 🔒 图标，允许麦克风权限。</p>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); resetPro(); }}
                    className="mt-1 underline text-red-400 hover:text-red-600"
                  >知道了</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 导航 */}
      <div className="flex justify-center gap-4">
        <button disabled={idx === 0} onClick={() => { setIdx(idx - 1); setFlipped(false); }} className="btn-secondary disabled:opacity-40">上一词</button>
        <span className="text-sm text-gray-400 self-center">{idx + 1} / {sessionWords.length}</span>
        <button onClick={() => { setIdx(idx + 1); setFlipped(false); }} className="btn-primary">下一个 →</button>
      </div>
    </div>
  );
}

// ========== 拼写练习（语音输入，每次10题）==========
function SpellingPractice({ themeId, onBack }: { themeId: string; onBack: () => void }) {
  const theme = allThemes.find(t => t.id === themeId);

  // 安全防护：themeId 无效时显示提示而非白屏
  if (!theme) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">⚠️</p>
        <h3 className="text-lg font-bold text-gray-800 mb-2">未找到对应主题</h3>
        <p className="text-sm text-gray-400 mb-6">themeId: {themeId || '(空)'}</p>
        <button onClick={onBack} className="btn-primary">返回重新选择</button>
      </div>
    );
  }

  const allQs = spellingQuestions.filter(q => theme.words.some((w) => w.id === q.wordId));
  const [sessionQs] = useState(() => {
    const s = [...allQs].sort(() => Math.random() - 0.5);
    return s.slice(0, Math.min(SESSION_SIZE, s.length));
  });
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [playCount, setPlayCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const { recordAnswer, recordSession } = useProgressStore();
  const startTime = useRef(Date.now());

  // 语音识别 Hook
  const startListening = useCallback(() => {
    setSpeechError(null);
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSpeechError('您的浏览器不支持语音识别');
      return;
    }
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (e: any) => {
      const result = e.results[0]?.[0]?.transcript?.trim()?.toLowerCase();
      if (result) setTranscript(result);
      setIsListening(false);
    };
    recognition.onerror = () => { setIsListening(false); setSpeechError('识别失败'); };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  }, []);

  const clearError = () => setSpeechError(null);

  // 全部完成 —— 必须在访问 sessionQs[idx] 之前检查
  const sessionDone = idx >= sessionQs.length;

  // ✅ 用 useEffect 记录练习结果，并用 ref 守卫，避免 StrictMode 下重复记录
  const recordedRef = useRef(false);
  useEffect(() => {
    if (sessionDone && !recordedRef.current) {
      recordedRef.current = true;
      recordSession({
        module: 'vocabulary', exerciseType: 'spelling',
        subjectId: themeId, subjectName: theme.nameZh,
        correct: correctCount, total: sessionQs.length,
        duration: Math.round((Date.now() - startTime.current) / 1000),
      });
    }
  }, [sessionDone, correctCount, sessionQs.length]);

  if (sessionDone) {
    return (
      <SessionResult
        correct={correctCount}
        total={sessionQs.length}
        onBack={onBack}
        onRetry={() => { setIdx(0); setCorrectCount(0); startTime.current = Date.now(); recordedRef.current = false; }}
      />
    );
  }

  const q = sessionQs[idx];

  const checkAnswer = () => {
    const answer = (transcript || manualInput).trim().toLowerCase().replace(/[.\s]/g, '');
    if (!answer) return;
    const ok = answer === q.en.toLowerCase().replace(/[.\s]/g, '');
    setResult(ok ? 'correct' : 'wrong');
    if (ok) setCorrectCount(correctCount + 1);
    recordAnswer({
      module: 'vocabulary', exerciseType: 'spelling',
      subjectId: themeId, subjectName: theme.nameZh,
      questionId: q.id,
      questionText: `拼写单词: ${q.audioText}（音标: ${q.phonetic}）`,
      userAnswer: answer,
      correctAnswer: q.en,
      isCorrect: ok,
    });
  };

  const nextQuestion = () => {
    setIdx(idx + 1);
    setResult(null);
    setPlayCount(0);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">← 返回</button>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-500">{theme.nameZh} · 拼写练习</span>
      </div>

      <div className="card max-w-lg mx-auto text-center">
        {/* 播放按钮 - 使用统一组件 */}
        <div className="mb-6 flex justify-center">
          <AudioButton
            text={q.audioText}
            label="播放发音"
            size="large"
            maxPlays={3}
            showSpeedControl={true}
          />
        </div>

        {/* 语音输入按钮 - 增大尺寸+优化样式 */}
        <div className="mb-6">
          <div className="flex justify-center">
            <button
              onClick={startListening}
              disabled={isListening}
              className={`
                w-28 h-28 rounded-full 
                text-5xl
                transition-all duration-300
                active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center
                relative
                ${isListening
                  ? 'bg-gradient-to-br from-red-400 to-pink-600 text-white shadow-lg shadow-red-300 animate-pulse'
                  : 'bg-gradient-to-br from-blue-400 to-purple-600 hover:from-blue-500 hover:to-purple-700 text-white shadow-lg hover:shadow-2xl'
                }
              `}
              title={isListening ? '正在听...点击停止' : '点击开始录音'}
            >
              {isListening ? '🎙️' : '🎤'}
              
              {/* 录音中动画效果 */}
              {isListening && (
                <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
              )}
            </button>
          </div>
          <p className={`text-xs mt-2 text-center ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
            {isListening ? '正在听...请说单词' : '点击麦克风，说出单词'}
          </p>
        </div>

        {/* 语音识别错误提示 */}
        {speechError && !isListening && !transcript && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-700">⚠️ {speechError}</p>
            <button onClick={clearError} className="text-xs text-yellow-600 underline mt-1">关闭提示</button>
          </div>
        )}

        {/* 手动输入（语音识别不可用时的替代方案）*/}
        <div className="mb-4">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="或在此直接输入单词（适合不支持语音的浏览器）"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {manualInput.trim() && !isListening && !result && (
            <button onClick={checkAnswer} className="btn-primary mt-2 w-full">确认提交</button>
          )}
        </div>

        {/* 识别结果 */}
        {transcript && !result && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">识别结果：<span className="font-medium text-gray-700">"{transcript}"</span></p>
            <button onClick={checkAnswer} className="btn-primary">确认提交</button>
          </div>
        )}

        {/* 反馈 */}
        {result && (
          <div className={`p-4 rounded-xl ${result === 'correct' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <p className="text-lg font-bold mb-1">{result === 'correct' ? '✅ 正确！' : '❌ 不对哦'}</p>
            {result === 'wrong' && (
              <p className="text-sm">正确答案：<span className="font-bold">{q.en}</span> {q.phonetic}</p>
            )}
            <button onClick={nextQuestion} className="mt-3 btn-primary">下一题</button>
          </div>
        )}

        {/* 进度 */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <span>{idx + 1} / {sessionQs.length}</span>
          <span>✅ {correctCount} 正确</span>
        </div>
      </div>
    </div>
  );
}

// ========== 词义匹配（每次10题）==========
function MatchingPractice({ themeId, onBack }: { themeId: string; onBack: () => void }) {
  const theme = allThemes.find(t => t.id === themeId);
  if (!theme) return <div className="text-center py-20 text-gray-400">主题未找到，请返回重新选择</div>;
  const allQs = matchingQuestions.filter(q => q.themeId === themeId);
  const [sessionQs] = useState(() => {
    const s = [...allQs].sort(() => Math.random() - 0.5);
    return s.slice(0, Math.min(SESSION_SIZE, s.length));
  });
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const { recordAnswer, recordSession } = useProgressStore();
  const startTime = useRef(Date.now());

  // 全部完成 —— 必须在访问 sessionQs[idx] 之前检查
  const sessionDone = idx >= sessionQs.length;

  // ✅ 用 useEffect 记录练习结果，并用 ref 守卫，避免 StrictMode 下重复记录
  const recordedRef = useRef(false);
  useEffect(() => {
    if (sessionDone && !recordedRef.current) {
      recordedRef.current = true;
      recordSession({
        module: 'vocabulary', exerciseType: 'matching',
        subjectId: themeId, subjectName: theme.nameZh,
        correct: correctCount, total: sessionQs.length,
        duration: Math.round((Date.now() - startTime.current) / 1000),
      });
    }
  }, [sessionDone, correctCount, sessionQs.length]);

  const q = sessionQs[idx];
  // ✅ useMemo 必须在 early return 之前调用，否则 sessionDone 切换时 hooks 数量变化会触发 Error #300
  const shuffledOptions = useMemo(() => (q ? [...q.options].sort(() => Math.random() - 0.5) : []), [q]);

  if (sessionDone) {
    return (
      <SessionResult
        correct={correctCount}
        total={sessionQs.length}
        onBack={onBack}
        onRetry={() => { setIdx(0); setCorrectCount(0); startTime.current = Date.now(); recordedRef.current = false; }}
      />
    );
  }

  const submitAnswer = () => {
    if (!selected) return;
    const ok = selected === q.answer;
    setResult(ok ? 'correct' : 'wrong');
    if (ok) setCorrectCount(correctCount + 1);
    recordAnswer({
      module: 'vocabulary', exerciseType: 'matching',
      subjectId: themeId, subjectName: theme.nameZh,
      questionId: q.id,
      questionText: q.promptLang === 'en' ? `配对：${q.prompt}` : `配对：${q.prompt}`,
      userAnswer: selected,
      correctAnswer: q.answer,
      isCorrect: ok,
    });
  };

  const nextQuestion = () => {
    setIdx(idx + 1);
    setSelected(null);
    setResult(null);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">← 返回</button>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-500">词义匹配练习</span>
      </div>

      <div className="card max-w-lg mx-auto">
        {/* 进度 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 mr-4">
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${((idx + 1) / sessionQs.length) * 100}%` }} />
            </div>
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">{idx + 1} / {sessionQs.length}</span>
        </div>

        {/* 题目 */}
        <div className="text-center mb-6">
          <p className="text-xs text-gray-400 mb-2">
            {q.promptLang === 'zh' ? '选择正确的英文单词' : '选择正确的中文释义'}
          </p>
          <p className={`text-xl font-bold ${q.promptLang === 'zh' ? 'text-gray-800' : 'text-gray-800'}`}>
            {q.prompt}
          </p>
        </div>

        {/* 选项 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {shuffledOptions.map((opt, i) => {
            let cls = 'p-3 rounded-xl text-sm font-medium text-center transition-all cursor-pointer ';
            if (result) {
              if (opt === q.answer) cls += 'bg-green-100 text-green-700 border-green-300 ';
              else if (opt === selected && opt !== q.answer) cls += 'bg-red-100 text-red-700 border-red-300 ';
              else cls += 'bg-gray-50 text-gray-400 ';
            } else {
              if (opt === selected) cls += 'bg-purple-100 text-purple-700 border-purple-300 ';
              else cls += 'bg-white text-gray-700 border-gray-200 hover:bg-purple-50 hover:border-purple-200 ';
            }
            return (
              <button key={`${q.id}-${i}`} disabled={!!result} onClick={() => setSelected(opt)} className={cls + 'border'}>
                {opt}
              </button>
            );
          })}
        </div>

        {/* 操作按钮 */}
        {!result && (
          <button onClick={submitAnswer} disabled={!selected} className="w-full btn-primary disabled:opacity-40">确认答案</button>
        )}

        {/* 反馈 */}
        {result && (
          <div className={`p-4 rounded-xl ${result === 'correct' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <p className="font-bold mb-1">{result === 'correct' ? '✅ 正确！' : '❌ 不对哦'}</p>
            {result === 'wrong' && <p className="text-sm">正确答案是：<span className="font-bold">{q.answer}</span></p>}
            <button onClick={nextQuestion} className="mt-3 btn-primary w-full">下一题</button>
          </div>
        )}

        <div className="mt-4 text-right text-xs text-gray-400">✅ {correctCount} 正确</div>
      </div>
    </div>
  );
}

// ========== 选词填空（每次10题）==========
function FillBlankPractice({ themeId, onBack }: { themeId: string; onBack: () => void }) {
  const theme = allThemes.find(t => t.id === themeId);
  if (!theme) return <div className="text-center py-20 text-gray-400">主题未找到，请返回重新选择</div>;
  const allQs = fillBlankQuestions.filter(q => q.themeId === themeId);
  const [sessionQs] = useState(() => {
    const s = [...allQs].sort(() => Math.random() - 0.5);
    return s.slice(0, Math.min(SESSION_SIZE, s.length));
  });
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const { recordAnswer, recordSession } = useProgressStore();
  const startTime = useRef(Date.now());

  // 全部完成 —— 必须在访问 sessionQs[idx] 之前检查
  const sessionDone = idx >= sessionQs.length;

  // ✅ 用 useEffect 记录练习结果，并用 ref 守卫，避免 StrictMode 下重复记录
  const recordedRef = useRef(false);
  useEffect(() => {
    if (sessionDone && !recordedRef.current) {
      recordedRef.current = true;
      recordSession({
        module: 'vocabulary', exerciseType: 'fill_blank',
        subjectId: themeId, subjectName: theme.nameZh,
        correct: correctCount, total: sessionQs.length,
        duration: Math.round((Date.now() - startTime.current) / 1000),
      });
    }
  }, [sessionDone, correctCount, sessionQs.length]);

  const q = sessionQs[idx];
  // ✅ useMemo 必须在 early return 之前调用，否则 sessionDone 切换时 hooks 数量变化会触发 Error #300
  const choiceOptions = useMemo(() => {
    if (!q) return [];
    const others = theme.words.filter(w => w.en !== q.answer).map(w => w.en);
    const distractors = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    return [q.answer, ...distractors].sort(() => Math.random() - 0.5);
  }, [q, theme.words]);

  if (sessionDone) {
    return (
      <SessionResult
        correct={correctCount}
        total={sessionQs.length}
        onBack={onBack}
        onRetry={() => { setIdx(0); setCorrectCount(0); startTime.current = Date.now(); recordedRef.current = false; }}
      />
    );
  }

  const submitAnswer = () => {
    if (!input.trim()) return;
    const ok = input.trim().toLowerCase() === q.answer.toLowerCase();
    setResult(ok ? 'correct' : 'wrong');
    if (ok) setCorrectCount(correctCount + 1);
    recordAnswer({
      module: 'vocabulary', exerciseType: 'fill_blank',
      subjectId: themeId, subjectName: theme.nameZh,
      questionId: q.id,
      questionText: q.sentence,
      userAnswer: input.trim(),
      correctAnswer: q.answer,
      isCorrect: ok,
    });
  };

  const nextQuestion = () => {
    setIdx(idx + 1);
    setInput('');
    setResult(null);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">← 返回</button>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-500">{theme.nameZh} · 选词填空</span>
      </div>

      <div className="card max-w-lg mx-auto">
        {/* 进度 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 mr-4">
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-orange-500 h-1.5 rounded-full transition-all" style={{ width: `${((idx + 1) / sessionQs.length) * 100}%` }} />
            </div>
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">{idx + 1} / {sessionQs.length}</span>
        </div>

        {/* 句子 */}
        <div className="text-center mb-6">
          <p className="text-xs text-gray-400 mb-3">在空白处填入正确的单词</p>
          <div className="text-lg leading-relaxed text-gray-800">
            {q.sentence.split('____').map((part, i) => (
              <span key={i}>
                {part}
                {i === 0 && (
                  <span className="inline-block min-w-[80px] mx-1 px-2 py-0.5 border-b-2 border-dashed border-orange-400 font-bold text-orange-600 align-bottom">
                    {!result ? (input || '____') : q.answer}
                  </span>
                )}
              </span>
            ))}
          </div>
          {!result && <p className="text-xs text-gray-400 mt-2">💡 提示：{q.hint}</p>}
        </div>

        {/* 选项按钮 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {choiceOptions.map((opt, i) => {
            let cls = 'p-3 rounded-xl text-sm font-medium text-center transition-all cursor-pointer ';
            if (result) {
              if (opt === q.answer) cls += 'bg-green-100 text-green-700 border-green-300 ';
              else if (opt === input.trim().toLowerCase()) cls += 'bg-red-100 text-red-700 border-red-300 ';
              else cls += 'bg-gray-50 text-gray-400 ';
            } else {
              if (opt.toLowerCase() === input.toLowerCase()) cls += 'bg-orange-100 text-orange-700 border-orange-300 ';
              else cls += 'bg-white text-gray-700 border-gray-200 hover:bg-orange-50 hover:border-orange-200 ';
            }
            return (
              <button key={`${q.id}-${i}`} disabled={!!result} onClick={() => setInput(opt)} className={cls + 'border'}>
                {opt}
              </button>
            );
          })}
        </div>

        {/* 操作按钮 */}
        {!result && (
          <button onClick={submitAnswer} disabled={!input} className="w-full btn-primary disabled:opacity-40">确认答案</button>
        )}

        {/* 反馈 */}
        {result && (
          <div className={`p-4 rounded-xl ${result === 'correct' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <p className="font-bold mb-1">{result === 'correct' ? '✅ 正确！' : '❌ 不对哦'}</p>
            {result === 'wrong' && (
              <>
                <p className="text-sm">正确答案：<span className="font-bold">{q.answer}</span></p>
                <p className="text-xs mt-1 opacity-75">{q.hint}</p>
              </>
            )}
            <button onClick={nextQuestion} className="mt-3 btn-primary w-full">下一题</button>
          </div>
        )}

        <div className="mt-4 text-right text-xs text-gray-400">✅ {correctCount} 正确</div>
      </div>
    </div>
  );
}

// ========== 主页面 ==========
type VocMode = 'list' | 'cards' | 'spelling' | 'matching' | 'fillblank';

export default function VocabularyPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<VocMode>('list');
  const [themeId, setThemeId] = useState<string>('');

  // 如果没有选择主题，阻止进入练习页面，自动弹回主题列表
  if (!themeId && mode !== 'list') {
    // 使用 useEffect 在下次渲染前安全地将 mode 重置为 'list'
    // 本次渲染直接返回提示页面（不调用 setState）
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">📂</p>
        <h3 className="text-lg font-bold text-gray-800 mb-2">请先选择一个主题</h3>
        <p className="text-sm text-gray-400 mb-6">点击下方主题卡片上的「🎤 拼写」开始练习</p>
        <button onClick={() => setMode('list')} className="btn-primary">返回主题列表</button>
      </div>
    );
  }

  if (mode === 'cards') return <ErrorBoundary><WordCards themeId={themeId} onBack={() => setMode('list')} /></ErrorBoundary>;
  if (mode === 'spelling') return <ErrorBoundary><SpellingPractice themeId={themeId} onBack={() => setMode('list')} /></ErrorBoundary>;
  if (mode === 'matching') return <ErrorBoundary><MatchingPractice themeId={themeId} onBack={() => setMode('list')} /></ErrorBoundary>;
  if (mode === 'fillblank') return <ErrorBoundary><FillBlankPractice themeId={themeId} onBack={() => setMode('list')} /></ErrorBoundary>;

  return (
    <div>
      {/* 顶部返回首页 */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
          ← 返回首页
        </button>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">📚 词汇学习</h2>
      <p className="text-sm text-gray-400 mb-6">选择主题开始学习，支持语音拼写练习</p>

      {/* 功能选择 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { m: 'list' as VocMode, label: '📂 主题列表' },
          { m: 'cards' as VocMode, label: '🃏 学习卡片' },
          { m: 'spelling' as VocMode, label: '🎤 拼写练习' },
          { m: 'matching' as VocMode, label: '🔗 词义匹配' },
          { m: 'fillblank' as VocMode, label: '✏️ 选词填空' },
        ].map((item) => (
          <button
            key={item.m}
            onClick={() => setMode(item.m)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              mode === item.m
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 主题网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allThemes.map((theme) => (
          <div key={theme.id} className="card">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{theme.icon}</span>
              <div>
                <h4 className="font-semibold text-gray-800">{theme.nameZh}</h4>
                <p className="text-xs text-gray-400">{theme.name} · {theme.words.length} 词</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => { setThemeId(theme.id); setMode('cards'); }} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100">🃏 学卡片</button>
              <button onClick={() => { setThemeId(theme.id); setMode('spelling'); }} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100">🎤 拼写</button>
              <button onClick={() => { setThemeId(theme.id); setMode('matching'); }} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded hover:bg-purple-100">🔗 匹配</button>
              <button onClick={() => { setThemeId(theme.id); setMode('fillblank'); }} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded hover:bg-orange-100">✏️ 填空</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
