import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {Captions, clamp, ease, FontFaces, Grain, inOut, lerp, localF, Particles, Scenes, Timing, Vignette, W, H, wordTime, FPS} from './lib';
import T from '../public/audio/brainfreeze_scenes.json';

const timing = T as unknown as Timing;
const C = {bg: '#040a18', ink: '#0b1730', cyan: '#3ef0ff', coral: '#ff4d6d', mint: '#5dffb0', violet: '#9b7bff', ice: '#bff6ff', warm: '#ffb36b'};
const wf = (scene: string, word: string, nth = 0) => localF(timing, scene, wordTime(timing, scene, word, nth));
const sora = 'Sora';

/* ---------- shared pieces ---------- */
const Bg: React.FC<{tint?: string; f: number}> = ({tint = C.cyan, f}) => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, #10224a 0%, ${C.ink} 38%, ${C.bg} 78%)`}}>
    <svg width={W} height={H} style={{position: 'absolute', opacity: 0.13}}>
      {new Array(28).fill(0).map((_, i) => <line key={i} x1={0} y1={i * 72 + ((f * 0.6) % 72)} x2={W} y2={i * 72 + ((f * 0.6) % 72)} stroke={tint} strokeWidth={1} />)}
      {new Array(16).fill(0).map((_, i) => <line key={'v' + i} x1={i * 72} y1={0} x2={i * 72} y2={H} stroke={tint} strokeWidth={1} />)}
    </svg>
  </AbsoluteFill>
);

const Hud: React.FC<{label: string; value: string; x: number; y: number; color?: string; delay?: number; size?: number; align?: 'left' | 'right'}> = ({label, value, x, y, color = C.cyan, delay = 0, size = 54, align = 'left'}) => {
  const f = useCurrentFrame();
  const o = lerp(f, [delay, delay + 10], [0, 1]);
  return (
    <div style={{position: 'absolute', [align === 'left' ? 'left' : 'right']: x, top: y, textAlign: align, fontFamily: sora, color, opacity: o, translate: `${(1 - o) * (align === 'left' ? -30 : 30)}px 0px`}}>
      <div style={{fontSize: 26, letterSpacing: 6, opacity: 0.8, fontWeight: 500}}>{label}</div>
      <div style={{fontSize: size, fontWeight: 800, textShadow: `0 0 24px ${color}`}}>{value}</div>
    </div>
  );
};

const Title: React.FC<{text: string; at: number; color?: string; top?: number; size?: number; sub?: string}> = ({text, at, color = '#fff', top = 250, size = 96, sub}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top, width: '100%', textAlign: 'center', fontFamily: sora, opacity: lerp(f, [at - 3, at + 7], [0, 1])}}>
      {sub && <div style={{fontSize: 30, letterSpacing: 8, color: C.cyan, fontWeight: 600, marginBottom: 8}}>{sub}</div>}
      <div style={{fontWeight: 800, fontSize: size, color, letterSpacing: 3, lineHeight: 1, scale: String(lerp(f, [at - 3, at + 9], [1.25, 1])), textShadow: `0 0 36px ${color === '#fff' ? C.cyan : color}`}}>{text}</div>
    </div>
  );
};

/* Camera that puts a point of the 1000x1000 head space at screen (cx, cy) with scale s. */
const Focus: React.FC<{fx: number; fy: number; s: number; cx?: number; cy?: number; rot?: number; children: React.ReactNode}> = ({fx, fy, s, cx = 540, cy = 790, rot = 0, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1000, height: 1000, transformOrigin: '0 0', transform: `translate(${cx}px, ${cy}px) rotate(${rot}deg) scale(${s}) translate(${-fx}px, ${-fy}px)`}}>
    {children}
  </div>
);

const HEAD = 'M300 1000 Q260 820 240 650 Q200 420 330 260 Q460 120 620 150 Q740 180 760 300 Q770 360 765 400 Q800 450 845 525 Q850 545 800 560 Q805 580 795 600 Q815 615 800 640 Q790 660 790 680 Q800 720 770 750 Q720 790 640 790 Q620 860 640 1000 Z';
const BRAIN = 'M300 520 Q285 330 440 250 Q580 190 690 280 Q745 340 732 420 Q722 470 660 482 L560 492 Q520 540 440 560 Q350 572 300 520 Z';
const CEREB = 'M340 555 Q390 540 440 560 Q460 600 420 625 Q370 635 345 605 Z';
const STEM = 'M480 495 Q520 500 528 540 L520 720 L480 720 L478 560 Q470 520 480 495 Z';
const ACA = 'M560 492 Q640 478 662 405 Q674 330 605 292 Q530 268 468 300';
const PALATE = 'M592 585 Q700 568 788 585';
const TONGUE_DOWN = 'M600 650 Q690 612 776 628 Q770 660 700 668 Q640 672 600 650 Z';
const TONGUE_UP = 'M600 640 Q690 584 780 596 Q772 640 700 652 Q640 660 600 640 Z';
const V_ROOT = 'M492 520 Q515 505 540 500';
const V1 = 'M540 500 Q640 430 700 360 Q725 320 735 285';
const V2 = 'M540 500 Q640 525 700 560 Q740 575 770 582';
const V3 = 'M540 500 Q590 600 650 660 Q700 700 748 712';

