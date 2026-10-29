// KETZXT 1年备考计划 · 数据校验脚本（仓库内）
// 运行：node --experimental-strip-types verify-study-plan.mts
import { studyPlan, RATIOS } from './src/data/studyPlan.ts';

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error('校验失败: ' + msg);
}

// 1. 周数 = 48
assert(studyPlan.weeks.length === 48, `weeks=${studyPlan.weeks.length} 应为48`);

// 2. 每月恰 4 周
for (let m = 1; m <= 12; m++) {
  const c = studyPlan.weeks.filter((w) => w.month === m).length;
  assert(c === 4, `month ${m} weeks=${c} 应为4`);
}

// 3. 配比闭合 100
const sum = Object.values(RATIOS).reduce((a, b) => a + b, 0);
assert(sum === 100, `ratios sum=${sum} 应为100`);

// 4. 写作占比 > 阅读（诊断驱动：写作最弱→最大投入）
assert(RATIOS.writing > RATIOS.reading, `写作(${RATIOS.writing}) 应大于 阅读(${RATIOS.reading})`);

// 5. 每周任务时长合法、阶段标签正确
const phaseMonths = new Map(studyPlan.phases.map((p) => [p.id, p.months]));
for (const w of studyPlan.weeks) {
  const total = w.tasks.reduce((a, t) => a + t.minutes, 0);
  assert(total > 0, `week ${w.month}-${w.week} total=${total}`);
  const ph = studyPlan.phases.find((p) => p.id === w.phase);
  assert(!!ph, `week ${w.month}-${w.week} 阶段缺失`);
  const [lo, hi] = phaseMonths.get(w.phase)!;
  assert(w.month >= lo && w.month <= hi, `week ${w.month}-${w.week} 阶段与月份不匹配`);
  for (const t of w.tasks) {
    assert(t.minutes > 0, `week ${w.month}-${w.week} day${t.day} 时长非法`);
    assert(['reading', 'writing', 'listening', 'speaking'].includes(t.area), `area 非法: ${t.area}`);
  }
}

// 6. 脚手架齐全（写作专项主攻）
assert(studyPlan.scaffolds.length >= 4, `scaffolds=${studyPlan.scaffolds.length} 不足`);

// 7. 周投入分布复核：写作应最高
const weekAreaMax: Record<string, number> = { writing: 0, speaking: 0, reading: 0, listening: 0 };
for (const w of studyPlan.weeks) {
  const byArea: Record<string, number> = { writing: 0, speaking: 0, reading: 0, listening: 0 };
  for (const t of w.tasks) byArea[t.area] += t.minutes;
  for (const k of Object.keys(byArea)) weekAreaMax[k] = Math.max(weekAreaMax[k], byArea[k]);
}
assert(weekAreaMax.writing >= 50, `写作周投入偏低: ${weekAreaMax.writing}`);

console.log('✅ KETZXT 1年备考计划数据校验通过');
console.log(`   周数:        ${studyPlan.weeks.length}`);
console.log(`   阶段:        ${studyPlan.phases.map((p) => p.name).join(' / ')}`);
console.log(`   配比:        读${RATIOS.reading}/写${RATIOS.writing}/听${RATIOS.listening}/说${RATIOS.speaking}`);
console.log(`   写作脚手架:  ${studyPlan.scaffolds.length} 个`);
console.log(`   写作周投入:  ≥${weekAreaMax.writing} 分/周`);
