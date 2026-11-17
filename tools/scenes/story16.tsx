import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Boy} from '../components/Boy';
import {Camera, Shake} from '../components/Fx';
import {SeriesBadge} from '../components/Host';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* Story set 16 (Guess the Player #14): redCardMvp, streetCart, nightShift, littleBird. Original cartoon hero, no likeness, no crests. */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OL = '#1b1b22';
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);

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

/* redCardMvp: { badge, cardOnWord, mvpOnWord } — HOOK: a referee arm thrusts a red card up; then a gold MAN OF THE MATCH medal swings in; the hero looks between them. */
const RedCardMvp: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cAt = at(captions, scene.cardOnWord, fps, 0);
  const mAt = at(captions, scene.mvpOnWord, fps, dur * 0.55);
  const cs = spring({frame: frame - cAt + 12, fps, config: {damping: 9, stiffness: 220}});
  const ms = spring({frame: frame - mAt, fps, config: {damping: 8, stiffness: 160}});
  return (
    <AbsoluteFill>
      <Shake at={mAt} amount={12}>
        <Camera dur={dur} from={1.08} to={1.0}>
          <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1e3a8a 0%, #020617 80%)'}} />
          {new Array(28).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: (i * 41) % 1080, top: 260 + ((i * 67) % 360), width: 9, height: 9, borderRadius: 5, background: '#fde68a', opacity: 0.3 + 0.5 * Math.abs(Math.sin(frame / 6 + i))}} />)}
          <div style={{position: 'absolute', left: 80, top: interpolate(cs, [0, 1], [1400, 380]), rotate: '-12deg'}}>
            <div style={{width: 120, height: 330, background: '#111827', border: `8px solid ${OL}`, borderRadius: 40, position: 'absolute', left: 60, top: 300}} />
            <div style={{width: 230, height: 320, background: '#ef4444', border: `10px solid ${OL}`, borderRadius: 18, boxShadow: '0 0 60px 10px rgba(239,68,68,0.5)'}} />
          </div>
          <div style={{position: 'absolute', left: 640, top: interpolate(ms, [0, 1], [-500, 380]), rotate: `${Math.sin(frame / 9) * 8}deg`, transformOrigin: '50% -200px', opacity: frame >= mAt - 2 ? 1 : 0}}>
            <div style={{position: 'absolute', left: 110, top: -230, width: 20, height: 240, background: '#2563eb', border: `5px solid ${OL}`}} />
            <div style={{width: 240, height: 240, borderRadius: 120, background: 'radial-gradient(circle at 35% 35%, #fef08a, #eab308 70%)', border: `10px solid ${OL}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontSize: 70, color: OL}}>MVP</div>
          </div>
          <Boy x={540} y={1440} height={560} stage="adult" pose={frame >= mAt ? 'cheer' : 'stand'} phase={frame / 4} skin={sb.character.palette.skin} rim="#fde68a" glow={0.4} mood={frame >= mAt ? 'laugh' : 'sad'} />
          <Tag text="RED CARD…" at={cAt} y={250} size={84} color="#ef4444" fg="#fff" rot={-3} />
          <Tag text="…MAN OF THE MATCH?!" at={mAt} y={1000} size={70} color="#ffcc4d" rot={2} />
        </Camera>
      </Shake>
      <SeriesBadge text={(scene.badge as string) ?? 'GUESS THE PLAYER #14'} />
    </AbsoluteFill>
  );
};

/* streetCart: { tag, tagOnWord } — a mum pushes a huge cart piled with clothes and toys down a street toward a market; the small boy rides on top; sun moves across the sky (all day). */
const StreetCart: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tAt = at(captions, scene.tagOnWord, fps, dur * 0.3);
  const sunX = interpolate(frame, [0, dur], [80, 900], clamp);
  const sky = interpolate(frame, [0, dur], [0, 1], clamp);
  const x = interpolate(frame, [0, dur], [-40, 260], clamp);
  return (
    <Camera dur={dur} from={1.0} to={1.06}>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${sky < 0.6 ? '#7dd3fc' : '#fb923c'} 0%, #fde68a 70%)`}} />
      <div style={{position: 'absolute', left: sunX, top: 300 - Math.sin(sky * Math.PI) * 120, width: 140, height: 140, borderRadius: 70, background: '#fde047', border: `6px solid ${OL}`}} />
      {new Array(6).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: i * 190 - 20, top: 600 + (i % 2) * 40, width: 170, height: 420, background: ['#fca5a5', '#93c5fd', '#fcd34d', '#a7f3d0', '#c4b5fd', '#fdba74'][i], border: `6px solid ${OL}`}} />)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1060, bottom: 0, background: '#a8a29e', borderTop: `10px solid ${OL}`}} />
      <div style={{position: 'absolute', left: x + 420, top: 820, width: 420, height: 260}}>
        <div style={{position: 'absolute', left: 0, top: 70, width: 420, height: 170, background: '#64748b', border: `8px solid ${OL}`, borderRadius: 12}} />
        {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7'].map((c, i) => <div key={i} style={{position: 'absolute', left: 20 + i * 78, top: 20 + (i % 2) * 20, width: 70, height: 70, background: c, border: `5px solid ${OL}`, borderRadius: 10, rotate: `${(i - 2) * 8}deg`}} />)}
        {[60, 340].map((wx, i) => <div key={i} style={{position: 'absolute', left: wx, top: 220, width: 60, height: 60, borderRadius: 30, background: OL, rotate: `${frame * 10}deg`, border: '6px dashed #94a3b8'}} />)}
      </div>
      <div style={{position: 'absolute', left: x + 300, top: 760}}>
        <div style={{width: 120, height: 120, borderRadius: 60, background: '#c08457', border: `7px solid ${OL}`, position: 'absolute', left: 20, top: 0}} />
        <div style={{width: 160, height: 260, background: '#db2777', border: `7px solid ${OL}`, borderRadius: '50px 50px 20px 20px', position: 'absolute', left: 0, top: 110, rotate: '8deg'}} />
      </div>
      <Tag text={(scene.tag as string) ?? 'MUM: 8 AM → 7 PM'} at={tAt} y={250} size={72} color="#fff" rot={-2} />
    </Camera>
  );
};

