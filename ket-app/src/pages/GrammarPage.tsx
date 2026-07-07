import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '../store/useProgressStore';
import {
  allGrammarPoints,
  type GrammarFillQuestion,
  type GrammarChoiceQuestion,
  type GrammarCorrectionQuestion,
  g01Fill, g01Choice, g01Correction,
  g02Fill, g02Choice, g02Correction,
  g03Fill, g03Choice, g03Correction,
  g04Fill, g04Choice, g04Correction,
  g05Fill, g05Choice, g05Correction,
  g06Fill, g06Choice, g06Correction,
  g07Fill, g07Choice, g07Correction,
  g08Fill, g08Choice, g08Correction,
  g09Fill, g09Choice, g09Correction,
  g10Fill, g10Choice, g10Correction,
  g11Fill, g11Choice, g11Correction,
  g12Fill, g12Choice, g12Correction,
  g13Fill, g13Choice, g13Correction,
  g14Fill, g14Choice, g14Correction,
  g15Fill, g15Choice, g15Correction,
  g16Fill, g16Choice, g16Correction,
  g17Fill, g17Choice, g17Correction,
  g18Fill, g18Choice, g18Correction,
  g19Fill, g19Choice, g19Correction,
  g20Fill, g20Choice, g20Correction,
} from '../data/grammar';

// ========== 改错题干扰项生成 ==========
/** 从错句和正确句中生成一个与两者都不同的干扰项 */
function makeDistractor(wrong: string, correct: string): string | null {
  // 策略1：找到两个句子不同的位置，对错句做另一种错误变形
  const strategies: Array<(w: string, _c: string) => string | null> = [
    // 在动词差异处做不同变化：如果正确句多了s，尝试去掉其他位置的s
    (w, _c) => { const i = w.indexOf(' '); return i > 0 ? w.slice(0, i) + ' ' + w.slice(i + 1).replace(/s\b/, '') : null; },
    // 尝试把句尾的标点或词微调
    (_w, _c) => _w.replace(/\./g, '!'),
    // 尝试给某个词加 s（不同于正确答案的方式）
    (w, _c) => { const m = w.match(/\b(\w{3,})\b/); return m ? w.replace(m[1], m[1] + 's') : null; },
    // 尝试添加 not/n't
    (w, _c) => { const i = w.lastIndexOf(' '); return i > 0 ? w.slice(0, i) + ' not' + w.slice(i).replace(/^\s/, '') : null; },
    // 调换相邻两个词的位置
    (w, _c) => { const parts = w.split(' '); if (parts.length >= 3) { [parts[0], parts[1]] = [parts[1], parts[0]]; return parts.join(' '); } return null; },
  ];
  for (const fn of strategies) {
    try {
      const d = fn(wrong, correct);
      if (d && d !== wrong && d !== correct && d.length > 5) return d;
    } catch { /* skip */ }
  }
  return null;
}

// 按钮样式工具函数 —— 用 if/else 链彻底消除歧义
function btnClass(
  opt: string,
  answer: string,
  selected: string | null,
  result: 'correct' | 'wrong' | null,
): string {
  // 第一优先：result === null 时，绝对不可能出现任何颜色
  if (!selected || !result) {
    return 'border-gray-200 hover:bg-blue-50 hover:border-blue-300 px-4 py-2.5 rounded-lg border transition-all';
  }
  // 已选择且结果已出
  if (opt === answer) {
    return 'bg-green-50 border-green-300 text-green-700 font-medium px-4 py-2.5 rounded-lg border transition-all';
  }
  if (opt === selected) {
    return 'bg-red-50 border-red-300 text-red-700 px-4 py-2.5 rounded-lg border transition-all';
  }
  return 'border-gray-200 opacity-50 px-4 py-2.5 rounded-lg border transition-all';
}

type GrammarMode = 'list' | 'learn' | 'practice' | 'quiz';
type PracticeType = 'fill' | 'choice' | 'correction';

