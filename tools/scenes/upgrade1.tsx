import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Boy} from '../components/Boy';
import {SeriesBadge} from '../components/Host';
import {CameraRig, EASE, impulse, impulses, kf, Layer, Particles, Trail} from '../components/Motion';
import {wordFrame} from './kit';
import {DISPLAY} from '../fonts';

/* ANIMATION UPGRADE SAMPLE (v2 of story23 fourDoors + cryTraining): same script, same voice, same branding.
   New: virtual camera with parallax layers + depth-of-field, eased keyframed moves (anticipation / overshoot / settle),
   rig v2 acting (lean, head tilt, head turn, flinch squash, hand-to-face), impact physics (door shake, dust bursts),
   motion trails, layered rain, off-centre composition. */
const OL = '#1b1b22';
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);

/* Kinetic tag: drops in with overshoot, letters settle with a tiny stagger. */
const KTag: React.FC<{text: string; a: number; y: number; color?: string; size?: number; rot?: number}> = ({text, a, y, color = '#f8fafc', size = 60, rot = -3}) => {
  const frame = useCurrentFrame();
  if (frame < a) return null;
  const t = frame - a;
  const s = kf(t, [[0, 0], [9, 1, EASE.overshoot]]);
  return (
    <div style={{position: 'absolute', left: 40, right: 140, top: y + (1 - s) * -40, textAlign: 'center', rotate: `${rot * s}deg`, opacity: Math.min(1, t / 3)}}>
      <span style={{display: 'inline-block', fontFamily: DISPLAY, fontSize: size, color: '#111', background: color, padding: '4px 26px', borderRadius: 14, border: `6px solid ${OL}`, boxShadow: `0 ${8 * s}px 0 ${OL}`, scale: String(0.6 + 0.4 * s)}}>
        {text.split('').map((ch, i) => <span key={i} style={{display: 'inline-block', translate: `0 ${kf(t, [[i * 0.8, -18], [i * 0.8 + 8, 0, EASE.out]])}px`, opacity: t >= i * 0.8 ? 1 : 0}}>{ch === ' ' ? ' ' : ch}</span>)}
      </span>
    </div>
  );
};

const DustBurst: React.FC<{at: number; x: number; y: number; scale?: number}> = ({at: a, x, y, scale = 1}) => {
  const frame = useCurrentFrame();
  const t = frame - a;
  if (t < 0 || t > 22) return null;
  const p = EASE.out(t / 22);
  return (
    <>
      {new Array(9).fill(0).map((_, i) => {
        const ang = (i / 9) * Math.PI * 2;
        return <div key={i} style={{position: 'absolute', left: x + Math.cos(ang) * 120 * p * scale - 14, top: y + Math.sin(ang) * 60 * p * scale - 14, width: 28 * (1 - p * 0.5), height: 28 * (1 - p * 0.5), borderRadius: 20, background: '#e2e8f0', opacity: 0.55 * (1 - p)}} />;
      })}
    </>
  );
};

const StampV2: React.FC<{at: number; text: string; w: number; size?: number}> = ({at: a, text, w, size = 38}) => {
  const frame = useCurrentFrame();
  const t = frame - a;
  if (t < 0) return null;
  const s = kf(t, [[0, 2.3], [7, 1, EASE.in], [11, 1.08, EASE.out], [15, 1, EASE.smooth]]);
  const r = kf(t, [[0, -30], [7, -16, EASE.in], [15, -18, EASE.smooth]]);
  return <div style={{position: 'absolute', left: -6, top: 230, width: w, textAlign: 'center', rotate: `${r}deg`, scale: String(s), opacity: Math.min(1, t / 2), fontFamily: DISPLAY, fontSize: size, color: '#ef4444', border: '5px solid #ef4444', borderRadius: 10, background: 'rgba(255,255,255,0.9)', boxShadow: t < 9 ? `0 ${20 * (1 - t / 9)}px 30px rgba(0,0,0,0.4)` : '0 2px 4px rgba(0,0,0,0.25)'}}>{text}</div>;
};

