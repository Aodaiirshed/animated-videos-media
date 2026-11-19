import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Shake} from '../components/Fx';
import {DailyPill, SeriesBadge} from '../components/Host';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* "Guess Before the Reveal" — TikTok football quiz. Original cartoon silhouettes only (no crests, kits or photos).
   quizHook, quizPlayer (reusable: clues + guess-now bar + in-video name reveal), quizScore (end, loops). */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OL = '#0b0b10';
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);

type Hair = 'bun' | 'buzz' | 'short';
/* footballer bust; dark silhouette until `lit` (0..1) turns on the cartoon colours */
const Player: React.FC<{x: number; y: number; s?: number; hair: Hair; beard?: boolean; skin: string; shirt: string; lit: number}> = ({x, y, s = 1, hair, beard, skin, shirt, lit}) => {
  const mix = (c: string) => (lit >= 1 ? c : lit <= 0 ? '#111827' : c);
  return (
    <svg width={420 * s} height={520 * s} viewBox="0 0 420 520" style={{position: 'absolute', left: x - 210 * s, top: y - 260 * s, overflow: 'visible', filter: lit < 1 ? `brightness(${0.15 + 0.85 * lit})` : undefined}}>
      <path d="M40 520 Q50 330 210 310 Q370 330 380 520 Z" fill={mix(shirt)} stroke={OL} strokeWidth={8} />
      <path d="M170 312 L210 360 L250 312" fill="none" stroke={OL} strokeWidth={8} />
      <rect x={180} y={250} width={60} height={70} fill={mix(skin)} stroke={OL} strokeWidth={8} />
      <ellipse cx={210} cy={180} rx={105} ry={120} fill={mix(skin)} stroke={OL} strokeWidth={8} />
      {hair === 'bun' ? <><path d="M105 170 Q110 60 210 55 Q310 60 315 170 Q300 110 210 105 Q120 110 105 170 Z" fill={mix('#d6b370')} stroke={OL} strokeWidth={8} /><circle cx={210} cy={40} r={36} fill={mix('#d6b370')} stroke={OL} strokeWidth={8} /></> : null}
      {hair === 'buzz' ? <path d="M108 150 Q120 62 210 60 Q300 62 312 150 Q290 100 210 98 Q130 100 108 150 Z" fill={mix('#1f1410')} stroke={OL} strokeWidth={6} /> : null}
      {hair === 'short' ? <path d="M104 175 Q100 58 210 52 Q322 58 316 175 Q300 112 250 112 Q230 90 200 110 Q140 108 104 175 Z" fill={mix('#3b2416')} stroke={OL} strokeWidth={8} /> : null}
      {beard ? <path d="M118 210 Q130 300 210 305 Q290 300 302 210 Q290 260 210 262 Q130 260 118 210 Z" fill={mix('#3b2416')} stroke={OL} strokeWidth={6} /> : null}
      {lit > 0.5 ? <>
        <circle cx={170} cy={180} r={11} fill={OL} /><circle cx={250} cy={180} r={11} fill={OL} />
        <path d="M150 150 L188 146" stroke={OL} strokeWidth={8} strokeLinecap="round" /><path d="M232 146 L270 150" stroke={OL} strokeWidth={8} strokeLinecap="round" />
        <path d="M172 236 Q210 266 248 236" stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />
      </> : <text x={210} y={215} textAnchor="middle" fontFamily={DISPLAY} fontSize={120} fill="#facc15">?</text>}
    </svg>
  );
};

