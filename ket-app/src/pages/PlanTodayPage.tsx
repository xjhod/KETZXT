// ========== 今日备考 ==========
// 把「1年备考计划」落到今天：定位到第几周第几天 → 今日任务 + 今日题组 → 作答判分 → 打卡。
// 判分结果写入 useProgressStore（错题本 + 学习统计），完成记录写入 usePlanStore。
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildDailySet, dateKey, diffDays, judgeText, keywordCoverage, type DailyItem, type DailySet } from '../data/dailyPlan';
import { gradeWriting, countWords } from '../data/writingGrader';
import {
  fetchLlmStatus,
  gradeWritingWithLLM,
  type LlmStatus,
  type LlmWritingResult,
} from '../utils/llm';
import { usePlanStore } from '../store/usePlanStore';
import { useProgressStore, type ModuleType } from '../store/useProgressStore';
import { AudioButton } from '../components/AudioButton';
import { playAudioWithFallback } from '../utils/audio';

const AREA_META: Record<string, { label: string; color: string; bg: string }> = {
  reading:   { label: '阅读', color: 'text-purple-600',   bg: 'bg-purple-50 border-purple-100' },
  writing:   { label: '写作', color: 'text-blue-600',     bg: 'bg-blue-50 border-blue-100' },
  listening: { label: '听力', color: 'text-orange-600',   bg: 'bg-orange-50 border-orange-100' },
  speaking:  { label: '口语', color: 'text-green-600',    bg: 'bg-green-50 border-green-100' },
};

