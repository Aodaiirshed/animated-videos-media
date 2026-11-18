import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Boy} from '../components/Boy';
import {Camera, Shake} from '../components/Fx';
import {DailyPill, SeriesBadge} from '../components/Host';
import {wordFrame} from './kit';
import {DISPLAY} from '../fonts';

/* Story set 18 (Guess the Player #16, SHORT): fenceBan, jugglingYears, soloRun. Original cartoon hero, no likeness, no crests. */
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
const Ball: React.FC<{x: number; y: number; s?: number; r?: number}> = ({x, y, s = 70, r = 0}) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{position: 'absolute', left: x - s / 2, top: y - s / 2, rotate: `${r}deg`}}>
    <circle cx={50} cy={50} r={44} fill="#fff" stroke={OL} strokeWidth={8} /><path d="M50 26 L70 40 L62 64 L38 64 L30 40 Z" fill={OL} />
  </svg>
);

/* fenceBan: { badge, signOnWord } — HOOK. A kid behind a wire fence watches other kids play a match; a sign "NO MATCHES UNTIL 14" slams on. */
const FenceBan: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sAt = at(captions, scene.signOnWord, fps, 6);
  const ss = spring({frame: frame - sAt, fps, config: {damping: 9, stiffness: 240}});
  const bx = 300 + ((frame * 9) % 600);
  return (
    <Shake at={sAt} amount={14}>
      <Camera dur={dur} from={1.06} to={1.0}>
        <AbsoluteFill style={{background: 'linear-gradient(180deg,#38bdf8 0%, #bae6fd 40%, #22c55e 41%, #15803d 100%)'}} />
        {[0, 1, 2, 3].map((i) => <Boy key={i} x={220 + i * 220} y={900} height={240} stage="child" pose="run" phase={frame / 3 + i} skin={sb.character.palette.skin} rim="#fde68a" glow={0.1} mood="happy" flip={i % 2 === 1} />)}
        <Ball x={bx} y={880} s={50} r={frame * 15} />
        {/* fence */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 640, height: 720, backgroundImage: 'repeating-linear-gradient(45deg, rgba(30,41,59,0.85) 0 5px, transparent 5px 46px), repeating-linear-gradient(-45deg, rgba(30,41,59,0.85) 0 5px, transparent 5px 46px)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 630, height: 16, background: '#334155'}} />
        <Boy x={540} y={1400} height={560} stage="child" pose="stand" skin={sb.character.palette.skin} rim="#fde68a" glow={0.2} mood="sad" />
        <div style={{position: 'absolute', left: 150, top: 440, rotate: '-6deg', opacity: frame >= sAt ? 1 : 0, scale: String(2 - ss), fontFamily: DISPLAY, fontSize: 88, color: '#fff', background: '#dc2626', border: `10px solid ${OL}`, borderRadius: 18, padding: '0 30px', whiteSpace: 'nowrap', boxShadow: `0 12px 0 ${OL}`}}>NO MATCHES UNTIL 14</div>
        <Tag text="RULE FROM HIS DAD" at={-12} y={260} size={60} color="#ffcc4d" rot={2} />
      </Camera>
      <SeriesBadge text={(scene.badge as string) ?? 'GUESS THE PLAYER #16'} />
    </Shake>
  );
};

