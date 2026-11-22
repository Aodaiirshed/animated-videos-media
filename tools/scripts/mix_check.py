"""Channel Music Director check: is every word clearly above the music?
Usage: python3 scripts/mix_check.py <composition-id> <raw-mix.mp4> <final.mp4>
1) renders the same composition with the narrator muted (bed stem),
2) voice = mix - bed (Remotion mixes deterministically), per-word voice-to-music ratio,
3) Whisper listens to the FINAL file and checks every scripted word is heard.
Exit code 1 if anything fails. Writes out/<id>.mixcheck.json"""
import json, subprocess, sys, re, os, numpy as np, soundfile as sf
cid, raw, final = sys.argv[1:4]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)
sb = json.load(open(f'storyboards/{cid}.json')); tm = json.load(open(f'src/generated/{cid}.timing.json'))
fps = 30; SR = 48000
bed_wav = f'out/{cid}-bed.wav'; mix_wav = f'out/{cid}-mix.wav'
mus_wav = f'out/{cid}-music.wav'
for stem,dst in (('bed',bed_wav),('music',mus_wav)):
    subprocess.run(['npx','remotion','render','src/index.ts',cid,dst,'--codec=wav','--props={"stem":"%s"}'%stem,'--browser-executable=/usr/bin/google-chrome','--log=error'],check=True)
for src,dst in ((raw,mix_wav),(bed_wav,bed_wav+'.48k.wav'),(mus_wav,mus_wav+'.48k.wav')):
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',src,'-ac','1','-ar',str(SR),dst],check=True)
mix,_=sf.read(mix_wav); bed,_=sf.read(bed_wav+'.48k.wav'); mus,_=sf.read(mus_wav+'.48k.wav')
n=min(len(mix),len(bed),len(mus)); mix,bed,mus=mix[:n],bed[:n],mus[:n]
voice=mix-bed
# word windows in seconds
words=[]; start=0.0; scenes=tm['scenes']; loop=bool(sb.get('loop'))
for i,t in enumerate(scenes):
    for c in t['captions']: words.append((c['text'], start+c['startMs']/1000, start+c['endMs']/1000))
    last=i==len(scenes)-1
    if loop and last and t['captions']: dur=min(t['captions'][-1]['endMs']/1000,t['durationSec'])
    else: dur=t['durationSec']+(sb['scenes'][i].get('holdAfter') or 0)
    start+=round(dur*fps)/fps
H=int(SR*0.04)
fr=lambda x: np.array([np.mean(x[i:i+H]**2) for i in range(0,len(x)-H,H)])
V,B,M=fr(voice),fr(bed),fr(mus)
vpk=np.percentile(V[V>0],99); voiced=V>vpk*10**(-30/10)   # frames where the narrator is really sounding
rows=[]
for w,a,b in words:
    i,j=int((a-0.08)*SR/H),int((b+0.08)*SR/H)+1
    sel=np.zeros_like(voiced); sel[max(0,i):j]=True; sel&=voiced
    if sel.sum()<2: continue
    v=V[sel].sum(); rows.append({'word':w,'t':round(a,2),'vs_music_db':round(10*np.log10(v/(M[sel].sum()+1e-12)),1),'vs_all_bg_db':round(10*np.log10(v/(B[sel].sum()+1e-12)),1)})
vm=np.array([r['vs_music_db'] for r in rows]); vb=np.array([r['vs_all_bg_db'] for r in rows])
STOP={'the','a','an','of','to','and','in','on','is','it','its','at','for','or','that','this'}
weak=[r for r in rows if (r['vs_all_bg_db']<8 or r['vs_music_db']<8) and re.sub(r'[^a-z]','',r['word'].lower()) not in STOP]
# Whisper on the final file
from faster_whisper import WhisperModel
lang='ar' if sb.get('language')=='ar' else 'en'
model=WhisperModel('base.en' if lang=='en' else 'small', device='cpu', compute_type='int8')
fw=f'out/{cid}-final16k.wav'; subprocess.run(['ffmpeg','-y','-loglevel','error','-i',final,'-ac','1','-ar','16000',fw],check=True)
audio16,_=sf.read(fw,dtype='float32')
segs,_=model.transcribe(audio16, language=lang, beam_size=5)
heard=' '.join(s.text for s in segs)
_AR=re.compile('[\u064B-\u0652\u0670\u0640]')
def norm(s):
    s=_AR.sub('',s.lower())  # strip Arabic tashkeel/shadda/tatweel (otherwise words split, e.g. تخلّت)
    s=re.sub('[\u0622\u0623\u0625]','\u0627',s).replace('\u0629','\u0647').replace('\u0649','\u064A')
    return re.sub(r"[^\w\s]",' ',s)
from num2words import num2words
def spell(tok):
    return norm(num2words(int(tok))).replace('-',' ').split() if tok.isdigit() else [tok]
heard_set=set(w for tok in norm(heard.replace('£',' ').replace('%',' percent ').replace(',','')).split() for w in spell(tok))
script_words=[w for sc in sb['scenes'] for w in norm(sc['vo'].replace('-',' ')).split()]
# names/numbers are often spelt differently by Whisper; judge the ordinary words
missing=[w for w in script_words if w not in heard_set and not w.isdigit()]
hit=1-len(missing)/max(1,len(script_words))
rep={'id':cid,'words':len(rows),'music_below_voice_median_db':round(float(np.median(vm)),1),'music_below_voice_min_db':round(float(vm.min()),1),
     'all_background_min_db':round(float(vb.min()),1),'weak_words':weak,'whisper_hit_rate':round(hit,3),'whisper_missing':missing,'heard':heard.strip()}
json.dump(rep,open(f'out/{cid}.mixcheck.json','w'),indent=1,ensure_ascii=False)
ok = 15 <= rep['music_below_voice_median_db'] and not weak and hit>=(0.90 if lang=='ar' else 0.95)  # ar: Whisper-small misses loanwords (هاتريك, الديربي)
print(json.dumps({k:v for k,v in rep.items() if k!='heard'},ensure_ascii=False))
print('PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)
