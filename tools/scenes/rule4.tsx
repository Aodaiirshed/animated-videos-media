import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Syn, mouthAt, type MouthCue} from '../components/Host';
import {Dark, R, RuleBadge, Sheep} from './rule1';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';
import mouthData from '../generated/rule4-spotlight.mouth.json';

/* THE HIDDEN RULE #4 — spotlight effect (Gilovich, Medvec & Savitsky 2000). Dark sheep world, red accent = the stain.
   First Hidden Rule with Syn as the speaking narrator (Rhubarb lip sync on the hook + payoff). */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);
const cues = (id: string) => (mouthData as {scenes: Record<string, MouthCue[]>}).scenes[id];

const Moon: React.FC<{y?: number}> = ({y = 330}) => <div style={{position: 'absolute', left: 800, top: y, width: 100, height: 100, borderRadius: 50, background: R.white, boxShadow: '0 0 60px 10px rgba(243,239,231,0.22)'}} />;
const Ground: React.FC = () => <div style={{position: 'absolute', left: 0, right: 0, top: 1200, height: 6, background: R.grey, opacity: 0.5}} />;

/* a red paint stain on a Sheep drawn at (x, y, s) — sits on the wool */
const Stain: React.FC<{x: number; y: number; s: number; grow?: number; glow?: number}> = ({x, y, s, grow = 1, glow = 0}) => (
  <svg width={70 * s} height={60 * s} viewBox="0 0 70 60" style={{position: 'absolute', left: x + 50 * s, top: y + 50 * s, scale: String(grow), filter: glow ? `drop-shadow(0 0 ${12 * glow}px ${R.red})` : undefined}}>
    <path d="M10 30 q-8 -16 8 -20 q6 -12 20 -6 q16 -6 20 10 q14 8 2 20 q-2 14 -18 10 q-10 10 -22 0 q-16 2 -10 -14z" fill={R.red} />
    <circle cx="62" cy="8" r="4" fill={R.red} /><circle cx="4" cy="50" r="3" fill={R.red} />
  </svg>
);

/* stainHook: { badge, stainOnWord, flockOnWord } — frame 0: a red blob is already flying at the sheep (motion on frame 1);
   it hits ~frame 8; hard punch-in on the stain at 1.2 s; on "sent" a wide shot: the stained sheep walks toward the flock. */
const StainHook: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fAt = at(captions, scene.flockOnWord, fps, dur * 0.6);
  const cut = 36;
  const hit = 8;
  const fly = interpolate(frame, [0, hit], [0, 1], clamp);
  const splat = spring({frame: frame - hit, fps, config: {damping: 9, stiffness: 260}});
  const wide = frame >= fAt;
  const walk = interpolate(frame, [fAt, dur], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Dark dur={dur} zoom={[1, 1]}>
        <Moon />
        <Ground />
        {!wide ? (
          <AbsoluteFill style={{scale: frame >= cut ? '1.45' : '1', transformOrigin: '470px 900px'}}>
            <Sheep x={250} y={760} s={2.2} look={frame >= hit + 6 ? -1 : 0} bob={frame >= hit && frame < hit + 10 ? Math.sin(frame * 2) * 8 : 0} />
            {frame < hit ? <div style={{position: 'absolute', left: interpolate(fly, [0, 1], [90, 380]), top: interpolate(fly, [0, 1], [420, 870]), width: 96, height: 78, borderRadius: '50% 45% 55% 40%', background: R.red, rotate: `${frame * 30}deg`}} /> : null}
            {frame >= hit ? <Stain x={250} y={760} s={2.2} grow={splat} /> : null}
            {frame >= hit && frame < hit + 14 ? new Array(6).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: 420 + Math.cos(i) * (frame - hit) * 9, top: 880 + Math.sin(i * 1.7) * (frame - hit) * 7, width: 14, height: 14, borderRadius: 7, background: R.red, opacity: 1 - (frame - hit) / 14}} />) : null}
          </AbsoluteFill>
        ) : (
          <>
            {new Array(9).fill(0).map((_, i) => <Sheep key={i} x={450 + (i % 3) * 165} y={830 + Math.floor(i / 3) * 110} s={0.75} look={0} tint="#b9b0a0" bob={Math.sin(frame / 7 + i) * 2} />)}
            {(() => { const sx = interpolate(walk, [0, 1], [-40, 230]); return <><Sheep x={sx} y={880 + Math.sin(frame / 3) * 4} s={1.0} look={1} /><Stain x={sx} y={880 + Math.sin(frame / 3) * 4} s={1.0} /></>; })()}
          </>
        )}
      </Dark>
      {frame >= 60 ? <RuleBadge text={(scene.badge as string) ?? 'THE HIDDEN RULE #4'} /> : null}
      <Syn x={150} y={1175} size={200} pose="point" from={-20} to={dur} mouth={mouthAt(cues(scene.id), frame, fps)} />
    </AbsoluteFill>
  );
};

