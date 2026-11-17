import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Camera, Shake} from '../components/Fx';
import {SeriesBadge, Syn} from '../components/Host';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* IBS + vitamin B1 (long version): ibsStorm (hook), ibsTypes, gutWaves. Reuses body3 dnaSpots, b1Cell, intakeBars, earlyScience. */
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

const GUT_D = 'M60 40 H340 Q380 40 380 80 V120 Q380 160 340 160 H80 Q40 160 40 200 V230 Q40 270 80 270 H320 Q360 270 360 310 V340 Q360 380 320 380 H180';

/* a cartoon tummy with a coiled gut inside; optional squeeze wave, face and wobble */
const Tummy: React.FC<{x: number; y: number; s?: number; wave?: number; wobble?: number; face?: 'ok' | 'ouch'; tint?: string}> = ({x, y, s = 1, wave = 0, wobble = 0, face = 'ok', tint = '#f472b6'}) => {
  const frame = useCurrentFrame();
  const p = ((frame * 0.012 * Math.max(0.1, wave)) % 1) * 1400;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 560 * s, height: 620 * s, rotate: `${Math.sin(frame / 2.2) * wobble}deg`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: '45% 45% 48% 48%', background: '#fed7aa', border: `10px solid ${OL}`}} />
      <svg width={460 * s} height={460 * s} viewBox="0 0 420 420" style={{position: 'absolute', left: 50 * s, top: 110 * s}}>
        <path d={GUT_D} stroke={OL} strokeWidth={70} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={GUT_D} stroke={tint} strokeWidth={54} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {wave > 0 ? <path d={GUT_D} stroke="#fef08a" strokeWidth={30} fill="none" strokeLinecap="round" strokeDasharray="70 1400" strokeDashoffset={-p} /> : null}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 30 * s, display: 'flex', justifyContent: 'center', gap: 70 * s}}>
        {[0, 1].map((i) => <div key={i} style={{width: 34 * s, height: face === 'ouch' ? 10 * s : 34 * s, borderRadius: 20 * s, background: OL, marginTop: face === 'ouch' ? 12 * s : 0}} />)}
      </div>
    </div>
  );
};

/* ibsStorm: { badge, top, word, wordOnWord } — HOOK: an upset tummy shakes under a small storm cloud; symptom stickers pop (CRAMPS / BLOATING / STUCK / RUNNING); big "IBS" stamp. */
const IbsStorm: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = (scene.stickers as string[]) ?? ['CRAMPS', 'BLOATING', 'STUCK…', '…RUNNING'];
  const onW = (scene.stickerWords as string[]) ?? [];
  const wAt = at(captions, scene.wordOnWord, fps, dur * 0.75);
  const ws = spring({frame: frame - wAt, fps, config: {damping: 8, stiffness: 220}});
  const pos = [[60, 560, -8], [640, 520, 7], [60, 1270, 6], [600, 1290, -6]];
  return (
    <AbsoluteFill>
      <Shake at={wAt} amount={14}>
        <Camera dur={dur} from={1.08} to={1.0}>
          <AbsoluteFill style={{background: 'linear-gradient(180deg, #334155 0%, #64748b 100%)'}} />
          {new Array(16).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: 300 + random(`r${i}`) * 480, top: ((random(`t${i}`) * 300 + frame * 14) % 360) + 440, width: 8, height: 34, borderRadius: 4, background: '#93c5fd', opacity: 0.7}} />)}
          <div style={{position: 'absolute', left: 300, top: 330, width: 480, height: 150, borderRadius: 75, background: '#cbd5e1', border: `8px solid ${OL}`}} />
          <svg width={110} height={160} viewBox="0 0 50 80" style={{position: 'absolute', left: 500, top: 450, opacity: frame % 24 < 4 ? 1 : 0}}><path d="M28 0 L6 44 H24 L16 80 L44 30 H26 Z" fill="#fde047" stroke={OL} strokeWidth={4} /></svg>
          <Tummy x={260} y={720} s={1} wobble={3} face="ouch" tint="#fb7185" />
          {words.map((w, i) => {
            const a = at(captions, onW[i], fps, 4 + i * 8);
            return <div key={i} style={{position: 'absolute', left: pos[i][0], top: pos[i][1], rotate: `${pos[i][2]}deg`, opacity: frame >= a ? 1 : 0, scale: String(frame >= a ? 1 : 1.5)}}><span style={{fontFamily: DISPLAY, fontSize: 64, background: '#fff', color: '#111', padding: '4px 22px', borderRadius: 14, border: `6px solid ${OL}`, boxShadow: `0 8px 0 ${OL}`}}>{w}</span></div>;
          })}
          <div style={{position: 'absolute', left: 0, right: 0, top: 920, textAlign: 'center', opacity: frame >= wAt ? 1 : 0, scale: String(2 - ws), rotate: '-8deg'}}>
            <span style={{fontFamily: DISPLAY, fontSize: 230, color: '#ef4444', WebkitTextStroke: `12px ${OL}`, paintOrder: 'stroke fill'}}>{(scene.word as string) ?? 'IBS'}</span>
          </div>
          <Tag text={(scene.top as string) ?? 'MILLIONS LIVE WITH THIS'} at={-12} y={220} size={66} color="#ffcc4d" rot={-2} />
        </Camera>
      </Shake>
      <SeriesBadge text={(scene.badge as string) ?? 'YOUR BODY, EXPLAINED #3'} />
      <Syn x={160} y={1320} size={240} pose="shock" from={Math.round(wAt)} to={dur} />
    </AbsoluteFill>
  );
};

