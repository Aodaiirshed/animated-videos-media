import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {DailyPill, SeriesBadge, Syn} from '../components/Host';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* What If? #4 — you wake up with owl eyes. owlWake (hook), lockedEyes, turnPick, turnReveal, neckCost (loop). */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OL = '#1b1b22';
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);

const Tag: React.FC<{text: string; a: number; y: number; color?: string; size?: number; rot?: number}> = ({text, a, y, color = '#ffcc4d', size = 64, rot = -3}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < a) return null;
  const s = spring({frame: frame - a, fps, config: {damping: 10, stiffness: 190}});
  return (
    <div style={{position: 'absolute', left: 40, right: 140, top: y, textAlign: 'center', scale: String(1.6 - s * 0.6), rotate: `${rot}deg`}}>
      <span style={{fontFamily: DISPLAY, fontSize: size, color: '#111', background: color, padding: '4px 28px', borderRadius: 16, border: `6px solid ${OL}`, boxShadow: `0 9px 0 ${OL}`}}>{text}</span>
    </div>
  );
};

/* cartoon person's head; owl = 0..1 morphs human eyes into huge locked owl eyes */
const Head: React.FC<{x: number; y: number; s?: number; owl?: number; look?: number; turn?: number; shut?: number}> = ({x, y, s = 1, owl = 0, look = 0, turn = 0, shut = 0}) => {
  const frame = useCurrentFrame();
  const r = 26 + owl * 74; // eye radius
  const blink = shut > 0 ? shut : frame % 100 < 3 && owl < 0.5 ? 1 : 0;
  return (
    <svg width={460 * s} height={520 * s} viewBox="0 0 460 520" style={{position: 'absolute', left: x, top: y, overflow: 'visible'}}>
      <g transform={`rotate(${turn} 230 260)`}>
        <ellipse cx={230} cy={250} rx={190} ry={215} fill="#f2c79b" stroke={OL} strokeWidth={8} />
        <path d="M44 210 Q60 30 230 30 Q400 30 416 210 Q380 110 230 100 Q90 110 44 210 Z" fill="#5a3b2a" stroke={OL} strokeWidth={8} strokeLinejoin="round" />
        <circle cx={44} cy={270} r={30} fill="#f2c79b" stroke={OL} strokeWidth={8} /><circle cx={416} cy={270} r={30} fill="#f2c79b" stroke={OL} strokeWidth={8} />
        {[140, 320].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={235} r={r} fill={owl > 0.3 ? '#ffb000' : '#fff'} stroke={OL} strokeWidth={7} />
            {owl > 0.3 ? <circle cx={cx} cy={235} r={r + 10} fill="none" stroke="#d6cbb4" strokeWidth={10} strokeDasharray="14 8" /> : null}
            <circle cx={cx + look * (owl > 0.3 ? 0 : 10)} cy={238} r={r * 0.55} fill={OL} />
            <circle cx={cx + 10 + look * (owl > 0.3 ? 0 : 10)} cy={226} r={r * 0.16} fill="#fff" />
            {blink > 0 ? <rect x={cx - r - 6} y={235 - r - 6} width={2 * r + 12} height={(2 * r + 12) * blink} rx={r} fill="#f2c79b" stroke={OL} strokeWidth={6} /> : null}
          </g>
        ))}
        <path d="M222 300 Q230 330 240 300" stroke={OL} strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d={owl > 0.5 ? 'M180 380 Q230 400 280 380' : 'M190 375 Q230 400 270 375'} stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
};

const Orange: React.FC<{x: number; y: number; a: number}> = ({x, y, a}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < a) return null;
  const s = spring({frame: frame - a, fps, config: {damping: 9}});
  return (
    <svg width={220} height={240} viewBox="0 0 220 240" style={{position: 'absolute', left: x, top: y, scale: String(s)}}>
      <circle cx={110} cy={130} r={95} fill="#ff8a1f" stroke={OL} strokeWidth={8} />
      <path d="M110 40 q20 -30 50 -26 q-10 30 -50 26 Z" fill="#3cae5c" stroke={OL} strokeWidth={6} />
      <circle cx={80} cy={100} r={14} fill="#ffb366" />
    </svg>
  );
};

const Room: React.FC<{children?: React.ReactNode; tint?: string; win?: boolean}> = ({children, tint = '#2b3a67', win}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${tint} 0%, #172040 100%)`}}>
    {win ? <><div style={{position: 'absolute', left: 700, top: 320, width: 260, height: 300, background: '#f6d78b', border: `10px solid ${OL}`, borderRadius: 12, opacity: 0.9}} />
    <div style={{position: 'absolute', left: 820, top: 320, width: 10, height: 300, background: OL}} /></> : null}
    {children}
  </AbsoluteFill>
);