type HeadProps = {f: number; brain?: number; skull?: number; frost?: number; dilate?: number; flow?: number; pressure?: number; v2?: number; v1?: number; alarm?: number; tongue?: number; warm?: number; aca?: number; forehead?: number; sealed?: number; nerves?: number};
const Head: React.FC<HeadProps> = ({f, brain = 0.5, skull = 1, frost = 0, dilate = 0, flow = 0, pressure = 0, v2 = 0, v1 = 0, alarm = 0, tongue = 0, warm = 0, aca = 0, forehead = 0, sealed = 0, nerves = 0}) => {
  const acaW = 9 + dilate * 20;
  const crystals = new Array(16).fill(0).map((_, i) => {
    const t = i / 15;
    const x = 598 + t * 186 + (random('cx' + i) - 0.5) * 10;
    const y = 584 - Math.sin(t * Math.PI) * 15 + 6 + random('cy' + i) * 10;
    const k = Math.max(0, Math.min(1, frost * 1.6 - random('cd' + i) * 0.6));
    return {x, y, k, r: 6 + random('cr' + i) * 8};
  });
  return (
    <svg width={1000} height={1000} viewBox="0 0 1000 1000" style={{position: 'absolute', overflow: 'visible'}}>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="bigglow"><feGaussianBlur stdDeviation="14" /></filter>
        <radialGradient id="brainfill" cx="60%" cy="40%"><stop offset="0%" stopColor={C.cyan} stopOpacity={0.45} /><stop offset="100%" stopColor={C.cyan} stopOpacity={0.08} /></radialGradient>
        <radialGradient id="fh" cx="50%" cy="50%"><stop offset="0%" stopColor={C.coral} stopOpacity={0.95} /><stop offset="100%" stopColor={C.coral} stopOpacity={0} /></radialGradient>
        <radialGradient id="wm" cx="50%" cy="50%"><stop offset="0%" stopColor={C.warm} stopOpacity={0.9} /><stop offset="100%" stopColor={C.warm} stopOpacity={0} /></radialGradient>
        <clipPath id="headclip"><path d={HEAD} /></clipPath>
      </defs>
      {/* skin / skull */}
      <path d={HEAD} fill={C.cyan} fillOpacity={0.05 * skull} stroke={sealed > 0 ? interpolate(sealed, [0, 1], [0, 1]) > 0.5 ? C.coral : C.cyan : C.cyan} strokeOpacity={0.35 + 0.4 * skull} strokeWidth={3 + sealed * 7} filter={sealed > 0.3 ? 'url(#glow)' : undefined} />
      <path d="M262 600 Q230 400 340 275 Q470 150 625 175 Q730 200 742 300 Q748 360 742 410" fill="none" stroke="#cfe8ff" strokeOpacity={0.18 * skull + sealed * 0.4} strokeWidth={14} strokeLinecap="round" />
      {/* pressure rings */}
      {pressure > 0 && (
        <g clipPath="url(#headclip)">
          {[0, 1, 2, 3].map((i) => {
            const ph = ((f / 22 + i / 4) % 1);
            return <circle key={i} cx={620} cy={380} r={40 + ph * 330 * (0.6 + pressure * 0.4)} fill="none" stroke={C.coral} strokeWidth={6} opacity={pressure * (1 - ph) * 0.7} />;
          })}
        </g>
      )}
      {/* brain */}
      <g opacity={0.35 + brain * 0.65}>
        <path d={BRAIN} fill="url(#brainfill)" stroke={C.cyan} strokeWidth={4} filter="url(#glow)" />
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${340 + i * 62} ${300 + (i % 2) * 26 + Math.abs(i - 2.5) * 18} q24 50 -6 ${90 + (i % 3) * 24}`} stroke={C.cyan} strokeOpacity={0.5} strokeWidth={3} fill="none" />)}
        <path d={CEREB} fill={C.cyan} fillOpacity={0.12} stroke={C.cyan} strokeWidth={3} />
        <path d={STEM} fill={C.cyan} fillOpacity={0.1} stroke={C.cyan} strokeWidth={3} />
      </g>
      {/* nasal cavity + eye */}
      <path d="M612 470 Q700 450 770 500 Q790 540 785 572 L600 575 Z" fill={C.cyan} fillOpacity={0.04} stroke={C.cyan} strokeOpacity={0.25} strokeWidth={2} />
      <ellipse cx={728} cy={398} rx={22} ry={15} fill="none" stroke={C.cyan} strokeOpacity={0.55} strokeWidth={3} />
      <circle cx={738} cy={398} r={6} fill={C.cyan} opacity={0.6} />
      {/* anterior cerebral artery */}
      <g opacity={0.25 + aca * 0.75}>
        <path d={ACA} stroke={C.coral} strokeWidth={acaW + 14} fill="none" strokeLinecap="round" opacity={0.25 * aca} filter="url(#bigglow)" />
        <path d={ACA} stroke="#a0233d" strokeWidth={acaW} fill="none" strokeLinecap="round" />
        <path d={ACA} stroke={C.coral} strokeWidth={acaW * 0.55} fill="none" strokeLinecap="round" />
        <path d={ACA} stroke="#ffd0d8" strokeWidth={acaW * 0.5} fill="none" strokeLinecap="round" strokeDasharray="2 22" strokeDashoffset={-f * (3 + flow * 9)} opacity={0.35 + flow * 0.65} />
        <path d="M560 492 Q560 560 580 640" stroke="#a0233d" strokeWidth={10 + dilate * 6} fill="none" strokeLinecap="round" />
      </g>
      {/* trigeminal nerve */}
      <g opacity={0.2 + nerves * 0.8}>
        {[V_ROOT, V1, V2, V3].map((p, i) => <path key={i} d={p} stroke="#e8e0a0" strokeOpacity={0.55} strokeWidth={i === 0 ? 8 : 5} fill="none" strokeLinecap="round" />)}
        <ellipse cx={540} cy={500} rx={16} ry={11} fill="#e8e0a0" opacity={0.8} />
        {/* signal from palate (V2) back to the ganglion */}
        <path d={V2} stroke={C.coral} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset={1000 - v2 * 1000} pathLength={1000} filter="url(#glow)" style={{transform: 'none'}} />
        {v2 > 0.98 && <path d={V2} stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray="10 90" pathLength={1000} strokeDashoffset={f * 14} opacity={0.9} />}
        <path d={V1} stroke={C.coral} strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset={1000 - v1 * 1000} pathLength={1000} filter="url(#glow)" />
        {alarm > 0 && <circle cx={540} cy={500} r={20 + alarm * 30 + Math.sin(f / 3) * 8} fill={C.coral} opacity={alarm * 0.55} filter="url(#glow)" />}
      </g>
      {/* forehead pain glow */}
      {forehead > 0 && <circle cx={735} cy={290} r={70 + forehead * 50 + Math.sin(f / 4) * 10} fill="url(#fh)" opacity={forehead} />}
      {/* palate + tongue */}
      <path d={PALATE} stroke={frost > 0.2 ? C.ice : '#ffc2cf'} strokeWidth={8} fill="none" strokeLinecap="round" />
      {new Array(9).fill(0).map((_, i) => <path key={i} d={`M${610 + i * 20} ${582 - Math.sin((i / 8) * Math.PI) * 13} l${-6 + (i % 3) * 6} -18 m0 0 l-6 -8 m6 8 l8 -8`} stroke="#e8e0a0" strokeWidth={2} fill="none" opacity={0.35 + nerves * 0.4 + frost * 0.3} />)}
      <path d={interpolateTongue(tongue)} fill="#d76b86" fillOpacity={0.55} stroke="#ff9db2" strokeWidth={3} />
      {warm > 0 && <ellipse cx={690} cy={582} rx={90 + warm * 40} ry={36 + warm * 16} fill="url(#wm)" opacity={warm} />}
      {crystals.map((c, i) => c.k > 0 && (
        <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.k}) rotate(${i * 23 + f})`} opacity={0.9}>
          {[0, 60, 120].map((a) => <line key={a} x1={-c.r} y1={0} x2={c.r} y2={0} transform={`rotate(${a})`} stroke={C.ice} strokeWidth={2.5} strokeLinecap="round" />)}
        </g>
      ))}
      {frost > 0 && <ellipse cx={690} cy={590} rx={110} ry={34} fill={C.ice} opacity={frost * 0.22} filter="url(#bigglow)" />}
    </svg>
  );
};
const interpolateTongue = (t: number) => {
  const a = TONGUE_DOWN.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const b = TONGUE_UP.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const v = a.map((x, i) => x + (b[i] - x) * t);
  let k = 0;
  return TONGUE_DOWN.replace(/-?\d+(\.\d+)?/g, () => String(Math.round(v[k++] * 10) / 10));
};