/* jugglingYears: { hoursOnWord, yearsOnWord } — the kid juggles alone; a counter climbs; then a calendar flips 7 years. */
const JugglingYears: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const hAt = at(captions, scene.hoursOnWord, fps, dur * 0.3);
  const yAt = at(captions, scene.yearsOnWord, fps, dur * 0.7);
  const bounce = Math.abs(Math.sin(frame / 4));
  const juggles = Math.round(interpolate(frame, [0, dur], [0, 9999], clamp));
  const year = Math.round(interpolate(frame, [yAt, yAt + 16], [1, 7], clamp));
  return (
    <Camera dur={dur} from={1.0} to={1.06}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#fdba74 0%, #fde68a 55%, #65a30d 56%, #3f6212 100%)'}} />
      <Boy x={540} y={1330} height={600} stage="child" pose={bounce > 0.8 ? 'kick' : 'stand'} phase={frame / 4} skin={sb.character.palette.skin} rim="#fde68a" glow={0.3} mood="happy" />
      <Ball x={600} y={1240 - bounce * 360} s={90} r={frame * 18} />
      <div style={{position: 'absolute', width: '100%', top: 300, textAlign: 'center', fontFamily: DISPLAY, fontSize: 110, color: '#fff', WebkitTextStroke: `9px ${OL}`, paintOrder: 'stroke fill'}}>{juggles.toLocaleString('en-US')}</div>
      <Tag text="3 HOURS A DAY" at={hAt} y={470} size={62} color="#ffcc4d" rot={-3} />
      <Tag text={`YEAR ${year} OF 7`} at={yAt} y={580} size={62} color="#fff" rot={3} />
    </Camera>
  );
};

/* soloRun: { awardOnWord } — a long dotted path across a pitch past 6 defenders to the goal; "70 M" counter; award ribbon "GOAL OF THE YEAR". */
const SoloRun: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const aAt = at(captions, scene.awardOnWord, fps, dur * 0.65);
  const t = interpolate(frame, [0, aAt], [0, 1], clamp);
  const px = 140 + t * 800;
  const py = 1250 - t * 560 + Math.sin(t * 18) * 60;
  const as = spring({frame: frame - aAt, fps, config: {damping: 10}});
  return (
    <Camera dur={dur} from={1.0} to={1.06}>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(180deg, #16a34a 0 120px, #15803d 120px 240px)'}} />
      <div style={{position: 'absolute', left: 820, top: 560, width: 220, height: 120, border: '10px solid #fff', borderBottom: 'none'}} />
      {[[300, 1150], [420, 1000], [520, 1080], [640, 880], [720, 960], [820, 760]].map(([x, y], i) => (
        <div key={i} style={{position: 'absolute', left: x - 30, top: y - 60, width: 60, height: 120, borderRadius: 30, background: '#475569', border: `6px solid ${OL}`, opacity: 0.85, rotate: t * 800 > x - 140 ? '-25deg' : '0deg'}} />
      ))}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d={`M140 1250 ${new Array(20).fill(0).map((_, i) => { const tt = (i + 1) / 20; return `L${140 + tt * 800} ${1250 - tt * 560 + Math.sin(tt * 18) * 60}`; }).join(' ')}`} stroke="#fde047" strokeWidth={10} strokeDasharray="18 18" fill="none" opacity={0.5} strokeDashoffset={-frame * 3} />
      </svg>
      <Boy x={px} y={py + 90} height={220} stage="adult" pose="run" phase={frame / 2} skin={sb.character.palette.skin} rim="#fde68a" glow={0.4} mood="happy" />
      <div style={{position: 'absolute', width: '100%', top: 290, textAlign: 'center', fontFamily: DISPLAY, fontSize: 130, color: '#fff', WebkitTextStroke: `10px ${OL}`, paintOrder: 'stroke fill'}}>{Math.round(t * 70)} M</div>
      <div style={{position: 'absolute', left: 170, top: 1180, width: 740, textAlign: 'center', opacity: frame >= aAt ? 1 : 0, scale: String(0.5 + as * 0.5)}}>
        <span style={{fontFamily: DISPLAY, fontSize: 70, color: '#111', background: '#facc15', padding: '6px 30px', borderRadius: 18, border: `8px solid ${OL}`, boxShadow: `0 10px 0 ${OL}`}}>🏆 GOAL OF THE YEAR</span>
      </div>
      <DailyPill from={aAt + 6} y={1310} />
    </Camera>
  );
};

export const STORY18_SCENES: Record<string, React.FC<SceneProps>> = {fenceBan: FenceBan, jugglingYears: JugglingYears, soloRun: SoloRun};
