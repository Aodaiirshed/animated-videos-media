import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {DailyPill, SeriesBadge, Syn} from '../components/Host';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* Try This #2 — negative colour afterimage. A STATIC colour-inverted Syn (red body, blue antenna) on black; stare at the white dot 20 s; then a white screen shows the real teal Syn as a ghost.
   synNegative, whiteLook, tiredCones, greenScrubs, negAgain. */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OL = '#1b1b22';
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);
const DOT = {x: 540, y: 905};

const Tag: React.FC<{text: string; at: number; y: number; color?: string; size?: number; rot?: number; fg?: string}> = ({text, at: a, y, color = '#ffcc4d', size = 64, rot = -3, fg = '#111'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - a, fps, config: {damping: 10, stiffness: 190}});
  return (
    <div style={{position: 'absolute', left: 40, width: 1000, top: y, textAlign: 'center', opacity: frame >= a ? 1 : 0, scale: String(1.6 - s * 0.6), rotate: `${rot}deg`}}>
      <span style={{fontFamily: DISPLAY, fontSize: size, color: fg, background: color, padding: '4px 28px', borderRadius: 16, border: `6px solid ${OL}`, boxShadow: `0 9px 0 ${OL}`}}>{text}</span>
    </div>
  );
};

/* Static Syn drawing with a palette, centred on (cx, cy). Inverted palette = the stimulus; normal palette = the "real" Syn. No motion at all (motion would ruin the afterimage). */
type Pal = {body: string; line: string; bolt: string; eye: string; pupil: string; cheek: string; brow: string};
export const INV: Pal = {body: '#c02c39', line: '#e4e4dd', bolt: '#0027b5', eye: '#000000', pupil: '#f2f2ea', cheek: '#00644c', brow: '#c02c39'};
export const REAL: Pal = {body: '#3fd3c6', line: '#1b1b22', bolt: '#ffd84a', eye: '#ffffff', pupil: '#1b1b22', cheek: '#ff9bb3', brow: '#2bb3a7'};
const StaticSyn: React.FC<{cx: number; cy: number; size: number; p: Pal; opacity?: number}> = ({cx, cy, size, p, opacity = 1}) => (
  <svg viewBox="0 0 300 300" width={size} height={size} style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, opacity, overflow: 'visible'}}>
    <path d="M150 40 l-14 34 h18 l-12 30 34-44 h-20 l12-20z" fill={p.bolt} stroke={p.line} strokeWidth={5} strokeLinejoin="round" />
    <path d="M68 190 q-22 -10 -26 -32" stroke={p.body} strokeWidth={16} strokeLinecap="round" fill="none" />
    <path d="M232 190 q22 -10 26 -32" stroke={p.body} strokeWidth={16} strokeLinecap="round" fill="none" />
    <ellipse cx={150} cy={175} rx={92} ry={84} fill={p.body} stroke={p.line} strokeWidth={7} />
    <path d="M100 128 q18 -12 36 -2 M164 126 q18 -10 36 2" stroke={p.brow === p.body ? p.line : p.brow} strokeWidth={8} strokeLinecap="round" fill="none" />
    <circle cx={118} cy={160} r={22} fill={p.eye} stroke={p.line} strokeWidth={5} />
    <circle cx={182} cy={160} r={22} fill={p.eye} stroke={p.line} strokeWidth={5} />
    <circle cx={121} cy={163} r={10} fill={p.pupil} />
    <circle cx={185} cy={163} r={10} fill={p.pupil} />
    <ellipse cx={96} cy={200} rx={15} ry={9} fill={p.cheek} />
    <ellipse cx={204} cy={200} rx={15} ry={9} fill={p.cheek} />
    <path d="M130 212 q20 16 40 0" stroke={p.line} strokeWidth={7} strokeLinecap="round" fill="none" />
  </svg>
);

