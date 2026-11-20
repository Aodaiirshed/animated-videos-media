import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BODY, DISPLAY} from '../fonts';

/* Syn — WonderSynapse host (original character, spec in project doc channel/host-syn.md).
   Teal blob, yellow lightning antenna, big eyes, pink cheeks, two thin arms, no legs.
   Poses: wave, point, shock, think. Idle: gentle bob + antenna flicker.
   Place in a corner (~260 px), never over frame-0 hook text, captions (y 1330–1500) or the right 140 px. */
export type HostPose = 'wave' | 'point' | 'shock' | 'think';

/* Lip sync (19–20 Nov): Rhubarb Lip Sync cues (Preston Blair set) → mouth shapes.
   A closed (M/B/P) · B slightly open · C open (EH) · D wide open (AA) · E rounded (AO/ER) · F puckered (OO)
   G teeth on lip (F/V) · H tongue up (L) · X rest = the old smile. Centred on (150, 226) in Syn's 300×300 box. */
const DARK = '#141826';
const SynMouth: React.FC<{shape: string}> = ({shape}) => {
  switch (shape) {
    case 'A': return <path d="M134 226 q16 3 32 0" stroke={DARK} strokeWidth={6} fill="none" strokeLinecap="round" />;
    case 'B': return <g><ellipse cx="150" cy="226" rx="16" ry="6" fill={DARK} /><path d="M137 223 h26" stroke="#fff" strokeWidth={3} strokeLinecap="round" /></g>;
    case 'C': return <g><ellipse cx="150" cy="228" rx="16" ry="11" fill={DARK} /><ellipse cx="150" cy="234" rx="9" ry="4" fill="#ff7a8c" /></g>;
    case 'D': return <g><ellipse cx="150" cy="230" rx="19" ry="16" fill={DARK} /><ellipse cx="150" cy="239" rx="11" ry="6" fill="#ff7a8c" /><path d="M136 220 h28" stroke="#fff" strokeWidth={4} strokeLinecap="round" /></g>;
    case 'E': return <ellipse cx="150" cy="229" rx="12" ry="13" fill={DARK} />;
    case 'F': return <g><ellipse cx="150" cy="228" rx="8" ry="9" fill={DARK} /><ellipse cx="150" cy="228" rx="11" ry="12" fill="none" stroke="#1f7f78" strokeWidth={3} /></g>;
    case 'G': return <g><path d="M134 222 h32 v8 q-16 8 -32 0 z" fill={DARK} /><rect x="138" y="221" width="24" height="5" rx="2" fill="#fff" /></g>;
    case 'H': return <g><ellipse cx="150" cy="228" rx="16" ry="12" fill={DARK} /><ellipse cx="150" cy="222" rx="8" ry="4" fill="#ff7a8c" /></g>;
    default: return <path d="M132 222 q18 16 36 0" stroke={DARK} strokeWidth={6} fill="none" strokeLinecap="round" />;
  }
};

/* Current Rhubarb shape for this scene at the current frame (cues are in seconds from the scene's audio start). */
export type MouthCue = {start: number; end: number; value: string};
export const mouthAt = (cues: MouthCue[] | undefined, frame: number, fps: number): string => {
  if (!cues) return 'X';
  const t = frame / fps;
  const c = cues.find((q) => t >= q.start && t < q.end);
  return c ? c.value : 'X';
};

