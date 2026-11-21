import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Boy} from '../components/Boy';
import {Camera, Shake} from '../components/Fx';
import {DailyPill, SeriesBadge} from '../components/Host';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* Story set 22 (Guess the Player #20): recordHook (Week-1 Arm A: payoff picture on frame 0), elevenRow, tooSmall, factoryShift,
   millionFee, titleCheer. Original cartoon player in a neutral grey kit; no crests, kits or likeness. */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OL = '#1b1b22';
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);

const Tag: React.FC<{text: string; a: number; y: number; color?: string; size?: number; rot?: number}> = ({text, a, y, color = '#ffcc4d', size = 62, rot = -3}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < a) return null;
  const s = spring({frame: frame - a, fps, config: {damping: 10, stiffness: 190}});
  return (
    <div style={{position: 'absolute', left: 40, right: 140, top: y, textAlign: 'center', scale: String(1.6 - s * 0.6), rotate: `${rot}deg`}}>
      <span style={{fontFamily: DISPLAY, fontSize: size, color: '#111', background: color, padding: '4px 26px', borderRadius: 14, border: `6px solid ${OL}`, boxShadow: `0 8px 0 ${OL}`}}>{text}</span>
    </div>
  );
};

/* night stadium pitch with a goal frame */
const NightPitch: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg,#0b1020 0%, #1e293b 48%, #15803d 49%, #14532d 100%)'}}>
    {[160, 540, 920].map((x) => <div key={x} style={{position: 'absolute', left: x - 70, top: 250, width: 140, height: 40, borderRadius: 20, background: '#fef9c3', boxShadow: '0 0 90px 40px rgba(254,249,195,0.35)'}} />)}
    {children}
  </AbsoluteFill>
);
const Goal: React.FC<{x: number; y: number; w?: number; h?: number}> = ({x, y, w = 520, h = 260}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, border: `12px solid #f8fafc`, borderBottom: 'none', backgroundImage: 'repeating-linear-gradient(45deg, rgba(248,250,252,0.35) 0 4px, transparent 4px 34px), repeating-linear-gradient(-45deg, rgba(248,250,252,0.35) 0 4px, transparent 4px 34px)'}} />
);
const Ball: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 70 * s, height: 70 * s, borderRadius: 35 * s, background: 'radial-gradient(circle at 35% 35%, #fff 0 55%, #cbd5e1 100%)', border: `${5 * s}px solid ${OL}`, rotate: `${rot}deg`}}>
    <div style={{position: 'absolute', left: '32%', top: '30%', width: '36%', height: '36%', background: OL, clipPath: 'polygon(50% 0, 100% 38%, 82% 100%, 18% 100%, 0 38%)'}} />
  </div>
);

/* recordHook: { recordOnWord } — WEEK-1 ARM A "payoff picture first": frame 0 = the ball already flying into the net under floodlights,
   a giant "11" with the on-screen text FACTORY → RECORD; a factory skyline behind the stand. Punch-in cut at 1.2 s; RECORD stamp on "record". */
