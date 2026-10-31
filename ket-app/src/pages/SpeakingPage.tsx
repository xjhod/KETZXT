import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { speakingPart1, speakingPart2 } from '../data/speaking';
import { useSpeechTranscriber } from '../hooks/useSpeechTranscriber';
import {
  startRecording as startRecorderCapture,
  recorderHint,
  detectRecorderCapability,
  type RecorderCapability,
  type RecorderHandle,
} from '../utils/recorder';
import { useProgressStore } from '../store/useProgressStore';
import { audioFileUrl, playAudioEl, speakText, ttsFallbackAllowed, stopAllAudio } from '../utils/audio';
import {
  fetchLlmStatus,
  gradeSpeechWithLLM,
  blobToBase64,
  type LlmStatus,
  type LlmSpeechResult,
} from '../utils/llm';

// ========== 类型定义 ==========
interface ScoreResult {
  score: number;
  matchedKeywords: string[];
  wordCount: number;
  feedback: string;
}

// ========== 评分函数（简化版）==========
function scoreAnswer(transcript: string, keywords: string[]): ScoreResult {
  if (!transcript || transcript.trim().length === 0) {
    return {
      score: 0,
      matchedKeywords: [],
      wordCount: 0,
      feedback: '请尝试回答。点击"开始录音"按钮，然后回答题目。',
    };
  }

  const words = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const matchedKeywords = keywords.filter(kw => 
    words.some(w => w.includes(kw.toLowerCase()))
  );
  
  // 1. 关键词匹配（50分）
  const keywordScore = (matchedKeywords.length / keywords.length) * 50;
  
  // 2. 流利度（单词数，最多50分）
  const fluencyScore = Math.min(words.length / 5, 10) * 5;
  
  // 3. 总分
  const totalScore = Math.round(keywordScore + fluencyScore);
  
  // 4. 生成反馈
  let feedback = '';
  if (totalScore >= 80) {
    feedback = `太棒了！你的回答非常好。你提到了 ${matchedKeywords.join(', ')} 等关键词。`;
  } else if (totalScore >= 60) {
    feedback = `很好！你的回答不错。可以尝试提到更多关键词：${keywords.filter(k => !matchedKeywords.includes(k)).join(', ')}。`;
  } else if (totalScore >= 40) {
    feedback = `不错，但还可以更好。建议多说一些内容，并尝试用到这些词：${keywords.join(', ')}。`;
  } else {
    feedback = `继续练习！试着用完整的句子回答，并用到这些关键词：${keywords.join(', ')}。`;
  }
  
  return {
    score: totalScore,
    matchedKeywords,
    wordCount: words.length,
    feedback,
  };
}

// ========== 播放标准答案（优先预生成 mp3，缺失则回退浏览器 TTS）==========
async function playModelAnswer(id: string, text: string): Promise<void> {
  const ok = await playAudioEl(audioFileUrl(id), 0.9);
  if (!ok && ttsFallbackAllowed()) {
    // 预生成音频缺失/加载失败时，回退到浏览器内置 TTS（speechSynthesis 走设备本地引擎，安卓可用、不被墙）
    speakText(text, { rate: 0.9, lang: 'en-US' });
  }
}

// ========== 转录结果面板（真实语音识别）==========
function TranscriptPanel({
  transcript,
  interim,
  error,
  isRecording,
}: {
  transcript: string;
  interim: string;
  error: string | null;
  isRecording: boolean;
}) {
  return (
    <div className="mt-4 space-y-2">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
          <p className="text-xs text-red-700 dark:text-red-300">⚠️ {error}</p>
        </div>
      )}
      {transcript && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
          <p className="text-xs text-green-800 dark:text-green-300 mb-1">
            📝 识别结果（真实语音识别）：
          </p>
          <p className="text-sm text-green-700 dark:text-green-300">{transcript}</p>
        </div>
      )}
      {isRecording && interim && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
          <p className="text-xs text-blue-800 dark:text-blue-300 mb-1">🎙️ 正在识别...</p>
          <p className="text-sm text-blue-700 dark:text-blue-300 italic">{interim}</p>
        </div>
      )}
      {!transcript && !error && !isRecording && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            点击下方「开始录音」后说出你的回答，系统会自动识别文字并评分。
          </p>
        </div>
      )}
    </div>
  );
}

