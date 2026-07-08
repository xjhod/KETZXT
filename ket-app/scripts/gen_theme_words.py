#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
通用补词工具：读任意 Txx 的 diff -> 自动补词 + matching/fillBlank 题。
用法:
  python gen_theme_words.py T11            # 实跑，写入 vocabulary.ts
  python gen_theme_words.py T11 --dry-run  # 只打印计划，不写文件
依赖: eng-to-ipa (venv) 可选；缺失时音标留空并标记 caution。
幂等: 按英文词(en)过滤主题内已存在词，重跑不会重复补。
"""
import re, json, sys, os, random

KET = r"C:\Users\Rywl0\WorkBuddy\2026-06-03-10-50-15\ket-app"
SCR = os.path.join(KET, "scripts")
VTS = os.path.join(KET, "src", "data", "vocabulary.ts")

def load_json(name):
    return json.load(open(os.path.join(SCR, name), encoding="utf-8"))

# ----------------- 音标生成 -----------------
try:
    from eng_to_ipa import convert as _ipa
    HAVE_IPA = True
except Exception:
    HAVE_IPA = False

try:
    from g2p_en import G2p
    _g2p = G2p()
    HAVE_G2P = True
except Exception:
    HAVE_G2P = False

def fix_lig(s):
    return s.replace("\ufb01", "fi").replace("\ufb02", "fl")

def q(s):
    """转义 TS 单引号字符串里的单引号/反斜杠"""
    return str(s).replace("\\", "\\\\").replace("'", "\\'")

POS_TAGS = {"n", "v", "adj", "adv", "sb", "sth", "prep", "conj", "pron", "int", "phr", "pl", "num"}

def clean_entry(en):
    """清洗 PDF 提取脏数据; 返回干净 en 或 None(垃圾)"""
    en = fix_lig(en).strip()
    en = re.sub(r"[（(][^）)]*[）)]", "", en).strip()      # 完整括号
    en = re.sub(r"[（(][^）)]*$", "", en).strip()            # 残留左括号
    en = re.sub(r"\s+(v\.|n\.|adj\.|adv\.|sb\.|sth\.|prep\.|conj\.|pron\.|int\.|phr\.|pl\.|num\.)$", "", en, flags=re.I).strip()
    en = en.replace("*", "").replace("  ", " ").strip()
    if not en:
        return None
    e = en.lower().rstrip(".")
    if e in POS_TAGS:
        return None
    return en

def gen_ipa(en):
    """返回 (phonetic, source) 。source: corrected/generated/broken/empty"""
    corr = load_json("ipa_corrections.json")
    if en in corr:
        return "/" + corr[en] + "/", "corrected"
    ph = None
    if HAVE_G2P:
        try:
            ph = _g2p(en)
        except Exception:
            ph = None
    if not ph and HAVE_IPA:
        try:
            ph = _ipa(en)
        except Exception:
            ph = None
    if not ph:
        return "", "empty"
    ph = ph.strip()
    if "*" in ph:
        return "/" + ph + "/", "broken"
    return "/" + ph + "/", "generated"

def template_example(en, zh):
    art = "an" if en[:1].lower() in "aeiou" else "a"
    return f"This is {art} {en}.", f"这是一个{zh}。"

# ----------------- 解析 vocabulary.ts -----------------
def parse_themes(txt):
    word_re = re.compile(
        r"id: '(w\d+)', en: '([^']*)', phonetic: '([^']*)', zh: '([^']*)', "
        r"example: '([^']*)', exampleZh: '([^']*)'"
    )
    # 只认 allThemes 中活跃的主题(排除孤儿/重复 id 的脏数据)
    am = re.search(r"export const allThemes: VocabularyTheme\[\] = \[(.*?)\];", txt, re.S)
    active = set(n.strip() for n in am.group(1).split(",") if n.strip())
    themes = {}
    # 锚定真正的主题定义: export const NAME: VocabularyTheme = { id:'Txx'
    for m in re.finditer(r"export const (\w+): VocabularyTheme = \{\s*id: '(T\d+)'", txt):
        name, tid = m.group(1), m.group(2)
        if name not in active:
            continue
        base = m.start()
        wstart = txt.index("words: [", base)
        wend = txt.index("\n  ],", wstart)
        body = txt[wstart + len("words: [") : wend]
        words = []
        for wm in word_re.finditer(body):
            words.append({
                "id": wm.group(1), "en": wm.group(2), "phonetic": wm.group(3),
                "zh": wm.group(4), "example": wm.group(5), "exampleZh": wm.group(6),
            })
        themes[tid] = {"name": name, "pos": m.start(), "words": words}
    return themes

def main():
    args = sys.argv[1:]
    if not args:
        print("用法: gen_theme_words.py <Txx> [--dry-run]"); sys.exit(1)
    Txx = args[0]
    dry = "--dry-run" in args

    ref = load_json("ipa_reference.json")        # 全库复用字典 en -> {phonetic,zh,example,exampleZh}
    overrides = load_json("word_overrides.json") # en -> {phonetic,example,exampleZh} 手工覆盖
    diff_all = load_json("vocab_diff.json")
    if Txx not in diff_all:
        print(f"diff 中无 {Txx} 主题"); sys.exit(1)
    diff_raw = diff_all[Txx]

    txt = open(VTS, encoding="utf-8").read()
    themes = parse_themes(txt)
    if Txx not in themes:
        print(f"vocabulary.ts 中无活跃主题 {Txx}"); sys.exit(1)
    theme = themes[Txx]
    theme_words = theme["words"]
    existing_en = {w["en"] for w in theme_words}

    # 全局最大 id
    max_w = max(int(x) for x in re.findall(r"id: 'w(\d+)'", txt)) if re.findall(r"id: 'w(\d+)'", txt) else 0
    max_mq = max(int(x) for x in re.findall(r"id: 'mq(\d+)'", txt)) if re.findall(r"id: 'mq(\d+)'", txt) else 0
    max_fq = max(int(x) for x in re.findall(r"id: 'fq(\d+)'", txt)) if re.findall(r"id: 'fq(\d+)'", txt) else 0
    next_w, next_mq, next_fq = max_w + 1, max_mq + 1, max_fq + 1

    # ----------------- 清洗 diff -----------------
    seen = set()
    cleaned = []
    raw_dup = 0
    garbage = 0
    for d in diff_raw:
        en = clean_entry(d.get("en", ""))
        zh = d.get("zh", "").strip()
        if en is None:
            garbage += 1
            continue
        if not zh:
            garbage += 1
            continue
        if en in seen:
            raw_dup += 1
            continue
        seen.add(en)
        cleaned.append((en, zh))
    # 过滤主题内已存在词
    to_add = [(en, zh) for (en, zh) in cleaned if en not in existing_en]

    # ----------------- 生成 Word -----------------
    added = []          # 完整 Word 记录
    review = []         # 复核用
    used_ids = set()
    for en, zh in to_add:
        # 数据来源优先级: overrides > 全局复用(ref) > 生成
        if en in overrides:
            o = overrides[en]
            ph = o.get("phonetic", "")
            ex, exzh = o.get("example", ""), o.get("exampleZh", "")
            src = "override"
        elif en in ref:
            r = ref[en]
            ph = r.get("phonetic", "")
            ex, exzh = r.get("example", ""), r.get("exampleZh", "")
            zh = zh or r.get("zh", "")
            src = "reused"
        else:
            ph, src = gen_ipa(en)
            ex, exzh = template_example(en, zh)
            src = "template+" + src
        wid = "w" + str(next_w); next_w += 1
        while wid in used_ids:
            wid = "w" + str(next_w); next_w += 1
        used_ids.add(wid)
        rec = {"id": wid, "en": en, "phonetic": ph, "zh": zh, "example": ex, "exampleZh": exzh}
        added.append(rec)
        review.append({"en": en, "zh": zh, "phonetic": ph, "example": ex,
                       "exampleZh": exzh, "source": src, "word_id": wid})

    # ----------------- 构建插入块 -----------------
    word_lines = "".join(
        f"    {{ id: '{w['id']}', en: '{q(w['en'])}', phonetic: '{q(w['phonetic'])}', "
        f"zh: '{q(w['zh'])}', example: '{q(w['example'])}', exampleZh: '{q(w['exampleZh'])}' }},\n"
        for w in added
    )

    # 题池: 主题内全部 en (含新加)
    pool = [w["en"] for w in theme_words] + [w["en"] for w in added]
    pool = list(dict.fromkeys(pool))
    global_pool = list(ref.keys())

    def distractors(answer):
        cand = [e for e in pool if e != answer]
        if len(cand) < 3:
            cand += [e for e in global_pool if e != answer and e not in cand]
        random.seed(hash(answer) & 0xffffffff)
        random.shuffle(cand)
        return cand[:3]

    mq_lines = []
    fq_lines = []
    for w in added:
        en, zh = w["en"], w["zh"]
        # matching: zh -> en
        opts = [en] + distractors(en)
        random.seed(hash(en) & 0xffffffff); random.shuffle(opts)
        mq_lines.append(
            f"  {{ id: 'mq{next_mq}', themeId: '{Txx}', prompt: '{q(zh)}', promptLang: 'zh', "
            f"options: {opts!r}, answer: '{q(en)}' }},\n"
        )
        next_mq += 1
        # fillBlank: 例句挖空
        ex = w["example"]
        if en in ex:
            sent = ex.replace(en, "____", 1)
        else:
            art = "an" if en[:1].lower() in "aeiou" else "a"
            sent = f"This is {art} ____."
        fq_lines.append(
            f"  {{ id: 'fq{next_fq}', themeId: '{Txx}', sentence: '{q(sent)}', answer: '{q(en)}', hint: '{q(zh)}' }},\n"
        )
        next_fq += 1

    # ----------------- 定位插入点(原始文本, 用活跃主题的 const 位置) -----------------
    idx = theme["pos"]
    wstart = txt.index("words: [", idx)
    wclose = txt.index("\n  ],", wstart)
    mq_start = txt.index("export const matchingQuestions")
    fq_start = txt.index("export const fillBlankQuestions")
    mq_close = mq_start + txt[mq_start:fq_start].index("];")
    fq_close = fq_start + txt[fq_start:].index("];")

    # 逆序插入(位置从大到小)避免偏移
    if not dry:
        open(VTS + ".bak", "w", encoding="utf-8").write(txt)
    new_txt = txt
    # fillBlank
    new_txt = new_txt[:fq_close] + "".join(fq_lines) + new_txt[fq_close:]
    # matching
    new_txt = new_txt[:mq_close] + "".join(mq_lines) + new_txt[mq_close:]
    # words
    new_txt = new_txt[:wclose] + word_lines + new_txt[wclose:]

    # ----------------- 输出 -----------------
    print(f"=== {Txx} 补词计划 ===")
    print(f"主题现有词: {len(theme_words)} | diff原始: {len(diff_raw)} | 内部重复跳过: {raw_dup} | 垃圾过滤: {garbage}")
    print(f"清洗后待补(已过滤主题内存在词): {len(added)}")
    src_count = {}
    for r in review:
        src_count[r["source"]] = src_count.get(r["source"], 0) + 1
    print(f"数据来源分布: {src_count}")
    print(f"新 w-id 区间: w{added[0]['id'][1:]}..w{added[-1]['id'][1:]} | 新题 mq..{next_mq-1} fq..{next_fq-1}" if added else "无新增")
    broken = [r for r in review if r["source"] in ("broken", "empty")]
    auto = [r for r in review if r["source"] == "generated"]
    print(f"--- 必须修复(broken/empty 音标): {len(broken)} ---")
    for r in broken:
        print(f"  {r['en']:18} | {r['phonetic']!r:16} | {r['example']}  [{r['source']}]")
    print(f"--- 自动生成(generated, 建议抽查, 共 {len(auto)}): 前20 ---")
    for r in auto[:20]:
        print(f"  {r['en']:18} | {r['phonetic']:14} | {r['example']}")
    # 写复核文件
    json.dump(review, open(os.path.join(SCR, f"review_{Txx}.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"复核文件: scripts/review_{Txx}.json")

    if dry:
        print("[DRY-RUN] 未写入 vocabulary.ts")
    else:
        open(VTS, "w", encoding="utf-8").write(new_txt)
        print(f"[OK] 已写入 vocabulary.ts (备份 vocabulary.ts.bak)")

if __name__ == "__main__":
    main()
