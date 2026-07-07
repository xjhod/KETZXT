import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  part1Articles, part2Articles, part3ClozeArticles,
  part3RCArticles, part4TFArticles, part5Articles,
} from '../data/reading';
import { useProgressStore } from '../store/useProgressStore';

type ReadingPart = 'part1' | 'part2' | 'part3c' | 'part3r' | 'part4' | 'part5';

const PART_INFO: Record<ReadingPart, { label: string; icon: string; desc: string; color: string }> = {
  part1:   { label: 'Part 1 看图配对', icon: '\uD83D\uDDBC\uFE0F', desc: '5张图片 + 8个句子，选出匹配项', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  part2:   { label: 'Part 2 信息匹配', icon: '\uD83D\uDD17', desc: '5个人物 + 8则信息，谁需要什么', color: 'bg-green-50 text-green-700 border-green-200' },
  part3c:  { label: 'Part 3-1 完形填空', icon: '\uD83D\uDCDD', desc: '短文6空格，三选一', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  part3r:  { label: 'Part 3-2 阅读选择', icon: '\uD83D\uDCD6', desc: '文章 + 7道四选一选择题', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  part4:   { label: 'Part 4 正误判断', icon: '\u2705', desc: '长文 + T/F/DN 判断题', color: 'bg-red-50 text-red-700 border-red-200' },
  part5:   { label: 'Part 5 开放填空', icon: '\u270D\uFE0F', desc: '短文挖空，填写合适单词', color: 'bg-teal-50 text-teal-700 border-teal-200' },
};

// ==================== Part 1 ====================
function Part1View({ article }: { article: typeof part1Articles[0] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  // ✅ 存储每个题目的打乱后选项（只在初始化时打乱一次）
  const [shuffledMap, setShuffledMap] = useState<Record<string, string[]>>({});
  useEffect(() => {
    const map: Record<string, string[]> = {};
    article.questions.forEach(q => {
      const arr = [...(q.options || [])];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      map[q.id] = arr;
    });
    setShuffledMap(map);
  }, [article.id]);
  const { recordAnswer, recordSession } = useProgressStore();

  const handleSelect = (qId: string, opt: string) => {
    if (showResult) return;
    setAnswers(prev => ({ ...prev, [qId]: opt }));
  };

  const score = useMemo(() => {
    let correct = 0;
    article.questions.forEach(q => { if (answers[q.id] === q.answer) correct++; });
    return correct;
  }, [answers, showResult]);

  const handleSubmit = () => {
    article.questions.forEach(q => {
      const isCorrect = answers[q.id] === q.answer;
      recordAnswer({
        module: 'reading', exerciseType: 'reading_p1',
        subjectId: article.id, subjectName: article.titleZh,
        questionId: q.id,
        questionText: `[Part1] ${q.imageDesc}`,
        userAnswer: answers[q.id] || '',
        correctAnswer: q.answer,
        isCorrect,
      });
    });
    const correct = article.questions.filter(q => answers[q.id] === q.answer).length;
    recordSession({
      module: 'reading', exerciseType: 'reading_p1',
      subjectId: article.id, subjectName: article.titleZh,
      correct, total: article.questions.length, duration: 0,
    });
    setShowResult(true);
  };

  const scoreLabel = score >= 4 ? '太棒了！继续加油！' : score >= 3 ? '还不错，再接再厉！' : '需要多加练习哦！';
  const scoreColor = score >= 4 ? '#16a34a' : score >= 3 ? '#eab308' : '#dc2626';

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">{article.titleZh}</h3>
        {!showResult && Object.keys(answers).length === article.questions.length && (
          <button onClick={handleSubmit} className="btn-primary text-sm">提交答案</button>
        )}
      </div>
      <div className="space-y-4">
        {article.questions.map((q, i) => {
          const isCorrect = answers[q.id] === q.answer;
          return (
            <div key={q.id} className="card p-4">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-5xl">{q.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">题目 {i + 1}</p>
                  <p className="text-xs text-gray-400">{q.imageDesc}</p>
                </div>
                {showResult && (
                  <span className={`text-lg font-bold px-2 py-1 rounded ${isCorrect ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(shuffledMap[q.id] || q.options).map((opt) => {
                  const selected = answers[q.id] === opt;
                  let cls = 'border px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ';
                  if (showResult) {
                    if (opt === q.answer) cls += 'bg-green-50 border-green-300 text-green-800 font-medium';
                    else if (selected && opt !== q.answer) cls += 'bg-red-50 border-red-300 text-red-700';
                    else cls += 'border-gray-200 text-gray-400 opacity-50';
                  } else {
                    if (selected) cls += 'border-blue-300 bg-blue-50 text-blue-800';
                    else cls += 'border-gray-200 hover:border-blue-200 hover:bg-gray-50 text-gray-700';
                  }
                  return (<div key={opt} onClick={() => handleSelect(q.id, opt)} className={cls}>{opt}</div>);
                })}
              </div>
            </div>
          );
        })}
      </div>
      {showResult && (
        <div className="mt-4 card p-4 text-center">
          <p className="text-2xl font-bold mb-1" style={{ color: scoreColor }}>得分：{score} / {article.questions.length}</p>
          <p className="text-sm text-gray-500">{scoreLabel}</p>
        </div>
      )}
    </div>
  );
}

// ==================== Part 2 ====================
// 数据结构：people[] 人物列表, statements[] 陈述列表, answers[] 位置映射 (answers[i] = personId)
// 用户操作：先点击人物卡片选中，再点击下方陈述将其分配给该人物
function Part2View({ article }: { article: typeof part2Articles[0] }) {
  // answers: statementIndex → personId
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [activePerson, setActivePerson] = useState<string | null>(null);
  const { recordAnswer, recordSession } = useProgressStore();

  const handleSubmit = () => {
    article.statements.forEach((stmt, i) => {
      const userPersonId = answers[i] || '';
      const correctPersonId = article.answers[i] || '';
      const userPerson = article.people.find(p => p.id === userPersonId);
      const correctPerson = article.people.find(p => p.id === correctPersonId);
      recordAnswer({
        module: 'reading', exerciseType: 'reading_p2',
        subjectId: article.id, subjectName: article.titleZh,
        questionId: `p2-${article.id}-s${i}`,
        questionText: `[Part2] ${stmt}`,
        userAnswer: userPerson?.name || '（未作答）',
        correctAnswer: correctPerson?.name || '',
        isCorrect: userPersonId === correctPersonId,
      });
    });
    const correctStatements = article.statements.filter((_, i) => answers[i] === article.answers[i]).length;
    recordSession({
      module: 'reading', exerciseType: 'reading_p2',
      subjectId: article.id, subjectName: article.titleZh,
      correct: correctStatements, total: article.statements.length, duration: 0,
    });
    setShowResult(true);
  };

  // 点击陈述 → 分配给当前选中的人物
  const handleStatementClick = (stmtIdx: number) => {
    if (showResult) return;
    let targetPerson = activePerson;
    if (!targetPerson) return;
    setAnswers(prev => {
      const next = { ...prev };
      next[stmtIdx] = targetPerson!;
      return next;
    });
  };

  // 取消某条陈述的匹配
  const removeMatch = (stmtIdx: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (showResult) return;
    setAnswers(prev => { const n = { ...prev }; delete n[stmtIdx]; return n; });
  };

  const score = useMemo(() => {
    let c = 0;
    article.statements.forEach((_, i) => { if (answers[i] === article.answers[i]) c++; });
    return c;
  }, [answers, showResult]);
  const totalStatements = article.statements.length;
  const answeredCount = Object.keys(answers).length;
  const sc = score >= 7 ? '#16a34a' : score >= 5 ? '#eab308' : '#dc2626';

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">{article.titleZh}</h3>
        {!showResult && answeredCount >= totalStatements && (
          <button onClick={handleSubmit} className="btn-primary text-sm">提交答案 ({answeredCount}/{totalStatements})</button>
        )}
      </div>

      {/* 操作提示 */}
      {!showResult && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          💡 <strong>操作方法：</strong>先点击上方人物卡片选中，再点击下方陈述将其分配给该人物。每条陈述对应一个人物。
          {activePerson && <span className="block mt-1 font-medium">→ 当前选中：<span className="text-blue-700">{article.people.find(p => p.id === activePerson)?.name}</span></span>}
        </div>
      )}

      {/* 人物卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {article.people.map(p => {
          const isActive = activePerson === p.id;
          const matchedCount = Object.values(answers).filter(a => a === p.id).length;
          const isAllCorrect = showResult && article.statements.every((_, i) => article.answers[i] !== p.id || answers[i] === p.id);
          const isAnyCorrect = showResult && Object.entries(answers).some(([idx, a]) => a === p.id && article.answers[Number(idx)] === p.id);
          const isAnyWrong = showResult && Object.entries(answers).some(([idx, a]) => a === p.id && article.answers[Number(idx)] !== p.id);

          let ringClass = '';
          if (showResult) {
            if (isAllCorrect) ringClass = 'ring-2 ring-green-300 bg-green-50/30';
            else if (isAnyWrong) ringClass = 'ring-2 ring-red-300 bg-red-50/30';
            else if (isAnyCorrect) ringClass = 'ring-2 ring-yellow-300 bg-yellow-50/30';
          } else {
            ringClass = isActive ? 'ring-2 ring-blue-400 bg-blue-50/40' : '';
          }

          return (
            <div
              key={p.id}
              onClick={() => !showResult && setActivePerson(isActive ? null : p.id)}
              className={`card p-3 text-center cursor-pointer transition-all hover:shadow-md ${ringClass}`}
            >
              <p className="font-semibold text-sm text-gray-800">{p.name}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
              {matchedCount > 0 && (
                <p className="text-xs text-blue-500 mt-1">📎 {matchedCount} 条陈述</p>
              )}
            </div>
          );
        })}
      </div>

      {/* 陈述列表 */}
      <h4 className="font-semibold text-sm text-gray-600 mb-2">
        陈述列表（共 {totalStatements} 条）
      </h4>
      <div className="space-y-2">
        {article.statements.map((stmt, i) => {
          const assignedPersonId = answers[i];
          const assignedPerson = assignedPersonId ? article.people.find(p => p.id === assignedPersonId) : null;
          const correctPersonId = article.answers[i];
          const correctPerson = article.people.find(p => p.id === correctPersonId);
          const isCorrect = showResult && assignedPersonId === correctPersonId;
          const isWrong = showResult && !!assignedPersonId && assignedPersonId !== correctPersonId;

          let cls = 'card p-3 cursor-pointer transition-all border ';
          if (showResult) {
            if (isCorrect) cls += 'border-green-300 bg-green-50';
            else if (isWrong) cls += 'border-red-300 bg-red-50';
            else cls += 'border-gray-200 opacity-60';
          } else {
            if (assignedPerson) cls += 'border-blue-300 bg-blue-50 ring-1 ring-blue-200';
            else if (activePerson) cls += 'border-blue-300 border-dashed hover:bg-blue-50/50';
            else cls += 'border-gray-200 hover:border-blue-200 hover:bg-gray-50';
          }

          return (
            <div key={i} onClick={() => handleStatementClick(i)} className={cls}>
              <div className="flex items-start gap-2">
                <span className="inline-block w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold leading-6 text-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-gray-700 leading-relaxed flex-1">{stmt}</p>
                {assignedPerson && !showResult && (
                  <div className="relative group flex-shrink-0">
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">{assignedPerson.name}</span>
                    <button
                      onClick={(e) => removeMatch(i, e)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity leading-4 text-center"
                    >✕</button>
                  </div>
                )}
                {showResult && isWrong && (
                  <span className="text-xs text-green-600 flex-shrink-0">→ {correctPerson?.name}</span>
                )}
                {showResult && isCorrect && <span className="text-xs text-green-600 flex-shrink-0">✓</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* 进度指示 + 提交按钮 */}
      {!showResult && answeredCount > 0 && answeredCount < totalStatements && (
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-400">已匹配 {answeredCount}/{totalStatements} 条</span>
          <span className="mx-2 text-gray-300">|</span>
          <button onClick={handleSubmit} className="text-sm text-orange-500 hover:text-orange-600 underline">提前交卷</button>
        </div>
      )}

      {showResult && (
        <div className="mt-4 card p-4 text-center">
          <p className="text-2xl font-bold mb-1" style={{ color: sc }}>{score}/{totalStatements}</p>
          <p className="text-sm text-gray-500">{score >= 7 ? '很棒的信息匹配能力！' : score >= 5 ? '继续努力！' : '多读几遍人物描述哦！'}</p>
        </div>
      )}
    </div>
  );
}

// ==================== Part 3-1 完形填空 ====================
function Part3ClozeView({ article }: { article: typeof part3ClozeArticles[0] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  // ✅ 存储每个空格的打乱后选项（只在初始化时打乱一次）
  const [shuffledMap, setShuffledMap] = useState<Record<string, string[]>>({});
  useEffect(() => {
    const map: Record<string, string[]> = {};
    article.blanks.forEach(b => {
      const arr = [...(b.options || [])];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      map[b.id] = arr;
    });
    setShuffledMap(map);
  }, [article.id]);
  const { recordAnswer, recordSession } = useProgressStore();

  const selectOpt = (bid: string, o: string) => { if (!showResult) setAnswers(p => ({ ...p, [bid]: o })); };
  const score = useMemo(() => { let c = 0; article.blanks.forEach(b => { if (answers[b.id] === b.answer) c++; }); return c; }, [answers, showResult]);

  const handleSubmit = () => {
    article.blanks.forEach(b => {
      const isCorrect = answers[b.id] === b.answer;
      recordAnswer({
        module: 'reading', exerciseType: 'reading_p3',
        subjectId: article.id, subjectName: article.titleZh,
        questionId: b.id,
        questionText: `[完形填空] 第${b.position}空: ${b.options.join(' / ')}`,
        userAnswer: answers[b.id] || '（未作答）',
        correctAnswer: b.answer,
        isCorrect,
      });
    });
    const correct = article.blanks.filter(b => answers[b.id] === b.answer).length;
    recordSession({
      module: 'reading', exerciseType: 'reading_p3',
      subjectId: article.id, subjectName: article.titleZh,
      correct, total: article.blanks.length, duration: 0,
    });
    setShowResult(true);
  };

  // 渲染文章中的填空位置
  const renderPassageSpans = () => {
    // ✅ 修复：匹配实际数据格式 (1) ____ 而不是 ___(1)
    const regex = /\(\d+\)\s*____/g;
    const parts = article.passage.split(regex);
    const out: React.ReactNode[] = [];
    parts.forEach((part, idx) => {
      out.push(<span key={'t' + idx}>{part}</span>);
      if (idx < article.blanks.length) {
        const blank = article.blanks[idx];
        const sel = answers[blank.id];
        const ok = sel === blank.answer;
        if (showResult) {
          const bcls = ok ? 'px-2 py-1 rounded text-sm font-medium bg-green-100 text-green-800 border border-green-300'
            : 'px-2 py-1 rounded text-sm font-medium bg-red-100 text-red-800 border border-red-300';
          out.push(<span key={'b' + idx}>
            <span className="inline-flex items-center mx-1 align-middle">
              <span className={bcls}>{ok ? (sel || '?') : `${sel || '?'} → ${blank.answer}`}</span>
            </span>
          </span>);
        } else {
          const dcls = sel
            ? 'inline-flex items-center border-b-2 min-w-[80px] justify-center px-2 py-0.5 border-blue-400 text-blue-700'
            : 'inline-flex items-center border-b-2 border-dashed min-w-[80px] justify-center px-2 py-0.5 border-gray-300 text-gray-400';
          out.push(<span key={'b' + idx}>
            <span className="inline-flex items-center mx-1 align-middle"><span className={dcls}>{sel || `(${blank.position})`}</span></span>
          </span>);
        }
      }
    });
    return out;
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">{article.titleZh}</h3>
        {!showResult && Object.keys(answers).length === article.blanks.length && (
          <button onClick={handleSubmit} className="btn-primary text-sm">提交答案</button>
        )}
      </div>

      {/* 文章区域 */}
      <div className="card p-5 mb-4 prose prose-sm max-w-none text-gray-700 leading-relaxed text-base whitespace-pre-line">{renderPassageSpans()}</div>

      {/* 题目选项 */}
      <h4 className="font-semibold text-sm text-gray-600 mb-3">请为每个空格选择正确的词：</h4>
      <div className="space-y-3">
        {article.blanks.map(blank => {
          const sel = answers[blank.id];
          const ok = sel === blank.answer;
          return (
            <div key={blank.id} className={`card p-3 ${showResult && !ok && sel ? 'border-red-200 bg-red-50/20' : ''}`}>
              <p className="text-sm font-medium text-gray-700 mb-2">第 {blank.position} 题</p>
              <div className="flex gap-2 flex-wrap">
                {(shuffledMap[blank.id] || blank.options).map(opt => {
                  let cls = 'px-3 py-1.5 rounded-lg text-sm border transition-all cursor-pointer ';
                  if (showResult) {
                    if (opt === blank.answer) cls += 'bg-green-50 border-green-300 text-green-800 font-medium';
                    else if (sel === opt) cls += 'bg-red-50 border-red-300 text-red-700';
                    else cls += 'border-gray-200 text-gray-400 opacity-50';
                  } else {
                    if (sel === opt) cls += 'bg-blue-50 border-blue-300 text-blue-800';
                    else cls += 'border-gray-200 hover:bg-gray-50 text-gray-700';
                  }
                  return (<div key={opt} onClick={() => selectOpt(blank.id, opt)} className={cls}>{opt}</div>);
                })}
              </div>
              {showResult && (<p className="text-xs mt-2 text-gray-500 bg-gray-50 p-2 rounded">💡 {blank.explanation}</p>)}
            </div>
          );
        })}
      </div>

      {showResult && (
        <>
          <div className="mt-4 card p-4 text-center">
            <p className="text-2xl font-bold mb-1" style={{ color: score >= 5 ? '#16a34a' : score >= 3 ? '#eab308' : '#dc2626' }}>
              {score} / {article.blanks.length}
            </p>
            <p className="text-sm text-gray-500">{score >= 5 ? '完形填空掌握很好！' : score >= 3 ? '还不错，注意语法细节！' : '多背固定搭配和语法规则哦！'}</p>
          </div>
          <details className="mt-3 card p-4">
            <summary className="cursor-pointer text-sm font-medium text-blue-600">查看完整原文（含答案）</summary>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-line">{article.passageFull}</p>
          </details>
        </>
      )}
    </div>
  );
}

// ==================== Part 3-2 阅读选择 ====================
function Part3RCView({ article }: { article: typeof part3RCArticles[0] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [showTrans, setShowTrans] = useState(false);
  // ✅ 存储每个题目的打乱后选项（只在初始化时打乱一次）
  const [shuffledMap, setShuffledMap] = useState<Record<string, string[]>>({});
  useEffect(() => {
    const map: Record<string, string[]> = {};
    article.questions.forEach(q => {
      const arr = [...(q.options || [])];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      map[q.id] = arr;
    });
    setShuffledMap(map);
  }, [article.id]);
  const { recordAnswer, recordSession } = useProgressStore();
  const doSel = (qid: string, opt: string) => { if (!showResult) setAnswers(p => ({ ...p, [qid]: opt })); };
  const score = useMemo(() => { let c = 0; article.questions.forEach(q => { if (answers[q.id] === q.answer) c++; }); return c; }, [answers, showResult]);
  const scCol = score >= 6 ? '#16a34a' : score >= 4 ? '#eab308' : '#dc2626';

  const handleSubmit = () => {
    article.questions.forEach(q => {
      const isCorrect = answers[q.id] === q.answer;
      recordAnswer({
        module: 'reading', exerciseType: 'reading_p3',
        subjectId: article.id, subjectName: article.titleZh,
        questionId: q.id,
        questionText: q.question,
        userAnswer: answers[q.id] || '（未作答）',
        correctAnswer: q.answer,
        isCorrect,
      });
    });
    const correct = article.questions.filter(q => answers[q.id] === q.answer).length;
    recordSession({
      module: 'reading', exerciseType: 'reading_p3',
      subjectId: article.id, subjectName: article.titleZh,
      correct, total: article.questions.length, duration: 0,
    });
    setShowResult(true);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">{article.titleZh}</h3>
        <button onClick={() => setShowTrans(!showTrans)} className="text-xs text-blue-600 hover:underline">
          {showTrans ? '隐藏译文' : '显示中文译文'}
        </button>
      </div>
      {/* 文章 */}
      <div className="card p-5 mb-4 max-w-none">
        <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">{article.article}</p>
        {showTrans && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-400 mb-2">中文参考译文</p>
            <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{article.articleZh}</p>
          </div>
        )}
      </div>
      {/* 问题 */}
      <h4 className="font-semibold text-sm text-gray-600 mb-3">阅读文章，回答以下问题：</h4>
      <div className="space-y-3">
        {article.questions.map((q, qi) => {
          const sel = answers[q.id];
          const ok = sel === q.answer;
          return (<div key={q.id} className={`card p-4 ${showResult && !ok && sel ? 'border-red-200 bg-red-50/10' : ''}`}>
            <p className="text-sm font-medium text-gray-800 mb-1">{qi + 1}. {q.question}</p>
            <p className="text-xs text-gray-400 mb-3">{q.questionZh}</p>
            <div className="space-y-1.5">
              {(shuffledMap[q.id] || q.options).map(opt => {
                let cls = 'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all cursor-pointer ';
                if (showResult) {
                  if (opt === q.answer) cls += 'bg-green-50 border-green-300 text-green-800';
                  else if (sel === opt) cls += 'bg-red-50 border-red-300 text-red-700';
                  else cls += 'border-gray-100 text-gray-500 opacity-50';
                } else {
                  if (sel === opt) cls += 'bg-blue-50 border-blue-300 text-blue-800';
                  else cls += 'border-gray-200 hover:bg-gray-50 text-gray-700';
                }
                const ol = String.fromCharCode(65 + q.options.indexOf(opt));
                return (<div key={opt} onClick={() => doSel(q.id, opt)} className={cls}>
                  <span className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center text-xs ${
                    showResult && opt === q.answer ? 'bg-green-500 text-white border-green-500' :
                    showResult && sel === opt ? 'bg-red-500 text-white border-red-500' :
                    sel === opt ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300'
                  }`}>{showResult && opt === q.answer ? '✓' : showResult && sel === opt ? '✗' : ol}</span>
                  {opt}
                </div>);
              })}
            </div>
            {showResult && (<p className="text-xs mt-2 text-gray-500 bg-gray-50 p-2 rounded">💡 {q.explanation}</p>)}
          </div>);
        })}
      </div>
      {!showResult && Object.keys(answers).length === article.questions.length && (
        <button onClick={handleSubmit} className="btn-primary w-full mt-4">提交答案</button>
      )}
      {showResult && (<div className="mt-4 card p-4 text-center">
        <p className="text-2xl font-bold mb-1" style={{ color: scCol }}>{score}/{article.questions.length}</p>
        <p className="text-sm text-gray-500">{score >= 6 ? '阅读理解能力很强！' : score >= 4 ? '不错，多练习找关键句！' : '仔细阅读文章，答案都在文中哦！'}</p>
      </div>)}
    </div>
  );
}

// ==================== Part 4 正误判断 ====================
function Part4TFView({ article }: { article: typeof part4TFArticles[0] }) {
  const [ans, setAns] = useState<Record<string, 'T'|'F'|'DN'>>({});
  const [done, setDone] = useState(false);
  const [trans, setTrans] = useState(false);
  const { recordAnswer, recordSession } = useProgressStore();
  const pick = (id: string, v: 'T'|'F'|'DN') => {
    if (done) return;
    setAns(prev => { if (prev[id] === v) { const n = { ...prev }; delete n[id]; return n; } return { ...prev, [id]: v }; });
  };
  const score = useMemo(() => { let c = 0; article.statements.forEach(s => { if (ans[s.id] === s.answer) c++; }); return c; }, [ans, done]);
  const lbls: Record<'T'|'F'|'DN', string> = { T: 'TRUE ✓', F: 'FALSE ✗', DN: 'DN ○' };

  const handleSubmit = () => {
    article.statements.forEach(stmt => {
      const isCorrect = ans[stmt.id] === stmt.answer;
      recordAnswer({
        module: 'reading', exerciseType: 'reading_p4',
        subjectId: article.id, subjectName: article.titleZh,
        questionId: stmt.id,
        questionText: stmt.statement,
        userAnswer: ans[stmt.id] || '（未作答）',
        correctAnswer: stmt.answer,
        isCorrect,
      });
    });
    const correct = article.statements.filter(s => ans[s.id] === s.answer).length;
    recordSession({
      module: 'reading', exerciseType: 'reading_p4',
      subjectId: article.id, subjectName: article.titleZh,
      correct, total: article.statements.length, duration: 0,
    });
    setDone(true);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">{article.titleZh}</h3>
        <button onClick={() => setTrans(!trans)} className="text-xs text-blue-600 hover:underline">{trans ? '隐藏译文' : '显示中文译文'}</button>
      </div>
      {/* 文章 */}
      <div className="card p-5 mb-4 max-w-none">
        <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">{article.article}</p>
        {trans && (<div className="mt-4 pt-4 border-t border-gray-100"><p className="text-xs font-medium text-gray-400 mb-2">中文参考译文</p><p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{article.articleZh}</p></div>)}
      </div>
      {/* 判断题 */}
      <h4 className="font-semibold text-sm text-gray-600 mb-3">判断以下陈述是 TRUE、FALSE 还是 DOES NOT SAY：</h4>
      <div className="space-y-2">
        {article.statements.map(stmt => {
          const s = ans[stmt.id]; const ok = s === stmt.answer;
          return (<div key={stmt.id} className={`card p-3 ${done && !ok && s ? 'border-red-200 bg-red-50/10' : ''}`}>
            <p className="text-sm text-gray-800 mb-2"><span className="text-gray-400 mr-2">{stmt.id.replace('tf','')}.</span>{stmt.statement}</p>
            <p className="text-xs text-gray-400 mb-2">{stmt.statementZh}</p>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(lbls) as Array<'T'|'F'|'DN'>).map(v => {
                let cl = `px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer `;
                if (done) {
                  if (v === stmt.answer) cl += 'bg-green-100 border-green-400 text-green-800 ring-1 ring-green-300';
                  else if (s === v) cl += 'bg-red-100 border-red-400 text-red-700';
                  else cl += 'opacity-40';
                } else { if (s === v) cl += 'bg-blue-100 border-blue-400 text-blue-700 ring-1 ring-blue-200'; else cl += 'hover:bg-gray-50 border-gray-200'; }
                return (<div key={v} onClick={() => pick(stmt.id, v)} className={cl}>{lbls[v]}</div>);
              })}
            </div>
            {done && (<p className="text-xs mt-2 text-gray-500 bg-gray-50 p-2 rounded">💡 {stmt.explanation}{stmt.evidence && <span className="text-gray-400 ml-1">({stmt.evidence})</span>}</p>)}
          </div>);
        })}
      </div>
      {!done && Object.keys(ans).length === article.statements.length && (
        <button onClick={handleSubmit} className="btn-primary w-full mt-4">提交答案</button>
      )}
      {done && (() => {
        const thr70 = Math.ceil(article.statements.length * 0.7);
        const thr50 = Math.ceil(article.statements.length * 0.5);
        const col = score >= thr70 ? '#16a34a' : score >= thr50 ? '#eab308' : '#dc2626';
        const msg = score >= thr70 ? '正误判断能力出色！' : score >= thr50 ? '不错，注意区分 F 和 DN 的区别！' : '仔细看原文，不要自己推断太多哦！';
        return (<div className="mt-4 card p-4 text-center"><p className="text-2xl font-bold mb-1" style={{color:col}}>{score}/{article.statements.length}</p><p className="text-sm text-gray-500">{msg}</p></div>);
      })()}
    </div>
  );
}

