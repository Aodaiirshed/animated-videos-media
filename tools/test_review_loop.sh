#!/usr/bin/env bash
# Offline test of tools/review_loop.py on a throwaway copy of reviews/ (never touches the real folder).
set -euo pipefail
REPO=$(cd "$(dirname "$0")/.." && pwd)
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
cp -r "$REPO/reviews" "$T/reviews"; cd "$T"
L="python3 $REPO/tools/review_loop.py"
ok(){ echo "PASS $1"; }; bad(){ echo "FAIL $1"; exit 1; }

$L init >/dev/null
[ "$($L pending wondersynapse)" = "[]" ] && ok "1 already-replied brain-freeze is skipped" || bad 1
[ "$($L channel 2026-11-27-brain-freeze)" = "wondersynapse" ] && ok "2 channel detected from brief title" || bad 2

mkdir -p reviews/2099-01-01-test-heart reviews/2099-01-01-test-goal
printf 'Channel: WonderSynapse\n# brief\n' > reviews/2099-01-01-test-heart/brief.md
printf '# GPT review\nhook weak\n' > reviews/2099-01-01-test-heart/gpt.md
printf 'Channel: SecretFootFiles\n' > reviews/2099-01-01-test-goal/brief.md
printf '# GPT review\n' > reviews/2099-01-01-test-goal/gpt.md
[ "$($L pending wondersynapse)" = '["2099-01-01-test-heart"]' ] && ok "3 new WonderSynapse review detected" || bad 3
[ "$($L pending secretfootfiles)" = '["2099-01-01-test-goal"]' ] && ok "4 routed to the right channel" || bad 4
$L done 2099-01-01-test-heart 2>/dev/null && bad "5 done without reply.md" || ok "5 refuses to record before reply.md exists"
printf 'reply\n' > reviews/2099-01-01-test-heart/reply.md
$L done 2099-01-01-test-heart >/dev/null && ok "6 records after reply" || bad 6
[ "$($L done 2099-01-01-test-heart)" = "already recorded: 2099-01-01-test-heart" ] && ok "7 duplicate record refused" || bad 7
[ "$($L pending wondersynapse)" = "[]" ] && ok "8 processed review not offered again" || bad 8
printf '# GPT edits its review later\n' >> reviews/2099-01-01-test-heart/gpt.md
[ "$($L pending wondersynapse)" = "[]" ] && ok "9 edited gpt.md does not re-trigger a reply (no loop)" || bad 9
[ "$($L latest wondersynapse)" = '{"folder": "2099-01-01-test-heart", "has_reply": true}' ] && ok "10 latest review found for next brief" || bad 10
n=$(python3 -c "import json;print(len(json.load(open('reviews/_ledger.json'))))")
[ "$n" = "2" ] && ok "11 ledger append-only (2 entries)" || bad 11
echo ALL PASS
