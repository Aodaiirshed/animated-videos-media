import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Syn} from '../components/Host';
import {Owl, Raccoon, Study, Counter, Board, W} from '../components/Duo';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* THE HIDDEN RULE #2 — Decoy effect. First "Mentor & apprentice" duo episode (The Professor + Kit).
   Scenes: coffeeHook, priceTags, duoPick, kitLarge, decoyReveal, arielyBoard, coffeeTurn. */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);
const talkOf = (mouth: number[] | undefined, f: number) => (mouth ? mouth[Math.min(mouth.length - 1, Math.max(0, f))] ?? 0 : 0);
const OL = '#1b120b';

const Badge: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 40, top: 190, fontFamily: BODY, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: W.cream, border: `3px solid ${W.cream}`, borderRadius: 10, padding: '4px 14px', opacity: 0.85}}>{text}</div>
);

/* hanging price tag */
const Tag: React.FC<{x: number; y: number; size: string; price: string; a: number; color?: string; s?: number; dim?: number}> = ({x, y, size, price, a, color = W.cream, s = 1, dim = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < a) return null;
  const sp = spring({frame: frame - a, fps, config: {damping: 9, stiffness: 200}});
  const swing = Math.sin((frame - a) / 6) * 8 * Math.exp(-(frame - a) / 25);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 250 * s, transformOrigin: '50% 0', rotate: `${swing}deg`, scale: String(sp), opacity: 1 - dim * 0.55}}>
      <div style={{margin: '0 auto', width: 4, height: 40 * s, background: W.chalk}} />
      <div style={{position: 'relative', background: color, border: `5px solid ${OL}`, borderRadius: 18, padding: `${16 * s}px 0 ${14 * s}px`, textAlign: 'center', clipPath: 'polygon(20% 0, 80% 0, 100% 16%, 100% 100%, 0 100%, 0 16%)'}}>
        <div style={{width: 18 * s, height: 18 * s, borderRadius: 9 * s, background: W.board, border: `3px solid ${OL}`, margin: '0 auto 4px'}} />
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 34 * s, color: OL, letterSpacing: 2}}>{size}</div>
        <div style={{fontFamily: DISPLAY, fontSize: 78 * s, color: OL, lineHeight: 1}}>{price}</div>
      </div>
    </div>
  );
};

/* coffee cups of three sizes drawn on the board */
const Cup: React.FC<{x: number; y: number; h: number; a: number}> = ({x, y, h, a}) => {
  const frame = useCurrentFrame();
  if (frame < a) return null;
  const w = h * 0.7;
  return (
    <svg width={w + 40} height={h + 40} viewBox={`0 0 ${w + 40} ${h + 40}`} style={{position: 'absolute', left: x, top: y - h}}>
      <path d={`M10 10 L${w + 10} 10 L${w - 4} ${h} L24 ${h} Z`} fill="none" stroke={W.chalk} strokeWidth={6} strokeLinejoin="round" />
      <rect x={4} y={4} width={w + 12} height={14} rx={6} fill={W.chalk} />
      <path d={`M${w * 0.35} -0 q10 -20 0 -34`} stroke={W.chalk} strokeWidth={4} fill="none" opacity={0.6} />
    </svg>
  );
};

const TAGS = [
  {size: 'SMALL', price: '$3'},
  {size: 'MEDIUM', price: '$6.50'},
  {size: 'LARGE', price: '$7'},
];

/* coffeeHook: { badge, tagOnWord } — HOOK: corner shop, board shows only SMALL $3; Kit at the counter; on "tag" the MEDIUM tag swings in. */
const CoffeeHook: React.FC<SceneProps> = ({scene, captions, mouth}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tAt = at(captions, scene.tagOnWord, fps, 60);
  return (
    <AbsoluteFill>
      <Study>
        <Board>
          <div style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', fontFamily: DISPLAY, fontSize: 58, color: W.chalk, letterSpacing: 6}}>☕ COFFEE</div>
          <Tag x={80} y={110} size="SMALL" price="$3" a={0} />
          <Tag x={330} y={110} size="MEDIUM" price="$6.50" a={tAt} color={W.coral} />
        </Board>
        <Owl x={10} y={800} s={1.2} talk={talkOf(mouth, frame)} point={interpolate(frame, [tAt - 6, tAt + 6], [0, 1], clamp)} look={0.4} />
        <Raccoon x={660} y={840} s={1.15} look={frame >= tAt ? -0.6 : -0.2} />
        <Counter />
      </Study>
      <Badge text={(scene.badge as string) ?? 'THE HIDDEN RULE #2'} />
    </AbsoluteFill>
  );
};

