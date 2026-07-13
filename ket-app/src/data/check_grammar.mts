import * as G from '../data/grammar';

const all = G as Record<string, unknown>;
const names = Object.keys(all);

const fillNames = names.filter((n) => n.endsWith('Fill'));
const choiceNames = names.filter((n) => n.endsWith('Choice'));
const corrNames = names.filter((n) => n.endsWith('Correction'));

interface Issue {
  id: string;
  kind: string;
  detail: string;
}

const issues: Issue[] = [];
const lines: string[] = [];

function norm(s: string): string {
  return String(s).trim().replace(/\s+/g, ' ').replace(/[.;,!?]+$/, '').toLowerCase();
}

// ---- Fill ----
let fillCount = 0;
for (const name of fillNames) {
  const arr = all[name] as Array<{
    id: string; grammarId: string; sentence: string; options: string[]; answer: string; explanation?: string;
  }>;
  if (!Array.isArray(arr)) continue;
  for (const q of arr) {
    fillCount++;
    const optIdx = q.options.map(norm).indexOf(norm(q.answer));
    lines.push(`[FILL] ${q.id} (${q.grammarId})`);
    lines.push(`  sentence: ${q.sentence}`);
    lines.push(`  options : ${JSON.stringify(q.options)}`);
    lines.push(`  answer  : ${q.answer}${optIdx < 0 ? '  *** NOT IN OPTIONS ***' : ` (opt#${optIdx})`}`);
    if (q.explanation) lines.push(`  why    : ${q.explanation}`);
    lines.push('');
    if (optIdx < 0) {
      issues.push({ id: q.id, kind: 'Fill.answer-not-in-options', detail: q.answer });
    }
  }
}

// ---- Choice ----
let choiceCount = 0;
for (const name of choiceNames) {
  const arr = all[name] as Array<{
    id: string; grammarId: string; question: string; options: string[]; answer: string; explanation?: string;
  }>;
  if (!Array.isArray(arr)) continue;
  for (const q of arr) {
    choiceCount++;
    const optIdx = q.options.map(norm).indexOf(norm(q.answer));
    lines.push(`[CHOICE] ${q.id} (${q.grammarId})`);
    lines.push(`  Q: ${q.question}`);
    lines.push(`  options : ${JSON.stringify(q.options)}`);
    lines.push(`  answer  : ${q.answer}${optIdx < 0 ? '  *** NOT IN OPTIONS ***' : ` (opt#${optIdx})`}`);
    if (q.explanation) lines.push(`  why    : ${q.explanation}`);
    lines.push('');
    if (optIdx < 0) {
      issues.push({ id: q.id, kind: 'Choice.answer-not-in-options', detail: q.answer });
    }
  }
}

// ---- Correction ----
let corrCount = 0;
for (const name of corrNames) {
  const arr = all[name] as Array<{
    id: string; grammarId: string; sentence: string; answer: string; explanation?: string;
  }>;
  if (!Array.isArray(arr)) continue;
  for (const q of arr) {
    corrCount++;
    const same = norm(q.sentence) === norm(q.answer);
    lines.push(`[CORR] ${q.id} (${q.grammarId})`);
    lines.push(`  wrong : ${q.sentence}`);
    lines.push(`  fixed : ${q.answer}${same ? '  *** SAME AS SENTENCE ***' : ''}`);
    if (q.explanation) lines.push(`  why   : ${q.explanation}`);
    lines.push('');
    if (!q.answer || !q.answer.trim()) {
      issues.push({ id: q.id, kind: 'Correction.empty-answer', detail: '' });
    } else if (same) {
      issues.push({ id: q.id, kind: 'Correction.answer==sentence', detail: q.answer });
    }
  }
}

// ---- 输出 ----
const fs = await import('node:fs');
fs.writeFileSync('grammar_dump.txt', lines.join('\n'), 'utf8');

console.log('=== 题目统计 ===');
console.log(`Fill: ${fillCount}, Choice: ${choiceCount}, Correction: ${corrCount}, 总计: ${fillCount + choiceCount + corrCount}`);
console.log('');
console.log('=== 结构性错误（answer 不在选项 / 空 / 与原句相同）===');
if (issues.length === 0) {
  console.log('  （无结构性错误）');
} else {
  for (const i of issues) {
    console.log(`  [${i.kind}] ${i.id} -> ${i.detail}`);
  }
}
console.log('');
console.log('全部题目已写入 grammar_dump.txt');
