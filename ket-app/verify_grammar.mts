// 语法模块全量校验脚本
// 运行: node --experimental-strip-types verify_grammar.mts
// 参照词汇 verify_all.mts，扫描语法数据（grammar.ts）的硬伤与软告警。
import * as grammar from './src/data/grammar.ts';

type G = any;
const problems: string[] = [];   // 硬 FAIL（必须修）
const warnings: string[] = [];   // 软告警（建议修）
const ids = new Map<string, string>(); // 全局 question id 去重

// ---------- 1. allGrammarPoints 校验 ----------
const gp = grammar.allGrammarPoints as G[];
if (!Array.isArray(gp)) {
  problems.push('allGrammarPoints 不是数组');
} else {
  if (gp.length !== 20) problems.push(`allGrammarPoints 数量应为 20，实际 ${gp.length}`);
  const gpIds = new Set<string>();
  for (const p of gp) {
    if (!p.id) problems.push('GrammarPoint 缺 id');
    if (gpIds.has(p.id)) problems.push(`GrammarPoint 重复 id ${p.id}`);
    gpIds.add(p.id);
    if (!p.name || !p.nameZh) problems.push(`GrammarPoint ${p.id} 缺 name/nameZh`);
    if (!p.explanation || !String(p.explanation).trim()) problems.push(`GrammarPoint ${p.id} 缺 explanation`);
    if (!Array.isArray(p.examples) || p.examples.length === 0)
      problems.push(`GrammarPoint ${p.id} 缺 examples`);
    else for (const ex of p.examples)
      if (!ex.en || !ex.zh) problems.push(`GrammarPoint ${p.id} 例句缺 en/zh`);
  }
  // GrammarPoint id 应覆盖 G01..G20
  for (let i = 1; i <= 20; i++) {
    const id = 'G' + String(i).padStart(2, '0');
    if (!gpIds.has(id)) problems.push(`allGrammarPoints 缺少 ${id}`);
  }
}

// ---------- 2. 遍历 g01..g20 三题型 ----------
function checkQuestion(q: G, gid: string, ptype: string, src: string) {
  const tag = `${src} ${q.id}`;
  if (!q.id) { problems.push(`${src} 缺 id`); return; }
  if (ids.has(q.id)) problems.push(`dup question id ${q.id} (${src} 与 ${ids.get(q.id)})`);
  ids.set(q.id, src);
  if (q.grammarId !== gid) problems.push(`${tag} grammarId 不一致: 期望 ${gid} 实际 ${q.grammarId}`);
  if (!q.explanation || !String(q.explanation).trim()) problems.push(`${tag} 缺 explanation`);

  if (ptype === 'fill') {
    if (!q.sentence || !String(q.sentence).includes('____'))
      problems.push(`${tag} 填空句子缺 '____' 占位符: "${q.sentence}"`);
    if (!Array.isArray(q.options) || q.options.length < 2)
      problems.push(`${tag} 填空选项不足 2 个`);
    else {
      const uniq = [...new Set(q.options)];
      if (uniq.length !== q.options.length) warnings.push(`${tag} 填空选项有重复: [${q.options.join(' | ')}]`);
      if (!q.options.includes(q.answer)) problems.push(`${tag} 答案不在选项中: answer="${q.answer}" options=[${q.options.join(' | ')}]`);
    }
    if (!q.answer || !String(q.answer).trim()) problems.push(`${tag} 填空缺 answer`);
  }

  if (ptype === 'choice') {
    if (!q.question || !String(q.question).trim()) problems.push(`${tag} 选择题缺 question`);
    if (!Array.isArray(q.options) || q.options.length < 2)
      problems.push(`${tag} 选择选项不足 2 个`);
    else {
      const uniq = [...new Set(q.options)];
      if (uniq.length !== q.options.length) warnings.push(`${tag} 选择选项有重复: [${q.options.join(' | ')}]`);
      if (!q.options.includes(q.answer)) problems.push(`${tag} 答案不在选项中: answer="${q.answer}" options=[${q.options.join(' | ')}]`);
    }
    if (!q.answer || !String(q.answer).trim()) problems.push(`${tag} 选择缺 answer`);
  }

  if (ptype === 'correction') {
    if (!q.sentence || !String(q.sentence).trim()) problems.push(`${tag} 改错题缺 sentence`);
    if (!q.answer || !String(q.answer).trim()) problems.push(`${tag} 改错题缺 answer`);
    if (q.sentence && q.answer && String(q.sentence).trim() === String(q.answer).trim())
      warnings.push(`${tag} 改错题 sentence==answer（可能无需改正/句子本就正确）`);
  }
}

let totalFill = 0, totalChoice = 0, totalCorr = 0;
for (let i = 1; i <= 20; i++) {
  const gid = 'G' + String(i).padStart(2, '0');
  const fill = grammar[`g${String(i).padStart(2, '0')}Fill`] as G[];
  const choice = grammar[`g${String(i).padStart(2, '0')}Choice`] as G[];
  const corr = grammar[`g${String(i).padStart(2, '0')}Correction`] as G[];
  if (!Array.isArray(fill) || fill.length === 0) { problems.push(`${gid}Fill 为空或缺失`); }
  else { totalFill += fill.length; fill.forEach(q => checkQuestion(q, gid, 'fill', `${gid}Fill`)); }
  if (!Array.isArray(choice) || choice.length === 0) { problems.push(`${gid}Choice 为空或缺失`); }
  else { totalChoice += choice.length; choice.forEach(q => checkQuestion(q, gid, 'choice', `${gid}Choice`)); }
  if (!Array.isArray(corr) || corr.length === 0) { problems.push(`${gid}Correction 为空或缺失`); }
  else { totalCorr += corr.length; corr.forEach(q => checkQuestion(q, gid, 'correction', `${gid}Correction`)); }
}

// ---------- 3. 输出 ----------
console.log('================ 语法模块校验报告 ================');
console.log(`GrammarPoint: ${gp?.length ?? 0}/20`);
console.log(`题目总数: Fill=${totalFill} Choice=${totalChoice} Correction=${totalCorr} (合计 ${totalFill + totalChoice + totalCorr})`);
console.log(`题目 id 全局唯一: ${ids.size} 个`);
console.log('------------------------------------------------');
if (problems.length === 0) console.log('✅ 硬 FAIL: 0');
else { console.log(`❌ 硬 FAIL: ${problems.length}`); problems.forEach(p => console.log('  [FAIL] ' + p)); }
console.log('------------------------------------------------');
if (warnings.length === 0) console.log('✅ 软告警: 0');
else { console.log(`⚠️ 软告警: ${warnings.length}`); warnings.slice(0, 60).forEach(w => console.log('  [WARN] ' + w)); if (warnings.length > 60) console.log(`  ... 其余 ${warnings.length - 60} 条省略`); }
console.log('================================================');

if (problems.length > 0) {
  console.log(`\n结论: 存在 ${problems.length} 处硬伤，需修复后再上线。`);
  process.exit(1);
} else {
  console.log('\n结论: ALL OK，语法模块数据完整、可上线。');
  process.exit(0);
}
