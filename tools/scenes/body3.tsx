import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Camera, Shake} from '../components/Fx';
import {DailyPill, SeriesBadge, Syn} from '../components/Host';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* Your Body, Explained #3 — gut rhythm + vitamin B1 genes (Gut, Jan 2026). gutClock (hook), dnaSpots, b1Cell, intakeBars, earlyScience (+ loop). Explain only, never advise. */
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

/* simple cartoon gut: a coiled tube with a travelling pulse */
const Gut: React.FC<{x: number; y: number; s?: number; speed?: number; glow?: string}> = ({x, y, s = 1, speed = 1, glow = '#fda4af'}) => {
  const frame = useCurrentFrame();
  const d = 'M60 40 H340 Q380 40 380 80 V120 Q380 160 340 160 H80 Q40 160 40 200 V230 Q40 270 80 270 H320 Q360 270 360 310 V340 Q360 380 320 380 H180';
  const p = ((frame * 0.012 * speed) % 1) * 1400;
  return (
    <svg width={420 * s} height={420 * s} viewBox="0 0 420 420" style={{position: 'absolute', left: x, top: y}}>
      <path d={d} stroke={OL} strokeWidth={70} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke="#f472b6" strokeWidth={54} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={glow} strokeWidth={30} fill="none" strokeLinecap="round" strokeDasharray={`60 1400`} strokeDashoffset={-p} />
    </svg>
  );
};

