// ========== 语法每日打卡页面 ==========
// 流程：复习旧知识 → 今日新语法(讲解前置) → 对比训练 → 产出练习(真手写) → 混合测验 → 完成
// 顶部：连续打卡 streak + 日历热力图 + 路线图进度。难度按 ROADMAP 由易到难推进，错题加权复习。
// 2026-11-10 A 档：规则卡默认展开、精读小注默认收起、看完讲解才出学习题；
// 产出阶段用真手写替代选项题（可跳过）；混合测验补精读派生「形式→意义」题。
// 2026-11-10 B 档：手写计入「连续手写正确」（不进 box/排期），混合测验只作当日反馈，
// 熟练由 Box5 + 连续 2 次手写正确 + 首学 ≥7 天判定；复习按 dueAt 到期抽题。
import { useState, useMemo, useRef, useEffect } from 'react';
import { useDailyCheckinStore, todayString, type TodayLog } from '../store/useDailyCheckinStore';
import { useProgressStore } from '../store/useProgressStore';
import { generateSession, errorTagFor, type DailySession, type SessionQuestion } from '../utils/grammarSession';
import { GrammarQuestionCard } from '../components/GrammarQuestionCard';
import { WrittenProduction } from '../components/WrittenProduction';
import { isWrittenCorrect } from '../utils/writtenProduction';
import { isGrammarMastered, migrateGrammarPoint } from '../utils/grammarSchedule';
import { SentenceAudio } from '../components/SentenceAudio';
import { ROADMAP, GRAMMAR_QUESTIONS, getPoint } from '../data/grammarRoadmap';
import { getReading } from '../data/grammarReading';
import { stopAllAudio } from '../utils/audio';

type PhaseKey = 'review' | 'learn' | 'contrast' | 'production' | 'mixed' | 'done';

// ========== 今日打卡结果总结（战报）==========
const PHASE_META: { key: PhaseKey; label: string }[] = [
  { key: 'review', label: '复习巩固' },
  { key: 'learn', label: '今日新语法' },
  { key: 'contrast', label: '对比训练' },
  { key: 'production', label: '产出练习' },
  { key: 'mixed', label: '混合测验' },
];

