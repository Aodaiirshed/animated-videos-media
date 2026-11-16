import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Boy} from '../components/Boy';
import {Camera} from '../components/Fx';
import {SeriesBadge} from '../components/Host';
import {wordFrame} from './kit';
import {DISPLAY} from '../fonts';

/* Story set 14 (Guess the Player #12): posterRoom (hook), pelePair. Posters show an ORIGINAL generic star silhouette — no real likeness. */
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

const Poster: React.FC<{x: number; y: number; r: number; w: number; num: string}> = ({x, y, r, w, num}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: w * 1.35, background: 'linear-gradient(180deg, #f8fafc, #cbd5e1)', border: `6px solid ${OL}`, rotate: `${r}deg`, boxShadow: '0 8px 0 rgba(0,0,0,0.35)', overflow: 'hidden'}}>
    <svg viewBox="0 0 100 135" width={w} height={w * 1.35}>
      <circle cx={50} cy={40} r={18} fill="#334155" />
      <path d="M18 135 Q20 72 50 66 Q80 72 82 135 Z" fill="#f8fafc" stroke="#334155" strokeWidth={5} />
      <text x={50} y={115} textAnchor="middle" fontFamily={DISPLAY} fontSize={30} fill="#334155">{num}</text>
    </svg>
  </div>
);

/* posterRoom: { badge, top, tag, tagOnWord } — HOOK: a small bedroom, every wall covered in posters of the same (generic) star; the kid stares at them. */
const PosterRoom: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const posters = [] as React.ReactNode[];
  let k = 0;
  for (let row = 0; row < 5; row++) for (let col = 0; col < 5; col++) {
    const x = 20 + col * 210 + ((row * 37) % 50);
    const y = 380 + row * 190 + ((col * 23) % 30);
    const show = frame >= (k * 1.2);
    if (show) posters.push(<Poster key={k} x={x} y={y} r={((k * 47) % 14) - 7} w={150} num="7" />);
    k++;
  }
  return (
    <AbsoluteFill>
      <Camera dur={dur} from={1.12} to={1.0}>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, #e0e7ff 0%, #c7d2fe 70%, #a16207 71%, #78350f 100%)'}} />
        {posters}
        <Boy x={540} y={1540} height={520} stage="teen" pose="stand" phase={frame / 3} skin={sb.character.palette.skin} rim="#fde68a" glow={0.4} mood="happy" />
        <Tag text={(scene.top as string) ?? 'EVERY WALL. ONE PLAYER.'} at={-12} y={235} size={70} color="#ffcc4d" rot={-2} />
        <Tag text={(scene.tag as string) ?? 'AGE 14'} at={at(captions, scene.tagOnWord, fps, dur * 0.4)} y={900} size={80} color="#fff" rot={4} />
      </Camera>
      <SeriesBadge text={(scene.badge as string) ?? 'GUESS THE PLAYER #12'} />
    </AbsoluteFill>
  );
};

/* pelePair: { left, right, tag, tagOnWord } — two framed cards side by side: "1958 · AGE 17" (a generic silhouette) and "2018 · AGE 19" (the hero); a gold link appears between them. */
const PelePair: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tAt = at(captions, scene.tagOnWord, fps, dur * 0.5);
  const a = spring({frame: frame - 2, fps, config: {damping: 12}});
  const b = spring({frame: frame - 12, fps, config: {damping: 12}});
  const link = interpolate(frame, [tAt, tAt + 12], [0, 1], clamp);
  const card = (x: number, s: number, label: string, child: React.ReactNode) => (
    <div style={{position: 'absolute', left: x, top: 560, width: 420, height: 620, background: '#0f172a', border: `10px solid #fbbf24`, borderRadius: 28, scale: String(s), overflow: 'hidden', boxShadow: '0 0 60px rgba(251,191,36,0.4)'}}>
      {child}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 20, textAlign: 'center', fontFamily: DISPLAY, fontSize: 56, color: '#fde68a'}}>{label}</div>
    </div>
  );
  return (
    <Camera dur={dur} from={1.0} to={1.06}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1e3a8a 0%, #050816 80%)'}} />
      {card(70, a, (scene.left as string) ?? '1958 · AGE 17',
        <svg viewBox="0 0 420 520" width={420} height={520}><circle cx={210} cy={170} r={70} fill="#475569" /><path d="M90 520 Q100 300 210 280 Q320 300 330 520 Z" fill="#facc15" stroke="#475569" strokeWidth={8} /><text x={210} y={460} textAnchor="middle" fontFamily={DISPLAY} fontSize={90} fill="#14532d">?</text></svg>)}
      {card(590, b, (scene.right as string) ?? '2018 · AGE 19',
        <div style={{position: 'absolute', left: -330, top: -560}}><Boy x={540} y={1120} height={520} stage="teen" pose="cheer" phase={frame / 3} skin={sb.character.palette.skin} rim="#fde68a" glow={0.5} mood="laugh" /></div>)}
      <div style={{position: 'absolute', left: 480, top: 840, width: 120 * link, height: 24, background: '#fbbf24', border: `5px solid ${OL}`, borderRadius: 12}} />
      <Tag text={(scene.tag as string) ?? 'ONLY 2 TEENAGERS EVER'} at={tAt} y={300} size={68} color="#ffcc4d" rot={-3} />
      <Tag text={(scene.tag2 as string) ?? 'SCORED IN A WORLD CUP FINAL'} at={tAt + 8} y={1260} size={54} color="#fff" rot={2} />
    </Camera>
  );
};

export const STORY14_SCENES: Record<string, React.FC<SceneProps>> = {posterRoom: PosterRoom, pelePair: PelePair};
