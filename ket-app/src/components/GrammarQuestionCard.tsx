// ========== 可复用的语法题卡片 ==========
// 处理填空/选择/改错三种题型，作答后即时反馈并回调 onResult，点击"继续"回调 onNext。
// 样式与 GrammarPage 的 QuestionCard 保持一致。
import { useState, useMemo } from 'react';
import type { PracticeTypeLite } from '../data/grammarRoadmap';

function makeDistractor(wrong: string, correct: string): string | null {
  const strategies: Array<(w: string, _c: string) => string | null> = [
    (w, _c) => { const i = w.indexOf(' '); return i > 0 ? w.slice(0, i) + ' ' + w.slice(i + 1).replace(/s\b/, '') : null; },
    (_w, _c) => _w.replace(/\./g, '!'),
    (w, _c) => { const m = w.match(/\b(\w{3,})\b/); return m ? w.replace(m[1], m[1] + 's') : null; },
    (w, _c) => { const i = w.lastIndexOf(' '); return i > 0 ? w.slice(0, i) + ' not' + w.slice(i).replace(/^\s/, '') : null; },
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

function btnClass(
  opt: string,
  answer: string,
  selected: string | null,
  result: 'correct' | 'wrong' | null,
): string {
  if (!selected || !result) {
    return 'border-gray-200 hover:bg-blue-50 hover:border-blue-300 px-4 py-2.5 rounded-lg border transition-all';
  }
  if (opt === answer) {
    return 'bg-green-50 border-green-300 text-green-700 font-medium px-4 py-2.5 rounded-lg border transition-all';
  }
  if (opt === selected) {
    return 'bg-red-50 border-red-300 text-red-700 px-4 py-2.5 rounded-lg border transition-all';
  }
  return 'border-gray-200 opacity-50 px-4 py-2.5 rounded-lg border transition-all';
}

export function GrammarQuestionCard({
  q,
  pType,
  onResult,
  onNext,
}: {
  q: any;
  pType: PracticeTypeLite;
  onResult: (correct: boolean, userAnswer: string) => void;
  onNext: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  const corrOptions = useMemo((): string[] => {
    if (q.options && Array.isArray(q.options) && q.options.length >= 2) {
      const uniq = [...new Set(q.options)] as string[];
      return uniq.slice(0, Math.min(uniq.length, 3));
    }
    const base = [q.answer, q.sentence];
    const d = makeDistractor(q.sentence, q.answer);
    if (d) base.push(d);
    const uniq = [...new Set(base)];
    for (let i = uniq.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uniq[i], uniq[j]] = [uniq[j], uniq[i]];
    }
    return uniq;
  }, [q.id]);

  const displayOptions = useMemo(() => {
    const shuffled = [...(q.options || [])];
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
    onResult(correct, opt);
  };

  const typeHint = pType === 'fill' ? '请选择正确的词填空' : pType === 'choice' ? '请选择正确答案' : '请选出正确的句子';
  return (
    <>
      {typeHint && <p className="text-sm text-gray-400 mb-3">{typeHint}</p>}
      {pType === 'fill' ? (
        <div className="mb-6">
          <p
            className="text-lg text-gray-800 mb-4"
            dangerouslySetInnerHTML={{
              __html: q.sentence.replace(
                '____',
                '<span class="inline-block w-24 border-b-2 border-blue-300 mx-1"></span>',
              ),
            }}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {displayOptions.map((opt: string) => (
              <button
                key={`${q.id}-${opt}`}
                onClick={() => handleSelect(opt)}
                disabled={!!result}
                className={btnClass(opt, q.answer, selected, result)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : pType === 'choice' ? (
        <div className="mb-6">
          <p className="text-base font-medium text-gray-800 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
            {q.question}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {displayOptions.map((opt: string, i: number) => (
              <button
                key={`${q.id}-${opt}`}
                onClick={() => handleSelect(opt)}
                disabled={!!result}
                className={btnClass(opt, q.answer, selected, result)}
              >
                {String.fromCharCode(65 + i)}. {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
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
                    opacity: result && !isCorrect && !isSelected ? 0.5 : 1,
                    textAlign: 'left' as const,
                    fontSize: '15px',
                    transition: 'all 0.15s',
                    userSelect: 'none',
                  }}
                  onMouseEnter={(e) => { if (!result) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                  onMouseLeave={(e) => { if (!result) e.currentTarget.style.backgroundColor = '#ffffff'; }}
                >
                  {opt}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {result && (
        <div className={`mt-4 p-4 rounded-xl ${result === 'correct' ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`font-bold ${result === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
            {result === 'correct' ? '✅ 回答正确！' : `❌ 正确答案是：${q.answer}`}
          </p>
          <p className={`text-sm mt-1 ${result === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{q.explanation}</p>
          <button onClick={onNext} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            继续 →
          </button>
        </div>
      )}
    </>
  );
}