const RecordHook: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rAt = at(captions, scene.recordOnWord, fps, dur * 0.8);
  const cut = 36;
  const fly = interpolate(frame, [0, 14], [0, 1], clamp);
  const net = frame >= 14 ? Math.sin((frame - 14) / 2) * Math.max(0, 1 - (frame - 14) / 20) * 14 : 0;
  return (
    <Shake at={14} amount={6}>
      <AbsoluteFill style={{scale: frame >= cut ? '1.3' : '1', transformOrigin: '540px 820px'}}>
        <NightPitch>
          {/* factory skyline behind the stand */}
          <svg width={1080} height={260} viewBox="0 0 1080 260" style={{position: 'absolute', left: 0, top: 420}}>
            <path d="M0 260 V150 H120 V90 h40 V150 H260 l60 -40 v40 l60 -40 v40 l60 -40 v40 H560 V70 h44 V150 H760 V120 H900 V60 h40 V150 H1080 V260Z" fill="#334155" />
            {[140, 582, 920].map((x, i) => <circle key={i} cx={x} cy={50 - ((frame * 0.8 + i * 20) % 40)} r={18 + ((frame * 0.3) % 10)} fill="#64748b" opacity={0.5} />)}
          </svg>
          <div style={{translate: `0 ${net}px`}}><Goal x={280} y={700} /></div>
          <Boy x={260} y={1250} height={430} stage="adult" pose="kick" phase={Math.min(frame / 3, 1.6)} skin={sb.character.palette.skin} rim="#fde68a" glow={0.4} mood="happy" />
          <Ball x={interpolate(fly, [0, 1], [360, 560])} y={interpolate(fly, [0, 1], [1150, 800]) + (frame >= 14 ? net : 0)} rot={frame * 25} />
        </NightPitch>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 560, top: 440, width: 340, textAlign: 'center', rotate: '6deg'}}>
        <div style={{fontFamily: DISPLAY, fontSize: 190, color: '#facc15', WebkitTextStroke: `10px ${OL}`, paintOrder: 'stroke fill', lineHeight: 0.9}}>11</div>
        <div style={{fontFamily: DISPLAY, fontSize: 40, color: '#f8fafc', WebkitTextStroke: `6px ${OL}`, paintOrder: 'stroke fill'}}>GAMES IN A ROW</div>
      </div>
      <Tag text="FACTORY → RECORD" a={-10} y={330} size={66} color="#f8fafc" />
      {frame >= rAt ? <Tag text="PREMIER LEAGUE RECORD" a={rAt} y={1060} size={58} color="#ef4444" rot={2} /> : null}
      <SeriesBadge text={scene.badge as string} from={60} />
    </Shake>
  );
};

/* elevenRow: { startOnWord, endOnWord, nobodyOnWord } — 11 match cards light up one by one with a ball (counter 1 → 11); NOBODY HAD EVER DONE IT. */
const ElevenRow: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sAt = at(captions, scene.startOnWord, fps, 2);
  const eAt = at(captions, scene.endOnWord, fps, dur * 0.55);
  const nAt = at(captions, scene.nobodyOnWord, fps, dur * 0.7);
  const lit = Math.min(11, Math.max(0, Math.floor(interpolate(frame, [sAt, eAt], [1, 11.99], clamp))));
  return (
    <Camera dur={dur} from={1.04} to={1.0}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #1e3a8a 0%, #0b1020 80%)'}} />
      <div style={{position: 'absolute', left: 70, top: 520, width: 800, display: 'flex', flexWrap: 'wrap', gap: 22, justifyContent: 'center'}}>
        {new Array(11).fill(0).map((_, i) => {
          const on = i < lit;
          return (
            <div key={i} style={{width: 140, height: 150, borderRadius: 18, border: `6px solid ${OL}`, background: on ? '#facc15' : '#334155', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', scale: on && i === lit - 1 ? '1.12' : '1'}}>
              <div style={{fontFamily: DISPLAY, fontSize: 30, color: on ? '#111' : '#94a3b8'}}>GAME {i + 1}</div>
              <div style={{fontSize: 56}}>{on ? '⚽' : '·'}</div>
            </div>
          );
        })}
      </div>
      <Tag text={`${lit} IN A ROW`} a={sAt} y={330} size={70} color="#f8fafc" rot={-2} />
      {frame >= nAt ? <Tag text="NOBODY HAD EVER DONE IT" a={nAt} y={1100} size={54} color="#ef4444" rot={2} /> : null}
      <SeriesBadge text={scene.badge as string} />
    </Camera>
  );
};

/* tooSmall: { stampOnWord } — a 16-year-old next to a tall height chart at the club gate; RELEASED · TOO SMALL stamp. */
const TooSmall: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sAt = at(captions, scene.stampOnWord, fps, dur * 0.6);
  const st = spring({frame: frame - sAt, fps, config: {damping: 8, stiffness: 220}});
  return (
    <Shake at={sAt} amount={9}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#334155 0%, #475569 55%, #166534 56%, #14532d 100%)'}} />
      <div style={{position: 'absolute', left: 600, top: 520, width: 120, height: 680, background: '#f8fafc', border: `7px solid ${OL}`, borderRadius: 10}}>
        {new Array(12).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: 0, top: 20 + i * 54, width: i % 2 ? 40 : 70, height: 6, background: OL}} />)}
      </div>
      <Boy x={460} y={1190} height={260} stage="teen" pose="stand" skin={sb.character.palette.skin} rim="#fde68a" glow={0.2} mood={frame >= sAt ? 'sad' : 'neutral'} />
      <Tag text="AGE 16" a={2} y={330} size={66} color="#f8fafc" />
      {frame >= sAt ? <div style={{position: 'absolute', left: 120, right: 200, top: 700, textAlign: 'center', rotate: '-12deg', scale: String(2 - st), opacity: st}}>
        <span style={{fontFamily: DISPLAY, fontSize: 84, color: '#dc2626', border: '9px solid #dc2626', borderRadius: 14, padding: '6px 22px', background: 'rgba(255,255,255,0.85)', lineHeight: 1.05}}>RELEASED<br />TOO SMALL</span>
      </div> : null}
      <SeriesBadge text={scene.badge as string} />
    </Shake>
  );
};

