import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Boy} from '../components/Boy';
import {Camera, Shake} from '../components/Fx';
import {DailyPill, SeriesBadge} from '../components/Host';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* Story set 21 (Guess the Player #19): hospitalWill (hook), dishSink, tooLimited, pulledThrough, feeCounter, trophyRunner.
   Original cartoon player, no crests, kits or likeness. Non-graphic hospital. */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OL = '#1b1b22';
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);

const Tag: React.FC<{text: string; a: number; y: number; color?: string; size?: number; rot?: number}> = ({text, a, y, color = '#ffcc4d', size = 62, rot = -3}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < a) return null;
  const s = spring({frame: frame - a, fps, config: {damping: 10, stiffness: 190}});
  return (
    <div style={{position: 'absolute', left: 40, right: 140, top: y, textAlign: 'center', scale: String(1.6 - s * 0.6), rotate: `${rot}deg`}}>
      <span style={{fontFamily: DISPLAY, fontSize: size, color: '#111', background: color, padding: '4px 26px', borderRadius: 14, border: `6px solid ${OL}`, boxShadow: `0 8px 0 ${OL}`}}>{text}</span>
    </div>
  );
};

/* hospital room with bed, drip and a beeping monitor; `ok` turns the monitor green */
const Ward: React.FC<{frame: number; ok?: boolean; children?: React.ReactNode}> = ({frame, ok, children}) => {
  const beat = (frame % 24) / 24;
  const line = new Array(40).fill(0).map((_, i) => {
    const x = i * 12;
    const ph = (i / 40 + beat) % 1;
    const y = ph > 0.45 && ph < 0.5 ? -60 : ph >= 0.5 && ph < 0.55 ? 40 : 0;
    return `${i ? 'L' : 'M'}${x} ${80 + y}`;
  }).join(' ');
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#cbd5e1 0%, #e2e8f0 62%, #94a3b8 63%, #64748b 100%)'}}>
      <div style={{position: 'absolute', left: 560, top: 380, width: 420, height: 230, borderRadius: 18, background: '#0f172a', border: `7px solid ${OL}`}}>
        <svg width={480} height={160} style={{position: 'absolute', left: 0, top: 30}}><path d={line} stroke={ok ? '#4ade80' : '#f87171'} strokeWidth={6} fill="none" /></svg>
      </div>
      <div style={{position: 'absolute', left: 150, top: 340, width: 12, height: 460, background: '#94a3b8'}} />
      <div style={{position: 'absolute', left: 105, top: 340, width: 100, height: 140, borderRadius: 20, background: 'rgba(186,230,253,0.85)', border: `6px solid ${OL}`}} />
      <div style={{position: 'absolute', left: 110, top: 980, width: 860, height: 140, borderRadius: 24, background: '#f8fafc', border: `7px solid ${OL}`}} />
      <div style={{position: 'absolute', left: 140, top: 900, width: 220, height: 110, borderRadius: 50, background: '#fff', border: `6px solid ${OL}`}} />
      <div style={{position: 'absolute', left: 300, top: 920, width: 640, height: 120, borderRadius: 40, background: '#93c5fd', border: `6px solid ${OL}`}} />
      {children}
    </AbsoluteFill>
  );
};