/* owlWake: { owlOnWord, orangeOnWord, badge } — HOOK: a sleeper in bed opens their eyes; they swell into giant owl eyes; an orange pops in for scale. Badge only after 2 s. */
const OwlWake: React.FC<SceneProps> = ({scene, captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const oAt = at(captions, scene.owlOnWord, fps, 10);
  const rAt = at(captions, scene.orangeOnWord, fps, 60);
  const owl = spring({frame: frame - oAt, fps, config: {damping: 9, stiffness: 160}});
  return (
    <Room win>
      <div style={{position: 'absolute', left: 40, right: 40, top: 1030, height: 230, background: '#e85d75', border: `10px solid ${OL}`, borderRadius: 40}} />
      <div style={{position: 'absolute', left: 60, top: 980, width: 380, height: 120, background: '#fff', border: `8px solid ${OL}`, borderRadius: 60}} />
      <Head x={140} y={500} s={1.15} owl={owl} shut={frame < oAt ? 1 : 0} />
      <Orange x={790} y={720} a={rAt} />
      {frame >= rAt ? <div style={{position: 'absolute', left: 760, top: 960, width: 280, textAlign: 'center', fontFamily: DISPLAY, fontSize: 52, color: '#ffcc4d'}}>EACH EYE</div> : null}
      <Tag text="OWL EYES" a={oAt} y={330} size={84} />
      <SeriesBadge text={(scene.badge as string) ?? 'WHAT IF? #4'} from={60} />
    </Room>
  );
};

/* lockedEyes: { lockOnWord, headOnWord } — close-up: bone rings lock the eyes (they can't slide left); on "head" the whole head turns instead. */
const LockedEyes: React.FC<SceneProps> = ({scene, captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lAt = at(captions, scene.lockOnWord, fps, 10);
  const hAt = at(captions, scene.headOnWord, fps, 60);
  const turn = interpolate(frame, [hAt, hAt + 14], [0, -24], clamp);
  const jiggle = frame > lAt && frame < hAt ? Math.sin(frame / 2) * 2 : 0;
  return (
    <Room tint="#3b2a55">
      <Head x={100 + jiggle} y={430} s={1.9} owl={1} turn={turn} />
      <Tag text="🔒 LOCKED IN BONE" a={lAt} y={320} size={64} color="#ff6b6b" rot={2} />
      {frame >= hAt ? <div style={{position: 'absolute', left: 60, top: 1180, fontFamily: DISPLAY, fontSize: 80, color: '#fff'}}>⬅ WHOLE HEAD</div> : null}
    </Room>
  );
};

/* rotation dial: sweeps from 0 to `deg` */
const Dial: React.FC<{deg: number; x: number; y: number; size?: number; color?: string}> = ({deg, x, y, size = 520, color = '#ffcc4d'}) => {
  const c = size / 2, R = size / 2 - 30;
  const a = (deg - 90) * Math.PI / 180;
  const large = deg > 180 ? 1 : 0;
  const ex = c + R * Math.cos(a), ey = c + R * Math.sin(a);
  return (
    <svg width={size} height={size} style={{position: 'absolute', left: x, top: y}}>
      <circle cx={c} cy={c} r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={34} />
      {deg > 1 ? <path d={`M${c} ${c - R} A${R} ${R} 0 ${large} 1 ${ex} ${ey}`} fill="none" stroke={color} strokeWidth={34} strokeLinecap="round" /> : null}
    </svg>
  );
};

/* turnPick: { question, options[], pauseOnWord } — pause-and-pick: how far can an owl turn its head? */
const TurnPick: React.FC<SceneProps> = ({scene, captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pAt = at(captions, scene.pauseOnWord, fps, 0);
  const opts = (scene.options as string[]) ?? [];
  return (
    <Room tint="#24335e">
      <div style={{position: 'absolute', left: 60, right: 140, top: 330, textAlign: 'center', fontFamily: DISPLAY, fontSize: 70, color: '#fff', lineHeight: 1.05}}>{scene.question as string}</div>
      {opts.map((o, i) => {
        const s = spring({frame: frame - 4 - i * 5, fps, config: {damping: 13}});
        return (
          <div key={i} style={{position: 'absolute', left: 160, width: 760, top: 560 + i * 170, height: 140, background: '#fff', border: `7px solid ${OL}`, borderRadius: 26, boxShadow: `0 10px 0 ${OL}`, display: 'flex', alignItems: 'center', gap: 34, paddingLeft: 44, opacity: s, translate: `${(1 - s) * 70}px 0`}}>
            <span style={{fontFamily: DISPLAY, fontSize: 66, color: '#3fd3c6'}}>{'ABC'[i]}</span>
            <span style={{fontFamily: DISPLAY, fontSize: 80, color: OL}}>{o}</span>
          </div>
        );
      })}
      {frame >= pAt ? <Tag text="❚❚ PAUSE & PICK" a={pAt} y={1100} size={56} /> : null}
    </Room>
  );
};

/* turnReveal: { revealOnWord } — dial sweeps to 270°, an owl silhouette spins its head; Syn shocked (twist). */
const TurnReveal: React.FC<SceneProps> = ({scene, captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rAt = at(captions, scene.revealOnWord, fps, 20);
  const deg = interpolate(frame, [rAt - 4, rAt + 22], [0, 270], clamp);
  return (
    <Room tint="#24335e">
      <Dial deg={deg} x={280} y={420} />
      <svg width={260} height={300} viewBox="0 0 260 300" style={{position: 'absolute', left: 410, top: 530}}>
        <ellipse cx={130} cy={220} rx={90} ry={80} fill="#8a6a4a" stroke={OL} strokeWidth={7} />
        <g transform={`rotate(${deg} 130 110)`}>
          <circle cx={130} cy={110} r={80} fill="#a07d58" stroke={OL} strokeWidth={7} />
          <circle cx={98} cy={100} r={26} fill="#ffb000" stroke={OL} strokeWidth={5} /><circle cx={162} cy={100} r={26} fill="#ffb000" stroke={OL} strokeWidth={5} />
          <circle cx={98} cy={102} r={12} fill={OL} /><circle cx={162} cy={102} r={12} fill={OL} />
          <path d="M120 130 L140 130 L130 150 Z" fill="#e8963d" stroke={OL} strokeWidth={4} />
        </g>
      </svg>
      <Tag text={`${Math.round(deg)}°`} a={rAt - 4} y={1000} size={110} color="#3fd3c6" />
      <Syn x={130} y={1080} size={210} pose="shock" from={Math.round(rAt + 10)} to={9999} />
    </Room>
  );
};

/* neckCost: { pinchOnWord, shutOnWord } — your 7 neck bones vs the owl's 14; red arteries pinch; then the sleeper shuts their owl eyes (loop back to the hook). */
const NeckCost: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pAt = at(captions, scene.pinchOnWord, fps, dur * 0.5);
  const sAt = at(captions, scene.shutOnWord, fps, dur * 0.8);
  const pinch = interpolate(frame, [pAt, pAt + 12], [0, 1], clamp);
  const shut = interpolate(frame, [sAt, sAt + 8], [0, 1], clamp);
  const Stack: React.FC<{x: number; n: number; label: string; color: string; d: number}> = ({x, n, label, color, d}) => (
    <div style={{position: 'absolute', left: x, top: 380, width: 300, textAlign: 'center'}}>
      <div style={{fontFamily: DISPLAY, fontSize: 60, color: '#fff'}}>{label}</div>
      {new Array(n).fill(0).map((_, i) => {
        const s = spring({frame: frame - d - i * 2, fps, config: {damping: 14}});
        return <div key={i} style={{margin: '6px auto 0', width: 150, height: n > 10 ? 26 : 52, background: color, border: `5px solid ${OL}`, borderRadius: 10, scale: String(s)}} />;
      })}
      <div style={{fontFamily: DISPLAY, fontSize: 96, color, marginTop: 6}}>{n}</div>
    </div>
  );
  return (
    <Room tint="#3a2440">
      {frame < sAt - 4 ? (
        <>
          <Stack x={120} n={7} label="YOU" color="#f2c79b" d={2} />
          <Stack x={620} n={14} label="OWL" color="#c9a26b" d={12} />
          {frame >= pAt ? (
            <svg width={300} height={560} style={{position: 'absolute', left: 120, top: 450}}>
              <path d={`M110 0 Q${110 + pinch * 40} 280 110 560`} stroke="#e11d48" strokeWidth={14} fill="none" />
              <path d={`M190 0 Q${190 - pinch * 40} 280 190 560`} stroke="#e11d48" strokeWidth={14} fill="none" />
              {pinch > 0.9 ? <text x={150} y={300} textAnchor="middle" fontSize={90}>💥</text> : null}
            </svg>
          ) : null}
          {frame >= pAt ? <Tag text="ARTERIES PINCHED" a={pAt} y={1120} size={58} color="#ff6b6b" /> : null}
        </>
      ) : (
        <>
          <div style={{position: 'absolute', left: 40, right: 40, top: 1030, height: 230, background: '#e85d75', border: `10px solid ${OL}`, borderRadius: 40}} />
          <div style={{position: 'absolute', left: 60, top: 980, width: 380, height: 120, background: '#fff', border: `8px solid ${OL}`, borderRadius: 60}} />
          <Head x={140} y={500} s={1.15} owl={1} shut={shut} />
        </>
      )}
      <DailyPill from={Math.round(dur * 0.35)} to={Math.round(sAt - 4)} y={300} />
      <Syn x={760} y={1080} size={200} pose="point" from={Math.round(sAt)} to={dur} />
    </Room>
  );
};

export const WHATIF4_SCENES: Record<string, React.FC<SceneProps>> = {owlWake: OwlWake, lockedEyes: LockedEyes, turnPick: TurnPick, turnReveal: TurnReveal, neckCost: NeckCost};
