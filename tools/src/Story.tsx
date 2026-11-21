import React from 'react';
import {AbsoluteFill, Easing, Freeze, getInputProps, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import type {SceneDef, Storyboard, Timing, Transition} from './types';
import {SCENES} from './scenes';
import {Captions} from './components/Captions';
import {Grain, Vignette} from './components/Fx';
import {loadFonts} from './fonts';
import {wordFrame} from './scenes/kit';
import {HeroStyle, type ToonPalette} from './components/Boy';

loadFonts();

export type StoryProps = {sb: Storyboard; timing: Timing};

const isLoop = (sb: Storyboard) => Boolean((sb as unknown as {loop?: boolean}).loop);

// Perfect-loop mode ("loop": true): the last scene is cut right after its last spoken word,
// so the final word runs straight into the first word when the video restarts.
export const sceneFrames = (timing: Timing, sb: Storyboard, fps: number) =>
  timing.scenes.map((t, i) => {
    const last = i === timing.scenes.length - 1;
    if (isLoop(sb) && last && t.captions.length) {
      const endSec = t.captions[t.captions.length - 1].endMs / 1000;
      return Math.round(Math.min(endSec, t.durationSec) * fps);
    }
    return Math.round((t.durationSec + (sb.scenes[i].holdAfter ?? 0)) * fps);
  });

const LOOP_BRIDGE = 12; // frames over which the last scene dissolves into the frozen first frame

// The bridge: in the final frames, fade in scene 1 frozen on its frame 0 so the last frame equals the first.
const LoopBridge: React.FC<{sb: Storyboard; timing: Timing; dur: number; firstDur: number}> = ({sb, timing, dur, firstDur}) => {
  const f = useCurrentFrame();
  const First = SCENES[sb.scenes[0].visual];
  const o = interpolate(f, [dur - LOOP_BRIDGE, dur - 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (!First || o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Freeze frame={0}>
        <First sb={sb} scene={sb.scenes[0]} captions={timing.scenes[0].captions} durationInFrames={firstDur} mouth={timing.scenes[0].mouth} />
        <Vignette />
      </Freeze>
    </AbsoluteFill>
  );
};

// How a scene ENTERS, driven by the previous scene's `transition`
const Enter: React.FC<{type: Transition; children: React.ReactNode}> = ({type, children}) => {
  const f = useCurrentFrame();
  const c = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)} as const;
  let style: React.CSSProperties = {};
  if (type === 'zoomBlur') style = {scale: String(interpolate(f, [0, 12], [1.35, 1], c)), filter: `blur(${interpolate(f, [0, 12], [24, 0], c)}px)`};
  // First scene: a quick zoom punch with no blur, so frame 0 (the first impression) is sharp and readable
  if ((type as string) === 'punch') style = {scale: String(interpolate(f, [0, 8], [1.12, 1], c))};
  if (type === 'slideUp') style = {translate: `0px ${interpolate(f, [0, 12], [1920, 0], c)}px`};
  if (type === 'whipPan') style = {translate: `${interpolate(f, [0, 10], [1080, 0], c)}px 0px`, filter: `blur(${interpolate(f, [0, 10], [40, 0], c)}px)`};
  return (
    <AbsoluteFill style={style}>
      {children}
      {type === 'flash' && <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 7], [0.95, 0], c)}} />}
    </AbsoluteFill>
  );
};

// Global mix: keep the narrator on top. Storyboards can override with "mix": {"music": x, "sfx": y}.
const MUSIC_GAIN = 0.3;
const SFX_GAIN = 0.3;
const mixOf = (sb: Storyboard) => ({music: MUSIC_GAIN, sfx: SFX_GAIN, ...((sb as unknown as {mix?: {music?: number; sfx?: number}}).mix ?? {})});

/* ── Channel Music Director mix (21 Nov 2026) ─────────────────────────────────────────────
   Every music bed in public/sfx/music_*.wav is normalised to -20 dBFS RMS, the same as the narration.
   While a word is being spoken the bed sits DUCK_DB below the voice; in pauses of ~0.5 s+ it swells to
   SWELL_DB, and it is back down 4 frames BEFORE the next word starts. Storyboards can trim the bed with
   "music": {"gainDb": -2} (never above 0). Legacy fixed-volume mixing only with "mix": {"legacy": true}. */
const DUCK_DB = -19;
const SWELL_DB = -11;
const SFX_DUCK_DB = -20;
const dbToGain = (db: number) => Math.pow(10, db / 20);
const stemOf = () => (getInputProps() as {stem?: string}).stem ?? 'mix';

export const speechSpans = (sb: Storyboard, timing: Timing, fps: number) => {
  const frames = sceneFrames(timing, sb, fps);
  const spans: [number, number][] = [];
  let start = 0;
  timing.scenes.forEach((t, i) => {
    for (const c of t.captions) spans.push([start + (c.startMs / 1000) * fps, start + (c.endMs / 1000) * fps]);
    start += frames[i];
  });
  return spans;
};

const duckEnvelope = (spans: [number, number][], gainDb: number) => {
  const duck = dbToGain(DUCK_DB + Math.min(0, gainDb));
  const swell = dbToGain(SWELL_DB + Math.min(0, gainDb));
  return (f: number) => {
    let d = Infinity;
    for (const [a, b] of spans) {
      if (f >= a - 4 && f <= b + 3) return duck;
      d = Math.min(d, f < a ? a - 4 - f : f - b - 3);
    }
    const k = Math.min(1, Math.max(0, (d - 2) / 10));
    return duck + (swell - duck) * k * k * (3 - 2 * k);
  };
};

