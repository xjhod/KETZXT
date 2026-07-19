import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { part1Sets, part2Sets, part3Sets, part4Sets, part5Sets } from '../data/listening';
import { useProgressStore } from '../store/useProgressStore';
import type { ListeningPart1Set, ListeningPart2Set, ListeningPart3Set, ListeningPart3Question, ListeningPart4Set, ListeningPart4Option, ListeningPart5Set } from '../types';
import { audioFileUrl, playAudioEl, speakText, stopAllAudio, ttsFallbackAllowed, isAndroidDevice } from '../utils/audio';

// ========== 语音合成播放（带 Audio fallback，兼容移动端）==========
if (typeof window !== 'undefined' && window.speechSynthesis) {
  // 触发浏览器异步加载语音列表（部分浏览器首屏不立即就绪）
  window.speechSynthesis.getVoices();
}

// ========== 优先播放预生成音频文件（已修复子路径 404），缺失时回退系统 TTS ==========
function playAudioFile(id: string, fallbackText: string, rate = 0.9): Promise<void> {
  // Android Chrome 的 speechSynthesis 走本地 TTS 引擎（离线可用，不被墙），
  // 因此允许 mp3 失败时回退 TTS 朗读（被墙的是 SpeechRecognition/ASR）。
  const fallback = ttsFallbackAllowed() ? fallbackText : '';
  return new Promise((resolve) => {
    let settled = false;
    const once = () => { if (!settled) { settled = true; resolve(); } };
    playAudioEl(audioFileUrl(id), rate).then((ok) => {
      if (ok) {
        once();
      } else if (fallback) {
        // 文件缺失/加载失败：回退系统 TTS（speakText 自带看门狗）
        speakText(fallback, { rate, onEnd: once });
      } else {
        once();
      }
    });
  });
}

