import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

/* Motion kit v1 — reusable animation building blocks (Remotion only, no paid services).
   - EASE presets: natural timing instead of linear moves.
   - kf(): keyframe tracks with per-segment easing (anticipation / overshoot / settle).
   - CameraRig + Layer: a virtual camera (x, y, zoom, roll) with parallax depth layers and optional depth-of-field blur.
   - impulse(): decaying punch for impacts (camera kick, squash, flinch). */

export const EASE = {
  smooth: Easing.bezier(0.45, 0, 0.2, 1), // ease in-out (camera dollies)
  out: Easing.bezier(0.16, 1, 0.3, 1), // fast start, soft landing (entrances)
  in: Easing.bezier(0.6, 0, 0.9, 0.4), // slow start, fast finish (exits, falls)
  anticip: Easing.bezier(0.5, -0.45, 0.4, 1), // pulls back first, then goes (wind-ups)
  overshoot: Easing.bezier(0.3, 1.6, 0.5, 1), // passes the target then settles (slams, pops)
  linear: Easing.linear,
};
type EaseFn = (t: number) => number;
export type Key = [frame: number, value: number, ease?: EaseFn];

/** Keyframe track: kf(frame, [[0, 0], [20, 100, EASE.out], [40, 80, EASE.smooth]]). Each key's ease shapes the segment arriving at it. */
export const kf = (frame: number, keys: Key[]): number => {
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1, e] = keys[i];
    const [f0, v0] = keys[i - 1];
    if (frame <= f1) return interpolate(frame, [f0, f1], [v0, v1], {easing: e ?? EASE.smooth, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  }
  return keys[keys.length - 1][1];
};

/** Decaying oscillation after `at` (impacts): returns 0 before `at`, then amp*sin… fading over `len` frames. */
export const impulse = (frame: number, at: number, amp = 1, len = 14, freq = 0.9): number => {
  const d = frame - at;
  if (d < 0 || d > len) return 0;
  return amp * Math.sin(d * freq) * Math.pow(1 - d / len, 2);
};
/** Sum of impulses for several hits. */
export const impulses = (frame: number, ats: number[], amp = 1, len = 14, freq = 0.9) => ats.reduce((a, t) => a + impulse(frame, t, amp, len, freq), 0);

export type Cam = {x: number; y: number; zoom: number; roll?: number; focus?: number};
const CamCtx = createContext<Cam>({x: 540, y: 960, zoom: 1, roll: 0, focus: 1});

/** Virtual camera: (x, y) is the world point shown at screen centre; zoom 1 = 1080 px wide. Children are <Layer>s. */
export const CameraRig: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => (
  <CamCtx.Provider value={cam}>
    <AbsoluteFill style={{overflow: 'hidden'}}>{children}</AbsoluteFill>
  </CamCtx.Provider>
);

/** Parallax layer. depth 1 = moves with the camera (the action plane); <1 = far (moves less), >1 = near/foreground (moves more).
    blur: pixels of depth-of-field blur applied to this layer (use on far backgrounds and near foregrounds). */
export const Layer: React.FC<{depth?: number; blur?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({depth = 1, blur = 0, children, style}) => {
  const c = useContext(CamCtx);
  const cx = 540 + (c.x - 540) * depth;
  const cy = 960 + (c.y - 960) * depth;
  const z = 1 + (c.zoom - 1) * depth;
  const roll = (c.roll ?? 0) * Math.min(1, depth);
  return (
    <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(540px, 960px) rotate(${roll}deg) scale(${z}) translate(${-cx}px, ${-cy}px)`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined, ...style}}>
      {children}
    </AbsoluteFill>
  );
};

/** Floating dust / rain / sparks in a depth band (deterministic). */
export const Particles: React.FC<{count?: number; color?: string; size?: number; speedY?: number; speedX?: number; seed?: number; streak?: number; opacity?: number}> = ({count = 30, color = '#fff', size = 6, speedY = -0.6, speedX = 0.3, seed = 1, streak = 0, opacity = 0.5}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(count).fill(0).map((_, i) => {
        const r = Math.sin(i * 91.3 + seed * 13.7) * 43758.5453;
        const f = r - Math.floor(r);
        const x = (((i * 137.5 + seed * 61) % 1200) + frame * speedX * (0.6 + f)) % 1240 - 80;
        const y = ((((i * 211 + seed * 97) % 2100) + frame * speedY * (0.6 + f) * 10) % 2100 + 2100) % 2100 - 90;
        const s = size * (0.5 + f);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: streak ? s * 0.35 : s, height: streak ? streak * (0.6 + f) : s, borderRadius: streak ? 2 : s, background: color, opacity: opacity * (0.4 + f * 0.6), rotate: streak ? `${Math.atan2(speedX, speedY * 10) * -57}deg` : undefined}} />;
      })}
    </AbsoluteFill>
  );
};

/** Cheap directional motion blur: draws `trail` ghost copies behind a moving element. */
export const Trail: React.FC<{dx: number; dy?: number; trail?: number; children: React.ReactNode}> = ({dx, dy = 0, trail = 3, children}) => (
  <>
    {new Array(trail).fill(0).map((_, i) => (
      <div key={i} style={{position: 'absolute', inset: 0, translate: `${-dx * (i + 1) / trail}px ${-dy * (i + 1) / trail}px`, opacity: 0.18 * (1 - i / trail)}}>{children}</div>
    ))}
    {children}
  </>
);