/* spotlightSheep: { stareOnWord, hideOnWord } — a theatre spotlight falls on the stained sheep; in the dark around him, 9 pairs of eyes
   (his imagination) snap open on "staring"; hard cut on "hid" to a stone wall with only his stained back peeking out, the moon sliding over. */
const SpotlightSheep: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sAt = at(captions, scene.stareOnWord, fps, dur * 0.45);
  const hAt = at(captions, scene.hideOnWord, fps, dur * 0.6);
  if (frame >= hAt) {
    const t = frame - hAt;
    return (
      <Dark dur={dur - hAt} zoom={[1.0, 1.05]}>
        <Moon y={interpolate(t, [0, dur - hAt], [330, 560], clamp)} />
        <Ground />
        <Sheep x={430} y={790} s={1.5} look={-1} />
        <Stain x={430} y={790} s={1.5} />
        {new Array(4).fill(0).map((_, row) => new Array(6).fill(0).map((__, c) => (
          <div key={`${row}-${c}`} style={{position: 'absolute', left: 120 + c * 130 + (row % 2) * 65, top: 920 + row * 70, width: 124, height: 64, background: '#3a3f48', border: `3px solid ${R.bg1}`, borderRadius: 8}} />
        )))}
        <div style={{position: 'absolute', left: 0, right: 140, top: 420, textAlign: 'center'}}><span style={{fontFamily: DISPLAY, fontSize: 72, color: '#15181d', background: R.line, padding: '6px 26px', borderRadius: 14}}>HID ALL EVENING</span></div>
      </Dark>
    );
  }
  const cone = interpolate(frame, [0, 10], [0, 1], clamp);
  return (
    <Dark dur={hAt} zoom={[1.06, 1.0]}>
      <div style={{position: 'absolute', left: 240, top: 260, width: 500, height: 1000, opacity: 0.85 * cone, background: 'linear-gradient(180deg, rgba(243,239,231,0.45), rgba(243,239,231,0.10))', clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)'}} />
      <div style={{position: 'absolute', left: 260, top: 1150, width: 460, height: 80, borderRadius: '50%', background: 'rgba(243,239,231,0.25)', opacity: cone}} />
      <Sheep x={300} y={960} s={1.9} look={Math.sin(frame / 4) > 0 ? 1 : -1} bob={Math.sin(frame / 2) * 3} />
      <Stain x={300} y={960} s={1.9} glow={1} />
      {new Array(9).fill(0).map((_, i) => {
        const ex = [70, 830, 120, 860, 60, 780, 160, 900, 470][i];
        const ey = [480, 520, 760, 800, 1040, 1080, 1260, 1240, 420][i];
        const open = spring({frame: frame - sAt - i * 2, fps, config: {damping: 10, stiffness: 300}});
        if (frame < sAt) return null;
        return <div key={i} style={{position: 'absolute', left: ex, top: ey, display: 'flex', gap: 14}}>
          {[0, 1].map((k) => <div key={k} style={{width: 34, height: 34 * open, borderRadius: 17, background: R.white, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div style={{width: 14, height: 14 * open, borderRadius: 7, background: '#111317', translate: `${ex < 500 ? 6 : -6}px 0`}} /></div>)}
        </div>;
      })}
      {frame >= sAt ? <div style={{position: 'absolute', left: 0, right: 140, top: 330, textAlign: 'center', fontFamily: DISPLAY, fontSize: 70, color: R.red}}>EVERYONE SAW IT.</div> : null}
    </Dark>
  );
};

/* countNoticed: { twoOnWord } — ten sheep grazing in two rows, nobody looking; "HOW MANY NOTICED?" pulses while they graze;
   on "Two." exactly two lift their heads (eyes to the stained one) and a big 2 / 10 counter lands. */
const CountNoticed: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tAt = at(captions, scene.twoOnWord, fps, dur * 0.55);
  const pop = spring({frame: frame - tAt, fps, config: {damping: 11}});
  const lookers = [2, 6];
  return (
    <Dark dur={dur} zoom={[1.0, 1.05]}>
      <Moon y={560} />
      <Ground />
      {new Array(10).fill(0).map((_, i) => {
        const x = 40 + (i % 5) * 190;
        const y = 760 + Math.floor(i / 5) * 230;
        const looks = frame >= tAt && lookers.includes(i);
        return <div key={i} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, filter: looks ? `drop-shadow(0 0 10px ${R.red})` : undefined}}>
          <Sheep x={x} y={y + (looks ? -16 : Math.sin(frame / 5 + i) * 3)} s={0.85} look={looks ? -1 : 0} tint={i === 4 ? R.line : '#b9b0a0'} />
          {i === 4 ? <Stain x={x} y={y} s={0.85} /> : null}
        </div>;
      })}
      <div style={{position: 'absolute', left: 0, right: 140, top: 340, textAlign: 'center', fontFamily: DISPLAY, fontSize: 76, color: R.white, scale: String(1 + 0.03 * Math.sin(frame / 4))}}>HOW MANY NOTICED?</div>
      {frame >= tAt ? <div style={{position: 'absolute', left: 0, right: 140, top: 480, textAlign: 'center', scale: String(pop)}}><span style={{fontFamily: DISPLAY, fontSize: 170, color: R.red}}>2</span><span style={{fontFamily: DISPLAY, fontSize: 90, color: R.grey}}> / 10</span></div> : null}
    </Dark>
  );
};

