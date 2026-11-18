import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SceneProps} from '../types';
import {Boy} from '../components/Boy';
import {Camera, Embers, Shake} from '../components/Fx';
import {BigBackText, Flames, HorizonFlashes, Sky, Skyline, Smoke, wordFrame} from './kit';
import {BODY, DISPLAY} from '../fonts';
import {EXPLAINER_SCENES} from './explainer';
import {TECH_SCENES} from './tech';
import {STORY2_SCENES} from './story2';
import {BODY2_SCENES} from './body2';
import {SERIES1_SCENES} from './series1';
import {ANIME_SCENES} from './anime';
import {STORY3_SCENES} from './story3';
import {EXPLAINER2_SCENES} from './explainer2';
import {STORY4_SCENES} from './story4';
import {EXPLAINER3_SCENES} from './explainer3';
import {STORY5_SCENES} from './story5';
import {SURVIVE_SCENES} from './survive';
import {DAYCLOCK_SCENES} from './dayclock';
import {NEWS_SCENES} from './newsflash';
import {TIMEFACT_SCENES} from './timefacts';
import {STORY6_SCENES} from './story6';
import {STORY7_SCENES} from './story7';
import {STORY8_SCENES} from './story8';
import {STORY9_SCENES} from './story9';
import {STORY10_SCENES} from './story10';
import {STORY11_SCENES} from './story11';
import {PSYCH1_SCENES} from './psych1';
import {PSYCH2_SCENES} from './psych2';
import {STORY12_SCENES} from './story12';
import {LEONARDO_SCENES} from './leonardo';
import {STORY13_SCENES} from './story13';
import {TRYTHIS1_SCENES} from './trythis1';
import {STORY15_SCENES} from './story15';
import {STORY16_SCENES} from './story16';
import {RULE1_SCENES} from './rule1';
import {BODY3_SCENES} from './body3';
import {BODY4_SCENES} from './body4';
import {STORY14_SCENES} from './story14';
import {WHATIF3_SCENES} from './whatif3';
import {WOJTEK_SCENES} from './wojtek';
import {STORY17_SCENES} from './story17';
import {TRYTHIS2_SCENES} from './trythis2';
import {STORY18_SCENES} from './story18';
import {RULE2_SCENES} from './rule2';
import {WHATIF4_SCENES} from './whatif4';
import {HISTORY1_SCENES} from './history1';
import {HISTORY2_SCENES} from './history2';
import {HISTORY3_SCENES} from './history3';
import {HISTORY4_SCENES} from './history4';
import {MEDICINE1_SCENES} from './medicine1';
import {MEAT1_SCENES} from './meat1';
import {SPACE1_SCENES} from './space1';
import {BODY1_SCENES} from './body1';
import {HISTORY5_SCENES} from './history5';
import {GPS_SCENES} from './gps';
import {OCEAN_SCENES} from './ocean';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* 1 — HOOK: burning red sky, tiny silhouette on a hill */
const WarSky: React.FC<SceneProps> = ({sb, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const c = sb.character.palette;
  return (
    <Shake at={0} amount={26}>
      <Camera dur={dur} from={1.25} to={1.0}>
        <Sky top="#1a0505" mid="#7a1a0c" bottom="#ff6a2b" />
        <HorizonFlashes y={1250} times={[2, 30, 55, 80]} />
        <Skyline y={1300} color="#2a0a08" seed="far" height={300} />
        <Smoke x={700} y={1250} spread={400} />
        <Skyline y={1380} color="#120404" seed="near" height={220} />
        <svg style={{position: 'absolute', top: 1360}} width={1080} height={600}>
          <path d="M0 140 Q540 -40 1080 140 L1080 600 L0 600 Z" fill="#050203" />
        </svg>
        <Boy x={540} y={1395} height={200} skin={c.skin} rim={c.rim} glow={0.6 + 0.4 * Math.sin(frame / 5)} />
        <Embers count={70} />
      </Camera>
    </Shake>
  );
};

/* 2 — Stone house in flames, 1991 */
const BurningHouse: React.FC<SceneProps> = ({sb, durationInFrames: dur, captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const yr = wordFrame(captions, '1991', fps);
  const burn = wordFrame(captions, 'burned', fps, dur * 0.7);
  const fire = interpolate(frame, [burn - 30, burn + 10], [0.25, 1], clamp);
  return (
    <Camera dur={dur} from={1.0} to={1.15} panY={-60}>
      <Sky top="#05060d" mid="#1b1020" bottom={fire > 0.6 ? '#5a1a0a' : '#2a1218'} />
      <BigBackText text="1991" top={240} color={`rgba(255,120,60,${interpolate(frame, [yr, yr + 10], [0, 0.35], clamp)})`} />
      {/* hillside */}
      <svg style={{position: 'absolute', top: 1050}} width={1080} height={900}>
        <path d="M-50 260 Q500 60 1130 220 L1130 900 L-50 900 Z" fill="#0c0a0e" />
      </svg>
      {/* stone house */}
      <div style={{position: 'absolute', left: 330, top: 900, width: 420, height: 260, background: '#2b2626',
        boxShadow: `0 0 ${120 * fire}px rgba(255,90,30,${0.8 * fire})`}}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{position: 'absolute', left: (i % 3) * 140 + 5, top: Math.floor(i / 3) * 130 + 5, width: 130, height: 120, border: '3px solid #1d1919'}} />
        ))}
        <div style={{position: 'absolute', left: 60, top: 80, width: 70, height: 80, background: `rgba(255,170,60,${fire})`}} />
        <div style={{position: 'absolute', left: 290, top: 80, width: 70, height: 80, background: `rgba(255,170,60,${fire})`}} />
      </div>
      <svg style={{position: 'absolute', left: 300, top: 760}} width={480} height={150}>
        <path d="M0 145 L240 10 L480 145 Z" fill="#1f1a1a" />
      </svg>
      <div style={{opacity: fire}}>
        <Flames x={540} y={1000} w={520} h={420 * fire + 80} />
      </div>
      <Smoke x={560} y={850} spread={350} />
      <Embers count={Math.round(30 + 60 * fire)} seed="h" rise={8} />
      {/* the boy watching from below, back to camera */}
      <Boy x={250} y={1700} height={260} skin={sb.character.palette.skin} rim="#ff7a3d" glow={fire} />
    </Camera>
  );
};

