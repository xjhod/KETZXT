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
    if (enSet.has(w.en)) problems.push(`dup en ${w.en} in ${th.id}`);
    enSet.add(w.en);
  }
}

// 题一致性: answer 必须存在于全局词池; matching 选项须含 answer; fillBlank 须含 ____
for (const q of matchingQuestions as any[]) {
  if (!globalEn.has(q.answer)) problems.push(`matching ${q.id} answer '${q.answer}' not in any theme`);
  if (!Array.isArray(q.options) || !q.options.includes(q.answer)) problems.push(`matching ${q.id} answer not in options`);
}
for (const q of fillBlankQuestions as any[]) {
  if (!globalEn.has(q.answer)) problems.push(`fillBlank ${q.id} answer '${q.answer}' not in any theme`);
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
