import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { part1Sets, part2Sets, part3Sets, part4Sets, part5Sets } from '../data/listening';
import { useProgressStore } from '../store/useProgressStore';
import type { ListeningPart1Set, ListeningPart1Question, ListeningPart2Set, ListeningPart3Set, ListeningPart4Set, ListeningPart5Set } from '../types';
import { AudioButton } from '../components/AudioButton';

// ========== 工具函数：语音合成播放 ==========
function playSpeech(text: string, rate = 0.9): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = rate;
    utter.onend = () => resolve();
    utter.onerror = () => resolve();
    window.speechSynthesis.speak(utter);
  });
}

// ========== Part 1 练习视图 ==========
function Part1Practice({ set, onBack }: { set: ListeningPart1Set; onBack: () => void }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { recordAnswer, recordSession } = useProgressStore();

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

  const startTime = useRef(Date.now());

  if (!set?.questions || set.questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">套题数据为空</p>
        <button onClick={onBack} className="mt-3 text-blue-600 hover:underline text-sm">返回</button>
      </div>
    );
  }

  const q: ListeningPart1Question = set.questions[idx];
  // ✅ 选项打乱（避免正确答案总是A）
  const displayOptions = useMemo(() => {
    const shuffled = [...(q.options || [])];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [q.id]); // 只在题目变化时重新打乱


  const playQuestion = async () => {
    setIsPlaying(true);
    await playSpeech(q.audioText, 0.85);
    setIsPlaying(false);
  };

  useEffect(() => { playQuestion(); }, [idx]);

  const handleSubmit = () => {
    if (!selected) return;
    const correct = selected === q.answer;
    recordAnswer({
      module: 'listening',
      exerciseType: 'Part1-' + set.id,
      subjectId: set.id,
      subjectName: set.titleZh,
      questionId: q.id,
      questionText: q.audioText,
      userAnswer: selected,
      correctAnswer: q.answer,
      isCorrect: correct,
    });
    setSubmitted(true);
  };

  const goNext = () => {
    setSelected('');
    setSubmitted(false);
    setIdx(idx + 1);
  };

  const isLast = idx >= set.questions.length - 1;

  useEffect(() => {
    if (submitted && isLast) {
      recordSession({
        module: 'listening',
        exerciseType: 'Part1-' + set.id,
        subjectId: set.id,
        subjectName: set.titleZh,
        correct: 0,
        total: set.questions.length,
        duration: Math.round((Date.now() - startTime.current) / 1000),
      });
    }
  }, [submitted, isLast]);

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
        <p className="text-sm text-gray-400 mb-3">{q.imageDesc}</p>
        
        {/* 播放按钮 - 使用统一组件，增大尺寸 */}
        <div className="mb-4 flex justify-center">
          <AudioButton
            text={q.audioText}
            label="播放听力"
            size="large"
            showSpeedControl={true}
          />
        </div>

        {!submitted && (
          <div className="flex justify-center gap-3 flex-wrap">
            {(displayOptions || q.options).map((opt: string, i: number) => {
              const label = String.fromCharCode(65 + i);
              return (
                <button key={i} onClick={() => setSelected(label)} className={`px-4 py-3 rounded-xl border-2 transition-all ${
                  selected === label ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
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
            <p className={`font-bold ${selected === q.answer ? 'text-green-600' : 'text-red-600'}`}>
              {selected === q.answer ? '正确！' : '答错了'}
            </p>
            <p className="text-sm text-gray-600 mt-1">正确答案：<b>{q.answer}</b></p>
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

// ========== Part 4 练习视图 ==========
function Part4Practice({ set, onBack }: { set: ListeningPart4Set; onBack: () => void }) {
  const [idx, setIdx] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { recordAnswer, recordSession } = useProgressStore();

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

  const startTime = useRef(Date.now());

  if (!set?.questions || set.questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">套题数据为空</p>
        <button onClick={onBack} className="mt-3 text-blue-600 hover:underline text-sm">返回</button>
      </div>
    );
  }

  const playDialogue = async () => {
    setIsPlaying(true);
    await playSpeech('Dialogue: ' + set.dialogueScript, 1.0);
    setIsPlaying(false);
    setIdx(0);
  };

  const handleAnswer = (qId: string, letter: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: letter }));
  };

  const handleSubmit = () => {
    set.questions.forEach((q) => {
      const userAns = answers[q.id] || '';
      recordAnswer({
        module: 'listening', exerciseType: 'Part4-' + set.id,
        subjectId: set.id, subjectName: set.titleZh,
        questionId: q.id, questionText: q.question,
        userAnswer: userAns, correctAnswer: q.answer,
        isCorrect: userAns === q.answer,
      });
    });
    recordSession({
      module: 'listening', exerciseType: 'Part4-' + set.id,
      subjectId: set.id, subjectName: set.titleZh,
      correct: 0, total: set.questions.length,
      duration: Math.round((Date.now() - startTime.current) / 1000),
    });
    setSubmitted(true);
  };

  const correctCount = submitted ? set.questions.filter(q => (answers[q.id] || '') === q.answer).length : 0;

  if (idx === -1) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="text-blue-600 text-sm hover:underline">返回列表</button>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm text-gray-500">Part 4 · {set.titleZh}</span>
        </div>
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <p className="text-lg font-bold text-gray-700 mb-2">{set.titleZh}</p>
          <p className="text-sm text-gray-400 mb-1">{set.title}</p>
          <p className="text-xs text-gray-400 mb-4">{set.dialogueSummary}</p>
          
          {/* 播放按钮 - 使用统一组件，增大尺寸 */}
          <div className="mb-4 flex justify-center">
            <AudioButton
              text={'Dialogue: ' + set.dialogueScript}
              label="播放对话"
              size="large"
              showSpeedControl={true}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">返回列表</button>
        <span className="text-sm text-gray-500">Part 4 · {set.titleZh}</span>
      </div>

      {!submitted ? (
        <div className="space-y-4">
          {set.questions.map((q, qi) => (
            <div key={q.id} className="bg-white rounded-xl shadow p-4">
              <p className="font-bold text-gray-700 mb-2">Q{qi + 1}. {q.question}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(shuffledMap[q.id] || q.options).map((opt, oi) => {
                  const label = String.fromCharCode(65 + oi);
                  return (
                    <button key={oi} onClick={() => handleAnswer(q.id, label)} className={`text-left px-3 py-2 rounded-lg border transition-all ${
                      answers[q.id] === label ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                    }`}>
                      <span className="font-bold text-purple-600">{label}. </span>{opt}
                    </button>
                  );
                })}
              </div>
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
              const userAns = answers[q.id] || '';
              const correct = userAns === q.answer;
              return (
                <div key={q.id} className={`p-2 rounded-lg ${correct ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm font-bold">Q{qi + 1}. {q.question}</p>
                  <p className={`text-xs ${correct ? 'text-green-600' : 'text-red-600'}`}>
                    你的答案：{userAns || '（未答）'} {correct ? '√' : '× 正确答案：' + q.answer}
                  </p>
                  <p className="text-xs text-gray-400">{q.explanation}</p>
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

// ========== Part 2 练习视图（信息匹配）==========
function Part2Practice({ set, onBack }: { set: ListeningPart2Set; onBack: () => void }) {
  const [playedIdx, setPlayedIdx] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { recordAnswer, recordSession } = useProgressStore();

  // ✅ 选项打乱（避免正确答案总是A）
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  useEffect(() => {
    if (set && set.options) {
      const arr = [...set.options];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setShuffledOptions(arr);
    }
  }, [set.id]); // 只在套题变化时重新打乱

  const startTime = useRef(Date.now());

  if (!set?.items || set.items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">套题数据为空</p>
        <button onClick={onBack} className="mt-3 text-blue-600 hover:underline text-sm">返回</button>
      </div>
    );
  }

  const playItem = async (idx: number) => {
    setPlayedIdx(idx);
    setIsPlaying(true);
    await playSpeech(set.items[idx].audioText, 0.9);
    setIsPlaying(false);
  };

  const handleSelect = (itemId: string, optionLetter: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [itemId]: optionLetter }));
  };

  const handleSubmit = () => {
    set.items.forEach((item) => {
      const userAns = answers[item.id] || '';
      const correctAns = set.answers[item.id] || '';
      recordAnswer({
        module: 'listening',
        exerciseType: 'Part2-' + set.id,
        subjectId: set.id,
        subjectName: set.titleZh,
        questionId: item.id,
        questionText: item.personDesc,
        userAnswer: userAns,
        correctAnswer: correctAns,
        isCorrect: userAns === correctAns,
      });
    });
    recordSession({
      module: 'listening',
      exerciseType: 'Part2-' + set.id,
      subjectId: set.id,
      subjectName: set.titleZh,
      correct: 0,
      total: set.items.length,
      duration: Math.round((Date.now() - startTime.current) / 1000),
    });
    setSubmitted(true);
  };

  const correctCount = submitted ? set.items.filter(item => (answers[item.id] || '') === set.answers[item.id]).length : 0;
  const allAnswered = set.items.every(item => answers[item.id]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">返回列表</button>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-500">Part 2 · {set.titleZh}</span>
      </div>

      {!submitted ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow p-4 mb-4">
            <p className="text-sm text-gray-500 mb-2">说明：依次点击每个人物旁的播放按钮，听描述后选择匹配的选项。</p>
            <div className="flex flex-wrap gap-2">
              {set.options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                return (
                  <span key={i} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{letter}. {opt}</span>
                );
              })}
            </div>
          </div>

          {set.items.map((item, idx) => (
            <div key={item.id} className={`bg-white rounded-xl shadow p-4 border-2 transition-all ${playedIdx === idx ? 'border-blue-400' : 'border-transparent'}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-gray-700">{item.id}. {item.person} <span className="text-xs text-gray-400 font-normal">（{item.personDescZh}）</span></p>
                <button onClick={() => playItem(idx)} disabled={isPlaying} className={`text-xs px-3 py-1 rounded-full ${isPlaying ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                  {playedIdx === idx && isPlaying ? '播放中...' : '▶ 播放'}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {(shuffledOptions || set.options).map((opt, oi) => {
                  const letter = String.fromCharCode(65 + oi);
                  const selected = answers[item.id] === letter;
                  return (
                    <button
                      key={oi}
                      onClick={() => handleSelect(item.id, letter)}
                      className={`text-left px-2 py-1.5 rounded-lg border text-sm transition-all ${
                        selected ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 hover:border-blue-300 text-gray-700'
                      }`}
                    >
                      <span className="font-bold">{letter}.</span> {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button onClick={handleSubmit} disabled={!allAnswered} className="btn-primary w-full disabled:opacity-40">
            提交答案
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <p className="text-2xl font-bold mb-2">练习完成！</p>
          <p className="text-lg mb-4">得分：<b className="text-blue-600">{correctCount}/{set.items.length}</b></p>
          <div className="text-left space-y-3 mb-4">
            {set.items.map((item) => {
              const userAns = answers[item.id] || '';
              const correctAns = set.answers[item.id] || '';
              const correct = userAns === correctAns;
              return (
                <div key={item.id} className={`p-2 rounded-lg ${correct ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm font-bold">{item.id}. {item.person}（{item.personDescZh}）</p>
                  <p className={`text-xs ${correct ? 'text-green-600' : 'text-red-600'}`}>
                    你的答案：{userAns || '（未答）'} {correct ? '✅' : `❌ 正确答案：${correctAns}. ${set.options[String(correctAns).charCodeAt(0) - 65]}`}
                  </p>
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

// ========== Part 3 练习视图（听录音填空）==========
function Part3Practice({ set, onBack }: { set: ListeningPart3Set; onBack: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [played, setPlayed] = useState(false);
  const { recordAnswer, recordSession } = useProgressStore();
  const startTime = useRef(Date.now());

  if (!set?.blanks || set.blanks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">套题数据为空</p>
        <button onClick={onBack} className="mt-3 text-blue-600 hover:underline text-sm">返回</button>
      </div>
    );
  }

  const playPassage = async () => {
    setIsPlaying(true);
    await playSpeech(set.passageAudio, 0.9);
    setIsPlaying(false);
    setPlayed(true);
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
        exerciseType: 'Part3-' + set.id,
        subjectId: set.id,
        subjectName: set.titleZh,
        questionId: b.id,
        questionText: `填空 (${b.position})`,
        userAnswer: userAns,
        correctAnswer: b.answer,
        isCorrect: userAns.trim().toLowerCase() === b.answer.toLowerCase(),
      });
    });
    recordSession({
      module: 'listening',
      exerciseType: 'Part3-' + set.id,
      subjectId: set.id,
      subjectName: set.titleZh,
      correct: 0,
      total: set.blanks.length,
      duration: Math.round((Date.now() - startTime.current) / 1000),
    });
    setSubmitted(true);
  };

  // 渲染文章，在填空位置插入输入框
  const renderPassage = () => {
    const parts = set.passage.split(/____ \(\d\)/);
    return parts.map((part, i) => (
      <span key={i}>
        {part}
        {i < set.blanks.length && (
          <input
            type="text"
            value={answers[set.blanks[i].id] || ''}
            onChange={(e) => handleAnswer(set.blanks[i].id, e.target.value)}
            disabled={submitted}
            className={`mx-1 px-2 py-0.5 border-b-2 w-24 text-center rounded ${
              submitted
                ? (answers[set.blanks[i].id] || '').trim().toLowerCase() === set.blanks[i].answer.toLowerCase()
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-red-500 bg-red-50 text-red-700'
                : 'border-blue-500 focus:outline-none'
            }`}
            placeholder={`(${set.blanks[i].position})`}
          />
        )}
      </span>
    ));
  };

  const correctCount = submitted ? set.blanks.filter(b => (answers[b.id] || '').trim().toLowerCase() === b.answer.toLowerCase()).length : 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">返回列表</button>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-500">Part 3 · {set.titleZh}</span>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-4 text-center">
        <button onClick={playPassage} disabled={isPlaying} className={`btn-primary mb-4 ${isPlaying ? 'animate-pulse' : ''}`}>
          {isPlaying ? '播放中...' : '播放录音'}
        </button>
        <p className="text-xs text-gray-400 mb-2">点击播放后听录音，在下方填空处填写单词</p>
      </div>

      {played && (
        <div className="bg-white rounded-2xl shadow p-6 mb-4">
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{renderPassage()}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {set.blanks.map((b) => (
              <span key={b.id} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-500">提示：{b.hint}</span>
            ))}
          </div>
          {!submitted && (
            <button onClick={handleSubmit} className="btn-primary w-full">提交答案</button>
          )}
        </div>
      )}

      {submitted && (
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <p className="text-2xl font-bold mb-2">练习完成！</p>
          <p className="text-lg mb-4">得分：<b className="text-green-600">{correctCount}/{set.blanks.length}</b></p>
          <div className="text-left space-y-2 mb-4">
            {set.blanks.map((b) => {
              const userAns = answers[b.id] || '';
              const correct = userAns.trim().toLowerCase() === b.answer.toLowerCase();
              return (
                <div key={b.id} className={`p-2 rounded-lg ${correct ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm">({b.position}) 提示：{b.hint}</p>
                  <p className={`text-xs ${correct ? 'text-green-600' : 'text-red-600'}`}>
                    你的答案：{userAns || '（未答）'} {correct ? '✅' : `❌ 正确答案：${b.answer}`}
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

// ========== Part 5 练习视图（听写笔记）==========
function Part5Practice({ set, onBack }: { set: ListeningPart5Set; onBack: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [played, setPlayed] = useState(false);
  const { recordAnswer, recordSession } = useProgressStore();
  const startTime = useRef(Date.now());

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
    await playSpeech(set.monologueAudio, 0.9);
    setIsPlaying(false);
    setPlayed(true);
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
    recordSession({
      module: 'listening',
      exerciseType: 'Part5-' + set.id,
      subjectId: set.id,
      subjectName: set.titleZh,
      correct: 0,
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
