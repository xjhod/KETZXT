import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { speakingPart1, speakingPart2 } from '../data/speaking';
import type { SpeakingPart1Question, SpeakingPart2Question } from '../types/speaking';
import { getCurrentUser } from '../utils/auth';

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
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // 停止当前播放
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // 稍慢
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } else {
    alert('您的浏览器不支持语音合成。请使用 Chrome 或 Edge 浏览器。');
  }
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
  const [transcript, setTranscript] = useState<string>('');
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [showKeywords, setShowKeywords] = useState(false);
  
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
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
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
        
        // 模拟语音识别（实际应接入 API）
        // 这里用 prompt 作为模拟转录
        if (activePart === 1) {
          setTranscript(`[模拟识别结果] 用户回答了关于"${currentPart1.questionZh}"的问题。实际使用时需要接入语音识别 API（如讯飞、Google）。`);
        } else {
          setTranscript(`[模拟识别结果] 用户描述了图片内容并回答了讨论问题。实际使用时需要接入语音识别 API。`);
        }
      };
      
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setScoreResult(null); // 清除之前的评分
    } catch (err) {
      console.error('无法访问麦克风：', err);
      alert('无法访问麦克风。请确保已授予麦克风权限。');
    }
  }, [activePart, currentIndex, currentPart1]);
  
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // 停止所有音轨
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  }, [isRecording]);
  
  // ========== 播放录音 ==========
  const playRecording = useCallback(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  }, [audioUrl]);
  
  // ========== 评分 ==========
  const handleScore = useCallback(() => {
    if (!transcript) {
      alert('请先录音并获取识别结果。');
      return;
    }
    
    const keywords = activePart === 1 ? currentPart1.keywords : currentPart2.keywords;
    const result = scoreAnswer(transcript, keywords);
    setScoreResult(result);
  }, [transcript, activePart, currentPart1, currentPart2]);
  
  // ========== 下一题 ==========
  const handleNext = useCallback(() => {
    setCurrentIndex(prev => prev + 1);
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscript('');
    setScoreResult(null);
    setShowKeywords(false);
    
    // 停止 TTS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);
  
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
              
              {/* 识别结果（模拟） */}
              {transcript && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <p className="text-xs text-yellow-800 dark:text-yellow-300 mb-1">
                    📝 识别结果（模拟）：
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {transcript}
                  </p>
                </div>
              )}
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
          {audioUrl && !scoreResult && (
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
          
          {/* 图片占位符 */}
          <div className="mt-4 p-8 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              图片：{q.imageUrl}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              （实际使用时将显示图片）
            </p>
          </div>
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
        </div>
        
        {/* 操作按钮 */}
        <div className="flex space-x-4">
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
      
      {/* Part 切换 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-1 flex">
        <button
          onClick={() => {
            setActivePart(1);
            setCurrentIndex(0);
            setAudioBlob(null);
            setAudioUrl(null);
            setTranscript('');
            setScoreResult(null);
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
            setTranscript('');
            setScoreResult(null);
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
          当前使用浏览器内置语音合成（TTS）。录音识别功能需要接入语音识别 API（如讯飞、Google）才能获得真实结果。
          标准答案播放使用浏览器的语音合成功能，可能在部分浏览器中不支持。
        </p>
      </div>
    </div>
  );
}
