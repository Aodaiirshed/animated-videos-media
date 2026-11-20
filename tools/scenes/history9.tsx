import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Camera, Shake} from '../components/Fx';
import {DailyPill, SeriesBadge, Syn} from '../components/Host';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* Guess Who: History #9 — Sasaki Kojirō (Ragnarok's Real Humans #2). Original cartoons only; no anime designs.
   duelIsland (hook), dryingPole, lateRival, steelWood, kojiroReveal, islandName (loops to "1612"). */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OL = '#1a120b';
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);
const BADGE = 'GUESS WHO: HISTORY #9';

const Tag: React.FC<{text: string; a: number; y: number; color?: string; size?: number; rot?: number}> = ({text, a, y, color = '#ffcc4d', size = 62, rot = -3}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < a) return null;
  const s = spring({frame: frame - a, fps, config: {damping: 10, stiffness: 190}});
  return (
    <div style={{position: 'absolute', left: 40, right: 140, top: y, textAlign: 'center', scale: String(1.6 - s * 0.6), rotate: `${rot}deg`}}>
      <span style={{fontFamily: DISPLAY, fontSize: size, color: '#111', background: color, padding: '4px 26px', borderRadius: 14, border: `6px solid ${OL}`, boxShadow: `0 8px 0 ${OL}`}}>{text}</span>
    </div>
  );
};

/* Sea at dawn with the small boat-shaped island (same layout in the hook and the last scene → clean loop). */
const Sea: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg,#fdba74 0%, #fb923c 30%, #f472b6 46%, #0e7490 47%, #155e75 100%)'}}>
    <div style={{position: 'absolute', left: 640, top: 520, width: 160, height: 160, borderRadius: 80, background: '#fff7ed', opacity: 0.9}} />
    {children}
  </AbsoluteFill>
);
const Island: React.FC<{x?: number; y?: number; s?: number}> = ({x = 300, y = 840, s = 1}) => (
  <svg width={480 * s} height={200 * s} viewBox="0 0 480 200" style={{position: 'absolute', left: x, top: y}}>
    <path d="M10 150 Q60 60 180 50 Q300 30 400 70 Q470 100 470 150 Z" fill="#a16207" stroke={OL} strokeWidth={6} />
    <path d="M60 110 Q140 40 240 45 Q340 40 420 90 Q300 80 200 85 Q120 90 60 110Z" fill="#4d7c0f" stroke={OL} strokeWidth={5} />
    <path d="M0 160 Q240 140 480 160" stroke="#e0f2fe" strokeWidth={6} fill="none" opacity={0.7} />
  </svg>
);
const Boat: React.FC<{x: number; y: number; s?: number; flip?: boolean; who?: React.ReactNode}> = ({x, y, s = 1, flip, who}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 260 * s, height: 200 * s, scale: flip ? '-1 1' : undefined}}>
    <div style={{position: 'absolute', left: 60 * s, top: 0, scale: String(s * 0.5), transformOrigin: '0 0'}}>{who}</div>
    <svg width={260 * s} height={110 * s} viewBox="0 0 260 110" style={{position: 'absolute', left: 0, top: 90 * s}}>
      <path d="M5 20 L255 20 L215 90 L45 90 Z" fill="#78350f" stroke={OL} strokeWidth={6} />
      <line x1={230} y1={10} x2={180} y2={105} stroke={OL} strokeWidth={8} />
    </svg>
  </div>
);

