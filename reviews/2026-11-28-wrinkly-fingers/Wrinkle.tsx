import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {Captions, clamp, ease, FontFaces, Grain, inOut, lerp, localF, Particles, Scenes, Timing, Vignette, W, H, wordTime, FPS} from './lib';
import T from '../public/audio/wrinkle_scenes.json';

const timing = T as unknown as Timing;
const C = {bg: '#040a18', ink: '#0b1730', cyan: '#3ef0ff', coral: '#ff4d6d', mint: '#5dffb0', violet: '#9b7bff', water: '#6fd8ff', nerve: '#ffe27a', skin: '#ffb3c1', warm: '#ffb36b'};
const wf = (scene: string, word: string, nth = 0) => localF(timing, scene, wordTime(timing, scene, word, nth));
const sora = 'Sora';

/* ---------- shared pieces (Bg / Hud / Focus pattern reused from the 27 Nov kit) ---------- */
const Bg: React.FC<{tint?: string; f: number; water?: number}> = ({tint = C.cyan, f, water = 0}) => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #12285a 0%, ${C.ink} 40%, ${C.bg} 80%)`}}>
    <svg width={W} height={H} style={{position: 'absolute', opacity: 0.12}}>
      {new Array(28).fill(0).map((_, i) => <line key={i} x1={0} y1={i * 72 + ((f * 0.6) % 72)} x2={W} y2={i * 72 + ((f * 0.6) % 72)} stroke={tint} strokeWidth={1} />)}
      {new Array(16).fill(0).map((_, i) => <line key={'v' + i} x1={i * 72} y1={0} x2={i * 72} y2={H} stroke={tint} strokeWidth={1} />)}
    </svg>
    {water > 0 && (
      <svg width={W} height={H} style={{position: 'absolute', opacity: water * 0.22}}>
        {new Array(9).fill(0).map((_, i) => (
          <path key={i} d={`M0 ${200 + i * 190 + Math.sin(f / 20 + i) * 20} Q270 ${160 + i * 190 + Math.sin(f / 15 + i) * 40} 540 ${200 + i * 190} T1080 ${200 + i * 190 + Math.cos(f / 18 + i) * 20}`} stroke={C.water} strokeWidth={3} fill="none" />
        ))}
      </svg>
    )}
  </AbsoluteFill>
);

const Hud: React.FC<{label: string; value: string; x: number; y: number; color?: string; delay?: number; size?: number; align?: 'left' | 'right'}> = ({label, value, x, y, color = C.cyan, delay = 0, size = 56, align = 'left'}) => {
  const f = useCurrentFrame();
  const o = lerp(f, [delay, delay + 10], [0, 1]);
  return (
    <div style={{position: 'absolute', [align === 'left' ? 'left' : 'right']: x, top: y, textAlign: align, fontFamily: sora, color, opacity: o, translate: `${(1 - o) * (align === 'left' ? -30 : 30)}px 0px`}}>
      <div style={{fontSize: 34, letterSpacing: 5, opacity: 0.85, fontWeight: 600}}>{label}</div>
      <div style={{fontSize: size, fontWeight: 800, textShadow: `0 0 24px ${color}`, lineHeight: 1.05}}>{value}</div>
    </div>
  );
};

const Focus: React.FC<{fx: number; fy: number; s: number; cx?: number; cy?: number; rot?: number; children: React.ReactNode}> = ({fx, fy, s, cx = 540, cy = 800, rot = 0, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1000, height: 1000, transformOrigin: '0 0', transform: `translate(${cx}px, ${cy}px) rotate(${rot}deg) scale(${s}) translate(${-fx}px, ${-fy}px)`}}>
    {children}
  </div>
);

/* ---------- fingertip cross-section (side view, pad facing down, tip to the right) ---------- */
const TETHERS = [250, 316, 382, 448, 514, 580, 646];
const wave = (x: number, wr: number) => {
  if (x < 200 || x > 790) return 0;
  const taper = Math.min(1, (x - 200) / 40, (790 - x) / 40);
  const ph = ((x - 250) / 66) * Math.PI * 2;
  return wr * 11 * (1 + Math.cos(ph)) * taper; // valleys at tether points
};
const contour = (inset: number, wr: number, shrink: number) => {
  const pts: [number, number][] = [];
  for (let x = 40; x <= 720; x += 10) pts.push([x, 380 + inset]);
  for (let a = -90; a <= 90; a += 6) {
    const r = (a * Math.PI) / 180;
    const x = 720 + (170 - inset) * Math.cos(r);
    let y = 510 + (130 - inset) * Math.sin(r);
    if (Math.sin(r) > 0) y -= (shrink * 14 + wave(x, wr)) * Math.sin(r);
    pts.push([x, y]);
  }
  for (let x = 720; x >= 40; x -= 6) pts.push([x, 640 - inset - shrink * 14 - wave(x, wr)]);
  return 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L') + ' Z';
};
const bottomY = (x: number, inset: number, wr: number, shrink: number) => 640 - inset - shrink * 14 - wave(x, wr);

