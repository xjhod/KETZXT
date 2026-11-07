#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""补齐单词整词音频（public/audio/<wordId>.mp3）。

默认扫描 src/data/vocabulary.ts 中的全部词条，只为缺失的文件发码生成；
也可显式指定：python scripts/gen_word_audio.py w001 mother

语音与既有单词音频一致：en-GB-SoniaNeural（英式女声，贴合剑桥 KET）。
幂等：已存在且非空的文件一律跳过；失败不删除任何已有文件。
"""
import argparse
import asyncio
import os
import re
import sys

import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VTS = os.path.join(ROOT, "src", "data", "vocabulary.ts")
OUTDIR = os.path.join(ROOT, "public", "audio")
VOICE = "en-GB-SoniaNeural"

# 兼容 { id: ... 与 {id: ...、单双引号
WORD_RE = re.compile(
    r"\{\s*id: ['\"](w[e]?\d+)['\"],\s*en: ['\"]([^'\"]+)['\"]"
)


def harvest():
    text = open(VTS, encoding="utf-8").read()
    pairs = WORD_RE.findall(text)
    seen = {}
    for wid, en in pairs:
        seen.setdefault(wid, en)
    return list(seen.items())


async def gen_one(wid, text):
    path = os.path.join(OUTDIR, f"{wid}.mp3")
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return "skip", path
    tmp = path + ".part"
    try:
        await edge_tts.Communicate(text, VOICE).save(tmp)
        size = os.path.getsize(tmp)
        if size < 1024:
            raise RuntimeError(f"suspiciously small audio: {size} bytes")
        os.replace(tmp, path)
        return "ok", path
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


async def main(targets, dry_run):
    os.makedirs(OUTDIR, exist_ok=True)
    if not targets:
        all_words = harvest()
        targets = [(wid, en) for wid, en in all_words
                   if not (os.path.exists(os.path.join(OUTDIR, f"{wid}.mp3"))
                           and os.path.getsize(os.path.join(OUTDIR, f"{wid}.mp3")) > 0)]
        print(f"SCANNED {len(all_words)} words, missing {len(targets)}", flush=True)
    if dry_run:
        print("DRY_RUN", targets[:20])
        return 0
    ok = fail = 0
    for wid, en in targets:
        try:
            status, path = await gen_one(wid, en)
            if status == "ok":
                ok += 1
                print(f"OK   {wid} <- {en} ({os.path.getsize(path)} bytes)", flush=True)
        except Exception as exc:  # noqa: BLE001 - 单个失败不能中断整批
            fail += 1
            print(f"FAIL {wid} <- {en}: {exc}", file=sys.stderr, flush=True)
    print(f"DONE ok={ok} fail={fail}")
    return 1 if fail else 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("word_id", nargs="?", help="如 w001（省略则扫描全库缺失项）")
    ap.add_argument("text", nargs="?", help="朗读文本，显式指定 word_id 时必填")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    if args.word_id:
        if not args.text:
            ap.error("显式指定 word_id 时必须同时给出朗读文本")
        job = [(args.word_id, args.text)]
    else:
        job = []
    raise SystemExit(asyncio.run(main(job, args.dry_run)))