/* Ice-cream cone: stylised. */
const Cone: React.FC<{x: number; y: number; s?: number; rot?: number; bite?: number}> = ({x, y, s = 1, rot = 0, bite = 0}) => (
  <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M-70 0 L0 230 L70 0 Z" fill="#c98a3c" stroke="#ffcf87" strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={-60 + i * 34} y1={0} x2={-10 + i * 12} y2={170} stroke="#8a5a20" strokeWidth={3} />)}
      <circle cx={-34} cy={-26} r={52} fill="#e9fbff" />
      <circle cx={34} cy={-30} r={50} fill="#c9f4ff" />
      <circle cx={0} cy={-78} r={54} fill="#f2feff" />
      <path d="M-50 -60 q20 -20 40 -6" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.8} />
    </g>
  </svg>
);

/* ---------- scenes ---------- */
const Hook: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const touch = wf('hook', 'pain');
  const hit = lerp(f, [touch - 6, touch], [0, 1], inOut);
  const scanY = 160 + ((f * 18) % 520);
  return (
    <AbsoluteFill>
      <Bg f={f} />
      <Focus fx={lerp(f, [0, d], [520, 540])} fy={400} s={lerp(f, [0, d], [1.9, 2.15], inOut)} cy={820}>
        <Head f={f} brain={1} skull={0.4} />
        <svg width={1000} height={1000} style={{position: 'absolute', overflow: 'visible'}}>
          <line x1={300} y1={scanY} x2={760} y2={scanY} stroke={C.mint} strokeWidth={2} opacity={0.6} />
          {/* probe */}
          <g transform={`translate(${lerp(f, [0, touch], [900, 640], inOut)} ${lerp(f, [0, touch], [120, 300], inOut)})`}>
            <line x1={0} y1={0} x2={220} y2={-160} stroke="#dfe8f5" strokeWidth={5} />
            <circle cx={0} cy={0} r={5} fill="#fff" />
          </g>
          {hit > 0.9 && [0, 1].map((i) => <circle key={i} cx={640} cy={300} r={10 + ((f - touch + i * 6) % 18) * 4} fill="none" stroke={C.cyan} strokeWidth={2} opacity={0.7 - ((f - touch + i * 6) % 18) / 26} />)}
        </svg>
      </Focus>
      <div style={{position: 'absolute', left: 70, top: 210, fontFamily: sora}}>
        <div style={{fontSize: 28, letterSpacing: 6, color: C.cyan, fontWeight: 600}}>PAIN RECEPTORS IN BRAIN TISSUE</div>
        <div style={{fontSize: 190, lineHeight: 1, fontWeight: 800, color: C.coral, textShadow: `0 0 40px ${C.coral}`, scale: String(1 + 0.06 * Math.sin(f / 3))}}>0</div>
      </div>
      <Hud label="SIGNAL" value={hit > 0.9 ? 'NONE' : 'SCANNING'} x={70} y={1170} color={hit > 0.9 ? C.mint : C.cyan} size={46} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};

