import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Camera, Shake} from '../components/Fx';
import {DailyPill, SeriesBadge, Syn} from '../components/Host';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* Guess Who: History #8 — Qin Shi Huang (Ragnarok's Real Humans). Original cartoons only.
   qinWell (hook), qinArmy, qinFaces, qinBoyKing, qinFear, qinShips, qinPills, qinReveal, qinTomb (loops to "1974"). */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OL = '#1a120b';
const CLAY = '#b7774a';
const CLAY_D = '#8a5332';
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);
const BADGE = 'GUESS WHO: HISTORY #8';

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

/* a clay warrior; face varies by seed (brows, moustache, mouth) */
const Warrior: React.FC<{x: number; y: number; s?: number; seed?: number; eyesOpen?: boolean}> = ({x, y, s = 1, seed = 0, eyesOpen = false}) => {
  const m = seed % 4;
  const b = (seed >> 2) % 3;
  return (
    <svg width={160 * s} height={300 * s} viewBox="0 0 160 300" style={{position: 'absolute', left: x - 80 * s, top: y - 150 * s, overflow: 'visible'}}>
      <rect x={30} y={120} width={100} height={170} rx={18} fill={CLAY_D} stroke={OL} strokeWidth={6} />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={34} x2={126} y1={145 + i * 28} y2={145 + i * 28} stroke={OL} strokeWidth={4} />)}
      <circle cx={80} cy={78} r={48} fill={CLAY} stroke={OL} strokeWidth={6} />
      <path d={b === 0 ? 'M48 30 Q80 0 112 30 L104 40 L56 40 Z' : b === 1 ? 'M50 36 L80 6 L110 36 Z' : 'M46 40 Q80 10 114 40 Q100 30 80 32 Q60 30 46 40 Z'} fill="#6b3f24" stroke={OL} strokeWidth={5} />
      {eyesOpen ? <><circle cx={64} cy={74} r={6} fill={OL} /><circle cx={96} cy={74} r={6} fill={OL} /></> : <><line x1={56} x2={72} y1={74} y2={74} stroke={OL} strokeWidth={5} strokeLinecap="round" /><line x1={88} x2={104} y1={74} y2={74} stroke={OL} strokeWidth={5} strokeLinecap="round" /></>}
      <line x1={54} x2={72} y1={b === 2 ? 60 : 64} y2={64} stroke={OL} strokeWidth={5} />
      <line x1={88} x2={106} y1={64} y2={b === 2 ? 60 : 64} stroke={OL} strokeWidth={5} />
      {m === 0 ? <path d="M60 100 Q80 90 100 100" stroke={OL} strokeWidth={5} fill="none" /> : null}
      {m === 1 ? <path d="M58 96 Q70 104 80 96 Q90 104 102 96" stroke={OL} strokeWidth={5} fill="none" /> : null}
      {m === 2 ? <><path d="M62 104 L98 104" stroke={OL} strokeWidth={5} /><path d="M70 112 L80 120 L90 112" stroke={OL} strokeWidth={4} fill="none" /></> : null}
      {m === 3 ? <path d="M64 104 Q80 114 96 104" stroke={OL} strokeWidth={5} fill="none" /> : null}
    </svg>
  );
};

/* the hidden emperor: a robed silhouette with a "?" face */
const Hidden: React.FC<{x: number; y: number; s?: number; shake?: number}> = ({x, y, s = 1, shake = 0}) => (
  <svg width={260 * s} height={380 * s} viewBox="0 0 260 380" style={{position: 'absolute', left: x - 130 * s + shake, top: y - 190 * s, overflow: 'visible'}}>
    <path d="M40 380 Q50 170 130 160 Q210 170 220 380 Z" fill="#111827" stroke="#facc15" strokeWidth={6} />
    <rect x={70} y={20} width={120} height={22} rx={4} fill="#111827" stroke="#facc15" strokeWidth={5} />
    {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={82 + i * 24} x2={82 + i * 24} y1={42} y2={70} stroke="#facc15" strokeWidth={4} />)}
    <circle cx={130} cy={100} r={58} fill="#1f2937" stroke="#facc15" strokeWidth={6} />
    <text x={130} y={126} textAnchor="middle" fontFamily={DISPLAY} fontSize={74} fill="#facc15">?</text>
  </svg>
);

