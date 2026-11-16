import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {DailyPill, SeriesBadge, Syn} from '../components/Host';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* Try This #1 — motion aftereffect (spiral). spiralStare, lookHand, tiredNeurons, waterfallRocks, againLoop. */
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

/* Archimedean spiral, 4 arms, black/white — the classic adaptation stimulus. */
const SPIRAL = (() => {
  const arms: string[] = [];
  for (let a = 0; a < 2; a++) {
    const pts: string[] = [];
    for (let t = 0; t <= 6 * Math.PI; t += 0.08) {
      const r = 12 + t * 24;
      const th = t + a * Math.PI;
      pts.push(`${(r * Math.cos(th)).toFixed(1)},${(r * Math.sin(th)).toFixed(1)}`);
    }
    arms.push(`M${pts.join(' L')}`);
  }
  return arms;
})();

const Spiral: React.FC<{rot: number; size?: number}> = ({rot, size = 900}) => (
  <svg width={size} height={size} viewBox="-470 -470 940 940" style={{borderRadius: '50%', boxShadow: `0 0 0 14px ${OL}, 0 0 80px rgba(63,211,198,0.45)`}}>
    <circle r={470} fill="#f8fafc" />
    <g transform={`rotate(${rot})`}>
      {SPIRAL.map((d, i) => <path key={i} d={d} stroke="#111" strokeWidth={36} fill="none" strokeLinecap="round" />)}
    </g>
    <circle r={16} fill="#ef4444" stroke="#fff" strokeWidth={6} />
  </svg>
);

/* spiralStare: { timerOnWord, timerSec, tips: [{text, atSec}] , top, badge } — HOOK + the 20 s adaptation. The spiral turns at a steady 150°/s from frame 0. */
const SpiralStare: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tAt = at(captions, scene.timerOnWord, fps, Math.round(dur - 20 * fps));
  const total = Math.max(1, dur - tAt);
  const left = Math.max(0, Math.ceil(((scene.timerSec as number) ?? 20) * (1 - (frame - tAt) / total)));
  const tips = (scene.tips as {text: string; atSec: number}[]) ?? [];
  const tip = [...tips].reverse().find((t) => frame >= tAt + t.atSec * fps);
  const ring = interpolate(frame, [tAt, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #26304d 0%, #0b1020 80%)'}}>
      <div style={{position: 'absolute', left: 90, top: 470}}><Spiral rot={(frame * 5) % 360} /></div>
      {/* timer ring + number */}
      {frame >= tAt ? (
        <>
          <svg width={220} height={220} style={{position: 'absolute', left: 430, top: 40}}>
            <circle cx={110} cy={110} r={92} stroke="#334155" strokeWidth={18} fill="#0b1020" />
            <circle cx={110} cy={110} r={92} stroke="#ffd84a" strokeWidth={18} fill="none" strokeDasharray={578} strokeDashoffset={578 * (1 - ring)} transform="rotate(-90 110 110)" strokeLinecap="round" />
            <text x={110} y={140} textAnchor="middle" fontFamily={DISPLAY} fontSize={92} fill="#fff">{left}</text>
          </svg>
        </>
      ) : null}
      <Tag text={tip ? tip.text : ((scene.top as string) ?? 'STARE AT THE RED DOT')} at={-12} y={300} size={70} color={tip ? '#fff' : '#ffcc4d'} rot={-2} />
      <SeriesBadge text={(scene.badge as string) ?? 'TRY THIS #1'} />
      <Syn x={160} y={1300} size={190} pose="point" from={2} to={44} />
    </AbsoluteFill>
  );
};

/* lookHand: { top } — the spiral is gone. A STILL picture (an open cartoon hand on a wood-grain desk) so the after-effect shows on screen too. */
const LookHand: React.FC<SceneProps> = ({scene, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'repeating-linear-gradient(90deg, #a16207 0 46px, #92400e 46px 52px, #b45309 52px 110px)'}}>
      <svg width={760} height={900} viewBox="0 0 380 450" style={{position: 'absolute', left: 160, top: 430}}>
        <path d="M120 440 L120 250 Q60 210 40 150 Q35 125 58 128 Q78 132 100 190 L102 60 Q104 34 126 36 Q146 38 146 62 L148 170 L156 30 Q158 6 182 8 Q204 10 202 36 L198 172 L214 52 Q218 30 240 34 Q260 38 256 62 L246 186 L272 100 Q280 80 300 86 Q318 94 312 116 L284 260 Q270 330 262 440 Z" fill="#f1c27d" stroke={OL} strokeWidth={9} strokeLinejoin="round" />
        <path d="M150 300 q40 -20 80 0" stroke="#c68642" strokeWidth={6} fill="none" />
      </svg>
      <Tag text={(scene.top as string) ?? 'NOW LOOK AT YOUR HAND'} at={0} y={250} size={78} color="#ffcc4d" rot={-2} />
      <Syn x={170} y={1250} size={230} pose="shock" from={Math.round(dur * 0.45)} to={dur} />
      {frame < 3 ? <AbsoluteFill style={{background: '#fff', opacity: 0.6}} /> : null}
    </AbsoluteFill>
  );
};

