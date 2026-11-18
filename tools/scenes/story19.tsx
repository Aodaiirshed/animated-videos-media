import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Boy} from '../components/Boy';
import {Camera, Shake} from '../components/Fx';
import {DailyPill, SeriesBadge} from '../components/Host';
import {wordFrame} from './kit';
import {DISPLAY} from '../fonts';

/* Story set 19 (Guess the Player #17, keeper): shootout, originTrip, semiRun. Text fields come from the storyboard so the Arabic version reuses the scenes. Original cartoon keeper, no likeness, no crests. */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OL = '#1b1b22';
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);

const Tag: React.FC<{text: string; a: number; y: number; color?: string; size?: number; rot?: number}> = ({text, a, y, color = '#ffcc4d', size = 64, rot = -3}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < a) return null;
  const s = spring({frame: frame - a, fps, config: {damping: 10, stiffness: 190}});
  return (
    <div style={{position: 'absolute', left: 40, right: 140, top: y, textAlign: 'center', scale: String(1.6 - s * 0.6), rotate: `${rot}deg`}}>
      <span dir="auto" style={{unicodeBidi: 'plaintext', fontFamily: DISPLAY, fontSize: size, color: '#111', background: color, padding: '4px 28px', borderRadius: 16, border: `6px solid ${OL}`, boxShadow: `0 9px 0 ${OL}`}}>{text}</span>
    </div>
  );
};
const Ball: React.FC<{x: number; y: number; s?: number; r?: number}> = ({x, y, s = 70, r = 0}) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{position: 'absolute', left: x - s / 2, top: y - s / 2, rotate: `${r}deg`}}>
    <circle cx={50} cy={50} r={44} fill="#fff" stroke={OL} strokeWidth={8} /><path d="M50 26 L70 40 L62 64 L38 64 L30 40 Z" fill={OL} />
  </svg>
);

/* shootout: { badge, onWords[3], labels[3], noneOnWord, top } — HOOK. A keeper in goal; three penalties fly in on three words: post, save, save; scoreboard "0". */
const Shootout: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ws = (scene.onWords as string[]) ?? [];
  const labels = (scene.labels as string[]) ?? ['POST', 'SAVED', 'SAVED'];
  const kicks = [0, 1, 2].map((i) => at(captions, ws[i], fps, 4 + i * 14));
  const nAt = at(captions, scene.noneOnWord, fps, dur * 0.8);
  const last = kicks.filter((k) => frame >= k).length - 1;
  const targets = [[300, 560], [760, 640], [520, 600]];
  const dive = last >= 0 ? (last === 1 ? 1 : last === 2 ? -0.4 : -1) : 0;
  return (
    <Shake at={nAt} amount={12}>
      <Camera dur={dur} from={1.05} to={1.0}>
        <AbsoluteFill style={{background: 'linear-gradient(180deg,#0f172a 0%, #1e293b 36%, #16a34a 37%, #15803d 100%)'}} />
        {new Array(30).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: (i * 97) % 1080, top: 300 + (i % 5) * 34, width: 14, height: 14, borderRadius: 7, background: ['#fde047', '#ef4444', '#fff'][i % 3], opacity: 0.7}} />)}
        {/* goal */}
        <div style={{position: 'absolute', left: 140, top: 470, width: 800, height: 330, border: '16px solid #fff', borderBottom: 'none', backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.25) 0 3px, transparent 3px 34px), repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0 3px, transparent 3px 34px)'}} />
        <div style={{position: 'absolute', left: 540, top: 0, rotate: `${dive * 35}deg`, transformOrigin: '0 790px', translate: `${dive * 120}px 0`}}>
          <Boy x={0} y={790} height={300} stage="adult" pose="cheer" skin={sb.character.palette.skin} rim="#fde68a" glow={0.4} mood="happy" />
        </div>
        {kicks.map((k, i) => {
          if (frame < k || i !== last) return null;
          const t = interpolate(frame, [k, k + 10], [0, 1], clamp);
          const [tx, ty] = targets[i];
          const bx = 540 + (tx - 540) * t, by = 1200 + (ty - 1200) * t;
          const bounce = t >= 1 ? interpolate(frame, [k + 10, k + 22], [0, 1], clamp) : 0;
          return <Ball key={i} x={bx + (i === 0 ? -bounce * 200 : bounce * (i === 1 ? 240 : -240))} y={by + bounce * 300} s={80} r={frame * 20} />;
        })}
        {/* result row */}
        <div style={{position: 'absolute', left: 0, right: 140, top: 900, display: 'flex', justifyContent: 'center', gap: 34}}>
          {labels.map((l, i) => (
            <div key={i} style={{opacity: frame >= kicks[i] + 8 ? 1 : 0.15, textAlign: 'center'}}>
              <div style={{width: 120, height: 120, borderRadius: 60, background: '#dc2626', border: `8px solid ${OL}`, fontFamily: DISPLAY, fontSize: 80, color: '#fff', lineHeight: '110px'}}>✗</div>
              <div dir="auto" style={{unicodeBidi: 'plaintext', fontFamily: DISPLAY, fontSize: 40, color: '#fff', marginTop: 6}}>{l}</div>
            </div>
          ))}
        </div>
        {frame >= nAt ? <Tag text={(scene.none as string) ?? '0 / 3'} a={nAt} y={1130} size={96} color="#facc15" /> : null}
        <Tag text={(scene.top as string) ?? 'WORLD CUP SHOOTOUT'} a={-12} y={330} size={54} color="#fff" rot={2} />
      </Camera>
      <SeriesBadge text={(scene.badge as string) ?? 'GUESS THE PLAYER #17'} from={45} />
    </Shake>
  );
};

