import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Camera, Shake} from '../components/Fx';
import {DailyPill, SeriesBadge, Syn} from '../components/Host';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* What If? #3 — the Moon disappears. moonVanish (hook), darkNight, tideBars, tiltWobble, lookUp (loop). */
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

const Stars: React.FC<{n?: number; bright?: number}> = ({n = 90, bright = 1}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {new Array(n).fill(0).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: random(`sx${i}`) * 1080, top: random(`sy${i}`) * 1100, width: 4 + random(`ss${i}`) * 5, height: 4 + random(`ss${i}`) * 5, borderRadius: '50%', background: '#fff', opacity: bright * (0.35 + 0.5 * Math.abs(Math.sin(frame / 14 + i)))}} />
      ))}
    </>
  );
};

const Moon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <circle cx={100} cy={100} r={92} fill="#e5e7eb" stroke={OL} strokeWidth={8} />
    <circle cx={70} cy={70} r={18} fill="#cbd5e1" /><circle cx={130} cy={110} r={24} fill="#cbd5e1" /><circle cx={80} cy={140} r={12} fill="#cbd5e1" /><circle cx={135} cy={55} r={9} fill="#cbd5e1" />
  </svg>
);

const Hills: React.FC<{light: number}> = ({light}) => (
  <svg width={1080} height={1920} style={{position: 'absolute'}}>
    <path d="M0 1180 Q260 1040 520 1160 T1080 1120 V1920 H0 Z" fill={`rgba(30,58,48,${0.4 + light * 0.6})`} />
    <path d="M0 1320 Q300 1220 600 1330 T1080 1290 V1920 H0 Z" fill={`rgba(20,40,34,${0.5 + light * 0.5})`} />
    {/* sea strip */}
    <rect x={0} y={1420} width={1080} height={500} fill={`rgba(30,64,120,${0.35 + light * 0.65})`} />
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={120 + i * 180} y={1450 + (i % 2) * 40} width={120} height={8} rx={4} fill="#e0f2fe" opacity={0.15 + light * 0.6} />)}
  </svg>
);

/* moonVanish: { badge, top, vanishOnWord } — HOOK: full moon over hills and sea; on the word it shrinks to a dot and pops; the land goes dark. */
const MoonVanish: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const vAt = at(captions, scene.vanishOnWord, fps, dur * 0.3);
  const s = interpolate(frame, [vAt, vAt + 8], [1, 0], {...clamp, easing: Easing.in(Easing.back(2))});
  const light = interpolate(frame, [vAt, vAt + 20], [1, 0.15], clamp);
  const flash = interpolate(frame, [vAt + 7, vAt + 9, vAt + 18], [0, 0.6, 0], clamp);
  return (
    <AbsoluteFill>
      <Shake at={vAt + 8} amount={14}>
        <Camera dur={dur} from={1.08} to={1.0}>
          <AbsoluteFill style={{background: `linear-gradient(180deg, rgb(${Math.round(12 + 18 * light)},${Math.round(18 + 30 * light)},${Math.round(48 + 50 * light)}) 0%, #05070f 100%)`}} />
          <Stars bright={1.2 - light * 0.5} />
          <div style={{position: 'absolute', left: 560, top: 420, scale: String(s), boxShadow: `0 0 ${160 * s}px ${60 * s}px rgba(255,255,230,0.35)`, borderRadius: '50%'}}><Moon size={320} /></div>
          <div style={{position: 'absolute', left: 720, top: 580, width: 20, height: 20, borderRadius: 10, background: '#fff', opacity: flash * 1.5, boxShadow: '0 0 80px 40px #fff'}} />
          <Hills light={light} />
          <Tag text={(scene.top as string) ?? 'TONIGHT, THE MOON VANISHES'} at={-12} y={230} size={70} color="#ffcc4d" rot={-2} />
        </Camera>
      </Shake>
      <SeriesBadge text={(scene.badge as string) ?? 'WHAT IF? #3'} />
      <Syn x={170} y={1250} size={260} pose="shock" from={Math.round(vAt + 6)} to={Math.round(vAt + 46)} />
    </AbsoluteFill>
  );
};

/* darkNight: { tag, tagOnWord } — split screen: NOW (moonlit path, owl) vs NO MOON (pitch black, only stars). */
const DarkNight: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const wipe = interpolate(frame, [4, 22], [1080, 540], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <Camera dur={dur} from={1.0} to={1.05}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #1e3a8a 0%, #0f172a 100%)'}} />
      <div style={{position: 'absolute', left: 300, top: 420}}><Moon size={180} /></div>
      <Hills light={1} />
      <div style={{position: 'absolute', left: wipe, top: 0, width: 1080, height: 1920, background: '#020308', borderLeft: '8px solid #ffd84a', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: -wipe, top: 0, width: 1080, height: 1920}}><Stars n={140} bright={1.4} /></div>
      </div>
      <div style={{position: 'absolute', left: 60, top: 470, fontFamily: DISPLAY, fontSize: 64, color: '#fde68a'}}>NOW</div>
      <div style={{position: 'absolute', left: Math.max(600, wipe + 60), top: 470, fontFamily: DISPLAY, fontSize: 64, color: '#fff'}}>NO MOON</div>
      <Tag text={(scene.tag as string) ?? 'NIGHTS: FAR DARKER'} at={at(captions, scene.tagOnWord, fps, dur * 0.4)} y={230} size={68} color="#fff" rot={-3} />
    </Camera>
  );
};