function TodaySummary({ log }: { log: TodayLog }) {
  const items = log.items;
  const total = items.length;
  const correct = items.filter((i) => i.correct).length;
  const acc = total ? Math.round((correct / total) * 100) : 0;

  const byPhase: Record<string, { t: number; c: number }> = {};
  for (const it of items) {
    byPhase[it.phase] = byPhase[it.phase] ?? { t: 0, c: 0 };
    byPhase[it.phase].t += 1;
    byPhase[it.phase].c += it.correct ? 1 : 0;
  }

  const weak = Array.from(new Set(items.filter((i) => !i.correct).map((i) => i.grammarId)))
    .map((id) => getPoint(id)?.nameZh ?? id)
    .filter(Boolean);
  const newName = log.newPointId ? getPoint(log.newPointId)?.nameZh ?? null : null;

  const accColor = acc >= 80 ? 'text-green-600' : acc >= 60 ? 'text-amber-600' : 'text-red-500';
  const praise =
    acc >= 90
      ? '今天表现超棒，继续保持！'
      : acc >= 80
        ? '掌握得不错，稳扎稳打。'
        : acc >= 60
          ? '有进步空间，把薄弱点再过一遍。'
          : '别急，今天错的正是明天要攻克的。';

  return (
    <div className="mt-5 text-left bg-gray-50 rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-800">📊 今日战报</h3>
        <span className={`text-lg font-bold ${accColor}`}>{acc}%</span>
      </div>

      <div className="flex items-end gap-4 mb-4">
        <div>
          <div className="text-2xl font-bold text-gray-800">{total}</div>
          <div className="text-xs text-gray-400">总题数</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">{correct}</div>
          <div className="text-xs text-gray-400">答对</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-500">{total - correct}</div>
          <div className="text-xs text-gray-400">答错</div>
        </div>
      </div>

      {/* 各阶段表现 */}
      <div className="space-y-1.5 mb-4">
        {PHASE_META.filter((p) => byPhase[p.key]).map((p) => {
          const s = byPhase[p.key];
          const pc = Math.round((s.c / s.t) * 100);
          return (
            <div key={p.key} className="flex items-center gap-2 text-sm">
              <span className="w-20 text-gray-500">{p.label}</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${pc >= 80 ? 'bg-green-500' : pc >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${pc}%` }}
                />
              </div>
              <span className="w-14 text-right text-gray-400">{s.c}/{s.t}</span>
            </div>
          );
        })}
      </div>

      {newName && (
        <p className="text-sm text-gray-600 mb-2">
          🌟 今日新学：<span className="font-medium text-blue-700">{newName}</span>
        </p>
      )}

      {weak.length > 0 ? (
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <p className="text-sm text-amber-800 mb-1">⚠️ 还薄弱的点（建议明天优先复习）：</p>
          <p className="text-sm font-medium text-amber-900">{weak.join('、')}</p>
        </div>
      ) : (
        <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
          <p className="text-sm text-green-700">✅ 今天全部答对，没有薄弱点！</p>
        </div>
      )}

      <p className="text-sm text-gray-500 mt-3">{praise}</p>
    </div>
  );
}

// ========== A 档：产出阶段真手写（复用词汇造句的 WrittenProduction）==========
//
// 数据来源：现有 200 道改错题的 sentence（错句）+ answer（正确句），零编造。
// 口径：整句归一化比对，不判语法、不打分、不进熟练判定；错两次才给「看答案」按钮；可跳过。
// 写之前屏幕上只有错句，没有正确句；写完后才展示正确写法与解析。
function ProductionWrite({
  sq, onResult, onNext,
}: {
  sq: SessionQuestion;
  onResult: (correct: boolean, userAnswer: string) => void;
  onNext: () => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [done, setDone] = useState(false);
  const q = sq.q;
  const tag = errorTagFor(q.explanation ?? '');
  const wrongSentence = String(q.sentence ?? '').trim();
  const answer = String(q.answer ?? '').trim();

  return (
    <div className="min-w-0">
      <p className="text-sm text-gray-500 mb-3">把句子改对，自己写出完整的一句；不是在选项里挑。</p>
      {wrongSentence && (
        <div className="mb-3 p-3 bg-amber-50 rounded-xl min-w-0">
          <p className="text-xs text-gray-500 mb-1">原句（有错）：</p>
          <p className="text-base text-gray-800 break-words">{wrongSentence}</p>
        </div>
      )}
      <WrittenProduction
        title="✍️ 写出正确的句子"
        description="整句自己写一遍。只比对拼写和词形，不判语法、不打分；这一步不进熟练判定，写不出来可以跳过。"
        placeholder="把正确的英文句子完整写出来"
        submitLabel="检查我写的"
        check={(t) => isWrittenCorrect(t, answer)
          ? { ok: true }
          : { ok: false, reason: '和正确写法还不一样，再看一眼原句，自己重写一次' }}
        hint={
          <>
            <p className="break-words">再看一眼原句：{wrongSentence}</p>
            {tag && <p className="mt-1">可能错在：{tag}</p>}
            <button
              type="button"
              onClick={() => setShowAnswer(true)}
              className="mt-2 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs"
            >
              实在想不起来，看正确写法
            </button>
            {showAnswer && <p className="mt-2 font-medium break-words">正确写法：{answer}</p>}
          </>
        }
        reveal={
          <>
            <p className="font-medium text-gray-700 mb-1 break-words">正确写法：{answer}</p>
            <p className="break-words">{q.explanation}</p>
          </>
        }
        onAccepted={(text) => { setDone(true); onResult(true, text); }}
      />
      <button
        onClick={onNext}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {done ? '继续 →' : '跳过，继续 →'}
      </button>
    </div>
  );
}

export default function GrammarDailyPage() {
  const dc = useDailyCheckinStore();
  const progress = useProgressStore();

  const today = todayString();
  const isDone = dc.isTodayDone(today);

  const [session, setSession] = useState<DailySession | null>(null);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [revealRule, setRevealRule] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isExtra, setIsExtra] = useState(false); // 是否为"额外练习"（不推进路线图/不重复出题）
  // A 档：讲解前置——learn 阶段先看规则卡，点按钮才出 2 道题；精读小注默认收起
  const [learnQuizStarted, setLearnQuizStarted] = useState(false);
  const [activeSeg, setActiveSeg] = useState<number | null>(null);

  // 混合测验正确率（用于判定是否"熟练"）
  const mixedCorrect = useRef(0);
  const mixedTotal = useRef(0);
  // 额外练习本轮成绩（不写入主打卡战报）
  const extraCorrect = useRef(0);
  const extraTotal = useRef(0);

  // 离开页面/卸载时停止任何正在播放的跟读音频
  useEffect(() => () => stopAllAudio(), []);

  const phases = useMemo<{ key: PhaseKey; title: string }[]>(() => {
    if (!session) return [];
    const list: { key: PhaseKey; title: string }[] = [{ key: 'review', title: '复习旧知识' }];
    if (session.learn) list.push({ key: 'learn', title: '今日新语法' });
    if (session.contrast) list.push({ key: 'contrast', title: '对比训练' });
    if (session.production.length) list.push({ key: 'production', title: '产出练习' });
    list.push({ key: 'mixed', title: '混合测验' });
    list.push({ key: 'done', title: '完成' });
    return list;
  }, [session]);

  const currentPhase = phases[phaseIdx]?.key ?? 'done';

  function questionsOf(key: PhaseKey): SessionQuestion[] {
    if (!session) return [];
    switch (key) {
      case 'review': return session.review;
      case 'learn': return session.learn?.questions ?? [];
      case 'contrast': return session.contrast?.questions ?? [];
      case 'production': return session.production;
      case 'mixed': return session.mixed;
      default: return [];
    }
  }

  function startSession(mode: 'checkin' | 'extra' = 'checkin') {
    const wrongList = progress
      .getWrongAnswers('grammar')
      .map((r) => ({ grammarId: r.subjectId, questionId: r.questionId }));
    // 额外练习：排除主打卡今日已出过的题目，避免重复；焦点锚定主打卡新点
    const excludeIds: Set<string> | undefined =
      mode === 'extra' ? new Set(dc.todayLog?.servedIds ?? []) : undefined;
    const focusPointId: string | null | undefined =
      mode === 'extra' ? (dc.todayLog?.newPointId ?? null) : undefined;
    const s = generateSession({ points: dc.points, wrongList, mode, excludeIds, focusPointId, today });
    if (mode === 'checkin') dc.setTodayNewPoint(s.newPointId);
    setIsExtra(mode === 'extra');
    mixedCorrect.current = 0;
    mixedTotal.current = 0;
    extraCorrect.current = 0;
    extraTotal.current = 0;
    setSession(s);
    setPhaseIdx(0);
    setQIdx(0);
    setRevealRule(false);
    setFinished(false);
    setLearnQuizStarted(false);
    setActiveSeg(null);
  }

  /** isProduction=true 用于手写产出：不进 box/排期，但计入「连续手写正确」（B 档熟练证据） */
  function recordAnswer(sq: SessionQuestion, correct: boolean, userAnswer: string, isProduction = false) {
    if (isProduction) dc.recordProduction(sq.grammarId, correct);
    else dc.recordQuestion(sq.grammarId, correct);
    // 仅主打卡写入战报明细与已出题记录；额外练习不污染今日战报
    if (!isExtra) {
      dc.logAnswer(sq.grammarId, sq.purpose, correct);
      dc.markServed(sq.q.id);
    } else {
      extraCorrect.current += correct ? 1 : 0;
      extraTotal.current += 1;
    }
    const pType =
      sq.pType === 'fill' ? 'grammar_fill' : sq.pType === 'choice' ? 'grammar_choice' : 'grammar_correction';
    const point = getPoint(sq.grammarId);
    progress.recordAnswer({
      module: 'grammar',
      exerciseType: pType,
      subjectId: sq.grammarId,
      subjectName: point?.nameZh ?? sq.grammarId,
      questionId: sq.q.id,
      questionText: sq.q.sentence ?? sq.q.question ?? sq.q.answer,
      userAnswer,
      correctAnswer: sq.q.answer,
      isCorrect: correct,
    });
    if (currentPhase === 'mixed') {
      mixedCorrect.current += correct ? 1 : 0;
      mixedTotal.current += 1;
    }
  }

  function handleNext() {
    const cur = questionsOf(currentPhase);
    if (qIdx + 1 < cur.length) {
      setQIdx(qIdx + 1);
    } else {
      // 进入下一阶段
      if (currentPhase === 'mixed') {
        // 结算：仅主打卡才推进路线图 + 完成打卡；额外练习只结束本轮
        if (!isExtra) {
          // B 档：混合测验正确率只作当日反馈，不再直接判熟练。
          // 熟练由 grammarSchedule 的 Box5 + 连续 2 次手写正确 + 首学 ≥7 天决定。
          if (session?.newPointId) dc.finishPoint(session.newPointId, 2);
          dc.completeCheckin(today);
        }
        setFinished(true);
      }
      if (phaseIdx + 1 < phases.length) {
        setPhaseIdx(phaseIdx + 1);
        setQIdx(0);
        setRevealRule(false);
        setLearnQuizStarted(false);
        setActiveSeg(null);
      }
    }
  }

  // ============ 顶部统计 ============
  const learnedCount = ROADMAP.filter((id) => dc.points[id]?.introduced).length;
  const proficientCount = ROADMAP.filter(
    (id) => dc.points[id] && isGrammarMastered(migrateGrammarPoint(dc.points[id], today), today),
  ).length;

  // 日历热力图（最近 70 天）
  const heatmap = useMemo(() => {
    const days: { date: string; on: boolean }[] = [];
    const base = new Date();
    for (let i = 69; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const ds = todayString(d);
      days.push({ date: ds, on: dc.checkinDates.includes(ds) });
    }
    return days;
  }, [dc.checkinDates]);

  const curQuestions = questionsOf(currentPhase);
  const total = curQuestions.length;
  // A 档：产出阶段遇到改错题就换成真手写；其它题型仍走原卡片
  const isWrittenQuestion =
    currentPhase === 'production' &&
    curQuestions[qIdx]?.pType === 'correction' &&
    Boolean(curQuestions[qIdx]?.q?.sentence) &&
    Boolean(curQuestions[qIdx]?.q?.answer);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">每日语法打卡</h1>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-medium">
            🔥 连续 {dc.streak} 天
          </span>
        </div>
      </div>

      {/* streak + 日历 + 路线图进度 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">最近 70 天打卡</span>
          <span className="text-sm text-gray-400">{dc.checkinDates.length} 天打卡</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-4">
          {heatmap.map((d) => (
            <div
              key={d.date}
              title={d.date}
              className={`w-3.5 h-3.5 rounded-sm ${d.on ? 'bg-green-500' : 'bg-gray-100'}`}
            />
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">语法路线图进度</span>
            <span className="text-gray-400">{learnedCount}/20 已学 · {proficientCount}/20 熟练</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${(learnedCount / ROADMAP.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            熟练判据：Box 5 + 连续 2 次手写正确 + 距首次学习 ≥ 7 天；混合测验正确率只作当天反馈
          </p>
        </div>
      </div>

      {/* 未开始 / 已完成-overview */}
      {!session && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
          {isDone && !finished ? (
            <>
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">今日打卡已完成！</h2>
              <p className="text-gray-500 mb-4">连续打卡 {dc.streak} 天，坚持得真好。可以再做一组额外复习巩固。</p>
              {dc.todayLog && dc.todayLog.date === today && <TodaySummary log={dc.todayLog} />}
              <button
                onClick={() => startSession('extra')}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                开始额外练习
              </button>
            </>
          ) : (
            <>
              <div className="text-5xl mb-3">📝</div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">每天 10 分钟，语法稳步进阶</h2>
              <p className="text-gray-500 mb-2">
                今日将学习：<span className="font-medium text-gray-700">{nextPointName()}</span>
              </p>
              <p className="text-gray-400 text-sm mb-4">
                复习旧知识 → 学新语法 → 对比易混点 → 产出练习 → 混合测验
              </p>
              <button
                onClick={() => startSession()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl text-lg font-medium hover:bg-blue-700 transition-colors"
              >
                开始今日打卡 →
              </button>
            </>
          )}
        </div>
      )}

      {/* 进行中 */}
      {session && currentPhase !== 'done' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          {/* Stepper */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {phases.map((p, i) => (
              <span
                key={p.key}
                className={`px-2.5 py-1 rounded-full text-xs ${
                  i < phaseIdx
                    ? 'bg-green-100 text-green-700'
                    : i === phaseIdx
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i < phaseIdx ? '✓ ' : ''}
                {p.title}
              </span>
            ))}
          </div>

          <h2 className="text-lg font-bold text-gray-800 mb-1">{phases[phaseIdx]?.title}</h2>
          <p className="text-sm text-gray-400 mb-4">
            {currentPhase === 'learn' && !learnQuizStarted
              ? '先看规则，再读例句'
              : `第 ${Math.min(qIdx + 1, total)} / ${total} 题`}
          </p>

          {/* 本阶段暂无题目（如首次打卡还没有错题可复习）→ 提供跳过 */}
          {total === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">本步暂无题目（例如还没有需要复习的错题）。</p>
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                跳过，继续 →
              </button>
            </div>
          )}

          {/* 各阶段内容 */}
          {currentPhase === 'learn' && session.learn && (
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100 min-w-0">
              <p className="font-medium text-blue-800 mb-2">
                {session.learn.point.nameZh} · {session.learn.point.name}
              </p>

              {/* A 档：规则卡默认展开，压成 3 行 + 正例/反例，全部取自现有数据 */}
              {(() => {
                const point = session.learn.point;
                const lines = String(point.explanation ?? '')
                  .split(/[。；\n]/).map((s: string) => s.trim()).filter(Boolean).slice(0, 3);
                const good = point.examples?.[0]?.en;
                const bad = GRAMMAR_QUESTIONS[session.learn.pointId]?.correction?.[0]?.sentence;
                return (
                  <div className="mb-3 p-3 bg-white rounded-xl border border-blue-100 min-w-0">
                    <p className="text-xs font-semibold text-blue-700 mb-1">先看规则</p>
                    <ul className="text-sm text-gray-700 space-y-0.5">
                      {lines.map((l: string, i: number) => <li key={i} className="break-words">{i + 1}. {l}</li>)}
                    </ul>
                    {good && <p className="text-xs text-green-700 mt-2 break-words">✓ 正例：{good}</p>}
                    {bad && <p className="text-xs text-amber-700 mt-1 break-words">✗ 反例：{bad}（想想哪里不对）</p>}
                    {!revealRule ? (
                      <button onClick={() => setRevealRule(true)} className="mt-2 text-xs text-blue-600 hover:underline">
                        看完整讲解 ▼
                      </button>
                    ) : (
                      <p className="text-xs text-gray-600 mt-2 whitespace-pre-line break-words">{point.explanation}</p>
                    )}
                  </div>
                );
              })()}

              {(() => {
                const reading = getReading(session.learn.point.id);
                if (reading) {
                  return (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{reading.mode === 'dialogue' ? '💬' : '📖'}</span>
                        <span className="text-sm font-semibold text-gray-700">{reading.title}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">点一句，看它用到的语法；小注默认收起。点小喇叭可以听真人发音。</p>
                      <div className="space-y-2">
                        {reading.segments.map((seg, i) => (
                          <div
                            key={i}
                            onClick={() => setActiveSeg(activeSeg === i ? null : i)}
                            className={`bg-white rounded-xl border p-3 min-w-0 cursor-pointer ${
                              activeSeg === i ? 'border-blue-400 ring-1 ring-blue-200' : 'border-blue-100'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 min-w-0">
                              <div className="flex-1 min-w-0">
                                {seg.speaker && (
                                  <span className="text-xs font-semibold text-blue-500 mr-1">{seg.speaker}:</span>
                                )}
                                <span className="text-[15px] text-gray-800 leading-relaxed break-words">{seg.en}</span>
                                <div className="text-sm text-gray-400 mt-0.5 break-words">{seg.zh}</div>
                              </div>
                              <SentenceAudio audioId={seg.audio} text={seg.en} />
                            </div>
                            {activeSeg === i && seg.note && (
                              <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5 leading-relaxed break-words">
                                <span className="font-semibold">语法小注 · </span>{seg.note}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                // 无精读语料时回退到原单句例句
                return (
                  <>
                    <p className="text-sm text-gray-600 mb-2">先读例句，猜一猜它们在讲什么语法？</p>
                    <ul className="space-y-1.5 mb-3">
                      {session.learn.point.examples.map((ex: any, i: number) => (
                        <li key={i} className="text-sm">
                          <span className="text-gray-800">{ex.en}</span>
                          <span className="text-gray-400"> — {ex.zh}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                );
              })()}

              {/* A 档：讲解前置。看完规则卡才出学习阶段的 2 道题，不再「先测后教」 */}
              {!learnQuizStarted && (
                <button
                  onClick={() => setLearnQuizStarted(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  看懂了，做 2 道题 →
                </button>
              )}
            </div>
          )}

          {currentPhase === 'contrast' && session.contrast && (
            <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="font-medium text-amber-800 mb-1">
                易混对比：{getPoint(session.newPointId!)?.nameZh} ↔ {getPoint(session.contrast.partnerId!)?.nameZh}
              </p>
              <p className="text-sm text-gray-600">{session.contrast.hint}</p>
            </div>
          )}

          {currentPhase === 'production' && !isWrittenQuestion && (
            <p className="text-sm text-gray-500 mb-3">把句子改对 / 写对，从"认得出"到"写得出"。</p>
          )}

          {currentPhase === 'mixed' && (
            <p className="text-sm text-gray-500 mb-3">把今天和之前学过的语法混在一起练，专治"一混就乱"。</p>
          )}

          {/* 当前题目：产出阶段改真手写；learn 阶段先看讲解再出题 */}
          {curQuestions[qIdx] && !(currentPhase === 'learn' && !learnQuizStarted) && (
            isWrittenQuestion ? (
              <ProductionWrite
                key={curQuestions[qIdx].q.id}
                sq={curQuestions[qIdx]}
                onResult={(correct, text) => recordAnswer(curQuestions[qIdx], correct, text, true)}
                onNext={handleNext}
              />
            ) : (
              <GrammarQuestionCard
                key={curQuestions[qIdx].q.id}
                q={curQuestions[qIdx].q}
                pType={curQuestions[qIdx].pType}
                onResult={(correct, userAnswer) => recordAnswer(curQuestions[qIdx], correct, userAnswer)}
                onNext={handleNext}
              />
            )
          )}
        </div>
      )}

      {/* 完成 */}
      {session && currentPhase === 'done' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {isExtra ? '额外练习完成！' : '今日打卡完成！'}
          </h2>
          <p className="text-gray-500 mb-1">
            连续打卡 <span className="font-medium text-orange-600">{dc.streak}</span> 天
          </p>
          {session.newPointId && (
            <p className="text-gray-500 mb-4">
              今日学习了 <span className="font-medium text-gray-700">{getPoint(session.newPointId)?.nameZh}</span>
              {mixedTotal.current > 0 &&
                `，混合测验正确率 ${Math.round((mixedCorrect.current / mixedTotal.current) * 100)}%`}
            </p>
          )}
          {isExtra ? (
            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <p className="text-sm text-indigo-800">
                本轮额外练习：答对 <span className="font-bold">{extraCorrect.current}</span> / {extraTotal.current}
              </p>
              <p className="text-xs text-indigo-500 mt-1">题目已避开今日打卡，专练薄弱点。</p>
            </div>
          ) : (
            dc.todayLog && dc.todayLog.date === today && <TodaySummary log={dc.todayLog} />
          )}
          <button
            onClick={() => {
              setSession(null);
              setIsExtra(false);
              setFinished(false);
            }}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      )}
    </div>
  );

  function nextPointName(): string {
    const id = dc.getNextNewPointId();
    if (!id) return '全部已掌握，进入复习模式';
    return getPoint(id)?.nameZh ?? id;
  }
}