/* originTrip: { born, raised, signed, bornOnWord, raisedOnWord, signedOnWord } — snowy city → sunny white rooftops → a big contract. */
const OriginTrip: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bAt = at(captions, scene.bornOnWord, fps, 0);
  const rAt = at(captions, scene.raisedOnWord, fps, dur * 0.35);
  const sAt = at(captions, scene.signedOnWord, fps, dur * 0.7);
  const sunny = interpolate(frame, [rAt - 4, rAt + 10], [0, 1], clamp);
  return (
    <Camera dur={dur} from={1.0} to={1.05}>
      <AbsoluteFill style={{background: '#7dd3fc'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#94a3b8 0%, #e2e8f0 100%)', opacity: 1 - sunny}}>
        {new Array(40).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: (i * 131) % 1080, top: ((i * 211 + frame * 6) % 1400) + 200, width: 14, height: 14, borderRadius: 7, background: '#fff'}} />)}
        {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{position: 'absolute', left: 60 + i * 200, bottom: 520, width: 160, height: 300 + (i % 3) * 120, background: '#475569', border: `6px solid ${OL}`}} />)}
      </AbsoluteFill>
      <AbsoluteFill style={{opacity: sunny}}>
        <div style={{position: 'absolute', left: 780, top: 340, width: 180, height: 180, borderRadius: 90, background: '#fde047', boxShadow: '0 0 80px #fde047'}} />
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{position: 'absolute', left: i * 180, bottom: 520, width: 170, height: 220 + (i % 3) * 90, background: '#f8fafc', border: `6px solid ${OL}`}} />)}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 380, height: 140, background: '#d6b38a', borderTop: `6px solid ${OL}`}} />
      </AbsoluteFill>
      <Boy x={540} y={1300} height={380} stage="child" pose={frame >= sAt ? 'cheer' : 'stand'} skin={sb.character.palette.skin} rim="#fde68a" glow={0.3} mood="happy" />
      <Tag text={(scene.born as string) ?? 'BORN IN CANADA'} a={bAt} y={300} size={58} color="#e2e8f0" rot={-2} />
      <Tag text={(scene.raised as string) ?? 'RAISED IN CASABLANCA'} a={rAt} y={420} size={58} color="#fde68a" rot={2} />
      <Tag text={(scene.signed as string) ?? '✍️ SIGNED IN MADRID'} a={sAt} y={1120} size={62} color="#facc15" rot={-3} />
    </Camera>
  );
};

/* semiRun: { rungs[4], stopIndex, climbOnWord, first, firstOnWord } — a World Cup ladder; the marker climbs to the semi-final; "first African team ever" tag. */
const SemiRun: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rungs = (scene.rungs as string[]) ?? ['ROUND OF 16', 'QUARTER-FINAL', 'SEMI-FINAL', 'FINAL'];
  const stop = (scene.stopIndex as number) ?? 2;
  const cAt = at(captions, scene.climbOnWord, fps, 6);
  const fAt = at(captions, scene.firstOnWord, fps, dur * 0.6);
  const lvl = interpolate(frame, [cAt - 10, cAt + 8], [0, stop], clamp);
  const y = (i: number) => 1080 - i * 190;
  return (
    <Camera dur={dur} from={1.0} to={1.04}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#14532d 0%, #052e16 100%)'}} />
      {rungs.map((r, i) => {
        const on = lvl >= i - 0.01;
        return (
          <div key={i} style={{position: 'absolute', left: 220, width: 640, top: y(i), height: 130, borderRadius: 24, border: `7px solid ${OL}`, background: i === stop && lvl >= stop - 0.01 ? '#facc15' : on ? '#f8fafc' : 'rgba(255,255,255,0.18)', boxShadow: `0 9px 0 ${OL}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <span dir="auto" style={{unicodeBidi: 'plaintext', fontFamily: DISPLAY, fontSize: 64, color: on ? OL : '#d1d5db'}}>{r}</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 120, top: y(lvl) + 20}}><Ball x={40} y={45} s={90} r={frame * 8} /></div>
      {frame >= fAt ? <Tag text={(scene.first as string) ?? 'FIRST AFRICAN TEAM EVER'} a={fAt} y={300} size={60} color="#ef4444" rot={-2} /> : null}
      <DailyPill from={Math.round(fAt + 8)} y={1250} text={(scene.pill as string) ?? undefined} />
    </Camera>
  );
};

export const STORY19_SCENES: Record<string, React.FC<SceneProps>> = {shootout: Shootout, originTrip: OriginTrip, semiRun: SemiRun};