/* original cartoon swordsman. hidden = dark silhouette with "?" face. hair: pony (the mystery man) | knot (the rival). */
const Swordsman: React.FC<{x: number; y: number; s?: number; hidden?: boolean; kimono?: string; hair?: 'pony' | 'knot'; sword?: 'long' | 'oar' | 'none'; swordLen?: number; mood?: 'calm' | 'angry'}> = ({
  x, y, s = 1, hidden, kimono = '#7c3aed', hair = 'pony', sword = 'long', swordLen = 1, mood = 'calm',
}) => {
  const ink = hidden ? '#111827' : OL;
  const skin = hidden ? '#1f2937' : '#f2c79b';
  const k = hidden ? '#1f2937' : kimono;
  const h = hidden ? '#0b0f17' : '#1c1917';
  return (
    <svg width={420 * s} height={460 * s} viewBox="0 0 420 460" style={{position: 'absolute', left: x - 160 * s, top: y - 120 * s, overflow: 'visible'}}>
      {sword === 'long' ? <g transform="rotate(-38 230 250)"><rect x={226} y={250 - 300 * swordLen} width={10} height={300 * swordLen} rx={4} fill={hidden ? '#374151' : '#e2e8f0'} stroke={ink} strokeWidth={4} /><rect x={218} y={250} width={26} height={8} fill="#a16207" stroke={ink} strokeWidth={3} /><rect x={224} y={258} width={14} height={50} rx={4} fill="#111" /></g> : null}
      {sword === 'oar' ? <g transform="rotate(-30 230 250)"><rect x={224} y={60} width={16} height={240} rx={7} fill={hidden ? '#374151' : '#b45309'} stroke={ink} strokeWidth={4} /><path d="M218 60 Q232 -10 246 60 Z" fill={hidden ? '#374151' : '#b45309'} stroke={ink} strokeWidth={4} /></g> : null}
      {hair === 'pony' ? <path d="M110 70 Q60 140 90 220 Q120 150 135 80Z" fill={h} stroke={ink} strokeWidth={4} /> : null}
      <path d="M100 170 L220 170 L250 380 L70 380 Z" fill={k} stroke={ink} strokeWidth={6} />
      <path d="M100 170 L160 250 L220 170" fill="none" stroke={hidden ? '#374151' : '#fef3c7'} strokeWidth={8} />
      <rect x={88} y={262} width={146} height={22} fill={hidden ? '#111827' : '#111'} />
      <rect x={90} y={378} width={60} height={40} rx={8} fill="#111" /><rect x={170} y={378} width={60} height={40} rx={8} fill="#111" />
      <circle cx={160} cy={110} r={58} fill={skin} stroke={ink} strokeWidth={6} />
      {hair === 'pony' ? <path d="M102 104 Q110 44 170 50 Q214 58 218 104 Q190 76 150 78 Q118 82 102 104Z" fill={h} stroke={ink} strokeWidth={4} /> : <><path d="M104 96 Q150 70 216 96" stroke={h} strokeWidth={14} fill="none" /><ellipse cx={160} cy={50} rx={16} ry={12} fill={h} stroke={ink} strokeWidth={4} /></>}
      {hidden ? <text x={160} y={138} textAnchor="middle" fontFamily={DISPLAY} fontSize={70} fill="#fbbf24">?</text> : (
        <g>
          <path d={mood === 'angry' ? 'M126 98 l20 8 M194 98 l-20 8' : 'M128 102 h18 M174 102 h18'} stroke={OL} strokeWidth={6} strokeLinecap="round" />
          <circle cx={138} cy={116} r={6} fill={OL} /><circle cx={182} cy={116} r={6} fill={OL} />
          <path d={mood === 'angry' ? 'M140 146 q20 -10 40 0' : 'M142 140 q18 10 36 0'} stroke={OL} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      )}
      <circle cx={232} cy={252} r={18} fill={skin} stroke={ink} strokeWidth={5} />
    </svg>
  );
};

