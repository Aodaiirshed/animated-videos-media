import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Boy} from '../components/Boy';
import {Camera, Shake} from '../components/Fx';
import {DailyPill, SeriesBadge} from '../components/Host';
import {wordFrame} from './kit';
import {DISPLAY} from '../fonts';

/* Story set 13 (Guess the Player #11): jumpRecord (hook), farTown, clubNo, seasonRecord. */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OL = '#1b1b22';
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);

const Tag: React.FC<{text: string; at: number; x?: number; y: number; color?: string; size?: number; rot?: number; fg?: string}> = ({text, at: a, x = 540, y, color = '#ffcc4d', size = 64, rot = -3, fg = '#111'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - a, fps, config: {damping: 10, stiffness: 190}});
  return (
    <div style={{position: 'absolute', left: x - 500, width: 1000, top: y, textAlign: 'center', opacity: frame >= a ? 1 : 0, scale: String(1.6 - s * 0.6), rotate: `${rot}deg`}}>
      <span style={{fontFamily: DISPLAY, fontSize: size, color: fg, background: color, padding: '4px 28px', borderRadius: 16, border: `6px solid ${OL}`, boxShadow: `0 9px 0 ${OL}`}}>{text}</span>
    </div>
  );
};

const Stamp: React.FC<{text: string; at: number; y: number; size?: number; rot?: number; color?: string}> = ({text, at: a, y, size = 140, rot = -8, color = '#ef4444'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - a, fps, config: {damping: 8, stiffness: 200}});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: frame >= a ? 1 : 0, scale: String(2.4 - s * 1.4), rotate: `${rot}deg`}}>
      <span style={{fontFamily: DISPLAY, fontSize: size, color, border: `14px solid ${color}`, padding: '0 34px', borderRadius: 26, background: '#000000b0'}}>{text}</span>
    </div>
  );
};

/* jumpRecord: { badge, jumpOnWord, tag, top } — HOOK: a 5-year-old on a sand pit does a standing long jump; tape measure; 1.63 m; WORLD RECORD stamp. */
const JumpRecord: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const jAt = at(captions, scene.jumpOnWord, fps, dur * 0.35);
  const p = interpolate(frame, [jAt - 4, jAt + 12], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const x = 260 + p * 470;
  const y = 1300 - Math.sin(p * Math.PI) * 240;
  const len = interpolate(frame, [jAt + 10, jAt + 26], [0, 1.63], clamp);
  return (
    <AbsoluteFill>
      <Shake at={jAt + 12} amount={16}>
        <Camera dur={dur} from={1.06} to={1.0}>
          <AbsoluteFill style={{background: 'linear-gradient(180deg, #7dd3fc 0%, #bae6fd 50%, #ef4444 51%, #dc2626 60%, #fcd34d 61%, #f59e0b 100%)'}} />
          {/* track lanes */}
          {[0, 1, 2, 3].map((i) => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 985 + i * 34, height: 4, background: '#fff', opacity: 0.6}} />)}
          {/* take-off line */}
          <div style={{position: 'absolute', left: 300, top: 1170, width: 14, height: 200, background: '#fff', border: `4px solid ${OL}`}} />
          {/* tape */}
          <div style={{position: 'absolute', left: 307, top: 1400, width: 470 * (len / 1.63), height: 40, background: '#fef08a', border: `5px solid ${OL}`, overflow: 'hidden'}}>
            {new Array(17).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: i * 29, top: 0, width: 4, height: i % 5 === 0 ? 30 : 16, background: OL}} />)}
          </div>
          <Boy x={x} y={y} height={360} stage="child" pose={p > 0 && p < 1 ? 'cheer' : 'stand'} phase={frame / 3} skin={sb.character.palette.skin} rim="#fde68a" glow={0.3} mood={p >= 1 ? 'laugh' : 'determined'} />
          <div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', top: 820, fontFamily: DISPLAY, fontSize: 130, color: OL, opacity: len > 0 ? 1 : 0}}>{len.toFixed(2)} m</div>
          <Tag text={(scene.top as string) ?? 'AGE 5. WORLD RECORD.'} at={-12} y={250} size={84} color="#ffcc4d" rot={-2} />
          <Stamp text={(scene.stamp as string) ?? 'NOT IN FOOTBALL'} at={at(captions, scene.stampOnWord, fps, dur * 0.7)} y={540} size={78} rot={-6} color="#ef4444" />
        </Camera>
      </Shake>
      <SeriesBadge text={(scene.badge as string) ?? 'GUESS THE PLAYER #11'} />
    </AbsoluteFill>
  );
};

