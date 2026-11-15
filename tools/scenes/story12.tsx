import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Boy} from '../components/Boy';
import {Camera, Shake} from '../components/Fx';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* Story set 12 (cartoon): retiredShirt, dadCounter, gamesCount, overheadKick (guess video) + answerHook, winnersCard (answer video). */
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

const Stamp: React.FC<{text: string; at: number; y: number; size?: number; rot?: number; color?: string}> = ({text, at: a, y, size = 150, rot = -8, color = '#ef4444'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - a, fps, config: {damping: 8, stiffness: 200}});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: frame >= a ? 1 : 0, scale: String(2.4 - s * 1.4), rotate: `${rot}deg`}}>
      <span style={{fontFamily: DISPLAY, fontSize: size, color, border: `14px solid ${color}`, padding: '0 34px', borderRadius: 26, background: '#000000b0'}}>{text}</span>
    </div>
  );
};

const Shirt: React.FC<{num: string; color?: string; trim?: string; w?: number}> = ({num, color = '#1d4ed8', trim = '#f8fafc', w = 420}) => (
  <svg width={w} height={w * 1.05} viewBox="0 0 400 420">
    <path d="M120 20 L160 10 Q200 50 240 10 L280 20 L390 90 L345 170 L300 140 L300 400 L100 400 L100 140 L55 170 L10 90 Z" fill={color} stroke={OL} strokeWidth={12} strokeLinejoin="round" />
    <path d="M160 10 Q200 50 240 10" stroke={trim} strokeWidth={14} fill="none" />
    <text x={200} y={320} textAnchor="middle" fontFamily={DISPLAY} fontSize={190} fill={trim} stroke={OL} strokeWidth={8} paintOrder="stroke">{num}</text>
  </svg>
);

/* retiredShirt: { num, stampOnWord, stamp?, tag? } — HOOK: a glass display case in a club museum; a blue shirt with a big number;
   spotlight; a RETIRED stamp slams on; ageTag "AGE 17". */
const RetiredShirt: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sAt = at(captions, scene.stampOnWord, fps, dur * 0.5);
  const tAt = at(captions, scene.tagOnWord, fps, dur * 0.7);
  return (
    <Shake at={sAt} amount={20}>
      <Camera dur={dur} from={1.14} to={1.0}>
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #3b2a1a 0%, #140d07 75%)'}} />
        {/* spotlight */}
        <div style={{position: 'absolute', left: 190, top: 0, width: 700, height: 1500, background: 'linear-gradient(180deg, rgba(255,240,200,0.35), rgba(255,240,200,0))', clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)'}} />
        {/* plinth */}
        <div style={{position: 'absolute', left: 230, top: 1180, width: 620, height: 500, background: 'linear-gradient(180deg, #57534e, #292524)', border: `10px solid ${OL}`, borderRadius: 12}} />
        <div style={{position: 'absolute', left: 300, top: 1215, width: 480, height: 90, background: '#a16207', border: `6px solid ${OL}`, borderRadius: 8, textAlign: 'center', fontFamily: DISPLAY, fontSize: 40, color: '#fde68a', lineHeight: '84px', whiteSpace: 'nowrap'}}>{(scene.plaque as string) ?? 'NEVER TO BE WORN AGAIN'}</div>
        {/* glass case */}
        <div style={{position: 'absolute', left: 250, top: 560, width: 580, height: 650, border: `10px solid ${OL}`, background: 'rgba(186,230,253,0.12)', borderRadius: 8}}>
          <div style={{position: 'absolute', left: 60, top: 70}}><Shirt num={(scene.num as string) ?? '22'} w={440} /></div>
          <div style={{position: 'absolute', left: -10, top: 0, width: 80, height: 650, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.35), rgba(255,255,255,0))', translate: `${(frame * 6) % 700}px 0`}} />
        </div>
        <Tag text={(scene.tag as string) ?? 'AGE 17'} at={tAt} x={220} y={330} size={100} color="#fff" rot={-6} />
        <Stamp text={(scene.stamp as string) ?? 'RETIRED'} at={sAt} y={760} size={170} rot={-10} />
        <Tag text={(scene.top as string) ?? 'HIS SHIRT. RETIRED.'} at={-12} y={150} size={74} color="#ffcc4d" rot={-2} />
      </Camera>
    </Shake>
  );
};

