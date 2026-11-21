"""Render + loudness + Channel Music Director check, fixing the mix automatically.
usage: python3 scripts/render_final.py <composition-id>
Renders out/<id>-raw.mp4 -> out/<id>.mp4, runs scripts/mix_check.py. On FAIL it lowers the music
("music.gainDb" in storyboards/<id>.json) by 2 dB and tries again, down to -8 dB. Exit 1 if it still fails."""
import json, subprocess, sys
cid=sys.argv[1]; p=f'storyboards/{cid}.json'
def run(*a): subprocess.run(list(a),check=True)
for attempt in range(5):
    sb=json.load(open(p)); g=(sb.get('music') or {}).get('gainDb',0)
    run('npx','remotion','render','src/index.ts',cid,f'out/{cid}-raw.mp4','--browser-executable=/usr/bin/google-chrome','--log=error')
    run('ffmpeg','-y','-loglevel','error','-i',f'out/{cid}-raw.mp4','-c:v','copy','-af','loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.84:level=false','-c:a','aac','-b:a','192k',f'out/{cid}.mp4')
    ok=subprocess.run(['python3','scripts/mix_check.py',cid,f'out/{cid}-raw.mp4',f'out/{cid}.mp4']).returncode==0
    print(f'attempt {attempt+1}: music gainDb {g} ->', 'PASS' if ok else 'FAIL')
    if ok or not sb.get('music') or g<=-8: sys.exit(0 if ok else 1)
    sb['music']['gainDb']=g-2; json.dump(sb,open(p,'w'),indent=1,ensure_ascii=False)
sys.exit(1)
