import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Syn, mouthAt, type MouthCue} from '../components/Host';
import {Dark, R, RuleBadge, Sheep} from './rule1';
import {wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';
import mouthData from '../generated/rule5-ikea.mouth.json';

/* THE HIDDEN RULE #5 — the IKEA effect (Norton, Mochon & Ariely 2012, J. Consumer Psychology 22(3)).
   Dark sheep world, red accent = the price tag. Test arm W1-A: frame 0 already shows the payoff picture
   (the proud sheep and his wobbling, "priceless" chair) with 3–5 words that work with the sound off. */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const at = (captions: SceneProps['captions'], w: unknown, fps: number, fb: number) => (w ? wordFrame(captions, w as string, fps, fb) : fb);
const cues = (id: string) => (mouthData as {scenes: Record<string, MouthCue[]>}).scenes[id];
const Ground: React.FC<{y?: number}> = ({y = 1200}) => <div style={{position: 'absolute', left: 0, right: 0, top: y, height: 6, background: R.grey, opacity: 0.5}} />;

/* A simple wooden chair. wobble = rocking angle in degrees (built-by-sheep version has uneven legs). */
export const Chair: React.FC<{x: number; y: number; s?: number; wobble?: number; neat?: boolean; apart?: number}> = ({x, y, s = 1, wobble = 0, neat = false, apart = 0}) => {
  const wood = neat ? '#b7865a' : '#a87a4f';
  const off = (i: number) => (apart ? {translate: `${Math.cos(i * 2.1) * 160 * apart}px ${Math.abs(Math.sin(i * 1.3)) * 260 * apart}px`, rotate: `${(i % 2 ? 1 : -1) * 70 * apart}deg`} : {});
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 220 * s, height: 300 * s, rotate: `${wobble}deg`, transformOrigin: '50% 100%'}}>
      <svg width={220 * s} height={300 * s} viewBox="0 0 220 300" style={{overflow: 'visible'}}>
        <g style={off(1)}><rect x="30" y="0" width="22" height={neat ? 160 : 150} rx="4" fill={wood} stroke="#2a1d12" strokeWidth="5" transform={neat ? '' : 'rotate(-4 41 80)'} /></g>
        <g style={off(2)}><rect x="168" y="6" width="22" height={neat ? 154 : 160} rx="4" fill={wood} stroke="#2a1d12" strokeWidth="5" transform={neat ? '' : 'rotate(5 179 80)'} /></g>
        <g style={off(3)}><rect x="40" y={neat ? 30 : 24} width="140" height="20" rx="4" fill={wood} stroke="#2a1d12" strokeWidth="5" transform={neat ? '' : 'rotate(-7 110 34)'} /></g>
        <g style={off(4)}><rect x="20" y="150" width="180" height="28" rx="6" fill={wood} stroke="#2a1d12" strokeWidth="5" transform={neat ? '' : 'rotate(3 110 164)'} /></g>
        <g style={off(5)}><rect x="30" y="176" width="20" height={neat ? 120 : 104} rx="4" fill={wood} stroke="#2a1d12" strokeWidth="5" /></g>
        <g style={off(6)}><rect x="170" y="176" width="20" height={neat ? 120 : 124} rx="4" fill={wood} stroke="#2a1d12" strokeWidth="5" /></g>
        {!neat && !apart ? <><circle cx="60" cy="40" r="5" fill="#cfcfcf" stroke="#2a1d12" strokeWidth="2" /><circle cx="160" cy="164" r="5" fill="#cfcfcf" stroke="#2a1d12" strokeWidth="2" /></> : null}
      </svg>
    </div>
  );
};

