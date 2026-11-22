import React, {createContext, useContext} from 'react';
import {useCurrentFrame} from 'remotion';

export type ToonPalette = {skin: string; hair: string; shirt: string; shorts: string; boots: string; socks?: string; torn?: boolean};
export type HeroCtx = {hair?: 'long' | 'short'; style?: 'silhouette' | 'cartoon'; heroSkin?: string; toon?: ToonPalette};
export const HeroStyle = createContext<HeroCtx>({hair: 'long'});
export type Mood = 'happy' | 'laugh' | 'sad' | 'cry' | 'shock' | 'neutral' | 'determined';

// The recurring anonymous protagonist. ALWAYS render the hero through this component so
// he looks identical in every scene: same hair, shirt cut, proportions and rim-light colour.
// `stage` changes age (child -> adult) without changing identity. Face is never drawn.
export type BoyProps = {
  x: number; // centre, px
  y: number; // feet baseline, px
  height: number; // px
  stage?: 'child' | 'teen' | 'adult';
  pose?: 'stand' | 'run' | 'kick' | 'cheer';
  phase?: number; // animation phase (radians) for run/kick cycles
  skin?: string;
  rim?: string;
  flip?: boolean;
  glow?: number; // 0..1 rim-light intensity
  hair?: 'long' | 'short';
  mood?: Mood;
  /* Rig v2 (all optional; leaving them out renders exactly as before) */
  lean?: number; // torso lean in degrees (+ = forward/right)
  headTilt?: number; // head tilt in degrees
  look?: number; // -1..1 head-turn + eye direction
  squash?: number; // 1 = normal; <1 squashes (impact), >1 stretches (jump)
  arms?: [number, number]; // override shoulder angles [left, right] in degrees (0 = down, 180 = up)
};

export const Boy: React.FC<BoyProps> = ({
  x, y, height, stage = 'child', pose = 'stand', phase = 0,
  skin = '#0b0b10', rim = '#ffb347', flip, glow = 0.8, hair, mood, lean, headTilt, look: lk, squash, arms,
}) => {
  const ctx = useContext(HeroStyle);
  if (ctx.style === 'cartoon') {
    return <Toon {...{x, y, height, stage, pose, phase, skin, rim, flip, glow, hair, mood, lean, headTilt, look: lk, squash, arms}} />;
  }
  const hairStyle = hair ?? ctx.hair ?? 'long';
  const headR = stage === 'child' ? 15 : stage === 'teen' ? 13 : 11.5; // child = bigger head ratio
  const legL = stage === 'child' ? 38 : stage === 'teen' ? 44 : 48;
  const s = Math.sin(phase);
  const legA = pose === 'run' ? s * 34 : pose === 'kick' ? Math.max(0, s) * 70 - 10 : 4;
  const legB = pose === 'run' ? -s * 34 : -6;
  const armA = pose === 'run' ? -s * 40 : pose === 'kick' ? -30 : pose === 'cheer' ? 155 + s * 10 : 8;
  const armB = pose === 'run' ? s * 40 : pose === 'kick' ? 40 : pose === 'cheer' ? 155 - s * 10 : -8;
  const bob = pose === 'run' ? Math.abs(Math.cos(phase)) * 3 : 0;
  const scale = height / 130;
  const limb = {stroke: skin, strokeWidth: 9, strokeLinecap: 'round' as const, fill: 'none'};

  return (
    <svg
      style={{position: 'absolute', left: x - 60 * scale, top: y - 130 * scale, overflow: 'visible',
        filter: `drop-shadow(0 0 ${6 + glow * 14}px ${rim}) drop-shadow(0 0 2px ${rim})`}}
      width={120 * scale} height={130 * scale} viewBox="0 0 120 130"
    >
      <g transform={`translate(60 ${130 - legL - bob}) ${flip ? 'scale(-1 1)' : ''}`}>
        {/* legs */}
        <path d={`M-4 0 l${Math.sin((legA * Math.PI) / 180) * legL} ${Math.cos((legA * Math.PI) / 180) * legL}`} {...limb} />
        <path d={`M4 0 l${Math.sin((legB * Math.PI) / 180) * legL} ${Math.cos((legB * Math.PI) / 180) * legL}`} {...limb} />
        {/* oversized shirt torso */}
        <path d={`M-13 -40 Q0 -46 13 -40 L15 2 Q0 6 -15 2 Z`} fill={skin} />
        {/* arms */}
        <path d={`M-11 -36 l${-Math.sin((armA * Math.PI) / 180) * 30} ${Math.cos((armA * Math.PI) / 180) * 30}`} {...limb} strokeWidth={7} />
        <path d={`M11 -36 l${Math.sin((armB * Math.PI) / 180) * 30} ${Math.cos((armB * Math.PI) / 180) * 30}`} {...limb} strokeWidth={7} />
        {/* neck + head */}
        <rect x={-3.5} y={-49} width={7} height={8} fill={skin} />
        <circle cx={0} cy={-49 - headR} r={headR} fill={skin} />
        {/* hair: 'long' = messy shoulder-length, 'short' = close-cropped curls */}
        {hairStyle === 'short' ? (
          <path d={`M${-headR - 1} ${-49 - headR + 1} Q${-headR - 2} ${-49 - headR * 2.25} 0 ${-49 - headR * 2.15} Q${headR + 2} ${-49 - headR * 2.25} ${headR + 1} ${-49 - headR + 1} Q0 ${-49 - headR * 1.55} ${-headR - 1} ${-49 - headR + 1} Z`} fill={skin} />
        ) : <path
          d={`M${-headR - 3} ${-49 - headR + 2} Q${-headR} ${-49 - headR * 2.3} 0 ${-49 - headR * 2.1}
              Q${headR + 2} ${-49 - headR * 2.3} ${headR + 4} ${-49 - headR + 4}
              L${headR + 5} ${-42} L${headR - 2} ${-47} L${headR - 4} ${-52}
              L${-headR + 3} ${-52} L${-headR + 1} ${-45} L${-headR - 5} ${-41} Z`}
          fill={skin}
        />}
      </g>
    </svg>
  );
};