/* synNegative: { timerOnWord, timerSec, tips[], top, badge } — HOOK + 20 s stare. Everything is static except the timer and the tip text at the top. */
const SynNegative: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tAt = at(captions, scene.timerOnWord, fps, Math.round(dur - 20 * fps));
  const total = Math.max(1, dur - tAt);
  const left = Math.max(0, Math.ceil(((scene.timerSec as number) ?? 20) * (1 - (frame - tAt) / total)));
  const tips = (scene.tips as {text: string; atSec: number}[]) ?? [];
  const tip = [...tips].reverse().find((t) => frame >= tAt + t.atSec * fps);
  const ring = interpolate(frame, [tAt, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <StaticSyn cx={540} cy={880} size={760} p={INV} />
      <div style={{position: 'absolute', left: DOT.x - 11, top: DOT.y - 11, width: 22, height: 22, borderRadius: 11, background: '#fff', boxShadow: '0 0 0 4px #000'}} />
      {frame >= tAt ? (
        <svg width={200} height={200} style={{position: 'absolute', left: 440, top: 1165}}>
          <circle cx={100} cy={100} r={82} stroke="#333" strokeWidth={16} fill="#000" />
          <circle cx={100} cy={100} r={82} stroke="#ffd84a" strokeWidth={16} fill="none" strokeDasharray={515} strokeDashoffset={515 * (1 - ring)} transform="rotate(-90 100 100)" strokeLinecap="round" />
          <text x={100} y={128} textAnchor="middle" fontFamily={DISPLAY} fontSize={84} fill="#fff">{left}</text>
        </svg>
      ) : null}
      <Tag text={tip ? tip.text : ((scene.top as string) ?? 'STARE AT THE WHITE DOT')} at={-12} y={300} size={66} color={tip ? '#fff' : '#ffcc4d'} rot={0} />
      <SeriesBadge text={(scene.badge as string) ?? 'TRY THIS #2'} />
    </AbsoluteFill>
  );
};

/* whiteLook: { top } — pure white screen, the same tiny dot. Nothing else in the middle so the ghost Syn is all the viewer sees. */
const WhiteLook: React.FC<SceneProps> = ({scene, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#fff'}}>
      <div style={{position: 'absolute', left: DOT.x - 8, top: DOT.y - 8, width: 16, height: 16, borderRadius: 8, background: '#222'}} />
      <div style={{position: 'absolute', width: '100%', top: 250, textAlign: 'center', fontFamily: DISPLAY, fontSize: 54, color: '#9ca3af'}}>{(scene.top as string) ?? 'LOOK AT THE DOT · BLINK ONCE'}</div>
      <div style={{position: 'absolute', width: '100%', top: 1240, textAlign: 'center', fontFamily: DISPLAY, fontSize: 60, color: '#3fd3c6', opacity: interpolate(frame, [dur * 0.55, dur * 0.7], [0, 1], clamp)}}>SEE HIM? 👀</div>
    </AbsoluteFill>
  );
};

