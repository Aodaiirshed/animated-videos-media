import React from 'react';
import {useCurrentFrame} from 'remotion';

/* THE HIDDEN RULE — "Mentor & apprentice" duo (original characters, spec in channel/series-hidden-rule.md).
   The Professor = old owl, tweed waistcoat, round glasses (voice am_onyx).
   Kit = young raccoon in a teal hoodie (voice am_puck, pitched up).
   talk: 0..1 mouth opening (feed the scene's lip-sync envelope). */
export const W = {
  wall1: '#3b2a1f', wall2: '#25190f', wood: '#7a4e2d', woodDark: '#4e3019', board: '#22302a', chalk: '#f1ead8',
  cream: '#f6e7c8', coral: '#ff6b4a', gold: '#ffc94d', mint: '#7fd1b9', grey: '#9a8f80',
};
const OL = '#1b120b';

export const Owl: React.FC<{x: number; y: number; s?: number; talk?: number; point?: number; look?: number; blink?: boolean}> = ({x, y, s = 1, talk = 0, point = 0, look = 0, blink}) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 14) * 3;
  const closed = blink ?? frame % 110 < 4;
  const open = Math.min(1, talk) * 18;
  return (
    <svg width={320 * s} height={430 * s} viewBox="0 0 320 430" style={{position: 'absolute', left: x, top: y + bob, overflow: 'visible'}}>
      {/* ear tufts */}
      <path d="M78 70 L60 10 L118 52 Z" fill="#6e5236" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <path d="M242 70 L260 10 L202 52 Z" fill="#6e5236" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      {/* body */}
      <ellipse cx={160} cy={250} rx={130} ry={165} fill="#8a6a4a" stroke={OL} strokeWidth={6} />
      <ellipse cx={160} cy={300} rx={82} ry={105} fill={W.cream} />
      {/* tweed waistcoat */}
      <path d="M70 215 Q160 250 250 215 L262 380 Q160 420 58 380 Z" fill="#5d5139" stroke={OL} strokeWidth={5} />
      {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={80 + i * 32} y1={230} x2={70 + i * 34} y2={395} stroke="#7a6c4d" strokeWidth={3} />)}
      <path d="M130 228 L160 330 L190 228" fill={W.cream} stroke={OL} strokeWidth={4} />
      {[290, 330, 368].map((cy) => <circle key={cy} cx={160} cy={cy} r={6} fill={W.gold} stroke={OL} strokeWidth={2} />)}
      {/* left wing (still) */}
      <path d="M40 210 Q8 300 52 370 Q72 300 70 220 Z" fill="#6e5236" stroke={OL} strokeWidth={5} />
      {/* right wing — points with a chalk stick */}
      <g transform={`rotate(${-point * 70} 262 220)`}>
        <path d="M250 210 Q312 300 270 370 Q250 300 252 220 Z" fill="#6e5236" stroke={OL} strokeWidth={5} />
        {point > 0.05 ? <rect x={262} y={360} width={12} height={70} rx={5} fill={W.chalk} stroke={OL} strokeWidth={3} transform="rotate(-20 268 360)" /> : null}
      </g>
      {/* face disc */}
      <ellipse cx={160} cy={130} rx={112} ry={92} fill="#a07d58" stroke={OL} strokeWidth={5} />
      {/* eyes + round glasses */}
      {[105, 215].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={125} r={40} fill="#fffaf0" />
          {closed ? <line x1={cx - 24} y1={127} x2={cx + 24} y2={127} stroke={OL} strokeWidth={6} strokeLinecap="round" />
            : <circle cx={cx + look * 12} cy={128} r={16} fill={OL} />}
          <circle cx={cx} cy={125} r={46} fill="none" stroke="#c9a14a" strokeWidth={7} />
        </g>
      ))}
      <line x1={151} y1={122} x2={169} y2={122} stroke="#c9a14a" strokeWidth={6} />
      {/* bushy brows */}
      <path d="M62 78 Q100 62 140 82" stroke="#e8dcc4" strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d="M258 78 Q220 62 180 82" stroke="#e8dcc4" strokeWidth={10} fill="none" strokeLinecap="round" />
      {/* beak: lower half opens when talking */}
      <path d={`M146 168 L174 168 L160 ${200 + open} Z`} fill="#c2762f" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <path d="M140 150 L180 150 L160 184 Z" fill="#e8963d" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      {/* feet */}
      <path d="M110 405 l-14 18 M110 405 l0 22 M110 405 l14 18 M210 405 l-14 18 M210 405 l0 22 M210 405 l14 18" stroke="#c2762f" strokeWidth={8} strokeLinecap="round" />
    </svg>
  );
};

