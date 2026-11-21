import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {DailyPill, SeriesBadge, Syn} from '../components/Host';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* Guess Who: History #10 — Albert Einstein turns down the presidency of Israel (Nov 1952).
   Original cartoons only; no real emblems or photos. Identity lock: the man is a dark "?" silhouette until the reveal.
   letterHook (Arm A: payoff picture first — the letter + "HE SAID NO."), emptyChair, patentDesk, fiveChars, replyLetter, einsteinReveal (loops to "1952."). */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OL = '#1a120b';
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);
const BADGE = 'GUESS WHO: HISTORY #10';
const NIGHT = 'radial-gradient(circle at 50% 38%, #fde68a 0%, #b45309 26%, #1c1917 70%)';

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

/* Desk with a lamp glow (hook + last scene share it → clean loop). */
const Desk: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: NIGHT}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1080, height: 840, background: '#57351c', borderTop: `8px solid ${OL}`}} />
    {children}
  </AbsoluteFill>
);

/* The official letter: cream paper, a generic blue ribbon seal (no real emblem), "PRESIDENT?" line. */
const Letter: React.FC<{x: number; y: number; s?: number; rot?: number; stamp?: number}> = ({x, y, s = 1, rot = 0, stamp = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 420 * s, height: 540 * s, rotate: `${rot}deg`, background: '#fffbeb', border: `${6 * s}px solid ${OL}`, borderRadius: 14 * s, boxShadow: `0 ${14 * s}px 0 rgba(0,0,0,0.35)`}}>
    <div style={{position: 'absolute', left: 30 * s, top: 34 * s, width: 90 * s, height: 90 * s, borderRadius: 45 * s, background: '#1d4ed8', border: `${5 * s}px solid ${OL}`}} />
    {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{position: 'absolute', left: 30 * s, right: 30 * s, top: (170 + i * 50) * s, height: 12 * s, borderRadius: 6 * s, background: '#d6d3d1'}} />)}
    <div style={{position: 'absolute', left: 0, right: 0, top: 430 * s, textAlign: 'center', fontFamily: DISPLAY, fontSize: 54 * s, color: '#1d4ed8'}}>PRESIDENT?</div>
    {stamp > 0 ? <div style={{position: 'absolute', left: 70 * s, top: 190 * s, rotate: '-14deg', scale: String(1.8 - stamp * 0.8), opacity: stamp, padding: `${6 * s}px ${30 * s}px`, border: `${10 * s}px solid #dc2626`, borderRadius: 18 * s, fontFamily: DISPLAY, fontSize: 120 * s, color: '#dc2626'}}>NO</div> : null}
  </div>
);

/* The man before the reveal: a dark silhouette from behind with a big "?" (no face, no hair). */
const Mystery: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 300 * s, height: 420 * s}}>
    <div style={{position: 'absolute', left: 80 * s, top: 0, width: 140 * s, height: 150 * s, borderRadius: '50%', background: '#0c0a09'}} />
    <div style={{position: 'absolute', left: 20 * s, top: 130 * s, width: 260 * s, height: 290 * s, borderRadius: `${120 * s}px ${120 * s}px ${30 * s}px ${30 * s}px`, background: '#0c0a09'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 10 * s, textAlign: 'center', fontFamily: DISPLAY, fontSize: 120 * s, color: '#fbbf24'}}>?</div>
  </div>
);