/* 3 — Hotel full of refugees, windows lighting up */
const RefugeeHotel: React.FC<SceneProps> = ({sb, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const cols = 7, rows = 11;
  return (
    <Camera dur={dur} from={1.1} to={1.0} panY={80}>
      <Sky top="#04070f" mid="#0b1830" bottom="#1d2b44" />
      <Skyline y={1500} color="#060a14" seed="coast" height={240} windows="#ffcf7a" />
      <div style={{position: 'absolute', left: 200, top: 360, width: 680, height: 1200, background: '#141a26',
        borderTop: '18px solid #0e121b', boxShadow: '0 0 80px rgba(0,0,0,0.8)'}}>
        {new Array(rows * cols).fill(0).map((_, i) => {
          const r = Math.floor(i / cols), c = i % cols;
          const on = frame > random(`win${i}`) * dur * 0.8;
          const person = random(`p${i}`) > 0.55;
          return (
            <div key={i} style={{position: 'absolute', left: 30 + c * 92, top: 40 + r * 102, width: 60, height: 70,
              background: on ? '#ffc56b' : '#0a0d14', boxShadow: on ? '0 0 26px rgba(255,190,90,0.7)' : 'none', overflow: 'hidden'}}>
              {on && person && (
                <div style={{position: 'absolute', left: 16, bottom: 0, width: 28, height: 44, background: '#2a1a0c', borderRadius: '14px 14px 0 0'}} />
              )}
            </div>
          );
        })}
        <div style={{position: 'absolute', bottom: 0, left: 280, width: 120, height: 150, background: '#ffb44a', boxShadow: '0 0 60px #ffb44a'}} />
      </div>
      <div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', fontFamily: BODY, fontWeight: 800,
        fontSize: 44, letterSpacing: 18, color: 'rgba(255,214,150,0.85)', opacity: interpolate(frame, [10, 30], [0, 1], clamp)}}>
        HOTEL · REFUGEE SHELTER
      </div>
      <Boy x={540} y={1700} height={230} skin={sb.character.palette.skin} rim="#ffc56b" />
    </Camera>
  );
};