export const Syn: React.FC<{x: number; y: number; size?: number; pose?: HostPose; from?: number; to?: number; flip?: boolean; mouth?: string}> = ({
  x, y, size = 260, pose = 'wave', from = 0, to = 99999, flip, mouth,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < from - 1 || frame > to + 8) return null;
  const pop = spring({frame: frame - from, fps, config: {damping: 11, stiffness: 180}});
  const out = interpolate(frame, [to, to + 8], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const s = pop * out;
  const bob = Math.sin(frame / 7) * 6;
  const zap = pose === 'shock' ? (frame % 6 < 3 ? 1 : 0.35) : 0.75 + Math.sin(frame / 3) * 0.25;
  const wave = Math.sin(frame / 3.5) * 22;
  const eyeY = pose === 'think' ? -9 : 0;
  const eyeR = pose === 'shock' ? 25 : 20;
  // arms: [left path, right path]
  const armL = pose === 'shock' ? 'M68 175 q-30 -30 -20 -70' : pose === 'think' ? 'M70 200 q-20 10 -10 -20' : 'M68 190 q-22 -10 -26 -32';
  const armR =
    pose === 'wave' ? `M232 180 q30 -10 ${36 + wave * 0.3} ${-48 + wave * 0.4}` :
    pose === 'point' ? 'M232 185 q40 -6 66 -20' :
    pose === 'shock' ? 'M232 175 q30 -30 20 -70' :
    'M232 205 q-30 10 -70 2';
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2 + bob, width: size, height: size, scale: String(s), transform: flip ? 'scaleX(-1)' : undefined, filter: 'drop-shadow(0 10px 0 rgba(0,0,0,0.35))'}}>
      <svg viewBox="0 0 300 300" width={size} height={size} style={{overflow: 'visible'}}>
        <defs>
          <radialGradient id="synHi" cx=".35" cy=".3" r=".8">
            <stop offset="0" stopColor="#fff" stopOpacity=".35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M150 40 l-14 34 h18 l-12 30 34-44 h-20 l12-20z" fill="#ffd84a" stroke="#1b1b22" strokeWidth={5} strokeLinejoin="round" opacity={zap} />
        {pose === 'shock' ? <path d="M120 40 l-14 -16 M182 36 l14 -18 M150 20 v-18" stroke="#ffd84a" strokeWidth={6} strokeLinecap="round" opacity={zap} /> : null}
        <path d={armL} stroke="#1b1b22" strokeWidth={20} fill="none" strokeLinecap="round" />
        <path d={armR} stroke="#1b1b22" strokeWidth={20} fill="none" strokeLinecap="round" />
        <path d={armL} stroke="#3fd3c6" strokeWidth={12} fill="none" strokeLinecap="round" />
        <path d={armR} stroke="#3fd3c6" strokeWidth={12} fill="none" strokeLinecap="round" />
        <circle cx="150" cy="175" r="88" fill="#3fd3c6" stroke="#1b1b22" strokeWidth={7} />
        <circle cx="150" cy="175" r="88" fill="url(#synHi)" />
        <path d={pose === 'shock' ? 'M95 140 q20-30 40 -6 M165 134 q20-24 40 6' : 'M95 150 q20-25 40 0 M165 150 q20-25 40 0'} stroke="#1f7f78" strokeWidth={6} fill="none" opacity={0.6} />
        <ellipse cx="122" cy="178" rx={eyeR} ry={eyeR + 5} fill="#fff" />
        <ellipse cx="178" cy="178" rx={eyeR} ry={eyeR + 5} fill="#fff" />
        <circle cx="126" cy={182 + eyeY} r={pose === 'shock' ? 7 : 10} fill="#141826" />
        <circle cx="182" cy={182 + eyeY} r={pose === 'shock' ? 7 : 10} fill="#141826" />
        <circle cx="129" cy={178 + eyeY} r="3.5" fill="#fff" />
        <circle cx="185" cy={178 + eyeY} r="3.5" fill="#fff" />
        {mouth && mouth !== 'X'
          ? <SynMouth shape={mouth} />
          : pose === 'shock'
          ? <ellipse cx="150" cy="228" rx="13" ry="16" fill="#141826" />
          : <path d={pose === 'think' ? 'M136 226 q14 -6 28 0' : 'M132 222 q18 16 36 0'} stroke="#141826" strokeWidth={6} fill="none" strokeLinecap="round" />}
        <circle cx="98" cy="210" r="9" fill="#ff8fa3" opacity=".7" />
        <circle cx="202" cy="210" r="9" fill="#ff8fa3" opacity=".7" />
      </svg>
    </div>
  );
};

/* Series badge (top-left corner) + "New one every day" pill. */
export const SeriesBadge: React.FC<{text: string; from?: number; to?: number}> = ({text, from = -12, to = 99999}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  return (
    <div style={{position: 'absolute', left: 40, top: 70, padding: '8px 22px', borderRadius: 14, background: '#3fd3c6', border: '5px solid #1b1b22', boxShadow: '0 6px 0 #1b1b22',
      fontFamily: DISPLAY, fontSize: 40, color: '#141826', letterSpacing: 1}}>{text}</div>
  );
};

export const DailyPill: React.FC<{from: number; to?: number; y?: number; text?: string}> = ({from, to = 99999, y = 1240, text = 'NEW ONE EVERY DAY'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < from || frame > to) return null;
  const s = spring({frame: frame - from, fps, config: {damping: 12}});
  return (
    <div style={{position: 'absolute', left: 0, right: 140, top: y, textAlign: 'center', opacity: s, translate: `0 ${(1 - s) * 30}px`}}>
      <span style={{fontFamily: BODY, fontWeight: 900, fontSize: 40, color: '#141826', background: '#ffd84a', padding: '8px 26px', borderRadius: 999, border: '5px solid #1b1b22'}}>⚡ {text}</span>
    </div>
  );
};