/* A red price tag hanging from a string. */
const Tag: React.FC<{x: number; y: number; text: string; swing?: number; s?: number}> = ({x, y, text, swing = 0, s = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, rotate: `${swing}deg`, transformOrigin: '20px 0px', scale: String(s)}}>
    <div style={{position: 'absolute', left: 18, top: 0, width: 3, height: 50, background: R.line}} />
    <div style={{position: 'absolute', left: -40, top: 48, padding: '10px 22px', background: R.red, color: R.white, fontFamily: DISPLAY, fontSize: 44, borderRadius: '10px 26px 26px 10px', whiteSpace: 'nowrap', boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>{text}</div>
  </div>
);

/* ikeaHook: { badge } — frame 0: the sheep stands proudly by his crooked chair, which is already rocking; a red
   "PRICELESS" tag swings from it; top text "WOBBLY. BUT PRICELESS?". Hard punch-in on chair + tag at 1.2 s. */
const IkeaHook: React.FC<SceneProps> = ({scene, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cut = 36;
  const wob = Math.sin(frame / 3.2) * 6;
  return (
    <AbsoluteFill>
      <Dark dur={dur} zoom={[1, 1]}>
        <Ground />
        <AbsoluteFill style={{scale: frame >= cut ? '1.35' : '1', transformOrigin: '620px 900px'}}>
          <Sheep x={160} y={820} s={1.9} look={1} bob={Math.sin(frame / 4) * 4} />
          <Chair x={560} y={830} s={1.25} wobble={wob} />
          <Tag x={600} y={760} text="PRICELESS" swing={Math.sin(frame / 4 + 1) * 12} />
          {frame % 24 < 3 ? <div style={{position: 'absolute', left: 700, top: 1190, fontFamily: DISPLAY, fontSize: 40, color: R.grey}}>clack</div> : null}
        </AbsoluteFill>
      </Dark>
      <div style={{position: 'absolute', left: 0, right: 140, top: 340, textAlign: 'center', fontFamily: DISPLAY, fontSize: 84, color: R.white, lineHeight: 1}}>WOBBLY. <span style={{color: R.red}}>BUT PRICELESS?</span></div>
      {frame >= 60 ? <RuleBadge text={(scene.badge as string) ?? 'THE HIDDEN RULE #5'} /> : null}
      <Syn x={150} y={1175} size={200} pose="point" from={-20} to={dur} mouth={mouthAt(cues(scene.id), frame, fps)} />
    </AbsoluteFill>
  );
};

/* twinChair: { neatOnWord, swapOnWord } — hard cut: next door, a second sheep with a perfect, already-built chair.
   On "swap": a tuft of grass appears with a ⇄ — he'd trade it for grass. */
const TwinChair: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sAt = at(captions, scene.swapOnWord, fps, dur * 0.6);
  const pop = spring({frame: frame - sAt, fps, config: {damping: 11}});
  return (
    <Dark dur={dur} zoom={[1.0, 1.05]}>
      <Ground y={1150} />
      <div style={{position: 'absolute', left: 540, top: 600, width: 4, height: 600, background: R.grey, opacity: 0.35}} />
      <div style={{position: 'absolute', left: 40, top: 520, width: 460, textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 34, color: R.grey, letterSpacing: 2}}>BUILT IT HIMSELF</div>
      <div style={{position: 'absolute', left: 580, top: 520, width: 420, textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 34, color: R.grey, letterSpacing: 2}}>GOT IT READY-MADE</div>
      <Sheep x={30} y={870} s={1.1} look={1} />
      <Chair x={260} y={880} s={0.85} wobble={Math.sin(frame / 3.2) * 6} />
      <Sheep x={600} y={870} s={1.1} look={-1} tint="#b9b0a0" />
      <Chair x={820} y={880} s={0.85} neat />
      <div style={{position: 'absolute', left: 0, right: 140, top: 330, textAlign: 'center', fontFamily: DISPLAY, fontSize: 76, color: R.white}}>SAME CHAIR.</div>
      {frame >= sAt ? (
        <div style={{position: 'absolute', left: 590, top: 690, display: 'flex', alignItems: 'center', gap: 16, scale: String(pop)}}>
          <span style={{fontFamily: DISPLAY, fontSize: 80, color: R.line}}>⇄</span>
          <svg width="130" height="80" viewBox="0 0 130 80"><path d="M10 78 q8 -40 4 -70 M30 78 q2 -50 14 -74 M52 78 q-2 -40 -10 -64 M70 78 q4 -44 18 -70 M92 78 q0 -36 -8 -58 M110 78 q6 -40 14 -66" stroke="#6fae5b" strokeWidth="7" fill="none" strokeLinecap="round" /></svg>
          <span style={{fontFamily: DISPLAY, fontSize: 50, color: R.line}}>FOR GRASS</span>
        </div>
      ) : null}
    </Dark>
  );
};

/* howMuch: { answerOnWord } — "HOW MUCH MORE?" over a price meter that climbs past the ready-made price; the answer lands 1–2 s later in the next scene. */
const HowMuch: React.FC<SceneProps> = ({durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [4, dur], [0.2, 0.85], clamp);
  return (
    <Dark dur={dur} zoom={[1.0, 1.06]}>
      <div style={{position: 'absolute', left: 0, right: 140, top: 360, textAlign: 'center', fontFamily: DISPLAY, fontSize: 100, color: R.white, scale: String(1 + 0.03 * Math.sin(frame / 3))}}>HOW MUCH MORE?</div>
      <div style={{position: 'absolute', left: 130, top: 640, width: 680, height: 90, borderRadius: 45, border: `5px solid ${R.line}`, overflow: 'hidden'}}>
        <div style={{width: `${fill * 100}%`, height: '100%', background: `linear-gradient(90deg, ${R.line}, ${R.red})`}} />
      </div>
      <div style={{position: 'absolute', left: 130, top: 750, width: 680, display: 'flex', justifyContent: 'space-between', fontFamily: BODY, fontWeight: 800, fontSize: 32, color: R.grey}}><span>READY-MADE PRICE</span><span>?</span></div>
      <Chair x={400} y={850} s={0.9} wobble={Math.sin(frame / 3) * 7} />
    </Dark>
  );
};

/* ikeaCard: { buildOnWord, pctOnWord } — THE IKEA EFFECT card: two bars — given it already built = 100, built it = 163, "+63%". */
const IkeaCard: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bAt = at(captions, scene.buildOnWord, fps, dur * 0.3);
  const pAt = at(captions, scene.pctOnWord, fps, dur * 0.55);
  const t = spring({frame, fps, config: {damping: 14}});
  const bar = (a: number, v: number) => interpolate(frame, [a, a + 16], [0, v], clamp);
  const pop = spring({frame: frame - pAt, fps, config: {damping: 10}});
  return (
    <Dark dur={dur} zoom={[1.0, 1.03]}>
      <div style={{position: 'absolute', left: 0, right: 140, top: 330, textAlign: 'center', opacity: t}}>
        <div style={{fontFamily: DISPLAY, fontSize: 104, color: R.white, lineHeight: 1}}>THE IKEA EFFECT</div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 34, color: R.grey, marginTop: 14, letterSpacing: 2}}>ONE STUDY · A PLAIN STORAGE BOX</div>
      </div>
      {[{lab: 'GIVEN IT READY-BUILT', v: 100, a: bAt, c: R.line}, {lab: 'BUILT IT THEMSELVES', v: 163, a: pAt, c: R.red}].map((b, i) => frame >= b.a ? (
        <div key={i} style={{position: 'absolute', left: 80, top: 640 + i * 230}}>
          <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 38, color: R.white, letterSpacing: 2}}>{b.lab}</div>
          <div style={{marginTop: 12, height: 80, width: 4.4 * bar(b.a, b.v), background: b.c, borderRadius: 12}} />
        </div>
      ) : null)}
      {frame >= pAt ? <div style={{position: 'absolute', left: 0, right: 140, top: 1010, textAlign: 'center', fontFamily: DISPLAY, fontSize: 150, color: R.red, scale: String(pop)}}>+63%</div> : null}
    </Dark>
  );
};

