"""Free Arabic (or any) voiceover via edge-tts, writing the same files as tts_kokoro.py:
public/vo/<slug>/<scene>.wav and src/generated/<slug>.timing.json (word captions from WordBoundary events).
Usage: python3 scripts/tts_edge.py storyboards/<slug>.json [voice] [rate]"""
import asyncio, json, os, subprocess, sys, tempfile
import numpy as np, soundfile as sf
import edge_tts

PAD_BEFORE, PAD_AFTER = 0.15, 0.25


async def synth(text, voice, rate, mp3):
    com = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    marks = []
    with open(mp3, "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                marks.append((ch["offset"] / 1e7, ch["duration"] / 1e7, ch["text"]))
    return marks


def main(path, voice="ar-SA-HamedNeural", rate="+8%"):
    sb = json.load(open(path))
    slug = sb["slug"]
    outdir = f"public/vo/{slug}"; os.makedirs(outdir, exist_ok=True)
    scenes = []
    for sc in sb["scenes"]:
        with tempfile.TemporaryDirectory() as td:
            mp3 = os.path.join(td, "a.mp3"); wav = os.path.join(td, "a.wav")
            marks = asyncio.run(synth(sc["vo"], voice, rate, mp3))
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-ar", "24000", "-ac", "1", wav], check=True)
            samples, sr = sf.read(wav, dtype="float32")
        idx = np.where(np.abs(samples) > 0.01)[0]
        lead = 0.0
        if len(idx):
            start = max(0, idx[0] - 600); lead = start / sr
            samples = samples[start: idx[-1] + 2400]
        speech = len(samples) / sr
        sf.write(f"{outdir}/{sc['id']}.wav", np.concatenate([np.zeros(int(PAD_BEFORE * sr), dtype=samples.dtype), samples]), sr)
        # captions: use the script's own words (keeps punctuation/diacritics) mapped onto boundary times
        words = sc["vo"].split()
        caps = []
        for i, w in enumerate(words):
            if i < len(marks):
                o, d, _ = marks[i]
                st = max(0.0, o - lead) + PAD_BEFORE
                en = st + d
            else:
                st = caps[-1]["endMs"] / 1000 if caps else PAD_BEFORE; en = st + 0.3
            caps.append({"text": w, "startMs": round(st * 1000), "endMs": round(en * 1000), "timestampMs": None, "confidence": None})
        scenes.append({"id": sc["id"], "durationSec": round(PAD_BEFORE + speech + PAD_AFTER, 3), "captions": caps})
        print(f"{sc['id']}: {speech:.2f}s ({len(marks)} marks / {len(words)} words)")
    total = sum(s["durationSec"] for s in scenes)
    json.dump({"slug": slug, "totalSec": round(total, 2), "scenes": scenes}, open(f"src/generated/{slug}.timing.json", "w"), indent=1, ensure_ascii=False)
    print(f"TOTAL {total:.1f}s")


if __name__ == "__main__":
    main(*sys.argv[1:])
