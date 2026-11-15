import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Boy} from '../components/Boy';
import {Camera, Shake} from '../components/Fx';
import {DailyPill, SeriesBadge, Syn} from '../components/Host';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* Guess Who: History #5 (Leonardo, hidden until the reveal): mirrorNotes, villageBoy, blueprints, unfinishedWall, carryPortrait, mirrorLoop.
   No real artworks are reproduced: the portrait is always seen from the back / under a cloth; paintings are abstract colour blocks. */
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

const LINES = ['the bird pushes the air', 'down and the air pushes', 'the bird up. so a man', 'with wings big enough', 'could also rise and fly', 'water and air move alike'];

/* A parchment page with mirrored handwriting; `reveal` 0..1 un-mirrors it (used by mirrorLoop). */
const Page: React.FC<{writeT: number; reveal?: number; w?: number}> = ({writeT, reveal = 0, w = 860}) => {
  const shown = Math.floor(writeT * LINES.length * 24);
  let left = shown;
  return (
    <div style={{width: w, height: w * 1.15, background: 'linear-gradient(160deg, #f3e2b8, #dcc28a)', border: `10px solid ${OL}`, borderRadius: 18, boxShadow: `0 16px 0 ${OL}`, position: 'relative', overflow: 'hidden'}}>
      {/* original sketches: a wing and a gear */}
      <svg width={w} height={w * 1.15} style={{position: 'absolute', opacity: 0.55}}>
        <path d={`M${w * 0.1} ${w * 0.95} q${w * 0.2} ${-w * 0.25} ${w * 0.42} ${-w * 0.05} q${-w * 0.1} ${w * 0.06} ${-w * 0.42} ${w * 0.05}`} stroke="#6b4f2a" strokeWidth={5} fill="none" />
        {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={w * 0.14 + i * w * 0.07} y1={w * 0.93 - i * 6} x2={w * 0.18 + i * w * 0.07} y2={w * 0.82 - i * 8} stroke="#6b4f2a" strokeWidth={4} />)}
        <circle cx={w * 0.78} cy={w * 0.9} r={w * 0.09} stroke="#6b4f2a" strokeWidth={5} fill="none" />
        {new Array(10).fill(0).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <line key={`g${i}`} x1={w * 0.78 + Math.cos(a) * w * 0.09} y1={w * 0.9 + Math.sin(a) * w * 0.09} x2={w * 0.78 + Math.cos(a) * w * 0.115} y2={w * 0.9 + Math.sin(a) * w * 0.115} stroke="#6b4f2a" strokeWidth={6} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 50, right: 50, top: 50, transform: `scaleX(${interpolate(reveal, [0, 1], [-1, 1])})`}}>
        {LINES.map((l, i) => {
          const n = Math.max(0, Math.min(l.length, left));
          left -= l.length;
          return <div key={i} style={{fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: w * 0.058, color: '#3b2a14', lineHeight: 1.45, whiteSpace: 'nowrap', textAlign: 'left'}}>{l.slice(0, n)}</div>;
        })}
      </div>
    </div>
  );
};

/* mirrorNotes: { top?, tagOnWord? } — HOOK. A notebook page filling with mirrored writing, quill moving right→left. Syn waves in the corner (≤1.5 s). */
const MirrorNotes: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = interpolate(frame, [0, dur * 0.9], [0.5, 1], clamp);
  const tAt = at(captions, scene.tagOnWord, fps, dur * 0.55);
  const qx = 860 - ((frame * 9) % 620);
  return (
    <AbsoluteFill>
    <Camera dur={dur} from={1.08} to={1.0}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #5b3a1a 0%, #1a0f06 80%)'}} />
      <div style={{position: 'absolute', left: 110, top: 360, rotate: '-2deg'}}><Page writeT={t} /></div>
      {/* quill */}
      <svg width={220} height={300} viewBox="0 0 220 300" style={{position: 'absolute', left: qx, top: 470 + Math.floor(t * 6) * 72 - 230, rotate: '-25deg'}}>
        <path d="M30 280 Q80 120 200 10 Q150 140 40 285 Z" fill="#f8fafc" stroke={OL} strokeWidth={6} />
        <path d="M30 280 L200 10" stroke={OL} strokeWidth={4} />
      </svg>
      <Tag text={(scene.top as string) ?? 'EVERY WORD. BACKWARDS.'} at={-12} y={225} size={76} color="#ffcc4d" rot={-2} />
      <Tag text={(scene.tag as string) ?? 'THOUSANDS OF PAGES'} at={tAt} y={1250} size={58} color="#fff" rot={3} />
    </Camera>
    <SeriesBadge text={(scene.badge as string) ?? 'GUESS WHO: HISTORY #5'} />
    <Syn x={190} y={1150} size={300} pose="wave" from={4} to={42} />
    </AbsoluteFill>
  );
};