const ARTERY = 'M40 594 Q300 588 520 590 Q650 592 760 560';
const NERVE = 'M40 566 Q300 560 520 564 Q650 566 770 528';
const NAIL = 'M470 374 Q650 352 820 398 L826 412 Q650 370 470 390 Z';
const BONE = 'M40 456 L560 452 Q650 450 690 472 Q725 494 700 522 Q660 540 560 536 L40 540 Z';

type TipProps = {f: number; wr?: number; shrink?: number; constrict?: number; flow?: number; pulse?: number; cut?: number; water?: number; ducts?: number; drip?: number; tether?: number; cells?: number; sense?: number; layers?: number};
const Fingertip: React.FC<TipProps> = ({f, wr = 0, shrink = 0, constrict = 0, flow = 0.4, pulse = 0, cut = 0, water = 0, ducts = 0, drip = 0, tether = 0, cells = 0, sense = 0, layers = 1}) => {
  const aw = 16 - constrict * 9;
  return (
    <svg width={1000} height={1000} viewBox="0 0 1000 1000" style={{position: 'absolute', overflow: 'visible'}}>
      <defs>
        <filter id="tglow"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="tbig"><feGaussianBlur stdDeviation="12" /></filter>
        <linearGradient id="pulp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.skin} stopOpacity={0.1} /><stop offset="100%" stopColor={C.skin} stopOpacity={0.28} /></linearGradient>
        <clipPath id="tipclip"><path d={contour(0, wr, shrink)} /></clipPath>
      </defs>
      {/* bath water around the pad */}
      {water > 0 && (
        <g opacity={water}>
          <rect x={-600} y={470} width={2200} height={900} fill={C.water} opacity={0.1} />
          <path d={`M-600 ${470 + Math.sin(f / 9) * 6} Q-300 ${455 + Math.sin(f / 7) * 8} 0 ${470} T600 ${470 + Math.sin(f / 8) * 6} T1200 470 T1600 470`} stroke={C.water} strokeWidth={4} fill="none" opacity={0.7} />
          {new Array(14).fill(0).map((_, i) => {
            const x = random('bx' + i) * 1100 - 50;
            const y = 980 - ((f * (1.2 + random('bs' + i)) + random('by' + i) * 500) % 500);
            return <circle key={i} cx={x} cy={y} r={3 + random('br' + i) * 6} fill="none" stroke={C.water} strokeWidth={2} opacity={0.6} />;
          })}
        </g>
      )}
      {/* skin layers */}
      <path d={contour(0, wr, shrink)} fill={C.skin} fillOpacity={0.12} stroke={C.skin} strokeWidth={4} filter="url(#tglow)" />
      <path d={contour(16, wr, shrink)} fill="url(#pulp)" stroke={C.skin} strokeOpacity={0.45 * layers} strokeWidth={2} strokeDasharray="6 6" />
      <path d={contour(34, wr * 0.85, shrink)} fill="none" stroke={C.cyan} strokeOpacity={0.25 * layers} strokeWidth={2} />
      {/* epidermis cells (cell-level zoom) */}
      {cells > 0 && (
        <g clipPath="url(#tipclip)" opacity={cells}>
          {new Array(60).fill(0).map((_, i) => {
            const x = 250 + i * 8.2;
            return [0, 1].map((row) => {
              const yb = bottomY(x, 0, wr, shrink);
              return <rect key={i + '-' + row} x={x - 3.6 + (row ? 4 : 0)} y={yb - 7 - row * 7} width={7.2} height={6} rx={2.5} fill={C.skin} fillOpacity={0.35} stroke={C.skin} strokeOpacity={0.8} strokeWidth={0.8} />;
            });
          })}
        </g>
      )}
      {/* bone + nail */}
      <path d={BONE} fill="#e9f2ff" fillOpacity={0.14} stroke="#e9f2ff" strokeOpacity={0.6} strokeWidth={3} />
      <path d={NAIL} fill="#e9f2ff" fillOpacity={0.35} stroke="#fff" strokeOpacity={0.8} strokeWidth={2} />
      {/* tethers: fibres anchoring skin to bone */}
      {TETHERS.map((x, i) => {
        const y2 = bottomY(x, 18, wr, shrink);
        return <line key={i} x1={x} y1={538} x2={x} y2={y2} stroke={tether > 0.3 ? C.mint : '#cfe8ff'} strokeOpacity={0.25 + tether * 0.7} strokeWidth={2 + tether * 3} strokeDasharray={tether > 0.3 ? undefined : '4 6'} filter={tether > 0.3 ? 'url(#tglow)' : undefined} />;
      })}
      {/* artery + arterioles */}
      <g>
        <path d={ARTERY} stroke={C.coral} strokeWidth={aw + 14} fill="none" strokeLinecap="round" opacity={0.18} filter="url(#tbig)" />
        <path d={ARTERY} stroke="#a0233d" strokeWidth={aw} fill="none" strokeLinecap="round" />
        <path d={ARTERY} stroke={C.coral} strokeWidth={aw * 0.55} fill="none" strokeLinecap="round" />
        <path d={ARTERY} stroke="#ffd0d8" strokeWidth={aw * 0.45} fill="none" strokeLinecap="round" strokeDasharray="2 20" strokeDashoffset={-f * (2 + flow * 8)} opacity={0.3 + flow * 0.6} />
        {[290, 390, 490, 590].map((x, i) => {
          const yb = bottomY(x + 8, 22, wr, shrink);
          return <path key={i} d={`M${x} 590 Q${x + 14} ${(590 + yb) / 2} ${x + 6} ${yb}`} stroke={C.coral} strokeWidth={Math.max(1.5, 6 - constrict * 4)} fill="none" strokeLinecap="round" opacity={0.85} />;
        })}
      </g>
      {/* nerve */}
      <g>
        <path d={NERVE} stroke={C.nerve} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.55} strokeDasharray={cut > 0 ? '150 30 2000' : undefined} />
        {[250, 350, 450, 550, 650].map((x, i) => {
          const yb = bottomY(x - 6, 18, wr, shrink);
          return <path key={i} d={`M${x} 563 Q${x - 18} ${(563 + yb) / 2} ${x - 6} ${yb}`} stroke={C.nerve} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.5 + sense * 0.5} />;
        })}
        {pulse > 0 && cut === 0 && <path d={NERVE} stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" pathLength={1000} strokeDasharray="60 940" strokeDashoffset={1000 - ((f * 22) % 1000)} opacity={pulse} filter="url(#tglow)" />}
        {sense > 0 && [250, 350, 450, 550, 650].map((x, i) => <circle key={i} cx={x - 6} cy={bottomY(x - 6, 18, wr, shrink)} r={8 + 6 * Math.sin(f / 4 + i)} fill={C.nerve} opacity={sense * 0.7} filter="url(#tglow)" />)}
      </g>
      {/* sweat ducts with water seeping in */}
      {ducts > 0 && TETHERS.map((x0, i) => {
        const x = x0 + 33;
        const yb = bottomY(x, 0, wr, shrink);
        const d = `M${x} ${yb} ` + [1, 2, 3, 4, 5, 6].map((k) => `L${x + (k % 2 ? 7 : -7)} ${yb - k * 7}`).join(' ');
        return (
          <g key={i} opacity={ducts}>
            <path d={d} stroke={C.water} strokeWidth={3.5} fill="none" strokeLinejoin="round" filter="url(#tglow)" />
            {drip > 0 && [0, 1, 2].map((k) => {
              const ph = ((f / 26 + k / 3 + i * 0.13) % 1);
              return <circle key={k} cx={x + Math.sin(ph * 12) * 4} cy={yb + 40 - ph * 82} r={4.5} fill={C.water} opacity={drip * (ph < 0.85 ? 1 : (1 - ph) * 6)} />;
            })}
          </g>
        );
      })}
    </svg>
  );
};