/* duelIsland: { loserOnWord } — HOOK. Frame 0: two boats already rowing toward the island, "1612 · JAPAN". Punch-in cut at 1.2 s; on "loser" a sign with "?-JIMA". */
const DuelIsland: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lAt = at(captions, scene.loserOnWord, fps, dur * 0.8);
  const cut = 36;
  const bob = Math.sin(frame / 5) * 6;
  const lx = interpolate(frame, [0, dur], [-60, 90], clamp);
  const rx = interpolate(frame, [0, dur], [800, 620], clamp);
  return (
    <AbsoluteFill style={{scale: frame >= cut ? '1.35' : '1', transformOrigin: '540px 900px'}}>
      <Sea>
        <Island />
        <Boat x={lx} y={960 + bob} s={1.3} who={<Swordsman x={160} y={120} hidden />} />
        <Boat x={rx} y={975 - bob} s={1.3} flip who={<Swordsman x={160} y={120} hidden hair="knot" sword="none" />} />
        {frame >= lAt ? (
          <div style={{position: 'absolute', left: 470, top: 760, scale: String(spring({frame: frame - lAt, fps, config: {damping: 9}}))}}>
            <div style={{width: 12, height: 110, background: OL, marginLeft: 70}} />
            <div style={{position: 'absolute', left: 0, top: -10, padding: '6px 16px', background: '#fef3c7', border: `5px solid ${OL}`, borderRadius: 10, fontFamily: DISPLAY, fontSize: 44, color: '#111'}}>?-JIMA</div>
          </div>
        ) : null}
      </Sea>
      <Tag text="1612 · JAPAN" a={-10} y={330} size={66} color="#f8fafc" />
      {frame >= lAt ? <Tag text="NAMED AFTER THE LOSER" a={lAt} y={450} size={56} color="#ef4444" rot={2} /> : null}
      {frame >= 50 ? <SeriesBadge text={BADGE} /> : null}
    </AbsoluteFill>
  );
};

/* dryingPole: { longOnWord, poleOnWord } — the hidden swordsman; his sword grows absurdly long; laundry pops onto it: THE DRYING POLE. */
const DryingPole: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lAt = at(captions, scene.longOnWord, fps, dur * 0.35);
  const pAt = at(captions, scene.poleOnWord, fps, dur * 0.7);
  const len = 0.7 + 0.75 * spring({frame: frame - lAt, fps, config: {damping: 12}});
  const items = ['👕', '🧦', '👘'];
  return (
    <Camera dur={dur} from={1.05} to={1.0}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#fde68a 0%, #fdba74 55%, #d6a35c 56%, #b7894a 100%)'}} />
      <Swordsman x={330} y={880} s={1.25} hidden swordLen={len} />
      {frame >= pAt ? items.map((it, i) => {
        const s = spring({frame: frame - pAt - i * 4, fps, config: {damping: 8}});
        return <div key={i} style={{position: 'absolute', left: 520 + i * 95, top: 760 - i * 75, fontSize: 80, scale: String(s), rotate: `${Math.sin(frame / 6 + i) * 8}deg`}}>{it}</div>;
      }) : null}
      <Tag text="FAMOUS SWORDSMAN" a={2} y={330} size={58} color="#f8fafc" />
      {frame >= pAt ? <Tag text="'THE DRYING POLE'" a={pAt} y={450} size={66} rot={2} /> : null}
      <SeriesBadge text={BADGE} />
    </Camera>
  );
};

/* lateRival: { hoursOnWord, rowOnWord, oarOnWord } — the hidden man waits on the beach while a clock spins 8 → 10 (legend);
   hard cut on "rowed": the rival in a boat carving an oar; on "oar" it becomes a wooden sword. */
const LateRival: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const hAt = at(captions, scene.hoursOnWord, fps, dur * 0.3);
  const rAt = at(captions, scene.rowOnWord, fps, dur * 0.45);
  const oAt = at(captions, scene.oarOnWord, fps, dur * 0.85);
  if (frame < rAt) {
    const turn = interpolate(frame, [0, rAt], [0, 720], clamp);
    return (
      <Camera dur={rAt} from={1.0} to={1.06}>
        <AbsoluteFill style={{background: 'linear-gradient(180deg,#fde68a 0%, #fdba74 55%, #d6a35c 56%, #b7894a 100%)'}} />
        <Swordsman x={300 + Math.sin(frame / 8) * 60} y={880} s={1.1} hidden mood="angry" />
        <div style={{position: 'absolute', left: 640, top: 560, width: 240, height: 240, borderRadius: 120, background: '#fff', border: `8px solid ${OL}`}}>
          <div style={{position: 'absolute', left: 116, top: 30, width: 8, height: 92, background: OL, transformOrigin: '4px 90px', rotate: `${turn}deg`}} />
          <div style={{position: 'absolute', left: 114, top: 60, width: 12, height: 62, background: '#ef4444', transformOrigin: '6px 60px', rotate: `${240 + turn / 12}deg`}} />
        </div>
        <Tag text="WAITING…" a={2} y={330} size={60} color="#f8fafc" />
        {frame >= hAt ? <Tag text="FOR HOURS (LEGEND SAYS)" a={hAt} y={450} size={54} color="#ef4444" rot={2} /> : null}
        <SeriesBadge text={BADGE} />
      </Camera>
    );
  }
  const t = frame - rAt;
  return (
    <Camera dur={dur - rAt} from={1.04} to={1.0}>
      <Sea>
        <Boat x={interpolate(t, [0, dur - rAt], [80, 260], clamp)} y={880 + Math.sin(frame / 5) * 6} s={1.6} who={<Swordsman x={160} y={120} hair="knot" sword={frame >= oAt ? 'oar' : 'none'} kimono="#1e3a8a" />} />
      </Sea>
      {frame < oAt ? <div style={{position: 'absolute', left: 430, top: 640, width: 26, height: 280, background: '#b45309', border: `5px solid ${OL}`, borderRadius: 10, rotate: '-25deg'}} /> : null}
      <Tag text="HIS RIVAL ARRIVES" a={rAt + 2 - rAt} y={330} size={58} color="#f8fafc" />
      {frame >= oAt ? <Tag text="🛶 OAR → WOODEN SWORD" a={oAt} y={450} size={56} rot={2} /> : null}
      <SeriesBadge text={BADGE} />
    </Camera>
  );
};

