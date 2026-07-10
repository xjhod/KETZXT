import * as data from './src/data/reading.ts';

const arts = (data as any).part4TFArticles as any[];
function hasCJK(s: string): boolean { return /[一-鿿]/.test(s); }

let hardFail = 0, soft = 0;
let noZh = 0, zhSameAsEn = 0, noCJK = 0, noDNGroup = 0;
const ansCount: Record<string, number> = {};
const qPerGroup: Record<number, number> = {};
const diffCount: Record<string, number> = {};

for (const a of arts) {
  diffCount[a.difficulty] = (diffCount[a.difficulty] || 0) + 1;
  const sts = a.statements || [];
  qPerGroup[sts.length] = (qPerGroup[sts.length] || 0) + 1;
  const dn = sts.filter((s: any) => s.answer === 'DN').length;
  if (dn !== 2) { noDNGroup++; hardFail++; console.log(`FAIL ${a.id} DN数=${dn}(应2)`); }
  const seen = new Set<string>();
  for (const s of sts) {
    ansCount[s.answer] = (ansCount[s.answer] || 0) + 1;
    if (!['T', 'F', 'DN'].includes(s.answer)) { hardFail++; console.log(`FAIL bad ans ${s.answer} ${a.id}/${s.id}`); }
    if (!s.statementZh || !s.statementZh.trim()) { noZh++; hardFail++; console.log(`FAIL no zh ${a.id}/${s.id}`); }
    else {
      if (!hasCJK(s.statementZh)) { noCJK++; soft++; }
      if (s.statementZh.trim() === s.statement.trim()) { zhSameAsEn++; soft++; }
    }
    if (!s.explanation || !s.explanation.trim()) { soft++; }
    if (seen.has(s.id)) { hardFail++; console.log(`FAIL dup id ${s.id}`); }
    seen.add(s.id);
  }
  if (!a.article || !a.article.trim()) soft++;
  if (!a.articleZh || !a.articleZh.trim()) soft++;
}

console.log('========================================');
console.log(`Part4 组数=${arts.length}, 陈述总数=${Object.values(ansCount).reduce((a, b) => a + b, 0)}`);
console.log(`每题数分布=`, qPerGroup);
console.log(`难度分布=`, diffCount);
console.log(`答案分布 T/F/DN=`, ansCount);
console.log(`statementZh 缺失=${noZh}, 无中文字符=${noCJK}, 与英文相同=${zhSameAsEn}`);
console.log(`硬 FAIL=${hardFail}, 软告警=${soft}`);
console.log(hardFail === 0 ? 'ALL OK: 每篇2道DN, statementZh 全中文, 无重复id, 答案三态合法' : 'HAS HARD FAIL');