const Scream: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const ice = wf('scream', 'ice');
  const sc = wf('scream', 'scream');
  const fly = lerp(f, [0, ice], [0, 1], inOut);
  const pain = lerp(f, [sc - 4, sc + 4], [0, 1]);
  const shake = pain > 0 ? Math.sin(f * 2.3) * 10 * (1 - lerp(f, [sc, sc + 20], [0, 1])) : 0;
  return (
    <AbsoluteFill>
      <Bg f={f} tint={pain > 0.5 ? C.coral : C.cyan} />
      <div style={{position: 'absolute', inset: 0, translate: `${shake}px ${shake * 0.4}px`}}>
        <Focus fx={600} fy={500} s={lerp(f, [sc - 3, sc + 6], [1.25, 1.45])} cy={760}>
          <Head f={f} brain={0.6 + pain * 0.4} frost={lerp(f, [ice, ice + 10], [0, 0.7])} forehead={pain} />
        </Focus>
      </div>
      <Cone x={lerp(f, [0, ice], [1150, 870], inOut)} y={lerp(f, [0, ice], [1350, 930], inOut)} s={1.25} rot={lerp(f, [0, ice], [30, -38])} bite={lerp(f, [ice, ice + 4], [0, 1])} />
      {pain > 0 && (
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {new Array(10).fill(0).map((_, i) => {
            const a = -Math.PI / 2 + (i - 4.5) * 0.28;
            const r0 = 160, r1 = 160 + pain * (120 + (i % 3) * 50);
            return <line key={i} x1={760 + Math.cos(a) * r0} y1={470 + Math.sin(a) * r0} x2={760 + Math.cos(a) * r1} y2={470 + Math.sin(a) * r1} stroke={C.coral} strokeWidth={10} strokeLinecap="round" opacity={0.9} />;
          })}
        </svg>
      )}
      {pain > 0 && <AbsoluteFill style={{background: C.coral, opacity: lerp(f, [sc, sc + 8], [0.35, 0]), mixBlendMode: 'screen'}} />}
      <Hud label="PAIN" value={pain > 0.5 ? 'SPIKE' : '—'} x={70} y={230} color={C.coral} delay={sc - 2} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

const Marker: React.FC<{x: number; y: number; color: string; label: string; sub: string; o: number; icon: 'snow' | 'bolt'; f: number}> = ({x, y, color, label, sub, o, icon, f}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: o, scale: String(0.7 + o * 0.3), fontFamily: sora}}>
    <div style={{position: 'absolute', left: -38, top: -38, width: 76, height: 76, borderRadius: 38, border: `5px solid ${color}`, boxShadow: `0 0 30px ${color}`, background: 'rgba(4,10,24,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: 40, fontWeight: 800, rotate: icon === 'snow' ? `${f * 2}deg` : '0deg'}}>{icon === 'snow' ? '✻' : '!'}</div>
    <div style={{position: 'absolute', left: -260, top: -40, width: 200, textAlign: 'right', color}}>
      <div style={{fontSize: 24, letterSpacing: 5, fontWeight: 600, opacity: 0.85}}>{sub}</div>
      <div style={{fontSize: 52, fontWeight: 800, textShadow: `0 0 20px ${color}`}}>{label}</div>
    </div>
  </div>
);

const Gap: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const cold = wf('gap', 'cold');
  const pain = wf('gap', 'pain');
  const fy = lerp(f, [0, cold + 6, pain - 4, pain + 12], [560, 600, 600, 380], inOut);
  const s = 1.5;
  const toScreen = (x: number, y: number) => [540 + (x - 640) * s, 790 + (y - fy) * s];
  const [mx, my] = toScreen(690, 585);
  const [px, py] = toScreen(735, 290);
  const q = lerp(f, [pain + 8, pain + 18], [0, 1]);
  return (
    <AbsoluteFill>
      <Bg f={f} />
      <Focus fx={640} fy={fy} s={s}>
        <Head f={f} brain={0.5} frost={0.8} forehead={lerp(f, [pain - 2, pain + 8], [0, 0.9])} />
      </Focus>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <line x1={mx} y1={my} x2={px} y2={py} stroke="#fff" strokeWidth={4} strokeDasharray="10 14" strokeDashoffset={-f * 2} opacity={q * 0.8} />
      </svg>
      <Marker x={mx} y={my} color={C.ice} label="COLD" sub="SOURCE" o={lerp(f, [cold - 3, cold + 6], [0, 1])} icon="snow" f={f} />
      <Marker x={px} y={py} color={C.coral} label="PAIN" sub="FELT HERE" o={lerp(f, [pain - 3, pain + 6], [0, 1])} icon="bolt" f={f} />
      <div style={{position: 'absolute', left: (mx + px) / 2 + 40, top: (my + py) / 2 - 70, fontFamily: sora, fontWeight: 800, fontSize: 130, color: '#fff', opacity: q, scale: String(1 + 0.08 * Math.sin(f / 4)), textShadow: `0 0 30px ${C.cyan}`}}>?</div>
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

const Palate: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const here = wf('palate', 'here');
  const chill = wf('palate', 'chills');
  const s = lerp(f, [0, here + 4, d], [1.3, 2.6, 3.4], inOut);
  const frost = lerp(f, [chill - 4, chill + 24], [0, 1]);
  return (
    <AbsoluteFill>
      <Bg f={f} tint={C.ice} />
      <Focus fx={lerp(f, [0, here + 4], [600, 690])} fy={lerp(f, [0, here + 4], [520, 590])} s={s} cy={800}>
        <Head f={f} brain={0.35} skull={0.6} frost={frost} nerves={0.6} aca={0.2} />
      </Focus>
      <Particles n={40} color={C.ice} seed="frost" size={[2, 5]} speed={0.5} dir={[0.3, -1]} area={[200, 500, 700, 700]} opacity={frost * 0.7} />
      <Hud label="LOCATION" value="ROOF OF MOUTH" x={70} y={230} color={C.ice} delay={here - 2} size={48} />
      <div style={{position: 'absolute', left: 70, top: 380, fontFamily: sora, opacity: lerp(f, [chill - 6, chill + 4], [0, 1])}}>
        <div style={{fontSize: 26, letterSpacing: 6, color: C.ice, fontWeight: 600}}>TISSUE TEMPERATURE</div>
        <div style={{marginTop: 10, width: 420, height: 26, borderRadius: 13, border: `3px solid ${C.ice}`, overflow: 'hidden'}}>
          <div style={{width: `${100 - frost * 78}%`, height: '100%', background: `linear-gradient(90deg, ${C.ice}, ${frost > 0.5 ? C.cyan : C.warm})`}} />
        </div>
        <div style={{fontSize: 44, fontWeight: 800, color: C.ice, marginTop: 6}}>DROPPING ↓</div>
      </div>
      <Vignette strength={0.75} />
    </AbsoluteFill>
  );
};

const Artery: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const artery = wf('artery', 'artery');
  const widens = wf('artery', 'widens');
  const rush = wf('artery', 'rushing');
  const dil = lerp(f, [widens - 4, widens + 14], [0, 1], inOut);
  const flow = lerp(f, [rush - 4, rush + 8], [0.2, 1]);
  const fx = lerp(f, [0, artery + 6], [690, 610], inOut);
  const fy = lerp(f, [0, artery + 6], [590, 400], inOut);
  const s = lerp(f, [0, artery + 6, d], [3.2, 2.2, 2.45], inOut);
  const ring = 50 + dil * 46;
  return (
    <AbsoluteFill>
      <Bg f={f} tint={C.coral} />
      <Focus fx={fx} fy={fy} s={s} cy={830}>
        <Head f={f} brain={0.45} skull={0.4} frost={lerp(f, [0, 30], [1, 0.6])} aca={lerp(f, [artery - 8, artery + 4], [0.2, 1])} dilate={dil} flow={flow} />
      </Focus>
      <Particles n={36} color={C.warm} seed="warmb" size={[4, 9]} speed={1.2 + flow} dir={[0.4, -1]} area={[300, 500, 600, 700]} opacity={flow * 0.55} />
      <Hud label="ANTERIOR CEREBRAL ARTERY" value={dil > 0.5 ? 'WIDENING' : 'NORMAL'} x={70} y={220} color={dil > 0.5 ? C.coral : C.cyan} delay={artery - 4} size={50} />
      {/* cross-section inset */}
      <div style={{position: 'absolute', right: 60, top: 380, width: 260, height: 260, borderRadius: 24, border: `3px solid ${C.coral}`, background: 'rgba(4,10,24,0.8)', opacity: lerp(f, [widens - 8, widens], [0, 1])}}>
        <svg width={260} height={220}>
          <circle cx={130} cy={110} r={ring + 12} fill="#a0233d" />
          <circle cx={130} cy={110} r={ring} fill={C.coral} />
          {new Array(8).fill(0).map((_, i) => {
            const a = i * 0.8 + f / 10;
            return <ellipse key={i} cx={130 + Math.cos(a) * ring * 0.55} cy={110 + Math.sin(a) * ring * 0.55} rx={11} ry={6} fill="#ffd0d8" opacity={0.9} />;
          })}
        </svg>
        <div style={{textAlign: 'center', fontFamily: sora, fontSize: 24, fontWeight: 700, color: C.coral, letterSpacing: 3, marginTop: -6}}>DIAMETER {dil > 0.5 ? '↑' : '—'}</div>
      </div>
      <Hud label="WARM BLOOD FLOW" value="↑ RUSHING IN" x={70} y={1170} color={C.warm} delay={rush - 3} size={46} />
      <Vignette strength={0.75} />
    </AbsoluteFill>
  );
};

