// ========== 复习负载预警：按到期日聚合未来复习量 ==========
//
// 决策来源：竞品借鉴任务单 #2（墨墨的「未来要复习多少」预警）。
// 目的：让孩子/家长提前看到复习堆积，避免「今天猛背、三天后被复习量压垮弃坑」。
//
// 口径（严格遵守）：
//   · 只读现有 progress 的 dueAt / status，不修改任何记忆状态
//   · 只统计已进入记忆的词（status !== 'new'），新词不计
//   · 逾期（dueAt <= today）一律归到「今天」桶——它们此刻就该复习
//   · 预警只看数量与分布，不碰升盒/判分/掌握判定
//   · 纯函数、无浏览器依赖，可被 Node 校验脚本直接跑
import type { VocabWordProgress } from '../types';
import { addDays } from './vocabSchedule';

export type LoadLevel = 'ok' | 'busy' | 'overload';

export interface DayBucket {
  date: string;       // YYYY-MM-DD
  offset: number;     // 距今天数（0=今天，逾期也归此）
  count: number;      // 当天到期词数
}

export interface ReviewLoad {
  today: number;              // 今天（含逾期）到期
  next7: number;              // 未来 7 天（含今天）总量
  next30: number;             // 未来 30 天（含今天）总量
  dailyCapacity: number;      // 每天计划的复习上限
  peak: DayBucket | null;     // 未来 30 天里到期最多的一天
  level: LoadLevel;           // 预警等级
  buckets: DayBucket[];       // 30 天完整分布（供 UI 画柱状图）
}

/** 未来 30 天的到期分布。纯聚合，不修改任何 progress。 */
export function buildReviewLoad(
  progress: Record<string, VocabWordProgress>,
  today: string,
  dailyCapacity = 8
): ReviewLoad {
  const buckets: DayBucket[] = [];
  for (let i = 0; i < 30; i++) {
    buckets.push({ date: addDays(today, i), offset: i, count: 0 });
  }
  const index = new Map(buckets.map((b) => [b.date, b]));

  for (const p of Object.values(progress)) {
    if (p.status === 'new' || !p.dueAt) continue;
    // 逾期与今天都归到 offset 0 桶
    const bucket = (p.dueAt <= today ? buckets[0] : index.get(p.dueAt));
    if (bucket) bucket.count++;
    // dueAt 超出 30 天的（Box5 掌握词 15 天后仍可能在窗口内；更远的不计）
  }

  const todayCount = buckets[0].count;
  const next7 = buckets.slice(0, 7).reduce((s, b) => s + b.count, 0);
  const next30 = buckets.reduce((s, b) => s + b.count, 0);
  let peak = buckets[0];
  for (const b of buckets) if (b.count > peak.count) peak = b;

  // 预警：看单日峰值 vs 每日容量，以及今天积压。
  //   overload：今天积压 > 2×容量，或峰值 > 2.5×容量
  //   busy：峰值 > 容量，或未来 7 天日均 > 容量
  const cap = Math.max(1, dailyCapacity);
  let level: LoadLevel = 'ok';
  if (todayCount > cap * 2 || peak.count > cap * 2.5) level = 'overload';
  else if (peak.count > cap || next7 / 7 > cap) level = 'busy';

  return { today: todayCount, next7, next30, dailyCapacity: cap, peak, level, buckets };
}

/** 给 UI 的一句话文案；level 决定颜色，文案说明峰值日与量 */
export function loadWarningText(load: ReviewLoad): string {
  if (load.next30 === 0) return '还没有进入复习的词，先学几个新词吧。';
  const p = load.peak;
  if (!p || p.count === 0) return '近期没有集中到期的词，节奏很稳。';
  const when = p.offset === 0 ? '今天' : `${p.offset} 天后`;
  if (load.level === 'overload') {
    return `${when}有 ${p.count} 个词集中到期（每天计划 ${load.dailyCapacity} 个），建议今天先消化一部分。`;
  }
  if (load.level === 'busy') {
    return `${when}有 ${p.count} 个词到期，略高于每日 ${load.dailyCapacity} 个的节奏，留意一下。`;
  }
  return `未来 7 天共 ${load.next7} 个词到期，节奏平稳。`;
}
