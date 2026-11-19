import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Syn} from '../components/Host';
import {Dark, Narrator, R, RuleBadge, Sheep} from './rule1';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';

/* THE HIDDEN RULE #3 — bystander effect (Latané & Darley 1968 smoke-filled room). Dark-parable style, same sheep world as #1.
   Red accent = the danger (smoke glow / the one who acts). Acting follows anticipation → action → hold → settle. */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);

/* drifting smoke puffs from a vent at (vx, vy) */
const Smoke: React.FC<{vx: number; vy: number; start: number; density?: number}> = ({vx, vy, start, density = 1}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = frame - start;
  return (
    <>
      {new Array(Math.round(14 * density)).fill(0).map((_, i) => {
        const life = (t * 1.6 + i * 23) % 260;
        const x = vx + Math.sin((i * 37 + life) / 40) * 60 + life * (i % 2 ? 1.2 : -0.6);
        const y = vy + life * 1.4;
        const r = 40 + life * 0.6;
        return <div key={i} style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: 'radial-gradient(circle, rgba(200,200,205,0.42), rgba(200,200,205,0) 70%)', opacity: Math.min(1, t / 20) * (1 - life / 300)}} />;
      })}
    </>
  );
};

const Barn: React.FC<{children?: React.ReactNode; haze?: number}> = ({children, haze = 0}) => (
  <>
    {new Array(8).fill(0).map((_, i) => <div key={i} style={{position: 'absolute', left: i * 140, top: 300, width: 6, height: 1200, background: 'rgba(230,218,195,0.08)'}} />)}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1180, height: 8, background: R.grey, opacity: 0.6}} />
    <div style={{position: 'absolute', left: 780, top: 330, width: 160, height: 70, border: `5px solid ${R.grey}`, borderRadius: 8, backgroundImage: `repeating-linear-gradient(0deg, ${R.grey} 0 5px, transparent 5px 16px)`}} />
    {children}
    {haze > 0 ? <AbsoluteFill style={{background: `rgba(190,190,195,${haze * 0.35})`}} /> : null}
  </>
);

/* smokeHook: { badge, smokeOnWord, sheepOnWord } — HOOK: the faceless narrator opens a vent; smoke curls in; nine sheep in a row ignore it. */
const SmokeHook: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const sAt = at(captions, scene.smokeOnWord, fps30(), 0);
  const nAt = at(captions, scene.sheepOnWord, fps30(), dur * 0.5);
  return (
    <AbsoluteFill>
      <Dark dur={dur}>
        <Barn>
          <Smoke vx={860} vy={400} start={Math.max(0, sAt - 4)} />
          <Narrator x={60} y={520} s={1.05} arm={interpolate(frame, [sAt - 8, sAt + 4], [0, -30], clamp)} />
          {new Array(5).fill(0).map((_, i) => frame >= nAt + i * 3 ? <Sheep key={i} x={330 + i * 140} y={1040 + (i % 2) * 20} s={0.75} look={-0.4} /> : null)}
          <div style={{position: 'absolute', left: 860, top: 440, width: 18, height: 18, borderRadius: 9, background: R.red, boxShadow: `0 0 30px 10px ${R.red}`, opacity: 0.6 + 0.4 * Math.sin(frame / 5)}} />
        </Barn>
      </Dark>
      {frame >= 60 ? <RuleBadge text={(scene.badge as string) ?? 'THE HIDDEN RULE #3'} /> : null}
    </AbsoluteFill>
  );
};
const fps30 = () => 30;

/* newSheep: { smellOnWord, lookOnWord } — the tenth sheep (slightly lighter) alone in front; it sniffs (anticipation), eyes snap to the smoke (action), hold, then turn to the flock. */
const NewSheep: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sAt = at(captions, scene.smellOnWord, fps, dur * 0.3);
  const lAt = at(captions, scene.lookOnWord, fps, dur * 0.6);
  const look = frame < sAt ? 0 : frame < lAt ? interpolate(frame, [sAt, sAt + 5], [0, 1], clamp) : interpolate(frame, [lAt, lAt + 6], [1, -1], clamp);
  const sniff = frame >= sAt - 8 && frame < sAt ? Math.sin(frame) * 4 : 0;
  return (
    <Dark dur={dur} zoom={[1.0, 1.06]}>
      <Barn haze={0.2}>
        <Smoke vx={880} vy={400} start={0} density={1.2} />
        {new Array(4).fill(0).map((_, i) => <Sheep key={i} x={40 + i * 120} y={760} s={0.6} look={-0.3} tint="#9a9284" />)}
        <Sheep x={320} y={980 + sniff} s={1.6} look={look} tint={R.white} />
        {frame >= sAt ? <div style={{position: 'absolute', left: 640, top: 900, fontFamily: DISPLAY, fontSize: 90, color: R.red, opacity: interpolate(frame, [sAt, sAt + 6], [0, 1], clamp)}}>!</div> : null}
      </Barn>
      <div style={{position: 'absolute', left: 0, right: 140, top: 330, textAlign: 'center', fontFamily: DISPLAY, fontSize: 60, color: R.white}}>{(scene.top as string) ?? 'THE NEW ONE'}</div>
    </Dark>
  );
};

