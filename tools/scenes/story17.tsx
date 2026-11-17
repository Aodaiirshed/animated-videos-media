import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Boy} from '../components/Boy';
import {Camera, Shake} from '../components/Fx';
import {SeriesBadge} from '../components/Host';
import {wordFrame} from './kit';
import {DISPLAY} from '../fonts';

/* Story set 17 (Guess the Player #15): photoTrip, villageTrial, tooYoung, togetherCup. Original cartoon hero; the idol is only a faceless silhouette + name label; no crests, no kits, no likeness. */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OL = '#1b1b22';
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);

const Tag: React.FC<{text: string; at: number; y: number; x?: number; color?: string; size?: number; rot?: number; fg?: string}> = ({text, at: a, y, x = 540, color = '#ffcc4d', size = 64, rot = -3, fg = '#111'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - a, fps, config: {damping: 10, stiffness: 190}});
  return (
    <div style={{position: 'absolute', left: x - 500, width: 1000, top: y, textAlign: 'center', opacity: frame >= a ? 1 : 0, scale: String(1.6 - s * 0.6), rotate: `${rot}deg`}}>
      <span style={{fontFamily: DISPLAY, fontSize: size, color: fg, background: color, padding: '4px 28px', borderRadius: 16, border: `6px solid ${OL}`, boxShadow: `0 9px 0 ${OL}`}}>{text}</span>
    </div>
  );
};

/* faceless tall idol silhouette (no likeness) */
const Idol: React.FC<{x: number; y: number; h: number; color?: string}> = ({x, y, h, color = '#0f172a'}) => (
  <svg width={h * 0.5} height={h} viewBox="0 0 100 200" style={{position: 'absolute', left: x - h * 0.25, top: y - h}}>
    <circle cx={50} cy={26} r={20} fill={color} />
    <rect x={28} y={48} width={44} height={84} rx={16} fill={color} />
    <rect x={31} y={128} width={16} height={68} rx={7} fill={color} />
    <rect x={53} y={128} width={16} height={68} rx={7} fill={color} />
    <path d="M30 62 q-20 30 -10 58 M70 62 q24 10 30 -14" stroke={color} strokeWidth={14} strokeLinecap="round" fill="none" />
  </svg>
);

/* photoTrip: { badge, top?, flashOnWord?, tag? } — HOOK. Night road, a small car's headlights → camera flash → a polaroid: the kid next to a faceless tall silhouette labelled MESSI. */
const PhotoTrip: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fAt = at(captions, scene.flashOnWord, fps, dur * 0.6);
  const ps = spring({frame: frame - fAt, fps, config: {damping: 11, stiffness: 150}});
  const flash = interpolate(frame, [fAt, fAt + 3, fAt + 12], [0, 1, 0], clamp);
  const carX = interpolate(frame, [0, fAt], [-200, 700], clamp);
  return (
    <AbsoluteFill>
      <Shake at={fAt} amount={10}>
        <Camera dur={dur} from={1.06} to={1.0}>
          <AbsoluteFill style={{background: 'linear-gradient(180deg,#0b1026 0%, #1e1b4b 60%, #111827 100%)'}} />
          {new Array(30).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: random(`p${i}`) * 1080, top: 260 + random(`q${i}`) * 500, width: 5, height: 5, borderRadius: 3, background: '#fff', opacity: 0.6}} />)}
          <div style={{position: 'absolute', left: 0, right: 0, top: 1050, height: 260, background: '#1f2937'}} />
          {new Array(8).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: ((i * 170 - frame * 14) % 1360 + 1360) % 1360 - 140, top: 1170, width: 90, height: 14, background: '#fde68a', borderRadius: 7}} />)}
          {/* car */}
          <div style={{position: 'absolute', left: carX, top: 960, width: 260, height: 110, opacity: frame < fAt ? 1 : 0}}>
            <div style={{position: 'absolute', left: 40, top: 0, width: 160, height: 60, background: '#e11d48', border: `7px solid ${OL}`, borderRadius: '30px 30px 6px 6px'}} />
            <div style={{position: 'absolute', left: 0, top: 46, width: 260, height: 56, background: '#e11d48', border: `7px solid ${OL}`, borderRadius: 18}} />
            <div style={{position: 'absolute', left: 250, top: 54, width: 260, height: 40, background: 'linear-gradient(90deg, rgba(255,240,180,0.8), rgba(255,240,180,0))'}} />
          </div>
          {/* polaroid */}
          <div style={{position: 'absolute', left: 190, top: 380, width: 700, height: 820, background: '#fafaf9', border: `10px solid ${OL}`, borderRadius: 14, boxShadow: `0 16px 0 ${OL}`, opacity: frame >= fAt ? 1 : 0, scale: String(0.5 + ps * 0.5), rotate: `${(1 - ps) * 20 - 3}deg`}}>
            <div style={{position: 'absolute', left: 40, top: 40, width: 600, height: 620, background: 'linear-gradient(180deg,#93c5fd,#e0e7ff)', overflow: 'hidden', border: `6px solid ${OL}`}}>
              <Idol x={380} y={640} h={560} />
              <div style={{position: 'absolute', left: 300, top: 40, fontFamily: DISPLAY, fontSize: 60, color: '#fff', background: '#0f172a', padding: '0 18px', borderRadius: 10, border: `5px solid ${OL}`}}>MESSI</div>
              <Boy x={170} y={640} height={380} stage="child" pose="stand" skin={sb.character.palette.skin} rim="#fde68a" glow={0.2} mood="happy" />
            </div>
            <div style={{position: 'absolute', width: '100%', top: 690, textAlign: 'center', fontFamily: DISPLAY, fontSize: 64, color: '#1f2937'}}>2011 · AGE 11</div>
          </div>
          <AbsoluteFill style={{background: '#fff', opacity: flash}} />
          <Tag text={(scene.top as string) ?? '2 HOURS. FOR 1 PHOTO.'} at={-12} y={250} size={72} color="#ffcc4d" rot={-2} />
        </Camera>
      </Shake>
      <SeriesBadge text={(scene.badge as string) ?? 'GUESS THE PLAYER #15'} />
    </AbsoluteFill>
  );
};