/* ---------- stylised hand (front view) in its own 1000x1500 space ---------- */
const FINGERS = [
  {x: 320, top: 330, w: 78, base: 640},
  {x: 418, top: 262, w: 80, base: 630},
  {x: 518, top: 296, w: 78, base: 630},
  {x: 614, top: 392, w: 68, base: 650},
];
const Hand: React.FC<{f: number; wr?: number[]; nerves?: number; cutIdx?: number; cut?: number; glow?: number; armMark?: number}> = ({f, wr = [0, 0, 0, 0, 0], nerves = 0.4, cutIdx = -1, cut = 0, glow = 0}) => (
  <svg width={1000} height={1500} viewBox="0 0 1000 1500" style={{position: 'absolute', overflow: 'visible'}}>
    <defs>
      <filter id="hglow"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    {/* forearm + palm + thumb */}
    <path d="M372 1500 L382 1010 Q300 980 296 880 L300 640 Q310 600 360 600 L650 600 Q690 600 692 650 L690 880 Q686 980 620 1010 L632 1500 Z" fill={C.cyan} fillOpacity={0.06} stroke={C.cyan} strokeWidth={4} strokeOpacity={0.75} />
    <path d="M300 820 Q230 790 196 700 Q176 640 212 622 Q246 610 268 660 Q290 712 312 730" fill={C.cyan} fillOpacity={0.06} stroke={C.cyan} strokeWidth={4} strokeOpacity={0.75} />
    {FINGERS.map((g, i) => (
      <rect key={i} x={g.x - g.w / 2} y={g.top} width={g.w} height={g.base - g.top} rx={g.w / 2} fill={C.cyan} fillOpacity={0.07} stroke={C.cyan} strokeWidth={4} strokeOpacity={0.75} />
    ))}
    {/* nerves */}
    {[...FINGERS.map((g) => ({x: g.x, top: g.top + 30})), {x: 214, top: 650}].map((g, i) => {
      const isCut = i === cutIdx && cut > 0;
      const bx = 500 + (g.x - 450) * 0.12, mx = 500 + (g.x - 450) * 0.3;
      const d = `M${bx} 1500 L${mx} 1000 Q${(mx + g.x) / 2} 800 ${g.x} ${Math.min(600, g.top + 200)} L${g.x} ${g.top}`;
      return (
        <g key={i}>
          <path d={d} stroke={C.nerve} strokeWidth={5} fill="none" opacity={0.25 + nerves * 0.6} strokeLinecap="round" strokeDasharray={isCut ? '1000 0' : undefined} />
          {nerves > 0.6 && !isCut && <path d={d} stroke="#fff" strokeWidth={7} fill="none" pathLength={1000} strokeDasharray="50 950" strokeDashoffset={1000 - ((f * 18 + i * 140) % 1000)} opacity={nerves - 0.4} filter="url(#hglow)" />}
          {isCut && (
            <g>
              <rect x={g.x - 30} y={Math.min(600, g.top + 200) + 40} width={60} height={26} fill={C.ink} />
              {[0, 1, 2, 3, 4].map((k) => {
                const a = (k / 5) * Math.PI * 2 + f / 5;
                const cy = Math.min(600, g.top + 200) + 53;
                return <line key={k} x1={g.x} y1={cy} x2={g.x + Math.cos(a) * 34 * cut} y2={cy + Math.sin(a) * 34 * cut} stroke={C.coral} strokeWidth={4} strokeLinecap="round" opacity={cut} />;
              })}
            </g>
          )}
        </g>
      );
    })}
    {/* fingertip wrinkles */}
    {[...FINGERS.map((g) => ({x: g.x, top: g.top, w: g.w})), {x: 206, top: 628, w: 60}].map((g, i) => (
      <g key={i} opacity={wr[i]}>
        {[0, 1, 2, 3, 4].map((k) => (
          <path key={k} d={`M${g.x - g.w * 0.34} ${g.top + 26 + k * 15} Q${g.x} ${g.top + 18 + k * 15 + Math.sin(k * 1.7 + i) * 4} ${g.x + g.w * 0.34} ${g.top + 26 + k * 15}`} stroke={glow > 0 ? C.mint : C.skin} strokeWidth={4} fill="none" strokeLinecap="round" filter={glow > 0 ? 'url(#hglow)' : undefined} />
        ))}
      </g>
    ))}
  </svg>
);