/* 4 — Car park football under searchlights */
const CarPark: React.FC<SceneProps> = ({sb, durationInFrames: dur, captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const shells = wordFrame(captions, 'shells', fps, dur * 0.7);
  const bounce = Math.abs(Math.sin(frame / 7));
  return (
    <Shake at={shells} amount={14}>
      <Camera dur={dur} from={1.0} to={1.18}>
        <Sky top="#020308" mid="#0d1222" bottom="#1a1f2e" />
        {[0, 1].map((i) => (
          <div key={i} style={{position: 'absolute', left: 540, top: 1150, width: 70, height: 1400, transformOrigin: '50% 0%',
            rotate: `${180 + Math.sin(frame / 25 + i * 2) * 35 + (i ? 20 : -20)}deg`,
            background: 'linear-gradient(180deg, rgba(200,220,255,0.35), transparent)', filter: 'blur(8px)'}} />
        ))}
        <HorizonFlashes y={1150} times={[shells, shells + 12]} />
        <Skyline y={1160} color="#070910" seed="cp" height={200} />
        {/* asphalt with perspective parking lines */}
        <svg style={{position: 'absolute', top: 1160}} width={1080} height={760}>
          <rect width={1080} height={760} fill="#15161b" />
          {[-4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={540 + i * 60} y1={0} x2={540 + i * 330} y2={760} stroke="#e8e2c8" strokeWidth={6} opacity={0.5} />
          ))}
          <ellipse cx={540} cy={420} rx={420} ry={180} fill="rgba(255,200,120,0.18)" />
        </svg>
        {/* street lamp */}
        <div style={{position: 'absolute', left: 860, top: 700, width: 12, height: 700, background: '#0b0b0f'}} />
        <div style={{position: 'absolute', left: 520, top: 700, width: 700, height: 1000,
          background: 'radial-gradient(ellipse at 52% 0%, rgba(255,200,120,0.45), transparent 60%)', mixBlendMode: 'screen'}} />
        <Boy x={500} y={1640} height={300} pose="kick" phase={frame / 7} skin={sb.character.palette.skin} rim="#ffcf8a" />
        {/* ball */}
        <div style={{position: 'absolute', left: 560, top: 1620 - bounce * 260, width: 54, height: 54, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #fff, #bbb 60%, #555)', rotate: `${frame * 14}deg`,
          boxShadow: '0 0 20px rgba(255,220,160,0.6)'}}>
          <div style={{position: 'absolute', inset: 16, background: '#222', clipPath: 'polygon(50% 0,100% 38%,82% 100%,18% 100%,0 38%)'}} />
        </div>
        <div style={{position: 'absolute', left: 560, top: 1655, width: 60, height: 14, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', scale: String(1 - bounce * 0.5)}} />
      </Camera>
    </Shake>
  );
};

/* 5 — Trial report stamped TOO SMALL / TOO WEAK */
const Stamp: React.FC<{text: string; at: number; color: string; top: number; rot: number}> = ({text, at, color, top, rot}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const s = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 300}});
  return (
    <div style={{position: 'absolute', top, width: '100%', textAlign: 'center', rotate: `${rot}deg`,
      scale: String(interpolate(s, [0, 1], [3, 1])), opacity: interpolate(s, [0, 0.3], [0, 1], clamp)}}>
      <span style={{fontFamily: DISPLAY, fontSize: 150, color, border: `12px solid ${color}`, padding: '0 34px',
        letterSpacing: 6, mixBlendMode: 'multiply', opacity: 0.92}}>{text}</span>
    </div>
  );
};
const RejectedStamp: React.FC<SceneProps> = ({scene, captions, durationInFrames: dur}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const stamps = (scene.stamps as {text: string; onWord: string}[]) ?? [{text: 'TOO SMALL', onWord: 'small'}, {text: 'TOO WEAK', onWord: 'weak'}];
  const a = wordFrame(captions, stamps[0].onWord, fps, dur * 0.6);
  const b = wordFrame(captions, stamps[1].onWord, fps, dur * 0.8);
  return (
    <Shake at={a} amount={20}>
      <Shake at={b} amount={20}>
        <AbsoluteFill style={{background: '#1b1612'}} />
        <Camera dur={dur} from={1.05} to={1.15}>
          <div style={{position: 'absolute', left: 120, top: 280, width: 840, height: 1180, background: '#efe6d2',
            rotate: '-2deg', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', padding: 60}}>
            <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 52, color: '#2b2520', letterSpacing: 4}}>YOUTH TRIAL — REPORT</div>
            <div style={{height: 6, background: '#2b2520', margin: '24px 0 40px'}} />
            <div style={{display: 'flex', gap: 40}}>
              <div style={{width: 260, height: 320, background: '#cfc4ad', position: 'relative', overflow: 'hidden'}}>
                <Boy x={130} y={330} height={300} skin="#3a332b" rim="#cfc4ad" glow={0} />
                <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)'}} />
                <div style={{position: 'absolute', bottom: 8, width: '100%', textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 30, color: '#2b2520'}}>NAME: ██████</div>
              </div>
              <div style={{flex: 1}}>
                {['AGE', 'HEIGHT', 'WEIGHT', 'POSITION', 'TECHNIQUE', 'PHYSICAL'].map((l, i) => (
                  <div key={l} style={{fontFamily: BODY, fontWeight: 800, fontSize: 30, color: '#4a4036', marginBottom: 24}}>
                    {l}: <span style={{display: 'inline-block', width: 120 + (i * 37) % 90, height: 22, background: '#4a4036', opacity: 0.35}} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{marginTop: 60, fontFamily: BODY, fontWeight: 800, fontSize: 34, color: '#2b2520'}}>VERDICT:</div>
          </div>
          <Stamp text={stamps[0].text} at={a} color="#c8231b" top={720} rot={-8} />
          <Stamp text={stamps[1].text} at={b} color="#c8231b" top={900} rot={6} />
          <div style={{position: 'absolute', inset: 0, background: `rgba(200,35,27,${frame >= a ? 0.0 : 0})`}} />
        </Camera>
      </Shake>
    </Shake>
  );
};

/* 6 — He never stopped: silhouette grows child -> adult while running */
const GrowingUp: React.FC<SceneProps> = ({sb, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const p = frame / dur;
  const stage = p < 0.33 ? 'child' : p < 0.66 ? 'teen' : 'adult';
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #3a1408 0%, #0a0303 70%)'}}>
      {new Array(26).fill(0).map((_, i) => (
        <div key={i} style={{position: 'absolute', top: random(`ln${i}`) * 1920, left: ((-frame * 90 + random(`lx${i}`) * 3000) % 1600) + 1080 - 1600,
          width: 300 + random(`lw${i}`) * 400, height: 4, background: 'rgba(255,180,90,0.5)'}} />
      ))}
      <Boy x={540} y={1450} height={interpolate(p, [0, 1], [300, 640])} stage={stage} pose="run" phase={frame / 3}
        skin={sb.character.palette.skin} rim={sb.palette.gold} glow={1} />
      <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${200 + 120 * Math.abs(Math.sin(frame / 6))}px rgba(255,60,20,0.6)`}} />
    </AbsoluteFill>
  );
};

/* 7 — World Cup final: stadium lights, 2018 */
const StadiumFinal: React.FC<SceneProps> = ({sb, scene, durationInFrames: dur, captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const yr = wordFrame(captions, (scene.bigOnWord as string) ?? '2018', fps, 10);
  const s = spring({frame: frame - yr, fps, config: {damping: 14}});
  return (
    <Camera dur={dur} from={1.15} to={1.0}>
      <Sky top="#02040c" mid="#06102a" bottom="#0b3a1e" />
      {[180, 900].map((x, i) => (
        <div key={i} style={{position: 'absolute', left: x - 300, top: 200, width: 600, height: 1600, transformOrigin: '50% 0',
          rotate: `${i ? 18 : -18}deg`, background: 'linear-gradient(180deg, rgba(255,255,255,0.45), transparent 70%)', filter: 'blur(20px)', mixBlendMode: 'screen'}} />
      ))}
      {/* crowd bowl */}
      <svg style={{position: 'absolute', top: 820}} width={1080} height={700}>
        <path d="M-40 0 Q540 180 1120 0 L1120 700 L-40 700 Z" fill="#0d1018" />
        {new Array(380).fill(0).map((_, i) => {
          const x = random(`cx${i}`) * 1080;
          const y = 60 + random(`cy${i}`) * 360 + Math.abs(x - 540) * -0.15 + 80;
          const flash = random(`cf${i}-${Math.floor(frame / 3)}`) > 0.93;
          return <circle key={i} cx={x} cy={y} r={flash ? 4 : 2.5} fill={flash ? '#ffffff' : '#3a4560'} />;
        })}
      </svg>
      {/* pitch */}
      <svg style={{position: 'absolute', top: 1300}} width={1080} height={620}>
        <path d="M120 0 L960 0 L1180 620 L-100 620 Z" fill="#11612f" />
        <path d="M540 0 L540 620" stroke="rgba(255,255,255,0.5)" strokeWidth={5} />
        <ellipse cx={540} cy={250} rx={170} ry={70} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={5} />
      </svg>
      <Boy x={540} y={1720} height={420} stage="adult" skin={sb.character.palette.skin} rim="#ffffff" glow={1} />
      <div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', fontFamily: DISPLAY, fontSize: 300,
        color: sb.palette.gold, textShadow: '0 0 60px rgba(255,200,80,0.6)', scale: String(interpolate(s, [0, 1], [0.6, 1])), opacity: s}}>
        {(scene.bigText as string) ?? '2018'}
      </div>
      <div style={{position: 'absolute', top: 640, width: '100%', textAlign: 'center', fontFamily: BODY, fontWeight: 800,
        fontSize: 46, letterSpacing: 14, color: '#fff', opacity: interpolate(frame, [yr + 15, yr + 30], [0, 1], clamp)}}>
        {(scene.subText as string) ?? 'WORLD CUP FINAL'}
      </div>
      <Embers count={50} color="#ffe28a" seed="conf" rise={-4} />
    </Camera>
  );
};

/* 8 — The golden ball + "10 years" counter */
const GoldenBall: React.FC<SceneProps> = ({sb, scene, durationInFrames: dur, captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const gb = wordFrame(captions, (scene.trophyOnWord as string) ?? 'ballon', fps, 10);
  const custom = scene.topText as string | undefined;
  const dec = wordFrame(captions, (scene.textOnWord as string) ?? 'decade', fps, dur * 0.5);
  const s = spring({frame: frame - gb, fps, config: {damping: 10, mass: 0.8}});
  const years = Math.round(interpolate(frame, [dec, dec + 25], [0, 10], clamp));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #3a2a05 0%, #070502 65%)'}}>
      {new Array(24).fill(0).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: 540, top: 760, width: 1400, height: 30, transformOrigin: '0 50%',
          rotate: `${i * 15 + frame * 0.4}deg`, background: 'linear-gradient(90deg, rgba(255,210,90,0.35), transparent)', opacity: s}} />
      ))}
      <div style={{position: 'absolute', left: 340, top: 560, width: 400, height: 400, borderRadius: '50%', scale: String(s),
        background: 'radial-gradient(circle at 35% 30%, #fff8d0 0%, #ffd34d 25%, #c08a12 60%, #5a3a02 100%)',
        boxShadow: '0 0 160px rgba(255,200,60,0.8)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: ((frame * 6) % 700) - 300, top: -100, width: 120, height: 700, rotate: '25deg', background: 'rgba(255,255,255,0.45)', filter: 'blur(14px)'}} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={{position: 'absolute', left: 60 + i * 110, top: 120 + (i % 2) * 70, width: 90, height: 90,
            clipPath: 'polygon(50% 0,100% 38%,82% 100%,18% 100%,0 38%)', background: 'rgba(120,80,0,0.35)'}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 430, top: 960, width: 220, height: 160, background: 'linear-gradient(#c08a12, #5a3a02)', clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)', scale: String(s)}} />
      <div style={{position: 'absolute', top: 260, textAlign: 'center', fontFamily: DISPLAY, fontSize: custom ? 104 : 130, lineHeight: 1.05, left: 60, right: 60, width: 'auto',
        color: '#fff', opacity: frame > dec ? 1 : 0}}>
        {custom ? <span style={{color: sb.palette.gold}}>{custom}</span> : <><span style={{color: sb.palette.gold}}>{years}</span> YEARS</>}
      </div>
      <div style={{position: 'absolute', top: 1500, width: '100%', display: custom ? 'none' : 'flex', justifyContent: 'center', gap: 80, opacity: interpolate(frame, [dec + 20, dec + 32], [0, 1], clamp)}}>
        {[0, 1].map((i) => (
          <div key={i} style={{position: 'relative', width: 160, height: 220}}>
            <Boy x={80} y={220} height={210} stage="adult" skin="#1b1408" rim="#7a6020" glow={0.2} />
            <div style={{position: 'absolute', left: -20, top: 100, width: 200, height: 14, background: sb.palette.accent, rotate: '-35deg'}} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* 9 — THE REVEAL */
const NameReveal: React.FC<SceneProps> = ({sb, scene, captions, durationInFrames: dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const name = (scene.revealName ?? sb.player).toUpperCase();
  const at = wordFrame(captions, name.split(' ')[0], fps, dur * 0.4);
  const words = name.split(' ');
  const flash = interpolate(frame - at, [0, 2, 14], [0, 1, 0], clamp);
  const bg = interpolate(frame, [at - 4, at + 12], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <Shake at={at} amount={30}>
      <AbsoluteFill style={{background: '#050505'}} />
      {/* pre-reveal: lone silhouette */}
      <AbsoluteFill style={{opacity: 1 - bg}}>
        <Boy x={540} y={1500} height={600} stage="adult" skin={sb.character.palette.skin} rim={sb.palette.gold} glow={interpolate(frame, [0, at], [0.2, 1], clamp)} />
      </AbsoluteFill>
      {/* checkered sweep (national pattern as the final clue) */}
      <AbsoluteFill style={{opacity: bg * 0.9, clipPath: `inset(${(1 - bg) * 50}% 0 ${(1 - bg) * 50}% 0)`}}>
        <AbsoluteFill style={{rotate: '-12deg', scale: '1.6', translate: `${frame * 2}px 0px`,
          backgroundImage: (scene.revealPattern as string) ?? 'conic-gradient(#d71920 25%, #f4f4f4 0 50%, #d71920 0 75%, #f4f4f4 0)', backgroundSize: (scene.revealPatternSize as string) ?? '220px 220px', opacity: 0.35}} />
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(0,0,0,0.2), rgba(0,0,0,0.85) 75%)'}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 500, width: '100%', textAlign: 'center'}}>
        {words.map((w, wi) => (
          <div key={wi} style={{display: 'flex', justifyContent: 'center'}}>
            {w.split('').map((ch, ci) => {
              const s = spring({frame: frame - at - (wi * 4 + ci * 1.5), fps, config: {damping: 11, stiffness: 220}});
              return (
                <span key={ci} style={{fontFamily: DISPLAY, fontSize: Math.min(wi === 0 ? 210 : 250, Math.floor(1700 / Math.max(4, w.length))), lineHeight: 1.05, color: wi === 0 ? '#fff' : sb.palette.gold,
                  display: 'inline-block', translate: `0px ${(1 - s) * 140}px`, opacity: s, WebkitTextStroke: '6px #000', paintOrder: 'stroke fill',
                  textShadow: wi === 1 ? '0 0 50px rgba(255,200,80,0.7)' : '0 10px 40px rgba(0,0,0,0.9)'}}>{ch}</span>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 1060, width: '100%', textAlign: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 42,
        letterSpacing: 4, color: '#fff', opacity: interpolate(frame, [at + 20, at + 32], [0, 1], clamp)}}>{scene.revealSub}</div>
      {sb.cta && (
        <div style={{position: 'absolute', top: 1180, width: '100%', textAlign: 'center', opacity: interpolate(frame, [at + 34, at + 44], [0, 1], clamp)}}>
          <span style={{fontFamily: BODY, fontWeight: 800, fontSize: 38, color: '#000', background: sb.palette.gold, padding: '14px 30px', borderRadius: 50}}>
            {sb.cta} →
          </span>
        </div>
      )}
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </Shake>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
  warSky: WarSky,
  burningHouse: BurningHouse,
  refugeeHotel: RefugeeHotel,
  carPark: CarPark,
  rejectedStamp: RejectedStamp,
  growingUp: GrowingUp,
  stadiumFinal: StadiumFinal,
  goldenBall: GoldenBall,
  nameReveal: NameReveal,
  ...EXPLAINER_SCENES,
  ...TECH_SCENES,
  ...STORY2_SCENES,
  ...BODY2_SCENES,
  ...SERIES1_SCENES,
  ...ANIME_SCENES,
  ...STORY3_SCENES,
  ...EXPLAINER2_SCENES,
  ...STORY4_SCENES,
  ...EXPLAINER3_SCENES,
  ...STORY5_SCENES,
  ...SURVIVE_SCENES,
  ...DAYCLOCK_SCENES,
  ...NEWS_SCENES,
  ...TIMEFACT_SCENES,
  ...STORY6_SCENES,
  ...STORY7_SCENES,
  ...STORY8_SCENES,
  ...STORY9_SCENES,
  ...STORY10_SCENES,
  ...STORY11_SCENES,
  ...PSYCH1_SCENES,
  ...PSYCH2_SCENES,
  ...STORY12_SCENES,
  ...LEONARDO_SCENES,
  ...STORY13_SCENES,
  ...TRYTHIS1_SCENES,
  ...STORY14_SCENES,
  ...STORY15_SCENES,
  ...STORY16_SCENES,
  ...RULE1_SCENES,
  ...BODY3_SCENES,
  ...BODY4_SCENES,
  ...WHATIF3_SCENES,
  ...WOJTEK_SCENES,
  ...STORY17_SCENES,
  ...TRYTHIS2_SCENES,
  ...STORY18_SCENES,
  ...RULE2_SCENES,
  ...WHATIF4_SCENES,
  ...HISTORY1_SCENES,
  ...HISTORY2_SCENES,
  ...HISTORY3_SCENES,
  ...HISTORY4_SCENES,
  ...MEDICINE1_SCENES,
  ...MEAT1_SCENES,
  ...SPACE1_SCENES,
  ...BODY1_SCENES,
  ...HISTORY5_SCENES,
  ...GPS_SCENES,
  ...OCEAN_SCENES,
};