/* steelWood: { winOnWord, strikeOnWord } — STEEL vs WOOD split; "WHO WON?" while both sides pulse; on "oar" the wood side wins; on "strike" a flash + the long sword drops to the sand (no blood, no injury shown). */
const SteelWood: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const wAt = at(captions, scene.winOnWord, fps, dur * 0.45);
  const sAt = at(captions, scene.strikeOnWord, fps, dur * 0.7);
  const fall = interpolate(frame, [sAt, sAt + 14], [0, 1], clamp);
  return (
    <Shake at={sAt} amount={12}>
      <AbsoluteFill style={{background: '#0f172a'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 540, height: 1920, background: frame >= wAt ? '#334155' : '#475569'}} />
        <div style={{position: 'absolute', left: 540, top: 0, width: 540, height: 1920, background: frame >= wAt ? '#ca8a04' : '#78350f'}} />
        <div style={{position: 'absolute', left: 250, top: 600 + fall * 420, width: 22, height: 520, background: '#e2e8f0', border: `5px solid ${OL}`, borderRadius: 8, rotate: `${-20 + fall * 70}deg`, transformOrigin: '11px 500px'}} />
        <div style={{position: 'absolute', left: 770, top: 600 + Math.sin(frame / 4) * 6, width: 40, height: 520, background: '#b45309', border: `5px solid ${OL}`, borderRadius: 16, rotate: '20deg'}} />
        <div style={{position: 'absolute', left: 90, top: 1180, fontFamily: DISPLAY, fontSize: 80, color: '#f8fafc'}}>STEEL</div>
        <div style={{position: 'absolute', left: 650, top: 1180, fontFamily: DISPLAY, fontSize: 80, color: '#fef3c7'}}>WOOD</div>
        <Tag text="WHO WON?" a={-5} y={330} size={72} color="#f8fafc" />
        {frame >= wAt ? <div style={{position: 'absolute', left: 600, top: 470, scale: String(spring({frame: frame - wAt, fps, config: {damping: 8}}))}}><span style={{fontFamily: DISPLAY, fontSize: 76, color: '#111', background: '#facc15', padding: '4px 22px', borderRadius: 14, border: `6px solid ${OL}`}}>WINNER</span></div> : null}
        {frame >= sAt && frame < sAt + 4 ? <AbsoluteFill style={{background: '#fff'}} /> : null}
        {frame >= sAt + 6 ? <Tag text="ONE STRIKE" a={sAt + 6} y={1040} size={70} color="#ef4444" /> : null}
        <SeriesBadge text={BADGE} />
      </AbsoluteFill>
    </Shake>
  );
};