/* spotCard: { guessOnWord, actualOnWord } — THE SPOTLIGHT EFFECT in a spotlight circle; 2000 T-shirt study: guessed ~half the room noticed, about a quarter did. */
const SpotCard: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const gAt = at(captions, scene.guessOnWord, fps, dur * 0.6);
  const aAt = at(captions, scene.actualOnWord, fps, dur * 0.85);
  const t = spring({frame, fps, config: {damping: 14}});
  const bar = (a: number, v: number) => interpolate(frame, [a, a + 18], [0, v], clamp);
  const shirtIn = spring({frame: frame - Math.round(dur * 0.3), fps, config: {damping: 12}});
  return (
    <Dark dur={dur} zoom={[1.0, 1.03]}>
      <div style={{position: 'absolute', left: 140, top: 250, width: 660, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(243,239,231,0.18), transparent 70%)', opacity: t}} />
      <div style={{position: 'absolute', left: 0, right: 140, top: 330, textAlign: 'center', opacity: t}}>
        <div style={{fontFamily: DISPLAY, fontSize: 96, color: R.white, lineHeight: 1}}>THE SPOTLIGHT EFFECT</div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 34, color: R.grey, marginTop: 14, letterSpacing: 2}}>2000 · ONE EMBARRASSING T-SHIRT</div>
      </div>
      <div style={{position: 'absolute', left: 380, top: 560, fontSize: 120, scale: String(shirtIn), opacity: frame < gAt ? 1 : 0.35}}>👕</div>
      {[{lab: 'THEY GUESSED', v: 50, a: gAt, c: R.line, txt: '≈ 1 IN 2'}, {lab: 'ACTUALLY NOTICED', v: 25, a: aAt, c: R.red, txt: '≈ 1 IN 4'}].map((b, i) => frame >= b.a ? (
        <div key={i} style={{position: 'absolute', left: 80, top: 760 + i * 230}}>
          <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 38, color: R.white, letterSpacing: 2}}>{b.lab}</div>
          <div style={{marginTop: 12, height: 80, width: 11 * bar(b.a, b.v), background: b.c, borderRadius: 12}} />
          <div style={{position: 'absolute', left: 11 * bar(b.a, b.v) + 24, top: 58, fontFamily: DISPLAY, fontSize: 70, color: b.c, whiteSpace: 'nowrap'}}>{b.txt}</div>
        </div>
      ) : null)}
    </Dark>
  );
};