// ========== 主组件 ==========
export default function SpeakingPage() {
  const navigate = useNavigate();
  
  // 状态
  const [activePart, setActivePart] = useState<1 | 2>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  // AI 口语评分（可选增强）：不可用时降级到上面的关键词评分
  const [llmStatus, setLlmStatus] = useState<LlmStatus>({ available: false, llm: false, asr: false });
  const [llmSpeech, setLlmSpeech] = useState<LlmSpeechResult | null>(null);
  const [llmScoring, setLlmScoring] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [manualText, setManualText] = useState('');
  // 录音环境：能力探测 + 实际使用的录音方式 + 给用户看的提示
  const [recorderCap, setRecorderCap] = useState<RecorderCapability>('mediarecorder');
  const [recorderNote, setRecorderNote] = useState('');

  // 真实语音识别（Web Speech API，无需大模型）
  const transcriber = useSpeechTranscriber();
  const transcript = transcriber.transcript;

  // 进度记录（从 store 取 action，避免整页重渲染）
  const recordAnswer = useProgressStore((s) => s.recordAnswer);
  const recordSession = useProgressStore((s) => s.recordSession);
  // 本轮会话累计（用 ref 避免触发重渲染）
  const sessionStatsRef = useRef({ total: 0, correct: 0 });
  const questionScoredRef = useRef(false); // 当前题是否已计入本轮回话累计（防重复）
  const roundStartRef = useRef(Date.now()); // 本轮开始时间（用于估算时长）

  // 当前 Part 的题量（一轮题数）
  const TOTAL = activePart === 1 ? speakingPart1.length : speakingPart2.length;
  
  // 录音相关（用兼容层，MediaRecorder 不可用时自动降级到 Web Audio）
  const recorderHandleRef = useRef<RecorderHandle | null>(null);
  
  // 当前题目
  const currentPart1 = speakingPart1[currentIndex % speakingPart1.length];
  const currentPart2 = speakingPart2[currentIndex % speakingPart2.length];
  
  // ========== 录音功能 ==========
  const startRecording = useCallback(async () => {
    setRecorderNote(recorderHint());
    try {
      // 兼容层：优先 MediaRecorder，失败自动降级到 Web Audio（录成 WAV）
      const handle = await startRecorderCapture();
      recorderHandleRef.current = handle;
      setRecorderCap(handle === null ? 'none' : detectRecorderCapability());
      setIsRecording(true);
      setScoreResult(null); // 清除之前的评分
      setLlmSpeech(null);   // 清除旧的 AI 评分
      // 浏览器自带识别在国产安卓上必然失败，这里失败不影响录音（云端 ASR 兜底）
      transcriber.start();
    } catch (err) {
      console.error('无法访问麦克风：', err);
      const msg = (err as Error)?.message || '';
      setRecorderNote(
        msg.includes('不支持录音')
          ? `${msg}。国产手机建议把网页「添加到主屏幕」后再打开，或换用系统自带浏览器。`
          : '无法访问麦克风。请检查浏览器权限设置（国产手机还需在系统设置里允许网页使用麦克风）。'
      );
      alert('无法开始录音：' + (msg || '未知原因'));
    }
  }, [activePart, currentIndex, currentPart1, transcriber]);
  
  // 探一次后端可用性：决定要不要显示「AI 评分」入口
  useEffect(() => {
    let alive = true;
    fetchLlmStatus().then((s) => {
      if (alive) setLlmStatus(s);
    });
    return () => { alive = false; };
  }, []);

  const stopRecording = useCallback(async () => {
    const handle = recorderHandleRef.current;
    if (handle && isRecording) {
      setIsRecording(false);
      try {
        const { blob, capability } = await handle.stop();
        recorderHandleRef.current = null;
        setRecorderCap(capability);
        // 边界：微信内置浏览器等环境下 MediaRecorder 可能不报错却录不到声音，
        // 表现为 blob 几乎为空。这种情况要明确告诉用户，而不是让 AI 评分报「转写失败」。
        if (blob.size < 1000) {
          setRecorderNote(
            '这次没有录到声音（部分浏览器会静默失败）。请重试，或改用下面的键盘输入 —— ' +
            '用键盘输入同样能得到 AI 的语法与内容批改。'
          );
          return;
        }
        setAudioBlob(blob);
        // 创建播放 URL
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } catch (e) {
        console.error('录音结束失败：', e);
      }
    }
    transcriber.stop(); // 停止语音识别，保留最终转录文本
  }, [isRecording, transcriber]);
  
  // ========== 播放录音 ==========
  const playRecording = useCallback(() => {
    if (audioUrl) {
      stopAllAudio(); // 先停掉正在播放的示范音频/TTS，避免叠音
      const audio = new Audio(audioUrl);
      audio.play();
    }
  }, [audioUrl]);
  
  // ========== 评分 ==========
  /**
   * AI 口语评分：把录音发给后端 → ASR 转文字 → LLM 按 KET A2 口语标准评分。
   * 失败时保持原有 scoreResult（关键词评分）不变，功能不降级。
   */
  const handleAiScore = useCallback(async () => {
    // 关键：录音不可用时（国产浏览器）允许「只提交文字」也能评分 ——
    // 只要有 transcript 或手动输入的文字，后端就能做语法/内容评分，不强依赖音频。
    const textOnly = (transcript || manualText).trim();
    if ((!audioBlob && !textOnly) || llmScoring) return;
    setLlmScoring(true);
    try {
      const audioBase64 = audioBlob ? await blobToBase64(audioBlob) : undefined;
      const isPart1 = activePart === 1;
      const q = isPart1 ? currentPart1 : currentPart2;
      const questionText = isPart1
        ? (currentPart1.questionZh || currentPart1.question)
        : (currentPart2.questions[0] || q.id);
      const keywords = isPart1 ? currentPart1.keywords : currentPart2.keywords;

      const res = await gradeSpeechWithLLM({
        audioBase64,
        mimeType: audioBlob?.type || 'audio/wav',
        question: questionText,
        keywords,
        modelAnswer: isPart1 ? currentPart1.modelAnswer : undefined,
        // 浏览器自带的识别结果；国产浏览器上它必然为空，
        // 此时用手输的文字兜底（服务端直接基于文字评分，不需要音频）
        browserTranscript: transcript || manualText || '',
      });

      if (!res.ok) {
        console.warn('[LLM] 口语评分降级：', res.reason);
        return;
      }
      setLlmSpeech(res.data);
    } catch (e) {
      console.warn('[LLM] 口语评分异常，降级：', e);
    } finally {
      setLlmScoring(false);
    }
  }, [audioBlob, llmScoring, activePart, currentPart1, currentPart2, transcript, manualText]);


  const handleScore = useCallback(() => {
    const answer = (transcript || manualText).trim();
    if (!answer) {
      alert('请先录音获取识别结果，或在下方输入框输入文字后评分。');
      return;
    }

    const keywords = activePart === 1 ? currentPart1.keywords : currentPart2.keywords;
    const result = scoreAnswer(answer, keywords);
    setScoreResult(result);

    // 口语达标制：60 分及以上记为"达标"（相当于答对）
    const isCorrect = result.score >= 60;
    const q = activePart === 1 ? currentPart1 : currentPart2;
    const questionText =
      activePart === 1
        ? (currentPart1.questionZh || currentPart1.question)
        : (currentPart2.questions[0] || q.id);

    // 记录单题（用于错题本 / 答题历史）
    recordAnswer({
      module: 'speaking',
      exerciseType: activePart === 1 ? 'speaking_p1' : 'speaking_p2',
      subjectId: q.id,
      subjectName: `口语 Part ${activePart}`,
      questionId: q.id,
      questionText,
      userAnswer: answer,
      correctAnswer: keywords.join('、'),
      isCorrect,
    });

    // 累计到本轮回话（每题只计一次，避免重复点"评分"重复累加）
    if (!questionScoredRef.current) {
      sessionStatsRef.current.total += 1;
      if (isCorrect) sessionStatsRef.current.correct += 1;
      questionScoredRef.current = true;
    }
  }, [transcript, activePart, currentPart1, currentPart2, recordAnswer]);

  // ========== 下一题 ==========
  const handleNext = useCallback(() => {
    // 计算下一题索引：若回到 0 说明刚完成一轮，记录本轮回话
    const nextIndex = currentIndex + 1;
    const justFinishedRound = nextIndex % TOTAL === 0;

    if (justFinishedRound) {
      recordSession({
        module: 'speaking',
        exerciseType: activePart === 1 ? 'speaking_p1' : 'speaking_p2',
        subjectId: activePart === 1 ? 'speaking-p1' : 'speaking-p2',
        subjectName: `口语 Part ${activePart}`,
        correct: sessionStatsRef.current.correct,
        total: sessionStatsRef.current.total,
        duration: Math.round((Date.now() - roundStartRef.current) / 1000),
      });
      // 重置本轮累计
      sessionStatsRef.current = { total: 0, correct: 0 };
      roundStartRef.current = Date.now();
    }

    setCurrentIndex(nextIndex);
    setAudioBlob(null);
    setAudioUrl(null);
    transcriber.reset();
    setManualText('');
    setScoreResult(null);
    setShowKeywords(false);
    setImgError(false);
    questionScoredRef.current = false;

    // 停止 TTS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [currentIndex, TOTAL, activePart, transcriber, recordSession]);
  
  // ========== 清理 URL ==========
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);
  
  // ========== 渲染 Part 1 ==========
  const renderPart1 = () => {
    const q = currentPart1;
    
    return (
      <div className="space-y-6">
        {/* 题目卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                📋 题目 {currentIndex + 1} / {speakingPart1.length}
              </h3>
              <p className="text-xl text-gray-900 dark:text-white font-medium mb-1">
                {q.question}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {q.questionZh}
              </p>
            </div>
          </div>
          
          {/* 提示词 */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
              💡 提示词
            </h4>
            <ul className="space-y-1">
              {q.prompts.map((prompt, i) => (
                <li key={i} className="text-sm text-blue-700 dark:text-blue-300">
                  • {prompt}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* 标准答案 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
            🔊 标准答案（点击播放）
          </h4>
          <button
            onClick={() => playModelAnswer(q.id, q.modelAnswer)}
            className="w-full p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-left hover:bg-green-100 dark:hover:bg-green-900/30 transition"
          >
            <p className="text-sm text-green-800 dark:text-green-300">
              {q.modelAnswer}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              ▶️ 点击播放标准发音
            </p>
          </button>
        </div>
        
        {/* 录音区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">
            🎤 你的回答
          </h4>
          
          <div className="flex flex-col items-center space-y-4">
            {/* 录音按钮 */}
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-32 h-32 rounded-full bg-red-500 hover:bg-red-600 text-white text-lg font-semibold shadow-lg transition transform hover:scale-105"
              >
                ⏺️ 开始录音
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-32 h-32 rounded-full bg-gray-700 hover:bg-gray-800 text-white text-lg font-semibold shadow-lg transition animate-pulse"
              >
                录音中...
                <br />
                <span className="text-sm">点击停止</span>
              </button>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              建议回答 30 秒左右
            </p>
          </div>

          {/* 录音环境提示：国产浏览器/微信内置时给出可操作建议 */}
          {recorderNote && (
            <div className="mt-3 text-xs bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5 text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-0.5">🎙 录音环境提示</p>
              <p>{recorderNote}</p>
              {recorderCap === 'none' && (
                <p className="mt-1 text-amber-700 dark:text-amber-300">
                  提示：即使不能录音，也可以在下面用键盘输入回答，AI 依然能给出语法与内容批改。
                </p>
              )}
            </div>
          )}

          {/* 手动输入（语音识别不可用时的替代方案）*/}
          <div className="w-full mt-2">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              或用键盘输入你的回答：
            </label>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              rows={3}
              placeholder="在此输入英文回答，例如：I like playing football with my friends."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* 录音回放 */}
          {audioUrl && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  ✅ 录音完成
                </span>
                <button
                  onClick={playRecording}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition"
                >
                  ▶️ 回放
                </button>
              </div>
              
              {/* 识别结果（真实语音识别）*/}
              <TranscriptPanel
                transcript={transcript}
                interim={transcriber.interim}
                error={transcriber.error}
                isRecording={isRecording}
              />
            </div>
          )}
        </div>
        
        {/* 评分结果 */}
        {/* ========== AI 口语评分（可选增强） ========== */}
        {(audioUrl || audioBlob) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-3">
            {!llmSpeech ? (
              <button
                onClick={handleAiScore}
                disabled={llmScoring || !llmStatus.available || (!audioBlob && !(transcript || manualText).trim())}
                className="w-full text-xs py-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {llmScoring
                  ? '🤖 AI 评分中…（转写 + 评分，约 10 秒）'
                  : !audioBlob && (transcript || manualText).trim()
                    ? '🤖 让 AI 评分（按你输入的文字评分）'
                  : llmStatus.available
                    ? '🤖 让 AI 评分（发音转写 + 内容/语法/流利度）'
                    : '🤖 AI 评分暂不可用（已用关键词评分）'}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-purple-700">🤖 AI 口语评分</p>
                  <div className="flex gap-2">
                    {[
                      { l: '内容', v: llmSpeech.contentScore, c: 'text-blue-600' },
                      { l: '语法', v: llmSpeech.grammarScore, c: 'text-green-600' },
                      { l: '流利', v: llmSpeech.fluencyScore, c: 'text-orange-600' },
                      { l: '词汇', v: llmSpeech.vocabularyScore, c: 'text-cyan-600' },
                    ].map((s) => (
                      <span key={s.l} className={`text-[11px] font-bold ${s.c}`}>{s.l} {s.v}</span>
                    ))}
                    <span className="text-xs font-bold text-purple-700">综合 {llmSpeech.score}</span>
                  </div>
                </div>

                {llmSpeech.transcript && (
                  <div className="text-xs bg-gray-50 border border-gray-200 rounded p-2">
                    <p className="font-medium text-gray-700 mb-1">
                      🎤 识别到的内容
                      {llmSpeech.asrSource === 'browser' && (
                        <span className="text-orange-500 font-normal">
                          （浏览器识别，可能有误；识别不准时语法判断也会受影响）
                        </span>
                      )}
                    </p>
                    <p className="text-gray-600">{llmSpeech.transcript}</p>
                  </div>
                )}

                {llmSpeech.feedback && (
                  <div className="text-xs bg-purple-50 border border-purple-100 rounded p-2">
                    <p className="font-medium text-purple-800 mb-1">总体评价</p>
                    <p className="text-gray-700">{llmSpeech.feedback}</p>
                  </div>
                )}

                {llmSpeech.grammarIssues.length > 0 && (
                  <div className="text-xs bg-amber-50 border border-amber-100 rounded p-2">
                    <p className="font-medium text-amber-800 mb-1">⚠️ 语法问题</p>
                    {llmSpeech.grammarIssues.map((g, i) => (
                      <p key={i} className="text-gray-700 mt-0.5">· {g}</p>
                    ))}
                  </div>
                )}

                {llmSpeech.suggestions.length > 0 && (
                  <div className="text-xs bg-green-50 border border-green-100 rounded p-2">
                    <p className="font-medium text-green-800 mb-1">💡 改进建议</p>
                    {llmSpeech.suggestions.map((s, i) => (
                      <p key={i} className="text-gray-700 mt-0.5">{i + 1}. {s}</p>
                    ))}
                  </div>
                )}

                {llmSpeech.sampleAnswer && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-purple-700 hover:underline">
                      查看示范回答
                    </summary>
                    <p className="text-gray-700 bg-gray-50 border border-gray-200 rounded p-2 mt-1">
                      {llmSpeech.sampleAnswer}
                    </p>
                  </details>
                )}
              </div>
            )}
          </div>
        )}


        {scoreResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">
              ✅ 评分结果
            </h4>
            
            <div className="space-y-4">
              {/* 分数 */}
              <div className="text-center">
                <div className={`text-4xl font-bold ${
                  scoreResult.score >= 80 ? 'text-green-500' :
                  scoreResult.score >= 60 ? 'text-blue-500' :
                  scoreResult.score >= 40 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {scoreResult.score}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  得分（满分 100）
                </div>
              </div>
              
              {/* 关键词匹配 */}
              <div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  关键词匹配：{scoreResult.matchedKeywords.length} / {currentPart1.keywords.length}
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentPart1.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className={`px-2 py-1 rounded text-xs ${
                        scoreResult.matchedKeywords.includes(kw)
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* 流利度 */}
              <div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  单词数：{scoreResult.wordCount} 词
                </div>
              </div>
              
              {/* 反馈 */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {scoreResult.feedback}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* 操作按钮 */}
        <div className="flex space-x-4">
          {(audioUrl || manualText.trim()) && !scoreResult && (
            <button
              onClick={handleScore}
              className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
            >
              ✅ 评分
            </button>
          )}
          
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
          >
            ➡️ 下一题
          </button>
        </div>
      </div>
    );
  };
  
  // ========== 渲染 Part 2 ==========
  const renderPart2 = () => {
    const q = currentPart2;
    
    return (
      <div className="space-y-6">
        {/* 题目卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                📋 图片讨论 {currentIndex + 1} / {speakingPart2.length}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                观察图片，回答讨论问题（建议回答 1-2 分钟）
              </p>
            </div>
          </div>
          
          {/* 图片（真实资源，加载失败显示占位）*/}
          {imgError ? (
            <div className="mt-4 p-8 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
              <div className="text-6xl mb-4">🖼️</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                图片加载失败：{q.imageUrl}
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <img
                src={`${import.meta.env.BASE_URL}${q.imageUrl}`}
                alt={`口语场景 ${q.id}`}
                className="w-full h-auto object-cover"
                onError={() => setImgError(true)}
              />
            </div>
          )}
        </div>
        
        {/* 讨论问题 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
            ❓ 讨论问题
          </h4>
          <ul className="space-y-3">
            {q.questions.map((question, i) => (
              <li key={i} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {i + 1}. {question}
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* 关键词提示 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
              💡 关键词提示
            </h4>
            <button
              onClick={() => setShowKeywords(!showKeywords)}
              className="text-xs text-blue-500 hover:text-blue-600 transition"
            >
              {showKeywords ? '隐藏' : '显示'}
            </button>
          </div>
          
          {showKeywords && (
            <div className="flex flex-wrap gap-2">
              {q.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* 回答建议 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
            📝 回答建议
          </h4>
          <ul className="space-y-2">
            {q.tips.map((tip, i) => (
              <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                • {tip}
              </li>
            ))}
          </ul>
        </div>
        
        {/* 录音区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">
            🎤 你的回答（1-2 分钟）
          </h4>
          
          <div className="flex flex-col items-center space-y-4">
            {/* 录音按钮 */}
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-32 h-32 rounded-full bg-red-500 hover:bg-red-600 text-white text-lg font-semibold shadow-lg transition transform hover:scale-105"
              >
                ⏺️ 开始录音
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-32 h-32 rounded-full bg-gray-700 hover:bg-gray-800 text-white text-lg font-semibold shadow-lg transition animate-pulse"
              >
                录音中...
                <br />
                <span className="text-sm">点击停止</span>
              </button>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              建议回答 1-2 分钟，覆盖所有讨论问题
            </p>
          </div>

          {/* 录音环境提示：国产浏览器/微信内置时给出可操作建议 */}
          {recorderNote && (
            <div className="mt-3 text-xs bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5 text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-0.5">🎙 录音环境提示</p>
              <p>{recorderNote}</p>
              {recorderCap === 'none' && (
                <p className="mt-1 text-amber-700 dark:text-amber-300">
                  提示：即使不能录音，也可以在下面用键盘输入回答，AI 依然能给出语法与内容批改。
                </p>
              )}
            </div>
          )}

          {/* 手动输入（语音识别不可用时的替代方案）*/}
          <div className="w-full mt-2">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              或用键盘输入你的回答：
            </label>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              rows={3}
              placeholder="在此输入英文回答，覆盖各个讨论问题。"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* 录音回放 */}
          {audioUrl && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  ✅ 录音完成
                </span>
                <button
                  onClick={playRecording}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition"
                >
                  ▶️ 回放
                </button>
              </div>
            </div>
          )}

          {/* 识别结果（真实语音识别）*/}
          <TranscriptPanel
            transcript={transcript}
            interim={transcriber.interim}
            error={transcriber.error}
            isRecording={isRecording}
          />

          {/* 评分结果 */}
        {/* ========== AI 口语评分（可选增强） ========== */}
        {(audioUrl || audioBlob) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-3">
            {!llmSpeech ? (
              <button
                onClick={handleAiScore}
                disabled={llmScoring || !llmStatus.available || (!audioBlob && !(transcript || manualText).trim())}
                className="w-full text-xs py-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {llmScoring
                  ? '🤖 AI 评分中…（转写 + 评分，约 10 秒）'
                  : !audioBlob && (transcript || manualText).trim()
                    ? '🤖 让 AI 评分（按你输入的文字评分）'
                  : llmStatus.available
                    ? '🤖 让 AI 评分（发音转写 + 内容/语法/流利度）'
                    : '🤖 AI 评分暂不可用（已用关键词评分）'}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-purple-700">🤖 AI 口语评分</p>
                  <div className="flex gap-2">
                    {[
                      { l: '内容', v: llmSpeech.contentScore, c: 'text-blue-600' },
                      { l: '语法', v: llmSpeech.grammarScore, c: 'text-green-600' },
                      { l: '流利', v: llmSpeech.fluencyScore, c: 'text-orange-600' },
                      { l: '词汇', v: llmSpeech.vocabularyScore, c: 'text-cyan-600' },
                    ].map((s) => (
                      <span key={s.l} className={`text-[11px] font-bold ${s.c}`}>{s.l} {s.v}</span>
                    ))}
                    <span className="text-xs font-bold text-purple-700">综合 {llmSpeech.score}</span>
                  </div>
                </div>

                {llmSpeech.transcript && (
                  <div className="text-xs bg-gray-50 border border-gray-200 rounded p-2">
                    <p className="font-medium text-gray-700 mb-1">
                      🎤 识别到的内容
                      {llmSpeech.asrSource === 'browser' && (
                        <span className="text-orange-500 font-normal">
                          （浏览器识别，可能有误；识别不准时语法判断也会受影响）
                        </span>
                      )}
                    </p>
                    <p className="text-gray-600">{llmSpeech.transcript}</p>
                  </div>
                )}

                {llmSpeech.feedback && (
                  <div className="text-xs bg-purple-50 border border-purple-100 rounded p-2">
                    <p className="font-medium text-purple-800 mb-1">总体评价</p>
                    <p className="text-gray-700">{llmSpeech.feedback}</p>
                  </div>
                )}

                {llmSpeech.grammarIssues.length > 0 && (
                  <div className="text-xs bg-amber-50 border border-amber-100 rounded p-2">
                    <p className="font-medium text-amber-800 mb-1">⚠️ 语法问题</p>
                    {llmSpeech.grammarIssues.map((g, i) => (
                      <p key={i} className="text-gray-700 mt-0.5">· {g}</p>
                    ))}
                  </div>
                )}

                {llmSpeech.suggestions.length > 0 && (
                  <div className="text-xs bg-green-50 border border-green-100 rounded p-2">
                    <p className="font-medium text-green-800 mb-1">💡 改进建议</p>
                    {llmSpeech.suggestions.map((s, i) => (
                      <p key={i} className="text-gray-700 mt-0.5">{i + 1}. {s}</p>
                    ))}
                  </div>
                )}

                {llmSpeech.sampleAnswer && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-purple-700 hover:underline">
                      查看示范回答
                    </summary>
                    <p className="text-gray-700 bg-gray-50 border border-gray-200 rounded p-2 mt-1">
                      {llmSpeech.sampleAnswer}
                    </p>
                  </details>
                )}
              </div>
            )}
          </div>
        )}


          {scoreResult && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">
                ✅ 评分结果
              </h4>

              <div className="space-y-4">
                {/* 分数 */}
                <div className="text-center">
                  <div className={`text-4xl font-bold ${
                    scoreResult.score >= 80 ? 'text-green-500' :
                    scoreResult.score >= 60 ? 'text-blue-500' :
                    scoreResult.score >= 40 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {scoreResult.score}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    得分（满分 100）
                  </div>
                </div>

                {/* 关键词匹配 */}
                <div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    关键词匹配：{scoreResult.matchedKeywords.length} / {q.keywords.length}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {q.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded text-xs ${
                          scoreResult.matchedKeywords.includes(kw)
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 流利度 */}
                <div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    单词数：{scoreResult.wordCount} 词
                  </div>
                </div>

                {/* 反馈 */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    {scoreResult.feedback}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-4">
          {(audioUrl || manualText.trim()) && !scoreResult && (
            <button
              onClick={handleScore}
              className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
            >
              ✅ 评分
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
          >
            ➡️ 下一题
          </button>
        </div>
      </div>
    );
  };
  
  // ========== 主渲染 ==========
  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition mb-2"
        >
          ← 返回首页
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          口语练习
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          KET 口语考试模拟练习
        </p>
      </div>

      {!transcriber.supported && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            ⚠️ 当前浏览器的语音识别不可用（多为国产手机浏览器或网络限制）。你可以直接在题目下方的输入框打字作答，评分与进度记录均正常可用。
          </p>
        </div>
      )}
      
      {/* Part 切换 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-1 flex">
        <button
          onClick={() => {
            setActivePart(1);
            setCurrentIndex(0);
            setAudioBlob(null);
            setAudioUrl(null);
            transcriber.reset();
            setImgError(false);
            setScoreResult(null);
            sessionStatsRef.current = { total: 0, correct: 0 };
            questionScoredRef.current = false;
            roundStartRef.current = Date.now();
          }}
          className={`flex-1 py-3 rounded-lg text-sm font-semibold transition ${
            activePart === 1
              ? 'bg-blue-500 text-white shadow'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Part 1: 回答问题
        </button>
        <button
          onClick={() => {
            setActivePart(2);
            setCurrentIndex(0);
            setAudioBlob(null);
            setAudioUrl(null);
            transcriber.reset();
            setImgError(false);
            setScoreResult(null);
            sessionStatsRef.current = { total: 0, correct: 0 };
            questionScoredRef.current = false;
            roundStartRef.current = Date.now();
          }}
          className={`flex-1 py-3 rounded-lg text-sm font-semibold transition ${
            activePart === 2
              ? 'bg-blue-500 text-white shadow'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Part 2: 看图讨论
        </button>
      </div>
      
      {/* 内容区域 */}
      {activePart === 1 ? renderPart1() : renderPart2()}
      
      {/* 提示信息 */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          💡 <strong>提示：</strong> 
          已接入浏览器内置语音识别（Web Speech API），需要联网才能将你的口语实时转为文字并自动评分。
          建议使用 Chrome 或 Edge 浏览器，并在弹窗中允许麦克风权限。标准答案播放使用预生成音频（手机/电脑发音一致）。
        </p>
      </div>
    </div>
  );
}
