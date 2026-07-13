import * as G from '../data/grammar';
import * as R from '../data/grammarRoadmap';

const points = G.allGrammarPoints as Array<{
  id: string; name: string; nameZh: string;
  explanation: string; examples: { en: string; zh: string }[];
}>;

interface Issue { id: string; kind: string; detail: string; }
const issues: Issue[] = [];

// ---- 1. 讲解 / 例句 结构校验 ----
for (const p of points) {
  if (!p.id || !p.name || !p.nameZh)
    issues.push({ id: p.id, kind: 'meta-missing', detail: JSON.stringify({ name: p.name, nameZh: p.nameZh }) });
  if (!p.explanation || p.explanation.trim().length < 10)
    issues.push({ id: p.id, kind: 'explanation-empty', detail: '' });
  if (!Array.isArray(p.examples) || p.examples.length === 0)
    issues.push({ id: p.id, kind: 'examples-empty', detail: '' });
  else
    for (const ex of p.examples)
      if (!ex.en || !ex.zh) issues.push({ id: p.id, kind: 'example-missing-en/zh', detail: JSON.stringify(ex) });
}

// ---- 2. 聚合题数一致性 ----
const GRAMMAR_QUESTIONS = R.GRAMMAR_QUESTIONS as Record<string, { fill: any[]; choice: any[]; correction: any[] }>;
const GNS = G as Record<string, any>;
let aggTotal = 0;
for (const id of Object.keys(GRAMMAR_QUESTIONS)) {
  const pq = GRAMMAR_QUESTIONS[id];
  const f = (GNS[id.toLowerCase() + 'Fill'] || []) as any[];
  const c = (GNS[id.toLowerCase() + 'Choice'] || []) as any[];
  const x = (GNS[id.toLowerCase() + 'Correction'] || []) as any[];
  const agg = pq.fill.length + pq.choice.length + pq.correction.length;
  const raw = f.length + c.length + x.length;
  aggTotal += agg;
  if (agg !== raw) issues.push({ id, kind: 'agg-mismatch', detail: `GRAMMAR_QUESTIONS=${agg} raw=${raw}` });
  for (const q of [...pq.fill, ...pq.choice, ...pq.correction])
    if (q.grammarId !== id) issues.push({ id, kind: 'grammarId-mismatch', detail: `${q.id} -> ${q.grammarId}` });
}

// ---- 3. ROADMAP 顺序校验 ----
const ROADMAP = R.ROADMAP as string[];
if (ROADMAP.length !== 20) issues.push({ id: 'ROADMAP', kind: 'roadmap-length', detail: String(ROADMAP.length) });
for (const id of points.map((p) => p.id))
  if (!ROADMAP.includes(id)) issues.push({ id, kind: 'roadmap-missing-point', detail: '' });

// ---- 4. 提取讲解+例句+对比提示 到 JSON（供语义审查）----
const fs = await import('node:fs');
const dump = points.map((p) => ({ id: p.id, name: p.name, nameZh: p.nameZh, explanation: p.explanation, examples: p.examples }));
fs.writeFileSync(new URL('./daily_grammar_points.json', import.meta.url), JSON.stringify(dump, null, 2), 'utf8');
const hints = R.CONTRAST_HINTS as Record<string, string>;
fs.writeFileSync(new URL('./daily_contrast_hints.json', import.meta.url), JSON.stringify({ pairs: R.CONFUSABLE_PAIRS, hints }, null, 2), 'utf8');

console.log('=== 每日打卡语法 - 结构校验 ===');
console.log(`语法点(讲解/例句): ${points.length}`);
console.log(`GRAMMAR_QUESTIONS 聚合题数: ${aggTotal}`);
console.log(`ROADMAP 顺序点: ${ROADMAP.length}`);
console.log('');
console.log('=== 结构性错误 ===');
if (issues.length === 0) console.log('  ALL STRUCTURAL OK');
else for (const i of issues) console.log(`  [${i.kind}] ${i.id} -> ${i.detail}`);
console.log('');
console.log('已提取 -> daily_grammar_points.json, daily_contrast_hints.json');