/* gutClock: { badge, a, b, top, aOnWord, bOnWord, dnaOnWord } — HOOK: split screen, two cartoon calendars: "3× A DAY" vs "3× A WEEK"; a DNA strand drops in between. */
const GutClock: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const aAt = at(captions, scene.aOnWord, fps, 0);
  const bAt = at(captions, scene.bOnWord, fps, dur * 0.35);
  const dAt = at(captions, scene.dnaOnWord, fps, dur * 0.75);
  const ds = spring({frame: frame - dAt, fps, config: {damping: 9, stiffness: 160}});
  const Cal: React.FC<{x: number; title: string; marks: number[]; a: number; col: string}> = ({x, title, marks, a, col}) => {
    const s = spring({frame: frame - a, fps, config: {damping: 11, stiffness: 200}});
    return (
      <div style={{position: 'absolute', left: x, top: 470, width: 440, height: 520, background: '#fff', border: `8px solid ${OL}`, borderRadius: 26, boxShadow: `0 12px 0 ${OL}`, scale: String(0.85 + s * 0.15), opacity: frame >= a - 2 ? 1 : 0.8}}>
        <div style={{height: 110, background: col, borderBottom: `8px solid ${OL}`, borderRadius: '18px 18px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontSize: 64, color: '#fff', WebkitTextStroke: `5px ${OL}`, paintOrder: 'stroke fill'}}>{title}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, padding: 22}}>
          {new Array(21).fill(0).map((_, i) => (
            <div key={i} style={{height: 92, borderRadius: 12, background: '#f1f5f9', border: `4px solid ${OL}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {marks.includes(i) && frame > a + 4 + i ? <div style={{width: 30, height: 30, borderRadius: 15, background: col, border: `4px solid ${OL}`}} /> : null}
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <Shake at={dAt} amount={10}>
        <Camera dur={dur} from={1.06} to={1.0}>
          <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #fde68a 0%, #f59e0b 70%, #b45309 100%)'}} />
          <Cal x={50} title={(scene.a as string) ?? '3× A DAY'} marks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]} a={aAt} col="#22c55e" />
          <Cal x={590} title={(scene.b as string) ?? '3× A WEEK'} marks={[0, 3, 5, 7, 10, 12, 14, 17, 19]} a={bAt} col="#3b82f6" />
          <svg width={240} height={700} viewBox="0 0 120 350" style={{position: 'absolute', left: 420, top: interpolate(ds, [0, 1], [-760, 380]), rotate: `${Math.sin(frame / 10) * 4}deg`}}>
            {new Array(14).fill(0).map((_, i) => {
              const y = 10 + i * 24;
              const w = Math.sin(i * 0.8 + frame / 8) * 40;
              return (
                <g key={i}>
                  <line x1={60 - w} y1={y} x2={60 + w} y2={y} stroke={OL} strokeWidth={6} />
                  <circle cx={60 - w} cy={y} r={10} fill="#a78bfa" stroke={OL} strokeWidth={4} />
                  <circle cx={60 + w} cy={y} r={10} fill="#f472b6" stroke={OL} strokeWidth={4} />
                </g>
              );
            })}
          </svg>
          <Tag text={(scene.top as string) ?? 'NORMAL? BOTH.'} at={-12} y={250} size={72} color="#fff" rot={-2} />
        </Camera>
      </Shake>
      <SeriesBadge text={(scene.badge as string) ?? 'YOUR BODY, EXPLAINED #3'} />
      <Syn x={150} y={1270} size={250} pose="wave" from={0} to={Math.round(bAt + 10)} />
    </AbsoluteFill>
  );
};

/* dnaSpots: { count, tag, countOnWord } — a long DNA ribbon scrolls past a scanner; glowing markers light up while a counter climbs to 21. */
const DnaSpots: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cAt = at(captions, scene.countOnWord, fps, dur * 0.5);
  const total = (scene.count as number) ?? 21;
  const n = Math.round(interpolate(frame, [6, cAt + 6], [0, total], clamp));
  return (
    <Camera dur={dur} from={1.0} to={1.05}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)'}} />
      {new Array(24).fill(0).map((_, i) => {
        const x = ((i * 90 - frame * 9) % 2160 + 2160) % 2160 - 540;
        const lit = random(`d${i}`) > 0.45;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: 640 + Math.sin(i * 0.7) * 60, width: 26, height: 300, background: '#334155', border: `4px solid ${OL}`, borderRadius: 12}}>
            <div style={{position: 'absolute', left: -10, top: -14, width: 46, height: 46, borderRadius: 23, background: lit && x < 600 ? '#fde047' : '#a78bfa', border: `4px solid ${OL}`, boxShadow: lit && x < 600 ? '0 0 30px 10px rgba(253,224,71,0.6)' : 'none'}} />
            <div style={{position: 'absolute', left: -10, bottom: -14, width: 46, height: 46, borderRadius: 23, background: '#f472b6', border: `4px solid ${OL}`}} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 520, top: 520, width: 12, height: 560, background: '#22d3ee', boxShadow: '0 0 40px 14px rgba(34,211,238,0.6)', opacity: 0.8 + 0.2 * Math.sin(frame / 3)}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1110, textAlign: 'center', fontFamily: DISPLAY, fontSize: 210, color: '#fde047', WebkitTextStroke: `10px ${OL}`, paintOrder: 'stroke fill'}}>{n}</div>
      <Tag text={(scene.tag as string) ?? 'DNA SPOTS LINKED TO GUT RHYTHM'} at={cAt} y={300} size={56} color="#fff" rot={-2} />
    </Camera>
  );
};

/* b1Cell: { carryOnWord, switchOnWord, label } — a big B1 pill; a cell with a door (gene 1 carries it in) and a power switch (gene 2 switches it on) → the gut lights up and starts moving. */
const B1Cell: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cAt = at(captions, scene.carryOnWord, fps, dur * 0.45);
  const sAt = at(captions, scene.switchOnWord, fps, dur * 0.75);
  const ps = spring({frame, fps, config: {damping: 10, stiffness: 180}});
  const move = interpolate(frame, [cAt - 4, cAt + 14], [0, 1], clamp);
  const on = frame >= sAt;
  const eAt = at(captions, scene.energyOnWord, fps, -1);
  return (
    <AbsoluteFill>
      <Shake at={sAt} amount={10}>
        <Camera dur={dur} from={1.05} to={1.0}>
          <AbsoluteFill style={{background: on ? 'radial-gradient(circle at 50% 55%, #bbf7d0 0%, #16a34a 80%)' : 'radial-gradient(circle at 50% 55%, #e9d5ff 0%, #6d28d9 85%)'}} />
          <div style={{position: 'absolute', left: 220, top: 820, width: 640, height: 640, borderRadius: '50%', background: 'rgba(255,255,255,0.75)', border: `10px solid ${OL}`}}>
            <div style={{position: 'absolute', left: -40, top: 250, width: 90, height: 140, background: '#f59e0b', border: `7px solid ${OL}`, borderRadius: 14}} />
            <div style={{position: 'absolute', right: 70, top: 70, width: 110, height: 160, background: '#e5e7eb', border: `7px solid ${OL}`, borderRadius: 16}}>
              <div style={{position: 'absolute', left: 30, top: on ? 22 : 80, width: 36, height: 56, background: on ? '#22c55e' : '#ef4444', border: `5px solid ${OL}`, borderRadius: 8}} />
            </div>
            <Gut x={150} y={180} s={0.85} speed={on ? 3 : 0.4} glow={on ? '#fef08a' : '#fda4af'} />
          </div>
          <div style={{position: 'absolute', left: interpolate(move, [0, 1], [160, 300]), top: interpolate(move, [0, 1], [420, 1050]), scale: String((0.5 + ps * 0.5) * interpolate(move, [0, 1], [1, 0.45])), rotate: `${-20 + Math.sin(frame / 8) * 6}deg`}}>
            <div style={{width: 360, height: 170, borderRadius: 85, background: 'linear-gradient(90deg, #ef4444 50%, #fde047 50%)', border: `10px solid ${OL}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontSize: 110, color: '#fff', WebkitTextStroke: `7px ${OL}`, paintOrder: 'stroke fill'}}>B1</div>
          </div>
          <Tag text={(scene.label as string) ?? 'VITAMIN B1'} at={4} y={260} size={92} color="#ffcc4d" rot={-3} />
          {scene.energyOnWord && frame >= eAt ? <Tag text={(scene.energy as string) ?? 'FOOD → ENERGY FOR NERVES + MUSCLES'} at={eAt} y={1490} size={46} color="#fff" rot={1} /> : null}
          {frame >= cAt ? <Tag text="GENE 1: CARRIES IT IN" at={cAt} y={400} size={50} color="#fff" rot={2} /> : null}
          {on ? <Tag text="GENE 2: SWITCHES IT ON" at={sAt} y={490} size={50} color="#bbf7d0" rot={-2} /> : null}
        </Camera>
      </Shake>
      <Syn x={160} y={1240} size={230} pose="shock" from={Math.round(sAt)} to={dur} />
    </AbsoluteFill>
  );
};

/* intakeBars: { barsOnWord, genesOnWord, tag } — bar chart: more B1 from food → more trips per week; then the bars split by gene type (one group rises much more). */
const IntakeBars: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bAt = at(captions, scene.barsOnWord, fps, 4);
  const gAt = at(captions, scene.genesOnWord, fps, dur * 0.65);
  const split = interpolate(frame, [gAt, gAt + 16], [0, 1], clamp);
  const hs = [0.35, 0.5, 0.65, 0.8];
  return (
    <Camera dur={dur} from={1.0} to={1.04}>
      <AbsoluteFill style={{background: '#f8fafc'}} />
      <div style={{position: 'absolute', left: 120, top: 1300, width: 840, height: 10, background: OL}} />
      <div style={{position: 'absolute', left: 120, top: 520, width: 10, height: 790, background: OL}} />
      {hs.map((h, i) => {
        const g = spring({frame: frame - bAt - i * 5, fps, config: {damping: 12}});
        const H = 700 * h * g;
        const hiH = H * (1 + 0.25 * split * i / 3);
        const loH = H * (1 - 0.35 * split * i / 3);
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: 180 + i * 200, top: 1300 - hiH, width: 70 + 60 * (1 - split), height: hiH, background: '#22c55e', border: `6px solid ${OL}`, borderBottom: 'none', borderRadius: '14px 14px 0 0'}} />
            {split > 0 ? <div style={{position: 'absolute', left: 260 + i * 200, top: 1300 - loH, width: 70, height: loH, background: '#94a3b8', border: `6px solid ${OL}`, borderBottom: 'none', borderRadius: '14px 14px 0 0', opacity: split}} /> : null}
            {new Array(Math.ceil(h * 4)).fill(0).map((__, k) => <div key={k} style={{position: 'absolute', left: 190 + i * 200 + k * 26, top: 1330, width: 22, height: 22, borderRadius: 11, background: '#ef4444', border: `3px solid ${OL}`, opacity: g}} />)}
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', left: 120, top: 1380, width: 840, textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 40, color: '#334155'}}>MORE B1 FROM FOOD →</div>
      <div style={{position: 'absolute', left: -170, top: 860, width: 600, rotate: '-90deg', textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 40, color: '#334155'}}>MORE TRIPS →</div>
      <Tag text={(scene.tag as string) ?? '98,449 PEOPLE'} at={4} y={300} size={80} color="#ffcc4d" rot={-2} />
      {split > 0 ? <Tag text="DEPENDS ON YOUR GENES" at={gAt} y={430} size={52} color="#fff" rot={2} /> : null}
    </Camera>
  );
};

/* earlyScience: { note, ibsOnWord, loopOnWord } — the gut with a magnifying glass and a "?"; a clear NOT MEDICAL ADVICE card; daily pill; Syn thinking. */
const EarlyScience: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const iAt = at(captions, scene.ibsOnWord, fps, 6);
  const nAt = at(captions, scene.noteOnWord, fps, dur * 0.35);
  const ns = spring({frame: frame - nAt, fps, config: {damping: 11, stiffness: 190}});
  return (
    <AbsoluteFill>
      <Camera dur={dur} from={1.05} to={1.0}>
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #fce7f3 0%, #be185d 90%)'}} />
        <Gut x={310} y={520} s={1.1} speed={1} />
        <svg width={300} height={300} viewBox="0 0 100 100" style={{position: 'absolute', left: 600 + Math.sin(frame / 12) * 30, top: 640 + Math.cos(frame / 14) * 20}}>
          <circle cx={40} cy={40} r={28} fill="rgba(186,230,253,0.5)" stroke={OL} strokeWidth={6} />
          <line x1={60} y1={60} x2={88} y2={88} stroke={OL} strokeWidth={10} strokeLinecap="round" />
        </svg>
        <Tag text="IBS: STILL BEING STUDIED" at={iAt} y={300} size={60} color="#ffcc4d" rot={-2} />
        <div style={{position: 'absolute', left: 140, right: 140, top: 1010, padding: '20px 26px', background: '#fff', border: `8px solid ${OL}`, borderRadius: 22, boxShadow: `0 10px 0 ${OL}`, textAlign: 'center', opacity: frame >= nAt ? 1 : 0, scale: String(0.7 + ns * 0.3)}}>
          <div style={{fontFamily: DISPLAY, fontSize: 58, color: '#dc2626'}}>NOT MEDICAL ADVICE</div>
          <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 36, color: '#1e293b', marginTop: 6}}>{(scene.note as string) ?? 'Talk to a doctor before taking supplements'}</div>
        </div>
      </Camera>
      <DailyPill from={Math.round(dur * 0.55)} y={1250} />
      <Syn x={150} y={1470} size={190} pose="think" from={Math.round(nAt)} to={dur} />
    </AbsoluteFill>
  );
};

export const BODY3_SCENES: Record<string, React.FC<SceneProps>> = {gutClock: GutClock, dnaSpots: DnaSpots, b1Cell: B1Cell, intakeBars: IntakeBars, earlyScience: EarlyScience};