/* priceTags: { onWords[3] } — all three tags, each pops on its word; cups grow beside them. */
const PriceTags: React.FC<SceneProps> = ({scene, captions, mouth}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ws = (scene.onWords as string[]) ?? [];
  const ats = TAGS.map((_, i) => at(captions, ws[i], fps, i * 20));
  return (
    <AbsoluteFill>
      <Study>
        <Board>
          {TAGS.map((t, i) => <Tag key={i} x={30 + i * 290} y={40} size={t.size} price={t.price} a={i === 2 ? ats[2] : 0} color={i === 1 ? W.coral : W.cream} s={0.95} />)}
          {TAGS.map((_, i) => <Cup key={i} x={110 + i * 290} y={500} h={[110, 150, 170][i]} a={ats[i]} />)}
        </Board>
        <Owl x={10} y={800} s={1.2} talk={talkOf(mouth, frame)} point={1} look={0.5} />
        <Raccoon x={660} y={840} s={1.15} look={-0.5} />
        <Counter />
      </Study>
    </AbsoluteFill>
  );
};

/* duoPick: { question, options[], pauseOnWord } — warm pause-and-pick on the board. */
const DuoPick: React.FC<SceneProps> = ({scene, captions, mouth}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pAt = at(captions, scene.pauseOnWord, fps, 0);
  const opts = (scene.options as string[]) ?? [];
  return (
    <AbsoluteFill>
      <Study>
        <Board y={250} h={640}>
          <div style={{position: 'absolute', left: 30, right: 30, top: 40, textAlign: 'center', fontFamily: DISPLAY, fontSize: 70, color: W.chalk}}>{scene.question as string}</div>
          {opts.map((o, i) => {
            const s = spring({frame: frame - 4 - i * 5, fps, config: {damping: 14}});
            return (
              <div key={i} style={{position: 'absolute', left: 70, width: 730, top: 170 + i * 140, height: 112, border: `4px dashed ${W.chalk}`, borderRadius: 20, display: 'flex', alignItems: 'center', gap: 30, paddingLeft: 36, opacity: s, translate: `${(1 - s) * 60}px 0`}}>
                <span style={{fontFamily: DISPLAY, fontSize: 60, color: W.gold}}>{'ABC'[i]}</span>
                <span style={{fontFamily: DISPLAY, fontSize: 64, color: W.chalk}}>{o}</span>
              </div>
            );
          })}
        </Board>
        <Owl x={40} y={900} s={0.9} talk={talkOf(mouth, frame)} look={0.6} />
        <Raccoon x={720} y={930} s={0.9} look={-0.3} />
        <Counter top={1290} />
      </Study>
      {frame >= pAt ? <div style={{position: 'absolute', left: 0, right: 0, top: 935, textAlign: 'center'}}><span style={{fontFamily: DISPLAY, fontSize: 50, color: OL, background: W.gold, padding: '6px 26px', borderRadius: 14, border: `4px solid ${OL}`}}>❚❚ PAUSE & PICK</span></div> : null}
    </AbsoluteFill>
  );
};

