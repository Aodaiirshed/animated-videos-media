import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Camera, Shake} from '../components/Fx';
import {DailyPill, SeriesBadge, Syn} from '../components/Host';
import {HorizonFlashes, wordFrame} from './kit';
import {DISPLAY} from '../fonts';

/* Guess Who: History #6 — Wojtek the soldier bear (two parts). All art original flat cartoon; no real photos, insignia or logos.
   Part 1: paybook, campShadows, orphanCub, bearReveal, cassinoTeaser (+ shared pausePick).
   Part 2: cassinoHook, bearCarry, promotion, zooVisit, statueEnd. */
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

const Stamp: React.FC<{text: string; at: number; x: number; y: number; color?: string; size?: number; rot?: number}> = ({text, at: a, x, y, color = '#d7263d', size = 70, rot = -12}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - a, fps, config: {damping: 9, stiffness: 260}});
  if (frame < a) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, rotate: `${rot}deg`, scale: String(2.2 - s * 1.2), fontFamily: DISPLAY, fontSize: size, color, border: `9px solid ${color}`, borderRadius: 18, padding: '2px 26px', background: 'rgba(255,255,255,0.08)', letterSpacing: 2, whiteSpace: 'nowrap'}}>{text}</div>
  );
};

/* Original cartoon brown bear. pose: sit | stand | carry. cap = soldier field cap (plain, no insignia). */
export const Bear: React.FC<{x: number; y: number; size?: number; pose?: 'sit' | 'stand' | 'carry'; cap?: boolean; bronze?: boolean; walk?: number}> = ({x, y, size = 520, pose = 'sit', cap, bronze, walk = 0}) => {
  const frame = useCurrentFrame();
  const fur = bronze ? '#8a6a3a' : '#8b5a2b';
  const furD = bronze ? '#6b4f26' : '#6a4120';
  const muz = bronze ? '#a9874f' : '#e2c49a';
  const breathe = Math.sin(frame / 9) * 3;
  const step = Math.sin(walk) * 10;
  const stand = pose !== 'sit';
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 400 500" style={{position: 'absolute', left: x - size / 2, top: y - size * 0.62, overflow: 'visible'}}>
      {/* legs */}
      {stand ? (
        <>
          <rect x={130} y={390 + step} width={56} height={95} rx={26} fill={furD} stroke={OL} strokeWidth={8} />
          <rect x={214} y={390 - step} width={56} height={95} rx={26} fill={furD} stroke={OL} strokeWidth={8} />
        </>
      ) : (
        <>
          <ellipse cx={130} cy={455} rx={58} ry={34} fill={furD} stroke={OL} strokeWidth={8} />
          <ellipse cx={270} cy={455} rx={58} ry={34} fill={furD} stroke={OL} strokeWidth={8} />
        </>
      )}
      {/* body */}
      <ellipse cx={200} cy={stand ? 320 : 360} rx={stand ? 112 : 135} ry={stand ? 120 : 110 + breathe} fill={fur} stroke={OL} strokeWidth={9} />
      <ellipse cx={200} cy={stand ? 335 : 375} rx={62} ry={70} fill={muz} opacity={0.55} />
      {/* arms */}
      {pose === 'carry' ? (
        <>
          <path d="M110 270 q-30 -70 0 -105" stroke={OL} strokeWidth={46} strokeLinecap="round" fill="none" />
          <path d="M110 270 q-30 -70 0 -105" stroke={fur} strokeWidth={30} strokeLinecap="round" fill="none" />
          <path d="M290 270 q30 -70 0 -105" stroke={OL} strokeWidth={46} strokeLinecap="round" fill="none" />
          <path d="M290 270 q30 -70 0 -105" stroke={fur} strokeWidth={30} strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <path d={`M105 ${stand ? 270 : 320} q-35 40 -10 85`} stroke={OL} strokeWidth={46} strokeLinecap="round" fill="none" />
          <path d={`M105 ${stand ? 270 : 320} q-35 40 -10 85`} stroke={fur} strokeWidth={30} strokeLinecap="round" fill="none" />
          <path d={`M295 ${stand ? 270 : 320} q35 40 10 85`} stroke={OL} strokeWidth={46} strokeLinecap="round" fill="none" />
          <path d={`M295 ${stand ? 270 : 320} q35 40 10 85`} stroke={fur} strokeWidth={30} strokeLinecap="round" fill="none" />
        </>
      )}
      {/* head */}
      <g transform={`translate(0 ${stand ? -10 : 30})`}>
        <circle cx={125} cy={95} r={38} fill={fur} stroke={OL} strokeWidth={8} />
        <circle cx={275} cy={95} r={38} fill={fur} stroke={OL} strokeWidth={8} />
        <circle cx={125} cy={95} r={18} fill={muz} />
        <circle cx={275} cy={95} r={18} fill={muz} />
        <circle cx={200} cy={170} r={100} fill={fur} stroke={OL} strokeWidth={9} />
        <ellipse cx={200} cy={205} rx={52} ry={40} fill={muz} stroke={OL} strokeWidth={6} />
        <ellipse cx={200} cy={186} rx={20} ry={14} fill={OL} />
        <path d="M200 200 v14 M184 222 q16 12 32 0" stroke={OL} strokeWidth={6} fill="none" strokeLinecap="round" />
        <circle cx={160} cy={150} r={11} fill={OL} />
        <circle cx={240} cy={150} r={11} fill={OL} />
        <circle cx={164} cy={146} r={4} fill="#fff" />
        <circle cx={244} cy={146} r={4} fill="#fff" />
        {cap ? (
          <g>
            <path d="M130 105 q70 -60 140 0 l-10 12 h-120 z" fill={bronze ? '#7a6a3a' : '#5b6b3a'} stroke={OL} strokeWidth={7} />
            <rect x={128} y={108} width={144} height={16} rx={6} fill={bronze ? '#6b5a30' : '#46552c'} stroke={OL} strokeWidth={6} />
          </g>
        ) : null}
      </g>
    </svg>
  );
};