/* dadCounter: { to, label, hatOnWord? } — a cartoon dad in a police cap (no face detail of a real person) kicks balls into a tiny amateur goal;
   a giant counter races to `to`. */
const DadCounter: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const to = (scene.to as number) ?? 700;
  const cAt = at(captions, scene.countOnWord, fps, 6);
  const n = Math.round(interpolate(frame, [cAt, cAt + 40], [0, to], {...clamp, easing: Easing.out(Easing.cubic)}));
  const kick = frame % 14;
  return (
    <Camera dur={dur} from={1.0} to={1.08}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #94a3b8 0%, #cbd5e1 45%, #4d7c0f 46%, #3f6212 100%)'}} />
      {/* small amateur stand */}
      <div style={{position: 'absolute', left: 0, top: 700, width: 1080, height: 180, background: 'repeating-linear-gradient(90deg, #475569 0 60px, #334155 60px 64px)', borderTop: `8px solid ${OL}`}} />
      {/* goal */}
      <svg width={440} height={300} viewBox="0 0 440 300" style={{position: 'absolute', left: 600, top: 840}}>
        {new Array(10).fill(0).map((_, i) => <line key={i} x1={20 + i * 44} y1={20} x2={20 + i * 44} y2={290} stroke="#e2e8f0" strokeWidth={3} opacity={0.6} />)}
        {new Array(6).fill(0).map((_, i) => <line key={`h${i}`} x1={10} y1={30 + i * 50} x2={430} y2={30 + i * 50} stroke="#e2e8f0" strokeWidth={3} opacity={0.6} />)}
        <path d="M10 295 L10 10 L430 10 L430 295" stroke="#fff" strokeWidth={18} fill="none" />
      </svg>
      {/* balls flying in */}
      {[0, 1, 2].map((b) => {
        const p = ((frame + b * 5) % 14) / 14;
        return <div key={b} style={{position: 'absolute', left: 360 + p * 420, top: 1150 - Math.sin(p * Math.PI) * 220 - p * 60, width: 50, height: 50, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #fff, #d4d4d4)', border: `5px solid ${OL}`, opacity: frame >= cAt ? 1 : 0}} />;
      })}
      <Boy x={300} y={1450} height={560} stage="adult" pose={kick < 7 ? 'kick' : 'stand'} phase={frame / 3} skin={(scene.dadSkin as string) ?? '#8d5524'} rim="#bfdbfe" glow={0.3} mood="laugh" />
      {/* police cap */}
      <svg width={220} height={110} viewBox="0 0 220 110" style={{position: 'absolute', left: 190, top: 860}}>
        <path d="M20 70 Q110 -10 200 70 Z" fill="#1e293b" stroke={OL} strokeWidth={8} />
        <rect x={20} y={62} width={180} height={24} fill="#0f172a" stroke={OL} strokeWidth={6} />
        <path d="M30 86 Q110 120 190 86" fill="#111" stroke={OL} strokeWidth={6} />
        <circle cx={110} cy={50} r={14} fill="#fbbf24" stroke={OL} strokeWidth={4} />
      </svg>
      <div style={{position: 'absolute', top: 170, width: '100%', textAlign: 'center'}}>
        <span style={{fontFamily: DISPLAY, fontSize: 280, lineHeight: 1, color: '#ffcc4d', WebkitTextStroke: `14px ${OL}`, paintOrder: 'stroke fill'}}>{n}{n >= to ? '+' : ''}</span>
        <div style={{fontFamily: DISPLAY, fontSize: 64, color: '#fff', WebkitTextStroke: `6px ${OL}`, paintOrder: 'stroke fill'}}>{(scene.label as string) ?? 'GOALS BY HIS DAD'}</div>
      </div>
      <Tag text={(scene.tag as string) ?? 'DAY JOB: POLICE OFFICER'} at={at(captions, scene.tagOnWord, fps, 2)} y={560} size={56} color="#bfdbfe" rot={2} />
      {sb ? null : null}
    </Camera>
  );
};

/* gamesCount: { num, label, sub? } — reveal of the pick: tiny shirt icons fill the screen one by one up to `num`; big number. */
const GamesCount: React.FC<SceneProps> = ({scene, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const num = (scene.num as number) ?? 44;
  const shown = Math.round(interpolate(frame, [4, Math.min(dur * 0.55, 40)], [0, num], clamp));
  const big = spring({frame: frame - 6, fps, config: {damping: 9}});
  return (
    <Camera dur={dur} from={1.0} to={1.05}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1e3a8a 0%, #0b1020 80%)'}} />
      <div style={{position: 'absolute', top: 160, width: '100%', textAlign: 'center', scale: String(0.4 + big * 0.6)}}>
        <span style={{fontFamily: DISPLAY, fontSize: 300, lineHeight: 1, color: '#ffcc4d', WebkitTextStroke: `14px ${OL}`, paintOrder: 'stroke fill'}}>{shown}</span>
        <div style={{fontFamily: DISPLAY, fontSize: 70, color: '#fff', WebkitTextStroke: `6px ${OL}`, paintOrder: 'stroke fill'}}>{(scene.label as string) ?? 'FIRST-TEAM GAMES'}</div>
      </div>
      {new Array(num).fill(0).map((_, i) => {
        const col = i % 8, row = Math.floor(i / 8);
        return <div key={i} style={{position: 'absolute', left: 110 + col * 110, top: 700 + row * 112, opacity: i < shown ? 1 : 0.08, scale: i === shown - 1 ? '1.3' : '1'}}>{scene.icon === 'ball' ? <div style={{width: 84, height: 84, borderRadius: 42, background: 'radial-gradient(circle at 35% 35%, #fff, #d4d4d4)', border: `6px solid ${OL}`}} /> : <Shirt num="" w={80} />}</div>;
      })}
      {scene.sub ? <Tag text={scene.sub as string} at={Math.round(dur * 0.6)} y={1080} size={58} color="#fff" rot={-2} /> : null}
    </Camera>
  );
};

/* overheadKick: { clock?, kickOnWord?, tag? } — stadium at night; a big match clock frozen at 94:59 then 95:00; the hero flips upside down
   for an overhead kick; the ball rockets into the corner; the net bulges. */
const OverheadKick: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const kAt = at(captions, scene.kickOnWord, fps, dur * 0.55);
  const flip = interpolate(frame, [kAt - 10, kAt], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const shot = interpolate(frame, [kAt, kAt + 10], [0, 1], clamp);
  const bulge = interpolate(frame, [kAt + 10, kAt + 14, kAt + 30], [0, 1, 0.4], clamp);
  const flash = interpolate(frame, [kAt + 10, kAt + 12, kAt + 22], [0, 0.7, 0], clamp);
  const secs = frame < kAt ? '94:59' : '95:00';
  return (
    <Shake at={kAt + 10} amount={26}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #020617 0%, #0f172a 40%, #166534 41%, #14532d 100%)'}} />
      {new Array(80).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: random(`k${i}`) * 1080, top: 140 + random(`ky${i}`) * 260, width: 12, height: 12, borderRadius: 6, background: ['#f8fafc', '#ef4444', '#60a5fa'][i % 3], opacity: 0.4 + (frame > kAt + 10 ? Math.abs(Math.sin(frame / 2 + i)) * 0.6 : 0)}} />)}
      {/* floodlights */}
      {[120, 960].map((x) => <div key={x} style={{position: 'absolute', left: x - 60, top: 60, width: 120, height: 60, background: '#fef9c3', borderRadius: 10, boxShadow: '0 0 120px 50px rgba(254,249,195,0.5)'}} />)}
      {/* clock */}
      <div style={{position: 'absolute', left: 340, top: 180, width: 400, height: 150, background: '#0b0b0f', border: `8px solid ${OL}`, borderRadius: 18, textAlign: 'center', fontFamily: DISPLAY, fontSize: 120, color: frame < kAt ? '#ef4444' : '#22c55e', lineHeight: '140px', boxShadow: '0 0 40px rgba(239,68,68,0.4)'}}>{secs}</div>
      {/* goal (left) */}
      <svg width={520} height={340} viewBox="0 0 520 340" style={{position: 'absolute', left: 40, top: 640}}>
        {new Array(12).fill(0).map((_, i) => <line key={i} x1={20 + i * 44} y1={20} x2={20 + i * 44 - (i < 3 ? bulge * 26 : 0)} y2={330} stroke="#e2e8f0" strokeWidth={3} opacity={0.6} />)}
        {new Array(7).fill(0).map((_, i) => <line key={`h${i}`} x1={10} y1={30 + i * 48} x2={510} y2={30 + i * 48} stroke="#e2e8f0" strokeWidth={3} opacity={0.6} />)}
        <path d="M10 335 L10 10 L510 10 L510 335" stroke="#fff" strokeWidth={20} fill="none" />
      </svg>
      {/* ball */}
      <div style={{position: 'absolute', left: interpolate(shot, [0, 1], [720, 130]) - 32, top: interpolate(shot, [0, 1], [930, 880]) - 32 - (frame < kAt ? Math.sin(frame / 4) * 10 + 60 : 0), width: 64, height: 64, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #fff, #d4d4d4)', border: `6px solid ${OL}`}} />
      {/* hero flipping */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, rotate: `${flip * -165}deg`, transformOrigin: '760px 1050px'}}>
        <Boy x={760} y={1290} height={480} stage="adult" pose="kick" phase={frame / 3} skin={sb.character.palette.skin} rim="#fde68a" glow={0.6} mood="determined" flip />
      </div>
      {scene.tag ? <Tag text={scene.tag as string} at={kAt + 12} y={420} size={78} color="#ffcc4d" rot={-3} /> : null}
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </Shake>
  );
};