/* Original cartoon of an elderly scientist: wild white hair, moustache, grey jumper (shown only at the reveal). */
const Scientist: React.FC<{x: number; y: number; s?: number; tongue?: boolean}> = ({x, y, s = 1, tongue}) => (
  <svg width={340 * s} height={460 * s} viewBox="0 0 340 460" style={{position: 'absolute', left: x, top: y, overflow: 'visible'}}>
    <path d="M40 460 Q40 300 170 290 Q300 300 300 460 Z" fill="#9ca3af" stroke={OL} strokeWidth={7} />
    <path d="M60 120 Q20 60 70 40 Q80 0 140 20 Q190 -10 230 25 Q300 20 290 90 Q330 130 290 160 L60 160 Q20 150 60 120Z" fill="#f8fafc" stroke={OL} strokeWidth={6} />
    <ellipse cx={170} cy={175} rx={92} ry={108} fill="#f2c9a0" stroke={OL} strokeWidth={7} />
    <path d="M60 140 Q40 110 70 100 M280 140 Q300 110 270 100" stroke={OL} strokeWidth={6} fill="#f8fafc" />
    <circle cx={135} cy={160} r={9} fill={OL} /><circle cx={205} cy={160} r={9} fill={OL} />
    <path d="M110 135 Q135 122 155 133 M185 133 Q205 122 230 135" stroke={OL} strokeWidth={6} fill="none" />
    <path d="M118 222 Q170 196 222 222 Q200 238 170 230 Q140 238 118 222Z" fill="#e5e7eb" stroke={OL} strokeWidth={5} />
    {tongue ? <path d="M155 236 Q170 270 185 236Z" fill="#f472b6" stroke={OL} strokeWidth={4} /> : <path d="M150 246 Q170 256 190 246" stroke={OL} strokeWidth={5} fill="none" />}
  </svg>
);

/* letterHook (Arm A): frame 0 = the letter already sliding onto the desk under the lamp, a hand-stamped red "NO" slams on at 1.2 s;
   top text "OFFERED A COUNTRY." → "HE SAID NO." */
const LetterHook: React.FC<SceneProps> = ({durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const slide = interpolate(frame, [0, 22], [180, 0], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const stamp = spring({frame: frame - 36, fps, config: {damping: 9, stiffness: 220}});
  return (
    <Desk>
      <Letter x={310 + slide} y={560 - slide * 0.3} rot={-6 + slide * 0.04} stamp={frame >= 36 ? stamp : 0} />
      <div style={{position: 'absolute', left: 0, right: 140, top: 330, textAlign: 'center', fontFamily: DISPLAY, fontSize: 86, color: '#fff7ed', lineHeight: 1}}>{frame < 36 ? 'OFFERED A COUNTRY.' : <span>HE SAID <span style={{color: '#f87171'}}>NO.</span></span>}</div>
      {frame >= 60 ? <SeriesBadge text={BADGE} /> : null}
    </Desk>
  );
};

/* emptyChair: { chairOnWord } — a grand empty chair under a spotlight, "WANTED: PRESIDENT"; the silhouette waits at the side, shaking its head. */
const EmptyChair: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const nAt = at(captions, scene.notOnWord, fps, dur * 0.6);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #fef9c3 0%, #a16207 30%, #1c1917 72%)'}}>
      <div style={{position: 'absolute', left: 330, top: 640, width: 300, height: 520}}>
        <div style={{position: 'absolute', left: 30, top: 0, width: 240, height: 300, borderRadius: '120px 120px 20px 20px', background: '#7f1d1d', border: `8px solid ${OL}`}} />
        <div style={{position: 'absolute', left: 0, top: 280, width: 300, height: 70, borderRadius: 18, background: '#991b1b', border: `8px solid ${OL}`}} />
        <div style={{position: 'absolute', left: 20, top: 340, width: 26, height: 180, background: '#ca8a04', border: `6px solid ${OL}`}} />
        <div style={{position: 'absolute', left: 254, top: 340, width: 26, height: 180, background: '#ca8a04', border: `6px solid ${OL}`}} />
      </div>
      <Tag text="WANTED: PRESIDENT" a={2} y={350} size={70} color="#fde68a" />
      <div style={{rotate: frame >= nAt ? `${Math.sin(frame / 2.5) * 6}deg` : '0deg', transformOrigin: '780px 1100px'}}><Mystery x={680} y={760} s={0.85} /></div>
      {frame >= nAt ? <Tag text="NOT A POLITICIAN" a={nAt} y={1180} size={58} color="#fca5a5" rot={2} /> : null}
    </AbsoluteFill>
  );
};

