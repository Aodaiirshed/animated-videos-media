# text-to-lottie in our pipeline (added 2026-11-17)
Source: github.com/diffusionstudio/lottie (MIT). Skill = SKILL.md here.
1. Player (for previewing/validating Lottie scenes): `git clone --depth 1 https://github.com/diffusionstudio/lottie /home/claude/tools/lottie-player && cd /home/claude/tools/lottie-player && npm install` then `npx vite --port 5173` and open `?frame=N`.
2. Write scenes to the player's `public/projects/<project>/<scene-N>/lottie.json` as the skill says, verify, then copy the JSON to the Remotion project `public/lottie/<name>.json`.
3. In Remotion: `npm i @remotion/lottie lottie-web` (same version as remotion), copy `tools/components/LottieLayer.tsx` to `src/components/`, and use `<LottieLayer file="<name>.json" style={{position:'absolute', ...}} loop />` inside a scene. Lottie frames follow the Remotion timeline, so renders stay deterministic.
Use it for: smooth character/icon motion, animated charts and counters, transitions, lower thirds — the parts our hand-written SVG scenes do roughly.
