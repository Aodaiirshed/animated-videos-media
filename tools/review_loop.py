#!/usr/bin/env python3
"""GPT <-> Claude review loop helper (no network, no API keys).

Folders: reviews/<YYYY-MM-DD>-<slug>/ with brief.md (Claude), gpt.md (GPT), reply.md (Claude).
Ledger:  reviews/_ledger.json — one entry per processed gpt.md (folder + sha256). Never rewritten, only appended.

Commands (run from the repo root, after `git pull --rebase origin main`):
  pending <channel>   folders for <channel> that have gpt.md, no reply.md and are not in the ledger (JSON list)
  latest  <channel>   newest folder for <channel> that has gpt.md (JSON: folder, has_reply)
  done    <folder>    record a processed review (needs reply.md; refuses duplicates)
  init                record every folder that already has gpt.md + reply.md (safe to re-run)
  channel <folder>    print the detected channel
Channels: wondersynapse | secretfootfiles | daftarnoor | historicalmysteries
"""
import hashlib, json, os, re, sys, datetime

ROOT = os.environ.get("REVIEWS_ROOT", "reviews")
LEDGER = os.path.join(ROOT, "_ledger.json")
ALIASES = {
    "wondersynapse": ["wondersynapse", "wonder synapse"],
    "secretfootfiles": ["secretfootfiles", "secretfootyfiles", "secret foot files", "football"],
    "daftarnoor": ["daftarnoor", "daftar noor", "دفتر نور"],
    "historicalmysteries": ["historical mysteries", "historicalmysteries", "codex obscura", "history mysteries"],
}

def norm_channel(s):
    s = s.strip().lower()
    for k, al in ALIASES.items():
        if s == k or s in al:
            return k
    return None

def detect_channel(folder):
    p = os.path.join(ROOT, folder)
    for name in ("brief.md", "gpt.md"):
        f = os.path.join(p, name)
        if not os.path.exists(f):
            continue
        txt = open(f, encoding="utf-8").read()
        m = re.search(r"^\s*(?:\*\*)?channel(?:\*\*)?\s*:\s*\**\s*([^\n*]+)", txt, re.I | re.M)
        if m and norm_channel(m.group(1)):
            return norm_channel(m.group(1))
        head = "\n".join(txt.splitlines()[:5]).lower()
        for k, al in ALIASES.items():
            if any(a in head for a in al if a != "football"):
                return k
    low = folder.lower()
    for k, al in ALIASES.items():
        if any(a.replace(" ", "") in low.replace("-", "") for a in al):
            return k
    return "unknown"

def sha(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()

def load_ledger():
    if not os.path.exists(LEDGER):
        return []
    return json.load(open(LEDGER, encoding="utf-8"))

def save_ledger(entries):
    tmp = LEDGER + ".tmp"
    json.dump(entries, open(tmp, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    os.replace(tmp, LEDGER)

def folders():
    if not os.path.isdir(ROOT):
        return []
    return sorted(d for d in os.listdir(ROOT) if re.match(r"^\d{4}-\d{2}-\d{2}-", d) and os.path.isdir(os.path.join(ROOT, d)))

def in_ledger(led, folder):
    return any(e["folder"] == folder for e in led)

def cmd_pending(channel):
    ch = norm_channel(channel) or channel
    led = load_ledger()
    out = []
    for d in folders():
        p = os.path.join(ROOT, d)
        if not os.path.exists(os.path.join(p, "gpt.md")):
            continue
        if os.path.exists(os.path.join(p, "reply.md")) or in_ledger(led, d):
            continue
        if detect_channel(d) == ch:
            out.append(d)
    print(json.dumps(out))

def cmd_latest(channel):
    ch = norm_channel(channel) or channel
    best = None
    for d in folders():
        if os.path.exists(os.path.join(ROOT, d, "gpt.md")) and detect_channel(d) == ch:
            best = d
    print(json.dumps({"folder": best, "has_reply": bool(best and os.path.exists(os.path.join(ROOT, best, "reply.md")))}))

def cmd_done(folder):
    p = os.path.join(ROOT, folder)
    if not os.path.exists(os.path.join(p, "gpt.md")):
        sys.exit(f"refused: {folder} has no gpt.md")
    if not os.path.exists(os.path.join(p, "reply.md")):
        sys.exit(f"refused: {folder} has no reply.md yet")
    led = load_ledger()
    if in_ledger(led, folder):
        print(f"already recorded: {folder}")
        return
    led.append({"folder": folder, "channel": detect_channel(folder), "gpt_sha256": sha(os.path.join(p, "gpt.md")),
                "recorded_at": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")})
    save_ledger(led)
    print(f"recorded: {folder}")

def cmd_init():
    led = load_ledger(); n = 0
    for d in folders():
        p = os.path.join(ROOT, d)
        if os.path.exists(os.path.join(p, "gpt.md")) and os.path.exists(os.path.join(p, "reply.md")) and not in_ledger(led, d):
            led.append({"folder": d, "channel": detect_channel(d), "gpt_sha256": sha(os.path.join(p, "gpt.md")),
                        "recorded_at": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")})
            n += 1
    save_ledger(led)
    print(f"init: {n} recorded, {len(led)} total")

if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    {"pending": lambda: cmd_pending(a[1]), "latest": lambda: cmd_latest(a[1]), "done": lambda: cmd_done(a[1]),
     "init": cmd_init, "channel": lambda: print(detect_channel(a[1]))}[a[0]]()
