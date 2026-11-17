import React, {useEffect, useState} from 'react';
import {Lottie, LottieAnimationData} from '@remotion/lottie';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

/* Plays a Lottie JSON from public/lottie/<file> inside a Remotion scene (text-to-lottie skill output).
   Usage: <LottieLayer file="b1-pill.json" style={{position:'absolute', left:0, top:400, width:1080}} loop /> */
export const LottieLayer: React.FC<{file: string; style?: React.CSSProperties; loop?: boolean; playbackRate?: number}> = ({file, style, loop, playbackRate}) => {
  const [handle] = useState(() => delayRender(`lottie ${file}`));
  const [data, setData] = useState<LottieAnimationData | null>(null);
  useEffect(() => {
    fetch(staticFile(`lottie/${file}`))
      .then((r) => r.json())
      .then((j) => { setData(j); continueRender(handle); })
      .catch((e) => cancelRender(e));
  }, [file, handle]);
  if (!data) return null;
  return <Lottie animationData={data} style={style} loop={loop} playbackRate={playbackRate} />;
};
