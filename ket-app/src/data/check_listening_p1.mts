// 校验听力 Part 1（看图选择 / KET picture choice）数据完整性
// 用法：node --experimental-strip-types check_listening_p1.mts
import { part1Sets } from './listening.ts';

let errors = 0;
let warnings = 0;
const err = (m: string) => { console.log('  [ERROR] ' + m); errors++; };
const warn = (m: string) => { console.log('  [WARN]  ' + m); warnings++; };

console.log(`=== 听力 Part 1 校验（看图选择）：共 ${part1Sets.length} 套 ===\n`);

const norm = (s: string) => (s || '').toLowerCase().replace(/\s+/g, ' ').replace(/[.,!?'"]/g, '').trim();
const letters = ['A', 'B', 'C'];

for (const set of part1Sets) {
  const tag = set.id || '(no-id)';
  console.log(`--- ${tag} (${set.titleZh || set.title || '?'}) ---`);

  if (!set.title) warn(`${tag}: 缺 title`);
  if (!set.titleZh) warn(`${tag}: 缺 titleZh`);
  if (!Array.isArray(set.questions) || set.questions.length === 0) { err(`${tag}: 无 questions`); continue; }
  if (set.questions.length !== 5) warn(`${tag}: questions 数量=${set.questions.length}（KET 标准 5）`);

  const emojiSeen = new Set<string>();
  const ansLetters: string[] = [];
  set.questions.forEach((q: any, i: number) => {
    const qt = `${tag}-Q${i + 1}`;
    if (!q.id) warn(`${qt}: 缺 id`);
    if (!q.imageEmoji) warn(`${qt}: 缺 imageEmoji`);
    else if (emojiSeen.has(q.imageEmoji)) warn(`${qt}: imageEmoji 重复 ${q.imageEmoji}`);
    else emojiSeen.add(q.imageEmoji);
    if (!q.imageDesc) warn(`${qt}: 缺 imageDesc`);
    if (!q.audioText || !q.audioText.trim()) warn(`${qt}: 缺 audioText`);
    if (!q.transcript || !q.transcript.trim()) warn(`${qt}: 缺 transcript`);

    if (!Array.isArray(q.options) || q.options.length === 0) { err(`${qt}: 无 options`); return; }
    if (q.options.length !== 3) warn(`${qt}: options 数量=${q.options.length}（KET 标准 3）`);
    // 选项去重
    const optNorm = q.options.map((o: string) => norm(o));
    if (new Set(optNorm).size !== optNorm.length) warn(`${qt}: options 有重复文本`);

    if (!q.answer || !letters.includes(q.answer)) { err(`${qt}: answer 非法「${q.answer}」`); return; }
    const idx = letters.indexOf(q.answer);
    if (idx >= q.options.length) { err(`${qt}: answer=${q.answer} 超出 options 范围`); return; }
    ansLetters.push(q.answer);
    const correct = norm(q.options[idx]);
    const t = norm(q.transcript || '');
    // KET Part 1：选项是图片描述，transcript 是所听对话，二者本就释义对应（非逐字一致）。
    // 仅当答案选项与 transcript 毫无关键词重合时才视为「答案字母可能错配」硬报错。
    const stop = new Set(['the', 'a', 'an', 'is', 'are', 'am', 'my', 'we', 'i', 'you', 'he', 'she', 'it', 'they', 'to', 'in', 'on', 'at', 'of', 'and', 'with', 'very', 'has', 'have', 'for', 'our', 'your', 'his', 'her', 'their', 'me', 'this', 'that', 'these', 'those', 'listen']);
    const sigWords = (s: string) => norm(s).split(' ').filter((w) => w.length >= 2 && !stop.has(w));
    const tWords = new Set(t.split(' '));
    const overlap = sigWords(correct).filter((w) => tWords.has(w));
    if (sigWords(correct).length > 0 && overlap.length === 0) {
      err(`${qt}: 答案选项「${q.options[idx]}」与 transcript 无任何关键词重合（疑似答案字母错配）`);
    }
  });

  // 答案分布（KET 各题独立，不应全同）
  const dist = ansLetters.reduce((acc: Record<string, number>, l) => { acc[l] = (acc[l] || 0) + 1; return acc; }, {});
  if (ansLetters.length === 5 && Object.keys(dist).length === 1) {
    warn(`${tag}: 5 题答案全为 ${ansLetters[0]}（建议分布 A/B/C）`);
  }
}

console.log(`\n=== 结果：errors=${errors}, warnings=${warnings} ===`);
if (errors === 0) console.log('✅ 数据完整性 ALL OK（结构已是 KET Part 1 看图选择）');
else console.log('❌ 存在数据错误，需修复');