/* simple flat soldier silhouette (no insignia) */
const Soldier: React.FC<{x: number; y: number; h?: number; color?: string; lift?: number; flip?: boolean}> = ({x, y, h = 360, color = '#26301c', lift = 0, flip}) => (
  <svg width={h * 0.55} height={h} viewBox="0 0 110 200" style={{position: 'absolute', left: x - h * 0.275, top: y - h, transform: flip ? 'scaleX(-1)' : undefined}}>
    <circle cx={55} cy={28} r={18} fill={color} />
    <path d="M33 22 q22 -22 44 0 z" fill={color} />
    <rect x={35} y={48} width={40} height={80} rx={14} fill={color} />
    <rect x={38} y={124} width={14} height={70} rx={6} fill={color} />
    <rect x={58} y={124} width={14} height={70} rx={6} fill={color} />
    <path d={`M40 60 q-22 ${30 - lift} -12 ${60 - lift * 2}`} stroke={color} strokeWidth={13} strokeLinecap="round" fill="none" />
    <path d={`M70 60 q22 ${30 - lift} 12 ${60 - lift * 2}`} stroke={color} strokeWidth={13} strokeLinecap="round" fill="none" />
  </svg>
);

const Crate: React.FC<{x: number; y: number; w?: number; label?: string; rot?: number}> = ({x, y, w = 200, label = 'SHELLS', rot = 0}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w * 0.55, width: w, height: w * 0.62, background: '#9a6b3a', border: `8px solid ${OL}`, borderRadius: 10, rotate: `${rot}deg`, boxShadow: `0 8px 0 ${OL}`}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 8, background: OL, opacity: 0.4}} />
    <div style={{position: 'absolute', width: '100%', top: w * 0.13, textAlign: 'center', fontFamily: DISPLAY, fontSize: w * 0.18, color: '#1b1b22'}}>{label}</div>
  </div>
);

