/**
 * 稳定交错（打散同类连做）——纯函数层，无随机、可复现。
 *
 * 借鉴词汇 buildTodayQueue 里 interleave 的思路（按 themeId 分组轮转），
 * 抽成通用函数供语法/阅读复用：按 keyOf 把条目分组，轮流从各组取一个，
 * 让同类型的题不再连续出现。
 *
 * 约束：
 *  - 全程无 Math.random：输入顺序即稳定种子，同输入必得同输出（校验可断言）。
 *  - 不改入参、不打乱组内相对顺序（组内 keep 原序）。
 *  - 答案/元数据跟着条目对象一起移动，绝不拆成平行数组分别重排。
 */

/**
 * 按 keyOf 分组后逐轮轮转，输出打散后的数组。
 *
 * 例：输入 [A1,A2,A3,B1,B2]（key 是首字母）→ [A1,B1,A2,B2,A3]
 */
export function interleaveBy<T>(items: readonly T[], keyOf: (item: T) => string): T[] {
  const groups = new Map<string, T[]>();
  for (const it of items || []) {
    const k = keyOf(it);
    const g = groups.get(k);
    if (g) g.push(it);
    else groups.set(k, [it]);
  }
  const queues = [...groups.values()];
  const out: T[] = [];
  let remaining = true;
  while (remaining) {
    remaining = false;
    for (const q of queues) {
      if (q.length > 0) {
        out.push(q.shift()!);
        remaining = true;
      }
    }
  }
  return out;
}

/**
 * 是否已达成交错：相邻同类（同 key）的题不超过 maxRun 道。
 * 用于校验「不再连做同类」。
 */
export function maxSameKeyRun<T>(items: readonly T[], keyOf: (item: T) => string): number {
  let max = 0;
  let cur = 0;
  let prev: string | undefined;
  for (const it of items || []) {
    const k = keyOf(it);
    if (k === prev) cur++;
    else { cur = 1; prev = k; }
    if (cur > max) max = cur;
  }
  return max;
}