/* the emperor, revealed — original cartoon: black robe, flat crown with bead strings */
const Emperor: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <svg width={260 * s} height={380 * s} viewBox="0 0 260 380" style={{position: 'absolute', left: x - 130 * s, top: y - 190 * s, overflow: 'visible'}}>
    <path d="M40 380 Q50 170 130 160 Q210 170 220 380 Z" fill="#111827" stroke={OL} strokeWidth={6} />
    <path d="M130 170 L130 380" stroke="#b91c1c" strokeWidth={14} />
    <circle cx={130} cy={100} r={58} fill="#e8b98a" stroke={OL} strokeWidth={6} />
    <rect x={62} y={20} width={136} height={22} rx={4} fill="#111827" stroke={OL} strokeWidth={5} />
    {[0, 1, 2, 3, 4].map((i) => <g key={i}><line x1={76 + i * 27} x2={76 + i * 27} y1={42} y2={74} stroke="#facc15" strokeWidth={3} />{[0, 1, 2].map((k) => <circle key={k} cx={76 + i * 27} cy={50 + k * 10} r={3.5} fill="#facc15" />)}</g>)}
    <path d="M100 96 L118 92" stroke={OL} strokeWidth={5} strokeLinecap="round" />
    <path d="M142 92 L160 96" stroke={OL} strokeWidth={5} strokeLinecap="round" />
    <circle cx={110} cy={106} r={6} fill={OL} /><circle cx={150} cy={106} r={6} fill={OL} />
    <path d="M112 136 Q130 126 148 136" stroke={OL} strokeWidth={5} fill="none" />
    <path d="M118 128 Q130 122 142 128" stroke={OL} strokeWidth={4} fill="none" />
  </svg>
);

const Field: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg,#f6c66b 0%, #e59a4a 45%, #8a5a2b 46%, #6b4423 100%)'}}>
    <div style={{position: 'absolute', left: 620, top: 260, width: 150, height: 150, borderRadius: 75, background: '#fff3c4', opacity: 0.9}} />
    {children}
  </AbsoluteFill>
);

/* qinWell: { faceOnWord } — HOOK. Frame 0: farmers already digging, "1974 · CHINA". At ~1.2 s a hard punch-in cut to the hole; on "face" a clay face rises from the dirt. */
const QinWell: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cut = 36;
  const fAt = at(captions, scene.faceOnWord, fps, dur * 0.7);
  const dig = Math.sin(frame / 3.2);
  const rise = interpolate(frame, [fAt - 4, fAt + 10], [160, 0], clamp);
  const wide = frame < cut;
  return (
    <Shake at={fAt} amount={9}>
      <Field>
        <div style={{position: 'absolute', inset: 0, scale: wide ? '1' : '1.9', transformOrigin: '540px 1000px'}}>
          <div style={{position: 'absolute', left: 380, top: 960, width: 320, height: 90, borderRadius: '50%', background: '#2b1a0e', border: `6px solid ${OL}`}} />
          {[0, 1].map((i) => (
            <svg key={i} width={200} height={360} viewBox="0 0 200 360" style={{position: 'absolute', left: i ? 640 : 230, top: 650, overflow: 'visible', transform: i ? 'scaleX(-1)' : undefined}}>
              <circle cx={90} cy={60} r={36} fill="#3b2a1c" stroke={OL} strokeWidth={5} />
              <path d="M40 40 L140 40 L90 10 Z" fill="#d4b483" stroke={OL} strokeWidth={5} />
              <rect x={56} y={96} width={70} height={140} rx={16} fill="#3f5a7a" stroke={OL} strokeWidth={5} />
              <g transform={`rotate(${dig * 18 + (i ? 10 : 0)} 120 140)`}>
                <line x1={120} y1={110} x2={170} y2={300} stroke="#7c4a1e" strokeWidth={10} strokeLinecap="round" />
                <path d="M152 290 L190 300 L176 340 L140 330 Z" fill="#9ca3af" stroke={OL} strokeWidth={4} />
              </g>
            </svg>
          ))}
          {new Array(6).fill(0).map((_, i) => {
            const t = (frame + i * 7) % 24;
            return <div key={i} style={{position: 'absolute', left: 470 + i * 26, top: 970 - t * 6, width: 22, height: 22, borderRadius: 11, background: '#8a5a2b', opacity: 1 - t / 24}} />;
          })}
          {frame >= fAt - 4 ? <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, clipPath: 'inset(0 0 905px 0)'}}><Warrior x={540} y={1045 + rise} s={0.8} seed={1} eyesOpen /></div> : null}
        </div>
        <Tag text="1974 · CHINA" a={-12} y={330} size={66} color="#f8fafc" rot={2} />
        {frame >= fAt ? <Tag text="A CLAY FACE 😳" a={fAt} y={450} size={58} /> : null}
      </Field>
      <SeriesBadge text={BADGE} from={60} />
    </Shake>
  );
};