// ========== Part 1 练习视图 ==========
function Part1Practice({ set, onBack }: { set: ListeningPart1Set; onBack: () => void }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const { recordAnswer, recordSession } = useProgressStore();
  const correctCountRef = useRef(0);

  // ✅ 存储每个题目的打乱后选项（只在初始化时打乱一次）
  const [shuffledMap, setShuffledMap] = useState<Record<string, string[]>>({});
  useEffect(() => {
    const map: Record<string, string[]> = {};
    set.questions.forEach(q => {
      if (q.options) {
        const arr = [...q.options];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        map[q.id] = arr;
      }
    });
    setShuffledMap(map);
  }, [set.id]); // 只在套题变化时重新计算

  // ✅ 离开页面（返回列表/主页）时停止音频，避免后台继续播放
  useEffect(() => {
    return () => { stopAllAudio(); };
  }, []);

  const startTime = useRef(Date.now());

  if (!set?.questions || set.questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">套题数据为空</p>
        <button onClick={onBack} className="mt-3 text-blue-600 hover:underline text-sm">返回</button>
      </div>
    );
  }

  // ✅ 防止 idx 越界导致 q 为 undefined
  const q = set.questions[idx];

  // ✅ 使用 shuffledMap 显示打乱后的选项
  const displayOptions = q ? shuffledMap[q.id] || q.options || [] : [];

  // ✅ 所有 hooks 必须在条件返回之前调用，避免 #300
  const playQuestion = async () => {
    if (!q) return;
    setIsPlaying(true);
    await playAudioFile(q.id, q.audioText, 0.85);
    setIsPlaying(false);
  };
  // 安卓 Chrome 自动播放策略会拦截无手势的 play()，回退 TTS 在安卓又不可用，
  // 因此安卓上不自动播放，改为让用户点击「播放听力」按钮（有手势，可正常播音）。
  useEffect(() => { if (!isAndroidDevice()) playQuestion(); }, [idx]);

  const handleSubmit = () => {
    if (!selected || !q) return;
    const selectedOriginalIndex = q.options.indexOf(selected);
    const correctAnswerIndex = q.answer.charCodeAt(0) - 65;
    const correct = selectedOriginalIndex === correctAnswerIndex;
    recordAnswer({
      module: 'listening',
      exerciseType: 'Part1-' + set.id,
      subjectId: set.id,
      subjectName: set.titleZh,
      questionId: q.id,
      questionText: q.audioText,
      userAnswer: selected,
      correctAnswer: q.options[correctAnswerIndex],
      isCorrect: correct,
    });
    if (correct) correctCountRef.current++;
    setSubmitted(true);
  };

  const isLast = idx >= set.questions.length - 1;

  const goNext = () => {
    if (isLast) { setSessionDone(true); return; }
    setSelected('');
    setSubmitted(false);
    setIdx(idx + 1);
  };

  useEffect(() => {
    if (submitted && isLast) {
      recordSession({
        module: 'listening',
        exerciseType: 'Part1-' + set.id,
        subjectId: set.id,
        subjectName: set.titleZh,
        correct: correctCountRef.current,
        total: set.questions.length,
        duration: Math.round((Date.now() - startTime.current) / 1000),
      });
    }
  }, [submitted, isLast]);

  // ✅ 练习完成后显示成绩总结（在所有 hooks 之后）
  if (sessionDone) {
    const total = set.questions.length;
    const correct = correctCountRef.current;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const color = pct >= 80 ? '#16a34a' : pct >= 50 ? '#eab308' : '#dc2626';
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="text-blue-600 text-sm hover:underline">返回列表</button>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm text-gray-500">Part 1 · {set.titleZh}</span>
        </div>
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-md mx-auto">
          <p className="text-4xl mb-2">{pct >= 80 ? '\u{1F389}' : pct >= 50 ? '\u{1F44D}' : '\u{1F4AA}'}</p>
          <p className="text-3xl font-bold mb-2" style={{ color }}>{correct} / {total}</p>
          <p className="text-gray-500 text-sm mb-6">{pct >= 80 ? '\u5F88\u68D2\uFF01\u542C\u529B\u80FD\u529B\u5F88\u5F3A\uFF01' : pct >= 50 ? '\u4E0D\u9519\uFF0C\u7EE7\u7EED\u52A0\u6CB9\uFF01' : '\u591A\u542C\u51E0\u904D\uFF0C\u4E0B\u6B21\u4F1A\u66F4\u597D\uFF01'}</p>
          <button onClick={() => { setIdx(0); setSelected(''); setSubmitted(false); setSessionDone(false); correctCountRef.current = 0; startTime.current = Date.now(); }} className="btn-primary mr-3">\u518D\u7EC3\u4E00\u6B21</button>
          <button onClick={onBack} className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-all font-medium">\u8FD4\u56DE\u5217\u8868</button>
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">返回列表</button>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-500">Part 1 · {set.titleZh}</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
        <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${((idx + 1) / set.questions.length) * 100}%` }} />
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-6 text-center">
        <div className="text-6xl mb-3">{q.imageEmoji}</div>

        {/* 播放按钮 - 简洁风格 */}
        <div className="mb-4 flex justify-center">
          <button onClick={playQuestion} disabled={isPlaying} className={`btn-primary mb-4 ${isPlaying ? 'animate-pulse' : ''}`}>
            {isPlaying ? '播放中...' : '🔊 播放听力'}
          </button>
        </div>

        {!submitted && (
          <div className="flex justify-center gap-3 flex-wrap">
            {displayOptions.map((opt: string, i: number) => {
              const label = String.fromCharCode(65 + i);
              const isSelected = selected === opt; // 比较选项文本
              return (
                <button key={i} onClick={() => setSelected(opt)} className={`px-4 py-3 rounded-xl border-2 transition-all ${
                  isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                }`}>
                  <span className="font-bold text-purple-600">{label}. </span>{opt}
                </button>
              );
            })}
          </div>
        )}

        {!submitted && (
          <button onClick={handleSubmit} disabled={!selected} className="btn-primary mt-4 disabled:opacity-40">确认答案</button>
        )}

        {submitted && (
          <div className="mt-4 p-3 rounded-xl bg-gray-50 text-left">
            <p className={`font-bold ${selected && q.options.indexOf(selected) === q.answer.charCodeAt(0) - 65 ? 'text-green-600' : 'text-red-600'}`}>
              {selected && q.options.indexOf(selected) === q.answer.charCodeAt(0) - 65 ? '正确！' : '答错了'}
            </p>
            <p className="text-sm text-gray-600 mt-1">正确答案：<b>{q.options[q.answer.charCodeAt(0) - 65]}</b></p>
            <p className="text-xs text-gray-400 mt-2">原文：{q.transcript}</p>
            <button onClick={goNext} className="btn-primary mt-3">
              {isLast ? '查看结果' : '下一题'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== Part 4 练习视图（图片选择题 / KET 标准）==========
function Part4Practice({ set, onBack }: { set: ListeningPart4Set; onBack: () => void }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const correctCountRef = useRef(0);
  const startTime = useRef(Date.now());
  const { recordAnswer, recordSession } = useProgressStore();

  // ✅ 离开页面时停止音频，避免后台继续播放
  useEffect(() => {
    return () => { stopAllAudio(); };
  }, []);

  if (!set?.questions || set.questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">套题数据为空</p>
        <button onClick={onBack} className="mt-3 text-blue-600 hover:underline text-sm">返回</button>
      </div>
    );
  }

  const q = set.questions[idx];

  // 选项（图片）顺序打乱，每套仅计算一次
  const [shuffledMap, setShuffledMap] = useState<Record<string, ListeningPart4Option[]>>({});
  useEffect(() => {
    const map: Record<string, ListeningPart4Option[]> = {};
    set.questions.forEach(qq => {
      const arr = [...qq.options];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      map[qq.id] = arr;
    });
    setShuffledMap(map);
  }, [set.id]);

  const displayOptions = q ? (shuffledMap[q.id] || q.options || []) : [];
  const correctOriginalIndex = q ? q.answer.charCodeAt(0) - 65 : 0;

  const playQuestion = async () => {
    if (!q) return;
    setIsPlaying(true);
    await playAudioFile(q.id, q.audioText, 0.9);
    setIsPlaying(false);
  };
  useEffect(() => { setSelected(null); setSubmitted(false); if (!isAndroidDevice()) playQuestion(); }, [idx]);

  const handleSubmit = () => {
    if (selected === null || !q) return;
    const chosen = displayOptions[selected];
    const selectedOriginalIndex = q.options.indexOf(chosen);
    const correct = selectedOriginalIndex === correctOriginalIndex;
    recordAnswer({
      module: 'listening', exerciseType: 'Part4-' + set.id,
      subjectId: set.id, subjectName: set.titleZh,
      questionId: q.id, questionText: q.question,
      userAnswer: chosen.emoji + ' ' + chosen.desc,
      correctAnswer: q.options[correctOriginalIndex].emoji + ' ' + q.options[correctOriginalIndex].desc,
      isCorrect: correct,
    });
    if (correct) correctCountRef.current++;
    setSubmitted(true);
  };

  const isLast = idx >= set.questions.length - 1;
  const goNext = () => {
    if (isLast) { setSessionDone(true); return; }
    setIdx(idx + 1);
  };
  useEffect(() => {
    if (submitted && isLast) {
      recordSession({
        module: 'listening', exerciseType: 'Part4-' + set.id,
        subjectId: set.id, subjectName: set.titleZh,
        correct: correctCountRef.current,
        total: set.questions.length,
        duration: Math.round((Date.now() - startTime.current) / 1000),
      });
    }
  }, [submitted, isLast]);

  if (sessionDone) {
    const total = set.questions.length;
    const correct = correctCountRef.current;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const color = pct >= 80 ? '#16a34a' : pct >= 50 ? '#eab308' : '#dc2626';
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="text-blue-600 text-sm hover:underline">返回列表</button>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm text-gray-500">Part 4 · {set.titleZh}</span>
        </div>
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-md mx-auto">
          <p className="text-4xl mb-2">{pct >= 80 ? '\u{1F389}' : pct >= 50 ? '\u{1F44D}' : '\u{1F4AA}'}</p>
          <p className="text-3xl font-bold mb-2" style={{ color }}>{correct} / {total}</p>
          <p className="text-gray-500 text-sm mb-6">{pct >= 80 ? '\u5F88\u68D2\uFF01\u542C\u529B\u80FD\u529B\u5F88\u5F3A\uFF01' : pct >= 50 ? '\u4E0D\u9519\uFF0C\u7EE7\u7EED\u52A0\u6CB9\uFF01' : '\u591A\u542C\u51E0\u904D\uFF0C\u4E0B\u6B21\u4F1A\u66F4\u597D\uFF01'}</p>
          <button onClick={() => { setIdx(0); setSelected(null); setSubmitted(false); setSessionDone(false); correctCountRef.current = 0; startTime.current = Date.now(); }} className="btn-primary mr-3">\u518D\u7EC3\u4E00\u6B21</button>
          <button onClick={onBack} className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-all font-medium">\u8FD4\u56DE\u5217\u8868</button>
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">返回列表</button>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-500">Part 4 · {set.titleZh}</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
        <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${((idx + 1) / set.questions.length) * 100}%` }} />
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-6 text-center">
        <p className="text-xs text-gray-400 mb-2">{q.speakerA} &amp; {q.speakerB}</p>

        <div className="mb-4 flex justify-center">
          <button onClick={playQuestion} disabled={isPlaying} className={`btn-primary mb-2 ${isPlaying ? 'animate-pulse' : ''}`}>
            {isPlaying ? '播放中...' : '🔊 播放对话'}
          </button>
        </div>

        <p className="font-bold text-gray-700 mb-1">Q{idx + 1}. {q.question}</p>
        {q.questionZh && <p className="text-xs text-gray-400 mb-3">（{q.questionZh}）</p>}

        {!submitted && (
          <div className="grid grid-cols-3 gap-3">
            {displayOptions.map((opt, i) => {
              const isSelected = selected === i;
              return (
                <button key={i} onClick={() => setSelected(i)} className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                  isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                }`}>
                  <span className="text-5xl mb-2">{opt.emoji}</span>
                  <span className="text-xs text-gray-600">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        )}

        {!submitted && (
          <button onClick={handleSubmit} disabled={selected === null} className="btn-primary mt-4 disabled:opacity-40">确认答案</button>
        )}

        {submitted && (
          <div className="mt-4 p-3 rounded-xl bg-gray-50 text-left">
            <p className={`font-bold ${selected !== null && q.options.indexOf(displayOptions[selected]) === correctOriginalIndex ? 'text-green-600' : 'text-red-600'}`}>
              {selected !== null && q.options.indexOf(displayOptions[selected]) === correctOriginalIndex ? '正确！' : '答错了'}
            </p>
            <p className="text-sm text-gray-600 mt-1">正确答案：<b>{q.options[correctOriginalIndex].emoji} {q.options[correctOriginalIndex].desc}</b></p>
            {q.explanation && <p className="text-xs text-gray-400 mt-2">{q.explanation}</p>}
            <button onClick={goNext} className="btn-primary mt-3">
              {isLast ? '查看结果' : '下一题'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== Part 2 练习视图（听独白填空 / note completion）==========
function Part2Practice({ set, onBack }: { set: ListeningPart2Set; onBack: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [played, setPlayed] = useState(false);
  const { recordAnswer, recordSession } = useProgressStore();
  const startTime = useRef(Date.now());

  // ✅ 离开页面时停止音频，避免后台继续播放
  useEffect(() => {
    return () => { stopAllAudio(); };
  }, []);

  if (!set?.blanks || set.blanks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">套题数据为空</p>
        <button onClick={onBack} className="mt-3 text-blue-600 hover:underline text-sm">返回</button>
      </div>
    );
  }

  const isAnsCorrect = (b: ListeningPart2Set['blanks'][number], userAns: string) => {
    const ua = userAns.trim().toLowerCase();
    return b.answer.split(' / ').map(a => a.trim().toLowerCase()).some(a => ua === a);
  };

  const playMonologue = async () => {
    setIsPlaying(true);
    await playAudioFile(set.id, set.monologueAudio, 0.9);
    setIsPlaying(false);
    setPlayed(true);
  };

  const playSentence = async (b: ListeningPart2Set['blanks'][number]) => {
    setIsPlaying(true);
    await playAudioFile(b.id, b.audioText, 0.9);
    setIsPlaying(false);
  };

  const handleAnswer = (blankId: string, value: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [blankId]: value }));
  };

  const handleSubmit = () => {
    set.blanks.forEach((b) => {
      const userAns = answers[b.id] || '';
      recordAnswer({
        module: 'listening',
        exerciseType: 'Part2-' + set.id,
        subjectId: set.id,
        subjectName: set.titleZh,
        questionId: b.id,
        questionText: b.fieldZh,
        userAnswer: userAns,
        correctAnswer: b.answer,
        isCorrect: isAnsCorrect(b, userAns),
      });
    });
    const correctCount = set.blanks.filter(b => isAnsCorrect(b, answers[b.id] || '')).length;
    recordSession({
      module: 'listening',
      exerciseType: 'Part2-' + set.id,
      subjectId: set.id,
      subjectName: set.titleZh,
      correct: correctCount,
      total: set.blanks.length,
      duration: Math.round((Date.now() - startTime.current) / 1000),
    });
    setSubmitted(true);
  };

  const correctCount = submitted ? set.blanks.filter(b => isAnsCorrect(b, answers[b.id] || '')).length : 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">返回列表</button>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-500">Part 2 · {set.titleZh}</span>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-4 text-center">
        <p className="font-bold text-gray-700 mb-1">{set.speaker}</p>
        <p className="text-sm text-gray-400 mb-3">{set.titleZh}</p>
        <button onClick={playMonologue} disabled={isPlaying} className={`btn-primary mb-4 ${isPlaying ? 'animate-pulse' : ''}`}>
          {isPlaying ? '播放中...' : '🔊 播放独白'}
        </button>
        <p className="text-xs text-gray-400 mb-2">听独白，在下方填写 5 个关键信息</p>
      </div>

      {played && (
        <div className="bg-white rounded-2xl shadow p-6 mb-4">
          <div className="space-y-3">
            {set.blanks.map((b) => {
              const correct = submitted && isAnsCorrect(b, answers[b.id] || '');
              const wrong = submitted && !correct;
              return (
                <div key={b.id} className="flex items-center gap-3">
                  <label className="text-sm font-bold text-gray-700 w-24 flex-shrink-0">{b.fieldZh}：</label>
                  <input
                    type="text"
                    value={answers[b.id] || ''}
                    onChange={(e) => handleAnswer(b.id, e.target.value)}
                    disabled={submitted}
                    className={`flex-1 px-3 py-2 border-b-2 rounded ${
                      correct ? 'border-green-500 bg-green-50 text-green-700'
                        : wrong ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-blue-500 focus:outline-none'
                    }`}
                    placeholder={b.hint}
                  />
                  <button onClick={() => playSentence(b)} disabled={isPlaying} className="text-xl flex-shrink-0" title="重听此句">🔊</button>
                  {submitted && <span className="text-xs text-gray-400 flex-shrink-0">{b.hint}</span>}
                </div>
              );
            })}
          </div>
          {!submitted && (
            <button onClick={handleSubmit} className="btn-primary w-full mt-4">提交答案</button>
          )}
        </div>
      )}

      {submitted && (
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <p className="text-2xl font-bold mb-2">练习完成！</p>
          <p className="text-lg mb-4">得分：<b className="text-green-600">{correctCount}/{set.blanks.length}</b></p>
          <div className="text-left space-y-2 mb-4">
            {set.blanks.map((b) => {
              const correct = isAnsCorrect(b, answers[b.id] || '');
              return (
                <div key={b.id} className={`p-2 rounded-lg ${correct ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm font-bold">{b.fieldZh}（{b.field}）</p>
                  <p className={`text-xs ${correct ? 'text-green-600' : 'text-red-600'}`}>
                    你的答案：{answers[b.id] || '（未答）'} {correct ? '✅' : `❌ 正确答案：${b.answer}`}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mb-3">原文：{set.transcript}</p>
          <button onClick={onBack} className="btn-primary">返回列表</button>
        </div>
      )}
    </div>
  );
}


// ========== Part 3 练习视图（长对话选择题 / KET 标准）==========
function Part3Practice({ set, onBack }: { set: ListeningPart3Set; onBack: () => void }) {
  const [idx, setIdx] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { recordAnswer, recordSession } = useProgressStore();

  // 存储每个题目的打乱后选项（只在初始化时打乱一次）
  const [shuffledMap, setShuffledMap] = useState<Record<string, string[]>>({});
  useEffect(() => {
    const map: Record<string, string[]> = {};
    set.questions.forEach(q => {
      if (q.options) {
        const arr = [...q.options];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        map[q.id] = arr;
      }
    });
    setShuffledMap(map);
  }, [set.id]);

  // ✅ 离开页面时停止音频，避免后台继续播放
  useEffect(() => {
    return () => { stopAllAudio(); };
  }, []);

  const startTime = useRef(Date.now());

  if (!set?.questions || set.questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">套题数据为空</p>
        <button onClick={onBack} className="mt-3 text-blue-600 hover:underline text-sm">返回</button>
      </div>
    );
  }

  const playConversation = async () => {
    setIsPlaying(true);
    await playAudioFile(set.id, set.conversationAudio || '', 0.95);
    setIsPlaying(false);
    setIdx(0);
  };

  const playSnippet = async (q: ListeningPart3Question) => {
    if (!q.audioText) return;
    setIsPlaying(true);
    await playAudioFile(q.id, q.audioText, 0.95);
    setIsPlaying(false);
  };

  const handleAnswer = (qId: string, _letter: string, optText: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: optText }));
  };

  const isCorrectQ = (q: ListeningPart3Question) => {
    const userAns = answers[q.id] || '';
    const userAnsIndex = q.options.indexOf(userAns);
    const correctAnsIndex = q.answer.charCodeAt(0) - 65;
    return userAnsIndex === correctAnsIndex;
  };

  const handleSubmit = () => {
    set.questions.forEach((q) => {
      const userAns = answers[q.id] || '';
      const userAnsIndex = q.options.indexOf(userAns);
      const correctAnsIndex = q.answer.charCodeAt(0) - 65;
      const isCorrect = userAnsIndex === correctAnsIndex;
      recordAnswer({
        module: 'listening', exerciseType: 'Part3-' + set.id,
        subjectId: set.id, subjectName: set.titleZh,
        questionId: q.id, questionText: q.question,
        userAnswer: userAns,
        correctAnswer: q.options[correctAnsIndex],
        isCorrect,
      });
    });
    const correctCount = set.questions.filter(isCorrectQ).length;
    recordSession({
      module: 'listening', exerciseType: 'Part3-' + set.id,
      subjectId: set.id, subjectName: set.titleZh,
      correct: correctCount,
      total: set.questions.length,
      duration: Math.round((Date.now() - startTime.current) / 1000),
    });
    setSubmitted(true);
  };

  const correctCount = submitted ? set.questions.filter(isCorrectQ).length : 0;

  if (idx === -1) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="text-blue-600 text-sm hover:underline">返回列表</button>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm text-gray-500">Part 3 · {set.titleZh}</span>
        </div>
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <p className="text-lg font-bold text-gray-700 mb-2">{set.titleZh}</p>
          <p className="text-sm text-gray-400 mb-1">{set.title}</p>
          <p className="text-xs text-gray-400 mb-1">{set.speakerA} &amp; {set.speakerB}</p>
          <p className="text-xs text-gray-400 mb-4">{set.conversationAudio ? set.conversationAudio.substring(0, 100) + '...' : ''}</p>
          <div className="mb-4 flex justify-center">
            <button onClick={playConversation} disabled={isPlaying} className={`btn-primary mb-4 ${isPlaying ? 'animate-pulse' : ''}`}>
              {isPlaying ? '播放中...' : '🔊 播放对话'}
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center">点击播放后听对话，然后选择答案</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">返回列表</button>
        <span className="text-sm text-gray-500">Part 3 · {set.titleZh}</span>
      </div>

      {!submitted ? (
        <div className="space-y-4">
          {set.questions.map((q, qi) => (
            <div key={q.id} className="bg-white rounded-xl shadow p-4">
              <p className="font-bold text-gray-700 mb-2">Q{qi + 1}. {q.question}{q.questionZh ? <span className="text-xs text-gray-400 ml-1">（{q.questionZh}）</span> : null}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(shuffledMap[q.id] || q.options).map((opt, oi) => {
                  const label = String.fromCharCode(65 + oi);
                  const isSelected = answers[q.id] === opt;
                  return (
                    <button key={oi} onClick={() => handleAnswer(q.id, label, opt)} className={`text-left px-3 py-2 rounded-lg border transition-all ${
                      isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                    }`}>
                      <span className="font-bold text-purple-600">{label}. </span>{opt}
                    </button>
                  );
                })}
              </div>
              {q.audioText && (
                <button onClick={() => playSnippet(q)} disabled={isPlaying} className="text-xs text-blue-500 mt-2 hover:underline" title="重听相关对话">🔊 重听此句</button>
              )}
            </div>
          ))}
          <button onClick={handleSubmit} className="btn-primary w-full">提交答案</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <p className="text-2xl font-bold mb-2">练习完成！</p>
          <p className="text-lg mb-4">得分：<b className="text-purple-600">{correctCount}/{set.questions.length}</b></p>
          <div className="text-left space-y-3 mb-4">
            {set.questions.map((q, qi) => {
              const correct = isCorrectQ(q);
              return (
                <div key={q.id} className={`p-2 rounded-lg ${correct ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm font-bold">Q{qi + 1}. {q.question}</p>
                  <p className={`text-xs ${correct ? 'text-green-600' : 'text-red-600'}`}>
                    你的答案：{answers[q.id] || '（未答）'} {correct ? '√' : '× 正确答案：' + q.answer}
                  </p>
                  {q.explanation && <p className="text-xs text-gray-400">{q.explanation}</p>}
                </div>
              );
            })}
          </div>
          <button onClick={onBack} className="btn-primary">返回列表</button>
        </div>
      )}
    </div>
  );
}


// ========== Part 5 练习视图（听写笔记）==========
function Part5Practice({ set, onBack }: { set: ListeningPart5Set; onBack: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [played, setPlayed] = useState(false);
  const { recordAnswer, recordSession } = useProgressStore();
  const startTime = useRef(Date.now());

  // ✅ 离开页面时停止音频，避免后台继续播放
  useEffect(() => {
    return () => { stopAllAudio(); };
  }, []);

  if (!set?.notes || set.notes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">套题数据为空</p>
        <button onClick={onBack} className="mt-3 text-blue-600 hover:underline text-sm">返回</button>
      </div>
    );
  }

  const playMonologue = async () => {
    setIsPlaying(true);
    await playAudioFile(set.id, set.monologueAudio, 0.9);
    setIsPlaying(false);
    setPlayed(true);
  };

  const playNote = async (n: { id: string; audioText: string }) => {
    if (!n.audioText) return;
    setIsPlaying(true);
    await playAudioFile(n.id, n.audioText, 0.9);
    setIsPlaying(false);
  };

  const handleAnswer = (noteId: string, value: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [noteId]: value }));
  };

  const handleSubmit = () => {
    set.notes.forEach((n) => {
      const userAns = answers[n.id] || '';
      recordAnswer({
        module: 'listening',
        exerciseType: 'Part5-' + set.id,
        subjectId: set.id,
        subjectName: set.titleZh,
        questionId: n.id,
        questionText: n.field,
        userAnswer: userAns,
        correctAnswer: n.answer,
        isCorrect: userAns.trim().toLowerCase() === n.answer.toLowerCase(),
      });
    });
    const correctCount = set.notes.filter(n => (answers[n.id] || '').trim().toLowerCase() === n.answer.toLowerCase()).length;
    recordSession({
      module: 'listening',
      exerciseType: 'Part5-' + set.id,
      subjectId: set.id,
      subjectName: set.titleZh,
      correct: correctCount,
      total: set.notes.length,
      duration: Math.round((Date.now() - startTime.current) / 1000),
    });
    setSubmitted(true);
  };

  const correctCount = submitted ? set.notes.filter(n => (answers[n.id] || '').trim().toLowerCase() === n.answer.toLowerCase()).length : 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">返回列表</button>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-500">Part 5 · {set.titleZh}</span>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-4 text-center">
        <p className="font-bold text-gray-700 mb-1">{set.speaker}</p>
        <p className="text-sm text-gray-400 mb-3">{set.titleZh}</p>
        <button onClick={playMonologue} disabled={isPlaying} className={`btn-primary mb-4 ${isPlaying ? 'animate-pulse' : ''}`}>
          {isPlaying ? '播放中...' : '播放独白'}
        </button>
        <p className="text-xs text-gray-400 mb-2">听独白，填写下方笔记信息</p>
      </div>

      {played && (
        <div className="bg-white rounded-2xl shadow p-6 mb-4">
          <div className="space-y-3">
            {set.notes.map((n) => (
              <div key={n.id} className="flex items-center gap-3">
                <label className="text-sm font-bold text-gray-700 w-24 flex-shrink-0">
                  {n.fieldZh}：
                </label>
                <button
                  type="button"
                  onClick={() => playNote(n)}
                  disabled={isPlaying || !n.audioText}
                  title="重听此句"
                  className={`flex-shrink-0 w-9 h-9 rounded-full text-sm ${isPlaying ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} transition`}
                >
                  🔊
                </button>
                <input
                  type="text"
                  value={answers[n.id] || ''}
                  onChange={(e) => handleAnswer(n.id, e.target.value)}
                  disabled={submitted}
                  className={`flex-1 px-3 py-2 border-b-2 rounded ${
                    submitted
                      ? (answers[n.id] || '').trim().toLowerCase() === n.answer.toLowerCase()
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-blue-500 focus:outline-none'
                  }`}
                  placeholder={n.hint}
                />
                {submitted && (
                  <span className="text-xs text-gray-400">{n.hint}</span>
                )}
              </div>
            ))}
          </div>
          {!submitted && (
            <button onClick={handleSubmit} className="btn-primary w-full mt-4">提交答案</button>
          )}
        </div>
      )}

      {submitted && (
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <p className="text-2xl font-bold mb-2">练习完成！</p>
          <p className="text-lg mb-4">得分：<b className="text-green-600">{correctCount}/{set.notes.length}</b></p>
          <div className="text-left space-y-2 mb-4">
            {set.notes.map((n) => {
              const userAns = answers[n.id] || '';
              const correct = userAns.trim().toLowerCase() === n.answer.toLowerCase();
              return (
                <div key={n.id} className={`p-2 rounded-lg ${correct ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm font-bold">{n.fieldZh}（{n.field}）</p>
                  <p className={`text-xs ${correct ? 'text-green-600' : 'text-red-600'}`}>
                    你的答案：{userAns || '（未答）'} {correct ? '✅' : `❌ 正确答案：${n.answer}`}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mb-3">原文：{set.transcript}</p>
          <button onClick={onBack} className="btn-primary">返回列表</button>
        </div>
      )}
    </div>
  );
}

// ========== 套题列表页面 ==========
function SetListPage({ part, onBack, onSelectSet }: {
  part: number;
  onBack: () => void;
  onSelectSet: (s: any) => void;
}) {
  const partMeta: Record<number, { nameZh: string; icon: string; desc: string }> = {
    1: { nameZh: '看图选答案', icon: '🖼️', desc: '看图片，选择对应答案' },
    2: { nameZh: '信息匹配', icon: '🔗', desc: '听独白，匹配人物与需求' },
    3: { nameZh: '听录音填空', icon: '✏️', desc: '听录音，填写缺失单词' },
    4: { nameZh: '选择题', icon: '📝', desc: '听对话，回答选择题' },
    5: { nameZh: '听写填空', icon: '📋', desc: '听独白，填写笔记信息' },
  };

  const meta = partMeta[part] || partMeta[1];
  const sets = part === 1 ? part1Sets : part === 2 ? part2Sets : part === 3 ? part3Sets : part === 4 ? part4Sets : part === 5 ? part5Sets : [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">返回</button>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-500">{meta.nameZh}</span>
      </div>

      <div className="p-4 rounded-2xl border mb-4 bg-purple-50 text-purple-700 border-purple-200">
        <p className="font-bold">{meta.icon} {meta.nameZh}</p>
        <p className="text-sm opacity-80">{meta.desc}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sets.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-400">
            <p className="text-lg">暂无套题</p>
            <p className="text-sm mt-1">该题型正在建设中</p>
          </div>
        )}
        {sets.map((s: any, index: number) => (
          <button
            key={'set-' + (s.id || index)}
            data-set-id={s.id}
            onClick={() => onSelectSet(s)}
            className="bg-white rounded-xl shadow p-4 text-left hover:shadow-md transition-all border border-gray-100 cursor-pointer active:scale-[0.98]"
          >
            <p className="font-bold text-gray-700">{s.titleZh || s.title}</p>
            <p className="text-xs text-gray-400">{s.title}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                {s.difficulty === 'easy' ? '简单' : s.difficulty === 'medium' ? '中等' : '困难'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {s.speed === 'slow' ? '慢速' : s.speed === 'normal' ? '标准' : '快速'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ========== 主页面 ==========
export default function ListeningPage() {
  const navigate = useNavigate();

  // 使用单个字符串状态管理视图，避免多状态同步问题
  // 'home' = Part 选择页 | 'sets' = 套题列表 | 'practice' = 练习中
  const [screen, setScreen] = useState<'home' | 'sets' | 'practice'>('home');
  const [activePart, setActivePart] = useState<number>(1);
  const [activeSet, setActiveSet] = useState<any>(null);

  // 进入某 Part 的套题列表
  const goToSets = useCallback((part: number) => {
    setActivePart(part);
    setScreen('sets');
  }, []);

  // 选中某套题开始练习
  const selectSet = useCallback((s: any) => {
    setActiveSet(s);
    setScreen('practice');
  }, []);

  // 返回上一层
  const goBack = useCallback(() => {
    if (screen === 'practice') {
      setScreen('sets');
      setActiveSet(null);
    } else if (screen === 'sets') {
      setScreen('home');
    }
  }, [screen]);

  // 返回首页
  const goHome = useCallback(() => navigate('/'), [navigate]);

  // ====== 渲染：练习视图 ======
  if (screen === 'practice' && activeSet) {
    if (activeSet.part === 1) {
      return <Part1Practice set={activeSet} onBack={goBack} />;
    }
    if (activeSet.part === 2) {
      return <Part2Practice set={activeSet} onBack={goBack} />;
    }
    if (activeSet.part === 3) {
      return <Part3Practice set={activeSet} onBack={goBack} />;
    }
    if (activeSet.part === 4) {
      return <Part4Practice set={activeSet} onBack={goBack} />;
    }
    if (activeSet.part === 5) {
      return <Part5Practice set={activeSet} onBack={goBack} />;
    }
  }

  // ====== 渲染：套题列表 ======
  if (screen === 'sets') {
    return <SetListPage part={activePart} onBack={goBack} onSelectSet={selectSet} />;
  }

  // ====== 渲染：主页（Part 选择）======
  return (
    <div>
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={goHome} className="text-blue-600 text-sm hover:underline">返回首页</button>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-500">听力训练</span>
      </div>

      {/* 标题区 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">听力训练</h2>
        <p className="text-sm text-gray-400 mt-1">选择题型，开始练习</p>
      </div>

      {/* Part 卡片网格 — 用原生 div + onclick 确保点击可靠 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">

        {/* Part 1: 看图选答案 */}
        <div
          onClick={() => goToSets(1)}
          className="rounded-2xl p-5 text-left transition-all border-2 bg-white hover:shadow-lg cursor-pointer border-gray-100 hover:border-purple-300 active:scale-[0.97] select-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') goToSets(1); }}
        >
          <div className="text-3xl mb-2">🖼️</div>
          <p className="font-bold text-gray-800">看图选答案</p>
          <p className="text-xs text-gray-400">看图片，选择对应答案</p>
          <p className="text-xs mt-2 text-purple-500">{part1Sets.length} 套题 · 点击开始</p>
        </div>

        {/* Part 2: 信息匹配 */}
        <div
          onClick={() => goToSets(2)}
          className="rounded-2xl p-5 text-left transition-all border-2 bg-white hover:shadow-lg cursor-pointer border-gray-100 hover:border-blue-300 active:scale-[0.97] select-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') goToSets(2); }}
        >
          <div className="text-3xl mb-2">🔗</div>
          <p className="font-bold text-gray-800">信息匹配</p>
          <p className="text-xs text-gray-400">听独白，匹配人物与需求</p>
          <p className="text-xs mt-2 text-blue-500">{part2Sets.length} 套题 · 点击开始</p>
        </div>

        {/* Part 3: 听录音填空 */}
        <div
          onClick={() => goToSets(3)}
          className="rounded-2xl p-5 text-left transition-all border-2 bg-white hover:shadow-lg cursor-pointer border-gray-100 hover:border-green-300 active:scale-[0.97] select-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') goToSets(3); }}
        >
          <div className="text-3xl mb-2">✏️</div>
          <p className="font-bold text-gray-800">听录音填空</p>
          <p className="text-xs text-gray-400">听录音，填写缺失单词</p>
          <p className="text-xs mt-2 text-green-500">{part3Sets.length} 套题 · 点击开始</p>
        </div>

        {/* Part 4: 选择题 */}
        <div
          onClick={() => goToSets(4)}
          className="rounded-2xl p-5 text-left transition-all border-2 bg-white hover:shadow-lg cursor-pointer border-gray-100 hover:border-orange-300 active:scale-[0.97] select-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') goToSets(4); }}
        >
          <div className="text-3xl mb-2">📝</div>
          <p className="font-bold text-gray-800">选择题</p>
          <p className="text-xs text-gray-400">听对话，回答选择题</p>
          <p className="text-xs mt-2 text-orange-500">{part4Sets.length} 套题 · 点击开始</p>
        </div>

        {/* Part 5: 听写填空 */}
        <div
          onClick={() => goToSets(5)}
          className="rounded-2xl p-5 text-left transition-all border-2 bg-white hover:shadow-lg cursor-pointer border-gray-100 hover:border-yellow-300 active:scale-[0.97] select-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') goToSets(5); }}
        >
          <div className="text-3xl mb-2">📋</div>
          <p className="font-bold text-gray-800">听写填空</p>
          <p className="text-xs text-gray-400">听独白，填写笔记信息</p>
          <p className="text-xs mt-2 text-yellow-500">{part5Sets.length} 套题 · 点击开始</p>
        </div>

      </div>

      {/* 底部提示 */}
      <div className="mt-6 p-3 bg-purple-50 rounded-xl text-xs text-purple-600 text-center">
        提示：点击播放按钮听语音后作答。支持 Part 1–5 全题型。
      </div>
    </div>
  );
}