const HandAt: React.FC<{x: number; y: number; s: number; children: React.ReactNode}> = ({x, y, s, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1000, height: 1500, transformOrigin: '0 0', transform: `translate(${x}px, ${y}px) scale(${s})`}}>{children}</div>
);

const Tag: React.FC<{x: number; y: number; color: string; text: string; o: number; side?: 'l' | 'r'}> = ({x, y, color, text, o, side = 'r'}) => (
  <div style={{position: 'absolute', left: side === 'r' ? x : undefined, right: side === 'l' ? W - x : undefined, top: y - 34, opacity: o, scale: String(0.8 + 0.2 * o), fontFamily: sora, fontWeight: 800, fontSize: 48, color, padding: '6px 18px', border: `4px solid ${color}`, borderRadius: 14, background: 'rgba(4,10,24,0.75)', boxShadow: `0 0 24px ${color}`, whiteSpace: 'nowrap'}}>{text}</div>
);

/* ---------- scenes ---------- */
// Even date → cutaway-first opening: frame 0 is the lit fingertip cross-section already wrinkled in water.
const Hook: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const soggy = wf('hook', 'soggy');
  const x = lerp(f, [soggy - 2, soggy + 6], [0, 1]);
  return (
    <AbsoluteFill>
      <Bg f={f} water={1} />
      <Focus fx={lerp(f, [0, d], [600, 560])} fy={530} s={lerp(f, [0, d], [1.5, 1.7], inOut)} cy={860}>
        <Fingertip f={f} wr={lerp(f, [0, 22], [0.25, 1], inOut)} shrink={lerp(f, [0, 22], [0.2, 1], inOut)} water={1} constrict={lerp(f, [0, 22], [0, 0.6])} flow={0.3} />
      </Focus>
      <div style={{position: 'absolute', left: 70, top: 210, fontFamily: sora}}>
        <div style={{fontSize: 36, letterSpacing: 6, color: C.cyan, fontWeight: 600}}>FINGERTIP · CROSS-SECTION</div>
        <div style={{fontSize: 92, fontWeight: 800, color: '#fff', lineHeight: 1.05, textShadow: `0 0 30px ${C.cyan}`}}>BATH WRINKLES</div>
      </div>
      <Tag x={600} y={1180} color={C.coral} text="SOGGY SKIN? ✕" o={x} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};

