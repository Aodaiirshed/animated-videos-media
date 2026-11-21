# Two more ORIGINAL beds (synthesized, no samples): darkwave (dark-synth history edit mood) and emotional (piano + strings, underdog/tragedy).
import numpy as np, soundfile as sf
SR=44100; rng=np.random.default_rng(3)
def note(m): return 440*2**((m-69)/12)
def finish(out,path):
    from numpy.fft import rfft,irfft,rfftfreq
    N=len(out)
    for ch in range(2):  # carve 1-3.5 kHz voice band
        X=rfft(out[:,ch]); f=rfftfreq(N,1/SR)
        out[:,ch]=irfft(X*(1-0.6*np.exp(-((np.log2(np.maximum(f,1)/2000))**2)/(2*0.55**2))),N)
    fi=int(0.03*SR); out[:fi]*=np.linspace(0,1,fi)[:,None]; out[-SR:]*=np.linspace(1,0,SR)[:,None]
    m=out.mean(1); out*=10**(-20/20)/np.sqrt(np.mean(m**2)); sf.write(path,np.tanh(out).astype(np.float32),SR)
def mk(N): return np.zeros((N,2))
def put(out,sig,t,pan=0,g=1):
    i=int(t*SR); j=min(len(out),i+len(sig))
    if i<len(out): out[i:j,0]+=sig[:j-i]*g*(1-pan); out[i:j,1]+=sig[:j-i]*g*(1+pan)
# ---------- darkwave: 104 BPM, E minor, arpeggio + gated snare + saw bass + analog pad
BPM=104; b=60/BPM; bars=24; N=int(SR*bars*4*b); o=mk(N)
prog=[52,48,55,50]  # Em C G D
def saw(f,n,cut=30):
    t=np.arange(n)/SR; s=sum((2*((t*f*2**(d/1200))%1)-1) for d in (-8,0,8))/3
    return np.convolve(s,np.ones(cut)/cut,'same')
for bar in range(bars):
    r=prog[bar%4]; t0=bar*4*b
    pad=saw(note(r+12),int(4*b*SR),60)+saw(note(r+19),int(4*b*SR),60)*0.8
    tt=np.arange(len(pad))/SR; put(o,pad*np.minimum(1,tt/0.5)*np.minimum(1,(4*b-tt)/0.2)*0.05,t0)
    for i in range(8):  # pulsing bass 8ths
        n=int(b/2*SR); put(o,saw(note(r-12),n,12)*np.exp(-np.arange(n)/SR/0.18)*0.22,t0+i*b/2)
    arp=[0,7,12,15,12,7,3,7]
    for i,d in enumerate(arp*2):  # 16th arpeggio, enters from bar 0
        n=int(b/4*SR); s=np.sign(np.sin(2*np.pi*note(r+24+d)*np.arange(n)/SR))*np.exp(-np.arange(n)/SR/0.09)
        put(o,np.convolve(s,np.ones(8)/8,'same')*0.06,t0+i*b/4,0.3 if i%2 else -0.3)
    for k in (0,2):  # kick
        n=int(0.35*SR); t=np.arange(n)/SR; put(o,np.sin(2*np.pi*np.cumsum(55*(1+3*np.exp(-t*30)))/SR)*np.exp(-t/0.18)*0.5,t0+k*b)
    for k in (1,3):  # gated snare
        n=int(0.3*SR); t=np.arange(n)/SR; s=rng.standard_normal(n)*(t<0.22)*np.exp(-t/0.25)+np.sin(2*np.pi*190*t)*np.exp(-t/0.05)
        put(o,s*0.18,t0+k*b)
d=int(SR*b*0.75); o[d:,0]+=o[:-d,1]*0.2; o[d:,1]+=o[:-d,0]*0.2
finish(o,'/home/claude/football-stories/public/sfx/music_darkwave.wav')
# ---------- emotional: 72 BPM, A minor piano + string swell
BPM=72; b=60/BPM; bars=14; N=int(SR*bars*4*b); o=mk(N)
prog=[57,53,48,55]  # Am F C G
def piano(m,dur):
    n=int(dur*SR); t=np.arange(n)/SR; f=note(m)
    s=sum(np.sin(2*np.pi*f*h*t)*np.exp(-t*(1.2+h*0.9))/h for h in (1,2,3,4))
    return s*np.minimum(1,t/0.004)
def strings(ms,dur):
    n=int(dur*SR); t=np.arange(n)/SR; s=np.zeros(n)
    for m in ms:
        for det in (-6,0,6):
            f=note(m)*2**(det/1200); s+=np.sin(2*np.pi*f*t+0.3*np.sin(2*np.pi*5*t))
    return s*np.minimum(1,t/1.2)*np.minimum(1,(dur-t)/0.8)
for bar in range(bars):
    r=prog[bar%4]; t0=bar*4*b
    put(o,strings([r-12,r+7,r+12],4*b)*0.03*(0.5 if bar<4 else 1),t0)
    for i,d in enumerate([0,7,12,16 if r in (53,48) else 15,12,7,12,7]):
        put(o,piano(r+d,1.6)*0.09,t0+i*b/2,0.2 if i%2 else -0.2)
    put(o,piano(r-12,3.0)*0.12,t0)
d=int(SR*0.3); o[d:,0]+=o[:-d,1]*0.25; o[d:,1]+=o[:-d,0]*0.25
finish(o,'/home/claude/football-stories/public/sfx/music_emotional.wav')
print('ok')
