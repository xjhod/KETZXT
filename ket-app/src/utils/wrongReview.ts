/**
 * 错题复盘提醒（纯函数层，无浏览器依赖）。
 *
 * 借鉴学而思「错题归集 + 定期复盘」：错过的题隔几天再推一次，
 * 比连着刷同一道更能巩固。数据源是错题本 AnswerRecord（最后一次作答为错）。
 *
 * 口径：
 *  - 一道题「上次答错」距今 >= days 天（默认 3）→ 进入今日复盘。
 *  - 只挑 getWrongAnswers() 的错题（ latest 为错），答对的不算。
 *  - 同一题在 records 里可能有多条（历史），取最新一条的 answeredAt 判距今天数。
 *  - 纯筛选，不改入参、不写 store、不动现有错题本逻辑。
 */
import type { AnswerRecord } from '../store/useProgressStore';
import { todayString, daysBetween } from './vocabSchedule';

/** 默认复盘间隔（天） */
export const WRONG_REVIEW_DAYS = 3;

/** 把 ISO 时间戳转成本地日期 key（YYYY-MM-DD），避免 toISOString 的 UTC 串天 */
export function isoToDateKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return todayString(d);
}

/**
 * 挑出到今天该复盘的错题。
 *
 * @param wrongRecords 已按「每题最新作答」筛好的错题列表（getWrongAnswers 的返回值）
 * @param today 今天日期 key（YYYY-MM-DD），可注入做确定性校验
 * @param days 距上次答错多少天后提醒（默认 3）
 */
export function pickWrongReview(
  wrongRecords: readonly AnswerRecord[],
  today: string,
  days = WRONG_REVIEW_DAYS
): AnswerRecord[] {
  const out: AnswerRecord[] = [];
  for (const r of wrongRecords || []) {
    if (!r || r.isCorrect !== false) continue;
    const key = isoToDateKey(r.answeredAt);
    if (!key) continue;
    if (daysBetween(key, today) >= days) out.push(r);
  }
  // 越早错的排前面（先复盘最该巩固的）
  out.sort((a, b) => a.answeredAt.localeCompare(b.answeredAt));
  return out;
}

/** 今日复盘提示文案 */
export function wrongReviewHint(count: number, days = WRONG_REVIEW_DAYS): string {
  if (count <= 0) return '';
  return `${count} 道 ${days} 天前的错题，今天再练一次`;
}