/* answerHook: { title, sub? } — ANSWER VIDEO HOOK: a giant "?" card flips to the title "YESTERDAY'S MYSTERY" with a ticket-like sub line. */
const AnswerHook: React.FC<SceneProps> = ({scene, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const flip = spring({frame: frame - 8, fps, config: {damping: 13}});
  const wob = Math.sin(frame / 6) * 3;
  return (
    <Camera dur={dur} from={1.1} to={1.0}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #7c2d12 0%, #1c0a05 80%)'}} />
      {new Array(18).fill(0).map((_, i) => {
        const a = (i / 18) * Math.PI * 2 + frame / 50;
        return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * 520 - 30, top: 900 + Math.sin(a) * 620 - 40, fontFamily: DISPLAY, fontSize: 80, color: '#fbbf24', opacity: 0.25}}>?</div>;
      })}
      <div style={{position: 'absolute', left: 140, top: 520, width: 800, height: 760, transform: `perspective(1600px) rotateY(${(1 - flip) * 180}deg) rotate(${wob}deg)`, background: '#fef3c7', border: `14px solid ${OL}`, borderRadius: 40, boxShadow: `0 20px 0 ${OL}`, textAlign: 'center'}}>
        <div style={{fontFamily: DISPLAY, fontSize: 120, color: '#b45309', marginTop: 120, lineHeight: 1}}>{(scene.title as string) ?? "YESTERDAY'S"}</div>
        <div style={{fontFamily: DISPLAY, fontSize: 150, color: OL, lineHeight: 1.05}}>{(scene.title2 as string) ?? 'MYSTERY'}</div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 46, color: '#7c2d12', marginTop: 40}}>{(scene.sub as string) ?? 'THE ANSWER'}</div>
      </div>
      <Tag text={(scene.top as string) ?? 'ANSWER TIME'} at={-12} y={190} size={84} color="#ffcc4d" rot={-3} />
    </Camera>
  );
};