/* calmFlock: { onWords[] } — the nine keep chewing, perfectly calm, while the smoke thickens; "CALM." "BORED." pop over them. */
const CalmFlock: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ws = (scene.onWords as string[]) ?? [];
  const words = (scene.words as string[]) ?? ['CALM.', 'BORED.'];
  const haze = interpolate(frame, [0, dur], [0.25, 0.5], clamp);
  return (
    <Dark dur={dur}>
      <Barn haze={haze}>
        <Smoke vx={880} vy={400} start={0} density={1.5} />
        {new Array(9).fill(0).map((_, i) => <Sheep key={i} x={50 + (i % 5) * 190} y={640 + Math.floor(i / 5) * 260} s={0.85} look={0} bob={Math.sin(frame / 6 + i) * 3} tint="#b9b0a0" />)}
        {words.map((w, i) => {
          const a = at(captions, ws[i], fps, 10 + i * 25);
          if (frame < a) return null;
          const s = spring({frame: frame - a, fps, config: {damping: 12}});
          return <div key={i} style={{position: 'absolute', left: 140 + i * 420, top: 1140, scale: String(s), fontFamily: DISPLAY, fontSize: 80, color: '#15181d', background: R.line, padding: '4px 24px', borderRadius: 14}}>{w}</div>;
        })}
      </Barn>
    </Dark>
  );
};

/* sheepStays: { coughOnWord, stayOnWord } — the new sheep coughs (anticipation-shake), looks at the door, then sits back down (settle). Red "STAYED" stamp. */
const SheepStays: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cAt = at(captions, scene.coughOnWord, fps, dur * 0.4);
  const sAt = at(captions, scene.stayOnWord, fps, 6);
  const shake = frame >= cAt && frame < cAt + 10 ? Math.sin(frame * 2.5) * 8 : 0;
  const st = spring({frame: frame - sAt, fps, config: {damping: 10, stiffness: 240}});
  return (
    <Dark dur={dur}>
      <Barn haze={0.55}>
        <Smoke vx={880} vy={400} start={0} density={1.7} />
        <div style={{position: 'absolute', left: 60, top: 560, width: 220, height: 420, border: `6px solid ${R.line}`, borderRadius: '110px 110px 0 0', background: 'rgba(243,239,231,0.08)'}} />
        <div style={{position: 'absolute', left: 90, top: 500, fontFamily: BODY, fontWeight: 800, fontSize: 34, color: R.line, letterSpacing: 3}}>EXIT</div>
        <Sheep x={440 + shake} y={940} s={1.6} look={frame >= cAt + 10 ? -1 : 0} tint={R.white} />
        {frame >= cAt ? <div style={{position: 'absolute', left: 760, top: 900, fontFamily: DISPLAY, fontSize: 56, color: R.white, opacity: frame < cAt + 20 ? 1 : 0}}>*cough*</div> : null}
        {frame >= sAt ? <div style={{position: 'absolute', left: 0, right: 140, top: 360, textAlign: 'center'}}><span style={{display: 'inline-block', fontFamily: DISPLAY, fontSize: 120, color: R.red, border: `8px solid ${R.red}`, borderRadius: 16, padding: '0 30px', rotate: '-8deg', scale: String(2 - st)}}>STAYED</span></div> : null}
      </Barn>
    </Dark>
  );
};

/* smokeCard: { title, aloneOnWord, groupOnWord } — THE BYSTANDER EFFECT + the 1968 smoke room: alone 75% reported it; next to two people who ignored it, 10%. */
const SmokeCard: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const aAt = at(captions, scene.aloneOnWord, fps, dur * 0.35);
  const gAt = at(captions, scene.groupOnWord, fps, dur * 0.7);
  const t = spring({frame, fps, config: {damping: 14}});
  const bar = (a: number, v: number) => interpolate(frame, [a, a + 20], [0, v], clamp);
  return (
    <Dark dur={dur} zoom={[1.0, 1.03]}>
      <div style={{position: 'absolute', left: 0, right: 140, top: 330, textAlign: 'center', opacity: t}}>
        <div style={{fontFamily: DISPLAY, fontSize: 92, color: R.white, lineHeight: 1}}>{(scene.title as string) ?? 'THE BYSTANDER EFFECT'}</div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 34, color: R.grey, marginTop: 14, letterSpacing: 2}}>1968 · A ROOM SLOWLY FILLS WITH SMOKE</div>
      </div>
      {[{lab: 'ALONE', v: 75, a: aAt, c: R.line, icon: '🧍'}, {lab: 'WITH 2 WHO IGNORED IT', v: 10, a: gAt, c: R.red, icon: '🧍🧍🧍'}].map((b, i) => frame >= b.a ? (
        <div key={i} style={{position: 'absolute', left: 80, top: 620 + i * 250}}>
          <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 36, color: R.white, letterSpacing: 2}}>{b.icon} {b.lab} → REPORTED IT</div>
          <div style={{marginTop: 14, height: 80, width: 8 * bar(b.a, b.v), background: b.c, borderRadius: 12}} />
          <div style={{position: 'absolute', left: 8 * bar(b.a, b.v) + 24, top: 54, fontFamily: DISPLAY, fontSize: 84, color: b.c}}>{Math.round(bar(b.a, b.v))}%</div>
        </div>
      ) : null)}
    </Dark>
  );
};