/* tideBars: { tag, tagOnWord, now, without } — a beach ruler: today's tide range bar vs the NO MOON bar (about a third). */
const TideBars: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const g1 = spring({frame: frame - 4, fps, config: {damping: 14}});
  const g2 = spring({frame: frame - at(captions, scene.tagOnWord, fps, dur * 0.45), fps, config: {damping: 14}});
  const bar = (x: number, h: number, g: number, label: string, color: string) => (
    <div style={{position: 'absolute', left: x, top: 1250 - h * g, width: 260, height: h * g, background: `repeating-linear-gradient(180deg, ${color} 0 30px, #e0f2fe 30px 36px)`, border: `8px solid ${OL}`, borderRadius: 18}}>
      <div style={{position: 'absolute', top: -90, width: '100%', textAlign: 'center', fontFamily: DISPLAY, fontSize: 56, color: '#fff', WebkitTextStroke: `5px ${OL}`, paintOrder: 'stroke fill'}}>{label}</div>
    </div>
  );
  return (
    <Camera dur={dur} from={1.0} to={1.05}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #7dd3fc 0%, #e0f2fe 55%, #fde68a 56%, #f59e0b 100%)'}} />
      {bar(170, 660, g1, (scene.now as string) ?? 'TIDES NOW', '#2563eb')}
      {bar(650, 220, g2, (scene.without as string) ?? 'NO MOON', '#60a5fa')}
      <div style={{position: 'absolute', left: 620, top: 1060, width: 320, textAlign: 'center', fontFamily: DISPLAY, fontSize: 110, color: '#fff', WebkitTextStroke: `8px ${OL}`, paintOrder: 'stroke fill', opacity: g2}}>⅓</div>
      <Tag text={(scene.tag as string) ?? 'THE SUN STILL PULLS'} at={at(captions, scene.tagOnWord, fps, dur * 0.45)} y={230} size={66} color="#ffcc4d" rot={-3} />
      <Syn x={150} y={1380} size={210} pose="think" from={6} to={dur} />
    </Camera>
  );
};

/* tiltWobble: { tag, tagOnWord, wobbleOnWord } — Earth with its axis at 23.4°; a dashed moon orbit; the moon fades and the axis starts to swing wildly. Pill. */
const TiltWobble: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const wAt = at(captions, scene.wobbleOnWord, fps, dur * 0.45);
  const amp = interpolate(frame, [wAt, wAt + 30], [0, 1], clamp);
  const tilt = 23.4 + amp * (Math.sin((frame - wAt) / 7) * 30 + Math.sin((frame - wAt) / 3.3) * 12);
  const moonO = interpolate(frame, [wAt - 10, wAt + 4], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <Camera dur={dur} from={1.0} to={1.06}>
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #1e1b4b 0%, #020617 80%)'}} />
        <Stars n={70} />
        <svg width={1080} height={1200} viewBox="0 0 1080 1200" style={{position: 'absolute', top: 340}}>
          <ellipse cx={540} cy={500} rx={430} ry={130} stroke="#94a3b8" strokeWidth={4} strokeDasharray="14 14" fill="none" opacity={moonO} />
          <g opacity={moonO} transform={`translate(${540 + Math.cos(frame / 20) * 430} ${500 + Math.sin(frame / 20) * 130})`}><circle r={46} fill="#e5e7eb" stroke={OL} strokeWidth={6} /></g>
          <g transform={`rotate(${tilt} 540 500)`}>
            <line x1={540} y1={250} x2={540} y2={750} stroke="#fde68a" strokeWidth={10} strokeLinecap="round" />
            <circle cx={540} cy={500} r={200} fill="#2563eb" stroke={OL} strokeWidth={10} />
            <path d="M420 420 q60 -60 120 -10 q40 40 -20 80 q-60 30 -100 -70Z M560 560 q60 -30 110 20 q-20 70 -90 40Z" fill="#22c55e" />
          </g>
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center', fontFamily: BODY, fontWeight: 900, fontSize: 56, color: '#fde68a'}}>TILT: {Math.round(tilt)}°</div>
        <Tag text={(scene.tag as string) ?? 'THE MOON KEEPS US STEADY'} at={at(captions, scene.tagOnWord, fps, 4)} y={230} size={64} color="#ffcc4d" rot={-2} />
        <DailyPill from={Math.round(dur * 0.55)} y={1260} />
      </Camera>
    </AbsoluteFill>
  );
};

/* lookUp: last line — back to the calm moonlit night (moon present), Syn points up. Flows into moonVanish. */
const LookUp: React.FC<SceneProps> = ({scene, durationInFrames: dur}) => (
  <AbsoluteFill>
    <Camera dur={dur} from={1.0} to={1.08}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgb(30,48,98) 0%, #05070f 100%)'}} />
      <Stars n={60} bright={0.7} />
      <div style={{position: 'absolute', left: 560, top: 420, boxShadow: '0 0 160px 60px rgba(255,255,230,0.35)', borderRadius: '50%'}}><Moon size={320} /></div>
      <Hills light={1} />
      <Tag text={(scene.top as string) ?? "IT'S STILL THERE… FOR NOW"} at={2} y={230} size={68} color="#fff" rot={-2} />
    </Camera>
    <Syn x={170} y={1250} size={260} pose="point" from={4} to={dur} />
  </AbsoluteFill>
);

export const WHATIF3_SCENES: Record<string, React.FC<SceneProps>> = {
  moonVanish: MoonVanish,
  darkNight: DarkNight,
  tideBars: TideBars,
  tiltWobble: TiltWobble,
  lookUp: LookUp,
};
