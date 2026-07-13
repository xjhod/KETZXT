// 结构性校验：加载 reading.ts 全部 6 类题型，检查答案硬错误
import * as R from './reading';
const { part1Articles, part2Articles, part3ClozeArticles, part3RCArticles, part4TFArticles, part5Articles } = R;

type P = string[];
const problems: P = [];

// ===== Part 1: 看图配对 =====
let p1q = 0;
for (const a of part1Articles) {
  const set = new Set(a.sentences.map((s) => s.trim()));
  for (const q of a.questions) {
    p1q++;
    if (!set.has(q.answer.trim())) {
      problems.push(`[P1 ${q.id}] answer "${q.answer}" 不在 sentences 内`);
    }
  }
}

// ===== Part 2: 信息匹配 =====
let p2n = 0;
for (const a of part2Articles) {
  p2n += a.answers.length;
  if (a.answers.length !== a.people.length) {
    problems.push(`[P2 ${a.id}] answers.length ${a.answers.length} != people ${a.people.length}`);
  }
  for (const idx of a.answers) {
    if (idx < 0 || idx >= a.texts.length) {
      problems.push(`[P2 ${a.id}] answer idx ${idx} 越界 [0,${a.texts.length})`);
    }
  }
  // 重复提示（不一定是错，但值得看）
  const seen = new Set<number>();
  for (const idx of a.answers) {
    if (seen.has(idx)) problems.push(`[P2 ${a.id}] 答案重复指向 text#${idx}`);
    seen.add(idx);
  }
}

// ===== Part 3 完形填空 =====
let p3cn = 0;
for (const a of part3ClozeArticles) {
  for (const b of a.blanks) {
    p3cn++;
    if (!b.options.includes(b.answer)) {
      problems.push(`[P3C ${b.id}] answer "${b.answer}" 不在 options: ${JSON.stringify(b.options)}`);
    }
    // passageFull 应含该答案（至少一个空填对）
    if (!a.passageFull.includes(b.answer)) {
      problems.push(`[P3C ${b.id}] passageFull 未包含答案 "${b.answer}"`);
    }
  }
  // passageFull 与 blanks 数量大致对应（passage 里 ____ 数）
  const blankCount = (a.passage.match(/____/g) || []).length;
  if (blankCount !== a.blanks.length) {
    problems.push(`[P3C ${a.id}] passage 中 ____ 数 ${blankCount} != blanks ${a.blanks.length}`);
  }
}

// ===== Part 3 阅读理解选择 =====
let p3rn = 0;
for (const a of part3RCArticles) {
  for (const q of a.questions) {
    p3rn++;
    if (!q.options.includes(q.answer)) {
      problems.push(`[P3R ${q.id}] answer "${q.answer}" 不在 options: ${JSON.stringify(q.options)}`);
    }
  }
}

// ===== Part 4 正误判断 =====
let p4n = 0;
for (const a of part4TFArticles) {
  for (const s of a.statements) {
    p4n++;
    if (!['T', 'F', 'DN'].includes(s.answer)) {
      problems.push(`[P4 ${s.id}] answer "${s.answer}" 非法（须 T/F/DN）`);
    }
  }
}

// ===== Part 5 单词填写 =====
let p5n = 0;
for (const a of part5Articles) {
  for (const b of a.blanks) {
    p5n++;
    if (!b.answer || !b.answer.trim()) {
      problems.push(`[P5 ${b.id}] 空答案`);
    } else if (!a.passageFull.includes(b.answer.trim())) {
      problems.push(`[P5 ${b.id}] passageFull 未包含答案 "${b.answer}"`);
    }
  }
  const blankCount = (a.passage.match(/____/g) || []).length;
  if (blankCount !== a.blanks.length) {
    problems.push(`[P5 ${a.id}] passage 中 ____ 数 ${blankCount} != blanks ${a.blanks.length}`);
  }
}

console.log('=== 题量统计 ===');
console.log(`P1 配对题: ${p1q} (文章 ${part1Articles.length})`);
console.log(`P2 匹配项: ${p2n} (文章 ${part2Articles.length})`);
console.log(`P3 完形空: ${p3cn} (文章 ${part3ClozeArticles.length})`);
console.log(`P3 阅读选择: ${p3rn} (文章 ${part3RCArticles.length})`);
console.log(`P4 判断句: ${p4n} (文章 ${part4TFArticles.length})`);
console.log(`P5 单词空: ${p5n} (文章 ${part5Articles.length})`);
console.log(`总计: ${p1q + p2n + p3cn + p3rn + p4n + p5n}`);
console.log('=== 结构问题 ===');
if (problems.length === 0) {
  console.log('ALL STRUCTURAL OK');
} else {
  console.log(`共 ${problems.length} 处:`);
  console.log(problems.join('\n'));
}