/* kitLarge: { pickOnWord } — Kit (speaking) jumps and points at LARGE; a chalk circle draws around it. */
const KitLarge: React.FC<SceneProps> = ({scene, captions, mouth}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pAt = at(captions, scene.pickOnWord, fps, 4);
  const joy = spring({frame: frame - pAt, fps, config: {damping: 8}});
  const circ = interpolate(frame, [pAt + 4, pAt + 20], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Study>
        <Board>
          {TAGS.map((t, i) => <Tag key={i} x={30 + i * 290} y={40} size={t.size} price={t.price} a={0} color={i === 1 ? W.coral : W.cream} s={0.95} />)}
          <svg width={900} height={560} style={{position: 'absolute', left: 0, top: 0}}>
            <ellipse cx={728} cy={160} rx={150} ry={150} fill="none" stroke={W.gold} strokeWidth={10} strokeDasharray={1100} strokeDashoffset={1100 * (1 - circ)} strokeLinecap="round" />
          </svg>
          {frame >= pAt + 14 ? <div style={{position: 'absolute', left: 560, top: 430, fontFamily: DISPLAY, fontSize: 44, color: W.gold, rotate: '-6deg'}}>ONLY +50¢!</div> : null}
        </Board>
        <Owl x={10} y={800} s={1.2} talk={0} look={0.7} />
        <Raccoon x={650} y={830} s={1.2} talk={talkOf(mouth, frame)} joy={joy} look={-0.4} />
        <Counter />
      </Study>
    </AbsoluteFill>
  );
};

/* decoyReveal: { stampOnWord, titleOnWord } — the MEDIUM tag gets a DECOY stamp; then THE DECOY EFFECT title on the board. */
const DecoyReveal: React.FC<SceneProps> = ({scene, captions, mouth}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sAt = at(captions, scene.stampOnWord, fps, 20);
  const tAt = at(captions, scene.titleOnWord, fps, 60);
  const st = spring({frame: frame - sAt, fps, config: {damping: 10, stiffness: 260}});
  const ti = spring({frame: frame - tAt, fps, config: {damping: 12}});
  return (
    <AbsoluteFill>
      <Study>
        <Board>
          {TAGS.map((t, i) => <Tag key={i} x={30 + i * 290} y={40} size={t.size} price={t.price} a={0} color={i === 1 ? W.coral : W.cream} s={0.95} dim={i !== 1 && frame >= sAt ? 1 : 0} />)}
          {frame >= sAt ? <div style={{position: 'absolute', left: 300, top: 300, width: 300, textAlign: 'center', fontFamily: DISPLAY, fontSize: 76, color: '#fff', background: '#c8102e', border: '6px solid #fff', borderRadius: 12, rotate: '-14deg', scale: String(2 - st)}}>DECOY</div> : null}
          {frame >= tAt ? <div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', opacity: ti}}>
            <div style={{fontFamily: DISPLAY, fontSize: 84, color: W.gold, letterSpacing: 3}}>THE DECOY EFFECT</div>
          </div> : null}
        </Board>
        <Owl x={10} y={800} s={1.2} talk={talkOf(mouth, frame)} point={1} look={0.5} />
        <Raccoon x={660} y={840} s={1.15} look={-0.5} />
        <Counter />
      </Study>
    </AbsoluteFill>
  );
};