/* qinArmy: { thousandsOnWord, yearsOnWord } — warriors pop up row by row; "THOUSANDS" + "BURIED 2,000+ YEARS". */
const QinArmy: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tAt = at(captions, scene.thousandsOnWord, fps, dur * 0.35);
  const yAt = at(captions, scene.yearsOnWord, fps, dur * 0.75);
  const rows = [0, 1, 2, 3];
  return (
    <Camera dur={dur} from={1.12} to={1.0}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#5a3a22 0%, #3a2414 100%)'}} />
      {rows.map((r) => new Array(6 + r).fill(0).map((_, i) => {
        const appear = r === 0 && i === 2 ? 0 : tAt + (r * 6 + i) * 1.5;
        if (frame < appear) return null;
        const p = spring({frame: frame - appear, fps, config: {damping: 12}});
        const n = 6 + r;
        const sc = 0.45 + r * 0.17;
        return <div key={`${r}-${i}`} style={{translate: `0 ${(1 - p) * 120}px`}}><Warrior x={540 + (i - (n - 1) / 2) * (120 + r * 30)} y={620 + r * 150} s={sc} seed={r * 7 + i * 3} /></div>;
      }))}
      <Tag text="THEN THOUSANDS" a={tAt} y={330} size={66} color="#f8fafc" />
      {frame >= yAt ? <Tag text="BURIED 2,000+ YEARS" a={yAt} y={1180} size={62} rot={2} /> : null}
      <SeriesBadge text={BADGE} />
    </Camera>
  );
};

/* qinFaces: { oneManOnWord } — 4 big faces cycle (all different), then the hidden robed "?" figure rises behind them. */
const QinFaces: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const oAt = at(captions, scene.oneManOnWord, fps, dur * 0.6);
  const up = spring({frame: frame - oAt, fps, config: {damping: 14}});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #7a4a2a 0%, #24140b 80%)'}}>
      {frame >= oAt ? <div style={{translate: `0 ${(1 - up) * 400}px`}}><Hidden x={540} y={820} s={1.7} /></div> : null}
      {[0, 1, 2, 3].map((i) => {
        const a = 4 + i * 7;
        if (frame < a) return null;
        const p = spring({frame: frame - a, fps, config: {damping: 10}});
        return <div key={i} style={{opacity: frame >= oAt ? 0.35 : 1, scale: String(p)}}><Warrior x={200 + i * 230} y={1000} s={0.85} seed={i * 5 + 2} /></div>;
      })}
      <Tag text="EVERY FACE: DIFFERENT" a={4} y={330} size={58} color="#f8fafc" />
      {frame >= oAt ? <Tag text="MADE FOR ONE MAN" a={oAt} y={450} size={62} rot={2} /> : null}
      <SeriesBadge text={BADGE} />
    </AbsoluteFill>
  );
};