/* tiredCones: { tag, tagOnWord, realOnWord } — an eye's three colour cells: RED dims (tired), GREEN + BLUE stay bright; they add up to teal → the real Syn pops in. */
const TiredCones: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tAt = at(captions, scene.tagOnWord, fps, dur * 0.2);
  const rAt = at(captions, scene.realOnWord, fps, dur * 0.7);
  const dim = interpolate(frame, [tAt, tAt + 18], [1, 0.15], clamp);
  const rs = spring({frame: frame - rAt, fps, config: {damping: 10}});
  const cells: [string, string, number][] = [['#ef4444', 'RED', dim], ['#22c55e', 'GREEN', 1], ['#3b82f6', 'BLUE', 1]];
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1e293b 0%, #020617 80%)'}}>
      {cells.map(([c, l, o], i) => (
        <div key={i} style={{position: 'absolute', left: 120 + i * 300, top: 480, width: 240, height: 360, opacity: o}}>
          <div style={{position: 'absolute', left: 60, top: 0, width: 120, height: 260, borderRadius: '60px 60px 20px 20px', background: c, border: `8px solid ${OL}`, boxShadow: o > 0.5 ? `0 0 ${30 + Math.sin(frame / 4 + i) * 10}px ${c}` : 'none'}} />
          <div style={{position: 'absolute', width: '100%', top: 280, textAlign: 'center', fontFamily: DISPLAY, fontSize: 52, color: '#fff'}}>{l}</div>
        </div>
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center', fontFamily: BODY, fontWeight: 900, fontSize: 46, color: '#e2e8f0', opacity: frame >= tAt ? 1 : 0}}>RED CELLS TIRED → WHITE LOOKS TEAL</div>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, opacity: frame >= rAt ? 1 : 0, scale: String(0.5 + rs * 0.5), transformOrigin: '540px 1120px'}}>
        <StaticSyn cx={540} cy={1120} size={300} p={REAL} />
      </div>
      <Tag text={(scene.tag as string) ?? 'NEGATIVE AFTERIMAGE'} at={tAt} y={290} size={68} color="#3fd3c6" rot={-2} />
    </AbsoluteFill>
  );
};

/* greenScrubs: { tag, tagOnWord, ghostOnWord } — an operating room: a surgeon in GREEN; on the white wall behind, faint green ghost blobs appear on the cue word. */
const GreenScrubs: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const gAt = at(captions, scene.ghostOnWord, fps, dur * 0.6);
  const g = interpolate(frame, [gAt, gAt + 15], [0, 0.55], clamp);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#f8fafc 0%, #e2e8f0 62%, #94a3b8 63%, #64748b 100%)'}}>
      {[[260, 520], [780, 600], [520, 450]].map(([x, y], i) => <div key={i} style={{position: 'absolute', left: x - 110, top: y - 70, width: 220, height: 140, borderRadius: '50%', background: '#2dd4bf', opacity: g, filter: 'blur(18px)'}} />)}
      {/* lamp */}
      <div style={{position: 'absolute', left: 390, top: 260, width: 300, height: 90, borderRadius: '150px 150px 20px 20px', background: '#cbd5e1', border: `8px solid ${OL}`}} />
      {/* surgeon */}
      <svg width={460} height={700} viewBox="0 0 230 350" style={{position: 'absolute', left: 310, top: 640}}>
        <circle cx={115} cy={60} r={42} fill="#f1c27d" stroke={OL} strokeWidth={7} />
        <path d="M73 50 q42 -50 84 0 v-10 q-42 -40 -84 0 z" fill="#15803d" stroke={OL} strokeWidth={6} />
        <rect x={80} y={62} width={70} height={34} rx={10} fill="#16a34a" stroke={OL} strokeWidth={5} />
        <path d="M40 330 v-150 q0 -60 75 -66 q75 6 75 66 v150 z" fill="#16a34a" stroke={OL} strokeWidth={8} />
        <path d="M60 180 q-30 50 10 90 M170 180 q30 50 -10 90" stroke="#15803d" strokeWidth={22} strokeLinecap="round" fill="none" />
      </svg>
      <Tag text={(scene.tag as string) ?? 'GREEN, NOT WHITE'} at={at(captions, scene.tagOnWord, fps, 4)} y={1190} size={64} color="#16a34a" fg="#fff" rot={-2} />
      <Tag text="ONE THEORY" at={2} y={140} size={44} color="#fff" rot={2} />
    </AbsoluteFill>
  );
};

/* negAgain: last line — the inverted Syn fades back in on black; Syn (real) points from the corner; pill. Flows into synNegative. */
const NegAgain: React.FC<SceneProps> = ({scene, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, dur * 0.6], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <StaticSyn cx={540} cy={880} size={760} p={INV} opacity={o} />
      <div style={{position: 'absolute', left: DOT.x - 11, top: DOT.y - 11, width: 22, height: 22, borderRadius: 11, background: '#fff', opacity: o}} />
      <Tag text={(scene.top as string) ?? "DIDN'T SEE HIM? AGAIN."} at={2} y={300} size={66} color="#ffcc4d" rot={-2} />
      <Syn x={160} y={1280} size={180} pose="point" from={4} to={dur} />
      <DailyPill from={4} y={1300} />
    </AbsoluteFill>
  );
};

export const TRYTHIS2_SCENES: Record<string, React.FC<SceneProps>> = {
  synNegative: SynNegative,
  whiteLook: WhiteLook,
  tiredCones: TiredCones,
  greenScrubs: GreenScrubs,
  negAgain: NegAgain,
};