export const Raccoon: React.FC<{x: number; y: number; s?: number; talk?: number; look?: number; arm?: number; joy?: number; flip?: boolean}> = ({x, y, s = 1, talk = 0, look = 0, arm = 0, joy = 0, flip}) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 9) * 3 - joy * 14;
  const closed = frame % 95 < 4;
  const open = Math.min(1, talk);
  const HOOD = '#2f8f83';
  return (
    <svg width={300 * s} height={430 * s} viewBox="0 0 300 430" style={{position: 'absolute', left: x, top: y + bob, overflow: 'visible', scale: flip ? '-1 1' : undefined}}>
      {/* striped tail */}
      <g transform={`rotate(${Math.sin(frame / 12) * 8} 240 340)`}>
        <path d="M230 340 Q320 300 300 200 Q330 260 290 360 Z" fill="#7d7f86" stroke={OL} strokeWidth={5} />
        <path d="M300 228 L318 236 M306 262 L322 272 M300 300 L314 312" stroke="#2b2d33" strokeWidth={12} strokeLinecap="round" />
      </g>
      {/* hoodie body */}
      <path d="M70 230 Q150 200 230 230 L250 420 L50 420 Z" fill={HOOD} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
      <path d="M110 330 L190 330 L196 380 L104 380 Z" fill="#287a70" stroke={OL} strokeWidth={4} />
      <line x1={135} y1={232} x2={128} y2={290} stroke={W.cream} strokeWidth={5} strokeLinecap="round" />
      <line x1={165} y1={232} x2={172} y2={290} stroke={W.cream} strokeWidth={5} strokeLinecap="round" />
      {/* arm (raises on joy / arm) */}
      <g transform={`rotate(${-(arm || joy) * 120} 228 250)`}>
        <path d="M222 250 L262 340" stroke={HOOD} strokeWidth={36} strokeLinecap="round" />
        <circle cx={264} cy={346} r={20} fill="#55575d" stroke={OL} strokeWidth={4} />
      </g>
      <path d="M78 250 L48 340" stroke={HOOD} strokeWidth={36} strokeLinecap="round" />
      <circle cx={46} cy={346} r={20} fill="#55575d" stroke={OL} strokeWidth={4} />
      {/* hood behind head */}
      <path d="M58 170 Q150 60 242 170 L230 240 Q150 260 70 240 Z" fill="#287a70" stroke={OL} strokeWidth={5} />
      {/* ears */}
      <path d="M80 70 L70 18 L122 50 Z" fill="#7d7f86" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <path d="M220 70 L230 18 L178 50 Z" fill="#7d7f86" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      {/* head */}
      <ellipse cx={150} cy={130} rx={100} ry={86} fill="#9a9ca3" stroke={OL} strokeWidth={5} />
      {/* mask */}
      <path d="M58 118 Q100 92 140 120 Q150 128 160 120 Q200 92 242 118 Q238 160 196 160 Q160 160 150 140 Q140 160 104 160 Q62 160 58 118 Z" fill="#2b2d33" />
      <path d="M90 82 Q150 60 210 82" stroke="#f2f2f2" strokeWidth={10} fill="none" strokeLinecap="round" />
      {/* eyes */}
      {[104, 196].map((cx) => closed
        ? <line key={cx} x1={cx - 16} y1={130} x2={cx + 16} y2={130} stroke="#fff" strokeWidth={5} strokeLinecap="round" />
        : <g key={cx}><circle cx={cx} cy={130} r={20} fill="#fff" /><circle cx={cx + look * 7} cy={132} r={10 + joy * 2} fill={OL} /><circle cx={cx + look * 7 + 4} cy={127} r={3.5} fill="#fff" /></g>)}
      {/* muzzle, nose, mouth */}
      <ellipse cx={150} cy={178} rx={44} ry={30} fill="#e9e6df" />
      <ellipse cx={150} cy={164} rx={13} ry={9} fill={OL} />
      {open > 0.08 || joy > 0.3
        ? <ellipse cx={150} cy={188} rx={14 + joy * 4} ry={4 + Math.max(open, joy * 0.7) * 12} fill="#7a1f2b" stroke={OL} strokeWidth={3} />
        : <path d="M136 186 Q150 196 164 186" stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" />}
    </svg>
  );
};

/* warm study / corner-shop backdrop: wood wall, shelves with jars, a counter at the bottom */
export const Study: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${W.wall1} 0%, ${W.wall2} 100%)`}} />
    {new Array(9).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', top: 0, bottom: 0, left: i * 124, width: 3, background: 'rgba(0,0,0,0.18)'}} />)}
    <div style={{position: 'absolute', left: 0, right: 0, top: 120, height: 16, background: W.woodDark}} />
    {[60, 150, 230, 860, 950].map((lx, i) => <div key={i} style={{position: 'absolute', left: lx, top: 64, width: 52, height: 56, borderRadius: '10px 10px 6px 6px', background: ['#c98b3f', '#8fb39a', '#d0a35c', '#9c6b4d', '#b8c48b'][i], border: `3px solid ${OL}`}} />)}
    <div style={{position: 'absolute', left: 900, top: 160, width: 120, height: 120, borderRadius: 60, background: 'radial-gradient(circle, rgba(255,201,77,0.55), transparent 70%)'}} />
    {children}
  </>
);

export const Counter: React.FC<{top?: number}> = ({top = 1260}) => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top, height: 30, background: '#9a6638', borderTop: `4px solid ${OL}`}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: top + 30, bottom: 0, background: `linear-gradient(180deg, ${W.wood}, ${W.woodDark})`}} />
  </>
);

/* chalkboard panel used as the "explainer screen" */
export const Board: React.FC<{x?: number; y?: number; w?: number; h?: number; children?: React.ReactNode}> = ({x = 90, y = 250, w = 900, h = 560, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: W.board, border: `14px solid ${W.wood}`, borderRadius: 10, boxShadow: '0 10px 0 rgba(0,0,0,0.35)', overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06), transparent 60%)'}} />
    {children}
  </div>
);