const Night: React.FC<{c1?: string; c2?: string}> = ({c1 = '#0e1730', c2 = '#2b2140'}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${c1}, ${c2})`}}>
      {new Array(40).fill(0).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: random(`sx${i}`) * 1080, top: random(`sy${i}`) * 900, width: 5, height: 5, borderRadius: 3, background: '#fff', opacity: 0.3 + 0.5 * Math.abs(Math.sin(frame / 14 + i))}} />
      ))}
    </AbsoluteFill>
  );
};

/* ---------------- PART 1 ---------------- */

/* paybook: { top?, tag?, stampOnWord?, badge? } — HOOK. Army paybook with a hidden photo, stamped PRIVATE No. 253. */
const Paybook: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sAt = at(captions, scene.stampOnWord, fps, dur * 0.7);
  const shipAt = at(captions, scene.shipOnWord, fps, dur * 0.2);
  return (
    <AbsoluteFill>
      <Camera dur={dur} from={1.1} to={1.0}>
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #4a5a33 0%, #161b0e 85%)'}} />
        <Shake at={sAt} amount={16}>
          <div style={{position: 'absolute', left: 150, top: 420, width: 780, height: 820, background: 'linear-gradient(160deg,#c9c08a,#a89e66)', border: `10px solid ${OL}`, borderRadius: 20, boxShadow: `0 16px 0 ${OL}`, rotate: '-3deg'}}>
            <div style={{position: 'absolute', top: 30, width: '100%', textAlign: 'center', fontFamily: DISPLAY, fontSize: 58, color: '#2b2a14'}}>SOLDIER'S PAYBOOK</div>
            {/* hidden photo: a big dark '?' shape */}
            <div style={{position: 'absolute', left: 230, top: 130, width: 320, height: 380, background: '#2a2a1a', border: `8px solid ${OL}`, borderRadius: 12, overflow: 'hidden'}}>
              <div style={{position: 'absolute', left: 60, top: 70, width: 200, height: 260, borderRadius: '50% 50% 30% 30%', background: '#0c0c08', filter: 'blur(6px)'}} />
              <div style={{position: 'absolute', width: '100%', top: 70, textAlign: 'center', fontFamily: DISPLAY, fontSize: 220, color: '#ffcc4d', opacity: 0.9}}>?</div>
            </div>
            {['NAME: ??????', 'RANK: ________', 'NUMBER: ___'].map((l, i) => (
              <div key={i} style={{position: 'absolute', left: 80, top: 560 + i * 70, fontFamily: DISPLAY, fontSize: 48, color: '#2b2a14'}}>{l}</div>
            ))}
          </div>
          <Stamp text="PRIVATE · No. 253" at={sAt} x={250} y={1050} size={76} />
        </Shake>
        <Tag text={(scene.top as string) ?? '1943. BANNED FROM THE SHIP'} at={-12} y={300} size={70} color="#ffcc4d" rot={-2} />
        <Tag text="🚢 ✖" at={shipAt} x={900} y={430} size={56} color="#fff" rot={6} />
      </Camera>
      <SeriesBadge text={(scene.badge as string) ?? 'GUESS WHO: HISTORY #6 · PART 1'} />
      <Syn x={170} y={1190} size={260} pose="think" from={6} to={44} />
    </AbsoluteFill>
  );
};

/* campShadows: { tag?, coffeeOnWord?, beerOnWord?, wrestleOnWord? } — a tent at night; a huge blurry shadow wrestles a soldier's shadow. */
const CampShadows: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const wAt = at(captions, scene.wrestleOnWord, fps, 4);
  const cAt = at(captions, scene.coffeeOnWord, fps, dur * 0.45);
  const bAt = at(captions, scene.beerOnWord, fps, dur * 0.8);
  const sway = Math.sin((frame - wAt) / 5) * 12 * (frame > wAt ? 1 : 0);
  return (
    <AbsoluteFill>
      <Camera dur={dur} from={1.0} to={1.08}>
        <Night />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1150, height: 800, background: '#1d2414'}} />
        {/* tent */}
        <svg width={1080} height={1000} style={{position: 'absolute', left: 0, top: 330}}>
          <path d="M90 820 L540 120 L990 820 Z" fill="#e9c98a" stroke={OL} strokeWidth={12} />
          <path d="M540 120 L540 820" stroke={OL} strokeWidth={6} opacity={0.5} />
        </svg>
        {/* shadows behind the canvas */}
        <div style={{position: 'absolute', left: 230 + sway, top: 560, width: 380, height: 520, borderRadius: '45% 45% 30% 30%', background: 'rgba(40,25,10,0.75)', filter: 'blur(14px)', rotate: `${sway * 0.4}deg`}} />
        <div style={{position: 'absolute', left: 560 - sway, top: 680, width: 150, height: 400, borderRadius: '40% 40% 20% 20%', background: 'rgba(40,25,10,0.7)', filter: 'blur(10px)', rotate: `${-sway * 0.5}deg`}} />
        <div style={{position: 'absolute', left: 520, top: 600, width: 120, height: 120, borderRadius: 60, background: 'rgba(40,25,10,0.7)', filter: 'blur(10px)'}} />
        {/* lantern glow */}
        <div style={{position: 'absolute', left: 430, top: 420, width: 220, height: 220, borderRadius: 110, background: 'radial-gradient(circle, rgba(255,210,120,0.55), rgba(255,210,120,0))'}} />
        <Tag text="☕ COFFEE" at={cAt} x={260} y={1220} size={58} color="#fff" rot={-6} />
        <Tag text="🍺 BEER" at={bAt} x={800} y={1220} size={58} color="#ffcc4d" rot={5} />
        <Tag text={(scene.tag as string) ?? 'EVERY MORNING: WRESTLING'} at={wAt} y={300} size={60} color="#fff" rot={-2} />
      </Camera>
      <SeriesBadge text={(scene.badge as string) ?? 'GUESS WHO: HISTORY #6 · PART 1'} />
    </AbsoluteFill>
  );
};

/* orphanCub: { tag?, bottleOnWord? } — Iranian mountains at dusk; a soldier holds a tiny wrapped bundle and a bottle labelled MILK. */
const OrphanCub: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bAt = at(captions, scene.bottleOnWord, fps, dur * 0.6);
  const bs = spring({frame: frame - bAt, fps, config: {damping: 12}});
  return (
    <AbsoluteFill>
      <Camera dur={dur} from={1.12} to={1.0}>
        <AbsoluteFill style={{background: 'linear-gradient(180deg,#f2a65a 0%, #c76b4a 45%, #5a3550 100%)'}} />
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <path d="M0 900 L220 560 L380 760 L560 470 L760 780 L900 620 L1080 820 L1080 1920 L0 1920 Z" fill="#6b3b4a" />
          <path d="M0 1050 L180 820 L420 1000 L640 760 L880 990 L1080 860 L1080 1920 L0 1920 Z" fill="#3e2436" />
        </svg>
        <Soldier x={540} y={1300} h={760} color="#22281a" lift={22} />
        {/* bundle */}
        <div style={{position: 'absolute', left: 445, top: 760, width: 190, height: 140, borderRadius: 70, background: '#d9c9a0', border: `8px solid ${OL}`}}>
          <div style={{position: 'absolute', left: 60, top: 20, width: 70, height: 60, borderRadius: 35, background: '#6a4120', border: `6px solid ${OL}`}} />
        </div>
        {/* bottle */}
        <div style={{position: 'absolute', left: 650, top: 700, width: 80, height: 220, opacity: frame >= bAt ? 1 : 0, scale: String(0.5 + bs * 0.5), rotate: '-30deg'}}>
          <div style={{position: 'absolute', left: 24, top: 0, width: 32, height: 50, background: '#cfe8ef', border: `6px solid ${OL}`, borderRadius: 6}} />
          <div style={{position: 'absolute', left: 0, top: 44, width: 80, height: 170, background: '#cfe8ef', border: `7px solid ${OL}`, borderRadius: 16}}>
            <div style={{position: 'absolute', left: 4, right: 4, bottom: 4, height: 90, background: '#fffaf0', borderRadius: 10}} />
            <div style={{position: 'absolute', width: '100%', top: 70, textAlign: 'center', fontFamily: DISPLAY, fontSize: 26, color: OL}}>MILK</div>
          </div>
        </div>
        <Tag text={(scene.top as string) ?? 'IRAN, 1942'} at={-12} y={300} size={70} color="#ffcc4d" rot={-2} />
        <Tag text={(scene.tag as string) ?? 'AN ORPHAN'} at={at(captions, scene.tagOnWord, fps, dur * 0.3)} y={1150} size={60} color="#fff" rot={3} />
      </Camera>
      <SeriesBadge text={(scene.badge as string) ?? 'GUESS WHO: HISTORY #6 · PART 1'} />
    </AbsoluteFill>
  );
};

/* bearReveal: { revealOnWord?, nameOnWord? } — the bear pops up in a field cap; stamp PRIVATE WOJTEK. */
const BearReveal: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rAt = at(captions, scene.revealOnWord, fps, dur * 0.35);
  const nAt = at(captions, scene.nameOnWord, fps, dur * 0.7);
  const s = spring({frame: frame - rAt, fps, config: {damping: 9, stiffness: 160}});
  return (
    <AbsoluteFill>
      <Camera dur={dur} from={1.0} to={1.06}>
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #ffd27a 0%, #c9772f 60%, #4a2410 100%)'}} />
        <svg width={1080} height={1920} style={{position: 'absolute', opacity: frame >= rAt ? 0.25 : 0}}>
          {new Array(16).fill(0).map((_, i) => {
            const a = (i / 16) * Math.PI * 2 + frame / 60;
            return <path key={i} d={`M540 820 L${540 + Math.cos(a) * 1600} ${820 + Math.sin(a) * 1600} L${540 + Math.cos(a + 0.15) * 1600} ${820 + Math.sin(a + 0.15) * 1600} Z`} fill="#fff" />;
          })}
        </svg>
        <Shake at={rAt} amount={20}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, opacity: frame >= rAt ? 1 : 0, translate: `0 ${(1 - s) * 900}px`}}>
            <Bear x={540} y={820} size={640} pose="sit" cap />
          </div>
        </Shake>
        {frame < rAt ? <div style={{position: 'absolute', width: '100%', top: 700, textAlign: 'center', fontFamily: DISPLAY, fontSize: 300, color: '#fff', WebkitTextStroke: `12px ${OL}`, paintOrder: 'stroke fill'}}>?</div> : null}
        <Tag text="A BROWN BEAR" at={rAt} y={300} size={86} color="#ffcc4d" rot={-3} />
        <Stamp text="PRIVATE WOJTEK" at={nAt} x={180} y={1190} size={84} rot={-6} color="#b0122b" />
      </Camera>
      <SeriesBadge text={(scene.badge as string) ?? 'GUESS WHO: HISTORY #6 · PART 1'} />
      <Syn x={920} y={1180} size={230} pose="shock" from={rAt + 4} to={dur} />
    </AbsoluteFill>
  );
};

/* cassinoTeaser: { cardOnWord? } — a mountain monastery under gunfire; card "PART 2 ON MY PAGE". Loops back into the paybook. */
const CassinoTeaser: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cAt = at(captions, scene.cardOnWord, fps, dur * 0.6);
  const cs = spring({frame: frame - cAt, fps, config: {damping: 11}});
  return (
    <AbsoluteFill>
      <Camera dur={dur} from={1.0} to={1.1}>
        <Night c1="#1a1420" c2="#5a2b22" />
        <HorizonFlashes y={1000} times={[6, 22, 40, 61, 80]} />
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <path d="M0 1200 L300 780 L460 560 L620 560 L780 800 L1080 1150 L1080 1920 L0 1920 Z" fill="#14101a" />
          <rect x={430} y={470} width={220} height={100} fill="#14101a" />
          <rect x={500} y={420} width={80} height={60} fill="#14101a" />
        </svg>
        <Tag text="1944" at={-12} y={300} size={80} color="#fff" rot={-2} />
        <div style={{position: 'absolute', left: 90, top: 900, width: 900, textAlign: 'center', opacity: frame >= cAt ? 1 : 0, scale: String(1.5 - cs * 0.5)}}>
          <span style={{fontFamily: DISPLAY, fontSize: 92, color: '#111', background: '#ffcc4d', padding: '8px 34px', borderRadius: 22, border: `9px solid ${OL}`, boxShadow: `0 12px 0 ${OL}`}}>PART 2 ON MY PAGE 👀</span>
        </div>
      </Camera>
      <SeriesBadge text={(scene.badge as string) ?? 'GUESS WHO: HISTORY #6 · PART 1'} />
      <Syn x={170} y={1180} size={250} pose="point" from={cAt} to={dur} />
      <DailyPill from={cAt + 6} y={1250} />
    </AbsoluteFill>
  );
};

/* ---------------- PART 2 ---------------- */

/* cassinoHook: { top?, tag?, bearOnWord? } — HOOK. Monastery on the mountain, smoke and flashes; a bear silhouette walks into the line. */
const CassinoHook: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bAt = at(captions, scene.bearOnWord, fps, dur * 0.6);
  const bx = interpolate(frame, [bAt - 10, dur], [-150, 520], clamp);
  return (
    <AbsoluteFill>
      <Camera dur={dur} from={1.1} to={1.0}>
        <Night c1="#2a1a1a" c2="#7a3a22" />
        <HorizonFlashes y={900} times={[2, 14, 27, 39, 52, 66]} />
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <path d="M0 1050 L300 700 L460 520 L620 520 L800 760 L1080 1000 L1080 1920 L0 1920 Z" fill="#1a1216" />
          <rect x={430} y={430} width={220} height={100} fill="#1a1216" />
          <rect x={500} y={380} width={80} height={60} fill="#1a1216" />
          <path d="M0 1300 h1080 v620 h-1080 z" fill="#2b2014" />
        </svg>
        {new Array(6).fill(0).map((_, i) => (
          <div key={i} style={{position: 'absolute', left: 120 + i * 160, top: 820 - ((frame * 1.2 + i * 40) % 300), width: 160, height: 160, borderRadius: 80, background: 'rgba(120,110,100,0.35)', filter: 'blur(18px)'}} />
        ))}
        <Soldier x={760} y={1300} h={330} color="#120e0a" lift={30} />
        <Soldier x={900} y={1300} h={330} color="#120e0a" lift={30} flip />
        <div style={{position: 'absolute', left: bx - 540, top: 0, width: 1080, height: 1920, filter: 'brightness(0.15)'}}>
          <Bear x={540} y={1150} size={330} pose="stand" walk={frame / 3} />
        </div>
        <Tag text={(scene.top as string) ?? '1944. MONTE CASSINO'} at={-12} y={300} size={70} color="#ffcc4d" rot={-2} />
        <Tag text={(scene.tag as string) ?? 'SHELLS RUNNING OUT'} at={at(captions, scene.tagOnWord, fps, dur * 0.3)} y={1180} size={58} color="#fff" rot={3} />
      </Camera>
      <SeriesBadge text={(scene.badge as string) ?? 'GUESS WHO: HISTORY #6 · PART 2'} />
    </AbsoluteFill>
  );
};

/* bearCarry: { tag?, kgOnWord?, neverOnWord? } — the bear walks upright with a crate of shells; 45 KG tag; "NEVER DROPPED ONE". */
const BearCarry: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const kAt = at(captions, scene.kgOnWord, fps, dur * 0.5);
  const nAt = at(captions, scene.neverOnWord, fps, dur * 0.8);
  const x = interpolate(frame, [0, dur], [260, 760], clamp);
  return (
    <AbsoluteFill>
      <Camera dur={dur} from={1.0} to={1.06}>
        <AbsoluteFill style={{background: 'linear-gradient(180deg,#c9a46a 0%, #8a6a44 55%, #4a3a26 100%)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1150, height: 800, background: '#5a4630'}} />
        {[0, 1, 2].map((i) => <Crate key={i} x={140 + i * 70} y={1170 - i * 0} w={150} />)}
        <Crate x={900} y={1170} w={150} />
        <Crate x={950} y={1080} w={150} />
        <Soldier x={120} y={1180} h={340} color="#3a3420" lift={30} />
        <Bear x={x} y={980} size={540} pose="carry" cap walk={frame / 3.2} />
        <Crate x={x} y={700 + Math.abs(Math.sin(frame / 3.2)) * -8} w={230} rot={Math.sin(frame / 6) * 3} />
        <Tag text="45 KG" at={kAt} x={820} y={420} size={88} color="#ffcc4d" rot={6} />
        <Tag text={(scene.tag as string) ?? 'HE NEVER DROPPED ONE'} at={nAt} y={300} size={64} color="#fff" rot={-2} />
      </Camera>
      <SeriesBadge text={(scene.badge as string) ?? 'GUESS WHO: HISTORY #6 · PART 2'} />
      <Syn x={180} y={1180} size={220} pose="shock" from={nAt} to={dur} />
    </AbsoluteFill>
  );
};

/* promotion: { corpOnWord?, badgeOnWord? } — PRIVATE crossed out → CORPORAL; then an original round emblem: a bear carrying a shell. */
const Promotion: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cAt = at(captions, scene.corpOnWord, fps, dur * 0.35);
  const bAt = at(captions, scene.badgeOnWord, fps, dur * 0.75);
  const bs = spring({frame: frame - bAt, fps, config: {damping: 10}});
  const strike = interpolate(frame, [cAt - 8, cAt], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Camera dur={dur} from={1.06} to={1.0}>
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #56653a 0%, #1c2210 85%)'}} />
        <div style={{position: 'absolute', width: '100%', top: 380, textAlign: 'center', opacity: frame < bAt ? 1 : 0.25}}>
          <span style={{position: 'relative', fontFamily: DISPLAY, fontSize: 120, color: '#fff', WebkitTextStroke: `8px ${OL}`, paintOrder: 'stroke fill'}}>
            PRIVATE
            <span style={{position: 'absolute', left: 0, top: '48%', height: 18, width: `${strike * 100}%`, background: '#d7263d', borderRadius: 9}} />
          </span>
        </div>
        <Stamp text="CORPORAL" at={cAt} x={250} y={560} size={120} rot={-5} color="#ffcc4d" />
        {/* original emblem */}
        <div style={{position: 'absolute', left: 310, top: 730, width: 460, height: 460, borderRadius: 230, background: '#1f2a3a', border: `14px solid #ffcc4d`, boxShadow: `0 0 0 10px ${OL}`, opacity: frame >= bAt ? 1 : 0, scale: String(0.4 + bs * 0.6), overflow: 'hidden'}}>
          <Bear x={230} y={300} size={300} pose="carry" bronze />
          <div style={{position: 'absolute', left: 204, top: 40, width: 52, height: 110, background: '#d9b25a', border: `6px solid ${OL}`, borderRadius: '26px 26px 6px 6px'}} />
        </div>
        <Tag text="THE COMPANY BADGE" at={bAt} y={1225} size={56} color="#fff" rot={2} />
      </Camera>
      <SeriesBadge text={(scene.badge as string) ?? 'GUESS WHO: HISTORY #6 · PART 2'} />
    </AbsoluteFill>
  );
};