/* ---------- Cartoon version v2 (character.style = "cartoon") ----------
   Chunky big-head cartoon: thick outlined limbs, shaded shirt, sleeves, shaped boots, expressive face, ground shadow.
   Same skeleton/anchor as the silhouette so every scene works unchanged. Hero = Boy whose `skin` equals the storyboard
   hero skin; everyone else gets a stable varied palette. */
const SKINS = ['#8d5524', '#c68642', '#e0ac69', '#6b4423', '#f1c27d', '#a0663a'];
const SHIRTS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#64748b', '#ec4899', '#14b8a6'];
const HAIRS = ['#1b1209', '#2b1a10', '#3a2614', '#111111'];
const hash = (str: string) => { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; };
const OL = '#1b1b22';

const Toon: React.FC<BoyProps> = ({x, y, height, stage = 'child', pose = 'stand', phase = 0, skin = '#0b0b10', rim = '#ffb347', flip, glow = 0.8, hair, mood, lean = 0, headTilt = 0, look: lk, squash = 1, arms}) => {
  const ctx = useContext(HeroStyle);
  const frame = useCurrentFrame();
  const isHero = !!ctx.heroSkin && skin === ctx.heroSkin;
  const h = hash(`${skin}${rim}${stage}`);
  const pal: ToonPalette = isHero && ctx.toon ? ctx.toon : {
    skin: SKINS[h % SKINS.length], hair: HAIRS[(h >>> 3) % HAIRS.length], shirt: SHIRTS[(h >>> 5) % SHIRTS.length],
    shorts: ['#1f2937', '#f4f4f4', '#1e3a8a', '#374151'][(h >>> 7) % 4], boots: '#222', socks: '#f4f4f4',
  };
  const torn = !!pal.torn && stage !== 'adult';
  const hairStyle = hair ?? (isHero ? ctx.hair : undefined) ?? ((h >>> 9) % 2 ? 'short' : 'long');
  const R = (stage === 'child' ? 15 : stage === 'teen' ? 13 : 11.5) * 1.42;
  const legL = stage === 'child' ? 34 : stage === 'teen' ? 40 : 45;
  const s = Math.sin(phase);
  const legA = pose === 'run' ? s * 36 : pose === 'kick' ? Math.max(0, s) * 70 - 10 : 5;
  const legB = pose === 'run' ? -s * 36 : -7;
  const armA = arms ? arms[0] : pose === 'run' ? -s * 44 : pose === 'kick' ? -30 : pose === 'cheer' ? 152 + s * 10 : 12;
  const armB = arms ? arms[1] : pose === 'run' ? s * 44 : pose === 'kick' ? 40 : pose === 'cheer' ? 152 - s * 10 : -12;
  const bob = pose === 'run' ? Math.abs(Math.cos(phase)) * 3.5 : Math.sin(frame / 14 + (h % 9)) * 0.5;
  const scale = height / 130;
  const rad = (d: number) => (d * Math.PI) / 180;
  const m: Mood = mood ?? (pose === 'cheer' ? 'laugh' : pose === 'run' || pose === 'kick' ? 'determined' : 'happy');
  const blink = (frame + (h % 60)) % 95 < 4;
  const hy = -47 - R * 0.93;
  const look = lk ?? (flip ? -1 : 1);
  const fx = lk !== undefined ? lk * R * 0.16 : 0; // face features slide = head turn
  const Leg = ({a, side}: {a: number; side: number}) => {
    const hx = side * 6;
    const ex = hx + Math.sin(rad(a)) * legL, ey = Math.cos(rad(a)) * legL;
    const mx = hx + (ex - hx) * 0.55, my = ey * 0.55;
    return (
      <g>
        <path d={`M${hx} 0 L${ex} ${ey}`} stroke={OL} strokeWidth={13} strokeLinecap="round" />
        <path d={`M${hx} 0 L${ex} ${ey}`} stroke={pal.skin} strokeWidth={10} strokeLinecap="round" />
        <path d={`M${mx} ${my} L${ex} ${ey}`} stroke={pal.socks ?? '#f4f4f4'} strokeWidth={10} strokeLinecap="butt" />
        <g transform={`translate(${ex} ${ey}) rotate(${-a * 0.5})`}>
          <path d="M-7 -4 Q-8 5 -3 6 L11 6 Q15 6 14 2 Q10 -4 3 -4 Z" fill={pal.boots} stroke={OL} strokeWidth={2.2} strokeLinejoin="round" />
          <path d="M2 -2 L7 0 M4 -3 L9 -1" stroke="#ffffff88" strokeWidth={1} />
          {torn ? <path d="M-4 1 l3 -3 l2 4 l3 -4 l2 4" stroke="#d8d8e0" strokeWidth={1.3} fill="none" /> : null}
        </g>
      </g>
    );
  };
  const Arm = ({a, side}: {a: number; side: number}) => {
    const sx0 = side * 13, sy0 = -36;
    const ex = sx0 + side * Math.sin(rad(a)) * 28, ey = sy0 + Math.cos(rad(a)) * 28;
    const sx = sx0 + (ex - sx0) * 0.38, sy = sy0 + (ey - sy0) * 0.38;
    return (
      <g>
        <path d={`M${sx0} ${sy0} L${ex} ${ey}`} stroke={OL} strokeWidth={11} strokeLinecap="round" />
        <path d={`M${sx0} ${sy0} L${ex} ${ey}`} stroke={pal.skin} strokeWidth={8} strokeLinecap="round" />
        <path d={`M${sx0} ${sy0} L${sx} ${sy}`} stroke={OL} strokeWidth={13.5} strokeLinecap="round" />
        <path d={`M${sx0} ${sy0} L${sx} ${sy}`} stroke={pal.shirt} strokeWidth={10.5} strokeLinecap="round" />
        <circle cx={ex} cy={ey} r={5.2} fill={pal.skin} stroke={OL} strokeWidth={1.8} />
      </g>
    );
  };
  const eyeY = hy + R * 0.1;
  const closed = blink || m === 'laugh';
  const eye = (ex: number) => closed ? (
    <path d={`M${ex - R * 0.24} ${eyeY + 1} Q${ex} ${eyeY - (m === 'laugh' ? R * 0.34 : 1)} ${ex + R * 0.24} ${eyeY + 1}`} stroke={OL} strokeWidth={2.2} fill="none" strokeLinecap="round" />
  ) : (
    <g>
      <ellipse cx={ex} cy={eyeY} rx={R * 0.24} ry={R * (m === 'shock' ? 0.36 : m === 'determined' ? 0.24 : 0.3)} fill="#fff" stroke={OL} strokeWidth={1.5} />
      <circle cx={ex + look * R * (lk !== undefined ? 0.08 : 0.05)} cy={eyeY + R * 0.04} r={R * 0.15} fill="#1a1208" />
      <circle cx={ex + look * R * (lk !== undefined ? 0.08 : 0.05) + R * 0.06} cy={eyeY - R * 0.05} r={R * 0.06} fill="#fff" />
    </g>
  );
  const mouthY = hy + R * 0.58;
  const sadLike = m === 'sad' || m === 'cry';
  const mouth = m === 'laugh' ? <path d={`M${-R * 0.36} ${mouthY - 2} Q0 ${mouthY + R * 0.5} ${R * 0.36} ${mouthY - 2} Z`} fill="#7a1f2b" stroke={OL} strokeWidth={1.6} strokeLinejoin="round" />
    : sadLike ? <path d={`M${-R * 0.26} ${mouthY + 2} Q0 ${mouthY - R * 0.2} ${R * 0.26} ${mouthY + 2}`} stroke={OL} strokeWidth={2} fill="none" strokeLinecap="round" />
    : m === 'shock' ? <ellipse cx={0} cy={mouthY} rx={R * 0.17} ry={R * 0.22} fill="#7a1f2b" stroke={OL} strokeWidth={1.5} />
    : m === 'determined' ? <path d={`M${-R * 0.26} ${mouthY + 0.5} Q0 ${mouthY - 1} ${R * 0.28} ${mouthY - 1.5}`} stroke={OL} strokeWidth={2.1} fill="none" strokeLinecap="round" />
    : m === 'neutral' ? <path d={`M${-R * 0.2} ${mouthY} L${R * 0.2} ${mouthY}`} stroke={OL} strokeWidth={2} strokeLinecap="round" />
    : <path d={`M${-R * 0.3} ${mouthY - 1.5} Q0 ${mouthY + R * 0.3} ${R * 0.3} ${mouthY - 1.5}`} stroke={OL} strokeWidth={2} fill="none" strokeLinecap="round" />;
  const brow = (ex: number, side: number) => {
    const tilt = sadLike ? -R * 0.13 * side : m === 'determined' ? R * 0.15 * side : 0;
    const by = eyeY - R * 0.42 - (m === 'shock' ? R * 0.12 : 0) + (m === 'determined' ? R * 0.06 : 0);
    return <path d={`M${ex - R * 0.26} ${by + tilt} L${ex + R * 0.26} ${by - tilt}`} stroke={pal.hair} strokeWidth={2.6} strokeLinecap="round" />;
  };
  const tearT = (frame % 36) / 36;
  const hairPath = hairStyle === 'short'
    ? `M${-R * 1.03} ${hy - R * 0.02} C${-R * 1.18} ${hy - R * 1.3} ${R * 1.18} ${hy - R * 1.3} ${R * 1.03} ${hy - R * 0.02} Q${R * 0.8} ${hy - R * 0.55} ${R * 0.2} ${hy - R * 0.5} Q${-R * 0.45} ${hy - R * 0.42} ${-R * 1.03} ${hy - R * 0.02} Z`
    : `M${-R * 1.12} ${hy + R * 0.38} C${-R * 1.4} ${hy - R * 1.45} ${R * 1.4} ${hy - R * 1.45} ${R * 1.12} ${hy + R * 0.38} L${R * 0.86} ${hy - R * 0.08} Q${R * 0.5} ${hy - R * 0.62} 0 ${hy - R * 0.44} Q${-R * 0.6} ${hy - R * 0.62} ${-R * 0.86} ${hy - R * 0.08} Z`;
  return (
    <svg style={{position: 'absolute', left: x - 60 * scale, top: y - 130 * scale, overflow: 'visible',
      filter: `drop-shadow(0 0 ${3 + glow * 6}px ${rim}55)`}}
      width={120 * scale} height={130 * scale} viewBox="0 0 120 130">
      <ellipse cx={60} cy={127} rx={24} ry={4.5} fill="#000" opacity={0.22} />
      <g transform={`translate(60 126) scale(${squash === 1 ? 1 : 1 + (1 - squash) * 0.6} ${squash}) translate(-60 -126)`}>
      <g transform={`translate(60 ${130 - legL - bob - 6}) ${flip ? 'scale(-1 1)' : ''}`}>
        <Leg a={legB} side={1} />
        <Leg a={legA} side={-1} />
        <g transform={lean ? `rotate(${lean} 0 4)` : undefined}>
        <path d="M-17 -5 L17 -5 L19.5 13 L3.5 13 L0 6 L-3.5 13 L-19.5 13 Z" fill={pal.shorts} stroke={OL} strokeWidth={2.4} strokeLinejoin="round" />
        {torn ? <path d="M-15 8 l3 -4 l2.5 5 l3 -4" stroke="#00000077" strokeWidth={1.4} fill="none" /> : null}
        <Arm a={armB} side={1} />
        <path d="M-16 -40 Q0 -47 16 -40 L17 -3 Q0 1 -17 -3 Z" fill={pal.shirt} stroke={OL} strokeWidth={2.4} strokeLinejoin="round" />
        <path d="M7 -43.5 Q13 -42 16 -40 L17 -3 Q12 -1.2 7 -0.8 Z" fill="#000" opacity={0.13} />
        <path d="M-6 -43.5 Q0 -37 6 -43.5" stroke={OL} strokeWidth={1.8} fill={pal.skin} />
        <Arm a={armA} side={-1} />
        <g transform={headTilt ? `rotate(${headTilt} 0 -44)` : undefined}>
        <rect x={-4.5} y={-50} width={9} height={9} fill={pal.skin} stroke={OL} strokeWidth={1.6} />
        <ellipse cx={-R * 0.98} cy={hy + R * 0.15} rx={R * 0.2} ry={R * 0.26} fill={pal.skin} stroke={OL} strokeWidth={1.6} />
        <ellipse cx={R * 0.98} cy={hy + R * 0.15} rx={R * 0.2} ry={R * 0.26} fill={pal.skin} stroke={OL} strokeWidth={1.6} />
        <ellipse cx={0} cy={hy} rx={R} ry={R * 0.96} fill={pal.skin} stroke={OL} strokeWidth={2.4} />
        <path d={`M${R * 0.3} ${hy - R * 0.9} Q${R * 1.0} ${hy - R * 0.5} ${R * 0.92} ${hy + R * 0.3} Q${R * 0.7} ${hy - R * 0.3} ${R * 0.3} ${hy - R * 0.9} Z`} fill="#000" opacity={0.08} />
        <path d={hairPath} fill={pal.hair} stroke={OL} strokeWidth={2} strokeLinejoin="round" />
        <path d={`M${-R * 0.55} ${hy - R * 0.82} Q${-R * 0.2} ${hy - R * 1.0} ${R * 0.15} ${hy - R * 0.92}`} stroke="#ffffff33" strokeWidth={2} fill="none" strokeLinecap="round" />
        <g transform={fx ? `translate(${fx} 0)` : undefined}>
        {eye(-R * 0.4)}{eye(R * 0.4)}
        {brow(-R * 0.4, -1)}{brow(R * 0.4, 1)}
        <path d={`M${-R * 0.07} ${hy + R * 0.33} q${R * 0.08} ${R * 0.08} ${R * 0.16} 0`} stroke={OL} strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.7} />
        <ellipse cx={-R * 0.62} cy={hy + R * 0.45} rx={R * 0.17} ry={R * 0.1} fill="#ff6b6b" opacity={0.3} />
        <ellipse cx={R * 0.62} cy={hy + R * 0.45} rx={R * 0.17} ry={R * 0.1} fill="#ff6b6b" opacity={0.3} />
        {mouth}
        {m === 'cry' ? <path d={`M${-R * 0.4} ${eyeY + R * 0.3 + tearT * R * 0.5} q${-R * 0.1} ${R * 0.18} 0 ${R * 0.24} q${R * 0.1} ${-R * 0.06} 0 ${-R * 0.24} Z`} fill="#7fd4ff" stroke={OL} strokeWidth={1} opacity={1 - tearT * 0.6} /> : null}
        </g>
        </g>
        </g>
      </g>
      </g>
    </svg>
  );
};
