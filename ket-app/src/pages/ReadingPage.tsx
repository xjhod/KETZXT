import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  part1Articles, part2Articles, part3ClozeArticles,
  part3RCArticles, part4TFArticles,
} from '../data/reading';
import { useProgressStore } from '../store/useProgressStore';

type ReadingPart = 'part1' | 'part2' | 'part3c' | 'part3r' | 'part4';

const PART_INFO: Record<ReadingPart, { label: string; icon: string; desc: string; color: string }> = {
  part1:   { label: 'Part 1 看图配对', icon: '\uD83D\uDDBC\uFE0F', desc: '5张图片 + 8个句子，选出匹配项', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  part2:   { label: 'Part 2 信息匹配', icon: '\uD83D\uDD17', desc: '5个人物 + 8则信息，谁需要什么', color: 'bg-green-50 text-green-700 border-green-200' },
  part3c:  { label: 'Part 3-1 完形填空', icon: '\uD83D\uDCDD', desc: '短文6空格，三选一', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  part3r:  { label: 'Part 3-2 阅读选择', icon: '\uD83D\uDCD6', desc: '文章 + 7道四选一选择题', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  part4:   { label: 'Part 4 正误判断', icon: '\u2705', desc: '长文 + T/F/DN 判断题', color: 'bg-red-50 text-red-700 border-red-200' },
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
function Part2View({ article }: { article: typeof part2Articles[0] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  // 当前选中的目标人物（用户先点击人物卡片选中，再点击信息进行匹配）
  const [activePerson, setActivePerson] = useState<string | null>(null);
  const { recordAnswer, recordSession } = useProgressStore();

  const handleSubmit = () => {
    article.people.forEach(p => {
      const isCorrect = answers[p.id] === article.answers[p.id];
      recordAnswer({
        module: 'reading', exerciseType: 'reading_p2',
        subjectId: article.id, subjectName: article.titleZh,
        questionId: p.id,
        questionText: `[Part2] ${p.name} - ${p.description}`,
        userAnswer: article.infoPieces.find(ip => ip.id === answers[p.id])?.text || '（未作答）',
        correctAnswer: article.infoPieces.find(ip => ip.id === article.answers[p.id])?.text || '',
        isCorrect,
      });
    });
    const correct = article.people.filter(p => answers[p.id] === article.answers[p.id]).length;
    recordSession({
      module: 'reading', exerciseType: 'reading_p2',
      subjectId: article.id, subjectName: article.titleZh,
      correct, total: article.people.length, duration: 0,
    });
    setShowResult(true);
  };

  // 点击信息项 -> 分配给当前选中的人物（或自动分配给第一个无匹配的人物）
  const handleInfoClick = (infoId: string) => {
    if (showResult) return;
    let targetPerson = activePerson;
    // 如果没有手动选中人物，自动找第一个还没有匹配信息的人物
    if (!targetPerson) {
      targetPerson = article.people.find(p => !answers[p.id])?.id || null;
    }
    if (!targetPerson) return; // 所有人物都已匹配

    // 如果这个信息已经被其他人物选了，先取消那个
    const existingOwner = Object.entries(answers).find(([, v]) => v === infoId)?.[0];
    const next = { ...answers };
    if (existingOwner) delete next[existingOwner];
    next[targetPerson] = infoId;
    setAnswers(next);
    setActivePerson(null); // 匹配后清除选中状态
  };

  // 取消某个人物的匹配
  const removeMatch = (personId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (showResult) return;
    setAnswers(prev => { const n = { ...prev }; delete n[personId]; return n; });
  };

  const score = useMemo(() => {
    let c = 0;
    Object.entries(article.answers).forEach(([p, a]) => { if (answers[p] === a) c++; });
    return c;
  }, [answers, showResult]);
  const usedInfoIds = Object.values(answers);
  const totalPeople = article.people.length;
  const sc = score >= 4 ? '#16a34a' : score >= 3 ? '#eab308' : '#dc2626';

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">{article.titleZh}</h3>
        {!showResult && Object.keys(answers).length >= totalPeople && (
          <button onClick={handleSubmit} className="btn-primary text-sm">提交答案 ({Object.keys(answers).length}/{totalPeople})</button>
        )}
      </div>

      {/* 操作提示 */}
      {!showResult && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          💡 <strong>操作方法：</strong>点击下方信息选项即可自动匹配到人物。也可以先点击上方人物卡片选中，再点信息分配给指定人物。
        </div>
      )}

      {/* 人物卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        {article.people.map(p => {
          const matchedInfoId = answers[p.id];
          const ic = showResult ? matchedInfoId === article.answers[p.id] : null;
          const isActive = activePerson === p.id;
          const ringClass = ic === true ? 'ring-2 ring-green-300 bg-green-50/30'
            : ic === false ? 'ring-2 ring-red-300 bg-red-50/30'
            : isActive ? 'ring-2 ring-blue-400 bg-blue-50/40'
            : '';
          // 找到已匹配的信息文本用于显示
          const matchedText = matchedInfoId ? article.infoPieces.find(ip => ip.id === matchedInfoId)?.text : null;

          return (
            <div
              key={p.id}
              onClick={() => !showResult && setActivePerson(activePerson === p.id ? null : p.id)}
              className={`card p-3 text-center cursor-pointer transition-all hover:shadow-md ${ringClass}`}
            >
              <span className="inline-block w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm leading-8 mb-1">{p.id}</span>
              <p className="font-semibold text-sm text-gray-800">{p.name}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-3">{p.description}</p>
              {/* 已匹配的信息 */}
              {matchedText && !showResult && (
                <div className="mt-2 relative group">
                  <p className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded truncate">📎 {matchedText.substring(0, 20)}...</p>
                  <button
                    onClick={(e) => removeMatch(p.id, e)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                  >✕</button>
                </div>
              )}
              {showResult && ic !== null && (
                <span className={`text-xs mt-1 inline-block ${ic ? 'text-green-600' : 'text-red-600'}`}>
                  {ic ? '✓ 匹配正确' : `✗ 应选 ${article.answers[p.id]}`}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 信息选项 */}
      <h4 className="font-semibold text-sm text-gray-600 mb-2">
        信息选项（点击匹配）
        {activePerson && <span className="ml-2 text-blue-500 text-xs">→ 正在为 {article.people.find(p => p.id === activePerson)?.name} 选择</span>}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {article.infoPieces.map(info => {
          const selectedBy = Object.entries(answers).find(([, v]) => v === info.id)?.[0];
          const isUsed = usedInfoIds.includes(info.id);
          let cls = 'card p-3 cursor-pointer transition-all border ';
          if (showResult) {
            if (selectedBy && answers[selectedBy] === info.id && article.answers[selectedBy] === info.id) cls += 'border-green-300 bg-green-50';
            else if (selectedBy && answers[selectedBy] === info.id) cls += 'border-red-300 bg-red-50';
            else cls += 'border-gray-200 opacity-60';
          } else {
            if (isUsed) cls += 'border-blue-300 bg-blue-50 ring-1 ring-blue-200';
            else if (activePerson) cls += 'border-blue-300 border-dashed hover:bg-blue-50/50';
            else cls += 'border-gray-200 hover:border-blue-200 hover:bg-gray-50';
          }
          return (<div key={info.id} onClick={() => handleInfoClick(info.id)} className={cls}>
            <span className="inline-block w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold leading-6 mr-2 text-center float-left mt-0.5">{info.id}</span>
            <p className="text-sm text-gray-700 leading-relaxed">{info.text}</p>
            {isUsed && !showResult && (
              <p className="text-xs text-blue-500 mt-1 clear-both">✅ 已匹配 → {selectedBy} {article.people.find(p => p.id === selectedBy)?.name}</p>
            )}
          </div>);
        })}
      </div>

      {/* 进度指示 + 提交按钮（未全部完成时也显示） */}
      {!showResult && Object.keys(answers).length > 0 && Object.keys(answers).length < totalPeople && (
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-400">已匹配 {Object.keys(answers).length}/{totalPeople} 人</span>
          <span className="mx-2 text-gray-300">|</span>
          <button
            onClick={handleSubmit}
            className="text-sm text-orange-500 hover:text-orange-600 underline"
          >提前交卷</button>
        </div>
      )}

      {showResult && (<div className="mt-4 card p-4 text-center"><p className="text-2xl font-bold mb-1" style={{ color: sc }}>{score}/{totalPeople}</p><p className="text-sm text-gray-500">{score >= 4 ? '很棒的信息匹配能力！' : score >= 3 ? '继续努力！' : '多读几遍人物描述哦！'}</p></div>)}
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
    const parts = article.passage.split('___(');
    const out: React.ReactNode[] = [];
    parts.forEach((part, idx) => {
      if (idx === 0) { out.push(<span key={'t'+idx}>{part}</span>); return; }
      const ci = part.indexOf(')');
      const bnStr = part.substring(0, ci);
      const after = part.substring(ci + 4);
      const blank = article.blanks.find(b => b.position === Number(bnStr));
      const sel = answers['b-' + article.id + '-' + bnStr];
      // 填空显示
      if (blank) {
        const ok = sel === blank.answer;
        if (showResult) {
          const bcls = ok ? 'px-2 py-1 rounded text-sm font-medium bg-green-100 text-green-800 border border-green-300'
            : 'px-2 py-1 rounded text-sm font-medium bg-red-100 text-red-800 border border-red-300';
          out.push(<span key={'b'+idx}>
            <span className="inline-flex items-center mx-1 align-middle">
              <span className={bcls}>{ok ? String(sel ?? '?') : `${sel ?? '?'} → ${blank.answer}`}</span>
            </span>
          </span>);
        } else {
          const dcls = sel
            ? 'inline-flex items-center border-b-2 min-w-[80px] justify-center px-2 py-0.5 border-blue-400 text-blue-700'
            : 'inline-flex items-center border-b-2 border-dashed min-w-[80px] justify-center px-2 py-0.5 border-gray-300 text-gray-400';
          out.push(<span key={'b'+idx}>
            <span className="inline-flex items-center mx-1 align-middle"><span className={dcls}>{sel || '('+bnStr+')'}</span></span>
          </span>);
        }
      }
      out.push(after);
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