/* patentDesk: { ageOnWord, physicsOnWord } — 1905: a clerk's desk piled with patent papers (stamped APPROVED/REJECTED);
   on "physics" scribbles and a clock with bending hands float up. Tags "1905 · PATENT OFFICE" and "AGE 26". */
const PatentDesk: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pAt = at(captions, scene.physicsOnWord, fps, dur * 0.6);
  const aAt = at(captions, scene.ageOnWord, fps, dur * 0.85);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#e7e5e4 0%, #a8a29e 60%, #57534e 100%)'}}>
      <div style={{position: 'absolute', left: 80, right: 80, top: 1000, height: 60, background: '#78350f', border: `7px solid ${OL}`, borderRadius: 10}} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{position: 'absolute', left: 150 + (i % 3) * 230, top: 760 - Math.floor(i / 3) * 120 - (frame > i * 4 ? 0 : 400), width: 200, height: 240, background: '#fffbeb', border: `5px solid ${OL}`, rotate: `${(i % 2 ? 4 : -5)}deg`}}>
          <div style={{margin: 20, fontFamily: DISPLAY, fontSize: 30, color: i % 2 ? '#b91c1c' : '#15803d', border: `4px solid currentColor`, borderRadius: 8, textAlign: 'center'}}>{i % 2 ? 'REJECTED' : 'APPROVED'}</div>
        </div>
      ))}
      {frame >= pAt ? (
        <div style={{position: 'absolute', left: 200, top: 430, width: 680, padding: 20, background: '#fffbeb', border: `6px solid ${OL}`, borderRadius: 20, opacity: spring({frame: frame - pAt, fps, config: {damping: 14}}), translate: `0px ${-Math.min(40, (frame - pAt) * 1.5)}px`}}>
          <svg width="640" height="220" viewBox="0 0 640 220">
            <circle cx="110" cy="110" r="90" fill="#fff" stroke={OL} strokeWidth="7" />
            <path d="M110 110 Q120 60 112 32" stroke={OL} strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M110 110 Q150 120 168 150" stroke="#dc2626" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M240 60 q40 -40 80 0 t80 0 M240 120 h120 M400 120 q30 -30 60 0 M240 170 q60 30 120 0 t120 0" stroke={OL} strokeWidth="7" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      ) : null}
      <Tag text="1905 · A PATENT OFFICE" a={4} y={300} size={58} color="#fde68a" />
      {frame >= aAt ? <Tag text="AGE 26" a={aAt} y={1120} size={80} color="#86efac" rot={3} /> : null}
    </AbsoluteFill>
  );
};

/* fiveChars: { revealOnWord } — a chalkboard with five empty boxes that fill one by one; the formula appears on "five". */
const FiveChars: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rAt = at(captions, scene.revealOnWord, fps, dur * 0.35);
  const chars = ['E', '=', 'm', 'c', '²'];
  return (
    <AbsoluteFill style={{background: '#1f2937'}}>
      <div style={{position: 'absolute', left: 60, right: 60, top: 560, height: 520, background: '#14532d', border: `14px solid #92400e`, borderRadius: 18}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 700, display: 'flex', justifyContent: 'center', gap: 22}}>
        {chars.map((c, i) => {
          const a = rAt + i * 6;
          const s = spring({frame: frame - a, fps, config: {damping: 10}});
          return (
            <div key={i} style={{width: 150, height: 200, border: '6px dashed #d1fae5', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {frame >= a ? <span style={{fontFamily: DISPLAY, fontSize: 150, color: '#f0fdf4', scale: String(s)}}>{c}</span> : null}
            </div>
          );
        })}
      </div>
      <Tag text="5 CHARACTERS" a={2} y={350} size={70} color="#fde68a" />
      {frame >= rAt + 36 ? <div style={{position: 'absolute', left: 60, right: 160, top: 1130, textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 50, color: '#e5e7eb'}}>mass and energy: two sides of one thing</div> : null}
    </AbsoluteFill>
  );
};

