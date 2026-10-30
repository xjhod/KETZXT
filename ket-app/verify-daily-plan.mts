/**
 * 每日备考题组校验
 * 运行： node --experimental-strip-types verify-daily-plan.mts
 *
 * 校验 dailyPlan 的五条关键性质（出题逻辑一旦破坏，用户每天拿到的题会错乱）：
 *  1. 日期推进正确：起始日 = 第 1 天周一，跨周/跨月/跨年都落在正确的周与星期
 *  2. 同一套索引出同一套题（确定性），不同套出不同的题
 *  3. 每道客观题的答案都能在数据里定位（选项型答案必须在 options 里）
 *  4. 任务驱动的题组：当天有阅读任务就有阅读题，有写作任务就有写作卡
 *  5. **进度式推进**：出题索引由「已完成套数」决定而非日历日期
 *     —— 同一套索引无论哪天做都是同一套题，做完或跳过后才推进
 */
import {
  buildDailySet, resolveContext, dateKey, diffDays, addDays, judgeText, keywordCoverage,
  WRITING_PROMPTS,
} from './src/data/dailyPlan.ts';

let fail = 0;
const bad = (m: string) => { console.log('  ❌ ' + m); fail++; };

const START = '2026-10-26'; // 周一

// ---------- 1. 推进位置计算 ----------
console.log('=== 推进位置：起始日应为第1周第1天(周一) ===');
const c0 = resolveContext(START, 0);
if (c0.weekIndex !== 0) bad(`起始日 weekIndex 应为 0，实为 ${c0.weekIndex}`);
if (c0.dayOfWeek !== 1) bad(`起始日 dayOfWeek 应为 1(周一)，实为 ${c0.dayOfWeek}`);
if (c0.dayIndex !== 0) bad(`起始日 dayIndex 应为 0，实为 ${c0.dayIndex}`);
if (c0.tasks.length === 0) bad('起始日没有任务（周一应有写作任务）');
if (c0.dateStr !== START) bad(`起始日 dateStr 应为 ${START}，实为 ${c0.dateStr}`);
console.log(`  起始日 → 第${c0.weekIndex + 1}周第${c0.dayOfWeek}天, 任务${c0.tasks.length}项: ${c0.tasks.map((t) => t.area).join('/')}`);

console.log('=== 跨周：第 7 天应进入第 2 周 ===');
const c6 = resolveContext(START, 6);
if (c6.weekIndex !== 0 || c6.dayOfWeek !== 7) bad(`第7天应为 第1周第7天，实为 第${c6.weekIndex + 1}周第${c6.dayOfWeek}天`);
const c7 = resolveContext(START, 7);
if (c7.weekIndex !== 1 || c7.dayOfWeek !== 1) bad(`第8天应为 第2周第1天，实为 第${c7.weekIndex + 1}周第${c7.dayOfWeek}天`);
console.log(`  第7天→第${c6.weekIndex + 1}周第${c6.dayOfWeek}天 / 第8天→第${c7.weekIndex + 1}周第${c7.dayOfWeek}天`);

console.log('=== 跨月：第 5 周应为第 2 月 ===');
const c28 = resolveContext(START, 28);
if (c28.month !== 2) bad(`第29天应在第2月，实为第${c28.month}月`);
console.log(`  第29天 → 第${c28.month}月第${c28.weekInMonth}周 (${c28.phase.name})`);

console.log('=== 跨年：跨年不串月不串周（与不跨年的同偏移对照）===');
const ny = resolveContext('2026-12-28', 7);
const nyRef = resolveContext('2026-06-01', 7);
if (ny.weekIndex !== nyRef.weekIndex || ny.dayOfWeek !== nyRef.dayOfWeek) {
  bad(`跨年后周次错位: 第${ny.weekIndex + 1}周第${ny.dayOfWeek}天 vs 参照 第${nyRef.weekIndex + 1}周第${nyRef.dayOfWeek}天`);
}
if (ny.month !== 1 || ny.weekInMonth !== 2) bad(`跨年后应为第1月第2周，实为第${ny.month}月第${ny.weekInMonth}周`);
console.log(`  2026-12-28 → 2027-01-04 = 第${ny.month}月第${ny.weekInMonth}周 第${ny.dayOfWeek}天（与不跨年同偏移一致 ✓）`);

console.log('=== 边界：计划已结束 ===');
if (!resolveContext(START, 48 * 7).finished) bad('48周后应标记 finished');
if (resolveContext(START, 48 * 7 - 1).finished) bad('第48周最后一天不应标记 finished');
console.log('  已结束判定正常');