const SceneAudio: React.FC<{sb: Storyboard; scene: SceneDef; caps: Timing['scenes'][number]['captions']; offset: number; sfxDuck: (f: number) => number}> = ({sb, scene, caps, offset, sfxDuck}) => {
  const {fps} = useVideoConfig();
  return (
    <>
      <Audio src={staticFile(`vo/${sb.slug}/${scene.id}.wav`)} volume={stemOf() === 'mix' ? 1 : 0} />
      {(scene.sfx ?? []).map((s, i) => {
        const from = s.onWord ? wordFrame(caps, s.onWord.replace(/[^\p{L}\p{N}']/gu, ''), fps) : Math.round((s.at ?? 0) * fps);
        return (
          <Sequence key={i} from={from} name={`sfx ${s.file}`}>
            <Audio src={staticFile(`sfx/${s.file}`)} volume={(f) => (stemOf() === 'music' ? 0 : 1) * (s.volume ?? 0.8) * mixOf(sb).sfx * sfxDuck(offset + from + f)} />
          </Sequence>
        );
      })}
    </>
  );
};

export const Story: React.FC<StoryProps> = ({sb, timing}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const frames = sceneFrames(timing, sb, fps);
  const legacy = Boolean((sb as unknown as {mix?: {legacy?: boolean}}).mix?.legacy);
  const env = duckEnvelope(speechSpans(sb, timing, fps), ((sb.music as {gainDb?: number} | undefined)?.gainDb) ?? 0);
  const bed = (f: number) => (legacy ? sb.music!.volume * mixOf(sb).music : env(f));
  // Sound effects that land on a word are pulled down 14 dB so an impact never covers the narrator
  const sfxEnv = duckEnvelope(speechSpans(sb, timing, fps), 0);
  const sfxDuck = (f: number) => {
    if (legacy) return 1;
    const k = (sfxEnv(f) - dbToGain(DUCK_DB)) / (dbToGain(SWELL_DB) - dbToGain(DUCK_DB));
    return dbToGain(SFX_DUCK_DB) + (1 - dbToGain(SFX_DUCK_DB)) * Math.min(1, Math.max(0, k));
  };
  let start = 0;
  return (
    <HeroStyle.Provider value={{hair: (sb.character as {hair?: 'long' | 'short'}).hair ?? 'long',
      style: (sb.character as {style?: 'silhouette' | 'cartoon'}).style ?? 'silhouette',
      heroSkin: sb.character.palette.skin, toon: (sb.character as {toon?: ToonPalette}).toon}}>
    <AbsoluteFill style={{background: sb.palette.bg}}>
      {sb.music && !isLoop(sb) && (
        <Audio
          src={staticFile(`sfx/${sb.music.file}`)}
          volume={(f) => bed(f) * interpolate(f, [0, 3, durationInFrames - 30, durationInFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        />
      )}
      {sb.music && isLoop(sb) && (() => {
        // Seamless music seam: the main bed starts L frames into the track and fades out over the last L frames,
        // while a second copy plays the track's first L frames and fades in. At the last frame the copy is at
        // position L, which is exactly where the main bed picks up again when the video restarts.
        const L = 15;

        return (
          <>
            <Audio src={staticFile(`sfx/${sb.music!.file}`)} trimBefore={L}
              volume={(f) => bed(f) * interpolate(f, [durationInFrames - L, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
            <Sequence from={durationInFrames - L} name="music loop seam">
              <Audio src={staticFile(`sfx/${sb.music!.file}`)} volume={(f) => bed(durationInFrames - L + f) * interpolate(f, [0, L], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
            </Sequence>
          </>
        );
      })()}
      {sb.scenes.map((scene, i) => {
        const Visual = SCENES[scene.visual];
        const t = timing.scenes[i];
        const from = start;
        start += frames[i];
        const prevTransition: Transition = i === 0 ? 'none' : sb.scenes[i - 1].transition ?? 'none';
        // On the reveal scene, captions stop before the name so the big title owns the frame
        const revealFirst = scene.revealName?.split(' ')[0]?.toLowerCase();
        const nameParts = scene.revealName ? scene.revealName.toLowerCase().split(' ') : [];
        const caps = revealFirst ? t.captions.filter((c) => !nameParts.some((np) => c.text.toLowerCase().startsWith(np))) : t.captions;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={frames[i]} name={scene.id}>
            <Enter type={i === 0 ? ((isLoop(sb) ? 'none' : 'punch') as Transition) : prevTransition}>
              {Visual ? <Visual sb={sb} scene={scene} captions={t.captions} durationInFrames={frames[i]} mouth={t.mouth} /> : <AbsoluteFill style={{background: '#300'}} />}
            </Enter>
            <Vignette />
            <Captions speaker={scene.speaker ? (sb as {cast?: Record<string, {label?: string; color?: string}>}).cast?.[scene.speaker as string] : undefined} top={(scene.captionTop as number) ?? 1130} captions={caps} emphasis={scene.emphasis} accent={sb.palette.accent} gold={sb.palette.gold} rtl={sb.language === 'ar'} />
            {isLoop(sb) && i === sb.scenes.length - 1 ? <LoopBridge sb={sb} timing={timing} dur={frames[i]} firstDur={frames[0]} /> : null}
            {!timing.noAudio && <SceneAudio sb={sb} scene={scene} caps={t.captions} offset={from} sfxDuck={sfxDuck} />}
          </Sequence>
        );
      })}
      <Grain />
    </AbsoluteFill>
    </HeroStyle.Provider>
  );
};
