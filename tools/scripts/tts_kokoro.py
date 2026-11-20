"""Free, offline voiceover with Kokoro TTS.

Usage:  python3 scripts/tts_kokoro.py storyboards/<slug>.json

Writes   public/vo/<slug>/<scene-id>.wav
         src/generated/<slug>.timing.json   (scene durations + word-level captions)

Model files (download once from GitHub releases, ~350 MB):
  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
Set KOKORO_DIR to the folder that holds them (default: ./models).
"""
import json, os, re, sys, subprocess, tempfile
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

# Spoken spellings for names the TTS mispronounces. Captions keep the real spelling.
DEFAULT_OVERRIDES = {
    "Modrić": "Modritch",
    "Ballon d'Or": "Bal-lon Dor",
}
PAD_AFTER = 0.25  # seconds of breathing room after each line
PAD_BEFORE = 0.15

def word_timings(text, dur, offset):
    """Distribute words across the clip, weighted by length, with extra weight on punctuation pauses."""
    words = text.split()
    weights = []
    for w in words:
        wt = len(re.sub(r"[^\w']", "", w)) + 2
        if re.search(r"[.?!]$", w): wt += 5
        elif re.search(r"[,;:]$", w): wt += 3
        weights.append(wt)
    total = sum(weights)
    t, out = offset, []
    for w, wt in zip(words, weights):
        d = dur * wt / total
        out.append({"text": w, "startMs": round(t * 1000), "endMs": round((t + d) * 1000),
                    "timestampMs": None, "confidence": None})
        t += d
    return out

def resolve_voice(k, name):
    """'am_onyx:0.55,am_michael:0.45' blends voice styles; a plain name is used as is.
    'mix' = the channel narrator chosen by the user on 2026-11-14 (55% onyx + 45% michael)."""
    if name == "mix":
        name = "am_onyx:0.55,am_michael:0.45"
    if name == "brit":  # FOOTBALL narrator chosen by the user on 2026-11-20 (sample #4): 60% George + 40% Lewis
        name = "bm_george:0.6,bm_lewis:0.4"
    if "," not in name and ":" not in name:
        return name
    style = None
    for part in name.split(","):
        vn, w = part.split(":")
        st = k.get_voice_style(vn.strip()) * float(w)
        style = st if style is None else style + st
    return style


def main(path):
    sb = json.load(open(path))
    slug = sb["slug"]
    v = sb.get("voice", {})
    overrides = {**DEFAULT_OVERRIDES, **sb.get("ttsOverrides", {})}
    mdir = os.environ.get("KOKORO_DIR", "models")
    k = Kokoro(os.path.join(mdir, "kokoro-v1.0.onnx"), os.path.join(mdir, "voices-v1.0.bin"))
    outdir = f"public/vo/{slug}"; os.makedirs(outdir, exist_ok=True); os.makedirs("src/generated", exist_ok=True)
    scenes = []
    for sc in sb["scenes"]:
        spoken = sc["vo"]
        for a, b in overrides.items(): spoken = spoken.replace(a, b)
        cast = sb.get("cast", {}).get(sc.get("speaker", ""), {})
        samples, sr = k.create(spoken, voice=resolve_voice(k, cast.get("voice", v.get("voice", "am_michael"))),
                               speed=cast.get("speed", v.get("speed", 0.95)),
                               lang=v.get("lang") or ("en-gb" if str(cast.get("voice", v.get("voice", ""))).startswith(("brit", "b")) else "en-us") if sb.get("language", "en") == "en" else sb["language"])
        pitch = cast.get("pitch", 1.0)
        if abs(pitch - 1.0) > 1e-3:  # shift pitch, keep duration (younger / older voices)
            with tempfile.TemporaryDirectory() as td:
                a, b = os.path.join(td, "a.wav"), os.path.join(td, "b.wav")
                sf.write(a, samples, sr)
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a, "-af",
                                f"asetrate={int(sr * pitch)},aresample={sr},atempo={1 / pitch:.5f}", b], check=True)
                samples, _ = sf.read(b, dtype="float32")
        # trim leading/trailing near-silence so captions line up
        idx = np.where(np.abs(samples) > 0.01)[0]
        if len(idx): samples = samples[max(0, idx[0] - 600): idx[-1] + 2400]
        speech = len(samples) / sr
        pad = np.zeros(int(PAD_BEFORE * sr), dtype=samples.dtype)
        sf.write(f"{outdir}/{sc['id']}.wav", np.concatenate([pad, samples]), sr)
        # mouth envelope for lip-sync: RMS per video frame (30 fps), 0..1, aligned to scene start
        full = np.concatenate([pad, samples]).astype(np.float32)
        hop = sr // 30
        rms = np.array([np.sqrt(np.mean(full[i:i + hop] ** 2)) if len(full[i:i + hop]) else 0 for i in range(0, len(full), hop)])
        env = np.clip(rms / (np.percentile(rms[rms > 0], 95) + 1e-6), 0, 1) if np.any(rms > 0) else rms
        scenes.append({"id": sc["id"], "durationSec": round(PAD_BEFORE + speech + PAD_AFTER, 3),
                       "captions": word_timings(sc["vo"], speech, PAD_BEFORE),
                       "mouth": [round(float(x), 2) for x in env]})
        print(f"{sc['id']}: {speech:.2f}s")
    total = sum(s["durationSec"] for s in scenes)
    json.dump({"slug": slug, "totalSec": round(total, 2), "scenes": scenes},
              open(f"src/generated/{slug}.timing.json", "w"), indent=1, ensure_ascii=False)
    print(f"TOTAL {total:.1f}s")

if __name__ == "__main__":
    main(sys.argv[1])