const Gauge: React.FC<{v: number; f: number}> = ({v, f}) => {
  const a = -Math.PI + v * Math.PI * 0.85 + Math.sin(f / 2) * 0.02 * v;
  return (
    <svg width={420} height={250}>
      <path d="M30 220 A180 180 0 0 1 390 220" stroke="#25365e" strokeWidth={26} fill="none" />
      <path d="M30 220 A180 180 0 0 1 390 220" stroke={C.coral} strokeWidth={26} fill="none" strokeDasharray={`${v * 0.85 * 565} 600`} style={{filter: `drop-shadow(0 0 12px ${C.coral})`}} />
      <line x1={210} y1={220} x2={210 + Math.cos(a) * 160} y2={220 + Math.sin(a) * 160} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
      <circle cx={210} cy={220} r={16} fill="#fff" />
    </svg>
  );
};

const Pressure: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const sealed = wf('pressure', 'sealed');
  const pr = wf('pressure', 'pressure');
  const seal = lerp(f, [sealed - 4, sealed + 8], [0, 1]);
  const p = lerp(f, [wf('pressure', 'extra') - 4, pr + 10], [0, 1], inOut);
  return (
    <AbsoluteFill>
      <Bg f={f} tint={C.coral} />
      <Focus fx={540} fy={500} s={lerp(f, [0, d], [1.25, 1.12], inOut)} cy={850}>
        <Head f={f} brain={0.5} skull={1} sealed={seal} pressure={p} aca={1} dilate={1} flow={1} />
      </Focus>
      <Hud label="SKULL" value="SEALED" x={70} y={220} color={C.cyan} delay={sealed - 3} />
      <div style={{position: 'absolute', right: 50, top: 200, textAlign: 'center', fontFamily: sora, opacity: lerp(f, [wf('pressure', 'extra') - 8, wf('pressure', 'extra')], [0, 1])}}>
        <Gauge v={p} f={f} />
        <div style={{fontSize: 28, letterSpacing: 5, fontWeight: 700, color: C.coral, marginTop: -10}}>PRESSURE</div>
      </div>
      <Vignette strength={0.75} />
    </AbsoluteFill>
  );
};