/* hospitalWill: { willOnWord } — HOOK. Frame 0: monitor already beeping, "AGE 20" tag; hard punch-in at 1.2 s; on "will" a paper slides in. */
const HospitalWill: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const wAt = at(captions, scene.willOnWord, fps, dur * 0.75);
  const p = spring({frame: frame - wAt, fps, config: {damping: 12}});
  const zoomed = frame >= 36;
  return (
    <Shake at={wAt} amount={6}>
      <div style={{position: 'absolute', inset: 0, scale: zoomed ? '1.25' : '1', transformOrigin: '540px 900px'}}>
        <Ward frame={frame}>
          <div style={{position: 'absolute', left: 190, top: 880, width: 120, height: 120, borderRadius: 60, background: '#7a4a2e', border: `6px solid ${OL}`}}><div style={{position: 'absolute', left: -6, top: -10, width: 120, height: 50, borderRadius: '60px 60px 10px 10px', background: '#1f1410'}} /><div style={{position: 'absolute', left: 26, top: 58, width: 22, height: 6, borderRadius: 3, background: OL}} /><div style={{position: 'absolute', left: 66, top: 58, width: 22, height: 6, borderRadius: 3, background: OL}} /></div>
        </Ward>
        {frame >= wAt ? (
          <div style={{position: 'absolute', left: 300, top: 560, width: 460, height: 380, background: '#fffbeb', border: `7px solid ${OL}`, borderRadius: 14, rotate: '-5deg', translate: `${(1 - p) * 700}px 0`, boxShadow: `0 12px 0 ${OL}`}}>
            <div style={{fontFamily: DISPLAY, fontSize: 70, color: OL, textAlign: 'center', marginTop: 30}}>WILL</div>
            {[0, 1, 2, 3].map((i) => <div key={i} style={{height: 10, width: 340 - i * 40, background: '#d6d3d1', margin: '22px 50px 0'}} />)}
            <div style={{position: 'absolute', left: 50, bottom: 40, width: 220, borderBottom: `5px solid ${OL}`, fontFamily: BODY, fontSize: 30, color: '#78716c'}}>sign here</div>
          </div>
        ) : null}
      </div>
      <Tag text="AGE 20 · A FOOTBALLER" a={-12} y={330} size={60} color="#f8fafc" />
      <SeriesBadge text={scene.badge as string} from={60} />
    </Shake>
  );
};

/* dishSink: { contractOnWord } — a teen at a steaming sink with a tower of plates; bubbles; "NO CONTRACT". */
const DishSink: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cAt = at(captions, scene.contractOnWord, fps, dur * 0.7);
  return (
    <Camera dur={dur} from={1.0} to={1.06}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#fef3c7 0%, #fde68a 55%, #a8a29e 56%, #78716c 100%)'}} />
      <div style={{position: 'absolute', left: 300, top: 900, width: 560, height: 200, background: '#cbd5e1', border: `7px solid ${OL}`, borderRadius: 16}} />
      {new Array(9).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: 700, top: 880 - i * 26, width: 170, height: 22, borderRadius: 11, background: '#f8fafc', border: `5px solid ${OL}`}} />)}
      {new Array(10).fill(0).map((_, i) => {
        const t = (frame * 1.4 + i * 17) % 90;
        return <div key={`b${i}`} style={{position: 'absolute', left: 340 + ((i * 53) % 300), top: 890 - t * 3, width: 30 + (i % 3) * 10, height: 30 + (i % 3) * 10, borderRadius: 30, border: '4px solid #e0f2fe', opacity: 1 - t / 90}} />;
      })}
      <Boy x={420} y={1080} height={320} stage="teen" pose="stand" skin={sb.character.palette.skin} rim="#fde68a" glow={0.2} mood="neutral" />
      <Tag text="TEENAGER · WASHING DISHES 🍽️" a={2} y={330} size={52} color="#f8fafc" />
      {frame >= cAt ? <Tag text="NO CONTRACT" a={cAt} y={450} size={66} color="#ef4444" rot={2} /> : null}
      <SeriesBadge text={scene.badge as string} />
    </Camera>
  );
};