const Twist: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const nerves = wf('twist', 'nerves');
  const p = lerp(f, [nerves - 4, nerves + 6], [0, 1]);
  return (
    <AbsoluteFill>
      <Bg f={f} tint={C.nerve} water={0.6} />
      <Focus fx={lerp(f, [0, d], [560, 520])} fy={lerp(f, [0, d], [530, 570])} s={lerp(f, [0, d], [1.75, 2.2], inOut)} cy={880}>
        <Fingertip f={f} wr={1} shrink={1} water={0.6} pulse={p} sense={p * 0.8} layers={0.6} />
      </Focus>
      <Hud label="CAUSE" value="NERVES" x={70} y={220} color={C.nerve} delay={nerves - 3} size={96} />
      <Vignette strength={0.65} />
    </AbsoluteFill>
  );
};

const Gap: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const tips = wf('gap', 'fingertips');
  const arms = wf('gap', 'arms');
  const here = wf('gap', 'here');
  const w = lerp(f, [tips - 2, tips + 14], [0, 1]);
  const s = lerp(f, [0, here + 4, d], [1.0, 1.04, 1.12], inOut);
  return (
    <AbsoluteFill>
      <Bg f={f} water={1} />
      <HandAt x={540 - 440 * s} y={340 - 262 * s} s={s}>
        <Hand f={f} wr={[w, w, w, w, w]} nerves={0.3} />
      </HandAt>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1200, height: 720, background: `linear-gradient(180deg, rgba(4,10,24,0) 0%, ${C.bg} 22%)`}} />
      <Tag x={760} y={400} color={C.skin} text="PUCKERED" o={lerp(f, [tips - 2, tips + 6], [0, 1])} />
      <Tag x={770} y={1090} color={C.cyan} text="SMOOTH" o={lerp(f, [arms - 2, arms + 6], [0, 1])} />
      <div style={{position: 'absolute', left: 60, top: 640, fontFamily: sora, fontWeight: 800, fontSize: 170, color: '#fff', opacity: lerp(f, [here - 6, here + 2], [0, 1]), textShadow: `0 0 34px ${C.cyan}`, scale: String(1 + 0.06 * Math.sin(f / 4))}}>?</div>
      <div style={{position: 'absolute', top: 205, width: '100%', textAlign: 'center', fontFamily: sora, fontSize: 40, letterSpacing: 6, color: C.water, fontWeight: 700}}>AFTER A LONG SOAK</div>
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};

const Clue: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const cut = wf('clue', 'cut');
  const smooth = wf('clue', 'smooth');
  const c = lerp(f, [cut - 2, cut + 4], [0, 1]);
  const w = lerp(f, [cut + 6, smooth], [0, 1]);
  const s = lerp(f, [0, d], [1.0, 1.35], inOut);
  // focus on the index finger (x=320 in hand space)
  const hx = 540 - lerp(f, [0, d], [440, 360], inOut) * s;
  return (
    <AbsoluteFill>
      <Bg f={f} tint={C.coral} water={0.8} />
      <HandAt x={hx} y={360 - 290 * s} s={s}>
        <Hand f={f} wr={[0, w, w, w, w]} nerves={0.5} cutIdx={0} cut={c} />
      </HandAt>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1200, height: 720, background: `linear-gradient(180deg, rgba(4,10,24,0) 0%, ${C.bg} 22%)`}} />
      <div style={{position: 'absolute', left: 70, top: 210, fontFamily: sora}}>
        <div style={{fontSize: 36, letterSpacing: 6, color: C.coral, fontWeight: 600}}>THE CLUE</div>
        <div style={{fontSize: 76, fontWeight: 800, color: '#fff', lineHeight: 1.05, opacity: lerp(f, [cut - 4, cut + 4], [0, 1])}}>NERVE CUT</div>
      </div>
      <Tag x={90} y={1130} color={C.coral} text="NO WRINKLES" o={lerp(f, [smooth - 4, smooth + 4], [0, 1])} />
      <Tag x={W - 90} side="l" y={1130} color={C.skin} text="WRINKLED" o={lerp(f, [smooth - 2, smooth + 6], [0, 1])} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};

