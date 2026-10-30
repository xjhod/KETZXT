// ========== 今日备考 ==========
// 把「1年备考计划」落到今天：定位到第几周第几天 → 今日任务 + 今日题组 → 作答判分 → 打卡。
// 判分结果写入 useProgressStore（错题本 + 学习统计），完成记录写入 usePlanStore。
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildDailySet, dateKey, judgeText, keywordCoverage, type DailyItem, type DailySet } from '../data/dailyPlan';
import { usePlanStore } from '../store/usePlanStore';
import { useProgressStore, type ModuleType } from '../store/useProgressStore';
import { AudioButton } from '../components/AudioButton';

const AREA_META: Record<string, { label: string; color: string; bg: string }> = {
  reading:   { label: '阅读', color: 'text-purple-600',   bg: 'bg-purple-50 border-purple-100' },
  writing:   { label: '写作', color: 'text-blue-600',     bg: 'bg-blue-50 border-blue-100' },
  listening: { label: '听力', color: 'text-orange-600',   bg: 'bg-orange-50 border-orange-100' },
  speaking:  { label: '口语', color: 'text-green-600',    bg: 'bg-green-50 border-green-100' },
};

function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

export default function PlanTodayPage() {
  const navigate = useNavigate();
  const [todayKey] = useState(() => dateKey(new Date()));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [writingText, setWritingText] = useState('');
  const [speakingText, setSpeakingText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(() => Date.now());

  const startDate = usePlanStore((s) => s.startDate);
  const ensureStartDate = usePlanStore((s) => s.ensureStartDate);
  const logs = usePlanStore((s) => s.logs);
  const saveLog = usePlanStore((s) => s.saveLog);
  const getStreak = usePlanStore((s) => s.getStreak);
  const getCompletedCount = usePlanStore((s) => s.getCompletedCount);
  const recordAnswer = useProgressStore((s) => s.recordAnswer);
  const recordSession = useProgressStore((s) => s.recordSession);

  useEffect(() => {
    ensureStartDate(todayKey);
  }, [ensureStartDate, todayKey]);

  const effectiveStart = startDate ?? todayKey;
  const set_: DailySet = useMemo(
    () => buildDailySet(effectiveStart, todayKey),
    [effectiveStart, todayKey]
  );
  const ctx = set_.context;
  const todayLog = logs[todayKey];

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
    const writingDone = Boolean(set_.writing) && writingWords >= (set_.writing?.prompt.minWords ?? 0);
    const cov = set_.speaking ? keywordCoverage(speakingText, set_.speaking.keywords) : null;

    saveLog({
      date: todayKey,
      itemIds: objectiveItems.map((i) => i.id),
      results: results.map((r) => ({ id: r.item.id, correct: r.correct })),
      correctCount,
      totalCount: objectiveItems.length,
      writingDone,
      writingWords,
      speakingDone: Boolean(set_.speaking && cov && cov.percent >= 60),
      speakingPercent: cov?.percent ?? 0,
      minutes,
      completedAt: new Date().toISOString(),
    });
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ========== 未开始 / 已结束 ==========
  if (ctx.dayIndex < 0) {
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
      {todayLog && !submitted && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
          <p className="text-sm text-green-700 font-medium">
            ✅ 今天已完成：客观题 {todayLog.correctCount}/{todayLog.totalCount} 正确
            {todayLog.writingDone ? '，写作已完成' : ''}
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
                {todayLog?.writingDone ? '✅ 已达标' : '⚠️ 未达词数要求'}
              </span>
            )}
          </div>
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

      {/* ========== 听力任务 ========== */}
      {set_.listening && (
        <div className="bg-white rounded-2xl shadow p-4 mb-4">
          <h3 className="font-bold text-gray-700 mb-1">🎧 听力任务</h3>
          <p className="text-xs text-gray-500 mb-2">{set_.listening.hint}</p>
          <button onClick={() => navigate('/listening')} className="btn-primary text-sm">
            进入听力模块 →
          </button>
        </div>
      )}

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

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-gray-400">第 {index + 1} 题</span>
        <span className="text-[11px] text-gray-400">{item.title}</span>
      </div>

      <p className="text-sm text-gray-800 mb-2 whitespace-pre-line">{item.prompt}</p>

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
    </div>
  );
}