/* villageBoy: { tag1, tag1OnWord, tag2, tag2OnWord } — Tuscan hills, a boy alone drawing birds on a stone wall. */
const VillageBoy: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <Camera dur={dur} from={1.0} to={1.1}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #fbd38d 0%, #f6ad55 35%, #9ae6b4 36%, #48bb78 100%)'}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M0 700 Q200 560 420 680 T860 640 T1080 660 V1920 H0 Z" fill="#68a357" />
        <path d="M0 860 Q300 760 600 860 T1080 830 V1920 H0 Z" fill="#4f8a3f" />
        {[160, 260, 820, 930].map((x, i) => <g key={i}><rect x={x - 6} y={640 + (i % 2) * 40} width={12} height={90} fill="#3b2a14" /><ellipse cx={x} cy={600 + (i % 2) * 40} rx={18} ry={70} fill="#22543d" /></g>)}
        <rect x={120} y={1080} width={840} height={150} rx={10} fill="#a0aec0" stroke={OL} strokeWidth={8} />
        {new Array(7).fill(0).map((_, i) => <line key={i} x1={120 + i * 120} y1={1080} x2={120 + i * 120} y2={1230} stroke="#718096" strokeWidth={5} />)}
        {/* chalk birds on the wall */}
        {[0, 1, 2].map((i) => <path key={`b${i}`} d={`M${560 + i * 120} ${1150 - i * 14} q20 -24 40 0 q20 -24 40 0`} stroke="#fff" strokeWidth={6} fill="none" opacity={interpolate(frame, [10 + i * 12, 18 + i * 12], [0, 1], clamp)} />)}
      </svg>
      {/* live birds overhead */}
      {[0, 1, 2, 3].map((i) => {
        const p = ((frame + i * 23) % 120) / 120;
        return <svg key={i} width={80} height={40} viewBox="0 0 80 40" style={{position: 'absolute', left: -80 + p * 1240, top: 420 + i * 50 + Math.sin(frame / 6 + i) * 10}}><path d={`M0 20 q20 ${frame % 10 < 5 ? -18 : 6} 40 0 q20 ${frame % 10 < 5 ? -18 : 6} 40 0`} stroke={OL} strokeWidth={5} fill="none" /></svg>;
      })}
      <Boy x={420} y={1440} height={430} stage="child" pose="stand" phase={frame / 3} skin={sb.character.palette.skin} rim="#fde68a" glow={0.3} mood="happy" />
      <Tag text={scene.tag1 as string} at={at(captions, scene.tag1OnWord, fps, 6)} y={240} size={66} color="#fff" rot={-3} />
      <Tag text={scene.tag2 as string} at={at(captions, scene.tag2OnWord, fps, dur * 0.6)} y={360} size={66} color="#ef4444" fg="#fff" rot={2} />
    </Camera>
  );
};

/* blueprints: { items: [{label, onWord}] , tag? } — blue grid; three original invention sketches draw in. */
const Blueprints: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items = (scene.items as {label: string; onWord?: string}[]) ?? [];
  const draw = (i: number) => interpolate(frame, [at(captions, items[i]?.onWord, fps, 6 + i * 20), at(captions, items[i]?.onWord, fps, 6 + i * 20) + 18], [0, 1], clamp);
  const st = {stroke: '#e0f2fe', strokeWidth: 6, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const icons = [
    // flying machine: two big ribbed wings
    <g key="w"><path d="M150 160 Q60 60 10 120 Q70 120 150 170 Q230 120 290 120 Q240 60 150 160Z" {...st} />{[40, 70, 100, 200, 230, 260].map((x) => <line key={x} x1={150} y1={160} x2={x} y2={110} {...st} strokeWidth={3} />)}<circle cx={150} cy={185} r={14} {...st} /></g>,
    // tank: cone with wheels and guns
    <g key="t"><path d="M40 190 L150 70 L260 190 Z" {...st} /><ellipse cx={150} cy={190} rx={120} ry={22} {...st} />{[70, 110, 150, 190, 230].map((x) => <line key={x} x1={x} y1={190} x2={x - 6} y2={168} {...st} strokeWidth={4} />)}<rect x={138} y={50} width={24} height={24} {...st} /></g>,
    // parachute: pyramid + figure
    <g key="p"><path d="M150 30 L50 140 L250 140 Z" {...st} /><line x1={150} y1={30} x2={150} y2={140} {...st} strokeWidth={3} /><line x1={50} y1={140} x2={150} y2={200} {...st} strokeWidth={3} /><line x1={250} y1={140} x2={150} y2={200} {...st} strokeWidth={3} /><circle cx={150} cy={208} r={10} {...st} /><line x1={150} y1={218} x2={150} y2={250} {...st} /></g>,
  ];
  return (
    <Camera dur={dur} from={1.04} to={1.0}>
      <AbsoluteFill style={{background: '#1e3a8a', backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.08) 2px, transparent 2px)', backgroundSize: '60px 60px'}} />
      {icons.map((ic, i) => {
        const d = draw(i);
        const x = [80, 560, 320][i], y = [300, 300, 760][i];
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, width: 440, opacity: d > 0 ? 1 : 0}}>
            <svg width={440} height={360} viewBox="0 0 300 260" style={{strokeDasharray: 1400, strokeDashoffset: (1 - d) * 1400}}>{ic}</svg>
            <div style={{textAlign: 'center', fontFamily: DISPLAY, fontSize: 52, color: '#fde68a', opacity: d}}>{items[i]?.label}</div>
          </div>
        );
      })}
      {scene.tag ? <Tag text={scene.tag as string} at={at(captions, scene.tagOnWord, fps, dur * 0.7)} y={1220} size={70} color="#ffcc4d" rot={-3} /> : null}
    </Camera>
  );
};