/* catchScene: { breakOnWord } — the twist: on "didn't" the half-built chair falls apart into pieces; the red tag
   flips to "WORTH NOTHING EXTRA". Text: "UNFINISHED = NO BONUS". */
const CatchScene: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const kAt = at(captions, scene.breakOnWord, fps, dur * 0.35);
  const apart = interpolate(frame, [kAt, kAt + 14], [0, 1], clamp);
  return (
    <Dark dur={dur} zoom={[1.06, 1.0]}>
      <Ground />
      <div style={{position: 'absolute', left: 0, right: 140, top: 340, textAlign: 'center', fontFamily: DISPLAY, fontSize: 80, color: R.white}}>BUT HERE&apos;S THE CATCH</div>
      <Sheep x={120} y={860} s={1.5} look={frame >= kAt ? 1 : 0} bob={frame >= kAt && frame < kAt + 12 ? Math.sin(frame * 2) * 6 : 0} />
      <Chair x={540} y={860} s={1.1} wobble={frame < kAt ? Math.sin(frame / 3) * 5 : 0} apart={apart} />
      {frame >= kAt + 10 ? <Tag x={600} y={700} text="NO BONUS" swing={Math.sin(frame / 5) * 8} /> : null}
      {frame >= kAt + 10 ? <div style={{position: 'absolute', left: 0, right: 140, top: 470, textAlign: 'center'}}><span style={{fontFamily: DISPLAY, fontSize: 62, color: '#15181d', background: R.line, padding: '6px 24px', borderRadius: 14}}>UNFINISHED = NO EXTRA LOVE</span></div> : null}
    </Dark>
  );
};