const Study: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const widened = wf('study', 'widened');
  const narrowed = wf('study', 'narrowed');
  const prog = lerp(f, [8, narrowed + 18], [0, 1], (x) => x);
  const curve = (t: number, lag: number) => {
    const up = interpolate(t, [0.15 + lag, 0.45 + lag], [0, 1], {...clamp, easing: ease});
    const dn = interpolate(t, [0.68 + lag, 0.92 + lag], [0, 1], {...clamp, easing: ease});
    return up * (1 - dn);
  };
  const gx = 110, gy = 760, gw = 860, gh = 380;
  const pts = (lag: number) => new Array(80).fill(0).map((_, i) => i / 79).filter((t) => t <= prog).map((t) => `${gx + t * gw},${gy + gh - 30 - curve(t, lag) * (gh - 80)}`).join(' ');
  const head = (lag: number) => {const t = prog; return [gx + t * gw, gy + gh - 30 - curve(t, lag) * (gh - 80)];};
  const [ax, ay] = head(0), [px, py] = head(0.03);
  return (
    <AbsoluteFill>
      <Bg f={f} />
      <div style={{position: 'absolute', top: 220, width: '100%', textAlign: 'center', fontFamily: sora, opacity: lerp(f, [0, 10], [0, 1])}}>
        <div style={{fontSize: 30, letterSpacing: 8, color: C.cyan, fontWeight: 600}}>LAB TEST · 2012</div>
        <div style={{fontSize: 62, fontWeight: 800, color: '#fff'}}>13 VOLUNTEERS · ICE WATER</div>
      </div>
      {/* volunteers */}
      <svg width={W} height={200} style={{position: 'absolute', top: 400}}>
        {new Array(13).fill(0).map((_, i) => {
          const x = 90 + i * 75; const o = lerp(f, [4 + i * 1.5, 10 + i * 1.5], [0, 1]);
          const hurt = curve(prog, 0.03) > 0.5;
          return (
            <g key={i} opacity={o} transform={`translate(${x} 60)`}>
              <circle cx={0} cy={0} r={22} fill={hurt ? C.coral : C.cyan} opacity={0.85} />
              <path d="M-30 70 Q0 20 30 70" fill={hurt ? C.coral : C.cyan} opacity={0.5} />
              <line x1={14} y1={4} x2={34} y2={-40} stroke={C.ice} strokeWidth={4} />
            </g>
          );
        })}
      </svg>
      {/* graph */}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <rect x={gx - 20} y={gy - 30} width={gw + 40} height={gh + 50} rx={24} fill="rgba(4,10,24,0.75)" stroke="#25365e" strokeWidth={3} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={gx} y1={gy + 30 + i * 100} x2={gx + gw} y2={gy + 30 + i * 100} stroke="#25365e" strokeWidth={2} />)}
        <polyline points={pts(0)} fill="none" stroke={C.cyan} strokeWidth={8} strokeLinejoin="round" style={{filter: `drop-shadow(0 0 10px ${C.cyan})`}} />
        <polyline points={pts(0.03)} fill="none" stroke={C.coral} strokeWidth={8} strokeLinejoin="round" strokeDasharray="18 10" style={{filter: `drop-shadow(0 0 10px ${C.coral})`}} />
        <circle cx={ax} cy={ay} r={12} fill={C.cyan} />
        <circle cx={px} cy={py} r={12} fill={C.coral} />
      </svg>
      <div style={{position: 'absolute', left: gx, top: gy - 100, fontFamily: sora, fontSize: 32, fontWeight: 700, display: 'flex', gap: 40}}>
        <span style={{color: C.cyan}}>━ ARTERY WIDTH</span>
        <span style={{color: C.coral}}>┅ PAIN</span>
      </div>
      <Hud label="ARTERY" value={f < narrowed ? (f > widened - 4 ? 'WIDE → PAIN' : 'NORMAL') : 'NARROW → RELIEF'} x={70} y={1170} color={f < narrowed ? C.coral : C.mint} size={44} delay={widened - 6} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};