/* qinBoyKing: { kingOnWord, conquerOnWord } — age counter 13 → 38; seven coloured kingdoms on a map turn one colour. */
const QinBoyKing: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const kAt = at(captions, scene.kingOnWord, fps, 10);
  const cAt = at(captions, scene.conquerOnWord, fps, dur * 0.6);
  const age = Math.round(interpolate(frame, [cAt - 20, cAt + 10], [13, 38], clamp));
  const cols = ['#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#f97316', '#14b8a6', '#111827'];
  const cells = [[200, 560], [420, 520], [640, 560], [300, 760], [540, 740], [760, 760], [470, 940]];
  return (
    <AbsoluteFill style={{background: '#f3e3c2'}}>
      {cells.map(([x, y], i) => {
        const flip = frame >= cAt + i * 3;
        return <div key={i} style={{position: 'absolute', left: x - 110, top: y - 90, width: 220, height: 180, borderRadius: 40, background: flip ? '#111827' : cols[i], border: `6px solid ${OL}`, rotate: `${(i % 3 - 1) * 6}deg`, opacity: 0.92}} />;
      })}
      <div style={{position: 'absolute', left: 0, right: 140, top: 1080, textAlign: 'center', fontFamily: DISPLAY, fontSize: 130, color: '#facc15', WebkitTextStroke: `8px ${OL}`, paintOrder: 'stroke fill'}}>AGE {age}</div>
      <Tag text="👑 KING AT 13" a={kAt} y={330} size={62} color="#f8fafc" />
      {frame >= cAt ? <Tag text="7 KINGDOMS → 1" a={cAt} y={1240} size={58} rot={2} /> : null}
      <SeriesBadge text={BADGE} />
    </AbsoluteFill>
  );
};

/* qinFear: { dyingOnWord } — the hidden ruler alone in the dark; an hourglass drains; he shakes. Syn reacts. */
const QinFear: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dAt = at(captions, scene.dyingOnWord, fps, dur * 0.6);
  const sand = interpolate(frame, [0, dur], [1, 0.15], clamp);
  const shake = frame >= dAt ? Math.sin(frame * 2.3) * 6 : 0;
  return (
    <Shake at={dAt} amount={8}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #1f2937 0%, #030712 80%)'}}>
        <Hidden x={380} y={820} s={1.4} shake={shake} />
        <svg width={220} height={340} viewBox="0 0 220 340" style={{position: 'absolute', left: 690, top: 650}}>
          <path d="M20 10 L200 10 L120 170 L200 330 L20 330 L100 170 Z" fill="rgba(186,230,253,0.15)" stroke="#e5e7eb" strokeWidth={8} />
          <path d={`M${110 - 80 * sand} ${150 - 130 * sand} L${110 + 80 * sand} ${150 - 130 * sand} L110 165 Z`} fill="#facc15" />
          <path d={`M${110 - 70 * (1 - sand)} 320 L${110 + 70 * (1 - sand)} 320 L110 ${320 - 140 * (1 - sand)} Z`} fill="#facc15" />
          <line x1={110} y1={165} x2={110} y2={320} stroke="#facc15" strokeWidth={3} />
        </svg>
        {frame >= dAt ? <Tag text="DYING ☠️" a={dAt} y={360} size={90} color="#ef4444" /> : <Tag text="AFRAID OF ONE THING…" a={2} y={360} size={56} color="#f8fafc" />}
        <SeriesBadge text={BADGE} />
        <Syn x={150} y={1180} size={200} pose="shock" from={Math.round(dAt + 4)} to={dur} />
      </AbsoluteFill>
    </Shake>
  );
};