const Pores: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const water = wf('pores', 'water');
  const ducts = wf('pores', 'ducts');
  const z = lerp(f, [0, ducts + 4], [0, 1], inOut);
  return (
    <AbsoluteFill>
      <Bg f={f} tint={C.water} water={1} />
      <Focus fx={interpolate(z, [0, 1], [500, 430])} fy={interpolate(z, [0, 1], [540, 625])} s={interpolate(z, [0, 1], [1.3, 4.2])} cy={760}>
        <Fingertip f={f} wr={0.25} shrink={0.2} water={1} ducts={lerp(f, [water - 6, water + 4], [0, 1])} drip={lerp(f, [water, water + 8], [0, 1])} cells={lerp(f, [ducts - 6, ducts + 10], [0, 1])} layers={1} />
      </Focus>
      <Hud label="ZOOM · SKIN SURFACE" value="SWEAT DUCTS" x={70} y={220} color={C.water} delay={ducts - 6} size={72} />
      <Hud label="WATER" value="SEEPING IN ↑" x={70} y={1150} color={C.water} delay={water - 2} size={52} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

const Squeeze: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const sense = wf('squeeze', 'sense');
  const vessels = wf('squeeze', 'vessels');
  const sq = wf('squeeze', 'squeeze');
  const con = lerp(f, [sq - 8, sq + 14], [0, 1], inOut);
  const ring = 78 - con * 40;
  return (
    <AbsoluteFill>
      <Bg f={f} tint={C.coral} water={0.5} />
      <Focus fx={lerp(f, [0, vessels], [430, 470], inOut)} fy={lerp(f, [0, vessels], [610, 585], inOut)} s={lerp(f, [0, vessels, d], [3.2, 2.4, 2.6], inOut)} cy={930}>
        <Fingertip f={f} wr={con * 0.5} shrink={con * 0.3} water={0.5} sense={lerp(f, [sense - 4, sense + 6], [0, 1])} pulse={lerp(f, [sense, sense + 6], [0, 1])} constrict={con} flow={1 - con * 0.7} />
      </Focus>
      <Hud label="NERVE SIGNAL" value="→ BLOOD VESSELS" x={70} y={220} color={C.nerve} delay={sense - 2} size={60} />
      <div style={{position: 'absolute', right: 60, top: 400, width: 280, height: 300, borderRadius: 24, border: `3px solid ${C.coral}`, background: 'rgba(4,10,24,0.82)', opacity: lerp(f, [vessels - 6, vessels + 2], [0, 1])}}>
        <svg width={280} height={230}>
          <circle cx={140} cy={115} r={ring + 16} fill="#a0233d" />
          <circle cx={140} cy={115} r={ring} fill={C.coral} />
          {new Array(7).fill(0).map((_, i) => {
            const a = i * 0.9 + f / (8 + con * 20);
            return <ellipse key={i} cx={140 + Math.cos(a) * ring * 0.55} cy={115 + Math.sin(a) * ring * 0.55} rx={10} ry={6} fill="#ffd0d8" opacity={0.9} />;
          })}
        </svg>
        <div style={{textAlign: 'center', fontFamily: sora, fontSize: 36, fontWeight: 800, color: C.coral, marginTop: -4}}>{con > 0.4 ? 'NARROWING' : 'VESSEL'}</div>
      </div>
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

const Buckle: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const shrinks = wf('buckle', 'shrinks');
  const anch = wf('buckle', 'anchored');
  const folds = wf('buckle', 'folds');
  const sh = lerp(f, [shrinks - 6, shrinks + 12], [0.3, 1], inOut);
  const wr = lerp(f, [anch, folds + 10], [0.5, 1], inOut);
  return (
    <AbsoluteFill>
      <Bg f={f} water={0.6} />
      <Focus fx={lerp(f, [0, d], [470, 460])} fy={lerp(f, [0, d], [560, 590])} s={lerp(f, [0, d], [1.7, 2.1], inOut)} cy={880}>
        <Fingertip f={f} wr={wr} shrink={sh} water={0.6} constrict={1} flow={0.3} tether={lerp(f, [anch - 4, anch + 6], [0, 1])} />
      </Focus>
      <Hud label="FINGERTIP PAD" value="SHRINKS" x={70} y={220} color={C.coral} delay={shrinks - 3} size={64} />
      <Hud label="SKIN ANCHORS" value="PULL DOWN" x={70} align="right" y={220} color={C.mint} delay={anch - 3} size={64} />
      <Tag x={540} y={1150} color={C.skin} text="FOLDS" o={lerp(f, [folds - 3, folds + 5], [0, 1])} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

const Debate: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const deb = wf('debate', 'debated');
  return (
    <AbsoluteFill>
      <Bg f={f} tint={C.violet} water={0.5} />
      <Focus fx={lerp(f, [0, d], [420, 450])} fy={600} s={lerp(f, [0, d], [2.6, 2.9], inOut)} cy={860}>
        <Fingertip f={f} wr={1} shrink={1} water={0.5} ducts={0.8} drip={0.6} sense={0.7 + 0.3 * Math.sin(f / 5)} constrict={1} layers={0.7} />
      </Focus>
      {new Array(5).fill(0).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: 170 + i * 175, top: 860 + Math.sin(f / 8 + i) * 22, fontFamily: sora, fontWeight: 800, fontSize: 80, color: C.violet, opacity: lerp(f, [4 + i * 3, 12 + i * 3], [0, 0.9]), textShadow: `0 0 24px ${C.violet}`}}>?</div>
      ))}
      <Hud label="HOW NERVES SENSE WATER" value="STILL DEBATED" x={70} y={220} color={C.violet} delay={deb - 10} size={72} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

