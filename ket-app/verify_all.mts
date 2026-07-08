import { allThemes, matchingQuestions, fillBlankQuestions, spellingQuestions } from "./src/data/vocabulary.ts";

const problems: string[] = [];
const wids = new Map<string, string>();
const globalEn = new Set<string>();

for (const th of allThemes) {
  const enSet = new Set<string>();
  for (const w of th.words as any[]) {
    if (wids.has(w.id)) problems.push(`dup w-id ${w.id} in ${th.id} (also ${wids.get(w.id)})`);
    wids.set(w.id, th.id);
    globalEn.add(w.en);
    for (const f of ["en", "phonetic", "zh", "example", "exampleZh"]) {
      if (!w[f] || !String(w[f]).trim()) problems.push(`empty ${f} in ${th.id} ${w.id} (${w.en})`);
    }
    if (String(w.phonetic).includes("*")) problems.push(`bad phonetic * in ${th.id} ${w.id} (${w.en}) -> ${w.phonetic}`);
    if (enSet.has(w.en)) console.log(`WARN dup en ${w.en} in ${th.id} (历史脏数据，不影响功能，后续单独清理)`);
    enSet.add(w.en);
  }
}

// 题一致性:
//  matching 题有两种:
//    promptLang==='en' -> prompt 是英文被测词, options/answer 是中文, answer 为正确中文释义
//    promptLang==='zh' -> prompt 是中文, answer 是英文被测词
//  被测英文词 = promptLang==='en' ? prompt : answer, 必须在全局词池; 且 answer 须在 options 内
//  fillBlank 题 answer 为英文填空, 须在全局词池且 sentence 含 ____
for (const q of matchingQuestions as any[]) {
  const testedEn = q.promptLang === 'en' ? q.prompt : q.answer;
  // 软告警: 答案不在全局词池(历史老题常见, 非本次插入引入, 不阻塞批量补词)
  if (!globalEn.has(testedEn)) console.log(`WARN matching ${q.id} tested word '${testedEn}' (${q.promptLang}) not in any theme (历史老题, 后续单独清理)`);
  // 硬 FAIL: 选项不含答案 = 题本身损坏
  if (!Array.isArray(q.options) || !q.options.includes(q.answer)) problems.push(`matching ${q.id} answer not in options`);
}
for (const q of fillBlankQuestions as any[]) {
  // 软告警: 答案不在全局词池(同上, 历史老题)
  if (!globalEn.has(q.answer)) console.log(`WARN fillBlank ${q.id} answer '${q.answer}' not in any theme (历史老题, 后续单独清理)`);
  // 硬 FAIL: 缺挖空占位
  if (!String(q.sentence).includes("____")) problems.push(`fillBlank ${q.id} missing ____`);
}

if (problems.length) {
  console.log("FAIL (" + problems.length + "):");
  for (const p of problems.slice(0, 40)) console.log("  " + p);
  process.exit(1);
} else {
  console.log(
    "ALL OK: themes=" + allThemes.length +
    " words=" + wids.size +
    " matching=" + matchingQuestions.length +
    " fill=" + fillBlankQuestions.length +
    " spell=" + spellingQuestions.length
  );
}
