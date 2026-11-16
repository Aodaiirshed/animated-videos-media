import React, {useContext} from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Boy, HeroStyle} from '../components/Boy';
import {Camera, Shake} from '../components/Fx';
import {SeriesBadge, DailyPill} from '../components/Host';
import {wordFrame} from './kit';
import {DISPLAY, BODY} from '../fonts';

/* Story set 15 (Guess the Player #13): priceHook, barefootStreet, busRoute, wasteHeadlines, winnerGoal. Original cartoon hero, no likeness, no club crests. */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OL = '#1b1b22';
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);

const Tag: React.FC<{text: string; at: number; y: number; color?: string; size?: number; rot?: number; fg?: string}> = ({text, at: a, y, color = '#ffcc4d', size = 64, rot = -3, fg = '#111'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - a, fps, config: {damping: 10, stiffness: 190}});
  return (
    <div style={{position: 'absolute', left: 40, width: 1000, top: y, textAlign: 'center', opacity: frame >= a ? 1 : 0, scale: String(1.6 - s * 0.6), rotate: `${rot}deg`}}>
      <span dir="auto" style={{unicodeBidi: 'plaintext', fontFamily: DISPLAY, fontSize: size, color: fg, background: color, padding: '4px 28px', borderRadius: 16, border: `6px solid ${OL}`, boxShadow: `0 9px 0 ${OL}`}}>{text}</span>
    </div>
  );
};

