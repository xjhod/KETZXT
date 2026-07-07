#!/usr/bin/env python3
# 用 Edge TTS 批量生成听力音频 mp3
# 读取 scripts/audio_manifest.json，输出 public/audio/{id}.mp3
import argparse
import asyncio
import json
import os
import re
import sys

import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, "scripts", "audio_manifest.json")
OUTDIR = os.path.join(ROOT, "public", "audio")
VOICE = "en-GB-SoniaNeural"  # 英式女声，贴合剑桥 KET

# 去掉题面上的 "Listen: " 等提示词，只朗读正文
PREFIX_RE = re.compile(r"^\s*(listen\s*[:：]\s*)+", re.IGNORECASE)


def clean(text: str) -> str:
    return PREFIX_RE.sub("", text).strip()


async def gen_one(item, voice):
    out_path = os.path.join(OUTDIR, f"{item['id']}.mp3")
    if os.path.exists(out_path) and os.path.getsize(out_path) > 0:
        return "skip"
    text = clean(item["text"])
    if not text:
        return "empty"
    comm = edge_tts.Communicate(text, voice)
    await comm.save(out_path)
    return "ok" if os.path.getsize(out_path) > 0 else "fail"


async def main(limit):
    os.makedirs(OUTDIR, exist_ok=True)
    with open(MANIFEST, "r", encoding="utf-8") as f:
        items = json.load(f)
    if limit:
        items = items[:limit]
    ok = skip = fail = empty = 0
    for i, it in enumerate(items, 1):
        try:
            r = await gen_one(it, VOICE)
        except Exception as e:
            r = f"err:{e}"
        if r == "ok":
            ok += 1
        elif r == "skip":
            skip += 1
        elif r == "empty":
            empty += 1
        else:
            fail += 1
            print(f"  ✗ [{r}] {it['id']}")
        print(f"  [{i}/{len(items)}] {it['id']} -> {r}")
    print(f"\n完成: ok={ok} skip={skip} empty={empty} fail={fail}")
    if fail:
        sys.exit(1)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="仅生成前 N 条（试跑）")
    ap.add_argument("--voice", default=VOICE)
    args = ap.parse_args()
    asyncio.run(main(args.limit))