/* tooLimited: { stampOnWord, leftOnWord } — coach's clipboard stamped TOO MANY LIMITATIONS; then he walks off with a bag, "LEFT FOR FREE". */
const TooLimited: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sAt = at(captions, scene.stampOnWord, fps, dur * 0.4);
  const lAt = at(captions, scene.leftOnWord, fps, dur * 0.75);
  const st = spring({frame: frame - sAt, fps, config: {damping: 8, stiffness: 220}});
  const walk = interpolate(frame, [lAt, dur], [0, 520], clamp);
  return (
    <Shake at={sAt} amount={9}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#1e293b 0%, #334155 55%, #166534 56%, #14532d 100%)'}} />
      <div style={{position: 'absolute', left: 170, top: 520, width: 480, height: 560, background: '#fff', border: `8px solid ${OL}`, borderRadius: 20, rotate: '-3deg'}}>
        <div style={{position: 'absolute', left: 170, top: -30, width: 140, height: 60, background: '#a16207', border: `6px solid ${OL}`, borderRadius: 12}} />
        <div style={{fontFamily: DISPLAY, fontSize: 48, color: OL, margin: '70px 0 0 40px'}}>REPORT</div>
        {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{height: 10, width: 360 - (i % 2) * 80, background: '#cbd5e1', margin: '28px 40px 0'}} />)}
        {frame >= sAt ? <div style={{position: 'absolute', left: 20, top: 230, rotate: '-14deg', scale: String(2 - st), opacity: st, fontFamily: DISPLAY, fontSize: 52, color: '#dc2626', border: '7px solid #dc2626', borderRadius: 12, padding: '4px 14px', textAlign: 'center', lineHeight: 1.05}}>TOO MANY<br />LIMITATIONS</div> : null}
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, translate: `${walk}px 0`}}>
        <Boy x={800} y={1120} height={300} stage="teen" pose={frame >= lAt ? 'run' : 'stand'} phase={frame / 3} skin={sb.character.palette.skin} rim="#fde68a" glow={0.2} mood="sad" />
      </div>
      {frame >= lAt ? <Tag text="LEFT · FOR FREE" a={lAt} y={330} size={64} color="#f8fafc" /> : <Tag text="THE ACADEMY'S VERDICT" a={4} y={330} size={54} color="#f8fafc" />}
      <SeriesBadge text={scene.badge as string} />
    </Shake>
  );
};

/* pulledThrough: { fearOnWord, okOnWord } — back in the ward: red monitor, "WILL HE MAKE IT?" → green line, "HE PULLED THROUGH ✓". */
const PulledThrough: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fAt = at(captions, scene.fearOnWord, fps, dur * 0.4);
  const oAt = at(captions, scene.okOnWord, fps, dur * 0.8);
  const ok = frame >= oAt;
  return (
    <Camera dur={dur} from={1.08} to={1.0}>
      <Ward frame={frame} ok={ok}>
        <div style={{position: 'absolute', left: 190, top: 880, width: 120, height: 120, borderRadius: 60, background: '#7a4a2e', border: `6px solid ${OL}`}}><div style={{position: 'absolute', left: -6, top: -10, width: 120, height: 50, borderRadius: '60px 60px 10px 10px', background: '#1f1410'}} /><div style={{position: 'absolute', left: 26, top: 58, width: 22, height: 6, borderRadius: 3, background: OL}} /><div style={{position: 'absolute', left: 66, top: 58, width: 22, height: 6, borderRadius: 3, background: OL}} /></div>{ok ? <div style={{position: 'absolute', left: 330, top: 840, fontSize: 90}}>👍</div> : null}
      </Ward>
      <Tag text="SERIOUS INFECTION" a={2} y={330} size={58} color="#f8fafc" />
      {frame >= fAt && !ok ? <Tag text="WILL HE MAKE IT?" a={fAt} y={450} size={62} color="#fca5a5" rot={2} /> : null}
      {ok ? <Tag text="HE PULLED THROUGH ✓" a={oAt} y={450} size={62} color="#86efac" rot={2} /> : null}
      <SeriesBadge text={scene.badge as string} />
    </Camera>
  );
};

