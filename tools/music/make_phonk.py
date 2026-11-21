# Original dark "drift phonk / trailer" bed — synthesized from scratch (no samples), so no copyright or Content ID risk.
import numpy as np, soundfile as sf
SR=44100; BPM=140; beat=60/BPM; bars=32; N=int(SR*bars*4*beat)
t_all=np.arange(N)/SR; out=np.zeros((N,2))
rng=np.random.default_rng(7)
def note(m): return 440*2**((m-69)/12)
def add(sig,start,pan=0.0,gain=1.0):
    i=int(start*SR); j=min(N,i+len(sig)); 
    if i>=N: return
    s=sig[:j-i]*gain; out[i:j,0]+=s*(1-pan)/1; out[i:j,1]+=s*(1+pan)/1
def env(n,a=0.002,d=0.2):
    t=np.arange(n)/SR; return np.minimum(1,t/a)*np.exp(-t/d)
# progression (D minor): Dm Bb Gm A  (one chord per bar)
prog=[50,46,43,45]
# 808 kick+bass
def k808(m,dur):
    n=int(dur*SR); t=np.arange(n)/SR
    f=note(m-12)*(1+2.5*np.exp(-t*40)); ph=2*np.pi*np.cumsum(f)/SR
    s=np.tanh(2.2*np.sin(ph))*np.exp(-t/ (dur*0.55)); return s
def clap():
    n=int(0.25*SR); t=np.arange(n)/SR; nz=rng.standard_normal(n)
    e=sum(np.exp(-np.maximum(0,t-d)/0.012)*(t>=d) for d in (0,0.011,0.022))+np.exp(-t/0.09)*(t>=0.03)*0.6
    s=nz*e; s=np.convolve(s,[1,-0.9],'same'); return s*0.5
def hat(open_=False):
    n=int((0.18 if open_ else 0.05)*SR); nz=rng.standard_normal(n); nz=np.diff(np.concatenate([[0],nz]))
    return nz*env(n,0.0005,0.06 if open_ else 0.012)*0.25
def cowbell(m,dur=0.22):
    n=int(dur*SR); t=np.arange(n)/SR; f1,f2=note(m),note(m)*1.48
    s=(np.sign(np.sin(2*np.pi*f1*t))+0.7*np.sign(np.sin(2*np.pi*f2*t)))*np.exp(-t/0.07)
    s=np.convolve(s,np.ones(6)/6,'same'); return s*0.22
def pad(ms,dur):
    n=int(dur*SR); t=np.arange(n)/SR; s=np.zeros(n)
    for m in ms:
        for det in (-0.12,0,0.12):
            f=note(m)*2**(det/12); s+=2*((t*f)%1)-1
    s=np.convolve(s,np.ones(40)/40,'same')  # soft low-pass
    a=np.minimum(1,t/0.4)*np.minimum(1,(dur-t)/0.3); return s*a*0.035
bell_pat=[0,None,3,None,5,3,None,0, 7,None,5,None,3,None,0,None]  # 16ths, scale degrees in semitones over root
for b in range(bars):
    root=prog[b%4]; t0=b*4*beat; sec=b//8  # 4 sections of 8 bars
    # pad always (dark bed)
    chord=[root+12, root+15 if root!=45 else root+16, root+19]
    add(pad(chord,4*beat),t0,0,1.0)
    # 808 on 1 and the "and" of 2, plus 3.5 in later sections
    for pos,dur in ((0,1.4*beat),(1.5,1.2*beat))+(((3.0,0.9*beat),) if sec>=1 else ()):
        add(k808(root,dur),t0+pos*beat,0,0.55)
    # clap on 3
    add(clap(),t0+2*beat,0,0.8)
    # hats: 8ths, with 32nd rolls at end of every 2nd bar
    for i in range(8):
        add(hat(open_=(i==7 and b%4==3)),t0+i*beat/2,0.3,0.9)
    if b%2==1:
        for i in range(6): add(hat(),t0+3*beat+i*beat/6+beat/2*0,-.3,0.6)
    # cowbell melody (the phonk signature) from bar 0 so frame 0 already has energy
    for i,d in enumerate(bell_pat):
        if d is None: continue
        if sec==0 and b%2==0 and i>=8: continue
        add(cowbell(root+24+d),t0+i*beat/4,-0.25 if i%2 else 0.25,1.0)
# simple stereo reverb-ish delay
d=int(SR*beat*0.75); out[d:,0]+=out[:-d,1]*0.18; out[d:,1]+=out[:-d,0]*0.18
# carve the voice band (1-3.5 kHz) so the narrator stays clear: subtract a band-passed copy
from numpy.fft import rfft, irfft, rfftfreq
for ch in range(2):
    X=rfft(out[:,ch]); f=rfftfreq(N,1/SR)
    dip=1-0.6*np.exp(-((np.log2(np.maximum(f,1)/2000))**2)/(2*0.55**2))
    out[:,ch]=irfft(X*dip,N)
out=np.tanh(out*1.1); out/=np.max(np.abs(out))*1.12
# fade-in 30 ms (no click) and fade-out last 1 s
fi=int(0.03*SR); out[:fi]*=np.linspace(0,1,fi)[:,None]; fo=SR; out[-fo:]*=np.linspace(1,0,fo)[:,None]
sf.write('/home/claude/football-stories/public/sfx/music_phonk.wav',out.astype(np.float32),SR)
print('ok', N/SR)