const Card: React.FC<{text: string; a: number; y: number; i: number}> = ({text, a, y, i}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < a) return null;
  const s = spring({frame: frame - a, fps, config: {damping: 12, stiffness: 200}});
  const cols = ['#e0f2fe', '#fef9c3', '#dcfce7'];
  return (
    <div style={{position: 'absolute', left: 60, right: 150, top: y, translate: `${(1 - s) * -700}px 0`, display: 'flex', alignItems: 'center', gap: 18}}>
      <span style={{fontFamily: DISPLAY, fontSize: 52, color: '#111', background: '#facc15', border: `5px solid ${OL}`, borderRadius: 40, width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>{i + 1}</span>
      <span style={{fontFamily: BODY, fontWeight: 900, fontSize: 44, lineHeight: 1.15, color: '#111', background: cols[i % 3], padding: '10px 22px', borderRadius: 18, border: `5px solid ${OL}`, boxShadow: `0 7px 0 ${OL}`}}>{text}</span>
    </div>
  );
};

/* quizHook: { tag } — three "?" silhouettes pop in (already moving on frame 0); punch-in cut at 1.2 s; "CAN YOU GET 3/3?" */
const QuizHook: React.FC<SceneProps> = ({scene, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const zoom = frame < 36 ? 1 : 1.12 + (frame - 36) / dur * 0.05;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1d4ed8 0%, #0b1020 75%)'}}>
      <div style={{position: 'absolute', inset: 0, scale: String(zoom), transformOrigin: '540px 800px'}}>
        {[0, 1, 2].map((i) => {
          const p = spring({frame: frame + 8 - i * 5, fps, config: {damping: 10}});
          return <Player key={i} x={230 + i * 310} y={820 + Math.sin(frame / 8 + i) * 10} s={0.62} hair={(['bun', 'buzz', 'short'] as Hair[])[i]} skin="#e8c39e" shirt="#334155" lit={0} />;
        })}
      </div>
      <div style={{position: 'absolute', left: 40, right: 140, top: 330, textAlign: 'center', fontFamily: DISPLAY, fontSize: 96, color: '#fff', WebkitTextStroke: `8px ${OL}`, paintOrder: 'stroke fill', rotate: `${Math.sin(frame / 6) * 2}deg`}}>CAN YOU GET 3/3?</div>
      <div style={{position: 'absolute', left: 40, right: 140, top: 1120, textAlign: 'center', fontFamily: BODY, fontWeight: 900, fontSize: 46, color: '#facc15'}}>{(scene.tag as string) ?? '3 SUPERSTARS · 3 CLUES EACH'}</div>
      <SeriesBadge text={scene.badge as string} from={45} />
    </AbsoluteFill>
  );
};

/* quizPlayer: { num, clues:[{text,onWord}], guessOnWord, nameOnWord, name, hair, beard?, skin, shirt, bg } */
const QuizPlayer: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const clues = (scene.clues as {text: string; onWord: string}[]) ?? [];
  const gAt = at(captions, scene.guessOnWord, fps, dur * 0.75);
  const nAt = at(captions, scene.nameOnWord, fps, dur * 0.85);
  const lit = interpolate(frame, [nAt - 2, nAt + 6], [0, 1], clamp);
  const bar = interpolate(frame, [gAt, nAt], [1, 0], clamp);
  const ns = spring({frame: frame - nAt, fps, config: {damping: 9}});
  return (
    <Shake at={nAt} amount={10}>
      <AbsoluteFill style={{background: (scene.bg as string) ?? 'radial-gradient(circle at 50% 40%, #0f766e 0%, #052e2b 80%)'}}>
        <div style={{position: 'absolute', left: 60, top: 300, fontFamily: DISPLAY, fontSize: 64, color: '#facc15', WebkitTextStroke: `6px ${OL}`, paintOrder: 'stroke fill'}}>PLAYER {scene.num as number}/3</div>
        <Player x={540} y={1030 + Math.sin(frame / 9) * 6} s={0.8 + 0.06 * ns * lit} hair={scene.hair as Hair} beard={!!scene.beard} skin={scene.skin as string} shirt={scene.shirt as string} lit={lit} />
        {clues.map((c, i) => <Card key={i} text={c.text} a={at(captions, c.onWord, fps, 6 + i * 40)} y={400 + i * 128} i={i} />)}
        {frame >= gAt && frame < nAt ? (
          <div style={{position: 'absolute', left: 140, right: 240, top: 1270, height: 30, borderRadius: 15, background: '#1f2937', border: `4px solid ${OL}`}}>
            <div style={{width: `${bar * 100}%`, height: '100%', borderRadius: 15, background: '#ef4444'}} />
            <div style={{position: 'absolute', top: -70, width: '100%', textAlign: 'center', fontFamily: DISPLAY, fontSize: 54, color: '#fff', WebkitTextStroke: `5px ${OL}`, paintOrder: 'stroke fill'}}>GUESS NOW!</div>
          </div>
        ) : null}
        {frame >= nAt ? <div style={{position: 'absolute', left: 40, right: 140, top: 1200, textAlign: 'center', scale: String(0.6 + 0.4 * ns)}}>
          <span style={{fontFamily: DISPLAY, fontSize: 92, color: '#111', background: '#facc15', padding: '4px 30px', borderRadius: 16, border: `7px solid ${OL}`, boxShadow: `0 9px 0 ${OL}`}}>{scene.name as string}</span>
        </div> : null}
        <SeriesBadge text={scene.badge as string} />
      </AbsoluteFill>
    </Shake>
  );
};

/* quizScore: { scoreOnWord } — score buttons 0/3..3/3 light up one by one, "COMMENT YOUR SCORE 👇", daily pill. */
const QuizScore: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sAt = at(captions, scene.scoreOnWord, fps, dur * 0.4);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #7c3aed 0%, #1e1035 80%)'}}>
      <div style={{position: 'absolute', left: 40, right: 140, top: 330, textAlign: 'center', fontFamily: DISPLAY, fontSize: 88, lineHeight: 1.05, color: '#fff', WebkitTextStroke: `8px ${OL}`, paintOrder: 'stroke fill'}}>HOW MANY DID YOU GET?</div>
      {['0/3', '1/3', '2/3', '3/3'].map((t, i) => {
        const a = 8 + i * 6;
        const p = spring({frame: frame - a, fps, config: {damping: 10}});
        const hot = Math.floor(frame / 8) % 4 === i;
        return <div key={t} style={{position: 'absolute', left: 90 + (i % 2) * 430, top: 640 + Math.floor(i / 2) * 220, width: 360, height: 170, borderRadius: 30, background: i === 3 ? '#facc15' : hot ? '#e0f2fe' : '#f8fafc', border: `7px solid ${OL}`, boxShadow: `0 10px 0 ${OL}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontSize: 96, color: '#111', scale: String(p)}}>{t}{i === 3 ? ' 🐐' : ''}</div>;
      })}
      {frame >= sAt ? <div style={{position: 'absolute', left: 40, right: 140, top: 1110, textAlign: 'center', fontFamily: BODY, fontWeight: 900, fontSize: 52, color: '#facc15'}}>COMMENT YOUR SCORE 👇</div> : null}
      <DailyPill from={Math.round(sAt + 6)} y={1210} />
      <SeriesBadge text={scene.badge as string} />
    </AbsoluteFill>
  );
};

export const QUIZ1_SCENES: Record<string, React.FC<SceneProps>> = {quizHook: QuizHook, quizPlayer: QuizPlayer, quizScore: QuizScore};