/* villageTrial: { tag?, tagOnWord?, planeOnWord? } — a tiny village sign "POP. ~2,000", then a plane takes off toward "SPAIN". */
const VillageTrial: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tAt = at(captions, scene.tagOnWord, fps, dur * 0.2);
  const pAt = at(captions, scene.planeOnWord, fps, dur * 0.6);
  const pt = interpolate(frame, [pAt, dur], [0, 1], clamp);
  return (
    <Camera dur={dur} from={1.0} to={1.06}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#7dd3fc 0%, #e0f2fe 55%, #a3e635 56%, #65a30d 100%)'}} />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{position: 'absolute', left: 80 + i * 190, top: 900 - (i % 2) * 30, width: 150, height: 120, background: ['#fde68a', '#fca5a5', '#fdba74', '#e9d5ff', '#bbf7d0'][i], border: `7px solid ${OL}`}}>
          <div style={{position: 'absolute', left: -14, top: -70, width: 0, height: 0, borderLeft: '89px solid transparent', borderRight: '89px solid transparent', borderBottom: `70px solid #b45309`}} />
        </div>
      ))}
      {/* sign */}
      <div style={{position: 'absolute', left: 300, top: 1070, width: 480, height: 170, background: '#15803d', border: `9px solid ${OL}`, borderRadius: 14, textAlign: 'center'}}>
        <div style={{fontFamily: DISPLAY, fontSize: 56, color: '#fff', marginTop: 14}}>SMALL VILLAGE</div>
        <div style={{fontFamily: DISPLAY, fontSize: 52, color: '#fde68a'}}>POP. ~2,000</div>
      </div>
      <Boy x={170} y={1330} height={330} stage="child" pose="stand" skin={sb.character.palette.skin} rim="#fde68a" glow={0.2} mood="happy" />
      {/* plane */}
      <svg width={260} height={120} viewBox="0 0 260 120" style={{position: 'absolute', left: interpolate(pt, [0, 1], [-260, 1100]), top: interpolate(pt, [0, 1], [700, 280]), rotate: '-14deg', opacity: frame >= pAt ? 1 : 0}}>
        <path d="M10 60 L230 50 Q255 60 230 70 L10 64 Z" fill="#f8fafc" stroke={OL} strokeWidth={6} />
        <path d="M110 58 L80 10 L120 10 L150 58 Z M110 66 L80 112 L120 112 L150 66 Z" fill="#cbd5e1" stroke={OL} strokeWidth={5} />
      </svg>
      <Tag text="TRIAL: THE BIGGEST CLUB IN SPAIN" at={pAt} y={250} size={54} color="#fff" rot={-2} />
      <Tag text={(scene.tag as string) ?? 'A VILLAGE OF ~2,000'} at={tAt} y={420} size={58} color="#ffcc4d" rot={3} />
    </Camera>
  );
};

