import { useState, useRef, useEffect } from 'react';
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
  type LlmStatus,
  type LlmSpeechResult,
} from '../utils/llm';
import { scoreAnswer, type ScoreResult } from '../utils/speakingScore';
import {
  type SpeechEvidence,
  type AsrSource,
  EVIDENCE_TTL_DAYS,
  listSpeechEvidence,
  putSpeechEvidence,
  patchSpeechEvidence,
  pruneSpeechEvidence,
  clearSpeechEvidence,
  getSpeechEvidence,
  speechEvidenceAvailable,
} from '../utils/speechEvidence';


const ASR_SOURCE_LABEL: Record<AsrSource, string> = {
  browser: '浏览器识别（未修改）',
  edited: '浏览器识别后已由你改正',
  manual: '键盘输入',
  none: '无文字',
};

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
            📝 原始识别（可能有错，请在下方确认框改正）：
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
            点击下方「开始录音」后说出你的回答；识别结果会进入下方确认框，可先改正再评分。
          </p>
        </div>
      )}
    </div>
  );
}

// ========== 主组件 ==========
export default function SpeakingPage() {
  const navigate = useNavigate();
  
  // ========== 状态 ==========
  const [activePart, setActivePart] = useState<1 | 2>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [llmStatus, setLlmStatus] = useState<LlmStatus>({ available: false, llm: false, asr: false });
  const [llmSpeech, setLlmSpeech] = useState<LlmSpeechResult | null>(null);
  const [llmScoring, setLlmScoring] = useState(false);
  /** AI 评分失败的原因（给用户看的提示） */
  const [llmError, setLlmError] = useState<string | null>(null);
  const [showKeywords, setShowKeywords] = useState(false);
  const [imgError, setImgError] = useState(false);
  /** 唯一送进评分的文字：ASR 结果自动填入，孩子可改；也支持纯键盘输入 */
  const [answerText, setAnswerText] = useState('');
  const answerEditedRef = useRef(false);
  const [recorderCap, setRecorderCap] = useState<RecorderCapability>('mediarecorder');
  const [recorderNote, setRecorderNote] = useState('');
  const [evidenceList, setEvidenceList] = useState<SpeechEvidence[]>([]);
  const [evidenceNote, setEvidenceNote] = useState('');
  const [flagged, setFlagged] = useState(false);

  const transcriber = useSpeechTranscriber();
  const transcript = transcriber.transcript;
  const upsertAnswer = useProgressStore((s) => s.upsertAnswer);
  const recordSession = useProgressStore((s) => s.recordSession);

  const sessionStatsRef = useRef({ total: 0, correct: 0 });
  const questionScoredRef = useRef(false);
  const roundStartRef = useRef(Date.now());
  /** 一次答题一个固定 id：离线参考分与 AI 分写同一条进度记录、同一条本机证据 */
  const answerIdRef = useRef('');
  const lastCorrectRef = useRef<boolean | null>(null);
  const recorderHandleRef = useRef<RecorderHandle | null>(null);
  const recordingAudioRef = useRef<HTMLAudioElement | null>(null);

  const TOTAL = activePart === 1 ? speakingPart1.length : speakingPart2.length;
  const currentPart1 = speakingPart1[currentIndex % speakingPart1.length];
  const currentPart2 = speakingPart2[currentIndex % speakingPart2.length];
  const currentQuestion = activePart === 1 ? currentPart1 : currentPart2;
  const keywords = currentQuestion.keywords;

  // ASR 最终文本自动填入确认框；孩子一旦手动改过就不再覆盖
  useEffect(() => {
    const t = transcript.trim();
    if (t && !answerEditedRef.current) setAnswerText(t);
  }, [transcript]);

  useEffect(() => {
    let alive = true;
    fetchLlmStatus().then((s) => { if (alive) setLlmStatus(s); });
    return () => { alive = false; };
  }, []);

  // 本机证据：启动时清掉 7 天前的旧录音，并载入复核列表
  useEffect(() => {
    let alive = true;
    void (async () => {
      await pruneSpeechEvidence();
      const list = await listSpeechEvidence();
      if (alive) setEvidenceList(list);
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  // ========== 录音与评分 ==========
  function ensureAnswerId(): string {
    if (!answerIdRef.current) answerIdRef.current = `speaking-${currentQuestion.id}-${Date.now()}`;
    return answerIdRef.current;
  }

  function asrSource(): AsrSource {
    if (!transcript.trim()) return answerText.trim() ? 'manual' : 'none';
    return answerEditedRef.current ? 'edited' : 'browser';
  }

  /** 送进 LLM 的题目：Part 1 用英文原题；Part 2 带齐 3 个讨论问题与作答提示 */
  function questionTextFor(): string {
    if (activePart === 1) return currentPart1.question;
    return `${currentPart2.questions.join(' / ')}（作答提示：${currentPart2.tips.join('；')}）`;
  }

  /** 一次答题只记一条：AI 分回来后覆盖同一 id，错题本里不出现两条矛盾分数 */
  function writeRecord(score: number, source: 'local' | 'llm') {
    const isCorrect = score >= 60;
    upsertAnswer({
      id: ensureAnswerId(),
      module: 'speaking',
      exerciseType: activePart === 1 ? 'speaking_p1' : 'speaking_p2',
      subjectId: currentQuestion.id,
      subjectName: `口语 Part ${activePart}`,
      questionId: currentQuestion.id,
      questionText: questionTextFor(),
      userAnswer: answerText.trim(),
      correctAnswer: keywords.join('、'),
      isCorrect,
      score,
      scoreSource: source,
    });
    if (!questionScoredRef.current) {
      sessionStatsRef.current.total += 1;
      questionScoredRef.current = true;
    }
    const delta = (isCorrect ? 1 : 0) - (lastCorrectRef.current ? 1 : 0);
    sessionStatsRef.current.correct = Math.max(0, sessionStatsRef.current.correct + delta);
    lastCorrectRef.current = isCorrect;
  }

  /** 本机证据：同 id 合并；音频只存本机，绝不进 sync payload */
  async function saveEvidence(patch: Partial<SpeechEvidence>) {
    if (!speechEvidenceAvailable()) return;
    const id = ensureAnswerId();
    const now = new Date().toISOString();
    const prev = await getSpeechEvidence(id);
    const base: SpeechEvidence = prev ?? {
      id, questionId: currentQuestion.id, part: activePart,
      createdAt: now, updatedAt: now,
      audio: audioBlob ?? null,
      audioMime: audioBlob?.type || '',
      audioBytes: audioBlob?.size || 0,
      rawTranscript: transcript.trim(),
      asrSource: asrSource(),
      confirmedText: answerText.trim(),
      score: null, scoreSource: null, modelId: null, llmResult: null, flagged: false,
    };
    await putSpeechEvidence({ ...base, ...patch, id, updatedAt: now, confirmedText: answerText.trim() });
    setEvidenceList(await listSpeechEvidence());
  }

  async function startRecording() {
    setRecorderNote(recorderHint());
    try {
      const handle = await startRecorderCapture();
      recorderHandleRef.current = handle;
      setRecorderCap(handle === null ? 'none' : detectRecorderCapability());
      setIsRecording(true);
      setScoreResult(null);
      setLlmSpeech(null);
      setLlmError(null);
      setAnswerText('');
      setFlagged(false);
      answerEditedRef.current = false;
      answerIdRef.current = '';
      // 不重置 lastCorrectRef：同一题重录属于新一次尝试，但会话计数仍按「一题一次」计，
      // 重置会让 correct 重复累加、甚至超过 total。
      setEvidenceNote('');
      // 浏览器自带识别在国产安卓上必然失败，这里失败不影响录音（P1 云端 ASR 兜底）
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
  }

  async function stopRecording() {
    const handle = recorderHandleRef.current;
    if (handle && isRecording) {
      setIsRecording(false);
      try {
        const { blob, capability } = await handle.stop();
        recorderHandleRef.current = null;
        setRecorderCap(capability);
        // 微信内置浏览器等环境下 MediaRecorder 可能不报错却录不到声音
        if (blob.size < 1000) {
          setRecorderNote(
            '这次没有录到声音（部分浏览器会静默失败）。请重试，或改用下面的确认框输入 —— ' +
            '用键盘输入同样能得到 AI 的语法与内容批改。'
          );
          return;
        }
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      } catch (e) {
        console.error('录音结束失败：', e);
      }
    }
    transcriber.stop();
  }

  function playRecording() {
    if (!audioUrl) return;
    stopAllAudio();
    if (recordingAudioRef.current) {
      recordingAudioRef.current.pause();
      recordingAudioRef.current.currentTime = 0;
    }
    const audio = new Audio(audioUrl);
    recordingAudioRef.current = audio;
    void audio.play().catch(() => setRecorderNote('录音回放失败，请重试'));
  }

  /** AI 评分：只吃确认框里的定稿文字，成功后升级同一条进度记录 */
  async function handleAiScore() {
    const textOnly = answerText.trim();
    if (!textOnly || llmScoring) return;
    setLlmScoring(true);
    try {
      const res = await gradeSpeechWithLLM({
        question: questionTextFor(),
        keywords,
        modelAnswer: activePart === 1 ? currentPart1.modelAnswer : undefined,
        browserTranscript: textOnly,
      });
      if (!res.ok) {
        console.warn('[LLM] 口语评分降级：', res.reason);
        setLlmError(res.reason);
        return;
      }
      setLlmError(null);
      setLlmSpeech(res.data);
      writeRecord(res.data.score, 'llm');
      await saveEvidence({
        score: res.data.score,
        scoreSource: 'llm',
        modelId: res.data.modelId ?? null,
        llmResult: res.data,
      });
    } catch (e) {
      console.warn('[LLM] 口语评分异常，降级：', e);
      setLlmError(`AI 评分失败：${(e as Error).message || '请稍后重试'}`);
    } finally {
      setLlmScoring(false);
    }
  }

  /** 离线参考分：确定性、可测，AI 评分成功后自动让位 */
  function handleScore() {
    const answer = answerText.trim();
    if (!answer) {
      alert('请先在确认框里写出你的英文回答，再评分。');
      return;
    }
    const result = scoreAnswer(answer, keywords);
    setScoreResult(result);
    writeRecord(result.score, 'local');
    void saveEvidence({ score: result.score, scoreSource: 'local' });
  }

  function handleReScore() {
    setLlmSpeech(null);
    setLlmError(null);
    void handleAiScore();
  }

  async function handleFlagWrong() {
    // 只改标记位，避免把整段音频重新结构化克隆一次
    const patched = await patchSpeechEvidence(ensureAnswerId(), { flagged: true });
    if (!patched) await saveEvidence({ flagged: true });
    setEvidenceList(await listSpeechEvidence());
    setFlagged(true);
    setEvidenceNote('已标记「我觉得评错了」，可在本机记录里回听复核。');
  }

  async function playEvidenceAudio(id: string) {
    const rec = await getSpeechEvidence(id);
    if (!rec?.audio) {
      setEvidenceNote('这条没有录音（当时是键盘输入）。');
      return;
    }
    stopAllAudio();
    const url = URL.createObjectURL(rec.audio);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    void audio.play().catch(() => {
      URL.revokeObjectURL(url);
      setEvidenceNote('这条录音无法播放。');
    });
  }

  async function clearAllEvidence() {
    if (!window.confirm('确定清除本机全部录音与评分记录吗？此操作不可恢复。')) return;
    await clearSpeechEvidence();
    setEvidenceList([]);
    setEvidenceNote('本机录音已全部清除。');
  }

  /** 换题 / 换 Part 时把所有评分态一次清干净（修上一题分数残留） */
  function resetQuestionState() {
    setAudioBlob(null);
    setAudioUrl(null);
    transcriber.reset();
    setAnswerText('');
    answerEditedRef.current = false;
    answerIdRef.current = '';
    lastCorrectRef.current = null;
    setScoreResult(null);
    setLlmSpeech(null);
    setLlmError(null);
    setFlagged(false);
    setShowKeywords(false);
    setImgError(false);
    setEvidenceNote('');
    setRecorderNote('');
    questionScoredRef.current = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function handleNext() {
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
      sessionStatsRef.current = { total: 0, correct: 0 };
      roundStartRef.current = Date.now();
    }
    setCurrentIndex(nextIndex);
    resetQuestionState();
  }

  /** 两处 Part 共用的评分面板：一个分数口径 + 复核入口 */
  const renderAiPanel = () => {
    if (!(audioUrl || audioBlob || answerText.trim())) return null;
    return (
      <div>
        {(audioUrl || audioBlob) && !answerText.trim() && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-3 text-xs text-amber-800 dark:text-amber-200">
            ⚠️ 录音已完成，但浏览器没能识别出文字（国产手机浏览器常见）。请在上面的确认框打出你说的英文，再点「✅ 评分」。
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-3">
          {!llmSpeech ? (
            <>
              <button
                onClick={handleAiScore}
                disabled={llmScoring || !llmStatus.available || !answerText.trim()}
                className="w-full text-xs py-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {llmScoring
                  ? '🤖 AI 评分中…（约 10 秒）'
                  : !llmStatus.available
                    ? '🤖 AI 评分暂不可用（已用离线参考分）'
                    : !answerText.trim()
                      ? '🤖 先在上方输入回答文字，再让 AI 评分'
                      : '🤖 让 AI 评分（按你确认的文字评分）'}
              </button>
              {llmError && (
                <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">{llmError}</p>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <p className="text-xs font-bold text-purple-700">🤖 AI 口语评分（本次正式分数）</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { l: '内容', v: llmSpeech.contentScore, c: 'text-blue-600' },
                    { l: '语法', v: llmSpeech.grammarScore, c: 'text-green-600' },
                    { l: '词汇', v: llmSpeech.vocabularyScore, c: 'text-cyan-600' },
                  ].map((s) => (
                    <span key={s.l} className={`text-[11px] font-bold ${s.c}`}>{s.l} {s.v}</span>
                  ))}
                  <span className="text-xs font-bold text-purple-700">综合 {llmSpeech.score}</span>
                </div>
              </div>

              <div className="text-xs bg-gray-50 border border-gray-200 rounded p-2">
                <p className="font-medium text-gray-700 mb-1">📝 本次评分依据的文字（你确认过的）</p>
                <p className="text-gray-600 break-words">{answerText}</p>
                <p className="mt-1 text-[11px] text-gray-500">
                  来源：{ASR_SOURCE_LABEL[asrSource()]} · 发音、语调、互动交流未评估
                  {llmSpeech.modelId ? ` · 模型 ${llmSpeech.modelId}` : ''}
                </p>
              </div>

              {scoreResult && (
                <p className="text-[11px] text-gray-500">
                  内容覆盖：命中 {scoreResult.matchedKeywords.length} / {keywords.length} 个信息点 · 不同词 {scoreResult.distinctWordCount} 个（共 {scoreResult.wordCount} 词）
                </p>
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
                  <summary className="cursor-pointer text-purple-700 hover:underline">查看示范回答</summary>
                  <p className="text-gray-700 bg-gray-50 border border-gray-200 rounded p-2 mt-1">{llmSpeech.sampleAnswer}</p>
                </details>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={playRecording}
                  disabled={!audioUrl}
                  className="px-2 py-1 text-[11px] rounded border border-blue-200 text-blue-600 disabled:opacity-40"
                >▶️ 回听录音</button>
                <button
                  onClick={handleReScore}
                  disabled={llmScoring}
                  className="px-2 py-1 text-[11px] rounded border border-purple-200 text-purple-700 disabled:opacity-40"
                >🔁 重新评分</button>
                <button
                  onClick={() => void handleFlagWrong()}
                  className="px-2 py-1 text-[11px] rounded border border-amber-200 text-amber-700"
                >{flagged ? '已标记评错' : '我觉得评错了'}</button>
              </div>
              {evidenceNote && <p className="text-[11px] text-amber-600">{evidenceNote}</p>}
            </div>
          )}
        </div>
      </div>
    );
  };

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
              请确认你所说的英文（识别可能有错，可以直接改正；也可以直接在这里打字）：
            </label>
            <textarea
              value={answerText}
              onChange={(e) => { setAnswerText(e.target.value); answerEditedRef.current = true; }}
              rows={3}
              placeholder="在此确认或输入英文回答，例如：I like playing football with my friends."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="mt-1 text-[11px] text-gray-400">评分只依据这个框里的文字；改正识别错误后再评分更准确。</p>
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
        {renderAiPanel()}

        {scoreResult && !llmSpeech && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">
              ✅ 离线参考分（AI 评分后自动替换）
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
                  不同词数：{scoreResult.distinctWordCount} 个（共 {scoreResult.wordCount} 词）
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
          {answerText.trim() && !scoreResult && !llmSpeech && (
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
              请确认你所说的英文（识别可能有错，可以直接改正；也可以直接在这里打字）：
            </label>
            <textarea
              value={answerText}
              onChange={(e) => { setAnswerText(e.target.value); answerEditedRef.current = true; }}
              rows={3}
              placeholder="在此确认或输入英文回答，覆盖各个讨论问题。"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="mt-1 text-[11px] text-gray-400">评分只依据这个框里的文字；改正识别错误后再评分更准确。</p>
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
        {renderAiPanel()}

        {scoreResult && !llmSpeech && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">
                ✅ 离线参考分（AI 评分后自动替换）
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
                    不同词数：{scoreResult.distinctWordCount} 个（共 {scoreResult.wordCount} 词）
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
          {answerText.trim() && !scoreResult && !llmSpeech && (
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
            resetQuestionState();
            sessionStatsRef.current = { total: 0, correct: 0 };
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
            resetQuestionState();
            sessionStatsRef.current = { total: 0, correct: 0 };
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
      
      {/* 本机录音与评分记录：仅存此设备，不进云同步 */}
      <details className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-200">
          📼 本机录音与评分记录（{evidenceList.length}）· 仅存此设备，{EVIDENCE_TTL_DAYS} 天后自动清除
        </summary>
        <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
          录音只保存在这台设备，不上传云端、不随跨设备同步。可回听复核分数；觉得评错了可标记，作为后续校准依据。
        </p>
        {evidenceList.length === 0 ? (
          <p className="mt-2 text-xs text-gray-400">暂无记录。</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {evidenceList.map((e) => (
              <li key={e.id} className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-gray-700 dark:text-gray-200 break-words">
                    {new Date(e.createdAt).toLocaleString('zh-CN', { hour12: false })} · Part {e.part} · {e.questionId}
                    {' · '}{e.score === null ? '未评分' : `${e.score} 分（${e.scoreSource === 'llm' ? 'AI 评分' : '离线参考分'}）`}
                    {e.flagged && ' · ⚠️ 已标记评错'}
                  </span>
                  <button
                    onClick={() => void playEvidenceAudio(e.id)}
                    disabled={!e.audio}
                    className="px-2 py-1 rounded border border-blue-200 text-blue-600 disabled:opacity-40"
                  >▶️ 回听</button>
                </div>
                {e.rawTranscript !== e.confirmedText && (
                  <p className="mt-1 text-[11px] text-gray-500 break-words">原始识别：{e.rawTranscript || '（无）'}</p>
                )}
                <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-300 break-words">定稿：{e.confirmedText || '（无）'}</p>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <button onClick={() => void clearAllEvidence()} className="text-[11px] text-red-600 underline">清除本机全部录音</button>
          {evidenceNote && <span className="text-[11px] text-amber-600">{evidenceNote}</span>}
        </div>
      </details>

      {/* 提示信息 */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          💡 <strong>提示：</strong> 
          评分基于确认框里的文字内容（评内容、语法、词汇），发音、语调与互动交流未评估。
          录音后识别结果会自动填入确认框，请先改正识别错误再评分；部分国产手机浏览器识别不可用，此时直接在确认框打字也能评分。本机录音仅存此设备、7 天后自动清除。
        </p>
      </div>
    </div>
  );
}