// ==================== Part 5 开放填空 ====================
function Part5View({ article }: { article: typeof part5Articles[0] }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [hints, setHints] = useState<Record<number, boolean>>({});
  const { recordAnswer, recordSession } = useProgressStore();

  const toggleHint = (pos: number) =>
    setHints(prev => ({ ...prev, [pos]: !prev[pos] }));
  const setAns = (pos: number, v: string) => {
    if (!showResult) setAnswers(prev => ({ ...prev, [pos]: v }));
  };

  const isCorrect = (b: typeof article.blanks[0]) => {
    const u = (answers[b.position] || '').trim().toLowerCase();
    if (!u) return false;
    if (b.accept && b.accept.length) return b.accept.map(a => a.toLowerCase()).includes(u);
    return u === b.answer.toLowerCase();
  };

  const score = useMemo(
    () => article.blanks.filter(b => isCorrect(b)).length,
    [answers, showResult]
  );

  const handleSubmit = () => {
    article.blanks.forEach(b => {
      recordAnswer({
        module: 'reading', exerciseType: 'reading_p5',
        subjectId: article.id, subjectName: article.titleZh,
        questionId: `${article.id}-b${b.position}`,
        questionText: `[开放填空] 第${b.position}空`,
        userAnswer: answers[b.position] || '（未作答）',
        correctAnswer: b.accept && b.accept.length ? [b.answer, ...b.accept].join(' / ') : b.answer,
        isCorrect: isCorrect(b),
      });
    });
    const correct = article.blanks.filter(b => isCorrect(b)).length;
    recordSession({
      module: 'reading', exerciseType: 'reading_p5',
      subjectId: article.id, subjectName: article.titleZh,
      correct, total: article.blanks.length, duration: 0,
    });
    setShowResult(true);
  };

  const renderPassage = () => {
    const regex = /\(\d+\)\s*____/g;
    const parts = article.passage.split(regex);
    const out: React.ReactNode[] = [];
    parts.forEach((part, idx) => {
      out.push(<span key={'t' + idx}>{part}</span>);
      if (idx < article.blanks.length) {
        const b = article.blanks[idx];
        const u = answers[b.position] || '';
        const ok = isCorrect(b);
        const showH = hints[b.position];
        if (showResult) {
          const bcls = ok
            ? 'px-2 py-1 rounded text-sm font-medium bg-green-100 text-green-800 border border-green-300'
            : 'px-2 py-1 rounded text-sm font-medium bg-red-100 text-red-800 border border-red-300';
          const correctText = b.accept && b.accept.length ? [b.answer, ...b.accept].join('/') : b.answer;
          out.push(
            <span key={'b' + idx} className="inline-flex items-center mx-1 align-middle">
              <span className={bcls}>{ok ? (u || '?') : `${u || '?'} → ${correctText}`}</span>
            </span>
          );
        } else {
          const dcls = u
            ? 'w-28 px-2 py-1 rounded border-2 border-blue-400 text-blue-700 text-sm text-center outline-none'
            : 'w-28 px-2 py-1 rounded border-2 border-dashed border-gray-300 text-gray-400 text-sm text-center outline-none focus:border-blue-400';
          out.push(
            <span key={'b' + idx} className="inline-flex items-center mx-1 align-middle">
              <input
                value={u}
                onChange={e => setAns(b.position, e.target.value)}
                placeholder={`(${b.position})`}
                className={dcls}
              />
            </span>
          );
        }
        if (!showResult) {
          out.push(
            <span key={'h' + idx} className="inline-flex items-center ml-1 align-middle">
              <button onClick={() => toggleHint(b.position)} className="text-xs text-blue-500 hover:underline">
                {showH ? '隐藏提示' : '提示'}
              </button>
              {showH && (
                <span className="ml-1 text-xs text-gray-400">💡 {b.hintZh}（{b.hint}）</span>
              )}
            </span>
          );
        }
      }
    });
    return out;
  };

  const scCol = score >= 4 ? '#16a34a' : score >= 3 ? '#eab308' : '#dc2626';

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">{article.titleZh}</h3>
        {!showResult && Object.keys(answers).length === article.blanks.length && (
          <button onClick={handleSubmit} className="btn-primary text-sm">提交答案</button>
        )}
      </div>

      {/* 文章区域 */}
      <div className="card p-5 mb-4 prose prose-sm max-w-none text-gray-700 leading-relaxed text-base whitespace-pre-line">
        {renderPassage()}
      </div>

      {!showResult && (
        <p className="text-xs text-gray-400 mb-2">在每个空格填入一个合适的英文单词，可点击「提示」获得线索。</p>
      )}

      {showResult && (
        <>
          <div className="mt-4 card p-4 text-center">
            <p className="text-2xl font-bold mb-1" style={{ color: scCol }}>{score} / {article.blanks.length}</p>
            <p className="text-sm text-gray-500">{score >= 4 ? '单词填空很棒！' : score >= 3 ? '不错，注意词义和拼写！' : '多读短文，结合上下文猜词哦！'}</p>
          </div>
          <details className="mt-3 card p-4">
            <summary className="cursor-pointer text-sm font-medium text-blue-600">查看完整原文（含答案）</summary>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-line">{article.passageFull}</p>
          </details>
        </>
      )}
    </div>
  );
}