/* Wet marble in a wrinkled pinch: water channels drain through the grooves. */
const Pinch: React.FC<{f: number; wr: number; move: number; drain: number}> = ({f, wr, move, drain}) => {
  const mx = 540 + move * 0;
  return (
    <svg width={W} height={H} style={{position: 'absolute', transformOrigin: '540px 760px', scale: '1.3'}}>
      <defs><filter id="pg"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      {/* thumb (bottom) and index (top) pads */}
      {[-1, 1].map((sgn) => {
        const y = 760 + sgn * 150;
        return (
          <g key={sgn}>
            <rect x={sgn < 0 ? 140 : 330} y={y - 80} width={620} height={160} rx={80} fill={C.skin} fillOpacity={0.12} stroke={C.skin} strokeWidth={5} />
            {new Array(7).fill(0).map((_, k) => {
              const x = (sgn < 0 ? 520 : 560) + (k - 3) * 44;
              return <path key={k} d={`M${x} ${y - sgn * 70} q${8} ${-sgn * 22} 0 ${-sgn * 44}`} stroke={C.skin} strokeWidth={5} fill="none" opacity={wr} strokeLinecap="round" />;
            })}
          </g>
        );
      })}
      <circle cx={mx} cy={760} r={78} fill={C.water} fillOpacity={0.3} stroke={C.water} strokeWidth={5} filter="url(#pg)" />
      <circle cx={mx - 24} cy={736} r={18} fill="#fff" opacity={0.7} />
      {drain > 0 && new Array(12).fill(0).map((_, i) => {
        const ph = ((f / 18 + i / 12) % 1);
        const side = i % 2 ? 1 : -1;
        const x = mx + ((i % 6) - 2.5) * 34;
        return <circle key={i} cx={x} cy={760 + side * (90 + ph * 170)} r={7} fill={C.water} opacity={drain * (1 - ph)} />;
      })}
    </svg>
  );
};

const Why: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const grip = wf('why', 'grip');
  return (
    <AbsoluteFill>
      <Bg f={f} tint={C.mint} water={0.6} />
      <Pinch f={f} wr={1} move={0} drain={lerp(f, [grip - 2, grip + 8], [0, 1])} />
      <div style={{position: 'absolute', top: 205, width: '100%', textAlign: 'center', fontFamily: sora}}>
        <div style={{fontSize: 36, letterSpacing: 6, color: C.mint, fontWeight: 600}}>ONE IDEA</div>
        <div style={{fontSize: 96, fontWeight: 800, color: '#fff', textShadow: `0 0 30px ${C.mint}`, opacity: lerp(f, [grip - 4, grip + 4], [0, 1]), scale: String(lerp(f, [grip - 4, grip + 8], [1.3, 1]))}}>GRIP?</div>
      </div>
      <Hud label="GROOVES" value="DRAIN WATER" x={70} y={1150} color={C.water} delay={grip} size={52} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};

const Panel: React.FC<{x: number; title: string; verdict: string; color: string; o: number; vo: number; f: number; fast: boolean}> = ({x, title, verdict, color, o, vo, f, fast}) => {
  const ph = ((f * (fast ? 1.6 : 1.0)) % 60) / 60;
  return (
    <div style={{position: 'absolute', left: x, top: 420, width: 440, height: 680, borderRadius: 28, border: `4px solid ${color}`, background: 'rgba(4,10,24,0.8)', opacity: o, translate: `0px ${(1 - o) * 60}px`, fontFamily: sora}}>
      <div style={{textAlign: 'center', marginTop: 26, fontSize: 40, fontWeight: 800, color}}>{title}</div>
      <svg width={440} height={420} style={{position: 'absolute', top: 100}}>
        <rect x={40} y={300} width={140} height={70} rx={14} fill="none" stroke={C.water} strokeWidth={4} />
        <rect x={260} y={300} width={140} height={70} rx={14} fill="none" stroke="#cfe8ff" strokeWidth={4} />
        {[0, 1, 2].map((k) => {
          const p = (ph + k / 3) % 1;
          const xx = 110 + p * 220, yy = 320 - Math.sin(p * Math.PI) * 200;
          return <circle key={k} cx={xx} cy={yy} r={20} fill={C.water} fillOpacity={0.45} stroke={C.water} strokeWidth={3} />;
        })}
        <path d="M150 90 q60 -60 140 0" stroke={C.skin} strokeWidth={5} fill="none" strokeDasharray="10 10" opacity={0.6} />
      </svg>
      <div style={{position: 'absolute', bottom: 34, width: '100%', textAlign: 'center', fontSize: 50, fontWeight: 800, color, opacity: vo, scale: String(interpolate(vo, [0, 1], [1.4, 1])), textShadow: `0 0 20px ${color}`}}>{verdict}</div>
    </div>
  );
};