/* factoryShift: { pitchOnWord, payOnWord } — conveyor of white splints + a spinning shift clock; hard cut on "non-league" to a muddy
   evening pitch; £30 A WEEK on "thirty". */
const FactoryShift: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pAt = at(captions, scene.pitchOnWord, fps, dur * 0.45);
  const mAt = at(captions, scene.payOnWord, fps, dur * 0.75);
  if (frame < pAt) {
    return (
      <Camera dur={pAt} from={1.0} to={1.06}>
        <AbsoluteFill style={{background: 'linear-gradient(180deg,#78716c 0%, #a8a29e 55%, #44403c 56%, #292524 100%)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 960, height: 70, background: '#1c1917', borderTop: `8px solid ${OL}`}} />
        {new Array(7).fill(0).map((_, i) => {
          const x = ((frame * 6 + i * 170) % 1240) - 160;
          return <div key={i} style={{position: 'absolute', left: x, top: 900, width: 130, height: 56, borderRadius: 28, background: '#f8fafc', border: `5px solid ${OL}`}}><div style={{position: 'absolute', left: 20, top: 18, width: 86, height: 10, borderRadius: 5, background: '#cbd5e1'}} /></div>;
        })}
        <Boy x={300} y={900} height={300} stage="adult" pose="stand" skin={sb.character.palette.skin} rim="#fde68a" glow={0.1} mood="neutral" />
        <div style={{position: 'absolute', left: 660, top: 520, width: 220, height: 220, borderRadius: 110, background: '#fff', border: `8px solid ${OL}`}}>
          <div style={{position: 'absolute', left: 106, top: 26, width: 8, height: 84, background: OL, transformOrigin: '4px 82px', rotate: `${frame * 18}deg`}} />
        </div>
        <Tag text="FACTORY SHIFTS 🏭" a={2} y={330} size={60} color="#f8fafc" />
        <SeriesBadge text={scene.badge as string} />
      </Camera>
    );
  }
  return (
    <Camera dur={dur - pAt} from={1.05} to={1.0}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#7c2d12 0%, #c2410c 40%, #4d7c0f 41%, #3f6212 100%)'}} />
      {new Array(9).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: (i * 131) % 1000, top: 1000 + (i % 3) * 70, width: 120, height: 34, borderRadius: 17, background: '#57534e', opacity: 0.7}} />)}
      <Boy x={480} y={1180} height={330} stage="adult" pose="run" phase={frame / 3} skin={sb.character.palette.skin} rim="#fdba74" glow={0.3} mood="happy" />
      <Ball x={640 + Math.sin(frame / 4) * 20} y={1110} s={0.8} rot={frame * 20} />
      <Tag text="NON-LEAGUE" a={pAt} y={330} size={64} color="#f8fafc" />
      {frame >= mAt ? <Tag text="≈ £30 A WEEK" a={mAt} y={450} size={72} rot={2} /> : null}
      <SeriesBadge text={scene.badge as string} />
    </Camera>
  );
};