/* qinShips: { goneOnWord } — ships sail toward a glowing island of immortals; on "never" they fade into fog. */
const QinShips: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const gAt = at(captions, scene.goneOnWord, fps, dur * 0.7);
  const fade = interpolate(frame, [gAt, gAt + 14], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#0f172a 0%, #1e3a8a 50%, #0c4a6e 51%, #082f49 100%)'}}>
      <div style={{position: 'absolute', left: 640, top: 760, width: 300, height: 120, borderRadius: '50%', background: '#16a34a', border: `6px solid ${OL}`, boxShadow: `0 0 ${60 + 20 * Math.sin(frame / 5)}px #fde047`}} />
      <div style={{position: 'absolute', left: 740, top: 690, fontSize: 80}}>✨</div>
      {[0, 1, 2].map((i) => {
        const x = interpolate(frame, [0, dur], [80 + i * 90, 520 + i * 60], clamp);
        return (
          <svg key={i} width={200} height={180} viewBox="0 0 200 180" style={{position: 'absolute', left: x, top: 900 + i * 70 + Math.sin(frame / 6 + i) * 8, opacity: fade}}>
            <path d="M10 120 L190 120 L160 170 L40 170 Z" fill="#7c2d12" stroke={OL} strokeWidth={5} />
            <line x1={100} y1={120} x2={100} y2={20} stroke={OL} strokeWidth={6} />
            <path d="M104 26 L170 70 L104 108 Z" fill="#fef3c7" stroke={OL} strokeWidth={5} />
          </svg>
        );
      })}
      <AbsoluteFill style={{background: `rgba(203,213,225,${(1 - fade) * 0.55})`}} />
      <Tag text="🏝️ ISLAND OF IMMORTALS?" a={4} y={330} size={56} color="#f8fafc" />
      {frame >= gAt ? <Tag text="NEVER CAME BACK" a={gAt} y={450} size={66} color="#ef4444" rot={2} /> : null}
      <SeriesBadge text={BADGE} />
    </AbsoluteFill>
  );
};

/* qinPills: { mercuryOnWord, poisonOnWord } — a tray of "forever" pills; quick question, then a silver drop: MERCURY, then POISON. */
const QinPills: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const mAt = at(captions, scene.mercuryOnWord, fps, dur * 0.55);
  const pAt = at(captions, scene.poisonOnWord, fps, dur * 0.8);
  const drop = interpolate(frame, [mAt - 6, mAt + 8], [400, 860], clamp);
  return (
    <Shake at={pAt} amount={10}>
      <AbsoluteFill style={{background: frame >= pAt ? 'radial-gradient(circle,#3f1d1d 0%, #0b0505 80%)' : 'radial-gradient(circle,#3b2a12 0%, #120c05 80%)'}}>
        <div style={{position: 'absolute', left: 160, top: 900, width: 760, height: 90, borderRadius: '50%', background: '#a16207', border: `6px solid ${OL}`}} />
        {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{position: 'absolute', left: 250 + i * 120, top: 860 + Math.sin(frame / 7 + i) * 4, width: 86, height: 86, borderRadius: 43, background: frame >= mAt ? 'radial-gradient(circle at 35% 35%,#f8fafc,#94a3b8 60%,#475569)' : '#b45309', border: `5px solid ${OL}`}} />)}
        {frame >= mAt - 6 && frame < mAt + 30 ? <div style={{position: 'absolute', left: 505, top: drop - 60, width: 70, height: 95, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: 'radial-gradient(circle at 35% 35%,#ffffff,#94a3b8 60%,#334155)', border: `4px solid ${OL}`}} /> : null}
        <Tag text="PILLS TO LIVE FOREVER?" a={2} y={330} size={58} color="#f8fafc" />
        {frame >= mAt ? <Tag text="MERCURY" a={mAt} y={1060} size={100} color="#cbd5e1" rot={2} /> : null}
        {frame >= pAt ? <Tag text="☠️ POISON" a={pAt} y={460} size={80} color="#ef4444" /> : null}
        <SeriesBadge text={BADGE} />
      </AbsoluteFill>
    </Shake>
  );
};