/* zooVisit: { tag?, visitOnWord? } — a Scottish zoo enclosure; old soldiers visit and toss a cigarette pack over the fence. */
const ZooVisit: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const vAt = at(captions, scene.visitOnWord, fps, dur * 0.5);
  const tt = interpolate(frame, [vAt, vAt + 20], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Camera dur={dur} from={1.0} to={1.08}>
        <AbsoluteFill style={{background: 'linear-gradient(180deg,#9fc3d6 0%, #d6e4e8 50%, #7a9a5a 51%, #4c6a34 100%)'}} />
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <path d="M0 980 q200 -140 400 -40 q220 -160 420 -20 q140 -60 260 10 V1000 H0 Z" fill="#5f7f4a" />
        </svg>
        <Bear x={330} y={1020} size={470} pose="sit" />
        {/* fence */}
        {new Array(12).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: 30 + i * 90, top: 900, width: 16, height: 360, background: '#3a3a3a', borderRadius: 8}} />)}
        <div style={{position: 'absolute', left: 0, right: 0, top: 940, height: 14, background: '#3a3a3a'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1150, height: 14, background: '#3a3a3a'}} />
        <Soldier x={820} y={1330} h={420} color="#2a2e3a" lift={10} />
        <Soldier x={960} y={1330} h={400} color="#3a2e2a" lift={0} flip />
        {/* tossed pack */}
        <div style={{position: 'absolute', left: interpolate(tt, [0, 1], [760, 430]), top: 820 - Math.sin(tt * Math.PI) * 300, width: 60, height: 80, background: '#fff', border: `6px solid ${OL}`, borderRadius: 6, rotate: `${tt * 540}deg`, opacity: frame >= vAt && tt < 1 ? 1 : 0}} />
        <Tag text={(scene.top as string) ?? 'SCOTLAND, AFTER THE WAR'} at={-12} y={300} size={62} color="#ffcc4d" rot={-2} />
        <Tag text={(scene.tag as string) ?? 'OLD FRIENDS VISITED'} at={vAt} y={1200} size={56} color="#fff" rot={3} />
      </Camera>
      <SeriesBadge text={(scene.badge as string) ?? 'GUESS WHO: HISTORY #6 · PART 2'} />
    </AbsoluteFill>
  );
};

