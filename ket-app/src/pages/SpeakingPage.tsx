import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { speakingPart1, speakingPart2 } from '../data/speaking';
import type { SpeakingPart1Question, SpeakingPart2Question } from '../types/speaking';
import { getCurrentUser } from '../utils/auth';
import { useSpeechTranscriber } from '../hooks/useSpeechTranscriber';
import { useProgressStore } from '../store/useProgressStore';

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

// ========== TTS 播放标准答案 ==========
function playModelAnswer(text: string): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
    window.speechSynthesis.cancel(); // 停止当前播放
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // 稍慢
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }
  // 不支持语音合成时静默（发音按钮已通过 AudioButton 提示）
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
  const user = getCurrentUser();
  
  // 状态
  const [activePart, setActivePart] = useState<1 | 2>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [showKeywords, setShowKeywords] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [manualText, setManualText] = useState('');

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
  
  // 录音相关
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  
  // 当前题目
  const currentPart1 = speakingPart1[currentIndex % speakingPart1.length];
  const currentPart2 = speakingPart2[currentIndex % speakingPart2.length];
  
  // ========== 录音功能 ==========
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // 兼容不同浏览器支持的录音格式（部分国产浏览器不支持 audio/webm）
      let mimeType = '';
      const candidateTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
      if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
        for (const t of candidateTypes) {
          if (MediaRecorder.isTypeSupported(t)) { mimeType = t; break; }
        }
      }
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // 创建播放 URL
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        // 真实识别结果由 transcriber 提供，不再使用模拟转录
      };
      
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setScoreResult(null); // 清除之前的评分
      transcriber.start();  // 启动真实语音识别（与录音并行）
    } catch (err) {
      console.error('无法访问麦克风：', err);
      alert('无法访问麦克风。请确保已授予麦克风权限。');
    }
  }, [activePart, currentIndex, currentPart1, transcriber]);
  
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // 停止所有音轨
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    transcriber.stop(); // 停止语音识别，保留最终转录文本
  }, [isRecording, transcriber]);
  
  // ========== 播放录音 ==========
  const playRecording = useCallback(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  }, [audioUrl]);
  
  // ========== 评分 ==========
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
        : (currentPart2.questions[0] || currentPart2.prompts[0] || q.id);

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
            onClick={() => playModelAnswer(q.modelAnswer)}
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
                src={q.imageUrl}
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
          已接入浏览器内置语音识别（Web Speech API），无需联网即可将你的口语实时转为文字并自动评分。
          建议使用 Chrome 或 Edge 浏览器，并在弹窗中允许麦克风权限。标准答案播放使用浏览器语音合成。
        </p>
      </div>
    </div>
  );
}