/* nightShift: { tag, tagOnWord, swapOnWord } — night: a casino front glows; a guard silhouette with a torch; a clock flips 8 PM → 6 AM; then a door swap: one parent in, one out. */
const NightShift: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tAt = at(captions, scene.tagOnWord, fps, 6);
  const sAt = at(captions, scene.swapOnWord, fps, dur * 0.6);
  const hr = Math.round(interpolate(frame, [tAt, sAt], [20, 30], clamp)) % 24;
  const swap = interpolate(frame, [sAt, sAt + 20], [0, 1], clamp);
  return (
    <Camera dur={dur} from={1.05} to={1.0}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #020617 0%, #1e1b4b 100%)'}} />
      <div style={{position: 'absolute', left: 120, top: 420, width: 840, height: 520, background: '#312e81', border: `10px solid ${OL}`, borderRadius: 20}}>
        <div style={{position: 'absolute', left: 60, right: 60, top: 40, textAlign: 'center', fontFamily: DISPLAY, fontSize: 110, color: '#f0abfc', textShadow: `0 0 ${18 + 10 * Math.sin(frame / 4)}px #e879f9`}}>CASINO</div>
        {new Array(10).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: 50 + i * 76, top: 200, width: 30, height: 30, borderRadius: 15, background: (frame / 4 + i) % 3 < 1.5 ? '#fde047' : '#713f12'}} />)}
        <div style={{position: 'absolute', left: 360, top: 300, width: 120, height: 220, background: '#0f172a', border: `6px solid ${OL}`}} />
      </div>
      <div style={{position: 'absolute', left: 560 - swap * 200, top: 820, opacity: 1 - swap * 0.8}}>
        <div style={{width: 110, height: 110, borderRadius: 55, background: '#1f2937', border: `6px solid ${OL}`, marginLeft: 25}} />
        <div style={{width: 160, height: 260, background: '#1f2937', border: `6px solid ${OL}`, borderRadius: '40px 40px 14px 14px'}} />
        <div style={{position: 'absolute', left: 150, top: 150, width: 260, height: 60, background: 'linear-gradient(90deg, rgba(254,240,138,0.9), transparent)', clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0 60%)'}} />
      </div>
      <div style={{position: 'absolute', left: 360, top: 1110, width: 360, height: 150, background: '#0b1220', border: `8px solid ${OL}`, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontSize: 96, color: '#f87171'}}>{`${String(hr).padStart(2, '0')}:00`}</div>
      <Tag text={(scene.tag as string) ?? 'DAD: 8 PM → 6 AM'} at={tAt} y={250} size={72} color="#fff" rot={-2} />
      {swap > 0 ? <Tag text="ONE IN · ONE OUT" at={sAt} y={1300} size={56} color="#ffcc4d" rot={2} /> : null}
    </Camera>
  );
};