/* winnersCard: { rows: [{platform, user|null, note?}], title?, onWord? } — a gold trophy + "FIRST TO GET IT" + one row per platform.
   Plain text platform labels only (no logos). A row with user null shows its note (e.g. "nobody yet — beat today's!"). */
const WinnersCard: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const oAt = at(captions, scene.onWord, fps, 4);
  const rows = (scene.rows as {platform: string; user: string | null; note?: string}[]) ?? [];
  const trophy = spring({frame: frame - oAt, fps, config: {damping: 9, stiffness: 160}});
  return (
    <Shake at={oAt} amount={14}>
      <Camera dur={dur} from={1.0} to={1.06}>
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 30%, #854d0e 0%, #1c1404 80%)'}} />
        {new Array(40).fill(0).map((_, i) => {
          const t = ((frame + i * 9) % 90) / 90;
          return <div key={i} style={{position: 'absolute', left: random(`cf${i}`) * 1080, top: -40 + t * 1900, width: 22, height: 34, background: ['#fbbf24', '#ef4444', '#22c55e', '#60a5fa', '#f8fafc'][i % 5], rotate: `${frame * 7 + i * 30}deg`, opacity: frame >= oAt ? 0.9 : 0}} />;
        })}
        <svg width={300} height={320} viewBox="0 0 300 320" style={{position: 'absolute', left: 390, top: 200, scale: String(trophy)}}>
          <path d="M70 30 L230 30 L220 140 Q150 220 80 140 Z" fill="#fbbf24" stroke={OL} strokeWidth={10} strokeLinejoin="round" />
          <path d="M70 50 Q10 50 30 110 Q45 140 85 135 M230 50 Q290 50 270 110 Q255 140 215 135" stroke={OL} strokeWidth={10} fill="none" />
          <rect x={130} y={200} width={40} height={50} fill="#d97706" stroke={OL} strokeWidth={8} />
          <rect x={80} y={250} width={140} height={50} rx={8} fill="#92400e" stroke={OL} strokeWidth={8} />
          <text x={150} y={130} textAnchor="middle" fontFamily={DISPLAY} fontSize={70} fill="#fff7d6" stroke={OL} strokeWidth={4} paintOrder="stroke">#1</text>
        </svg>
        <div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center', fontFamily: DISPLAY, fontSize: 100, color: '#fff', WebkitTextStroke: `8px ${OL}`, paintOrder: 'stroke fill', opacity: trophy}}>{(scene.title as string) ?? 'FIRST TO GET IT'}</div>
        {rows.map((r, i) => {
          const s = spring({frame: frame - oAt - 8 - i * 10, fps, config: {damping: 12}});
          return (
            <div key={i} style={{position: 'absolute', left: 90, width: 900, top: 760 + i * 230, height: 190, background: '#fffbeb', border: `10px solid ${OL}`, borderRadius: 30, boxShadow: `0 12px 0 ${OL}`, translate: `${(1 - s) * 1200}px 0`}}>
              <div style={{position: 'absolute', left: 30, top: 20, fontFamily: BODY, fontWeight: 800, fontSize: 40, color: '#92400e'}}>{r.platform.toUpperCase()}</div>
              <div style={{position: 'absolute', left: 30, top: 74, fontFamily: r.user ? BODY : DISPLAY, fontWeight: 900, fontSize: r.user ? 66 : 56, lineHeight: 1.25, color: OL, whiteSpace: 'nowrap'}}>{r.user ? `@${r.user}` : (r.note ?? 'nobody yet')}</div>
            </div>
          );
        })}
      </Camera>
    </Shake>
  );
};

export const STORY12_SCENES: Record<string, React.FC<SceneProps>> = {
  retiredShirt: RetiredShirt,
  dadCounter: DadCounter,
  gamesCount: GamesCount,
  overheadKick: OverheadKick,
  answerHook: AnswerHook,
  winnersCard: WinnersCard,
};