/* qinReveal: { revealOnWord, nameOnWord } — the "?" ruler turns into the emperor; FIRST EMPEROR OF CHINA; name card; Ragnarok context tag. */
const QinReveal: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rAt = at(captions, scene.revealOnWord, fps, dur * 0.35);
  const nAt = at(captions, scene.nameOnWord, fps, dur * 0.7);
  const s = spring({frame: frame - rAt, fps, config: {damping: 9}});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #fde68a 0%, #b45309 55%, #450a0a 100%)'}}>
      {frame < rAt ? <Hidden x={540} y={780} s={1.7} /> : <div style={{scale: String(s)}}><Emperor x={540} y={780} s={1.7} /></div>}
      <Tag text="DIED AT 49" a={2} y={330} size={58} color="#f8fafc" />
      {frame >= rAt ? <Tag text="FIRST EMPEROR OF CHINA" a={rAt} y={450} size={58} rot={2} /> : null}
      {frame >= nAt ? <Tag text="QIN SHI HUANG" a={nAt} y={1100} size={100} color="#facc15" rot={-2} /> : null}
      {frame >= nAt + 8 ? <div style={{position: 'absolute', left: 60, right: 160, top: 1250, textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 36, color: '#fff7ed'}}>⚔️ the real man behind a Record of Ragnarok fighter</div> : null}
      <SeriesBadge text={BADGE} />
      <Syn x={150} y={1180} size={190} pose="shock" from={Math.round(rAt + 6)} to={dur} />
    </AbsoluteFill>
  );
};

/* qinTomb: { sealedOnWord, sendOnWord } — the sealed tomb mound with silver rivers glinting below; clay army guarding; silent SEND line + daily pill. Loops into "1974". */
const QinTomb: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sAt = at(captions, scene.sealedOnWord, fps, 14);
  const send = at(captions, scene.sendOnWord, fps, dur * 0.45);
  return (
    <Camera dur={dur} from={1.0} to={1.06}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#f6c66b 0%, #e59a4a 45%, #8a5a2b 46%, #6b4423 100%)'}} />
      <div style={{position: 'absolute', left: 200, top: 640, width: 680, height: 260, borderRadius: '50% 50% 0 0', background: '#4d7c0f', border: `8px solid ${OL}`}} />
      <div style={{position: 'absolute', left: 300, top: 960, width: 480, height: 140, background: '#2b1a0e', border: `6px solid ${OL}`, borderRadius: 20, overflow: 'hidden'}}>
        {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: ((frame * 4 + i * 160) % 640) - 160, top: 30 + i * 36, width: 140, height: 10, borderRadius: 5, background: '#e2e8f0', opacity: 0.8}} />)}
      </div>
      {[0, 1, 2, 3].map((i) => <Warrior key={i} x={200 + i * 230} y={1180} s={0.55} seed={i * 3 + 1} />)}
      {frame >= sAt ? <Tag text="🔒 STILL SEALED TODAY" a={sAt} y={330} size={60} color="#f8fafc" /> : null}
      {frame >= send ? <div style={{position: 'absolute', left: 50, right: 150, top: 470, textAlign: 'center', lineHeight: 1.5}}><span style={{fontFamily: BODY, fontWeight: 900, fontSize: 42, color: '#111', background: '#86efac', padding: '8px 22px', borderRadius: 14, border: `5px solid ${OL}`}}>📤 Send this to the friend who'd try anything to stay young</span></div> : null}
      <DailyPill from={Math.round(send + 10)} y={1300} />
      <Syn x={880} y={830} size={170} pose="point" from={Math.round(dur * 0.55)} to={dur} />
    </Camera>
  );
};

export const HISTORY8_SCENES: Record<string, React.FC<SceneProps>> = {qinWell: QinWell, qinArmy: QinArmy, qinFaces: QinFaces, qinBoyKing: QinBoyKing, qinFear: QinFear, qinShips: QinShips, qinPills: QinPills, qinReveal: QinReveal, qinTomb: QinTomb};