// ==================== 文章列表页 ====================
function ArticleListView({ pt, onSelectArticle, onBack }: { pt: ReadingPart; onSelectArticle: (i: number) => void; onBack: () => void }) {
  const pi = PART_INFO[pt];

  function getArticles(): any[] {
    switch (pt) {
      case 'part1': return part1Articles;
      case 'part2': return part2Articles;
      case 'part3c': return part3ClozeArticles;
      case 'part3r': return part3RCArticles;
      case 'part4': return part4TFArticles;
      case 'part5': return part5Articles;
    }
  }

  function getSub(a: any): string {
    if (a.topic) { let s = a.topic; if (a.blanks) s += ` · ${a.blanks.length}个空格`; if (a.questions) s += ` · ${a.questions.length}道题`; if (a.statements) s += ` · ${a.statements.length}道判断`; return s; }
    return '';
  }

  const dc: Record<string, string> = { easy: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-red-100 text-red-700' };
  const dl: Record<string, string> = { easy: '简单', medium: '中等', hard: '较难' };

  return (<div>
    <button onClick={onBack} className="text-blue-600 text-sm hover:underline mb-3 flex items-center gap-1">← 返回题型选择</button>
    <h3 className="text-lg font-bold text-gray-800 mb-1">{pi.icon} {pi.label}</h3>
    <p className="text-sm text-gray-400 mb-4">{pi.desc}</p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {getArticles().map((a, i) => (<div key={a.id} onClick={() => onSelectArticle(i)} className="card p-4 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all">
        <h4 className="font-semibold text-gray-800 mb-1">{a.titleZh}</h4>
        <p className="text-xs text-gray-400 mb-2">{getSub(a)}</p>
        <span className={`text-xs px-2 py-0.5 rounded ${dc[a.difficulty]}`}>{dl[a.difficulty]}</span>
      </div>))}
    </div>
  </div>);
}

// ==================== 主页面 ====================
export default function ReadingPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'parts' | 'articles' | 'reading'>('parts');
  const [sp, setSp] = useState<ReadingPart>('part1');
  const [si, setSi] = useState(0);

  if (mode === 'reading') {
    return (<div>
      <button onClick={() => setMode('articles')} className="text-blue-600 text-sm hover:underline mb-3 flex items-center gap-1">← 返回文章列表</button>
      {sp === 'part1' && <Part1View article={part1Articles[si]} />}
      {sp === 'part2' && <Part2View article={part2Articles[si]} />}
      {sp === 'part3c' && <Part3ClozeView article={part3ClozeArticles[si]} />}
      {sp === 'part3r' && <Part3RCView article={part3RCArticles[si]} />}
      {sp === 'part4' && <Part4TFView article={part4TFArticles[si]} />}
      {sp === 'part5' && <Part5View article={part5Articles[si]} />}
    </div>);
  }

  if (mode === 'articles') {
    return <ArticleListView pt={sp} onSelectArticle={(i) => { setSi(i); setMode('reading'); }} onBack={() => setMode('parts')} />;
  }

  return (<div>
    <div className="flex items-center gap-2 mb-2">
      <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
        ← 返回首页
      </button>
    </div>
    <div className="flex items-center gap-3 mb-2">
      <h2 className="text-xl font-bold text-gray-800">📖 阅读理解</h2>
    </div>
    <p className="text-sm text-gray-400 mb-6">KET 阅读 Part 1–5，5 大题型 · 真题风格训练</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {(Object.keys(PART_INFO) as ReadingPart[]).map(part => {
        const i = PART_INFO[part];
        return (<div key={part} onClick={() => { setSp(part); setMode('articles'); }} className={`card p-5 cursor-pointer hover:shadow-lg transition-all border-2 ${i.color} hover:scale-[1.02]`}>
          <span className="text-3xl mb-2 block">{i.icon}</span>
          <h3 className="font-bold text-gray-800 mb-1">{i.label}</h3>
          <p className="text-sm text-gray-500">{i.desc}</p>
        </div>);
      })}
    </div>
  </div>);
}
