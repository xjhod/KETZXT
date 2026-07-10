// 校验听力 Part 2（note completion 填空）数据完整性
import { part2Sets } from './listening.ts';

let errors = 0;
let warnings = 0;
const err = (m: string) => { errors++; console.log('  ❌ ' + m); };
const warn = (m: string) => { warnings++; console.log('  ⚠️  ' + m); };

console.log('Part 2 套题数: ' + part2Sets.length);
if (part2Sets.length !== 10) warn('期望 10 套，实际 ' + part2Sets.length);

let totalQ = 0;
for (const s of part2Sets) {
  console.log('\n=== ' + s.id + ' (' + s.titleZh + ') | ' + s.difficulty + '/' + s.speed + ' | ' + s.speaker + ' ===');
  if (s.part !== 2) err(s.id + ' part != 2');
  if (!s.speaker) err(s.id + ' 缺 speaker');
  if (!s.monologueAudio) err(s.id + ' 缺 monologueAudio');
  if (!s.transcript) err(s.id + ' 缺 transcript');
  if (s.monologueAudio && s.transcript && s.monologueAudio !== s.transcript) warn(s.id + ' monologueAudio 与 transcript 不一致');
  if (!Array.isArray(s.blanks)) { err(s.id + ' 缺 blanks 数组'); continue; }
  if (s.blanks.length !== 5) warn(s.id + ' 空数=' + s.blanks.length + '（期望5）');
  totalQ += s.blanks.length;
  s.blanks.forEach((b, i) => {
    const tag = s.id + '-B' + (i + 1);
    if (!b.field) err(tag + ' 缺 field');
    if (!b.fieldZh) err(tag + ' 缺 fieldZh');
    if (!b.answer) err(tag + ' 缺 answer');
    else {
      const firstAns = b.answer.split(' / ')[0];
      if (s.monologueAudio.toLowerCase().indexOf(firstAns.toLowerCase()) < 0)
        warn(tag + ' answer 主写法不在独白: ' + firstAns);
    }
    if (!b.audioText) err(tag + ' 缺 audioText');
    if (!b.hint) err(tag + ' 缺 hint');
    if (b.choices) {
      if (!Array.isArray(b.choices)) err(tag + ' choices 非数组');
      else if (b.choices.some(c => !c || c.trim() === '')) err(tag + ' choices 有空项');
    }
  });
}
console.log('\n---- 统计 ----');
console.log('总空数: ' + totalQ + '（期望 ' + part2Sets.length * 5 + '）');
console.log('错误: ' + errors + ' | 警告: ' + warnings);
console.log(errors === 0 ? 'ALL OK' : 'HAS ISSUES');
