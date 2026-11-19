import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Boy} from '../components/Boy';
import {Camera, Shake} from '../components/Fx';
import {DailyPill, SeriesBadge} from '../components/Host';
import {wordFrame} from './kit';
import {DISPLAY} from '../fonts';

/* Story set 20 (Guess the Player #18): rejectDoors (hook), borderCommute, bicycleKick. Original cartoon kid, no crests or likeness. */
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

/* rejectDoors: { badge, favOnWord, allOnWord } — HOOK: a tiny kid with a height ruler in front of academy doors; red "TOO SMALL" stamps land, first on his favourite (heart) door, then on all. */
const RejectDoors: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fAt = at(captions, scene.favOnWord, fps, 6);
  const aAt = at(captions, scene.allOnWord, fps, dur * 0.6);
  const doors = [0, 1, 2, 3, 4];
  return (
    <Shake at={aAt} amount={8}>
      <Camera dur={dur} from={1.05} to={1.0}>
        <AbsoluteFill style={{background: 'linear-gradient(180deg,#1e293b 0%, #334155 60%, #475569 100%)'}} />
        {doors.map((i) => {
          const sAt = i === 2 ? fAt : aAt + (i < 2 ? i : i - 1) * 4;
          const stamped = frame >= sAt;
          const s = stamped ? spring({frame: frame - sAt, fps, config: {damping: 9, stiffness: 260}}) : 0;
          return (
            <div key={i} style={{position: 'absolute', left: 30 + i * 200, top: 420, width: 170, height: 420, background: i === 2 ? '#7f1d1d' : '#3f3f46', border: `7px solid ${OL}`, borderRadius: '80px 80px 8px 8px'}}>
              {i === 2 ? <div style={{position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center', fontSize: 70}}>❤️</div> : null}
              <div style={{position: 'absolute', right: 20, top: 220, width: 20, height: 20, borderRadius: 10, background: '#facc15'}} />
              {stamped ? <div style={{position: 'absolute', left: -14, top: 160, width: 200, textAlign: 'center', rotate: '-18deg', scale: String(2 - s), fontFamily: DISPLAY, fontSize: 40, color: '#ef4444', border: '5px solid #ef4444', borderRadius: 10, background: 'rgba(255,255,255,0.85)'}}>TOO SMALL</div> : null}
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 760, top: 860, width: 30, height: 360, background: '#fde68a', border: `5px solid ${OL}`, backgroundImage: `repeating-linear-gradient(0deg, ${OL} 0 4px, transparent 4px 36px)`}} />
        <Boy x={540} y={1240} height={300} stage="child" pose="stand" skin={sb.character.palette.skin} rim="#fde68a" glow={0.3} mood={frame >= fAt ? 'sad' : 'happy'} />
        <Tag text={(scene.top as string) ?? 'EVERY ACADEMY SAID NO'} a={aAt} y={300} size={58} color="#f8fafc" rot={2} />
      </Camera>
      <SeriesBadge text={(scene.badge as string) ?? 'GUESS THE PLAYER #18'} from={45} />
    </Shake>
  );
};

/* borderCommute: { scoutOnWord, moveOnWord, borderOnWord } — a scout's card, then a little car loops across a border barrier, day counter ticking. */
const BorderCommute: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sAt = at(captions, scene.scoutOnWord, fps, 4);
  const mAt = at(captions, scene.moveOnWord, fps, dur * 0.4);
  const bAt = at(captions, scene.borderOnWord, fps, dur * 0.7);
  const carX = frame >= bAt ? ((frame - bAt) * 22) % 1300 - 150 : -400;
  const days = frame >= bAt ? Math.min(999, Math.floor((frame - bAt) * 9)) : 0;
  const card = spring({frame: frame - sAt, fps, config: {damping: 12}});
  return (
    <Camera dur={dur} from={1.0} to={1.04}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#7dd3fc 0%, #bae6fd 55%, #4d7c0f 56%, #365314 100%)'}} />
      {frame < mAt ? (
        <>
          <div style={{position: 'absolute', left: 250, top: 520, width: 580, height: 340, background: '#fff', border: `7px solid ${OL}`, borderRadius: 18, rotate: '-4deg', scale: String(card), boxShadow: `0 12px 0 ${OL}`}}>
            <div style={{fontFamily: DISPLAY, fontSize: 56, color: OL, margin: '40px 0 0 40px'}}>SCOUT</div>
            <div style={{height: 10, width: 400, background: '#cbd5e1', margin: '30px 40px'}} /><div style={{height: 10, width: 300, background: '#cbd5e1', margin: '0 40px'}} />
            <div style={{fontFamily: DISPLAY, fontSize: 40, color: '#64748b', margin: '40px 0 0 40px'}}>☎ CALL ME</div>
          </div>
          <Tag text={(scene.scoutTag as string) ?? 'HE WASN\'T EVEN THERE TO SCOUT'} a={sAt + 6} y={330} size={50} color="#f8fafc" />
        </>
      ) : (
        <>
          <div style={{position: 'absolute', left: 500, top: 900, width: 30, height: 260, background: '#dc2626', border: `5px solid ${OL}`}} />
          <div style={{position: 'absolute', left: 380, top: 860, width: 280, height: 70, background: '#f8fafc', border: `6px solid ${OL}`, borderRadius: 10, fontFamily: DISPLAY, fontSize: 46, textAlign: 'center', lineHeight: '60px'}}>BORDER</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1150, height: 100, background: '#374151'}} />
          <div style={{position: 'absolute', left: carX, top: 1070, width: 180, height: 90, background: '#facc15', border: `6px solid ${OL}`, borderRadius: '30px 40px 12px 12px'}}>
            <div style={{position: 'absolute', left: 20, bottom: -30, width: 46, height: 46, borderRadius: 23, background: OL}} /><div style={{position: 'absolute', right: 20, bottom: -30, width: 46, height: 46, borderRadius: 23, background: OL}} />
          </div>
          <Boy x={200} y={1140} height={240} stage="child" pose="stand" skin={sb.character.palette.skin} rim="#fde68a" glow={0.2} mood="happy" />
          <Tag text={(scene.moveTag as string) ?? '13 · MOVED IN WITH THE SCOUT'} a={mAt} y={330} size={54} />
          {frame >= bAt ? <Tag text={`🚗 EVERY DAY · ${days} TRIPS`} a={bAt} y={450} size={50} color="#f8fafc" rot={2} /> : null}
        </>
      )}
    </Camera>
  );
};

/* bicycleKick: { kickOnWord, cupOnWord } — vs the club that said no: an overhead kick into the net; then a gold trophy tag. */
const BicycleKick: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const kAt = at(captions, scene.kickOnWord, fps, 10);
  const cAt = at(captions, scene.cupOnWord, fps, dur * 0.7);
  const flip = interpolate(frame, [kAt - 8, kAt + 6], [0, -200], clamp);
  const bt = interpolate(frame, [kAt, kAt + 12], [0, 1], clamp);
  return (
    <Shake at={kAt + 12} amount={10}>
      <Camera dur={dur} from={1.04} to={1.0}>
        <AbsoluteFill style={{background: 'linear-gradient(180deg,#0f172a 0%, #1e3a8a 40%, #16a34a 41%, #15803d 100%)'}} />
        <div style={{position: 'absolute', left: 620, top: 560, width: 420, height: 300, border: '14px solid #fff', borderRight: 'none', backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.25) 0 3px, transparent 3px 30px), repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0 3px, transparent 3px 30px)'}} />
        <div style={{position: 'absolute', left: 260, top: 0, rotate: `${flip}deg`, transformOrigin: '0 900px'}}>
          <Boy x={0} y={1060} height={340} stage="adult" pose="kick" skin={sb.character.palette.skin} rim="#fde68a" glow={0.4} mood="happy" />
        </div>
        {frame >= kAt ? <div style={{position: 'absolute', left: 300 + bt * 520 - 40, top: 620 + bt * 120, width: 80, height: 80, borderRadius: 40, background: '#fff', border: `7px solid ${OL}`}} /> : null}
        <Tag text={(scene.vsTag as string) ?? 'VS THE CLUB THAT SAID NO'} a={0} y={320} size={54} color="#f8fafc" rot={2} />
        {frame >= kAt + 10 ? <Tag text={(scene.goalTag as string) ?? 'BICYCLE KICK!'} a={kAt + 10} y={1000} size={84} /> : null}
        {frame >= cAt ? <Tag text={(scene.cupTag as string) ?? '🏆 WORLD CHAMPION'} a={cAt} y={1130} size={66} color="#fde047" rot={2} /> : null}
      </Camera>
      <DailyPill from={Math.round(cAt + 6)} y={440} />
    </Shake>
  );
};

export const STORY20_SCENES: Record<string, React.FC<SceneProps>> = {rejectDoors: RejectDoors, borderCommute: BorderCommute, bicycleKick: BicycleKick};