/* priceHook: { price, clock, tag, tagOnWord, clockOnWord, badge } — HOOK: a giant price tag swings over a teen; a stopwatch shows how little he'd played. */
const PriceHook: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cAt = at(captions, scene.clockOnWord, fps, dur * 0.55);
  const tAt = at(captions, scene.tagOnWord, fps, dur * 0.3);
  const swing = Math.sin(frame / 9) * 6;
  const cs = spring({frame: frame - cAt, fps, config: {damping: 9, stiffness: 200}});
  const hand = interpolate(frame, [cAt, cAt + 20], [0, 102], clamp);
  return (
    <Shake at={cAt} amount={12}>
      <AbsoluteFill>
        <Camera dur={dur} from={1.1} to={1.0}>
          <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 35%, #1d4ed8 0%, #0b1026 75%)'}} />
          {[...Array(14)].map((_, i) => (
            <div key={i} style={{position: 'absolute', left: (i * 173) % 1040, top: ((i * 311 + frame * (3 + (i % 3))) % 1500) + 250, fontFamily: DISPLAY, fontSize: 70, color: '#22c55e', opacity: 0.35, rotate: `${(i * 37) % 40 - 20}deg`}}>€</div>
          ))}
          <div style={{position: 'absolute', left: 140, top: 420, width: 800, height: 300, transformOrigin: '50% -120px', rotate: `${swing}deg`}}>
            <div style={{position: 'absolute', left: 395, top: -120, width: 10, height: 130, background: '#e5e7eb'}} />
            <div style={{position: 'absolute', inset: 0, background: '#fde047', border: `10px solid ${OL}`, borderRadius: 40, boxShadow: `0 14px 0 ${OL}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{position: 'absolute', left: 36, top: 36, width: 46, height: 46, borderRadius: 23, background: '#0b1026', border: `6px solid ${OL}`}} />
              <span style={{fontFamily: DISPLAY, fontSize: 132, color: OL}}>{(scene.price as string) ?? '€45,000,000'}</span>
            </div>
          </div>
          <Boy x={380} y={1560} height={560} stage="teen" pose="stand" phase={frame / 3} skin={sb.character.palette.skin} rim="#fde68a" glow={0.4} mood="happy" />
          <div style={{position: 'absolute', left: 600, top: 1030, width: 360, height: 360, opacity: frame >= cAt ? 1 : 0, scale: String(0.4 + cs * 0.6)}}>
            <svg viewBox="0 0 200 200" width={360} height={360}>
              <rect x={88} y={4} width={24} height={22} rx={4} fill="#e5e7eb" stroke={OL} strokeWidth={6} />
              <circle cx={100} cy={112} r={80} fill="#fff" stroke={OL} strokeWidth={10} />
              <path d={`M100 112 L100 40 A72 72 0 0 1 ${100 + 72 * Math.sin((hand * Math.PI) / 180)} ${112 - 72 * Math.cos((hand * Math.PI) / 180)} Z`} fill="#ef4444" opacity={0.85} />
              <line x1={100} y1={112} x2={100 + 62 * Math.sin((hand * Math.PI) / 180)} y2={112 - 62 * Math.cos((hand * Math.PI) / 180)} stroke={OL} strokeWidth={8} strokeLinecap="round" />
              <text x={100} y={170} textAnchor="middle" fontFamily={DISPLAY} fontSize={36} fill={OL}>{(scene.clock as string) ?? '17 MIN'}</text>
            </svg>
          </div>
          <Tag text={(scene.tag as string) ?? 'AGE 16'} at={tAt} y={860} size={86} color="#fff" rot={-4} />
        </Camera>
        <SeriesBadge text={(scene.badge as string) ?? 'GUESS THE PLAYER #13'} />
      </AbsoluteFill>
    </Shake>
  );
};

/* barefootStreet: { tag, tagOnWord } — a small kid juggles barefoot on a steep, crowded street of small painted houses; dusty sunset. */
const BarefootStreet: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tAt = at(captions, scene.tagOnWord, fps, dur * 0.4);
  const cols = ['#f97316', '#38bdf8', '#facc15', '#f472b6', '#4ade80', '#a78bfa', '#fb7185'];
  const ballY = 1170 - Math.abs(Math.sin(frame / 6)) * 220;
  const ctx = useContext(HeroStyle);
  return (
    <Camera dur={dur} from={1.0} to={1.08} panY={-20}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #fb923c 0%, #fcd34d 45%, #fde68a 60%)'}} />
      {[...Array(4)].map((_, row) => [...Array(6)].map((__, c) => {
        const x = c * 190 - 30 + row * 45;
        const y = 330 + row * 150 - c * 22;
        const k = row * 6 + c;
        return (
          <div key={k} style={{position: 'absolute', left: x, top: y, width: 170, height: 150, background: cols[k % cols.length], border: `6px solid ${OL}`, borderRadius: 6}}>
            <div style={{position: 'absolute', left: 30, top: 34, width: 40, height: 40, background: '#1e293b', border: `4px solid ${OL}`}} />
            <div style={{position: 'absolute', left: 100, top: 60, width: 40, height: 84, background: '#7c2d12', border: `4px solid ${OL}`}} />
          </div>
        );
      }))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1000, bottom: 0, background: '#a8a29e', borderTop: `10px solid ${OL}`}} />
      {[...Array(9)].map((_, i) => <div key={i} style={{position: 'absolute', left: (i * 131) % 1080, top: 1120 + ((i * 53) % 400), width: 60, height: 20, borderRadius: 10, background: '#78716c', opacity: 0.7}} />)}
      <HeroStyle.Provider value={{...ctx, toon: ctx.toon ? {...ctx.toon, boots: ctx.toon.skin, socks: ctx.toon.skin, shirt: '#e5e7eb', torn: true} : ctx.toon}}>
        <Boy x={540} y={1460} height={430} stage="child" pose="kick" phase={frame / 6} skin={sb.character.palette.skin} rim="#fde68a" glow={0.3} mood="happy" />
      </HeroStyle.Provider>
      <svg width={110} height={110} viewBox="0 0 100 100" style={{position: 'absolute', left: 640, top: ballY, rotate: `${frame * 9}deg`}}>
        <circle cx={50} cy={50} r={44} fill="#fff" stroke={OL} strokeWidth={8} />
        <path d="M50 26 L70 40 L62 64 L38 64 L30 40 Z" fill={OL} />
      </svg>
      <Tag text={(scene.tag as string) ?? 'NO SHOES'} at={tAt} y={240} size={86} color="#fff" rot={3} />
    </Camera>
  );
};

/* busRoute: { km, home, tag, tagOnWord, houseOnWord } — map line from a small house to a training ground with a bus crawling along; coins run out; a second "uncle's house" pops up near the ground. */
const BusRoute: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tAt = at(captions, scene.tagOnWord, fps, dur * 0.2);
  const hAt = at(captions, scene.houseOnWord, fps, dur * 0.75);
  const p = interpolate(frame, [4, hAt - 4], [0, 1], clamp);
  const hs = spring({frame: frame - hAt, fps, config: {damping: 10, stiffness: 190}});
  const coins = Math.max(0, 4 - Math.floor(p * 5));
  const pathX = (t: number) => 170 + t * 740;
  const pathY = (t: number) => 1180 - Math.sin(t * Math.PI) * 260 - t * 200;
  return (
    <Camera dur={dur} from={1.05} to={1.0}>
      <AbsoluteFill style={{background: '#d9f99d'}} />
      {[...Array(10)].map((_, i) => <div key={i} style={{position: 'absolute', left: (i * 211) % 1000, top: 350 + ((i * 157) % 1100), width: 120, height: 80, borderRadius: 40, background: '#86efac', opacity: 0.7}} />)}
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={[...Array(41)].map((_, i) => `${i ? 'L' : 'M'}${pathX(i / 40)} ${pathY(i / 40)}`).join(' ')} stroke={OL} strokeWidth={34} fill="none" strokeLinecap="round" />
        <path d={[...Array(41)].map((_, i) => `${i ? 'L' : 'M'}${pathX(i / 40)} ${pathY(i / 40)}`).join(' ')} stroke="#f8fafc" strokeWidth={18} fill="none" strokeDasharray="30 26" strokeLinecap="round" />
      </svg>
      <div style={{position: 'absolute', left: 90, top: 1160, width: 160, height: 130, background: '#fb923c', border: `7px solid ${OL}`}} />
      <div style={{position: 'absolute', left: 820, top: 860, width: 200, height: 120, background: '#16a34a', border: `7px solid ${OL}`, borderRadius: 10}}>
        <div style={{position: 'absolute', left: 20, top: 20, right: 20, bottom: 20, border: '5px solid #fff'}} />
      </div>
      <div style={{position: 'absolute', left: pathX(p) - 90, top: pathY(p) - 120, width: 180, height: 100, background: '#facc15', border: `7px solid ${OL}`, borderRadius: 18}}>
        <div style={{position: 'absolute', left: 16, top: 14, width: 40, height: 34, background: '#bae6fd', border: `4px solid ${OL}`}} />
        <div style={{position: 'absolute', left: 70, top: 14, width: 40, height: 34, background: '#bae6fd', border: `4px solid ${OL}`}} />
        <div style={{position: 'absolute', left: 124, top: 14, width: 40, height: 34, background: '#bae6fd', border: `4px solid ${OL}`}} />
      </div>
      <div style={{position: 'absolute', left: 90, top: 1340, display: 'flex', gap: 18}}>
        {[...Array(4)].map((_, i) => <div key={i} style={{width: 70, height: 70, borderRadius: 35, background: i < coins ? '#fbbf24' : 'transparent', border: `6px ${i < coins ? 'solid' : 'dashed'} ${OL}`}} />)}
      </div>
      <div style={{position: 'absolute', left: 620, top: 1020, width: 190, height: 150, background: '#60a5fa', border: `7px solid ${OL}`, opacity: frame >= hAt ? 1 : 0, scale: String(0.3 + hs * 0.7)}}>
        <div style={{position: 'absolute', left: -20, top: -70, width: 0, height: 0, borderLeft: '115px solid transparent', borderRight: '115px solid transparent', borderBottom: `70px solid ${OL}`}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 46, textAlign: 'center', fontFamily: DISPLAY, fontSize: 36, color: '#fff', WebkitTextStroke: `4px ${OL}`, paintOrder: 'stroke fill'}}>{(scene.home as string) ?? "UNCLE'S"}</div>
      </div>
      <Boy x={710} y={1520} height={300} stage="child" pose="run" phase={frame / 3} skin={sb.character.palette.skin} rim="#fde68a" glow={0.2} mood="happy" />
      <Tag text={(scene.km as string) ?? '70 KM A DAY'} at={tAt} y={250} size={92} color="#ffcc4d" rot={-3} />
      {scene.tag ? <Tag text={scene.tag as string} at={tAt + 10} y={420} size={60} color="#fff" rot={2} /> : null}
    </Camera>
  );
};

/* wasteHeadlines: { heads[], onWords[] } — newspapers slam down one by one with sceptical headlines; the teen keeps juggling underneath. */
const WasteHeadlines: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const heads = (scene.heads as string[]) ?? ['€45M FOR A KID?!', 'WILD OVERSPEND', '17 MINUTES?!'];
  const words = (scene.onWords as string[]) ?? [];
  return (
    <Camera dur={dur} from={1.0} to={1.06}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #475569 0%, #0f172a 80%)'}} />
      {heads.map((h, i) => {
        const a = at(captions, words[i], fps, 4 + i * Math.round(dur / (heads.length + 1)));
        const s = spring({frame: frame - a, fps, config: {damping: 11, stiffness: 210}});
        return (
          <Shake key={i} at={a} amount={8}>
            <div style={{position: 'absolute', left: 90 + (i % 2) * 40, top: 300 + i * 300, width: 860, height: 260, background: '#f5f5f4', border: `8px solid ${OL}`, rotate: `${[-4, 3, -2][i % 3]}deg`, opacity: frame >= a ? 1 : 0, scale: String(1.5 - s * 0.5), boxShadow: '0 12px 0 rgba(0,0,0,0.4)'}}>
              <div style={{position: 'absolute', left: 30, top: 18, fontFamily: BODY, fontWeight: 800, fontSize: 30, color: '#57534e', letterSpacing: 6}}>THE DAILY SPORT</div>
              <div dir="auto" style={{unicodeBidi: 'plaintext', position: 'absolute', left: 30, right: 30, top: 74, fontFamily: DISPLAY, fontSize: 92, color: '#b91c1c', lineHeight: 1}}>{h}</div>
              <div style={{position: 'absolute', left: 30, right: 30, bottom: 26, height: 14, background: '#d6d3d1', boxShadow: '0 -26px 0 #d6d3d1'}} />
            </div>
          </Shake>
        );
      })}
      <Boy x={540} y={1500} height={300} stage="teen" pose="kick" phase={frame / 6} skin={sb.character.palette.skin} rim="#fde68a" glow={0.4} mood="happy" />
    </Camera>
  );
};

/* winnerGoal: { score, label, labelOnWord, sub, subOnWord } — night final: ball hits the net, scoreboard flips to 1–0, the hero runs off cheering; later tag + daily pill. */
const WinnerGoal: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lAt = at(captions, scene.labelOnWord, fps, dur * 0.25);
  const sAt = at(captions, scene.subOnWord, fps, dur * 0.6);
  const shot = interpolate(frame, [lAt - 14, lAt], [0, 1], clamp);
  const net = frame >= lAt ? Math.sin((frame - lAt) / 2) * Math.max(0, 1 - (frame - lAt) / 20) * 16 : 0;
  return (
    <Shake at={lAt} amount={16}>
      <Camera dur={dur} from={1.04} to={1.0}>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, #020617 0%, #1e1b4b 45%, #166534 46%, #14532d 100%)'}} />
        {[...Array(30)].map((_, i) => <div key={i} style={{position: 'absolute', left: (i * 37) % 1080, top: 300 + ((i * 71) % 420), width: 8, height: 8, borderRadius: 4, background: '#fde68a', opacity: 0.3 + 0.5 * Math.abs(Math.sin(frame / 7 + i))}} />)}
        <div style={{position: 'absolute', left: 260, top: 640 + net, width: 560, height: 260, border: `14px solid #f8fafc`, borderBottom: 'none', background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.18) 0 4px, transparent 4px 30px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.18) 0 4px, transparent 4px 30px)'}} />
        <svg width={90} height={90} viewBox="0 0 100 100" style={{position: 'absolute', left: interpolate(shot, [0, 1], [180, 610]), top: interpolate(shot, [0, 1], [1300, 760]), rotate: `${frame * 12}deg`}}>
          <circle cx={50} cy={50} r={44} fill="#fff" stroke={OL} strokeWidth={8} />
          <path d="M50 26 L70 40 L62 64 L38 64 L30 40 Z" fill={OL} />
        </svg>
        <div style={{position: 'absolute', left: 300, top: 410, width: 480, height: 150, background: '#111827', border: `8px solid ${OL}`, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontSize: 110, color: frame >= lAt ? '#4ade80' : '#94a3b8'}}>{frame >= lAt ? ((scene.score as string) ?? '1 – 0') : '0 – 0'}</div>
        <Boy x={300 + Math.min(1, Math.max(0, (frame - lAt) / 30)) * 200} y={1560} height={460} stage="adult" pose={frame >= lAt ? 'cheer' : 'kick'} phase={frame / 4} skin={sb.character.palette.skin} rim="#fde68a" glow={0.5} mood="laugh" />
        <Tag text={(scene.label as string) ?? 'THE WINNING GOAL'} at={lAt} y={250} size={84} color="#ffcc4d" rot={-3} />
        {scene.sub ? <Tag text={scene.sub as string} at={sAt} y={960} size={56} color="#fff" rot={2} /> : null}
        <DailyPill from={Math.round(dur * 0.5)} y={1220} />
      </Camera>
    </Shake>
  );
};

export const STORY15_SCENES: Record<string, React.FC<SceneProps>> = {priceHook: PriceHook, barefootStreet: BarefootStreet, busRoute: BusRoute, wasteHeadlines: WasteHeadlines, winnerGoal: WinnerGoal};