/* humanSpot: { itemOnWords[] } — "YOU THINK I'M TALKING ABOUT SHEEP." then two everyday moments, each under its own little spotlight. */
const HumanSpot: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ws = (scene.itemOnWords as string[]) ?? [];
  const items = [{ic: '👕', t: 'THE STAIN ON YOUR SHIRT'}, {ic: '🎤', t: 'THE VOICE CRACK IN CLASS'}];
  return (
    <Dark dur={dur}>
      <div style={{position: 'absolute', left: 0, right: 140, top: 330, textAlign: 'center', fontFamily: DISPLAY, fontSize: 62, color: R.white, lineHeight: 1.05}}>YOU THINK I&apos;M TALKING ABOUT SHEEP.</div>
      {items.map((it, i) => {
        const a = at(captions, ws[i], fps, 25 + i * 40);
        const s = spring({frame: frame - a, fps, config: {damping: 13}});
        if (frame < a) return null;
        return (
          <div key={i} style={{position: 'absolute', left: 70, top: 560 + i * 300, width: 860, height: 240, opacity: s, translate: `${(1 - s) * 70}px 0`}}>
            <div style={{position: 'absolute', left: 0, top: -40, width: 260, height: 300, background: 'linear-gradient(180deg, rgba(243,239,231,0.30), transparent)', clipPath: 'polygon(40% 0, 60% 0, 100% 100%, 0 100%)'}} />
            <div style={{position: 'absolute', left: 0, top: 0, width: 860, height: 240, border: `4px solid ${R.line}`, borderRadius: 22, display: 'flex', alignItems: 'center', gap: 30, paddingLeft: 60}}>
              <span style={{fontSize: 100}}>{it.ic}</span>
              <span style={{fontFamily: DISPLAY, fontSize: 54, color: R.white, lineHeight: 1.05}}>{it.t}</span>
            </div>
          </div>
        );
      })}
    </Dark>
  );
};

/* spotOff: { offOnWord, send } — back in the field: the spotlight over the stained sheep shrinks to nothing on "Nobody"; the flock keeps grazing.
   Silent send line on screen; Syn speaks the payoff. The last line loops into the hook ("I know, because… Yesterday, I put…"). */
const SpotOff: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const oAt = at(captions, scene.offOnWord, fps, 4);
  const shrink = interpolate(frame, [oAt, oAt + 30], [1, 0], clamp);
  const sendIn = spring({frame: frame - 12, fps, config: {damping: 13}});
  return (
    <AbsoluteFill>
      <Dark dur={dur} zoom={[1.0, 1.04]}>
        <Ground />
        <div style={{position: 'absolute', left: 560 - 250 * shrink, top: 420, width: 500 * shrink, height: 800, opacity: 0.8, background: 'linear-gradient(180deg, rgba(243,239,231,0.40), rgba(243,239,231,0.08))', clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)'}} />
        {new Array(8).fill(0).map((_, i) => <Sheep key={i} x={300 + (i % 4) * 160} y={1050 - Math.floor(i / 4) * 140} s={0.75} look={0} tint="#b9b0a0" bob={Math.sin(frame / 6 + i) * 3} />)}
        <Sheep x={470} y={960} s={1.2} look={frame > oAt + 20 ? 0 : -1} />
        <Stain x={470} y={960} s={1.2} />
      </Dark>
      <div style={{position: 'absolute', left: 60, right: 200, top: 360, textAlign: 'center', opacity: sendIn}}>
        <span style={{display: 'inline-block', fontFamily: DISPLAY, fontSize: 50, lineHeight: 1.1, color: '#15181d', background: R.line, padding: '12px 26px', borderRadius: 16}}>{(scene.send as string) ?? 'SEND THIS TO THE FRIEND WHO THINKS EVERYONE NOTICED'}</span>
      </div>
      <Syn x={150} y={1175} size={200} pose="point" from={0} to={dur + 20} mouth={mouthAt(cues(scene.id), frame, fps)} />
    </AbsoluteFill>
  );
};

export const RULE4_SCENES: Record<string, React.FC<SceneProps>> = {stainHook: StainHook, spotlightSheep: SpotlightSheep, countNoticed: CountNoticed, spotCard: SpotCard, humanSpot: HumanSpot, spotOff: SpotOff};
