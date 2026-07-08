#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""一次性初始化 gen_theme_words.py 的配套数据文件。"""
import re, json, shutil, os

KET = r"C:\Users\Rywl0\WorkBuddy\2026-06-03-10-50-15\ket-app"
SCR = os.path.join(KET, "scripts")
os.makedirs(SCR, exist_ok=True)

# 1) 复制 diff 源（来自 Temp）
src = r"C:\Users\Rywl0\AppData\Local\Temp\ket_vocab_diff.json"
dst = os.path.join(SCR, "vocab_diff.json")
shutil.copy(src, dst)
print("copied vocab_diff.json")

txt = open(os.path.join(KET, "src", "data", "vocabulary.ts"), encoding="utf-8").read()

# 2) harvest 全库 Word -> 复用字典（音标/例句/中译）
word_re = re.compile(
    r"id: '(w\d+)', en: '([^']*)', phonetic: '([^']*)', zh: '([^']*)', "
    r"example: '([^']*)', exampleZh: '([^']*)'"
)
ref = {}
for m in word_re.finditer(txt):
    en = m.group(2)
    ref[en] = {
        "phonetic": m.group(3),
        "zh": m.group(4),
        "example": m.group(5),
        "exampleZh": m.group(6),
    }
json.dump(ref, open(os.path.join(SCR, "ipa_reference.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("harvested ipa_reference.json:", len(ref), "words")

# 3) T09 新词(>=2787) 已核校音标 -> 修正字典种子
t09 = re.search(r"id: 'T09'.*?words: \[(.*?)\n  \],", txt, re.S)
body = t09.group(1)
seen = set()
corr = {}
for m in word_re.finditer(body):
    wid, en, ph = m.group(1), m.group(2), m.group(3)
    if int(wid[1:]) >= 2787 and en not in seen:
        seen.add(en)
        corr[en] = ph
json.dump(corr, open(os.path.join(SCR, "ipa_corrections.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("seeded ipa_corrections.json:", len(corr), "words (from T09)")

# 4) 空覆盖文件
open(os.path.join(SCR, "word_overrides.json"), "w", encoding="utf-8").write("{}\n")
print("created empty word_overrides.json")