/* kojiroReveal: { nameOnWord, winnerOnWord } — the "?" man becomes Kojirō (ponytail, purple kimono, the long sword); name card; small Musashi on the right as the winner. */
const KojiroReveal: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const nAt = at(captions, scene.nameOnWord, fps, dur * 0.2);
  const wAt = at(captions, scene.winnerOnWord, fps, dur * 0.55);
  const s = spring({frame: frame - nAt, fps, config: {damping: 9}});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 40% 45%, #ddd6fe 0%, #6d28d9 55%, #2e1065 100%)'}}>
      {frame < nAt ? <Swordsman x={360} y={780} s={1.5} hidden /> : <div style={{scale: String(0.6 + 0.4 * s)}}><Swordsman x={360} y={780} s={1.5} /></div>}
      {frame >= wAt ? <div style={{opacity: spring({frame: frame - wAt, fps, config: {damping: 14}})}}><Swordsman x={800} y={900} s={0.7} hair="knot" sword="oar" kimono="#1e3a8a" /></div> : null}
      <Tag text="THE LOSER" a={-5} y={330} size={60} color="#f8fafc" />
      {frame >= nAt ? <Tag text="SASAKI KOJIRŌ" a={nAt} y={1070} size={96} color="#facc15" rot={-2} /> : null}
      {frame >= wAt ? <Tag text="WINNER: MIYAMOTO MUSASHI" a={wAt} y={450} size={50} rot={2} /> : null}
      {frame >= nAt + 10 ? <div style={{position: 'absolute', left: 60, right: 160, top: 1215, textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 36, color: '#f5f3ff'}}>⚔️ the real man behind a Record of Ragnarok fighter</div> : null}
      <SeriesBadge text={BADGE} />
      <Syn x={860} y={640} size={150} pose="shock" from={Math.round(nAt + 6)} to={dur} />
    </AbsoluteFill>
  );
};

/* islandName: { legendOnWord, nameOnWord, sendOnWord } — back to the hook's island at dawn: "LEGEND · WRITTEN DOWN LONG AFTER";
   the sign now reads GANRYŪJIMA (after Kojirō's Ganryū style); silent send line + daily pill; loops into "1612". */
const IslandName: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lAt = at(captions, scene.legendOnWord, fps, 10);
  const nAt = at(captions, scene.nameOnWord, fps, dur * 0.5);
  const send = at(captions, scene.sendOnWord, fps, dur * 0.7);
  return (
    <Sea>
      <Island />
      {frame >= nAt ? (
        <div style={{position: 'absolute', left: 430, top: 760, scale: String(spring({frame: frame - nAt, fps, config: {damping: 9}}))}}>
          <div style={{width: 12, height: 110, background: OL, marginLeft: 110}} />
          <div style={{position: 'absolute', left: -10, top: -14, padding: '6px 18px', background: '#fef3c7', border: `5px solid ${OL}`, borderRadius: 10, fontFamily: DISPLAY, fontSize: 46, color: '#111'}}>GANRYŪJIMA</div>
        </div>
      ) : null}
      {frame >= lAt ? <Tag text="📜 LEGEND · WRITTEN DOWN LONG AFTER" a={lAt} y={330} size={44} color="#f8fafc" /> : null}
      {frame >= nAt + 6 ? <div style={{position: 'absolute', left: 60, right: 160, top: 1010, textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 34, color: '#ecfeff'}}>named after Kojirō's sword style, Ganryū</div> : null}
      {frame >= send ? <div style={{position: 'absolute', left: 50, right: 150, top: 470, textAlign: 'center', lineHeight: 1.5}}><span style={{fontFamily: BODY, fontWeight: 900, fontSize: 42, color: '#111', background: '#86efac', padding: '8px 22px', borderRadius: 14, border: `5px solid ${OL}`}}>📤 Send this to the friend who's always late, and still wins</span></div> : null}
      <DailyPill from={Math.round(send + 10)} y={1300} />
      <SeriesBadge text={BADGE} />
      <Syn x={880} y={830} size={170} pose="point" from={Math.round(dur * 0.4)} to={dur} />
    </Sea>
  );
};

export const HISTORY9_SCENES: Record<string, React.FC<SceneProps>> = {duelIsland: DuelIsland, dryingPole: DryingPole, lateRival: LateRival, steelWood: SteelWood, kojiroReveal: KojiroReveal, islandName: IslandName};