/* arielyBoard: { withOnWord, withoutOnWord } — the real study: magazine offer with the useless print-only option; two bars 84% vs 32%. */
const ArielyBoard: React.FC<SceneProps> = ({scene, captions, mouth}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const wAt = at(captions, scene.withOnWord, fps, 60);
  const oAt = at(captions, scene.withoutOnWord, fps, 120);
  const g1 = interpolate(frame, [wAt, wAt + 22], [0, 84], clamp);
  const g2 = interpolate(frame, [oAt, oAt + 22], [0, 32], clamp);
  const rows = [
    {t: 'WEB ONLY', p: '$59'},
    {t: 'PRINT ONLY', p: '$125', decoy: true},
    {t: 'PRINT + WEB', p: '$125'},
  ];
  return (
    <AbsoluteFill>
      <Study>
        <Board y={250} h={700}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 24, textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 32, color: W.grey, letterSpacing: 3}}>A REAL MAGAZINE OFFER</div>
          {rows.map((r, i) => (
            <div key={i} style={{position: 'absolute', left: 120, width: 640, top: 80 + i * 74, display: 'flex', justifyContent: 'space-between', fontFamily: DISPLAY, fontSize: 50, color: r.decoy ? W.coral : W.chalk, textDecoration: r.decoy && frame >= oAt ? 'line-through' : 'none'}}>
              <span>{r.t}</span><span>{r.p}</span>
            </div>
          ))}
          {[{lab: 'WITH THE DECOY', v: g1, a: wAt, c: W.gold}, {lab: 'WITHOUT IT', v: g2, a: oAt, c: W.mint}].map((b, i) => frame >= b.a ? (
            <div key={i} style={{position: 'absolute', left: 60, top: 330 + i * 160}}>
              <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 30, color: W.chalk, letterSpacing: 2}}>{b.lab} → PRINT + WEB</div>
              <div style={{marginTop: 10, height: 64, width: 7.2 * b.v, background: b.c, borderRadius: 10, border: `4px solid ${OL}`}} />
              <div style={{position: 'absolute', left: 7.2 * b.v + 20, top: 44, fontFamily: DISPLAY, fontSize: 64, color: b.c}}>{Math.round(b.v)}%</div>
            </div>
          ) : null)}
        </Board>
        <Owl x={40} y={960} s={0.85} talk={talkOf(mouth, frame)} point={1} look={0.5} />
        <Raccoon x={740} y={990} s={0.85} look={-0.4} />
        <div style={{position: 'absolute', left: 380, top: 1000, fontFamily: BODY, fontWeight: 800, fontSize: 26, color: W.grey}}>DAN ARIELY · PREDICTABLY IRRATIONAL</div>
        <Counter top={1290} />
      </Study>
    </AbsoluteFill>
  );
};

/* coffeeTurn: { line, coverOnWord } — "You think I'm talking about coffee": everyday price tags (phone plan, gym, streaming); Kit's paw covers the middle tag; Syn appears at the end. */
const CoffeeTurn: React.FC<SceneProps> = ({scene, captions, mouth, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cAt = at(captions, scene.coverOnWord, fps, dur * 0.55);
  const icons = ['📱', '🏋️', '📺'];
  const cov = spring({frame: frame - cAt, fps, config: {damping: 13}});
  return (
    <AbsoluteFill>
      <Study>
        <Board>
          <div style={{position: 'absolute', left: 20, right: 20, top: 26, textAlign: 'center', fontFamily: DISPLAY, fontSize: 56, color: W.chalk, lineHeight: 1.05}}>{(scene.line as string) ?? "YOU THINK I'M TALKING ABOUT COFFEE."}</div>
          {icons.map((ic, i) => {
            const s = spring({frame: frame - 14 - i * 9, fps, config: {damping: 12}});
            return <div key={i} style={{position: 'absolute', left: 80 + i * 270, top: 200, width: 200, height: 200, borderRadius: 24, border: `5px solid ${W.chalk}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 110, scale: String(s)}}>{ic}</div>;
          })}
          {['BASIC', 'PLUS', 'PRO'].map((t, i) => <div key={t} style={{position: 'absolute', left: 80 + i * 270, top: 430, width: 200, textAlign: 'center', fontFamily: DISPLAY, fontSize: 46, color: i === 1 ? W.coral : W.chalk}}>{t}</div>)}
          {frame >= cAt ? <div style={{position: 'absolute', left: 330, top: 405 + (1 - cov) * 160, width: 240, height: 100, borderRadius: 50, background: '#55575d', border: `5px solid ${OL}`, opacity: cov}} /> : null}
        </Board>
        <Owl x={10} y={800} s={1.2} talk={talkOf(mouth, frame)} look={0.3} />
        <Raccoon x={660} y={840} s={1.15} look={-0.6} arm={frame >= cAt ? cov * 0.8 : 0} />
        <Counter />
      </Study>
      <Syn x={60} y={1440} size={150} pose="think" from={Math.round(dur * 0.78)} to={dur} />
    </AbsoluteFill>
  );
};

export const RULE2_SCENES: Record<string, React.FC<SceneProps>> = {coffeeHook: CoffeeHook, priceTags: PriceTags, duoPick: DuoPick, kitLarge: KitLarge, decoyReveal: DecoyReveal, arielyBoard: ArielyBoard, coffeeTurn: CoffeeTurn};