/* statueEnd: { plaqueOnWord? } — a bronze statue of a soldier walking beside his bear; plaque 1942–1963. Loops back to the hook. */
const StatueEnd: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pAt = at(captions, scene.plaqueOnWord, fps, dur * 0.4);
  return (
    <AbsoluteFill>
      <Camera dur={dur} from={1.08} to={1.0}>
        <AbsoluteFill style={{background: 'linear-gradient(180deg,#6d7f92 0%, #b9c4cc 60%, #8a8f86 100%)'}} />
        <div style={{position: 'absolute', left: 190, top: 1080, width: 700, height: 200, background: '#7d7a72', border: `10px solid ${OL}`, borderRadius: 12}} />
        <Soldier x={700} y={1090} h={560} color="#6b5428" lift={5} />
        <Bear x={420} y={900} size={420} pose="stand" bronze />
        <div style={{position: 'absolute', left: 140, top: 1120, width: 800, textAlign: 'center', whiteSpace: 'nowrap', opacity: frame >= pAt ? 1 : 0}}>
          <span style={{fontFamily: DISPLAY, fontSize: 58, color: '#f2e2b0', background: '#4a3a1c', padding: '4px 22px', borderRadius: 10, border: `6px solid ${OL}`}}>WOJTEK · 1942–1963</span>
        </div>
        <Tag text={(scene.top as string) ?? 'A SOLDIER… AND HIS BEAR'} at={at(captions, scene.tagOnWord, fps, dur * 0.6)} y={300} size={64} color="#ffcc4d" rot={-2} />
      </Camera>
      <SeriesBadge text={(scene.badge as string) ?? 'GUESS WHO: HISTORY #6 · PART 2'} />
      <Syn x={900} y={1190} size={230} pose="wave" from={pAt} to={dur} />
      <DailyPill from={pAt + 10} y={1300} />
    </AbsoluteFill>
  );
};

export const WOJTEK_SCENES: Record<string, React.FC<SceneProps>> = {
  paybook: Paybook,
  campShadows: CampShadows,
  orphanCub: OrphanCub,
  bearReveal: BearReveal,
  cassinoTeaser: CassinoTeaser,
  cassinoHook: CassinoHook,
  bearCarry: BearCarry,
  promotion: Promotion,
  zooVisit: ZooVisit,
  statueEnd: StatueEnd,
};