const Nerve: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const tri = wf('nerve', 'trigeminal');
  const alarm = wf('nerve', 'alarm');
  const v2 = lerp(f, [tri - 4, tri + 22], [0, 1], inOut);
  return (
    <AbsoluteFill>
      <Bg f={f} tint="#e8e0a0" />
      <Focus fx={lerp(f, [0, d], [640, 610])} fy={lerp(f, [0, d], [560, 520])} s={lerp(f, [0, d], [1.9, 2.25], inOut)} cy={800}>
        <Head f={f} brain={0.35} skull={0.6} frost={0.5} nerves={lerp(f, [tri - 10, tri], [0.3, 1])} v2={v2} alarm={lerp(f, [alarm - 4, alarm + 6], [0, 1])} />
      </Focus>
      <Hud label="CRANIAL NERVE V" value="TRIGEMINAL" x={70} y={220} color="#f3eaa8" delay={tri - 4} />
      <Hud label="STATUS" value="ALARM" x={70} y={1170} color={C.coral} delay={alarm - 3} size={48} />
      <Vignette strength={0.75} />
    </AbsoluteFill>
  );
};

const Referred: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const top = wf('referred', 'top');
  const fore = wf('referred', 'forehead');
  const wrong = wf('referred', 'wrong');
  const v1 = lerp(f, [top - 4, fore + 6], [0, 1], inOut);
  const pin = lerp(f, [wrong - 6, wrong + 2], [0, 1], ease);
  const s = 1.7, fx = 640, fy = lerp(f, [0, d], [470, 430]);
  const sx = 540 + (735 - fx) * s, sy = 800 + (290 - fy) * s;
  return (
    <AbsoluteFill>
      <Bg f={f} tint={C.coral} />
      <Focus fx={fx} fy={fy} s={s}>
        <Head f={f} brain={0.35} skull={0.7} frost={0.5} nerves={1} v2={1} v1={v1} alarm={0.6} forehead={lerp(f, [fore - 2, fore + 10], [0, 1])} />
      </Focus>
      {/* misplaced pin */}
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
        <g transform={`translate(${sx} ${sy - 30 - (1 - pin) * 300})`} opacity={pin}>
          <path d="M0 0 C-40 -50 -40 -110 0 -110 C40 -110 40 -50 0 0 Z" fill={C.coral} stroke="#fff" strokeWidth={4} />
          <circle cx={0} cy={-72} r={14} fill="#fff" />
        </g>
      </svg>
      <div style={{position: 'absolute', right: 60, top: 520, fontFamily: sora, fontWeight: 800, fontSize: 58, color: C.coral, border: `6px solid ${C.coral}`, padding: '6px 18px', borderRadius: 12, rotate: '-8deg', opacity: lerp(f, [wrong + 2, wrong + 6], [0, 1]), scale: String(lerp(f, [wrong + 2, wrong + 8], [1.6, 1]))}}>WRONG SPOT</div>
      <Title text="REFERRED PAIN" at={top} color={C.coral} top={220} size={80} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

const Payoff: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const guard = wf('payoff', 'guarding');
  const press = wf('payoff', 'press');
  const fades = wf('payoff', 'fades');
  const t = lerp(f, [press - 2, press + 14], [0, 1], inOut);
  const warm = lerp(f, [press + 8, fades], [0, 1]);
  const zoom = lerp(f, [press - 10, press + 6], [0, 1], inOut);
  const shield = lerp(f, [guard - 4, guard + 8], [0, 1]) * (1 - zoom);
  return (
    <AbsoluteFill>
      <Bg f={f} tint={zoom > 0.5 ? C.warm : C.cyan} />
      <Focus fx={interpolate(zoom, [0, 1], [560, 690])} fy={interpolate(zoom, [0, 1], [430, 590])} s={interpolate(zoom, [0, 1], [1.4, 2.9])} cy={800}>
        <Head f={f} brain={0.6 + shield * 0.4} skull={0.7} frost={1 - warm} tongue={t} warm={warm} aca={1 - warm * 0.6} dilate={1 - warm} flow={1 - warm} forehead={(1 - warm) * (1 - shield) * 0.6} />
        <svg width={1000} height={1000} style={{position: 'absolute', overflow: 'visible', opacity: shield}}>
          <path d={BRAIN} fill="none" stroke={C.warm} strokeWidth={10} transform="translate(515 405) scale(1.12) translate(-515 -405)" style={{filter: `drop-shadow(0 0 20px ${C.warm})`}} strokeDasharray="30 12" strokeDashoffset={-f * 3} />
        </svg>
      </Focus>
      <div style={{opacity: 1 - zoom}}><Hud label="BRAIN" value="KEPT WARM" x={70} y={220} color={C.warm} delay={guard - 3} size={50} /></div>
      <div style={{position: 'absolute', left: 70, top: 220, fontFamily: sora, opacity: zoom}}>
        <div>
          <div style={{fontSize: 26, letterSpacing: 6, color: C.warm, fontWeight: 600}}>TONGUE ON PALATE</div>
          <div style={{fontSize: 54, fontWeight: 800, color: C.warm, textShadow: `0 0 24px ${C.warm}`}}>WARMING ↑</div>
        </div>
      </div>
      <Hud label="USUALLY LASTS" value="SECONDS → 2 MIN" x={70} y={1170} color={C.mint} delay={fades - 4} size={46} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

const Cta: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Bg f={f} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {[...Array(9)].map((_, i) => {
          const a = (i / 9) * Math.PI * 2 + f / 60;
          return <line key={i} x1={540} y1={720} x2={540 + Math.cos(a) * 230} y2={720 + Math.sin(a) * 230} stroke={C.cyan} strokeWidth={4} opacity={0.6} />;
        })}
        <circle cx={540} cy={720} r={70 + 6 * Math.sin(f / 6)} fill={C.cyan} opacity={0.9} style={{filter: `drop-shadow(0 0 40px ${C.cyan})`}} />
      </svg>
      <div style={{position: 'absolute', top: 240, width: '100%', textAlign: 'center', fontFamily: sora, fontWeight: 700, fontSize: 40, color: '#dff', opacity: lerp(f, [0, 10], [0, 1])}}>Frequent headaches? Talk to a doctor.</div>
      <div style={{position: 'absolute', top: 1010, width: '100%', textAlign: 'center', fontFamily: sora, fontWeight: 800, fontSize: 96, color: '#fff', letterSpacing: 2, opacity: lerp(f, [4, 16], [0, 1])}}>WonderSynapse</div>
      <div style={{position: 'absolute', top: 1140, width: '100%', textAlign: 'center', fontFamily: sora, fontWeight: 500, fontSize: 40, color: C.cyan, letterSpacing: 6, opacity: lerp(f, [8, 20], [0, 1])}}>INSIDE THE HUMAN BODY</div>
      <Particles n={60} color={C.cyan} seed="cta" speed={0.5} opacity={0.5} />
    </AbsoluteFill>
  );
};

export const BrainFreezeVideo: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}}>
    <FontFaces />
    <Scenes timing={timing} xfade={6} map={{hook: Hook, scream: Scream, gap: Gap, palate: Palate, artery: Artery, pressure: Pressure, study: Study, nerve: Nerve, referred: Referred, payoff: Payoff, cta: Cta}} />
    <Captions words={timing.words} top={1380} active="#ffffff" inactive="#9fb3d1" maxWords={3}
      emph={['pain', 'scream', 'cold', 'forehead', 'artery', 'widens', 'warm', 'skull', 'pressure', 'widened', 'narrowed', 'trigeminal', 'alarm', 'wrong', 'tongue', 'doctor', 'brain']} emphColor={C.cyan}
      style={{fontFamily: sora, fontWeight: 800, fontSize: 76, lineHeight: 1.1, textShadow: '0 4px 0 #000, 0 0 18px rgba(0,0,0,0.9)', textTransform: 'uppercase'}} />
    <Grain opacity={0.05} />
  </AbsoluteFill>
);
export const brainFreezeFrames = Math.ceil(timing.duration * FPS);