/* unfinishedWall: { big, label, sub?, subOnWord? } — reveal of the pick: a wall of 24 frames; most stay sketch-only with UNFINISHED tags,
   only a few fill with abstract colour. Syn reacts (shock). */
const UnfinishedWall: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const big = spring({frame: frame - 4, fps, config: {damping: 9}});
  const subAt = at(captions, scene.subOnWord, fps, dur * 0.55);
  return (
    <Camera dur={dur} from={1.0} to={1.06}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 35%, #7c2d12 0%, #1c0a05 80%)'}} />
      <div style={{position: 'absolute', top: 170, width: '100%', textAlign: 'center', scale: String(0.4 + big * 0.6)}}>
        <span style={{fontFamily: DISPLAY, fontSize: 260, lineHeight: 1, color: '#ffcc4d', WebkitTextStroke: `14px ${OL}`, paintOrder: 'stroke fill'}}>{(scene.big as string) ?? '< 20'}</span>
        <div style={{fontFamily: DISPLAY, fontSize: 66, color: '#fff', WebkitTextStroke: `6px ${OL}`, paintOrder: 'stroke fill'}}>{(scene.label as string) ?? 'PAINTINGS, EVER'}</div>
      </div>
      {new Array(16).fill(0).map((_, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const done = [1, 6, 11].includes(i);
        const fill = interpolate(frame, [6 + i * 1.5, 14 + i * 1.5], [0, 1], clamp);
        const hue = Math.round(random(`h${i}`) * 360);
        return (
          <div key={i} style={{position: 'absolute', left: 120 + col * 210, top: 640 + row * 175, width: 170, height: 140, border: `9px solid #a16207`, outline: `4px solid ${OL}`, background: '#f5ecd7', opacity: fill, overflow: 'hidden'}}>
            {done
              ? <div style={{width: '100%', height: '100%', background: `linear-gradient(${hue}deg, hsl(${hue},45%,45%), hsl(${(hue + 60) % 360},40%,30%))`}} />
              : <svg width={170} height={140}><path d={`M20 ${100 - (i % 3) * 10} q40 -50 70 -10 t60 -20`} stroke="#9ca3af" strokeWidth={4} fill="none" /></svg>}
            {!done && frame >= subAt ? <div style={{position: 'absolute', left: -10, top: 50, rotate: '-14deg', width: 200, textAlign: 'center', fontFamily: DISPLAY, fontSize: 26, color: '#fff', background: '#ef4444'}}>UNFINISHED</div> : null}
          </div>
        );
      })}
      <Syn x={150} y={560} size={260} pose="shock" from={8} to={dur} />
    </Camera>
  );
};

/* carryPortrait: { from: 1503, to: 1519, stops: [...], tag, tagOnWord } — a cartoon map; the man walks the route carrying a covered canvas;
   a year counter runs. The painting itself is never shown (always covered / seen from the back). */