/* replyLetter: { ageOnWord, whyOnWord } — his handwritten reply on the desk, paraphrased on screen ("not good with people"); tag "AGE 73". */
const ReplyLetter: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const aAt = at(captions, scene.ageOnWord, fps, 6);
  const wAt = at(captions, scene.whyOnWord, fps, dur * 0.45);
  const write = interpolate(frame, [wAt, wAt + 40], [0, 1], clamp);
  return (
    <Desk>
      <div style={{position: 'absolute', left: 180, top: 560, width: 640, height: 470, background: '#fffbeb', border: `6px solid ${OL}`, borderRadius: 14, rotate: '3deg'}}>
        <div style={{position: 'absolute', left: 40, top: 40, right: 40, fontFamily: BODY, fontStyle: 'italic', fontWeight: 700, fontSize: 44, color: '#1e3a8a', lineHeight: 1.35, clipPath: `inset(0 ${100 - write * 100}% 0 0)`}}>
          Deeply moved… but I lack the experience to deal properly with people.
        </div>
        <div style={{position: 'absolute', right: 40, bottom: 30, fontFamily: BODY, fontWeight: 800, fontSize: 30, color: '#57534e'}}>reply, Nov 1952 (paraphrased)</div>
      </div>
      {frame >= aAt ? <Tag text="AGE 73" a={aAt} y={350} size={80} color="#fde68a" /> : null}
      <Mystery x={720} y={940} s={0.7} />
    </Desk>
  );
};

/* einsteinReveal: { nameOnWord, sendOnWord } — the silhouette pops into the original cartoon scientist; name card; send line; daily pill; loops into "1952." */
const EinsteinReveal: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const nAt = at(captions, scene.nameOnWord, fps, dur * 0.3);
  const sAt = at(captions, scene.sendOnWord, fps, dur * 0.65);
  const pop = spring({frame: frame - nAt, fps, config: {damping: 9}});
  return (
    <Desk>
      <Letter x={90} y={620} s={0.42} rot={-10} stamp={1} />
      {frame < nAt ? <Mystery x={320} y={620} s={1.2} /> : <div style={{scale: String(0.6 + 0.4 * pop), transformOrigin: '500px 900px'}}><Scientist x={300} y={600} s={1.1} tongue={frame > nAt + 40} /></div>}
      {frame >= nAt ? <Tag text="ALBERT EINSTEIN" a={nAt} y={1150} size={92} color="#facc15" rot={-2} /> : null}
      {frame >= nAt + 8 ? <div style={{position: 'absolute', left: 60, right: 160, top: 1292, textAlign: 'center', whiteSpace: 'nowrap'}}><span style={{fontFamily: BODY, fontWeight: 800, fontSize: 36, color: '#fff7ed', background: 'rgba(0,0,0,0.55)', padding: '6px 18px', borderRadius: 12}}>said no to Israel's presidency · 1952</span></div> : null}
      {frame >= sAt ? <div style={{position: 'absolute', left: 50, right: 150, top: 340, textAlign: 'center', lineHeight: 1.5}}><span style={{fontFamily: BODY, fontWeight: 900, fontSize: 42, color: '#111', background: '#86efac', padding: '8px 22px', borderRadius: 14, border: `5px solid ${OL}`}}>📤 Send this to the friend who's a genius but hates being in charge</span></div> : null}
      <DailyPill from={Math.round(sAt + 10)} y={520} />
      <SeriesBadge text={BADGE} />
      <Syn x={790} y={860} size={190} pose="shock" from={Math.round(nAt + 6)} to={dur} />
    </Desk>
  );
};

export const HISTORY10_SCENES: Record<string, React.FC<SceneProps>> = {letterHook: LetterHook, emptyChair: EmptyChair, patentDesk: PatentDesk, fiveChars: FiveChars, replyLetter: ReplyLetter, einsteinReveal: EinsteinReveal};
