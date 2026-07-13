// ========== 每日综合训练 ==========
// 一次打卡串起 词汇 / 语法 / 听力 / 阅读 四个模块：熟悉单词 + 练语法 + 练听力 + 练阅读。
// 题目按"薄弱模块 / 薄弱主题"加权抽取（来自错题本），四模块轮转穿插。
import { useState, useMemo, useEffect, useRef } from 'react';
import { useProgressStore, type ModuleType } from '../store/useProgressStore';
import { useDailyMixStore } from '../store/useDailyMixStore';
import {
  generateDailyMix,
  MODULE_META,
  type MixQuestion,
  type MixModule,
} from '../utils/dailyMix';
import { audioFileUrl, playAudioEl, speakText, stopAllAudio, ttsFallbackAllowed } from '../utils/audio';

const MODULES: MixModule[] = ['vocabulary', 'grammar', 'listening', 'reading'];

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?。！？,，]+$/, '');
}

function playMix(q: MixQuestion, rate = 1) {
  const fallback = ttsFallbackAllowed() ? (q.audioText || q.answer) : '';
  if (q.audioId) {
    playAudioEl(audioFileUrl(q.audioId), rate).then((ok) => {
      if (!ok && fallback) speakText(fallback, { rate });
    });
  } else if (fallback) {
    speakText(fallback, { rate });
  }
}

