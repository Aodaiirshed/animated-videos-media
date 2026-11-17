import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Syn} from '../components/Host';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* THE HIDDEN RULE — dark-parable style. Palette: dark slate, beige line art, ONE accent (red). Reusable: Dark, Narrator, Sheep, RuleBadge, Bubble.
   Scenes (#1 Conformity): fenceHook, flockChorus, lastSheep, sheepBlue, ruleCard, humanTurn. */
export const R = {bg1: '#1e2228', bg2: '#2a2f37', line: '#e6dac3', white: '#f3efe7', grey: '#868d97', red: '#d7263d'};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);

export const Dark: React.FC<{children?: React.ReactNode; zoom?: [number, number]; dur: number}> = ({children, zoom = [1.04, 1.0], dur}) => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, dur], zoom, clamp);
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${R.bg1} 0%, ${R.bg2} 100%)`}}>
      <AbsoluteFill style={{scale: String(z)}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

export const RuleBadge: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 40, top: 70, fontFamily: BODY, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: R.grey, border: `3px solid ${R.grey}`, borderRadius: 10, padding: '4px 14px'}}>{text}</div>
);

/* faceless narrator: hat + long coat silhouette, optional arm holding a brush */
export const Narrator: React.FC<{x: number; y: number; s?: number; brush?: boolean; arm?: number}> = ({x, y, s = 1, brush, arm = 0}) => (
  <svg width={260 * s} height={620 * s} viewBox="0 0 260 620" style={{position: 'absolute', left: x, top: y}}>
    <rect x={40} y={70} width={180} height={18} rx={9} fill="#111317" />
    <path d="M80 70 Q90 10 130 10 Q170 10 180 70 Z" fill="#111317" />
    <circle cx={130} cy={110} r={34} fill="#15181d" />
    <path d="M60 150 Q130 130 200 150 L230 600 L30 600 Z" fill="#111317" stroke={R.grey} strokeWidth={3} />
    <g transform={`rotate(${arm} 190 190)`}>
      <path d="M190 190 L300 260" stroke="#111317" strokeWidth={34} strokeLinecap="round" />
      {brush ? <g><rect x={292} y={248} width={60} height={16} rx={4} fill={R.line} transform="rotate(35 300 256)" /><rect x={336} y={268} width={30} height={30} rx={6} fill={R.red} transform="rotate(35 340 280)" /></g> : null}
    </g>
  </svg>
);

/* minimal sheep: beige cloud body, dark head; eyes look left/right */
export const Sheep: React.FC<{x: number; y: number; s?: number; look?: number; bob?: number; tint?: string}> = ({x, y, s = 1, look = 0, bob = 0, tint = R.line}) => (
  <svg width={190 * s} height={150 * s} viewBox="0 0 190 150" style={{position: 'absolute', left: x, top: y + bob}}>
    {[30, 60, 90, 120].map((cx) => <circle key={cx} cx={cx} cy={70} r={34} fill={tint} />)}
    <ellipse cx={75} cy={80} rx={70} ry={40} fill={tint} />
    <rect x={40} y={110} width={10} height={36} fill="#111317" /><rect x={110} y={110} width={10} height={36} fill="#111317" />
    <ellipse cx={160} cy={62} rx={26} ry={32} fill="#15181d" />
    <circle cx={152 + look * 6} cy={56} r={6} fill={R.white} /><circle cx={170 + look * 6} cy={56} r={6} fill={R.white} />
  </svg>
);

const Bubble: React.FC<{x: number; y: number; text: string; a: number; color?: string; size?: number}> = ({x, y, text, a, color = R.white, size = 46}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - a, fps, config: {damping: 12, stiffness: 220}});
  if (frame < a) return null;
  return <div style={{position: 'absolute', left: x, top: y, scale: String(s), fontFamily: DISPLAY, fontSize: size, color: '#15181d', background: color, padding: '4px 16px', borderRadius: 14}}>{text}</div>;
};

const Fence: React.FC<{y: number; paint: number}> = ({y, paint}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, height: 230}}>
    {new Array(12).fill(0).map((_, i) => {
      const painted = i / 12 < paint;
      return <div key={i} style={{position: 'absolute', left: 20 + i * 88, top: 0, width: 56, height: 230, background: painted ? R.red : '#3a3f48', clipPath: 'polygon(50% 0, 100% 14%, 100% 100%, 0 100%, 0 14%)'}} />;
    })}
    <div style={{position: 'absolute', left: 0, right: 0, top: 60, height: 22, background: paint > 0.98 ? R.red : '#3a3f48'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 160, height: 22, background: paint > 0.98 ? R.red : '#3a3f48'}} />
  </div>
);

const Moon: React.FC = () => <div style={{position: 'absolute', left: 820, top: 320, width: 110, height: 110, borderRadius: 55, background: R.white, boxShadow: '0 0 60px 10px rgba(243,239,231,0.25)'}} />;

/* fenceHook: { badge, top, paintOnWord, sheepOnWord } — HOOK: night field; the narrator paints a fence red; ten sheep appear in a row. */
const FenceHook: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pAt = at(captions, scene.paintOnWord, fps, 0);
  const sAt = at(captions, scene.sheepOnWord, fps, dur * 0.55);
  const paint = interpolate(frame, [pAt - 30, pAt + 25], [0.55, 1], clamp);
  return (
    <AbsoluteFill>
      <Dark dur={dur}>
        <Moon />
        <Fence y={650} paint={paint} />
        <Narrator x={720} y={560} s={0.9} brush arm={Math.sin(frame / 3) * 10} />
        {new Array(10).fill(0).map((_, i) => {
          const a = sAt + i * 2;
          return frame >= a ? <Sheep key={i} x={10 + (i % 5) * 200} y={940 + Math.floor(i / 5) * 150} s={0.9} bob={Math.sin(frame / 6 + i) * 3} /> : null;
        })}
        <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: DISPLAY, fontSize: 74, color: R.white}}>{(scene.top as string) ?? 'THE FENCE IS RED.'}</div>
      </Dark>
      <RuleBadge text={(scene.badge as string) ?? 'THE HIDDEN RULE #1'} />
    </AbsoluteFill>
  );
};

/* flockChorus: { word, onWords[] } — nine sheep face the camera; "BLUE" bubbles pop one after another; the fence stays red behind. */
const FlockChorus: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ow = (scene.onWords as string[]) ?? [];
  const firstAt = at(captions, ow[0], fps, 6);
  return (
    <Dark dur={dur} zoom={[1.0, 1.06]}>
      <Fence y={420} paint={1} />
      {new Array(9).fill(0).map((_, i) => {
        const a = firstAt + i * 5;
        return (
          <React.Fragment key={i}>
            <Sheep x={20 + (i % 3) * 330} y={720 + Math.floor(i / 3) * 210} s={0.95} look={-0.3} bob={frame >= a ? Math.sin((frame - a) / 3) * 3 : 0} />
            <Bubble x={60 + (i % 3) * 330} y={680 + Math.floor(i / 3) * 210} text={(scene.word as string) ?? 'BLUE.'} a={a} size={40} />
          </React.Fragment>
        );
      })}
    </Dark>
  );
};

/* lastSheep: { lookOnWord, backOnWord } — close-up: the tenth sheep alone, looks at the red fence (eyes left), then at the flock (eyes right); a heartbeat ring. */
const LastSheep: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lAt = at(captions, scene.lookOnWord, fps, 6);
  const bAt = at(captions, scene.backOnWord, fps, dur * 0.6);
  const look = frame < lAt ? 0 : frame < bAt ? -1.2 : 1.2;
  const ring = (frame % 26) / 26;
  return (
    <Dark dur={dur} zoom={[1.0, 1.12]}>
      <div style={{position: 'absolute', left: -60, top: 420, width: 420, height: 720, background: R.red, clipPath: 'polygon(0 10%, 100% 0, 100% 100%, 0 100%)'}} />
      <div style={{position: 'absolute', left: 300, top: 640, width: 520 + ring * 200, height: 520 + ring * 200, marginLeft: -ring * 100, marginTop: -ring * 100, borderRadius: '50%', border: `4px solid ${R.grey}`, opacity: 1 - ring}} />
      <Sheep x={300} y={760} s={2.6} look={look} />
      {frame >= bAt ? new Array(4).fill(0).map((_, i) => <Sheep key={i} x={830 + (i % 2) * 120} y={700 + i * 150} s={0.6} look={-1} tint={R.grey} />) : null}
    </Dark>
  );
};

/* sheepBlue: { word, wordOnWord } — the tenth sheep says "Blue." in a small, quiet bubble; the fence is still red; a tick sound. */
const SheepBlue: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const wAt = at(captions, scene.wordOnWord, fps, dur * 0.3);
  const drop = interpolate(frame, [wAt, wAt + 20], [0, 18], clamp);
  return (
    <Dark dur={dur}>
      <Fence y={500} paint={1} />
      <Sheep x={290} y={830 + drop} s={2.2} look={0.6} />
      <Bubble x={420} y={720} text={(scene.word as string) ?? 'blue.'} a={wAt} size={64} />
    </Dark>
  );
};

/* ruleCard: { title, def, alone, group, aloneOnWord, groupOnWord } — title card + Asch line test (target line, A B C) + two stats. */
const RuleCard: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ts = spring({frame, fps, config: {damping: 14}});
  const aAt = at(captions, scene.aloneOnWord, fps, dur * 0.45);
  const gAt = at(captions, scene.groupOnWord, fps, dur * 0.7);
  const lines = [{l: 'A', h: 230}, {l: 'B', h: 330}, {l: 'C', h: 160}];
  return (
    <Dark dur={dur} zoom={[1.0, 1.03]}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: ts}}>
        <div style={{fontFamily: DISPLAY, fontSize: 130, color: R.red, letterSpacing: 4}}>{(scene.title as string) ?? 'CONFORMITY'}</div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 40, color: R.white, marginTop: 4}}>{(scene.def as string) ?? 'WHEN THE GROUP DECIDES WHAT YOU SEE'}</div>
      </div>
      <div style={{position: 'absolute', left: 150, top: 640, width: 780, height: 380, border: `3px solid ${R.grey}`, borderRadius: 18}}>
        <div style={{position: 'absolute', left: 80, bottom: 40, width: 18, height: 230, background: R.white}} />
        <div style={{position: 'absolute', left: 50, bottom: 6, fontFamily: BODY, fontWeight: 800, fontSize: 26, color: R.grey}}>TARGET</div>
        {lines.map((ln, i) => (
          <React.Fragment key={ln.l}>
            <div style={{position: 'absolute', left: 340 + i * 150, bottom: 40, width: 18, height: ln.h, background: ln.l === 'A' ? R.white : R.grey}} />
            <div style={{position: 'absolute', left: 336 + i * 150, bottom: 0, fontFamily: DISPLAY, fontSize: 36, color: R.white}}>{ln.l}</div>
          </React.Fragment>
        ))}
      </div>
      {frame >= aAt ? <div style={{position: 'absolute', left: 150, top: 1060, fontFamily: DISPLAY, fontSize: 54, color: R.white}}>{(scene.alone as string) ?? 'ALONE: UNDER 1% WRONG'}</div> : null}
      {frame >= gAt ? <div style={{position: 'absolute', left: 150, top: 1140, fontFamily: DISPLAY, fontSize: 54, color: R.red}}>{(scene.group as string) ?? 'IN A GROUP: 3 IN 4 WENT ALONG'}</div> : null}
      <div style={{position: 'absolute', left: 150, top: 1230, fontFamily: BODY, fontWeight: 800, fontSize: 30, color: R.grey}}>{(scene.cite as string) ?? 'SOLOMON ASCH, 1951'}</div>
    </Dark>
  );
};

/* humanTurn: { line, oneOnWord } — stick-figure people around a table; one by one hands go up; then ONE figure keeps a red hand up and the others hesitate. */
const HumanTurn: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const oAt = at(captions, scene.oneOnWord, fps, dur * 0.6);
  const Person: React.FC<{x: number; y: number; up: number; red?: boolean}> = ({x, y, up, red}) => (
    <svg width={140} height={300} viewBox="0 0 140 300" style={{position: 'absolute', left: x, top: y}}>
      <circle cx={70} cy={40} r={30} fill="none" stroke={R.line} strokeWidth={8} />
      <line x1={70} y1={70} x2={70} y2={190} stroke={R.line} strokeWidth={8} />
      <line x1={70} y1={100} x2={30} y2={160} stroke={R.line} strokeWidth={8} strokeLinecap="round" />
      <line x1={70} y1={100} x2={110 + (1 - up) * 0} y2={100 - up * 90 + (1 - up) * 60} stroke={red ? R.red : R.line} strokeWidth={8} strokeLinecap="round" />
      <line x1={70} y1={190} x2={40} y2={290} stroke={R.line} strokeWidth={8} /><line x1={70} y1={190} x2={100} y2={290} stroke={R.line} strokeWidth={8} />
    </svg>
  );
  return (
    <AbsoluteFill>
      <Dark dur={dur}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: DISPLAY, fontSize: 64, color: R.white}}>{(scene.line as string) ?? "YOU THINK I'M TALKING ABOUT SHEEP."}</div>
        {new Array(6).fill(0).map((_, i) => {
          const up = interpolate(frame, [10 + i * 6, 22 + i * 6], [0, 1], clamp);
          const isOne = i === 2;
          const lower = !isOne && frame >= oAt ? interpolate(frame, [oAt, oAt + 20], [0, 0.7], clamp) : 0;
          return <Person key={i} x={40 + i * 170} y={720 + (i % 2) * 40} up={isOne && frame >= oAt ? 1 : up - lower} red={isOne && frame >= oAt} />;
        })}
        <div style={{position: 'absolute', left: 60, right: 60, top: 1110, height: 26, background: R.grey, borderRadius: 13}} />
      </Dark>
      <Syn x={150} y={1400} size={170} pose="think" from={Math.round(dur * 0.7)} to={dur} />
    </AbsoluteFill>
  );
};


/* darkPick: { question, options[], pauseOnWord } — dark-style pause-and-pick: three outlined options, a PAUSE chip. */
const DarkPick: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pAt = at(captions, scene.pauseOnWord, fps, 0);
  const opts = (scene.options as string[]) ?? [];
  return (
    <Dark dur={dur} zoom={[1.0, 1.04]}>
      <div style={{position: 'absolute', left: 80, right: 80, top: 330, textAlign: 'center', fontFamily: DISPLAY, fontSize: 70, color: R.white, lineHeight: 1.05}}>{scene.question as string}</div>
      {opts.map((o, i) => {
        const s = spring({frame: frame - 6 - i * 5, fps, config: {damping: 14}});
        return (
          <div key={i} style={{position: 'absolute', left: 170, width: 740, top: 600 + i * 180, height: 140, border: `4px solid ${R.line}`, borderRadius: 22, display: 'flex', alignItems: 'center', gap: 30, paddingLeft: 40, opacity: s, translate: `${(1 - s) * 60}px 0`}}>
            <span style={{fontFamily: DISPLAY, fontSize: 64, color: R.grey}}>{'ABC'[i]}</span>
            <span style={{fontFamily: DISPLAY, fontSize: 72, color: R.white}}>{o}</span>
          </div>
        );
      })}
      {frame >= pAt ? <div style={{position: 'absolute', left: 0, right: 0, top: 1170, textAlign: 'center'}}><span style={{fontFamily: DISPLAY, fontSize: 52, color: R.white, background: R.red, padding: '6px 26px', borderRadius: 14}}>❚❚ PAUSE & PICK</span></div> : null}
    </Dark>
  );
};

export const RULE1_SCENES: Record<string, React.FC<SceneProps>> = {fenceHook: FenceHook, flockChorus: FlockChorus, lastSheep: LastSheep, sheepBlue: SheepBlue, ruleCard: RuleCard, humanTurn: HumanTurn, darkPick: DarkPick};
