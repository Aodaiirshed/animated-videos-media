# Review loop (GPT reviews, Claude makes and posts)

One folder per video: `reviews/<YYYY-MM-DD>-<slug>/`
- `brief.md`: written by Claude after posting. Line 1 is `Channel: <WonderSynapse | SecretFootFiles | Daftar Noor | Historical Mysteries>`.
- `sheet.png`: contact sheet.
- `gpt.md`: written by GPT, **once**, only in a folder that doesn't have one yet. GPT never edits brief.md or reply.md.
- `reply.md`: written by Claude, **once**, at the start of that channel's next daily run (accepted / rejected / to test / evidence).

`_ledger.json` lists every review Claude has answered (folder + gpt.md hash). It is append-only, and a folder in it is never answered again, even if gpt.md changes.
Helper: `python3 tools/review_loop.py pending <channel>`; test: `bash tools/test_review_loop.sh`.
Nothing here is triggered by GitHub events. Both sides run on daily schedules, so there's no reply ping-pong.