const Ball: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 70 * s, height: 70 * s, borderRadius: 35 * s, background: 'radial-gradient(circle at 35% 35%, #fff 0 55%, #cbd5e1 100%)', border: `${5 * s}px solid ${OL}`, rotate: `${rot}deg`}}>
    <div style={{position: 'absolute', left: '32%', top: '30%', width: '36%', height: '36%', background: OL, clipPath: 'polygon(50% 0, 100% 38%, 82% 100%, 18% 100%, 0 38%)'}} />
  </div>
);

/* fourDoorsV2: { fourOnWord, firstOnWord, s1..s4 } — tracking shot of the running boy (fg lamp posts whip past, blurred) → hard cut at 1.2 s to a
   wide on four doors; each RELEASED stamp lands on a spoken word with a camera kick, door shake and dust; the boy brakes with anticipation,
   flinches and turns his head door to door; on "thirteen" the camera dollies onto door 1 while his shoulders and head drop. */
const FourDoorsV2: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fAt = at(captions, scene.fourOnWord, fps, 4);
  const tAt = at(captions, scene.firstOnWord, fps, dur * 0.7);
  const hits = [at(captions, 'released', fps, fAt + 10), at(captions, 'him', fps, fAt + 18), at(captions, 'before', fps, fAt + 26), at(captions, 'eighteen.', fps, fAt + 40)];
  const cut = 36;
  // boy: runs in, brakes with a lean-back overshoot, settles
  const bx = kf(frame, [[0, -120], [44, 470, EASE.linear], [62, 560, EASE.out]]);
  const running = frame < 50;
  const brake = kf(frame, [[40, 12], [52, -14, EASE.out], [64, 3, EASE.smooth], [74, 0, EASE.smooth]]);
  const flinch = impulses(frame, hits, 1, 12, 1.1);
  const lookTo = kf(frame, [[hits[0] - 2, 0.3], [hits[0] + 6, -1, EASE.out], [hits[1] + 6, -0.5, EASE.out], [hits[2] + 6, 0.3, EASE.out], [hits[3] + 6, 0.9, EASE.out], [tAt - 4, 0.9], [tAt + 8, -0.9, EASE.out]]);
  const slump = kf(frame, [[tAt, 0], [tAt + 22, 1, EASE.smooth]]);
  // camera: tracking close shot → cut → wide with kicks → dolly onto door 1
  const camTrack = {x: bx + 120, y: 1060, zoom: 1.35, roll: -1.5};
  const kick = impulses(frame, hits, 0.035, 12, 1.4);
  const dolly = kf(frame, [[tAt - 2, 0], [tAt + 24, 1, EASE.smooth]]);
  const wide = {x: interpolate(dolly, [0, 1], [500, 380]), y: interpolate(dolly, [0, 1], [890, 900]), zoom: interpolate(dolly, [0, 1], [1.12 + frame * 0.0004, 1.32]) + kick, roll: interpolate(dolly, [0, 1], [0, -1])};
  const cam = frame < cut ? camTrack : wide;
  const doorShake = (i: number) => impulse(frame, hits[i], 6, 14, 1.6);
  return (
    <AbsoluteFill style={{background: '#0f172a'}}>
      <CameraRig cam={cam}>
        {/* far: night sky + city */}
        <Layer depth={0.3} blur={2}>
          <div style={{position: 'absolute', left: -600, top: -200, width: 2400, height: 1400, background: 'linear-gradient(180deg,#0b1224 0%, #1e293b 70%, #334155 100%)'}} />
          <svg width={2400} height={400} viewBox="0 0 2400 400" style={{position: 'absolute', left: -600, top: 520}}>
            <path d="M0 400 V220 H140 V140 h60 V220 H360 V180 H480 V90 h50 V220 H700 V160 H860 V230 H1040 V120 h70 V230 H1300 V170 H1480 V100 h60 V230 H1700 V190 H1900 V140 h60 V230 H2400 V400Z" fill="#273449" />
            {new Array(40).fill(0).map((_, i) => <rect key={i} x={(i * 61) % 2400} y={240 + (i % 5) * 26} width={10} height={14} fill="#fde68a" opacity={(i * 7) % 3 === 0 ? 0.7 : 0.15} />)}
          </svg>
        </Layer>
        {/* action plane */}
        <Layer depth={1}>
          <div style={{position: 'absolute', left: -800, top: 880, width: 2800, height: 1200, background: 'linear-gradient(180deg,#475569 0%, #334155 100%)'}} />
          <div style={{position: 'absolute', left: -800, top: 860, width: 2800, height: 26, background: '#1e293b'}} />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{position: 'absolute', left: 50 + i * 215 + doorShake(i), top: 430, width: 185, height: 430, background: i === 0 ? '#7f1d1d' : '#3f3f46', border: `7px solid ${OL}`, borderRadius: '90px 90px 8px 8px', boxShadow: 'inset -18px 0 0 rgba(0,0,0,0.18)'}}>
              {i === 0 ? <div style={{position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center', fontSize: 70}}>❤️</div> : null}
              <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: DISPLAY, fontSize: 34, color: '#e5e7eb'}}>ACADEMY {i + 1}</div>
              <div style={{position: 'absolute', right: 22, top: 250, width: 20, height: 20, borderRadius: 10, background: '#facc15'}} />
              <StampV2 at={hits[i]} text="RELEASED" w={190} />
            </div>
          ))}
          {hits.map((h, i) => <DustBurst key={i} at={h} x={140 + i * 215} y={860} />)}
          {/* light pool under the lamp */}
          <div style={{position: 'absolute', left: bx - 200, top: 1120, width: 400, height: 90, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(253,230,138,0.25), transparent 70%)'}} />
          <Boy x={bx} y={1200} height={290} stage="child" pose={running ? 'run' : 'stand'} phase={frame / 2.6}
            skin={sb.character.palette.skin} rim="#fde68a" glow={0.35}
            mood={frame >= tAt ? 'sad' : frame >= hits[0] ? 'shock' : 'happy'}
            lean={(running ? 12 : brake) - slump * 8 + flinch * -4} headTilt={flinch * 6 + slump * 14} look={running ? 0.6 : lookTo}
            squash={1 - Math.abs(flinch) * 0.05}
            arms={running ? undefined : [interpolate(slump, [0, 1], [14, 4]) + flinch * 25, interpolate(slump, [0, 1], [-14, -4]) - flinch * 25]} />
        </Layer>
        {/* near foreground: lamp posts whipping past (tracking shot) + dust */}
        <Layer depth={1.6} blur={frame < cut ? 7 : 4}>
          {frame < cut && [-300, 500, 1300].map((x, i) => <div key={i} style={{position: 'absolute', left: x, top: 300, width: 44, height: 1700, background: '#0b1020', borderRadius: 10}} />)}
          <Particles count={26} color="#cbd5e1" size={9} speedY={-0.2} speedX={0.4} seed={3} opacity={0.35} />
        </Layer>
      </CameraRig>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, transparent 55%, rgba(0,0,0,0.45) 100%)'}} />
      <KTag text="4 ACADEMIES. 4 NOs." a={fAt + 2} y={300} size={62} rot={2} />
      {frame >= tAt ? <KTag text="THE FIRST: AGE 13" a={tAt + 6} y={420} size={62} color="#ef4444" rot={-2} /> : null}
      <SeriesBadge text={scene.badge as string} from={50} />
    </AbsoluteFill>
  );
};