/* tooYoung: { goalOnWord?, stampOnWord? } — the kid scores in a youth tournament (net bulges), then a red stamp TOO YOUNG TO SIGN; plane icon heading home. */
const TooYoung: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const gAt = at(captions, scene.goalOnWord, fps, dur * 0.15);
  const sAt = at(captions, scene.stampOnWord, fps, dur * 0.6);
  const ss = spring({frame: frame - sAt, fps, config: {damping: 9, stiffness: 240}});
  const bx = interpolate(frame, [gAt - 10, gAt], [420, 860], clamp);
  const by = interpolate(frame, [gAt - 10, gAt], [1200, 760], clamp);
  return (
    <Shake at={sAt} amount={16}>
      <Camera dur={dur} from={1.04} to={1.0}>
        <AbsoluteFill style={{background: 'linear-gradient(180deg,#0ea5e9 0%, #bae6fd 40%, #16a34a 41%, #15803d 100%)'}} />
        {/* goal */}
        <div style={{position: 'absolute', left: 720, top: 640, width: 300, height: 260, border: '14px solid #fff', borderBottom: 'none', background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0 6px, transparent 6px 30px)', translate: frame > gAt && frame < gAt + 10 ? '10px 0' : '0 0'}} />
        <Boy x={300} y={1300} height={420} stage="child" pose={frame < gAt ? 'kick' : 'cheer'} phase={frame / 3} skin={sb.character.palette.skin} rim="#fde68a" glow={0.3} mood="happy" />
        <svg width={70} height={70} viewBox="0 0 100 100" style={{position: 'absolute', left: bx, top: by, rotate: `${frame * 20}deg`}}>
          <circle cx={50} cy={50} r={44} fill="#fff" stroke={OL} strokeWidth={8} /><path d="M50 26 L70 40 L62 64 L38 64 L30 40 Z" fill={OL} />
        </svg>
        <Tag text="GOAL!" at={gAt} y={300} x={760} size={86} color="#ffcc4d" rot={6} />
        <div style={{position: 'absolute', left: 120, top: 980, rotate: '-10deg', opacity: frame >= sAt ? 1 : 0, scale: String(2.2 - ss * 1.2), fontFamily: DISPLAY, fontSize: 96, color: '#dc2626', border: '12px solid #dc2626', borderRadius: 20, padding: '0 30px', background: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap'}}>TOO YOUNG TO SIGN</div>
      </Camera>
    </Shake>
  );
};

/* togetherCup: { yearOnWord?, cupOnWord?, tag? } — counter 2011 → 2022; the grown hero and the faceless idol lift a generic gold cup; confetti. */
const TogetherCup: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const yAt = at(captions, scene.yearOnWord, fps, 0);
  const cAt = at(captions, scene.cupOnWord, fps, dur * 0.4);
  const year = Math.round(interpolate(frame, [yAt, yAt + 20], [2011, 2022], clamp));
  const cs = spring({frame: frame - cAt, fps, config: {damping: 10}});
  return (
    <Camera dur={dur} from={1.0} to={1.06}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #fde68a 0%, #d97706 55%, #451a03 100%)'}} />
      {frame >= cAt ? new Array(40).fill(0).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: random(`c${i}`) * 1080, top: ((random(`d${i}`) * 1900 + (frame - cAt) * (6 + (i % 5))) % 1700) + 200, width: 18, height: 30, background: ['#38bdf8', '#fff', '#facc15'][i % 3], rotate: `${frame * 8 + i * 30}deg`}} />
      )) : null}
      <div style={{position: 'absolute', width: '100%', top: 260, textAlign: 'center', fontFamily: DISPLAY, fontSize: 150, color: '#fff', WebkitTextStroke: `10px ${OL}`, paintOrder: 'stroke fill'}}>{year}</div>
      <Idol x={700} y={1330} h={600} color="#1e293b" />
      <Boy x={380} y={1330} height={600} stage="adult" pose="cheer" phase={frame / 4} skin={sb.character.palette.skin} rim="#fde68a" glow={0.4} mood="happy" />
      {/* generic gold cup */}
      <svg width={220} height={300} viewBox="0 0 220 300" style={{position: 'absolute', left: 430, top: interpolate(cs, [0, 1], [900, 520]), opacity: frame >= cAt ? 1 : 0}}>
        <path d="M40 20 H180 Q175 140 110 170 Q45 140 40 20 Z" fill="#facc15" stroke={OL} strokeWidth={8} />
        <path d="M40 40 Q0 50 20 100 Q30 120 55 120 M180 40 Q220 50 200 100 Q190 120 165 120" stroke={OL} strokeWidth={8} fill="none" />
        <rect x={95} y={168} width={30} height={60} fill="#eab308" stroke={OL} strokeWidth={6} />
        <rect x={60} y={226} width={100} height={50} rx={8} fill="#a16207" stroke={OL} strokeWidth={7} />
      </svg>
      <Tag text={(scene.tag as string) ?? 'WORLD CHAMPIONS. TOGETHER.'} at={cAt} y={1180} size={58} color="#fff" rot={-2} />
    </Camera>
  );
};

export const STORY17_SCENES: Record<string, React.FC<SceneProps>> = {photoTrip: PhotoTrip, villageTrial: VillageTrial, tooYoung: TooYoung, togetherCup: TogetherCup};
