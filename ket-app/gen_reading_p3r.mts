// 修复 Part3RC：
// 1) 前 10 组(p3r-001..010) answer 是字母 A/B/C/D，但 UI 判分用 `opt === q.answer`(文本比较)，
//    字母答案会导致永远判错 → 统一转成选项原文(文本)。
// 2) 前 10 组 50 题缺失 questionZh → 补中文。后 10 组已有 questionZh 且 answer 为文本，原样保留。
// 3) 边界替换 reading.ts 的 part3RCArticles 块。
import * as fs from 'fs';
import * as path from 'path';
import * as data from './src/data/reading.ts';

const arts = (data as any).part3RCArticles as any[];

// ===== 中文问句映射（仅前10组需要）=====
const ZH: Record<string, string> = {
  'q001-1': '作者什么时候去的伦敦？',
  'q001-2': '他们第二天看到了什么？',
  'q001-3': '他们住在哪里？',
  'q001-4': '他们吃了什么食物？',
  'q001-5': '作者明年的计划是什么？',
  'q002-1': '作者在哪里认识 Sarah 的？',
  'q002-2': 'Sarah 擅长什么？',
  'q002-3': '她们什么时候上钢琴课？',
  'q002-4': 'Sarah 想成为什么？',
  'q002-5': '作者和 Sarah 承诺了什么？',
  'q003-1': '我们每天应该吃多少水果和蔬菜？',
  'q003-2': '我们应该避免什么垃圾食品？',
  'q003-3': '我们每天应该做多少运动？',
  'q003-4': '孩子们每晚需要多少睡眠？',
  'q003-5': '这篇文章的主旨是什么？',
  'q004-1': '阅读帮助我们做什么？',
  'q004-2': '阅读能提高什么？',
  'q004-3': '什么是亲子共读？',
  'q004-4': '这篇文章的主旨是什么？',
  'q004-5': '根据文章，父母应该怎么做？',
  'q005-1': '这个项目的主题是什么？',
  'q005-2': '每组有多少人？',
  'q005-3': '他们的海报是关于什么的？',
  'q005-4': '他们得了什么成绩？',
  'q005-5': '作者学到了什么？',
  'q006-1': '文化包含什么？',
  'q006-2': '中国人春节吃什么？',
  'q006-3': '印度人庆祝什么节日？',
  'q006-4': '英国人圣诞节做什么？',
  'q006-5': '了解不同文化有什么好处？',
  'q007-1': '互联网如何改变了我们的生活？',
  'q007-2': '社交媒体帮助我们做什么？',
  'q007-3': '互联网的一个问题是什么？',
  'q007-4': '我们在互联网上不应该做什么？',
  'q007-5': '这篇文章的主旨是什么？',
  'q008-1': '作者怎么了？',
  'q008-2': '医生做了什么？',
  'q008-3': '医生说作者得了什么病？',
  'q008-4': '作者在家待了多久？',
  'q008-5': '三天后作者感觉如何？',
  'q009-1': '运动使什么更强壮？',
  'q009-2': '运动能减少什么？',
  'q009-3': '我们每天应该做多少运动？',
  'q009-4': '我们可以在哪里锻炼？',
  'q009-5': '这篇文章的主旨是什么？',
  'q010-1': '王伟上个月去了哪里？',
  'q010-2': '他们在那里待了多久？',
  'q010-3': '王伟的爸爸做了什么？',
  'q010-4': '他们在海南吃了什么？',
  'q010-5': '这封信的主要目的是什么？',
};

// 转义为双引号 JS 字符串字面量
function q(s: string): string {
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '') + '"';
}
// 模板字符串（多行原文）
function t(s: string): string {
  if (s.includes('`') || s.includes('${')) {
    // 退回双引号 JSON
    return q(s);
  }
  return '`' + s + '`';
}

const newArts = arts.map((a: any) => {
  const newQs = a.questions.map((qq: any) => {
    let answer = qq.answer;
    // 字母答案 → 选项文本
    if (typeof answer === 'string' && answer.length === 1 && /[A-H]/.test(answer)) {
      const idx = answer.charCodeAt(0) - 65;
      answer = qq.options[idx];
    }
    const questionZh = qq.questionZh && qq.questionZh.trim() ? qq.questionZh : (ZH[qq.id] || '');
    return {
      id: qq.id,
      question: qq.question,
      questionZh,
      options: qq.options,
      answer,
      explanation: qq.explanation,
    };
  });
  return { ...a, questions: newQs };
});

// ===== 断言 =====
let fail = 0;
const seen = new Set<string>();
for (const a of newArts) {
  for (const qq of a.questions) {
    if (seen.has(qq.id)) { console.log('FAIL dup id', qq.id); fail++; }
    seen.add(qq.id);
    if (!qq.questionZh || !qq.questionZh.trim()) { console.log('FAIL no questionZh', a.id, qq.id); fail++; }
    if (!qq.options || qq.options.length !== 4) { console.log('FAIL options!=4', a.id, qq.id); fail++; }
    if (!qq.options.includes(qq.answer)) { console.log('FAIL answer not in options', a.id, qq.id, qq.answer); fail++; }
    if (!qq.explanation || !qq.explanation.trim()) { console.log('SOFT no explanation', a.id, qq.id); }
  }
}
if (fail > 0) { console.log(`ABORT: ${fail} hard fails`); process.exit(1); }

// ===== 序列化 =====
let out = 'export const part3RCArticles: Part3RCArticle[] = [\n';
for (const a of newArts) {
  out += '  {\n';
  out += `    id: ${q(a.id)},\n`;
  out += `    title: ${q(a.title)},\n`;
  out += `    titleZh: ${q(a.titleZh)},\n`;
  out += `    article: ${t(a.article)},\n`;
  out += `    articleZh: ${t(a.articleZh)},\n`;
  out += '    questions: [\n';
  for (const qq of a.questions) {
    out += '      {\n';
    out += `        id: ${q(qq.id)},\n`;
    out += `        question: ${q(qq.question)},\n`;
    out += `        questionZh: ${q(qq.questionZh)},\n`;
    out += `        options: [${qq.options.map((o: string) => q(o)).join(', ')}],\n`;
    out += `        answer: ${q(qq.answer)},\n`;
    out += `        explanation: ${q(qq.explanation)},\n`;
    out += '      },\n';
  }
  out += '    ],\n';
  out += `    difficulty: ${q(a.difficulty)},\n`;
  out += `    topic: ${q(a.topic)},\n`;
  out += '  },\n';
}
out += '];\n';

// ===== 边界替换 =====
const file = path.resolve('src/data/reading.ts');
const content = fs.readFileSync(file, 'utf-8');
const startIdx = content.indexOf('export const part3RCArticles');
const endIdx = content.indexOf('export const part4TFArticles');
if (startIdx < 0 || endIdx < 0) { console.log('ABORT: boundary not found'); process.exit(1); }
const newContent = content.slice(0, startIdx) + out + '\n' + content.slice(endIdx);
fs.writeFileSync(file, newContent, 'utf-8');
console.log(`OK: 写入 ${newArts.length} 组 / ${newArts.reduce((s: number, a: any) => s + a.questions.length, 0)} 题，answer 统一为文本，questionZh 已补齐。`);