/* farTown: { from, to, tag, tagOnWord } — a little plane flies from a city skyline to a small town with wooden houses and wind. */
const FarTown: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(frame, [4, dur * 0.6], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return (
    <Camera dur={dur} from={1.0} to={1.08}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #60a5fa 0%, #bfdbfe 55%, #86efac 56%, #16a34a 100%)'}} />
      {/* city (left) */}
      {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{position: 'absolute', left: 30 + i * 70, top: 780 - (i % 3) * 90, width: 60, height: 300 + (i % 3) * 90, background: '#64748b', border: `5px solid ${OL}`, opacity: 1 - p * 0.6}} />)}
      {/* town (right) */}
      {[0, 1, 2].map((i) => (
        <svg key={i} width={170} height={170} viewBox="0 0 170 170" style={{position: 'absolute', left: 600 + i * 150, top: 900 - (i % 2) * 30, opacity: 0.4 + p * 0.6}}>
          <rect x={20} y={70} width={130} height={95} fill={['#b91c1c', '#facc15', '#f8fafc'][i]} stroke={OL} strokeWidth={7} />
          <path d="M10 75 L85 10 L160 75 Z" fill="#334155" stroke={OL} strokeWidth={7} />
          <rect x={70} y={115} width={30} height={50} fill="#78350f" stroke={OL} strokeWidth={5} />
        </svg>
      ))}
      {/* plane */}
      <svg width={220} height={110} viewBox="0 0 220 110" style={{position: 'absolute', left: 150 + p * 640, top: 470 - Math.sin(p * Math.PI) * 150, rotate: `${-8 + p * 16}deg`}}>
        <path d="M10 60 Q110 30 210 55 Q110 80 10 60 Z" fill="#f8fafc" stroke={OL} strokeWidth={7} />
        <path d="M90 55 L60 10 L120 55 Z M150 52 L170 20 L185 52 Z" fill="#ef4444" stroke={OL} strokeWidth={6} />
      </svg>
      <Boy x={760} y={1420} height={380} stage="child" pose="run" phase={frame / 3} skin={sb.character.palette.skin} rim="#fde68a" glow={0.3} mood="happy" />
      <Tag text={(scene.tag1 as string) ?? 'BORN IN ENGLAND'} at={at(captions, scene.tag1OnWord, fps, 4)} y={240} size={66} color="#fff" rot={-3} />
      <Tag text={(scene.tag2 as string) ?? 'RAISED FAR AWAY'} at={at(captions, scene.tag2OnWord, fps, dur * 0.55)} y={360} size={66} color="#ffcc4d" rot={2} />
    </Camera>
  );
};