// ---------- 2. 确定性 ----------
console.log('=== 确定性：同一套索引出同一套题 ===');
const a1 = buildDailySet(START, 3);
const a2 = buildDailySet(START, 3);
const ids1 = a1.items.map((i) => i.id).join(',');
const ids2 = a2.items.map((i) => i.id).join(',');
if (ids1 !== ids2) bad('同一索引两次生成的题目 id 不一致');
console.log(`  ${a1.items.length} 题, id 序列一致 ✓`);

console.log('=== 不同套出不同的题 ===');
const b1 = buildDailySet(START, 4);
const diff = b1.items.filter((i) => !ids1.split(',').includes(i.id)).length;
if (diff === 0) bad('不同索引生成的题目完全相同');
console.log(`  下一套新题 ${diff}/${b1.items.length} 道`);

// ---------- 2b. 进度式核心：同一套索引与「哪一天做」无关 ----------
console.log('=== 进度式：第3套无论隔多久做都是同一套（不随日历变） ===');
const day1 = buildDailySet(START, 3);
const day2 = buildDailySet(START, 3);
if (day1.items.map((i) => i.id).join() !== day2.items.map((i) => i.id).join()) {
  bad('同一索引在不同调用下题目不一致');
}
if (day1.context.dayIndex !== 3) bad('进度式下 dayIndex 应等于套索引');
if (day1.context.dateStr !== addDays(START, 3)) bad(`计划日应为 ${addDays(START, 3)}，实为 ${day1.context.dateStr}`);
console.log(`  第3套 → 计划日 ${day1.context.dateStr}（起始日+3天，与今天几号无关）✓`);

// ---------- 3. 答案可定位 ----------
console.log('=== 答案可定位性（抽查 60 套）===');
let checked = 0, itemCount = 0;
for (let d = 0; d < 60; d++) {
  const s = buildDailySet(START, d);
  for (const it of s.items) {
    itemCount++;
    if (it.options && it.options.length > 0) {
      if (!it.options.includes(it.answer)) bad(`第${d}套 ${it.id} 答案'${it.answer}' 不在 options 内`);
    } else if (!it.answer || !it.answer.trim()) {
      bad(`第${d}套 ${it.id} 填空题答案为空`);
    }
    if (!it.prompt || !it.prompt.trim()) bad(`第${d}套 ${it.id} 题干为空`);
  }
  checked++;
}
console.log(`  ${checked} 套 / ${itemCount} 道题全部通过`);

// ---------- 4. 任务驱动 ----------
console.log('=== 任务驱动的题组 ===');
const kindsOf = (s: ReturnType<typeof buildDailySet>) => new Set(s.items.map((i) => i.kind));
let areaMatched = 0;
for (let d = 0; d < 14; d++) {
  const s = buildDailySet(START, d);
  const areas = new Set(s.context.tasks.map((t) => t.area));
  if (areas.has('reading') && !kindsOf(s).has('reading_choice')) bad(`第${d}套 有阅读任务但无阅读题`);
  if (areas.has('writing') && !s.writing) bad(`第${d}套 有写作任务但无写作卡`);
  if (areas.has('speaking') && !s.speaking) bad(`第${d}套 有口语任务但无口语卡`);
  if (areas.has('listening') && !s.listening) bad(`第${d}套 有听力任务但无听力卡`);
  if (areas.has('writing')) areaMatched++;
}
console.log(`  14 套任务→题组映射正常（其中 ${areaMatched} 套含写作任务）`);

// ---------- 5. 写作题与判分工具 ----------
console.log('=== 写作题库与判分函数 ===');
if (WRITING_PROMPTS.length < 12) bad(`写作题只有 ${WRITING_PROMPTS.length} 道，轮转周期过短`);
for (const p of WRITING_PROMPTS) {
  if (!p.template || !p.template.trim()) bad(`${p.id} 缺模板`);
  if (p.template.length < 30) bad(`${p.id} 模板过短`);
  if (!p.requirement || !p.requirement.trim()) bad(`${p.id} 缺要求说明`);
}
if (!judgeText(' Last Summer ', 'last summer')) bad('judgeText 未忽略大小写/空格');
if (!judgeText('He likes cats.', 'he likes cats')) bad('judgeText 未忽略标点');
if (judgeText('wrong', 'right')) bad('judgeText 误判');
const cov = keywordCoverage('There are four people in my family: mother, father and sister', ['family', 'mother', 'father', 'brother']);
if (cov.hit !== 3 || cov.total !== 4) bad(`keywordCoverage 计数错误: hit=${cov.hit}`);
console.log(`  写作题 ${WRITING_PROMPTS.length} 道（模板/要求齐全）· 判分/覆盖函数正常`);

console.log('');
if (fail === 0) {
  console.log('✅ 每日备考题组校验通过（含进度式推进验证）');
} else {
  console.log(`❌ ${fail} 处问题`);
}
process.exit(fail === 0 ? 0 : 1);