/* littleBird: { tag, tagOnWord } — a very skinny kid darts across a dirt pitch with the ball; a little bird flies beside him and copies his zig-zag. */
const LittleBird: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tAt = at(captions, scene.tagOnWord, fps, dur * 0.4);
  const px = interpolate(frame, [0, dur], [160, 820], clamp);
  const zig = Math.sin(frame / 5) * 70;
  return (
    <Camera dur={dur} from={1.0} to={1.05}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #bae6fd 0%, #e0f2fe 45%, #d6a46b 46%, #b7793f 100%)'}} />
      {new Array(5).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: ((i * 260 - frame * 2) % 1300 + 1300) % 1300 - 200, top: 330 + i * 30, width: 200, height: 70, borderRadius: 35, background: '#fff', opacity: 0.85}} />)}
      <div style={{position: 'absolute', left: 900, top: 760, width: 140, height: 200, border: '10px solid #fff', borderRight: 'none'}} />
      <Boy x={px} y={1380 + zig * 0.2} height={420} stage="child" pose="run" phase={frame / 2.5} skin={sb.character.palette.skin} rim="#fde68a" glow={0.3} mood="happy" />
      <svg width={70} height={70} viewBox="0 0 100 100" style={{position: 'absolute', left: px + 120, top: 1300 + zig * 0.2, rotate: `${frame * 14}deg`}}>
        <circle cx={50} cy={50} r={44} fill="#fff" stroke={OL} strokeWidth={8} /><path d="M50 26 L70 40 L62 64 L38 64 L30 40 Z" fill={OL} />
      </svg>
      <svg width={160} height={110} viewBox="0 0 160 110" style={{position: 'absolute', left: px + 40, top: 780 + zig}}>
        <path d={`M20 ${55 + Math.sin(frame / 2) * 30} Q50 55 80 60 Q110 55 140 ${55 + Math.sin(frame / 2) * 30}`} stroke={OL} strokeWidth={10} fill="none" strokeLinecap="round" />
        <ellipse cx={80} cy={64} rx={26} ry={18} fill="#38bdf8" stroke={OL} strokeWidth={6} />
        <path d="M104 60 L120 66 L104 70 Z" fill="#f59e0b" stroke={OL} strokeWidth={4} />
      </svg>
      <Tag text={(scene.tag as string) ?? '"LITTLE BIRD"'} at={tAt} y={250} size={92} color="#ffcc4d" rot={-3} />
    </Camera>
  );
};

export const STORY16_SCENES: Record<string, React.FC<SceneProps>> = {redCardMvp: RedCardMvp, streetCart: StreetCart, nightShift: NightShift, littleBird: LittleBird};
