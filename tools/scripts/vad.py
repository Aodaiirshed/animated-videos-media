"""Write the narrator's REAL voiced spans into src/generated/<slug>.timing.json (per scene "voiced": [[startSec, endSec], ...]).
Story.tsx ducks the music on these spans instead of the estimated caption times, so the music can never swell under a word.
usage: python3 scripts/vad.py <slug>"""
import json, sys, numpy as np, soundfile as sf
slug=sys.argv[1]; tp=f'src/generated/{slug}.timing.json'; sb=json.load(open(f'storyboards/{slug}.json')); tm=json.load(open(tp))
for sc, t in zip(sb['scenes'], tm['scenes']):
    a,sr=sf.read(f'public/vo/{slug}/{sc["id"]}.wav'); a=a if a.ndim==1 else a.mean(1)
    H=int(sr*0.02); e=np.array([np.sqrt(np.mean(a[i:i+H]**2)) for i in range(0,len(a)-H+1,H)])+1e-9
    db=20*np.log10(e); thr=db.max()-35; on=db>thr
    spans=[]; i=0
    while i<len(on):
        if on[i]:
            j=i
            while j<len(on) and on[j]: j+=1
            spans.append([i*0.02,j*0.02]); i=j
        else: i+=1
    merged=[]
    for s,e2 in spans:  # merge gaps under 0.25 s (normal gaps between words)
        if merged and s-merged[-1][1]<0.25: merged[-1][1]=e2
        else: merged.append([s,e2])
    t['voiced']=[[round(s,3),round(e2,3)] for s,e2 in merged if e2-s>0.06]
    # Kokoro word times are estimates: a word whose start lands in a real pause is snapped to the next voiced span,
    # so captions, onWord cues and the per-word mix check all line up with the actual speech.
    v=t['voiced']
    for c in t.get('captions',[]):
        st=c['startMs']/1000
        if any(a<=st<=b-0.12 for a,b in v): continue
        nxt=[a for a,b in v if a>st]
        if nxt and nxt[0]-st<0.8:
            c['startMs']=int(nxt[0]*1000)
            c['endMs']=max(c['endMs'],c['startMs']+80)
            if c.get('timestampMs') is not None: c['timestampMs']=c['startMs']
json.dump(tm,open(tp,'w'),indent=1,ensure_ascii=False)
print(slug, [len(t['voiced']) for t in tm['scenes']])