// 统一测验题目格式
interface QuizQuestion {
  id: string;
  type: PracticeType;
  // fill / choice 共用
  sentence?: string;
  question?: string;
  options: string[];
  answer: string;
  explanation: string;
}

// ========== 讲解页 ==========
function LearnPage({ grammarId, onBack }: { grammarId: string; onBack: () => void }) {
  const gp = allGrammarPoints.find(g => g.id === grammarId)!;

  return (
    <div>
      <button onClick={onBack} className="text-blue-600 text-sm hover:underline mb-4">← 返回列表</button>
      <div className="card max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl font-bold text-blue-700">{gp.id}</span>
          <h3 className="text-lg font-bold text-gray-800">{gp.nameZh}</h3>
          <span className="text-sm text-gray-400">{gp.name}</span>
        </div>
        <div className="prose prose-sm max-w-none text-sm text-gray-600 whitespace-pre-line mb-4">{gp.explanation}</div>

        {/* 例句 */}
        <h4 className="font-semibold text-gray-700 mt-4 mb-2">📌 例句</h4>
        <div className="space-y-2">
          {gp.examples.map((ex: { en: string; zh: string }, i: number) => (
            <div key={i} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-sm font-medium text-blue-800">{ex.en}</p>
              <p className="text-xs text-gray-500 mt-1">{ex.zh}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== 单题卡片组件（状态完全隔离，每道题是独立实例） ==========
function QuestionCard({
  q, pType, onAnswer, onNext,
}: {
  q: any; pType: PracticeType;
  onAnswer: (correct: boolean, userAnswer: string) => void;
  onNext: () => void;
}) {
  // ✅ 这两个状态永远从 null 开始，因为 key={q.id} 保证每次切题都是全新实例
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  // 改错题选项：正确答案 + 原句(错) + 1个自动生成的干扰项，去重后打乱
  const corrOptions = useMemo((): string[] => {
    if (q.options && Array.isArray(q.options) && q.options.length >= 2) {
      // QuizPage 预生成的：去重后取
      const uniq = [...new Set(q.options)] as string[];
      return uniq.slice(0, Math.min(uniq.length, 3));
    }
    // PracticePage：生成 3 个不重复的选项
    const base = [q.answer, q.sentence];
    const d = makeDistractor(q.sentence, q.answer);
    if (d) base.push(d);
    // 去重 + Fisher-Yates 打乱
    const uniq = [...new Set(base)];
    for (let i = uniq.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uniq[i], uniq[j]] = [uniq[j], uniq[i]];
    }
    return uniq;
  }, [q.id]);

  // ✅ 填空题/选择题选项打乱（避免正确答案总是 A）
  const displayOptions = useMemo(() => {
    const shuffled = [...(q.options || [])];
    // Fisher-Yates 打乱
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [q.id]);

  const handleSelect = (opt: string) => {
    if (result) return;
    setSelected(opt);
    const correct = opt === q.answer;
    setResult(correct ? 'correct' : 'wrong');
    onAnswer(correct, opt);
  };

  return (
    <>
      {/* 题目区域 */}
      {pType === 'fill' ? (
        <div className="mb-6">
          <p className="text-lg text-gray-800 mb-4" dangerouslySetInnerHTML={{ __html: q.sentence.replace('____', '<span class="inline-block w-24 border-b-2 border-blue-300 mx-1"></span>') }} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {displayOptions.map((opt: string) => (
              <button
                key={`${q.id}-${opt}`}
                onClick={() => handleSelect(opt)}
                disabled={!!result}
                className={btnClass(opt, q.answer, selected, result)}
              >{opt}</button>
            ))}
          </div>
        </div>
      ) : pType === 'choice' ? (
        <div className="mb-6">
          <p className="text-base font-medium text-gray-800 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">{q.question}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {displayOptions.map((opt: string, i: number) => (
              <button
                key={`${q.id}-${opt}`}
                onClick={() => handleSelect(opt)}
                disabled={!!result}
                className={btnClass(opt, q.answer, selected, result)}
              >{String.fromCharCode(65 + i)}. {opt}</button>
            ))}
          </div>
        </div>
      ) : (
        /* 改错题 —— 使用 div role=button 绕过浏览器/扩展对 button 的样式注入 */
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">下列哪个句子是正确的？</p>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {corrOptions.map((opt: string, i: number) => {
              const isCorrect = opt === q.answer;
              const isSelected = opt === selected;
              let bgColor = '#ffffff';
              let borderColor = '#e5e7eb';
              let textColor = '#374151';
              if (result) {
                if (isCorrect) { bgColor = '#f0fdf4'; borderColor = '#86efac'; textColor = '#15803d'; }
                else if (isSelected) { bgColor = '#fef2f2'; borderColor = '#fca5a5'; textColor = '#b91c1c'; }
                else { textColor = '#9ca3af'; }
              }
              return (
                <div
                  key={`${q.id}-corr-${i}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelect(opt)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect(opt); }}
                  style={{
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                    color: textColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    cursor: result ? 'default' : 'pointer',
                    opacity: (result && !isCorrect && !isSelected) ? 0.5 : 1,
                    textAlign: 'left' as const,
                    fontSize: '15px',
                    transition: 'all 0.15s',
                    userSelect: 'none',
                  }}
                  onMouseEnter={(e) => { if (!result) { e.currentTarget.style.backgroundColor = '#f9fafb'; } }}
                  onMouseLeave={(e) => { if (!result) { e.currentTarget.style.backgroundColor = '#ffffff'; } }}
                >{opt}</div>
              );
            })}
          </div>
        </div>
      )}

      {/* 解析 & 下一题 */}
      {result && (
        <div className={`mt-4 p-4 rounded-xl ${result === 'correct' ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`font-bold ${result === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
            {result === 'correct' ? '✅ 回答正确！' : `❌ 正确答案是：${q.answer}`}
          </p>
          <p className={`text-sm mt-1 ${result === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{q.explanation}</p>
          <button onClick={onNext} className="mt-3 btn-primary">下一题 →</button>
        </div>
      )}
    </>
  );
}

// ========== 练习页 ==========
function PracticePage({ grammarId, onBack }: { grammarId: string; onBack: () => void }) {
  const [pType, setPType] = useState<PracticeType>('fill');
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const { recordAnswer, recordSession } = useProgressStore();
  const startTime = useRef(Date.now());
  const gp = allGrammarPoints.find(g => g.id === grammarId);

  // 题目查找表（替代嵌套 switch，避免 fall-through bug）
  const questionMap: Record<string, { fill: GrammarFillQuestion[]; choice: GrammarChoiceQuestion[]; correction: GrammarCorrectionQuestion[] }> = {
    'G01': { fill: g01Fill, choice: g01Choice, correction: g01Correction },
    'G02': { fill: g02Fill, choice: g02Choice, correction: g02Correction },
    'G03': { fill: g03Fill, choice: g03Choice, correction: g03Correction },
    'G04': { fill: g04Fill, choice: g04Choice, correction: g04Correction },
    'G05': { fill: g05Fill, choice: g05Choice, correction: g05Correction },
    'G06': { fill: g06Fill, choice: g06Choice, correction: g06Correction },
    'G07': { fill: g07Fill, choice: g07Choice, correction: g07Correction },
    'G08': { fill: g08Fill, choice: g08Choice, correction: g08Correction },
    'G09': { fill: g09Fill, choice: g09Choice, correction: g09Correction },
    'G10': { fill: g10Fill, choice: g10Choice, correction: g10Correction },
    'G11': { fill: g11Fill, choice: g11Choice, correction: g11Correction },
    'G12': { fill: g12Fill, choice: g12Choice, correction: g12Correction },
    'G13': { fill: g13Fill, choice: g13Choice, correction: g13Correction },
    'G14': { fill: g14Fill, choice: g14Choice, correction: g14Correction },
    'G15': { fill: g15Fill, choice: g15Choice, correction: g15Correction },
    'G16': { fill: g16Fill, choice: g16Choice, correction: g16Correction },
    'G17': { fill: g17Fill, choice: g17Choice, correction: g17Correction },
    'G18': { fill: g18Fill, choice: g18Choice, correction: g18Correction },
    'G19': { fill: g19Fill, choice: g19Choice, correction: g19Correction },
    'G20': { fill: g20Fill, choice: g20Choice, correction: g20Correction },
  };

  const questions = useMemo(() => {
    const typeMap = questionMap[grammarId];
    if (!typeMap) return [];
    return typeMap[pType] || [];
  }, [pType, grammarId]);
  const sessionDone = questions.length === 0 || idx >= questions.length;

  // ✅ 用 useEffect 记录练习结果，并用 ref 守卫，避免渲染体内调用 recordSession 导致无限重渲染卡死
  const practiceRecordedRef = useRef(false);
  useEffect(() => {
    if (sessionDone && idx > 0 && !practiceRecordedRef.current) {
      practiceRecordedRef.current = true;
      recordSession({
        module: 'grammar',
        exerciseType: pType === 'fill' ? 'grammar_fill' : pType === 'choice' ? 'grammar_choice' : 'grammar_correction',
        subjectId: grammarId, subjectName: gp?.nameZh || grammarId,
        correct: score, total: idx,
        duration: Math.round((Date.now() - startTime.current) / 1000),
      });
    }
  }, [sessionDone, idx, score, pType, grammarId, gp?.nameZh]);

  if (sessionDone) {
    return (
      <div className="text-center py-12 card">
        <p className="text-4xl mb-4">🎉</p>
        <h3 className="text-xl font-bold text-gray-800 mb-1">练习完成！</h3>
        <p className="text-gray-500 mb-4">得分：{score}/{idx}</p>
        <button onClick={onBack} className="btn-primary">返回</button>
      </div>
    );
  }

  const q = questions[idx];

  const handleAnswer = (correct: boolean, userAnswer: string) => {
    if (correct) setScore(score + 1);
    const exType = pType === 'fill' ? 'grammar_fill' : pType === 'choice' ? 'grammar_choice' : 'grammar_correction';
    const qa = q as any;
    const qText: string = pType === 'fill' ? (qa.sentence ?? '') : pType === 'choice' ? (qa.question ?? '') : (qa.sentence ?? '');
    recordAnswer({
      module: 'grammar', exerciseType: exType,
      subjectId: grammarId, subjectName: gp?.nameZh || grammarId,
      questionId: q.id,
      questionText: qText,
      userAnswer,
      correctAnswer: q.answer,
      isCorrect: correct,
    });
  };

  const nextQ = () => {
    setIdx(idx + 1);
  };

  const pTypeLabels: Record<PracticeType, string> = { fill: '填空', choice: '选择', correction: '改错' };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">← 返回</button>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-500">{allGrammarPoints.find(g => g.id === grammarId)?.nameZh} · 练习</span>
      </div>

      {/* 切换题型 */}
      <div className="flex gap-2 mb-4">
        {(Object.keys(pTypeLabels) as PracticeType[]).map(pt => (
          <button key={pt}
            onClick={() => { setPType(pt); setIdx(0); setScore(0); practiceRecordedRef.current = false; }}
            className={`px-3 py-1 rounded text-sm ${pType === pt ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-600'}`}
          >
            {pt === 'fill' ? '✏️ 填空' : pt === 'choice' ? '📋 选择' : '🔧 改错'}
          </button>
        ))}
      </div>

      {/* key={q.id} 确保每道题渲染独立的 QuestionCard 实例 */}
      <div className="card max-w-2xl">
        {/* 进度 & 得分 */}
        <div className="flex justify-between text-xs text-gray-400 mb-4">
          <span>第 {idx + 1} / {questions.length} 题</span>
          <span>得分: {score}</span>
        </div>

        <QuestionCard
          key={q.id}
          q={q}
          pType={pType}
          onAnswer={handleAnswer}
          onNext={nextQ}
        />
      </div>
    </div>
  );
}

// ========== 综合测验页 ==========
function QuizPage({ onBack }: { onBack: () => void }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const { recordAnswer, recordSession } = useProgressStore();
  const startTime = useRef(Date.now());

  // 从所有考点的所有题型中随机抽取20道题
  const allQuestions = useMemo(() => {
    const fillArrays: GrammarFillQuestion[] = [
      ...g01Fill, ...g02Fill, ...g03Fill, ...g04Fill,
      ...g05Fill, ...g06Fill, ...g07Fill, ...g08Fill,
      ...g09Fill, ...g10Fill, ...g11Fill, ...g12Fill,
      ...g13Fill, ...g14Fill, ...g15Fill, ...g16Fill,
      ...g17Fill, ...g18Fill, ...g19Fill, ...g20Fill,
    ];
    const choiceArrays: GrammarChoiceQuestion[] = [
      ...g01Choice, ...g02Choice, ...g03Choice, ...g04Choice,
      ...g05Choice, ...g06Choice, ...g07Choice, ...g08Choice,
      ...g09Choice, ...g10Choice, ...g11Choice, ...g12Choice,
      ...g13Choice, ...g14Choice, ...g15Choice, ...g16Choice,
      ...g17Choice, ...g18Choice, ...g19Choice, ...g20Choice,
    ];
    const correctionArrays: GrammarCorrectionQuestion[] = [
      ...g01Correction, ...g02Correction, ...g03Correction, ...g04Correction,
      ...g05Correction, ...g06Correction, ...g07Correction, ...g08Correction,
      ...g09Correction, ...g10Correction, ...g11Correction, ...g12Correction,
      ...g13Correction, ...g14Correction, ...g15Correction, ...g16Correction,
      ...g17Correction, ...g18Correction, ...g19Correction, ...g20Correction,
    ];

    // 统一格式
    const normalized: QuizQuestion[] = [
      ...fillArrays.map(q => ({
        id: q.id, type: 'fill' as PracticeType,
        sentence: q.sentence, options: q.options,
        answer: q.answer, explanation: q.explanation,
      })),
      ...choiceArrays.map(q => ({
        id: q.id, type: 'choice' as PracticeType,
        question: q.question, options: q.options,
        answer: q.answer, explanation: q.explanation,
      })),
      ...correctionArrays.map(q => {
        // 改错题：正确答案 + 原句 + 干扰项，去重
        const base = [q.answer, q.sentence];
        const d = makeDistractor(q.sentence, q.answer);
        if (d) base.push(d);
        const uniq = [...new Set(base)];
        // 打乱顺序
        for (let i = uniq.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [uniq[i], uniq[j]] = [uniq[j], uniq[i]];
        }
        return {
          id: q.id, type: 'correction' as PracticeType,
          sentence: q.sentence,
          options: uniq,
          answer: q.answer, explanation: q.explanation,
        };
      }),
    ];

    // Fisher-Yates 随机打乱，取前20题
    for (let i = normalized.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [normalized[i], normalized[j]] = [normalized[j], normalized[i]];
    }
    return normalized.slice(0, 20);
  }, []);

  const quizDone = idx >= allQuestions.length;

  // ✅ 用 useEffect 记录综合测验结果，并用 ref 守卫避免 StrictMode 重复记录
  const quizRecordedRef = useRef(false);
  useEffect(() => {
    if (quizDone && !quizRecordedRef.current) {
      quizRecordedRef.current = true;
      recordSession({
        module: 'grammar', exerciseType: 'quiz',
        subjectId: 'quiz', subjectName: '语法综合测验',
        correct: score, total: allQuestions.length,
        duration: Math.round((Date.now() - startTime.current) / 1000),
      });
    }
  }, [quizDone, score, allQuestions.length]);

  if (quizDone) {
    const pct = Math.round((score / allQuestions.length) * 100);
    return (
      <div className="text-center py-12 card max-w-lg mx-auto">
        <p className="text-5xl mb-4">{pct >= 80 ? '🎉' : pct >= 60 ? '💪' : '📚'}</p>
        <h3 className="text-xl font-bold text-gray-800 mb-1">综合测验完成！</h3>
        <p className="text-3xl font-bold mb-2"
          style={{ color: pct >= 80 ? '#16a34a' : pct >= 60 ? '#eab308' : '#dc2626' }}
        >
          {score} / {allQuestions.length} ({pct}%)
        </p>
        <p className="text-sm text-gray-400 mb-6">
          {pct >= 80 ? '太棒了！你已经掌握得很好！' : pct >= 60 ? '还不错，继续加油！' : '还需要多加练习哦！'}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setIdx(0); setScore(0); startTime.current = Date.now(); quizRecordedRef.current = false; }}
            className="btn-primary">
            🔄 再测一次
          </button>
          <button onClick={onBack}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
            返回列表
          </button>
        </div>
      </div>
    );
  }

  const q = allQuestions[idx];
  const typeLabels: Record<PracticeType, string> = { fill: '填空', choice: '选择', correction: '改错' };
  const typeIcons: Record<PracticeType, string> = { fill: '✏️', choice: '📋', correction: '🔧' };

  const handleAnswer = (correct: boolean, userAnswer: string) => {
    if (correct) setScore(score + 1);
    const exType = q.type === 'fill' ? 'grammar_fill' : q.type === 'choice' ? 'grammar_choice' : 'grammar_correction';
    const qText: string = q.type === 'fill' ? (q.sentence ?? '') : q.type === 'choice' ? (q.question ?? '') : (q.sentence ?? '');
    recordAnswer({
      module: 'grammar', exerciseType: exType,
      subjectId: 'quiz', subjectName: '语法综合测验',
      questionId: q.id,
      questionText: qText,
      userAnswer,
      correctAnswer: q.answer,
      isCorrect: correct,
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">← 返回</button>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-500">综合测验</span>
      </div>

      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{typeIcons[q.type]} {typeLabels[q.type]}</span>
          <span>第 {idx + 1} / {allQuestions.length} 题 · 得分: {score}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${(idx / allQuestions.length) * 100}%` }} />
        </div>
      </div>

      {/* key={q.id} 确保每道题渲染独立的 QuestionCard 实例 */}
      <div className="card max-w-2xl">
        <QuestionCard
          key={q.id}
          q={q}
          pType={q.type}
          onAnswer={handleAnswer}
          onNext={() => setIdx(idx + 1)}
        />
      </div>
    </div>
  );
}

// ========== 主页面 ==========
export default function GrammarPage() {
  const [mode, setMode] = useState<GrammarMode>('list');
  const [selectedGrammar, setSelectedGrammar] = useState<string>('');
  const navigate = useNavigate();

  if (mode === 'learn') return <LearnPage grammarId={selectedGrammar} onBack={() => setMode('list')} />;
  if (mode === 'practice') return <PracticePage grammarId={selectedGrammar} onBack={() => setMode('list')} />;
  if (mode === 'quiz') return <QuizPage onBack={() => setMode('list')} />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 text-sm hover:underline flex items-center gap-1"
        >← 返回首页</button>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">📝 语法学习</h2>
      <p className="text-sm text-gray-400 mb-6">20 个 KET 核心语法考点，讲解 + 练习 + 测验</p>

      {/* 功能标签 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>📋 考点列表</span>
        <button
          onClick={() => setMode('quiz')}
          className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
        >
          🎯 综合测验
        </button>
      </div>

      {/* 语法点卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allGrammarPoints.map((gp) => (
          <div key={gp.id} className="card">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">{gp.id}</span>
              <div>
                <h4 className="font-semibold text-gray-800">{gp.nameZh}</h4>
                <p className="text-xs text-gray-400">{gp.name}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { setSelectedGrammar(gp.id); setMode('learn'); }}
                className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded hover:bg-blue-100"
              >
                📖 讲解
              </button>
              <button
                onClick={() => { setSelectedGrammar(gp.id); setMode('practice'); }}
                className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded hover:bg-green-100"
              >
                ✏️ 练习
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
