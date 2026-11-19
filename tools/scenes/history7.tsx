import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Camera, Shake} from '../components/Fx';
import {DailyPill, SeriesBadge, Syn} from '../components/Host';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* Guess Who: History #7 — Cher Ami, the pigeon that saved the Lost Battalion (Oct 1918).
   forestTrap (hook), messengersDown, lastFlight, pigeonReveal, noteStop, woodenLeg. The messenger stays a "?" shape until the reveal. */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OL = '#14110f';
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);
const BADGE = 'GUESS WHO: HISTORY #7';

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

/* the hidden messenger: a dark blob with a question mark */
const Mystery: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <div style={{position: 'absolute', left: x - 50 * s, top: y - 50 * s, width: 100 * s, height: 100 * s, borderRadius: 50 * s, background: '#1f2937', border: `5px solid #f8fafc`, color: '#f8fafc', fontFamily: DISPLAY, fontSize: 70 * s, lineHeight: `${90 * s}px`, textAlign: 'center', rotate: `${rot}deg`}}>?</div>
);

/* original cartoon pigeon */
export const Pigeon: React.FC<{x: number; y: number; s?: number; flap?: number; oneLeg?: boolean; woodLeg?: boolean; patch?: boolean}> = ({x, y, s = 1, flap = 0, oneLeg, woodLeg, patch}) => (
  <svg width={300 * s} height={260 * s} viewBox="0 0 300 260" style={{position: 'absolute', left: x - 150 * s, top: y - 130 * s, overflow: 'visible'}}>
    <path d="M40 150 L0 130 L10 170 Z" fill="#4b5563" stroke={OL} strokeWidth={5} />
    <ellipse cx={140} cy={150} rx={105} ry={70} fill="#9ca3af" stroke={OL} strokeWidth={6} />
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M${90 + i * 26} ${125 + (i % 2) * 14} l14 10`} stroke={OL} strokeWidth={6} strokeLinecap="round" />)}
    <g transform={`rotate(${-flap * 50} 150 120)`}><path d="M110 120 Q160 60 230 110 Q170 130 110 140 Z" fill="#6b7280" stroke={OL} strokeWidth={5} /></g>
    <ellipse cx={220} cy={100} rx={30} ry={40} fill="#4b7a6b" stroke={OL} strokeWidth={5} />
    <circle cx={235} cy={70} r={34} fill="#9ca3af" stroke={OL} strokeWidth={6} />
    {patch ? <><rect x={230} y={58} width={24} height={20} rx={6} fill={OL} /><line x1={205} y1={56} x2={268} y2={70} stroke={OL} strokeWidth={4} /></> : <><circle cx={244} cy={66} r={9} fill="#f97316" /><circle cx={246} cy={66} r={4} fill={OL} /></>}
    <path d="M266 74 L290 82 L266 88 Z" fill="#fbbf24" stroke={OL} strokeWidth={4} />
    <line x1={120} y1={215} x2={115} y2={250} stroke="#f43f5e" strokeWidth={8} strokeLinecap="round" />
    {oneLeg ? null : <line x1={160} y1={215} x2={165} y2={250} stroke="#f43f5e" strokeWidth={8} strokeLinecap="round" />}
    {woodLeg ? <rect x={155} y={212} width={14} height={40} rx={4} fill="#a16207" stroke={OL} strokeWidth={4} /> : null}
  </svg>
);

const Forest: React.FC<{children?: React.ReactNode; shell?: number}> = ({children, shell = 0}) => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg,#3f3a2e 0%, #1c1a14 100%)'}}>
    {new Array(9).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: i * 130 - 20, top: 380 + (i % 3) * 40, width: 34, height: 1000, background: '#2a241b', border: `4px solid ${OL}`}} />)}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1150, bottom: 0, background: '#2d2a1f'}} />
    {shell > 0 ? <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, background: `rgba(255,140,40,${shell * 0.35})`}} /> : null}
    {children}
  </AbsoluteFill>
);

const Soldiers: React.FC<{n?: number; y?: number}> = ({n = 7, y = 1010}) => (
  <>
    {new Array(n).fill(0).map((_, i) => (
      <svg key={i} width={110} height={170} viewBox="0 0 110 170" style={{position: 'absolute', left: 90 + i * 130, top: y + (i % 2) * 30}}>
        <path d="M20 40 Q55 5 90 40 Z" fill="#4d5b3a" stroke={OL} strokeWidth={5} />
        <circle cx={55} cy={55} r={22} fill="#d6b08a" stroke={OL} strokeWidth={5} />
        <rect x={25} y={78} width={60} height={80} rx={14} fill="#5b6b45" stroke={OL} strokeWidth={5} />
      </svg>
    ))}
  </>
);

/* forestTrap: { shellOnWord, ownOnWord, top } — HOOK: soldiers pinned in a ravine; shells fall; "OWN ARMY" stamp. Badge after 2 s. */
const ForestTrap: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sAt = at(captions, scene.shellOnWord, fps, 20);
  const oAt = at(captions, scene.ownOnWord, fps, dur * 0.6);
  const shells = [0, 1, 2, 3].map((i) => sAt + i * 9);
  const flash = shells.reduce((m, s) => Math.max(m, frame >= s && frame < s + 8 ? 1 - (frame - s) / 8 : 0), 0);
  return (
    <Shake at={oAt} amount={10}>
      <Forest shell={flash}>
        {shells.map((s, i) => frame >= s ? <div key={i} style={{position: 'absolute', left: 150 + i * 220, top: 900 + (i % 2) * 60, width: 160, height: 160, borderRadius: 80, background: 'radial-gradient(circle,#fde047,#f97316 50%,transparent 70%)', opacity: Math.max(0, 1 - (frame - s) / 20), scale: String(0.5 + (frame - s) / 15)}} /> : null)}
        <Soldiers />
        <Tag text={(scene.top as string) ?? '1918 · TRAPPED IN A FOREST'} a={0} y={330} size={58} color="#f8fafc" rot={2} />
        <Tag text="🎯 SHELLED BY THEIR OWN ARMY" a={oAt} y={460} size={52} color="#ef4444" />
      </Forest>
      <SeriesBadge text={BADGE} from={60} />
    </Shake>
  );
};

/* messengersDown: { oneOnWord, twoOnWord, leftOnWord } — two "?" messengers fly up and fall; one left in a cage. */
const MessengersDown: React.FC<SceneProps> = ({scene, captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a1 = at(captions, scene.oneOnWord, fps, 6);
  const a2 = at(captions, scene.twoOnWord, fps, 40);
  const lAt = at(captions, scene.leftOnWord, fps, 70);
  const flyFall = (a: number, x: number) => {
    const t = frame - a;
    if (t < 0) return null;
    const up = interpolate(t, [0, 12], [1000, 520], clamp);
    const fall = interpolate(t, [12, 30], [0, 600], clamp);
    return <>
      <Mystery x={x} y={up + fall} rot={t > 12 ? (t - 12) * 25 : 0} />
      {t >= 12 && t < 20 ? <div style={{position: 'absolute', left: x - 40, top: 470, fontFamily: DISPLAY, fontSize: 90, color: '#ef4444'}}>✗</div> : null}
    </>;
  };
  return (
    <Forest>
      <Soldiers n={5} y={1050} />
      {flyFall(a1, 300)}
      {flyFall(a2, 700)}
      {frame >= lAt ? <>
        <div style={{position: 'absolute', left: 390, top: 700, width: 300, height: 260, border: '10px solid #a16207', borderRadius: 30, backgroundImage: 'repeating-linear-gradient(90deg,#a16207 0 8px,transparent 8px 50px)'}} />
        <Mystery x={540} y={830} s={1.2} />
        <Tag text="1 LEFT" a={lAt} y={1000} size={80} />
      </> : null}
      <SeriesBadge text={BADGE} />
    </Forest>
  );
};

/* lastFlight: { hitOnWord, upOnWord, milesOnWord } — the last messenger is hit, drops, rises and races a 25-mile counter. */
const LastFlight: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const hAt = at(captions, scene.hitOnWord, fps, 10);
  const uAt = at(captions, scene.upOnWord, fps, 40);
  const mAt = at(captions, scene.milesOnWord, fps, dur * 0.55);
  let y = interpolate(frame, [0, hAt], [1000, 650], clamp);
  if (frame >= hAt) y = interpolate(frame, [hAt, hAt + 10], [650, 980], clamp);
  if (frame >= uAt) y = interpolate(frame, [uAt, uAt + 20], [980, 560], clamp);
  const x = frame >= uAt ? interpolate(frame, [uAt, dur], [300, 760], clamp) : 300;
  const miles = interpolate(frame, [mAt - 6, mAt + 24], [0, 25], clamp);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#475569 0%, #1e293b 100%)'}}>
      {new Array(12).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: ((i * 173 - frame * 9) % 1300 + 1300) % 1300 - 100, top: 420 + (i % 4) * 160, width: 140, height: 6, background: 'rgba(255,255,255,0.25)'}} />)}
      {frame >= hAt && frame < hAt + 8 ? <AbsoluteFill style={{background: 'rgba(239,68,68,0.45)'}} /> : null}
      <Mystery x={x} y={y} s={1.1} rot={frame >= hAt && frame < uAt ? 120 : 0} />
      {frame >= hAt ? <div style={{position: 'absolute', left: x + 50, top: y - 60, fontSize: 60}}>🩸</div> : null}
      <div style={{position: 'absolute', left: 0, right: 140, top: 1060, textAlign: 'center', fontFamily: DISPLAY, fontSize: 150, color: '#fde047', WebkitTextStroke: `8px ${OL}`, paintOrder: 'stroke fill'}}>{frame >= mAt - 6 ? `${Math.round(miles)} MILES` : ''}</div>
      <Tag text="SHOT. FELL. GOT BACK UP." a={uAt} y={330} size={56} color="#f8fafc" />
      <SeriesBadge text={BADGE} />
    </AbsoluteFill>
  );
};

/* pigeonReveal: { revealOnWord, name } — the "?" cracks open into a pigeon; name card. */
const PigeonReveal: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rAt = at(captions, scene.revealOnWord, fps, 30);
  const nAt = at(captions, scene.nameOnWord, fps, dur * 0.7);
  const s = spring({frame: frame - rAt, fps, config: {damping: 9}});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #fde68a 0%, #b45309 55%, #451a03 100%)'}}>
      {frame < rAt ? <Mystery x={540} y={760} s={2.4} /> : <div style={{scale: String(s)}}><Pigeon x={540} y={760} s={2} flap={Math.abs(Math.sin(frame / 4))} /></div>}
      {frame >= rAt ? <Tag text="A PIGEON 🕊️" a={rAt} y={330} size={80} color="#f8fafc" /> : null}
      {frame >= nAt ? <Tag text="CHER AMI" a={nAt} y={1060} size={110} color="#facc15" rot={2} /> : null}
      <SeriesBadge text={BADGE} />
      <Syn x={150} y={1180} size={220} pose="shock" from={Math.round(rAt + 6)} to={dur} />
    </AbsoluteFill>
  );
};

/* noteStop: { stopOnWord, menOnWord } — the real 1918 note on paper; shelling stops; "194 WALKED OUT". */
const NoteStop: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sAt = at(captions, scene.stopOnWord, fps, dur * 0.55);
  const mAt = at(captions, scene.menOnWord, fps, dur * 0.8);
  const unroll = interpolate(frame, [0, 14], [0, 1], clamp);
  const lines = (scene.note as string[]) ?? ['OUR OWN ARTILLERY IS', 'DROPPING A BARRAGE', 'DIRECTLY ON US.', "FOR HEAVEN'S SAKE", 'STOP IT.'];
  return (
    <AbsoluteFill style={{background: '#1c1a14'}}>
      <div style={{position: 'absolute', left: 110, width: 860, top: 330, height: 640 * unroll, overflow: 'hidden', background: '#f5ecd2', border: `8px solid ${OL}`, borderRadius: 12, rotate: '-2deg'}}>
        {lines.map((l, i) => <div key={i} style={{fontFamily: BODY, fontWeight: 800, fontSize: 52, color: '#3b2f1e', margin: '22px 40px 0', opacity: frame > 8 + i * 6 ? 1 : 0}}>{l}</div>)}
        <div style={{position: 'absolute', right: 40, bottom: 26, fontFamily: BODY, fontSize: 34, color: '#7c6a4a'}}>— Oct 4, 1918</div>
      </div>
      {frame >= sAt ? <Tag text="🔇 THE SHELLING STOPPED" a={sAt} y={1010} size={56} color="#86efac" /> : null}
      {frame >= mAt ? <Tag text="194 MEN WALKED OUT" a={mAt} y={1130} size={66} color="#facc15" rot={2} /> : null}
      <SeriesBadge text={BADGE} />
    </AbsoluteFill>
  );
};

/* woodenLeg: { legOnWord, museumOnWord } — the one-eyed pigeon gets a tiny wooden leg, then stands in a museum case. Loops to "1918". */
const WoodenLeg: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lAt = at(captions, scene.legOnWord, fps, 20);
  const mAt = at(captions, scene.museumOnWord, fps, dur * 0.55);
  const glass = interpolate(frame, [mAt, mAt + 12], [0, 1], clamp);
  return (
    <Camera dur={dur} from={1.04} to={1.0}>
      <AbsoluteFill style={{background: glass > 0 ? `linear-gradient(180deg,#e5e7eb ${0}%, #9ca3af 100%)` : '#3f3a2e'}} />
      <div style={{position: 'absolute', left: 340, top: 1020, width: 400, height: 90, background: '#7c2d12', border: `6px solid ${OL}`, borderRadius: 10}} />
      <Pigeon x={540} y={880} s={1.7} oneLeg woodLeg={frame >= lAt} patch />
      {glass > 0 ? <div style={{position: 'absolute', left: 300, top: 560, width: 480, height: 560, border: '8px solid rgba(255,255,255,0.9)', background: 'rgba(186,230,253,0.18)', opacity: glass, borderRadius: 8}} /> : null}
      {frame >= lAt ? <Tag text="🪵 A TINY WOODEN LEG" a={lAt} y={330} size={58} color="#fde68a" /> : null}
      {frame >= mAt ? <Tag text="🏛️ NOW IN THE SMITHSONIAN" a={mAt} y={450} size={56} color="#f8fafc" rot={2} /> : null}
      <DailyPill from={Math.round(mAt + 6)} y={1180} />
      <Syn x={830} y={1150} size={190} pose="point" from={Math.round(dur * 0.7)} to={dur} />
    </Camera>
  );
};

export const HISTORY7_SCENES: Record<string, React.FC<SceneProps>> = {forestTrap: ForestTrap, messengersDown: MessengersDown, pigeonFlight: LastFlight, pigeonReveal: PigeonReveal, noteStop: NoteStop, woodenLeg: WoodenLeg};