const Study: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const faster = wf('study', 'faster');
  const another = wf('study', 'another');
  const diff = wf('study', 'difference');
  return (
    <AbsoluteFill>
      <Bg f={f} water={0.5} />
      <div style={{position: 'absolute', top: 210, width: '100%', textAlign: 'center', fontFamily: sora, fontSize: 40, letterSpacing: 6, color: C.cyan, fontWeight: 700}}>WET-MARBLE TESTS</div>
      <Panel x={70} title="STUDY 1 · 2013" verdict="FASTER" color={C.mint} o={lerp(f, [0, 10], [0, 1])} vo={lerp(f, [faster - 3, faster + 5], [0, 1])} f={f} fast />
      <Panel x={570} title="STUDY 2 · 2014" verdict="NO CHANGE" color={C.coral} o={lerp(f, [another - 6, another + 4], [0, 1])} vo={lerp(f, [diff - 3, diff + 5], [0, 1])} f={f} fast={false} />
      <Tag x={540 - 150} y={1170} color={C.violet} text="UNSETTLED" o={lerp(f, [diff + 8, diff + 16], [0, 1])} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};

const End: React.FC<{d: number}> = ({d}) => {
  const f = useCurrentFrame();
  const nerves = wf('end', 'nerves');
  const working = wf('end', 'working');
  const n = lerp(f, [nerves - 4, nerves + 10], [0.3, 1]);
  const s = lerp(f, [0, d], [1.25, 0.95], inOut);
  return (
    <AbsoluteFill>
      <Bg f={f} tint={C.mint} water={0.8} />
      <HandAt x={540 - 440 * s} y={400 - 262 * s} s={s}>
        <Hand f={f} wr={[1, 1, 1, 1, 1]} nerves={n} glow={lerp(f, [working - 4, working + 4], [0, 1])} />
      </HandAt>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1200, height: 720, background: `linear-gradient(180deg, rgba(4,10,24,0) 0%, ${C.bg} 22%)`}} />
      <Hud label="NERVES" value="WIRED UP ✓" x={70} align="right" y={1150} color={C.mint} delay={working - 4} size={56} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 200, textAlign: 'center', fontFamily: sora, fontWeight: 700, fontSize: 40, color: '#e8fbff', padding: '14px 10px', borderRadius: 18, background: 'rgba(4,10,24,0.7)', border: `2px solid ${C.cyan}`, opacity: lerp(f, [6, 16], [0, 1])}}>
        Numbness or tingling in your hands? Talk to a doctor.
      </div>
      <div style={{position: 'absolute', top: 1810, width: '100%', textAlign: 'center', fontFamily: sora, fontWeight: 700, fontSize: 36, color: C.cyan, letterSpacing: 6, opacity: lerp(f, [working, working + 10], [0, 0.9])}}>WONDERSYNAPSE</div>
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};

export const WrinkleVideo: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}}>
    <FontFaces />
    <Scenes timing={timing} xfade={6} map={{hook: Hook, twist: Twist, gap: Gap, clue: Clue, pores: Pores, squeeze: Squeeze, buckle: Buckle, debate: Debate, why: Why, study: Study, end: End}} />
    <Captions words={timing.words} top={1390} active="#ffffff" inactive="#9fb3d1" maxWords={3}
      emph={['wrinkles', 'nerves', 'nerve', 'fingertips', 'arms', 'cut', 'smooth', 'water', 'sweat', 'ducts', 'squeeze', 'shrinks', 'folds', 'debated', 'grip', 'faster', 'difference', 'working']} emphColor={C.cyan}
      style={{fontFamily: sora, fontWeight: 800, fontSize: 76, lineHeight: 1.1, textShadow: '0 4px 0 #000, 0 0 18px rgba(0,0,0,0.9)', textTransform: 'uppercase'}} />
    <Grain opacity={0.05} />
  </AbsoluteFill>
);
export const wrinkleFrames = Math.ceil(timing.duration * FPS);