/* millionFee: { feeOnWord, recordOnWord } — counter races £0 → £1,000,000; RECORD FOR A NON-LEAGUE PLAYER. */
const MillionFee: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fAt = at(captions, scene.feeOnWord, fps, dur * 0.5);
  const rAt = at(captions, scene.recordOnWord, fps, dur * 0.75);
  const v = Math.round(interpolate(frame, [fAt - 12, fAt + 12], [0, 1000000], clamp));
  return (
    <Shake at={fAt + 12} amount={10}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #166534 0%, #052e16 80%)'}} />
      {new Array(14).fill(0).map((_, i) => {
        const y = ((frame * 6 + i * 140) % 1500) - 100;
        return <div key={i} style={{position: 'absolute', left: (i * 77) % 940, top: y, fontSize: 70, opacity: frame >= fAt ? 0.8 : 0.15, rotate: `${i * 23}deg`}}>💷</div>;
      })}
      <div style={{position: 'absolute', left: 0, right: 140, top: 700, textAlign: 'center', fontFamily: DISPLAY, fontSize: 132, color: '#facc15', WebkitTextStroke: `9px ${OL}`, paintOrder: 'stroke fill'}}>£{v.toLocaleString('en-GB')}</div>
      <Tag text="AGE 25 · WORTH?" a={2} y={330} size={60} color="#f8fafc" />
      {frame >= rAt ? <Tag text="RECORD FOR A NON-LEAGUE PLAYER" a={rAt} y={1000} size={48} rot={2} /> : null}
      <SeriesBadge text={scene.badge as string} />
    </Shake>
  );
};

/* titleCheer: { cupOnWord } — floodlit celebration, cup on "title"; silent SEND line + daily pill. */
const TitleCheer: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cAt = at(captions, scene.cupOnWord, fps, dur * 0.6);
  const cup = spring({frame: frame - cAt, fps, config: {damping: 10}});
  return (
    <Camera dur={dur} from={1.0} to={1.05}>
      <NightPitch>
        {new Array(30).fill(0).map((_, i) => {
          const y = ((frame * 5 + i * 70) % 1300) + 250;
          return <div key={i} style={{position: 'absolute', left: (i * 97) % 1000, top: y - 300, width: 16, height: 26, background: ['#facc15', '#f8fafc', '#ef4444', '#60a5fa'][i % 4], rotate: `${frame * 6 + i * 30}deg`}} />;
        })}
        <Boy x={540} y={1130} height={420} stage="adult" pose="cheer" phase={frame / 4} skin={sb.character.palette.skin} rim="#fde68a" glow={0.5} mood="happy" />
        {frame >= cAt ? <div style={{position: 'absolute', left: 470, top: 560, fontSize: 140, scale: String(cup)}}>🏆</div> : null}
      </NightPitch>
      <Tag text="THE RECORD RUN" a={2} y={330} size={60} color="#f8fafc" />
      {frame >= cAt ? <Tag text="LEAGUE CHAMPION" a={cAt} y={450} size={62} rot={2} /> : null}
      <div style={{position: 'absolute', left: 50, right: 150, top: 1110, textAlign: 'center', lineHeight: 1.45, opacity: spring({frame: frame - 8, fps, config: {damping: 14}})}}><span style={{fontFamily: BODY, fontWeight: 900, fontSize: 40, color: '#111', background: '#86efac', padding: '8px 20px', borderRadius: 14, border: `5px solid ${OL}`}}>📤 Send this to your mate who thinks he knows every player</span></div>
      <DailyPill from={20} y={1255} />
      <SeriesBadge text={scene.badge as string} />
    </Camera>
  );
};

export const STORY22_SCENES: Record<string, React.FC<SceneProps>> = {recordHook: RecordHook, elevenRow: ElevenRow, tooSmall: TooSmall, factoryShift: FactoryShift, millionFee: MillionFee, titleCheer: TitleCheer};
