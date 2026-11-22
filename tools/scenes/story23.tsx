import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Boy} from '../components/Boy';
import {Camera, Shake} from '../components/Fx';
import {DailyPill, SeriesBadge} from '../components/Host';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* Story set 23 (Guess the Player #21): fourDoors (hook, Week-1 Arm B current opening), cryTraining, seventeenNo, cupFinal, backHome,
   derbyTitle. Original cartoon player in a neutral grey kit; club names never shown, no crests, kits or likeness. */
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
const Stamp: React.FC<{text: string; a: number; x: number; y: number; w: number; size?: number; rot?: number}> = ({text, a, x, y, w, size = 40, rot = -16}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < a) return null;
  const s = spring({frame: frame - a, fps, config: {damping: 9, stiffness: 260}});
  return <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: 'center', rotate: `${rot}deg`, scale: String(2 - s), fontFamily: DISPLAY, fontSize: size, color: '#ef4444', border: '5px solid #ef4444', borderRadius: 10, background: 'rgba(255,255,255,0.88)', lineHeight: 1.05, whiteSpace: 'pre-line'}}>{text}</div>;
};
const Ball: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 70 * s, height: 70 * s, borderRadius: 35 * s, background: 'radial-gradient(circle at 35% 35%, #fff 0 55%, #cbd5e1 100%)', border: `${5 * s}px solid ${OL}`, rotate: `${rot}deg`}}>
    <div style={{position: 'absolute', left: '32%', top: '30%', width: '36%', height: '36%', background: OL, clipPath: 'polygon(50% 0, 100% 38%, 82% 100%, 18% 100%, 0 38%)'}} />
  </div>
);
const Doors: React.FC<{stampAt: number[]; heartOpen?: number}> = ({stampAt, heartOpen = 0}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{position: 'absolute', left: 50 + i * 215, top: 430, width: 185, height: 430, background: i === 0 ? '#7f1d1d' : '#3f3f46', border: `7px solid ${OL}`, borderRadius: '90px 90px 8px 8px', overflow: 'hidden'}}>
          {i === 0 && heartOpen > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(254,240,138,${heartOpen})`, boxShadow: 'inset 0 0 80px #fde047'}} /> : null}
          {i === 0 ? <div style={{position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center', fontSize: 70}}>❤️</div> : null}
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: DISPLAY, fontSize: 34, color: '#e5e7eb'}}>ACADEMY {i + 1}</div>
          <div style={{position: 'absolute', right: 22, top: 250, width: 20, height: 20, borderRadius: 10, background: '#facc15'}} />
          {frame >= stampAt[i] && heartOpen === 0 ? <Stamp text="RELEASED" a={stampAt[i]} x={-6} y={230} w={190} size={38} /> : null}
        </div>
      ))}
    </>
  );
};

/* fourDoors: { fourOnWord, firstOnWord } — HOOK (Arm B current opening): frame 0 = a boy with a backpack running towards four academy doors;
   punch-in cut at 1.2 s; RELEASED stamps land door by door from "Four"; AGE 13 on the first (heart) door on "thirteen". */
const FourDoors: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fAt = at(captions, scene.fourOnWord, fps, 4);
  const tAt = at(captions, scene.firstOnWord, fps, dur * 0.7);
  const cut = 36;
  const run = interpolate(frame, [0, cut], [120, 430], clamp);
  return (
    <Shake at={tAt} amount={8}>
      <AbsoluteFill style={{scale: frame >= cut ? '1.12' : '1', transformOrigin: '420px 760px'}}>
        <AbsoluteFill style={{background: 'linear-gradient(180deg,#1e293b 0%, #334155 60%, #475569 100%)'}} />
        <Doors stampAt={[fAt + 4, fAt + 10, fAt + 16, fAt + 22]} />
        <Boy x={run} y={1230} height={280} stage="child" pose={frame < cut ? 'run' : 'stand'} phase={frame / 3} skin={sb.character.palette.skin} rim="#fde68a" glow={0.3} mood={frame >= fAt + 6 ? 'sad' : 'happy'} />
      </AbsoluteFill>
      <Tag text="4 ACADEMIES. 4 NOs." a={fAt} y={300} size={62} color="#f8fafc" rot={2} />
      {frame >= tAt ? <Tag text="THE FIRST: AGE 13" a={tAt} y={1000} size={62} color="#ef4444" rot={-2} /> : null}
      <SeriesBadge text={scene.badge as string} from={50} />
    </Shake>
  );
};

/* cryTraining: { trialOnWord } — rainy evening pitch, the 13-year-old crying at training; on "another" three TRIAL ✗ cards slap in. */
const CryTraining: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tAt = at(captions, scene.trialOnWord, fps, dur * 0.55);
  return (
    <Camera dur={dur} from={1.05} to={1.0}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#0f172a 0%, #1e293b 50%, #166534 51%, #14532d 100%)'}} />
      {new Array(40).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: (i * 53) % 1080, top: ((frame * 22 + i * 97) % 1500) - 100, width: 4, height: 46, background: 'rgba(191,219,254,0.45)', rotate: '12deg'}} />)}
      <Boy x={380} y={1160} height={300} stage="teen" pose="stand" skin={sb.character.palette.skin} rim="#93c5fd" glow={0.15} mood="sad" />
      {[0, 1].map((i) => <div key={i} style={{position: 'absolute', left: 372 + i * 22, top: 940 + ((frame * 4 + i * 30) % 60), width: 12, height: 18, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: '#7dd3fc', opacity: 0.9}} />)}
      <Tag text="TRAINING · AGE 13" a={2} y={300} size={58} color="#f8fafc" />
      {[0, 1, 2].map((i) => (frame >= tAt + i * 8 ? <div key={i} style={{position: 'absolute', left: 600, top: 540 + i * 150, width: 300, rotate: `${(i - 1) * 5}deg`, scale: String(spring({frame: frame - tAt - i * 8, fps, config: {damping: 10}}))}}>
        <div style={{fontFamily: DISPLAY, fontSize: 52, color: '#111', background: '#f8fafc', border: `6px solid ${OL}`, borderRadius: 14, textAlign: 'center', padding: '8px 0'}}>TRIAL <span style={{color: '#dc2626'}}>✗</span></div>
      </div> : null))}
      <SeriesBadge text={scene.badge as string} />
    </Camera>
  );
};

/* seventeenNo: { stampOnWord, thoughtOnWord } — a 17-year-old with his boots in a bag by the gate; RELEASED AGAIN · 17; thought bubble. */
const SeventeenNo: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sAt = at(captions, scene.stampOnWord, fps, dur * 0.35);
  const bAt = at(captions, scene.thoughtOnWord, fps, dur * 0.6);
  const b = spring({frame: frame - bAt, fps, config: {damping: 12}});
  return (
    <Shake at={sAt} amount={9}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#44403c 0%, #57534e 55%, #3f6212 56%, #365314 100%)'}} />
      <div style={{position: 'absolute', left: 80, top: 560, width: 900, height: 360, backgroundImage: `repeating-linear-gradient(90deg, ${OL} 0 10px, transparent 10px 70px)`, borderTop: `12px solid ${OL}`, opacity: 0.8}} />
      <Boy x={320} y={1190} height={330} stage="teen" pose="stand" skin={sb.character.palette.skin} rim="#fde68a" glow={0.15} mood="sad" />
      <Tag text="AGE 17" a={2} y={300} size={66} color="#f8fafc" />
      <Stamp text={'RELEASED\nAGAIN'} a={sAt} x={560} y={620} w={360} size={70} rot={-10} />
      {frame >= bAt ? <div style={{position: 'absolute', left: 430, top: 1000, width: 520, scale: String(b), transformOrigin: '0% 50%'}}>
        <div style={{fontFamily: BODY, fontWeight: 900, fontSize: 44, color: '#111', background: '#fff', border: `6px solid ${OL}`, borderRadius: 40, padding: '18px 26px', textAlign: 'center'}}>"I probably deserved it."</div>
      </div> : null}
      <SeriesBadge text={scene.badge as string} />
    </Shake>
  );
};

/* cupFinal: { chanceOnWord, finalOnWord } — a contract card "A SECOND-TIER CLUB SAYS YES"; hard cut on "final" to a floodlit cup final:
   first-time strike into the bottom corner, CUP FINAL WINNER. */
const CupFinal: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cAt = at(captions, scene.chanceOnWord, fps, 6);
  const fAt = at(captions, scene.finalOnWord, fps, dur * 0.55);
  if (frame < fAt) {
    const s = spring({frame: frame - cAt, fps, config: {damping: 11}});
    return (
      <Camera dur={fAt} from={1.0} to={1.05}>
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #1e3a8a 0%, #0b1020 80%)'}} />
        <div style={{position: 'absolute', left: 220, top: 520, width: 560, height: 420, background: '#fffbeb', border: `7px solid ${OL}`, borderRadius: 16, rotate: '-4deg', scale: String(0.6 + 0.4 * s)}}>
          <div style={{margin: '40px 40px 20px', fontFamily: DISPLAY, fontSize: 54, color: '#111', textAlign: 'center'}}>CONTRACT</div>
          {[0, 1, 2].map((i) => <div key={i} style={{margin: '18px 50px', height: 12, borderRadius: 6, background: '#d6d3d1'}} />)}
          <div style={{position: 'absolute', right: 50, bottom: 40, fontFamily: BODY, fontStyle: 'italic', fontWeight: 900, fontSize: 46, color: '#1d4ed8', rotate: '-6deg'}}>✍️ signed</div>
        </div>
        <Tag text="A SECOND-TIER CLUB SAYS YES" a={cAt} y={300} size={50} color="#86efac" />
        <SeriesBadge text={scene.badge as string} />
      </Camera>
    );
  }
  const t = frame - fAt;
  const fly = interpolate(t, [4, 16], [0, 1], clamp);
  return (
    <Shake at={fAt + 16} amount={10}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#0b1020 0%, #1e293b 46%, #15803d 47%, #14532d 100%)'}} />
      {[160, 540, 920].map((x) => <div key={x} style={{position: 'absolute', left: x - 70, top: 260, width: 140, height: 40, borderRadius: 20, background: '#fef9c3', boxShadow: '0 0 90px 40px rgba(254,249,195,0.35)'}} />)}
      <div style={{position: 'absolute', left: 300, top: 690, width: 520, height: 260, border: '12px solid #f8fafc', borderBottom: 'none', backgroundImage: 'repeating-linear-gradient(45deg, rgba(248,250,252,0.35) 0 4px, transparent 4px 34px), repeating-linear-gradient(-45deg, rgba(248,250,252,0.35) 0 4px, transparent 4px 34px)'}} />
      <Boy x={300} y={1250} height={420} stage="adult" pose="kick" phase={Math.min(t / 3, 1.6)} skin={sb.character.palette.skin} rim="#fde68a" glow={0.4} mood="happy" />
      <Ball x={interpolate(fly, [0, 1], [400, 740])} y={interpolate(fly, [0, 1], [1160, 900])} rot={t * 25} />
      <Tag text="CUP FINAL" a={fAt} y={300} size={66} color="#f8fafc" />
      {t > 16 ? <Tag text="THE WINNING GOAL" a={fAt + 16} y={560} size={64} rot={2} /> : null}
      <SeriesBadge text={scene.badge as string} />
    </Shake>
  );
};

/* backHome: { backOnWord, feeOnWord } — the four doors again; on "Back" the first (heart) door glows open and he walks in; £60m counter on "sixty". */
const BackHome: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bAt = at(captions, scene.backOnWord, fps, dur * 0.3);
  const mAt = at(captions, scene.feeOnWord, fps, dur * 0.7);
  const open = interpolate(frame, [bAt, bAt + 14], [0, 1], clamp);
  const v = Math.round(interpolate(frame, [mAt - 10, mAt + 14], [0, 60], clamp));
  return (
    <Camera dur={dur} from={1.0} to={1.08}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#1e293b 0%, #334155 60%, #475569 100%)'}} />
      <Doors stampAt={[0, 0, 0, 0]} heartOpen={frame >= bAt ? open : 0} />
      {frame < bAt ? [0, 1, 2, 3].map((i) => <Stamp key={i} text="RELEASED" a={-20} x={44 + i * 215} y={660} w={190} size={38} />) : null}
      <Boy x={interpolate(frame, [bAt, bAt + 40], [560, 160], clamp)} y={1230} height={360} stage="adult" pose={frame >= bAt && frame < bAt + 40 ? 'run' : 'stand'} phase={frame / 3} skin={sb.character.palette.skin} rim="#fde68a" glow={0.4} mood="happy" />
      <Tag text="SO WHERE DID HE END UP?" a={2} y={300} size={54} color="#f8fafc" />
      {frame >= bAt ? <Tag text="THE CLUB THAT RELEASED HIM AT 13" a={bAt} y={900} size={46} color="#fde047" rot={2} /> : null}
      {frame >= mAt - 10 ? <div style={{position: 'absolute', left: 420, right: 140, top: 1010, textAlign: 'center', fontFamily: DISPLAY, fontSize: 120, color: '#facc15', WebkitTextStroke: `9px ${OL}`, paintOrder: 'stroke fill'}}>£{v}M</div> : null}
      <SeriesBadge text={scene.badge as string} />
    </Camera>
  );
};

/* derbyTitle: { hatOnWord, titleOnWord } — three balls pop 1-2-3 (derby hat-trick), then a trophy for the league title; silent SEND line + daily pill. */
const DerbyTitle: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const hAt = at(captions, scene.hatOnWord, fps, 4);
  const tAt = at(captions, scene.titleOnWord, fps, dur * 0.5);
  const cup = spring({frame: frame - tAt, fps, config: {damping: 10}});
  return (
    <Camera dur={dur} from={1.0} to={1.05}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#0b1020 0%, #1e293b 48%, #15803d 49%, #14532d 100%)'}} />
      {new Array(26).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: (i * 97) % 1000, top: ((frame * 5 + i * 70) % 1300) - 50, width: 16, height: 26, background: ['#facc15', '#f8fafc', '#ef4444', '#60a5fa'][i % 4], rotate: `${frame * 6 + i * 30}deg`, opacity: frame >= tAt ? 1 : 0.25}} />)}
      {[0, 1, 2].map((i) => (frame >= hAt + i * 6 ? <div key={i} style={{position: 'absolute', left: 180 + i * 230, top: 470, textAlign: 'center', scale: String(spring({frame: frame - hAt - i * 6, fps, config: {damping: 9}}))}}>
        <Ball x={0} y={0} s={1.6} rot={frame * 8} />
        <div style={{position: 'absolute', left: 0, width: 112, top: 120, fontFamily: DISPLAY, fontSize: 60, color: '#f8fafc', WebkitTextStroke: `6px ${OL}`, paintOrder: 'stroke fill'}}>{i + 1}</div>
      </div> : null))}
      <Boy x={540} y={1180} height={400} stage="adult" pose="cheer" phase={frame / 4} skin={sb.character.palette.skin} rim="#fde68a" glow={0.5} mood="happy" />
      {frame >= tAt ? <div style={{position: 'absolute', left: 760, top: 700, fontSize: 150, scale: String(cup)}}>🏆</div> : null}
      <Tag text="DERBY HAT-TRICK" a={hAt} y={300} size={62} color="#f8fafc" />
      {frame >= tAt ? <Tag text="LEAGUE CHAMPION" a={tAt} y={660} size={56} rot={2} /> : null}
      <div style={{position: 'absolute', left: 50, right: 150, top: 1110, textAlign: 'center', lineHeight: 1.45, opacity: spring({frame: frame - 8, fps, config: {damping: 14}})}}><span style={{fontFamily: BODY, fontWeight: 900, fontSize: 40, color: '#111', background: '#86efac', padding: '8px 20px', borderRadius: 14, border: `5px solid ${OL}`}}>📤 Send this to a mate who almost quit</span></div>
      <DailyPill from={20} y={1255} />
      <SeriesBadge text={scene.badge as string} />
    </Camera>
  );
};

export const STORY23_SCENES: Record<string, React.FC<SceneProps>> = {fourDoors: FourDoors, cryTraining: CryTraining, seventeenNo: SeventeenNo, cupFinal: CupFinal, backHome: BackHome, derbyTitle: DerbyTitle};