/* everyoneWaits: { line, waitOnWord } — three small everyday vignettes as line icons (a fight in the street, a friend alone, a cruel comment), a crowd of stick figures around each, nobody moves; "EVERYONE WAITS". */
const EveryoneWaits: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const wAt = at(captions, scene.waitOnWord, fps, dur * 0.75);
  const items = ['🗯️', '🫥', '💬'];
  const labels = (scene.labels as string[]) ?? ['A FIGHT IN THE STREET', 'A FRIEND WHO ISN\'T OK', 'A COMMENT THAT GOES TOO FAR'];
  return (
    <AbsoluteFill>
      <Dark dur={dur}>
        <div style={{position: 'absolute', left: 0, right: 140, top: 310, textAlign: 'center', fontFamily: DISPLAY, fontSize: 58, color: R.white, lineHeight: 1.05}}>{(scene.line as string) ?? "YOU THINK I'M TALKING ABOUT SHEEP."}</div>
        {items.map((ic, i) => {
          const s = spring({frame: frame - 12 - i * 22, fps, config: {damping: 13}});
          return (
            <div key={i} style={{position: 'absolute', left: 70, top: 480 + i * 200, width: 860, height: 170, border: `4px solid ${R.line}`, borderRadius: 22, display: 'flex', alignItems: 'center', gap: 26, paddingLeft: 30, opacity: s, translate: `${(1 - s) * 60}px 0`}}>
              <span style={{fontSize: 80}}>{ic}</span>
              <span style={{fontFamily: DISPLAY, fontSize: 50, color: R.white}}>{labels[i]}</span>
            </div>
          );
        })}
        {frame >= wAt ? <div style={{position: 'absolute', left: 0, right: 140, top: 1110, textAlign: 'center'}}><span style={{fontFamily: DISPLAY, fontSize: 66, color: '#15181d', background: R.line, padding: '6px 26px', borderRadius: 14}}>⏳ EVERYONE WAITS</span></div> : null}
      </Dark>
      <Syn x={130} y={1400} size={160} pose="think" from={Math.round(wAt)} to={dur} />
    </AbsoluteFill>
  );
};

/* moveFirst: { moveOnWord } — back in the smoky barn: ONE sheep (red outline glow) stands and walks to the exit; the others start to look up. Loops into the hook. */
const MoveFirst: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const mAt = at(captions, scene.moveOnWord, fps, 10);
  const walk = interpolate(frame, [mAt, mAt + 50], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Dark dur={dur}>
        <Barn haze={0.4}>
          <Smoke vx={880} vy={400} start={0} density={1.4} />
          <div style={{position: 'absolute', left: 60, top: 560, width: 220, height: 420, border: `6px solid ${R.red}`, borderRadius: '110px 110px 0 0', boxShadow: `0 0 50px ${R.red}`, opacity: 0.4 + walk * 0.6}} />
          {new Array(4).fill(0).map((_, i) => <Sheep key={i} x={560 + (i % 2) * 200} y={760 + Math.floor(i / 2) * 200} s={0.75} look={frame > mAt + 25 ? -1 : 0} tint="#b9b0a0" />)}
          {(() => { const sx = interpolate(walk, [0, 1], [420, 120]); return (
            <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, filter: `drop-shadow(0 0 14px ${R.red})`, transform: 'scaleX(-1)', transformOrigin: `${sx + 124}px 0`}}>
              <Sheep x={sx} y={1000 + Math.sin(frame / 3) * (walk > 0 && walk < 1 ? 6 : 0)} s={1.3} look={1} tint={R.white} />
            </div>); })()}
        </Barn>
        <div style={{position: 'absolute', left: 0, right: 140, top: 340, textAlign: 'center'}}><span style={{fontFamily: DISPLAY, fontSize: 70, color: R.white, background: R.red, padding: '6px 28px', borderRadius: 14, opacity: frame >= mAt ? 1 : 0}}>{(scene.tag as string) ?? 'BE THE ONE WHO MOVES FIRST'}</span></div>
      </Dark>
      <Syn x={830} y={1400} size={150} pose="point" from={Math.round(dur * 0.75)} to={dur} />
    </AbsoluteFill>
  );
};

export const RULE3_SCENES: Record<string, React.FC<SceneProps>> = {smokeHook: SmokeHook, newSheep: NewSheep, calmFlock: CalmFlock, sheepStays: SheepStays, smokeCard: SmokeCard, everyoneWaits: EveryoneWaits, moveFirst: MoveFirst};