/* clubNo: { stampOnWord, tag } — a big club office; a scout's clipboard with a cartoon kid's file; NO stamp slams. */
const ClubNo: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sAt = at(captions, scene.stampOnWord, fps, dur * 0.6);
  return (
    <Shake at={sAt} amount={22}>
      <Camera dur={dur} from={1.1} to={1.0}>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1150, height: 770, background: '#78350f', borderTop: `10px solid ${OL}`}} />
        <div style={{position: 'absolute', left: 230, top: 420, width: 620, height: 800, background: '#f8fafc', border: `12px solid ${OL}`, borderRadius: 20, rotate: '-3deg', boxShadow: `0 16px 0 ${OL}`}}>
          <div style={{margin: '40px auto 0', width: 200, height: 40, background: '#94a3b8', borderRadius: 10}} />
          <div style={{position: 'absolute', left: 60, top: 140, width: 180, height: 220, background: '#cbd5e1', border: `6px solid ${OL}`, overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: -60, top: -100}}><Boy x={150} y={420} height={300} stage="teen" pose="stand" skin={sb.character.palette.skin} rim="#fde68a" glow={0.1} mood="neutral" /></div>
          </div>
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{position: 'absolute', left: 280, top: 160 + i * 40, width: 260 - (i % 3) * 50, height: 14, background: '#cbd5e1', borderRadius: 7}} />)}
          {[0, 1, 2, 3].map((i) => <div key={`b${i}`} style={{position: 'absolute', left: 60, top: 420 + i * 50, width: 480 - (i % 2) * 120, height: 14, background: '#cbd5e1', borderRadius: 7}} />)}
        </div>
        <Stamp text={(scene.stamp as string) ?? 'NO THANKS'} at={sAt} y={700} size={150} rot={-12} />
        <Tag text={(scene.tag as string) ?? 'BIG CLUB TRIAL'} at={scene.badge ? -12 : 4} y={230} size={70} color="#fff" rot={-2} />
      </Camera>
      {scene.badge ? <SeriesBadge text={scene.badge as string} /> : null}
    </Shake>
  );
};

/* seasonRecord: { to, label, tag, tagOnWord, countOnWord } — a record book flips open; a counter races to `to`; NEW RECORD tag; daily pill. */
const SeasonRecord: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cAt = at(captions, scene.countOnWord, fps, 6);
  const to = (scene.to as number) ?? 36;
  const n = Math.round(interpolate(frame, [cAt, cAt + 36], [0, to], {...clamp, easing: Easing.out(Easing.cubic)}));
  const open = spring({frame: frame - 2, fps, config: {damping: 14}});
  return (
    <Camera dur={dur} from={1.0} to={1.06}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #4c1d95 0%, #0f0a1e 80%)'}} />
      {new Array(30).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: random(`s${i}`) * 1080, top: random(`t${i}`) * 1900, width: 8, height: 8, borderRadius: 4, background: '#fde68a', opacity: 0.3 + 0.5 * Math.abs(Math.sin(frame / 8 + i))}} />)}
      <div style={{position: 'absolute', left: 140, top: 560, width: 800, height: 560, perspective: 1600}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 400, height: 560, background: '#fef3c7', border: `10px solid ${OL}`, borderRadius: '20px 0 0 20px'}} />
        <div style={{position: 'absolute', left: 400, top: 0, width: 400, height: 560, background: '#fef3c7', border: `10px solid ${OL}`, borderRadius: '0 20px 20px 0', transformOrigin: 'left center', transform: `rotateY(${(1 - open) * -170}deg)`}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: DISPLAY, fontSize: 260, color: '#b45309', WebkitTextStroke: `10px ${OL}`, paintOrder: 'stroke fill', opacity: open}}>{n}</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', fontFamily: DISPLAY, fontSize: 56, color: OL, opacity: open}}>{(scene.label as string) ?? 'GOALS IN ONE SEASON'}</div>
      </div>
      <Tag text={(scene.tag as string) ?? 'NEW RECORD'} at={at(captions, scene.tagOnWord, fps, dur * 0.5)} y={300} size={90} color="#ffcc4d" rot={-4} />
      <DailyPill from={Math.round(dur * 0.4)} y={1220} />
    </Camera>
  );
};

export const STORY13_SCENES: Record<string, React.FC<SceneProps>> = {
  jumpRecord: JumpRecord,
  farTown: FarTown,
  clubNo: ClubNo,
  seasonRecord: SeasonRecord,
};