export default function PlanTodayPage() {
  const navigate = useNavigate();
  const [todayKey] = useState(() => dateKey(new Date()));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [writingText, setWritingText] = useState('');
  const [speakingText, setSpeakingText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(() => Date.now());
  // LLM 增强批改状态（不可用时自动降级到规则层，不影响做题）
  const [llmStatus, setLlmStatus] = useState<LlmStatus>({ available: false, llm: false, asr: false });
  const [llmWriting, setLlmWriting] = useState<LlmWritingResult | null>(null);
  const [llmWritingLoading, setLlmWritingLoading] = useState(false);

  const startDate = usePlanStore((s) => s.startDate);
  const ensureStartDate = usePlanStore((s) => s.ensureStartDate);
  const logs = usePlanStore((s) => s.logs);
  const cursor = usePlanStore((s) => s.cursor);
  const completeDay = usePlanStore((s) => s.completeDay);
  const skipDay = usePlanStore((s) => s.skipDay);
  const getStreak = usePlanStore((s) => s.getStreak);
  const getCompletedCount = usePlanStore((s) => s.getCompletedCount);
  const recordAnswer = useProgressStore((s) => s.recordAnswer);
  const recordSession = useProgressStore((s) => s.recordSession);

  useEffect(() => {
    ensureStartDate(todayKey);
  }, [ensureStartDate, todayKey]);

  // 启动时探一次后端：决定要不要显示「AI 深度批改」入口
  useEffect(() => {
    let alive = true;
    fetchLlmStatus().then((s) => {
      if (alive) setLlmStatus(s);
    });
    return () => { alive = false; };
  }, []);

  const effectiveStart = startDate ?? todayKey;
  // 进度式：出题索引来自「推进游标」而不是日历日期 —— 没做完明天还是同一套
  // frozenIndex：提交后冻结在刚做完的那套，避免游标推进导致题目当场换掉
  const [frozenIndex, setFrozenIndex] = useState<number | null>(null);
  const activeIndex = frozenIndex ?? cursor;
  const set_: DailySet = useMemo(
    () => buildDailySet(effectiveStart, activeIndex),
    [effectiveStart, activeIndex]
  );
  const ctx = set_.context;
  const todayLog = logs[todayKey];
  // 今天刚做完当前这套 → 今日已完成（若当天先做完又跳过，setIndex 不等于 cursor-1，仍视为未完成）
  const doneToday = Boolean(todayLog && todayLog.setIndex === cursor - 1);

  // 写作批改报告：提交时算好存在 log 里；刷新后从 log 读回（保证结果不丢）
  const writingReport = submitted
    ? (todayLog?.writingGrade ??
      (set_.writing
        ? gradeWriting(writingText, set_.writing.prompt.minWords, set_.writing.prompt.points)
        : undefined))
    : undefined;

  const streak = getStreak(todayKey);
  const completedDays = getCompletedCount();
  const totalDays = ctx.totalWeeks * 7;

  const objectiveItems = set_.items;
  const answeredCount = objectiveItems.filter((it) => (answers[it.id] ?? '').trim()).length;

  const setAnswer = (id: string, v: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [id]: v }));
  };

  const handleSubmit = () => {
    if (submitted) return;
    const results = objectiveItems.map((it) => {
      const user = (answers[it.id] ?? '').trim();
      const correct = user.length > 0 && judgeText(user, it.answer);
      return { item: it, user, correct };
    });
    const correctCount = results.filter((r) => r.correct).length;

    // 逐题写入进度（错题自动进错题本，统计自动更新）
    for (const r of results) {
      recordAnswer({
        module: r.item.module as ModuleType,
        exerciseType: r.item.exerciseType,
        subjectId: r.item.subjectId,
        subjectName: r.item.subjectName,
        questionId: r.item.id,
        questionText: r.item.prompt.slice(0, 80),
        userAnswer: r.user || '（未作答）',
        correctAnswer: r.item.answer,
        isCorrect: r.correct,
      });
    }

    // 按模块分别记一次会话，保证统计页的模块维度正确
    const byModule = new Map<ModuleType, { correct: number; total: number }>();
    for (const r of results) {
      const m = r.item.module as ModuleType;
      const cur = byModule.get(m) ?? { correct: 0, total: 0 };
      cur.total++;
      if (r.correct) cur.correct++;
      byModule.set(m, cur);
    }
    const minutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));
    for (const [m, v] of byModule) {
      recordSession({
        module: m,
        exerciseType: 'plan_daily',
        subjectId: todayKey,
        subjectName: '每日备考',
        correct: v.correct,
        total: v.total,
        duration: minutes,
      });
    }

    const writingWords = countWords(writingText);
    const cov = set_.speaking ? keywordCoverage(speakingText, set_.speaking.keywords) : null;

    // 写作批改：词数 + 3 个要点覆盖 + 语法可疑点（纯规则，不判错只提示）
    const writingGrade = set_.writing
      ? gradeWriting(writingText, set_.writing.prompt.minWords, set_.writing.prompt.points)
      : undefined;
    // 「达标」= 词数够 且 3 个要点全覆盖（不再只看词数——凑词不算过关）
    const writingDone = writingGrade ? writingGrade.passed : false;

    completeDay({
      date: todayKey,
      setIndex: activeIndex,
      itemIds: objectiveItems.map((i) => i.id),
      results: results.map((r) => ({ id: r.item.id, correct: r.correct })),
      correctCount,
      totalCount: objectiveItems.length,
      writingDone,
      writingWords,
      writingGrade,
      speakingDone: Boolean(set_.speaking && cov && cov.percent >= 60),
      speakingPercent: cov?.percent ?? 0,
      minutes,
      completedAt: new Date().toISOString(),
    });
    setFrozenIndex(activeIndex);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * AI 深度批改（可选增强）：在规则层结果之上叠加 LLM 的内容/语言评估。
   * 失败时 llmWriting 保持 null —— 规则层结果照常展示，功能不降级。
   */
  const handleLlmGrade = async () => {
    if (!set_.writing || llmWritingLoading) return;
    setLlmWritingLoading(true);
    try {
      const result = await gradeWritingWithLLM({
        text: writingText,
        prompt: set_.writing.prompt.prompt,
        requirement: set_.writing.prompt.requirement,
        kind: set_.writing.prompt.kind,
        minWords: set_.writing.prompt.minWords,
        pointsCovered: writingReport?.points.map((pt) => ({
          label: pt.label,
          covered: pt.covered,
        })),
      });
      setLlmWriting(result);
    } finally {
      setLlmWritingLoading(false);
    }
  };

  /** 跳过本套：推进游标但不记完成（防止某一套卡住永远做不完） */
  const handleSkip = () => {
    if (submitted) return;
    skipDay(todayKey, activeIndex);
    setFrozenIndex(null);
    setAnswers({});
    setWritingText('');
    setSpeakingText('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ========== 未开始 / 已结束 ==========
  // 进度式下 dayIndex 就是游标（不会为负）；未开始看的是起始日是否在未来
  if (startDate && diffDays(todayKey, startDate) > 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">📅</p>
        <p className="text-gray-600 mb-1">计划还没开始</p>
        <p className="text-sm text-gray-400 mb-6">起始日：{effectiveStart}（今天 {todayKey}）</p>
        <button onClick={() => navigate('/study-plan')} className="btn-primary">查看计划</button>
      </div>
    );
  }
  if (ctx.finished) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">🎉</p>
        <p className="text-gray-600 mb-1">48 周计划已全部走完</p>
        <p className="text-sm text-gray-400 mb-6">共完成 {completedDays} 天 · 连续 {streak} 天</p>
        <button onClick={() => navigate('/study-plan')} className="btn-primary">回看计划</button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* ========== 顶部概览 ========== */}
      <div className="bg-white rounded-2xl shadow p-5 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400">今日备考</p>
            <h2 className="text-xl font-bold text-gray-800">
              第 {ctx.weekIndex + 1} 周 · 第 {ctx.dayOfWeek} 天
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              第 {ctx.month} 月第 {ctx.weekInMonth} 周 · {ctx.phase.name} · {ctx.tasks.length} 项任务 ·{' '}
              {ctx.tasks.reduce((n, t) => n + t.minutes, 0)} 分钟
            </p>
            <p className="text-xs text-blue-500 mt-1">
              第 {activeIndex + 1} 套 · 做不完明天还是这套（做完或跳过后才推进）
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-orange-500">🔥 {streak}</p>
            <p className="text-[10px] text-gray-400">连续天数</p>
            <p className="text-xs text-gray-500 mt-1">总完成 {completedDays}/{totalDays}</p>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-orange-400 h-1.5 rounded-full transition-all"
            style={{ width: `${Math.min(100, (completedDays / totalDays) * 100)}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          当前重点：{ctx.focus}
        </p>
      </div>

      {/* ========== 已完成提示 ========== */}
      {doneToday && !submitted && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
          <p className="text-sm text-green-700 font-medium">
            ✅ 今天已完成：客观题 {todayLog.correctCount}/{todayLog.totalCount} 正确
            {todayLog.writingGrade
              ? `，写作要点 ${todayLog.writingGrade.pointsHit}/${todayLog.writingGrade.pointsTotal}`
              : todayLog.writingDone
                ? '，写作已完成'
                : ''}
            {todayLog.speakingDone ? '，口语已完成' : ''}
          </p>
          <p className="text-xs text-green-600 mt-1">可以重做今天的题组（会覆盖今日记录）。</p>
        </div>
      )}

      {/* ========== 今日任务 ========== */}
      <h3 className="font-bold text-gray-700 mb-2 px-1">📋 今日任务</h3>
      {ctx.tasks.length === 0 && (
        <p className="text-sm text-gray-400 px-1 mb-4">今天按计划休息，可自主复习。</p>
      )}
      <div className="space-y-2 mb-5">
        {ctx.tasks.map((t, i) => {
          const meta = AREA_META[t.area];
          return (
            <div key={i} className={`bg-white rounded-xl shadow p-3 border ${meta.bg}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full ${meta.bg} ${meta.color} font-medium`}>
                  {meta.label}
                </span>
                <span className="text-xs text-gray-400">{t.minutes} 分钟</span>
              </div>
              <p className="text-sm font-medium text-gray-800 mt-1.5">{t.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
            </div>
          );
        })}
      </div>

      {/* ========== 客观题组 ========== */}
      {objectiveItems.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="font-bold text-gray-700">📝 今日试题</h3>
            <span className="text-xs text-gray-400">已答 {answeredCount}/{objectiveItems.length}</span>
          </div>
          <div className="space-y-3 mb-5">
            {objectiveItems.map((it, idx) => (
              <ItemCard key={it.id} item={it} index={idx} value={answers[it.id] ?? ''} onChange={setAnswer} submitted={submitted} />
            ))}
          </div>
        </>
      )}

      {/* ========== 写作任务 ========== */}
      {set_.writing && (
        <div className="bg-white rounded-2xl shadow p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-700">✍️ 写作任务</h3>
            <span className="text-xs text-gray-400">至少 {set_.writing.prompt.minWords} 词</span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{set_.writing.prompt.prompt}</p>
          <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1.5 rounded mb-2">
            要点：{set_.writing.prompt.requirement}
          </p>
          {set_.writing.showTemplate && (
            <details className="mb-2">
              <summary className="cursor-pointer text-xs text-blue-600 hover:underline">展开写作模板（{set_.writing.scaffoldId}）</summary>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1 whitespace-pre-line">
                {set_.writing.scaffoldTemplate}
                <br />
                <span className="text-gray-400">{set_.writing.scaffoldRequirement}</span>
              </p>
            </details>
          )}
          <textarea
            value={writingText}
            onChange={(e) => setWritingText(e.target.value)}
            disabled={submitted}
            rows={6}
            placeholder="在这里写下你的作文…"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-50"
          />
          <div className="flex items-center justify-between mt-1.5">
            <span
              className={`text-xs ${
                countWords(writingText) >= set_.writing.prompt.minWords ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              已写 {countWords(writingText)} 词 / 要求 {set_.writing.prompt.minWords} 词
            </span>
            {submitted && (
              <span className={`text-xs font-medium ${todayLog?.writingDone ? 'text-green-600' : 'text-orange-500'}`}>
                {todayLog?.writingDone
                  ? '✅ 已达标（要点全覆盖）'
                  : writingReport && !writingReport.wordCountOk
                    ? `⚠️ 还差 ${writingReport.minWords - writingReport.wordCount} 词`
                    : '⚠️ 要点未写全'}
              </span>
            )}
          </div>

          {/* ========== 写作批改结果 ========== */}
          {submitted && writingReport && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-600">📝 写作批改</p>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    writingReport.passed
                      ? 'bg-green-100 text-green-700'
                      : writingReport.pointsHit === writingReport.pointsTotal
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  要点 {writingReport.pointsHit}/{writingReport.pointsTotal}（{writingReport.pointsPercent}%）
                </span>
              </div>

              <p className="text-xs text-gray-600 mb-2">{writingReport.summary}</p>

              {/* 要点逐项 */}
              <div className="space-y-1 mb-2">
                {writingReport.points.map((pt) => (
                  <div key={pt.label} className="flex items-start gap-1.5 text-xs">
                    <span className={pt.covered ? 'text-green-600' : 'text-orange-500'}>
                      {pt.covered ? '✅' : '❌'}
                    </span>
                    <span className={pt.covered ? 'text-gray-600' : 'text-orange-700'}>
                      {pt.label}
                      {pt.covered && pt.hitKeywords.length > 0 && (
                        <span className="text-gray-400">（写到了 {pt.hitKeywords.join(' / ')}）</span>
                      )}
                      {!pt.covered && <span className="text-orange-500"> —— {pt.hint}</span>}
                    </span>
                  </div>
                ))}
              </div>

              {/* ========== AI 深度批改（可选增强） ========== */}
              <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
                {!llmWriting && (
                  <button
                    onClick={handleLlmGrade}
                    disabled={llmWritingLoading || !llmStatus.available}
                    className="w-full text-xs py-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {llmWritingLoading
                      ? '🤖 AI 批改中…'
                      : llmStatus.available
                        ? '🤖 让 AI 再批一次（内容切题度 / 语言质量 / 逻辑）'
                        : '🤖 AI 批改暂不可用（已用本地规则批改）'}
                  </button>
                )}

                {llmWriting && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-purple-700">🤖 AI 深度批改</p>
                      <div className="flex gap-1.5">
                        {[
                          { label: '内容', v: llmWriting.contentScore, c: 'text-blue-600' },
                          { label: '语言', v: llmWriting.languageScore, c: 'text-green-600' },
                          { label: '综合', v: llmWriting.overallScore, c: 'text-purple-600' },
                        ].map((s) => (
                          <span key={s.label} className={`text-[11px] font-bold ${s.c}`}>
                            {s.label} {s.v}
                          </span>
                        ))}
                      </div>
                    </div>

                    {llmWriting.contentComments.length > 0 && (
                      <div className="text-xs bg-blue-50 border border-blue-100 rounded p-2">
                        <p className="font-medium text-blue-800 mb-1">内容点评</p>
                        {llmWriting.contentComments.map((c2, i) => (
                          <p key={i} className="text-gray-700 mt-0.5">· {c2}</p>
                        ))}
                      </div>
                    )}

                    {llmWriting.languageComments.length > 0 && (
                      <div className="text-xs bg-green-50 border border-green-100 rounded p-2">
                        <p className="font-medium text-green-800 mb-1">语言点评</p>
                        {llmWriting.languageComments.map((c2, i) => (
                          <p key={i} className="text-gray-700 mt-0.5">· {c2}</p>
                        ))}
                      </div>
                    )}

                    {llmWriting.suggestions.length > 0 && (
                      <div className="text-xs bg-purple-50 border border-purple-100 rounded p-2">
                        <p className="font-medium text-purple-800 mb-1">💡 改进建议</p>
                        {llmWriting.suggestions.map((s, i) => (
                          <p key={i} className="text-gray-700 mt-0.5">{i + 1}. {s}</p>
                        ))}
                      </div>
                    )}

                    {llmWriting.betterVersion && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-purple-700 hover:underline">
                          查看参考改写（同样内容，写得更好）
                        </summary>
                        <p className="text-gray-700 bg-gray-50 border border-gray-200 rounded p-2 mt-1 whitespace-pre-line">
                          {llmWriting.betterVersion}
                        </p>
                      </details>
                    )}
                  </div>
                )}
              </div>

              {/* 语法可疑点：只提示不判错 */}
              {writingReport.grammarIssues.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-amber-700 hover:underline">
                    ⚠️ 有 {writingReport.grammarIssues.length} 处可能要检查一下
                  </summary>
                  <div className="mt-1.5 space-y-1">
                    {writingReport.grammarIssues.map((g, i) => (
                      <div key={i} className="text-xs bg-amber-50 border border-amber-100 rounded p-1.5">
                        <p className="text-gray-700">
                          <span className="font-medium">{g.fragment}</span> —— {g.message}
                        </p>
                        <p className="text-gray-500 mt-0.5">💡 {g.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========== 口语任务 ========== */}
      {set_.speaking && (() => {
        const cov = keywordCoverage(speakingText, set_.speaking.keywords);
        return (
          <div className="bg-white rounded-2xl shadow p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-700">🎤 口语任务</h3>
              <span className="text-xs text-gray-400">关键词覆盖 {cov.percent}%</span>
            </div>
            <p className="text-sm text-gray-700 mb-1">{set_.speaking.question}</p>
            <p className="text-xs text-gray-400 mb-2">{set_.speaking.questionZh}</p>
            <ul className="text-xs text-gray-500 list-disc pl-4 mb-2 space-y-0.5">
              {set_.speaking.prompts.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {set_.speaking.keywords.map((k) => {
                const hit = speakingText.toLowerCase().includes(k.toLowerCase());
                return (
                  <span
                    key={k}
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      hit ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {hit ? '✓' : '○'} {k}
                  </span>
                );
              })}
            </div>
            <textarea
              value={speakingText}
              onChange={(e) => setSpeakingText(e.target.value)}
              disabled={submitted}
              rows={4}
              placeholder="先口头说一遍，再把说出的话写下来（用于关键词覆盖自评；正式发音评分后续接入大模型）"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-50"
            />
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-blue-600 hover:underline">查看参考范文</summary>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1">{set_.speaking.modelAnswer}</p>
            </details>
          </div>
        );
      })()}

      {/* ========== 提交 ========== */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex items-center gap-3 z-10">
        {submitted ? (
          <button onClick={() => navigate('/study-plan')} className="btn-primary w-full">
            查看计划进度 →
          </button>
        ) : (
          <>
            <div className="flex-1 text-xs text-gray-500">
              已答 {answeredCount}/{objectiveItems.length} 题
              {set_.writing ? ` · 写作 ${countWords(writingText)} 词` : ''}
            </div>
            <button
              onClick={handleSkip}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-2 shrink-0"
              title="跳过本套，直接进入下一套（不计入连续打卡）"
            >
              跳过本套
            </button>
            <button
              onClick={handleSubmit}
              disabled={answeredCount < objectiveItems.length}
              className="btn-primary px-6 disabled:opacity-40"
            >
              提交并打卡
            </button>
          </>
        )}
      </div>

      {/* ========== 结果 ========== */}
      {submitted && todayLog && (
        <div className="bg-white rounded-2xl shadow p-5 mt-4 text-center">
          <p className="text-2xl font-bold mb-1">
            {todayLog.correctCount}/{todayLog.totalCount} 分
          </p>
          <p className="text-sm text-gray-500 mb-3">
            客观题正确率{' '}
            {todayLog.totalCount ? Math.round((todayLog.correctCount / todayLog.totalCount) * 100) : 0}%
            {writingReport
              ? ` · 写作要点 ${writingReport.pointsHit}/${writingReport.pointsTotal}`
              : todayLog.writingWords > 0
                ? ` · 写作 ${todayLog.writingWords} 词`
                : ''}
            {todayLog.speakingPercent > 0 ? ` · 口语关键词覆盖 ${todayLog.speakingPercent}%` : ''}
            {todayLog.minutes > 0 ? ` · 用时 ${todayLog.minutes} 分钟` : ''}
          </p>
          <p className="text-xs text-green-600 mb-4">✅ 已打卡，连续 {streak} 天 · 错题已进错题本</p>

          {objectiveItems.some((it) => {
            const r = todayLog.results.find((x) => x.id === it.id);
            return r && !r.correct;
          }) && (
            <div className="text-left bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
              <p className="text-xs font-bold text-red-700 mb-1.5">本次错题</p>
              {objectiveItems
                .filter((it) => {
                  const r = todayLog.results.find((x) => x.id === it.id);
                  return r && !r.correct;
                })
                .map((it) => (
                  <p key={it.id} className="text-xs text-gray-700 mb-1">
                    · {it.prompt.slice(0, 50)} → 正确答案：<b>{it.answer}</b>
                  </p>
                ))}
            </div>
          )}
          <button onClick={() => navigate('/wrong')} className="text-xs text-blue-600 hover:underline">
            去错题本 →
          </button>
        </div>
      )}
    </div>
  );
}

// ========== 单题卡片 ==========
function ItemCard({
  item, index, value, onChange, submitted,
}: {
  item: DailyItem;
  index: number;
  value: string;
  onChange: (id: string, v: string) => void;
  submitted: boolean;
}) {
  const isChoice = Array.isArray(item.options) && item.options.length > 0;
  const correct = submitted && judgeText(value, item.answer);
  const isListening = item.kind === 'listening_p1';
  const [playing, setPlaying] = useState(false);

  // 听力：播放预生成 mp3，失败自动回退系统 TTS（Android 本地引擎，离线可用）
  const handlePlay = async () => {
    if (playing) return;
    setPlaying(true);
    try {
      await playAudioWithFallback(item.id, item.audioText ?? '', 0.85);
    } finally {
      setPlaying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-gray-400">第 {index + 1} 题</span>
        <span className="text-[11px] text-gray-400">{item.title}</span>
      </div>

      {/* Part1 是「看图选句」：描述由图片区呈现，这里不重复显示题干 */}
      {!isListening || !item.imageEmoji ? (
        <p className="text-sm text-gray-800 mb-2 whitespace-pre-line">{item.prompt}</p>
      ) : null}

      {isListening && (
        <div className="mb-2">
          <button
            onClick={handlePlay}
            disabled={playing}
            className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 disabled:opacity-60"
          >
            {playing ? '🔊 播放中…（可重听）' : '🔊 播放音频'}
          </button>
          {item.imageEmoji && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-3xl leading-none">{item.imageEmoji}</span>
              {item.imageDesc && <span className="text-xs text-gray-600">{item.imageDesc}</span>}
            </div>
          )}
        </div>
      )}

      {item.kind === 'vocab_spelling' && (
        <div className="mb-2">
          <AudioButton text={item.hint ?? item.answer} label="听发音" size="normal" />
        </div>
      )}

      {isChoice ? (
        <div className="space-y-1.5">
          {item.options!.map((opt, oi) => {
            const selected = value === opt;
            const isAnswer = submitted && opt === item.answer;
            const isWrongPick = submitted && selected && !isAnswer;
            return (
              <button
                key={oi}
                onClick={() => onChange(item.id, opt)}
                disabled={submitted}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                  isAnswer
                    ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                    : isWrongPick
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : selected
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                        : 'border-gray-200 hover:border-blue-300 text-gray-700'
                }`}
              >
                <span className="font-bold mr-1.5">{String.fromCharCode(65 + oi)}.</span>
                {opt}
              </button>
            );
          })}
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(item.id, e.target.value)}
          disabled={submitted}
          placeholder={item.hint ? `提示：${item.hint}` : '输入答案'}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none disabled:bg-gray-50 ${
            submitted
              ? correct
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-200 focus:border-blue-400'
          }`}
        />
      )}

      {submitted && (
        <p className="text-xs text-gray-500 mt-2">
          {correct ? '✅ 正确' : `❌ 正确答案：${item.answer}`}
          {item.explanation ? ` · ${item.explanation}` : ''}
        </p>
      )}

      {submitted && isListening && item.transcript && (
        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-1.5">
          原文：{item.transcript}
        </p>
      )}
    </div>
  );
}