/* tiredNeurons: { tag, tagOnWord } — a cartoon brain: a row of "→" motion cells that dim (tired) while the "←" cells stay bright, so the balance tips. */
const TiredNeurons: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tAt = at(captions, scene.tagOnWord, fps, dur * 0.3);
  const dim = interpolate(frame, [tAt, tAt + 20], [1, 0.18], clamp);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #312e81 0%, #0b1020 80%)'}}>
      <svg width={900} height={640} viewBox="0 0 900 640" style={{position: 'absolute', left: 90, top: 440}}>
        <path d="M150 360 Q90 200 220 120 Q330 30 470 70 Q620 20 730 130 Q840 230 780 370 Q760 500 600 520 Q470 600 330 540 Q170 520 150 360 Z" fill="#f9a8d4" stroke={OL} strokeWidth={10} />
        <path d="M300 160 q60 60 0 120 M460 110 q-40 90 30 170 M620 170 q-60 70 10 150" stroke="#db2777" strokeWidth={8} fill="none" opacity={0.6} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} opacity={dim}>
            <circle cx={260 + i * 120} cy={300} r={42} fill="#22d3ee" stroke={OL} strokeWidth={6} />
            <text x={260 + i * 120} y={318} textAnchor="middle" fontFamily={DISPLAY} fontSize={56} fill={OL}>→</text>
          </g>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <g key={`l${i}`}>
            <circle cx={260 + i * 120} cy={420} r={42} fill="#fde047" stroke={OL} strokeWidth={6} style={{filter: `drop-shadow(0 0 ${12 + Math.sin(frame / 4 + i) * 8}px #fde047)`}} />
            <text x={260 + i * 120} y={438} textAnchor="middle" fontFamily={DISPLAY} fontSize={56} fill={OL}>←</text>
          </g>
        ))}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontFamily: BODY, fontWeight: 900, fontSize: 44, color: '#e0f2fe', opacity: frame >= tAt ? 1 : 0}}>"→" CELLS TIRED · "←" CELLS WIN</div>
      <Tag text={(scene.tag as string) ?? 'MOTION AFTEREFFECT'} at={4} y={250} size={70} color="#3fd3c6" rot={-2} />
      <Syn x={160} y={1280} size={200} pose="think" from={6} to={dur} />
    </AbsoluteFill>
  );
};

/* waterfallRocks: { tag, tagOnWord } — a waterfall falls; beside it the rocks slowly drift UP (what people report). */
const WaterfallRocks: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drift = interpolate(frame, [dur * 0.4, dur], [0, -40], clamp);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #7dd3fc 0%, #bae6fd 60%, #166534 61%, #14532d 100%)'}}>
      <div style={{position: 'absolute', left: 380, top: 380, width: 320, height: 1000, background: 'repeating-linear-gradient(180deg, #e0f2fe 0 30px, #7dd3fc 30px 60px)', backgroundPositionY: `${frame * 14}px`, border: `8px solid ${OL}`, borderRadius: 30}} />
      {[[140, 560], [180, 900], [820, 640], [860, 980], [160, 1220], [840, 1260]].map(([x, y], i) => (
        <div key={i} style={{position: 'absolute', left: x - 90, top: y + drift, width: 180, height: 130, background: '#78716c', border: `8px solid ${OL}`, borderRadius: '40% 50% 45% 55%'}} />
      ))}
      <Tag text={(scene.tag as string) ?? 'THE WATERFALL ILLUSION'} at={at(captions, scene.tagOnWord, fps, dur * 0.4)} y={240} size={66} color="#fff" rot={-3} />
      <Tag text={(scene.tag2 as string) ?? 'ARISTOTLE SAW IT TOO'} at={4} y={130} size={52} color="#ffcc4d" rot={2} />
    </AbsoluteFill>
  );
};

/* againLoop: last line — the spiral fades back in, starts turning, Syn points at the dot; pill. Flows into spiralStare. */
const AgainLoop: React.FC<SceneProps> = ({scene, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, dur * 0.5], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #26304d 0%, #0b1020 80%)'}}>
      <div style={{position: 'absolute', left: 90, top: 470, opacity: o}}><Spiral rot={(frame * 5) % 360} /></div>
      <Tag text={(scene.top as string) ?? "DIDN'T FEEL IT? AGAIN."} at={2} y={300} size={70} color="#ffcc4d" rot={-2} />
      <Syn x={160} y={1300} size={190} pose="point" from={4} to={dur} />
      <DailyPill from={4} y={1400} />
    </AbsoluteFill>
  );
};

export const TRYTHIS1_SCENES: Record<string, React.FC<SceneProps>> = {
  spiralStare: SpiralStare,
  lookHand: LookHand,
  tiredNeurons: TiredNeurons,
  waterfallRocks: WaterfallRocks,
  againLoop: AgainLoop,
};