/* ibsTypes: { lanes[{label,color,onWord}], tag, tagOnWord } — three lane cards (TOO FAST / TOO SLOW / BOTH) with a little gut speed dial each; then "NO SINGLE TEST · NO CURE YET". */
const IbsTypes: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lanes = (scene.lanes as {label: string; color: string; onWord?: string; mode: string}[]) ?? [];
  const tAt = at(captions, scene.tagOnWord, fps, dur * 0.75);
  return (
    <Camera dur={dur} from={1.0} to={1.04}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #fdf2f8 0%, #fbcfe8 100%)'}} />
      <Tag text={(scene.top as string) ?? 'IBS = A SENSITIVE GUT, RHYTHM OFF'} at={-12} y={220} size={54} color="#fff" rot={-1} />
      {lanes.map((l, i) => {
        const a = at(captions, l.onWord, fps, 6 + i * 20);
        const s = spring({frame: frame - a, fps, config: {damping: 12, stiffness: 200}});
        const needle = l.mode === 'fast' ? 60 + Math.sin(frame / 2) * 8 : l.mode === 'slow' ? -60 + Math.sin(frame / 9) * 4 : Math.sin(frame / 6) * 70;
        return (
          <div key={i} style={{position: 'absolute', left: 90, top: 380 + i * 300, width: 900, height: 250, background: '#fff', border: `8px solid ${OL}`, borderRadius: 26, boxShadow: `0 10px 0 ${OL}`, opacity: frame >= a ? 1 : 0.25, translate: `${(1 - s) * -80}px 0`}}>
            <svg width={230} height={150} viewBox="0 0 200 120" style={{position: 'absolute', left: 30, top: 50}}>
              <path d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke="#e2e8f0" strokeWidth={22} />
              <path d="M20 110 A80 80 0 0 1 60 42" fill="none" stroke="#60a5fa" strokeWidth={22} />
              <path d="M140 42 A80 80 0 0 1 180 110" fill="none" stroke="#f87171" strokeWidth={22} />
              <line x1={100} y1={110} x2={100 + 70 * Math.sin((needle * Math.PI) / 180)} y2={110 - 70 * Math.cos((needle * Math.PI) / 180)} stroke={OL} strokeWidth={9} strokeLinecap="round" />
              <circle cx={100} cy={110} r={12} fill={OL} />
            </svg>
            <div style={{position: 'absolute', left: 290, top: 40, fontFamily: DISPLAY, fontSize: 80, color: l.color, WebkitTextStroke: `5px ${OL}`, paintOrder: 'stroke fill'}}>{l.label}</div>
            <div style={{position: 'absolute', left: 292, top: 150, fontFamily: BODY, fontWeight: 800, fontSize: 40, color: '#334155'}}>{(l as {sub?: string}).sub ?? ''}</div>
          </div>
        );
      })}
      <Tag text={(scene.tag as string) ?? 'NO SINGLE TEST · NO CURE YET'} at={tAt} y={1310} size={56} color="#ffcc4d" rot={2} />
    </Camera>
  );
};

/* gutWaves: { tag, tagOnWord, rushOnWord, stallOnWord } — big tummy: nerves (little lightning lines) trigger a squeeze wave travelling through the gut; then it rushes (fast) and stalls (stops). */
const GutWaves: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rAt = at(captions, scene.rushOnWord, fps, dur * 0.55);
  const sAt = at(captions, scene.stallOnWord, fps, dur * 0.72);
  const tAt = at(captions, scene.tagOnWord, fps, 6);
  const wave = frame < rAt ? 1 : frame < sAt ? 4 : 0.05;
  const label = frame < rAt ? 'NORMAL WAVES' : frame < sAt ? 'TOO FAST' : 'STALLED';
  const col = frame < rAt ? '#22c55e' : frame < sAt ? '#ef4444' : '#3b82f6';
  return (
    <Camera dur={dur} from={1.04} to={1.0}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #ecfccb 0%, #84cc16 90%)'}} />
      <Tummy x={210} y={520} s={1.2} wave={wave} face="ok" />
      {new Array(8).fill(0).map((_, i) => (
        <svg key={i} width={70} height={70} viewBox="0 0 40 40" style={{position: 'absolute', left: 230 + (i % 4) * 190, top: 600 + Math.floor(i / 4) * 520, opacity: (frame + i * 7) % 20 < 6 ? 1 : 0.2}}>
          <path d="M22 2 L8 22 H18 L14 38 L32 16 H22 Z" fill="#fde047" stroke={OL} strokeWidth={3} />
        </svg>
      ))}
      <Tag text={(scene.tag as string) ?? 'MUSCLE WAVES + NERVES'} at={tAt} y={250} size={66} color="#fff" rot={-2} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center'}}>
        <span style={{fontFamily: DISPLAY, fontSize: 76, color: '#fff', background: col, padding: '4px 26px', borderRadius: 16, border: `6px solid ${OL}`}}>{label}</span>
      </div>
    </Camera>
  );
};

export const BODY4_SCENES: Record<string, React.FC<SceneProps>> = {ibsStorm: IbsStorm, ibsTypes: IbsTypes, gutWaves: GutWaves};