const CarryPortrait: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(frame, [4, dur * 0.85], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const y0 = (scene.from as number) ?? 1503, y1 = (scene.to as number) ?? 1519;
  const year = Math.round(y0 + (y1 - y0) * p);
  const stops = (scene.stops as {name: string; x: number; y: number}[]) ?? [];
  const seg = p * (stops.length - 1);
  const k = Math.min(stops.length - 2, Math.floor(seg));
  const f = seg - k;
  const hx = stops.length > 1 ? stops[k].x + (stops[k + 1].x - stops[k].x) * f : 540;
  const hy = stops.length > 1 ? stops[k].y + (stops[k + 1].y - stops[k].y) * f : 900;
  return (
    <Camera dur={dur} from={1.0} to={1.05}>
      <AbsoluteFill style={{background: '#93c5fd'}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M120 420 Q380 300 620 380 Q900 360 1000 520 Q980 760 820 900 Q700 1080 760 1300 Q640 1360 560 1200 Q470 1000 380 900 Q220 760 120 620 Z" fill="#fde68a" stroke={OL} strokeWidth={8} />
        <path d={`M${stops.map((s) => `${s.x} ${s.y}`).join(' L')}`} stroke="#b45309" strokeWidth={8} strokeDasharray="20 16" fill="none" />
      </svg>
      {stops.map((s, i) => (
        <div key={i} style={{position: 'absolute', left: s.x - 120, top: s.y - 70, width: 240, textAlign: 'center', fontFamily: DISPLAY, fontSize: 44, color: OL, opacity: seg >= i - 0.2 ? 1 : 0.35}}>
          <div style={{width: 26, height: 26, borderRadius: 13, background: '#ef4444', border: `5px solid ${OL}`, margin: '0 auto 6px'}} />{s.name}
        </div>
      ))}
      {/* walker + covered canvas */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, translate: `${hx - 540}px ${hy - 1000}px`}}>
        <Boy x={540} y={1000} height={300} stage="adult" pose="run" phase={frame / 2.5} skin={sb.character.palette.skin} rim="#fde68a" glow={0.3} mood="determined" hair="long" />
        <div style={{position: 'absolute', left: 560, top: 760, width: 130, height: 160, background: '#c4a484', border: `7px solid ${OL}`, rotate: '8deg', borderRadius: 6}}>
          <div style={{position: 'absolute', inset: 10, border: '4px solid #8b6b4a'}} />
          <div style={{position: 'absolute', left: 52, top: 10, width: 6, height: 128, background: '#8b6b4a'}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 300, top: 1190, width: 480, height: 150, background: '#0b0b0f', border: `8px solid ${OL}`, borderRadius: 18, textAlign: 'center', fontFamily: DISPLAY, fontSize: 120, color: '#fde68a', lineHeight: '140px'}}>{year}</div>
      <Tag text={(scene.tag as string) ?? 'NEVER HANDED OVER'} at={at(captions, scene.tagOnWord, fps, 8)} y={170} size={70} color="#ef4444" fg="#fff" rot={-2} />
    </Camera>
  );
};

/* mirrorLoop: { top? } — LAST LINE: a hand mirror slides over the page and the writing flips readable. Syn points; daily pill. */
const MirrorLoop: React.FC<SceneProps> = ({scene, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const r = interpolate(frame, [dur * 0.25, dur * 0.6], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const mx = interpolate(frame, [0, dur * 0.3], [1200, 560], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <Shake at={Math.round(dur * 0.6)} amount={8}>
      <Camera dur={dur} from={1.0} to={1.12}>
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #5b3a1a 0%, #1a0f06 80%)'}} />
        <div style={{position: 'absolute', left: 110, top: 360, rotate: '-2deg'}}><Page writeT={1} reveal={r} /></div>
        <svg width={420} height={620} viewBox="0 0 420 620" style={{position: 'absolute', left: mx, top: 520, rotate: '12deg'}}>
          <rect x={170} y={380} width={70} height={230} rx={20} fill="#92400e" stroke={OL} strokeWidth={8} />
          <ellipse cx={205} cy={200} rx={190} ry={200} fill="#cbd5e1" stroke="#a16207" strokeWidth={22} />
          <ellipse cx={205} cy={200} rx={170} ry={180} fill="url(#mg)" />
          <defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f8fafc" /><stop offset=".5" stopColor="#cbd5e1" /><stop offset="1" stopColor="#94a3b8" /></linearGradient></defs>
          <path d="M90 120 L160 60 M110 170 L210 80" stroke="#fff" strokeWidth={12} opacity={0.7} strokeLinecap="round" />
        </svg>
        <Tag text={(scene.top as string) ?? 'YOU STILL NEED A MIRROR'} at={4} y={190} size={72} color="#ffcc4d" rot={-2} />
        <Syn x={190} y={1150} size={300} pose="point" from={6} to={dur} />
        <DailyPill from={Math.round(dur * 0.35)} y={1250} />
      </Camera>
    </Shake>
  );
};

export const LEONARDO_SCENES: Record<string, React.FC<SceneProps>> = {
  mirrorNotes: MirrorNotes,
  villageBoy: VillageBoy,
  blueprints: Blueprints,
  unfinishedWall: UnfinishedWall,
  carryPortrait: CarryPortrait,
  mirrorLoop: MirrorLoop,
};