/* cryTrainingV2: { trialOnWord } — rainy night pitch shot off-centre under floodlight beams; slow dolly-in with drift; the boy hides his eyes
   with one hand and sobs (shoulder judder); on "another" three TRIAL ✗ cards whip in with trails and overshoot, his head turns to them. */
const CryTrainingV2: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tAt = at(captions, scene.trialOnWord, fps, dur * 0.55);
  const sobs = [6, 30, 52, 76, 100, 126].filter((f) => f < tAt + 40);
  const sob = impulses(frame, sobs, 1, 16, 1.2);
  const turn = kf(frame, [[tAt - 2, 0], [tAt + 10, 0.9, EASE.out]]);
  const cam = {x: kf(frame, [[0, 470], [dur, 520, EASE.smooth]]), y: kf(frame, [[0, 980], [dur, 1000, EASE.smooth]]), zoom: kf(frame, [[0, 1.28], [dur, 1.48, EASE.smooth]]), roll: 1.2};
  const hand = kf(frame, [[0, -150], [10, -165, EASE.out], [tAt, -162], [tAt + 10, 18, EASE.anticip]]) + sob * 6;
  return (
    <AbsoluteFill style={{background: '#020617'}}>
      <CameraRig cam={cam}>
        <Layer depth={0.3} blur={1.5}>
          <div style={{position: 'absolute', left: -600, top: -300, width: 2400, height: 1500, background: 'linear-gradient(180deg,#020617 0%, #0f172a 60%, #1e293b 100%)'}} />
          {[60, 980].map((x, i) => (
            <div key={i}>
              <div style={{position: 'absolute', left: x, top: 200, width: 30, height: 640, background: '#111827'}} />
              <div style={{position: 'absolute', left: x - 50, top: 180, width: 130, height: 50, background: '#fef9c3', borderRadius: 8, boxShadow: '0 0 120px 60px rgba(254,249,195,0.35)'}} />
              <div style={{position: 'absolute', left: x - 260, top: 220, width: 560, height: 900, background: 'linear-gradient(180deg, rgba(254,249,195,0.18), transparent 80%)', clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)'}} />
            </div>
          ))}
        </Layer>
        <Layer depth={1}>
          <div style={{position: 'absolute', left: -800, top: 900, width: 2800, height: 1200, background: 'linear-gradient(180deg,#166534 0%, #14532d 100%)'}} />
          {new Array(8).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: -600 + i * 360, top: 900, width: 180, height: 1200, background: 'rgba(255,255,255,0.03)'}} />)}
          {/* goal post on the left, cones, puddle reflections */}
          <div style={{position: 'absolute', left: 150, top: 620, width: 20, height: 300, background: '#f8fafc', borderRadius: 6}} />
          <div style={{position: 'absolute', left: 150, top: 620, width: 420, height: 18, background: '#f8fafc', borderRadius: 6}} />
          {[[660, 1150], [780, 1230], [900, 1140]].map(([x, y], i) => <div key={i} style={{position: 'absolute', left: x, top: y, width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderBottom: '50px solid #f97316'}} />)}
          {new Array(5).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: 120 + i * 190, top: 1240 + (i % 2) * 60, width: 150, height: 26, borderRadius: '50%', background: 'rgba(148,163,184,0.25)', scale: String(1 + 0.15 * Math.sin(frame / 6 + i))}} />)}
          <Boy x={400 + sob * 2} y={1180} height={310} stage="teen" pose="stand" skin={sb.character.palette.skin} rim="#93c5fd" glow={0.2}
            mood="cry" lean={-4 + sob * 3} headTilt={kf(frame, [[0, 10], [tAt, 12], [tAt + 10, -2, EASE.out]]) + sob * 4} look={turn}
            squash={1 - Math.abs(sob) * 0.03} arms={[hand, -10 - sob * 6]} />
          <Particles count={60} color="#bfdbfe" size={3} speedY={2.2} speedX={-0.4} seed={7} streak={34} opacity={0.35} />
        </Layer>
        <Layer depth={1.5} blur={3}>
          <Particles count={22} color="#dbeafe" size={6} speedY={3.2} speedX={-0.6} seed={11} streak={90} opacity={0.4} />
        </Layer>
      </CameraRig>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 40% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)'}} />
      <KTag text="TRAINING · AGE 13" a={4} y={300} size={58} />
      {[0, 1, 2].map((i) => {
        const a = tAt + i * 7;
        if (frame < a) return null;
        const t = frame - a;
        const x = kf(t, [[0, 900], [9, 600, EASE.out], [13, 620, EASE.smooth]]);
        const dx = t < 9 ? -34 : 0;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: 560 + i * 150, width: 300, height: 90, rotate: `${(i - 1) * 5 + kf(t, [[0, 18], [12, 0, EASE.overshoot]])}deg`}}>
            <Trail dx={dx} trail={t < 9 ? 3 : 0}>
              <div style={{fontFamily: DISPLAY, fontSize: 52, color: '#111', background: '#f8fafc', border: `6px solid ${OL}`, borderRadius: 14, textAlign: 'center', padding: '8px 0'}}>TRIAL <span style={{color: '#dc2626'}}>✗</span></div>
            </Trail>
          </div>
        );
      })}
      <SeriesBadge text={scene.badge as string} />
    </AbsoluteFill>
  );
};

export const UPGRADE1_SCENES: Record<string, React.FC<SceneProps>> = {fourDoorsV2: FourDoorsV2, cryTrainingV2: CryTrainingV2};