// ---------------- 单题卡片 ----------------
function MixCard({
  q,
  onResult,
  onNext,
}: {
  q: MixQuestion;
  onResult: (correct: boolean, userAnswer: string) => void;
  onNext: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  const needsAudio = q.module === 'listening' || (q.module === 'vocabulary' && q.exerciseType === 'spelling');

  // 听力/拼写题：进入自动播一次
  useEffect(() => {
    if (needsAudio) {
      const t = setTimeout(() => playMix(q, q.module === 'listening' ? 0.9 : 1), 300);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.key]);

  function submit() {
    if (submitted) return;
    let ok = false;
    let ua = '';
    if (q.kind === 'choice') {
      if (selected == null) return;
      ua = selected;
      ok = selected === q.answer;
    } else {
      ua = text;
      if (!ua.trim()) return;
      ok = norm(ua) === norm(q.answer) || (q.accept ?? []).some((a) => norm(a) === norm(ua));
    }
    setCorrect(ok);
    setSubmitted(true);
    onResult(ok, ua);
  }

  return (
    <div>
      {/* 模块标签 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
          {q.moduleIcon} {q.moduleLabel}
        </span>
        {q.source === 'weak' && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-600">薄弱强化</span>
        )}
        <span className="text-xs text-gray-400 ml-auto truncate max-w-[45%]">{q.subjectName}</span>
      </div>

      {/* 音频按钮（听力/拼写） */}
      {needsAudio && (
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => playMix(q, q.module === 'listening' ? 0.9 : 1)}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            🔊 播放
          </button>
          <button
            onClick={() => playMix(q, 0.7)}
            className="px-3 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg text-sm hover:bg-blue-50"
          >
            🐢 慢速
          </button>
        </div>
      )}

      {/* 阅读上下文 */}
      {q.passage && (
        <div className="mb-3 p-3 bg-gray-50 border border-gray-100 rounded-xl text-[15px] text-gray-700 leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto">
          {q.passage}
        </div>
      )}

      {/* 题干 */}
      <p className="text-base font-medium text-gray-800 mb-1">{q.prompt}</p>
      {q.promptZh && <p className="text-[15px] text-gray-600 mb-3 whitespace-pre-line">{q.promptZh}</p>}
      {q.hint && !submitted && q.kind === 'input' && (
        <p className="text-xs text-gray-400 mb-3">提示：{q.hint}</p>
      )}

      {/* 选择题 */}
      {q.kind === 'choice' && q.options && (
        <div className="space-y-2 mb-4">
          {q.options.map((opt) => {
            const isSel = selected === opt;
            const isAns = opt === q.answer;
            let cls = 'border-gray-200 bg-white hover:border-blue-300';
            if (submitted) {
              if (isAns) cls = 'border-green-500 bg-green-50';
              else if (isSel) cls = 'border-red-400 bg-red-50';
              else cls = 'border-gray-200 bg-white opacity-70';
            } else if (isSel) {
              cls = 'border-blue-500 bg-blue-50';
            }
            return (
              <button
                key={opt}
                disabled={submitted}
                onClick={() => setSelected(opt)}
                className={`w-full text-left px-4 py-2.5 rounded-xl border transition-colors ${cls}`}
              >
                <span className="text-[15px] text-gray-800">{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 填空 / 改错 */}
      {q.kind === 'input' && (
        <input
          type="text"
          value={text}
          disabled={submitted}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="输入你的答案…"
          className={`w-full px-4 py-2.5 rounded-xl border mb-4 outline-none ${
            submitted
              ? correct
                ? 'border-green-500 bg-green-50'
                : 'border-red-400 bg-red-50'
              : 'border-gray-300 focus:border-blue-500'
          }`}
        />
      )}

      {/* 反馈 */}
      {submitted && (
        <div
          className={`mb-4 p-3 rounded-xl text-sm ${
            correct ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}
        >
          <p className="font-medium mb-0.5">{correct ? '✅ 答对了！' : '❌ 答错了'}</p>
          {!correct && (
            <p>
              正确答案：<span className="font-semibold">{q.answer}</span>
            </p>
          )}
          {q.explain && <p className="text-gray-600 mt-1">{q.explain}</p>}
        </div>
      )}

      {/* 操作 */}
      {!submitted ? (
        <button
          onClick={submit}
          disabled={q.kind === 'choice' ? selected == null : !text.trim()}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          提交
        </button>
      ) : (
        <button
          onClick={onNext}
          className="w-full py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900"
        >
          下一题 →
        </button>
      )}
    </div>
  );
}

// ---------------- 战报 ----------------
function MixSummary({
  results,
  streak,
}: {
  results: { module: MixModule; correct: boolean }[];
  streak: number;
}) {
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const acc = total ? Math.round((correct / total) * 100) : 0;
  const accColor = acc >= 80 ? 'text-green-600' : acc >= 60 ? 'text-amber-600' : 'text-red-500';

  const byModule = MODULES.map((m) => {
    const rs = results.filter((r) => r.module === m);
    return { m, t: rs.length, c: rs.filter((r) => r.correct).length };
  }).filter((x) => x.t > 0);

  const weak = byModule.filter((x) => x.c / x.t < 0.6).map((x) => MODULE_META[x.m].label);

  return (
    <div className="mt-5 text-left bg-gray-50 rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-800">📊 今日战报</h3>
        <span className={`text-lg font-bold ${accColor}`}>{acc}%</span>
      </div>
      <div className="flex items-end gap-5 mb-4">
        <div><div className="text-2xl font-bold text-gray-800">{total}</div><div className="text-xs text-gray-400">总题数</div></div>
        <div><div className="text-2xl font-bold text-green-600">{correct}</div><div className="text-xs text-gray-400">答对</div></div>
        <div><div className="text-2xl font-bold text-red-500">{total - correct}</div><div className="text-xs text-gray-400">答错</div></div>
        <div className="ml-auto text-right"><div className="text-2xl font-bold text-orange-600">🔥{streak}</div><div className="text-xs text-gray-400">连续天数</div></div>
      </div>
      <div className="space-y-1.5 mb-4">
        {byModule.map((x) => {
          const pc = Math.round((x.c / x.t) * 100);
          return (
            <div key={x.m} className="flex items-center gap-2 text-sm">
              <span className="w-16 text-gray-500">{MODULE_META[x.m].icon} {MODULE_META[x.m].label}</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${pc >= 80 ? 'bg-green-500' : pc >= 60 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${pc}%` }} />
              </div>
              <span className="w-14 text-right text-gray-400">{x.c}/{x.t}</span>
            </div>
          );
        })}
      </div>
      {weak.length > 0 ? (
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <p className="text-sm text-amber-800">⚠️ 今天较薄弱：<span className="font-medium">{weak.join('、')}</span>。错题已进入错题本，明天会优先出现。</p>
        </div>
      ) : (
        <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
          <p className="text-sm text-green-700">✅ 各模块表现都不错，坚持每天练！</p>
        </div>
      )}
    </div>
  );
}

export default function DailyTrainingPage() {
  const progress = useProgressStore();
  const mix = useDailyMixStore();

  const [questions, setQuestions] = useState<MixQuestion[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [finished, setFinished] = useState(false);
  const resultsRef = useRef<{ module: MixModule; correct: boolean }[]>([]);

  useEffect(() => () => stopAllAudio(), []);

  const isTodayDone = mix.isTodayDone();

  // 各模块正确率（用于组题加权）
  const moduleAccuracy = useMemo(() => {
    const acc = {} as Record<MixModule, number>;
    for (const m of MODULES) {
      const s = progress.getModuleStats(m as ModuleType);
      acc[m] = s.totalQuestions > 0 ? s.correctQuestions / s.totalQuestions : -1;
    }
    return acc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function start() {
    const weak = {} as Record<MixModule, string[]>;
    for (const m of MODULES) {
      weak[m] = Array.from(new Set(progress.getWrongAnswers(m as ModuleType).map((r) => r.subjectId)));
    }
    const qs = generateDailyMix({ weak, moduleAccuracy, total: 15 });
    resultsRef.current = [];
    setQuestions(qs);
    setIdx(0);
    setFinished(false);
  }

  function handleResult(q: MixQuestion, correct: boolean, userAnswer: string) {
    resultsRef.current.push({ module: q.module, correct });
    progress.recordAnswer({
      module: q.module as ModuleType,
      exerciseType: q.exerciseType,
      subjectId: q.subjectId,
      subjectName: q.subjectName,
      questionId: q.questionId,
      questionText: q.promptZh || q.prompt,
      userAnswer,
      correctAnswer: q.answer,
      isCorrect: correct,
    });
  }

  function handleNext() {
    stopAllAudio();
    if (!questions) return;
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
    } else {
      // 结算
      const results = resultsRef.current;
      const byModule: Record<string, { total: number; correct: number }> = {};
      for (const r of results) {
        byModule[r.module] = byModule[r.module] ?? { total: 0, correct: 0 };
        byModule[r.module].total += 1;
        byModule[r.module].correct += r.correct ? 1 : 0;
      }
      mix.completeToday({
        total: results.length,
        correct: results.filter((r) => r.correct).length,
        byModule: byModule as any,
      });
      setFinished(true);
    }
  }

  // 30 天热力图
  const heatmap = useMemo(() => {
    const set = new Set(mix.history.map((h) => h.date));
    const days: { date: string; on: boolean }[] = [];
    const base = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({ date: ds, on: set.has(ds) });
    }
    return days;
  }, [mix.history]);

  const cur = questions?.[idx];
  const running = questions && !finished;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">每日综合训练</h1>
        <span className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-medium">🔥 连续 {mix.streak} 天</span>
      </div>

      {/* 顶部：热力图 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">最近 30 天打卡</span>
          <span className="text-sm text-gray-400">{mix.history.length} 天记录</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {heatmap.map((d) => (
            <div key={d.date} title={d.date} className={`w-3.5 h-3.5 rounded-sm ${d.on ? 'bg-green-500' : 'bg-gray-100'}`} />
          ))}
        </div>
      </div>

      {/* 未开始 / 已完成概览 */}
      {!questions && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
          <div className="text-5xl mb-3">{isTodayDone ? '🎉' : '🚀'}</div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {isTodayDone ? '今日综合训练已完成！' : '一次练齐：单词 · 语法 · 听力 · 阅读'}
          </h2>
          <p className="text-gray-500 mb-2">
            {isTodayDone ? `连续打卡 ${mix.streak} 天，可以再来一组巩固。` : '约 15 题，四模块轮流出现，弱项会自动多练。'}
          </p>
          <div className="flex flex-wrap justify-center gap-2 my-4">
            {MODULES.map((m) => (
              <span key={m} className="px-3 py-1.5 rounded-full text-sm bg-gray-50 text-gray-600 border border-gray-100">
                {MODULE_META[m].icon} {MODULE_META[m].label}
              </span>
            ))}
          </div>
          <button onClick={start} className="px-6 py-3 bg-blue-600 text-white rounded-xl text-lg font-medium hover:bg-blue-700">
            {isTodayDone ? '再练一组 →' : '开始今日训练 →'}
          </button>
        </div>
      )}

      {/* 进行中 */}
      {running && cur && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-400">第 {idx + 1} / {questions!.length} 题</span>
            <span className="text-sm text-gray-400">
              ✓ {resultsRef.current.filter((r) => r.correct).length}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${(idx / questions!.length) * 100}%` }} />
          </div>
          <MixCard key={cur.key} q={cur} onResult={(c, ua) => handleResult(cur, c, ua)} onNext={handleNext} />
        </div>
      )}

      {/* 完成 */}
      {questions && finished && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">今日综合训练完成！</h2>
          <p className="text-gray-500">连续打卡 <span className="font-medium text-orange-600">{mix.streak}</span> 天，真棒！</p>
          <MixSummary results={resultsRef.current} streak={mix.streak} />
          <button onClick={() => setQuestions(null)} className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            返回
          </button>
        </div>
      )}
    </div>
  );
}
