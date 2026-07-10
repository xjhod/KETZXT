import * as data from './src/data/reading.ts';

type Blank = {
  id: string;
  position: number;
  answer: string;
  hint: string;
  hintZh: string;
  accept?: string[];
};
type Article = {
  id: string;
  title: string;
  titleZh: string;
  passage: string;
  passageFull: string;
  blanks: Blank[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
};

const articles = data.part5Articles as Article[];
const REQUIRED_GAPS = 10;

let hardFail = 0;
let softWarn = 0;
const fails: string[] = [];
const warns: string[] = [];

const seenBlankIds = new Set<string>();
const seenArticleIds = new Set<string>();
const diffCount = { easy: 0, medium: 0, hard: 0 } as Record<string, number>;
const gapsPerGroup: number[] = [];

function placeholders(passage: string): number[] {
  const re = /\((\d+)\)\s*____/g;
  const out: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(passage)) !== null) out.push(Number(m[1]));
  return out;
}

articles.forEach((a) => {
  if (seenArticleIds.has(a.id)) { fails.push(`重复 article id: ${a.id}`); hardFail++; }
  seenArticleIds.add(a.id);

  diffCount[a.difficulty] = (diffCount[a.difficulty] || 0) + 1;
  gapsPerGroup.push(a.blanks.length);

  // KET 标准：每篇 10 空
  if (a.blanks.length !== REQUIRED_GAPS) {
    fails.push(`${a.id}: 空数 ${a.blanks.length} != KET标准 ${REQUIRED_GAPS}`); hardFail++;
  }

  const ph = placeholders(a.passage);
  if (ph.length !== a.blanks.length) {
    fails.push(`${a.id}: passage 占位符数 ${ph.length} != blanks ${a.blanks.length}`); hardFail++;
  }
  const positions = a.blanks.map(b => b.position).sort((x, y) => x - y);
  const expected = Array.from({ length: a.blanks.length }, (_, i) => i + 1);
  if (JSON.stringify(positions) !== JSON.stringify(expected)) {
    fails.push(`${a.id}: positions 不连续 [${positions.join(',')}]`); hardFail++;
  }
  if (JSON.stringify(ph) !== JSON.stringify(positions)) {
    fails.push(`${a.id}: 占位符数字 [${ph.join(',')}] != positions [${positions.join(',')}]`); hardFail++;
  }

  a.blanks.forEach((b) => {
    const bid = a.id + '-b' + b.position;
    if (seenBlankIds.has(bid)) { fails.push(`重复 blank id: ${bid}`); hardFail++; }
    seenBlankIds.add(bid);
    if (!b.answer || !b.answer.trim()) { fails.push(`${bid}: answer 为空`); hardFail++; }
    if (!b.hint || !b.hint.trim()) { fails.push(`${bid}: hint 为空`); softWarn++; }
    if (!/[一-鿿]/.test(b.hintZh)) { fails.push(`${bid}: hintZh 缺中文`); hardFail++; }
    if (b.position < 1) { fails.push(`${bid}: position 非法`); hardFail++; }
  });

  if (/\((\d+)\)\s*____/.test(a.passageFull)) {
    warns.push(`${a.id}: passageFull 仍含占位符`); softWarn++;
  }
});

console.log(`=== Part 5 (KET 标准 10空) 校验 ===`);
console.log(`组数: ${articles.length}`);
console.log(`总空数: ${articles.reduce((s, a) => s + a.blanks.length, 0)}`);
console.log(`每篇空数: 全部 ${REQUIRED_GAPS} (KET 标准)`);
console.log(`难度分布: ${JSON.stringify(diffCount)}`);
console.log(`硬 FAIL: ${hardFail}`);
console.log(`软告警: ${softWarn}`);
if (fails.length) { console.log('\n--- 硬 FAIL 明细 ---'); fails.forEach(f => console.log('  ✗ ' + f)); }
if (warns.length) { console.log('\n--- 软告警明细 ---'); warns.slice(0, 20).forEach(w => console.log('  ⚠ ' + w)); }

if (hardFail === 0) {
  console.log('\nALL OK: 20组×10空, KET标准结构, 中文齐全, 难度含hard');
} else {
  console.log('\nNOT OK');
}