/* feeCounter: { feeOnWord, recordOnWord } — a price counter races £0 → £75,000,000; "WORLD RECORD FOR A DEFENDER". */
const FeeCounter: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fAt = at(captions, scene.feeOnWord, fps, dur * 0.4);
  const rAt = at(captions, scene.recordOnWord, fps, dur * 0.75);
  const v = Math.round(interpolate(frame, [fAt - 10, fAt + 14], [0, 75], clamp));
  return (
    <Shake at={fAt + 14} amount={10}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #166534 0%, #052e16 80%)'}} />
      {new Array(14).fill(0).map((_, i) => {
        const y = ((frame * 6 + i * 140) % 1500) - 100;
        return <div key={i} style={{position: 'absolute', left: (i * 77) % 940, top: y, fontSize: 70, opacity: frame >= fAt ? 0.8 : 0.15, rotate: `${i * 23}deg`}}>💷</div>;
      })}
      <div style={{position: 'absolute', left: 0, right: 140, top: 700, textAlign: 'center', fontFamily: DISPLAY, fontSize: 150, color: '#facc15', WebkitTextStroke: `9px ${OL}`, paintOrder: 'stroke fill'}}>£{v}M</div>
      <Tag text="7 YEARS LATER" a={2} y={330} size={60} color="#f8fafc" />
      {frame >= rAt ? <Tag text="WORLD RECORD FOR A DEFENDER" a={rAt} y={1000} size={54} rot={2} /> : null}
      <SeriesBadge text={scene.badge as string} />
    </Shake>
  );
};

/* trophyRunner: { cupOnWord, ballonOnWord } — the grown-up player cheering with a big cup; ballon tag; silent SEND line + daily pill. */
const TrophyRunner: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cAt = at(captions, scene.cupOnWord, fps, 10);
  const bAt = at(captions, scene.ballonOnWord, fps, dur * 0.6);
  const cup = spring({frame: frame - cAt, fps, config: {damping: 10}});
  return (
    <Camera dur={dur} from={1.0} to={1.05}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1e3a8a 0%, #0b1020 80%)'}} />
      {new Array(30).fill(0).map((_, i) => {
        const y = ((frame * 5 + i * 70) % 1300) + 250;
        return <div key={i} style={{position: 'absolute', left: (i * 97) % 1000, top: y - 300, width: 16, height: 26, background: ['#facc15', '#f8fafc', '#ef4444', '#60a5fa'][i % 4], rotate: `${frame * 6 + i * 30}deg`}} />;
      })}
      <Boy x={540} y={1130} height={420} stage="adult" pose="cheer" phase={frame / 4} skin={sb.character.palette.skin} rim="#fde68a" glow={0.5} mood="happy" />
      {frame >= cAt ? <div style={{position: 'absolute', left: 470, top: 560, fontSize: 140, scale: String(cup)}}>🏆</div> : null}
      <Tag text="CHAMPIONS LEAGUE WINNER" a={cAt} y={330} size={56} />
      {frame >= bAt ? <Tag text="2ND FOR THE BALLON D'OR · BEHIND MESSI" a={bAt} y={450} size={42} color="#f8fafc" rot={2} /> : null}
      {frame >= bAt + 12 ? <div style={{position: 'absolute', left: 50, right: 150, top: 1110, textAlign: 'center', lineHeight: 1.45}}><span style={{fontFamily: BODY, fontWeight: 900, fontSize: 40, color: '#111', background: '#86efac', padding: '8px 20px', borderRadius: 14, border: `5px solid ${OL}`}}>📤 Send this to your mate who thinks he knows every player</span></div> : null}
      <DailyPill from={Math.round(bAt + 20)} y={1255} />
      <SeriesBadge text={scene.badge as string} />
    </Camera>
  );
};

export const STORY21_SCENES: Record<string, React.FC<SceneProps>> = {hospitalWill: HospitalWill, dishSink: DishSink, tooLimited: TooLimited, pulledThrough: PulledThrough, feeCounter: FeeCounter, trophyRunner: TrophyRunner};
