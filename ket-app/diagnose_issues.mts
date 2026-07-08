import { allThemes, matchingQuestions, fillBlankQuestions } from "./src/data/vocabulary.ts";
import { writeFileSync } from "node:fs";

const globalEn = new Set<string>();
for (const th of allThemes) for (const w of th.words as any[]) globalEn.add(w.en);

// ---- dup-en ----
const dupEn: any[] = [];
for (const th of allThemes) {
  const seen = new Map<string, any[]>();
  for (const w of th.words as any[]) {
    if (!seen.has(w.en)) seen.set(w.en, []);
    seen.get(w.en).push(w);
  }
  for (const [en, arr] of seen) {
    if (arr.length > 1) {
      dupEn.push({ theme: th.id, en, count: arr.length, words: arr.map((w: any) => ({ id: w.id, en: w.en, phonetic: w.phonetic, zh: w.zh })) });
    }
  }
}

// ---- answer-not-in-pool ----
const missPool: any[] = [];
for (const q of matchingQuestions as any[]) {
  const testedEn = q.promptLang === "en" ? q.prompt : q.answer;
  if (!globalEn.has(testedEn)) {
    missPool.push({ type: "matching", id: q.id, themeId: q.themeId, promptLang: q.promptLang, testedEn, prompt: q.prompt, options: q.options, answer: q.answer });
  }
}
for (const q of fillBlankQuestions as any[]) {
  if (!globalEn.has(q.answer)) {
    missPool.push({ type: "fillBlank", id: q.id, themeId: q.themeId, testedEn: q.answer, answer: q.answer, sentence: q.sentence });
  }
}

const out = {
  dupEnCount: dupEn.length,
  dupEnThemes: dupEn.reduce((m: any, d: any) => { m[d.theme] = (m[d.theme] || 0) + 1; return m; }, {}),
  dupEn,
  missPoolCount: missPool.length,
  missPoolByType: missPool.reduce((m: any, d: any) => { m[d.type] = (m[d.type] || 0) + 1; return m; }, {}),
  missPoolThemes: missPool.reduce((m: any, d: any) => { m[d.themeId] = (m[d.themeId] || 0) + 1; return m; }, {}),
  missPool,
};
writeFileSync("diagnose_issues.json", JSON.stringify(out, null, 2));
console.log("dupEn entries(per en-group):", dupEn.length, "| total extra dup words:", dupEn.reduce((s: number, d: any) => s + d.count - 1, 0));
console.log("missPool:", missPool.length, "byType:", out.missPoolByType);
console.log("WROTE diagnose_issues.json");