/* ikeaOff: { send } — payoff: the sheep sits on his wobbly chair next to a steaming pot labelled "BEST IN THE WORLD";
   silent send line on screen; Syn speaks the payoff; the last line loops into the hook. */
const IkeaOff: React.FC<SceneProps> = ({scene, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sendIn = spring({frame: frame - 12, fps, config: {damping: 13}});
  return (
    <AbsoluteFill>
      <Dark dur={dur} zoom={[1.0, 1.04]}>
        <Ground />
        <Chair x={430} y={880} s={1.0} wobble={Math.sin(frame / 3.2) * 5} />
        <Sheep x={400} y={760} s={1.2} look={-1} bob={Math.sin(frame / 4) * 3} />
        <div style={{position: 'absolute', left: 690, top: 1060, width: 150, height: 110, background: '#3a3f48', border: `5px solid ${R.line}`, borderRadius: '10px 10px 40px 40px'}} />
        {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 720 + i * 34, top: 980 - ((frame + i * 9) % 30) * 2, width: 14, height: 40, borderRadius: 7, background: R.white, opacity: 0.4 * (1 - ((frame + i * 9) % 30) / 30)}} />)}
        <Tag x={700} y={1110} text="BEST IN THE WORLD" s={0.7} swing={Math.sin(frame / 5) * 6} />
      </Dark>
      <div style={{position: 'absolute', left: 60, right: 200, top: 360, textAlign: 'center', opacity: sendIn}}>
        <span style={{display: 'inline-block', fontFamily: DISPLAY, fontSize: 50, lineHeight: 1.1, color: '#15181d', background: R.line, padding: '12px 26px', borderRadius: 16}}>{(scene.send as string) ?? 'SEND THIS TO THE FRIEND WHO THINKS THEIR COOKING IS THE BEST'}</span>
      </div>
      <Syn x={150} y={1175} size={200} pose="point" from={0} to={dur + 20} mouth={mouthAt(cues(scene.id), frame, fps)} />
    </AbsoluteFill>
  );
};

export const RULE5_SCENES: Record<string, React.FC<SceneProps>> = {ikeaHook: IkeaHook, twinChair: TwinChair, howMuch: HowMuch, ikeaCard: IkeaCard, catchScene: CatchScene, ikeaOff: IkeaOff};
