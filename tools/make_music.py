"""Original, royalty-free background music beds, synthesised from scratch (no samples).

Writes public/sfx/music_<name>.wav (stereo, 44.1 kHz, ~50 s):
  mystic  — cinematic storybook ambient: soft pads, harp-like plucks, low drone (~76 BPM). Like the reel the user liked.
  epic    — football/trailer energy: pulsing low strings, big toms on 2 and 4, rising pads (~96 BPM).
  tension — mystery/guess pulse: ticking plucks, heartbeat kick, dark pad (~84 BPM).
Usage: python3 scripts/make_music.py [name ...]
"""
import sys, os
import numpy as np
from scipy.io import wavfile
from scipy.signal import fftconvolve, butter, sosfilt

SR = 44100
DUR = 50.0
rng = np.random.default_rng(7)
N = int(SR * DUR)
t = np.arange(N) / SR

def note(n):  # MIDI -> Hz
    return 440.0 * 2 ** ((n - 69) / 12)

def lowpass(x, fc, order=2):
    return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x)

def highpass(x, fc, order=2):
    return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)

def reverb_ir(seconds=2.8, decay=3.2):
    n = int(SR * seconds)
    env = np.exp(-decay * np.arange(n) / n * seconds)
    l = rng.standard_normal(n) * env
    r = rng.standard_normal(n) * env
    l = lowpass(l, 6000); r = lowpass(r, 6000)
    return l / np.abs(l).sum() * 40, r / np.abs(r).sum() * 40

IRL, IRR = reverb_ir()

def verb(x, wet=0.35):
    l = fftconvolve(x, IRL)[:N]; r = fftconvolve(x, IRR)[:N]
    return np.stack([x * (1 - wet) + l * wet, x * (1 - wet) + r * wet])

def adsr(n, a, d, s, r):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    sus = max(n - a - d - r, 0)
    e = np.concatenate([np.linspace(0, 1, a, False), np.linspace(1, s, d, False), np.full(sus, s), np.linspace(s, 0, r)])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))

def pad_voice(freq, n, bright=6):
    tt = np.arange(n) / SR
    out = np.zeros(n)
    for det in (-0.12, 0.0, 0.11):
        f = freq * 2 ** (det / 12)
        for h in range(1, bright + 1):
            out += np.sin(2 * np.pi * f * h * tt + rng.uniform(0, 6.28)) / h ** 1.3
    return out

def pluck(freq, n, damp=0.996):
    p = int(SR / freq)
    buf = rng.uniform(-1, 1, p)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = damp * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out

def place(dst, src, start):
    s = int(start * SR)
    if s >= len(dst): return
    e = min(len(dst), s + len(src))
    dst[s:e] += src[: e - s]

def norm(st, peak=0.85):
    return st / (np.abs(st).max() + 1e-9) * peak

def loopify(st, xf=2.0):
    """Crossfade the tail into the head so the bed loops seamlessly."""
    k = int(xf * SR)
    head = st[:, :k].copy(); tail = st[:, -k:]
    fade = np.linspace(0, 1, k)
    st[:, :k] = head * fade + tail * (1 - fade)
    return st[:, : st.shape[1] - k]

def chords_track(prog, bpm, beats_per_chord=4):
    spc = 60 / bpm * beats_per_chord
    times = np.arange(0, DUR, spc)
    return [(tm, prog[i % len(prog)], spc) for i, tm in enumerate(times)]

def mystic():
    bpm = 76
    prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
    pad = np.zeros(N); pl = np.zeros(N); drone = np.zeros(N)
    for tm, ch, spc in chords_track(prog, bpm):
        n = int(spc * SR * 1.25)
        v = sum(pad_voice(note(m), n, 5) for m in ch) * adsr(n, 1.2, 0.5, 0.8, 1.2)
        place(pad, v * 0.10, tm)
        # harp-like arpeggio, 8th notes
        step = 60 / bpm / 2
        seq = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 24, ch[2] + 12, ch[1] + 12, ch[0] + 24, ch[2] + 12]
        for k, m in enumerate(seq):
            if tm + k * step < DUR:
                place(pl, pluck(note(m), int(1.6 * SR), 0.9975) * (0.32 if k % 4 == 0 else 0.2), tm + k * step)
    drone = np.sin(2 * np.pi * note(33) * t) * (0.5 + 0.2 * np.sin(2 * np.pi * 0.07 * t)) + 0.3 * np.sin(2 * np.pi * note(45) * t)
    mix = lowpass(pad, 2500) + highpass(pl, 180) * 0.9 + lowpass(drone, 300) * 0.22
    st = verb(mix, 0.45)
    return st

def epic():
    bpm = 96
    prog = [[50, 57, 62], [46, 53, 58], [53, 57, 60], [48, 55, 60]]  # Dm Bb F C
    strings = np.zeros(N); low = np.zeros(N); drums = np.zeros(N); pad = np.zeros(N)
    beat = 60 / bpm
    for tm, ch, spc in chords_track(prog, bpm):
        n = int(spc * SR * 1.1)
        place(pad, sum(pad_voice(note(m + 12), n, 7) for m in ch) * adsr(n, 0.6, 0.4, 0.75, 0.8) * 0.07, tm)
        # 16th-note ostinato on the root
        for k in range(16):
            s = tm + k * beat / 4
            if s < DUR:
                m = ch[0] - 12 if k % 4 else ch[0]
                nn = int(0.18 * SR)
                tt = np.arange(nn) / SR
                v = (np.sign(np.sin(2 * np.pi * note(m) * tt)) * 0.5 + np.sin(2 * np.pi * note(m) * tt)) * np.exp(-tt * 14)
                place(low, v * (0.35 if k % 4 == 0 else 0.22), s)
    # drums: kick on 1, tom hits on 2 and 4, cymbal swell every 8 bars
    for b in np.arange(0, DUR, beat):
        i = int(round(b / beat))
        nn = int(0.6 * SR); tt = np.arange(nn) / SR
        if i % 4 == 0:
            kick = np.sin(2 * np.pi * (45 + 90 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 7)
            place(drums, kick * 0.9, b)
        if i % 4 in (1, 3):
            tom = np.sin(2 * np.pi * (85 + 40 * np.exp(-tt * 20)) * tt) * np.exp(-tt * 5) + rng.standard_normal(nn) * np.exp(-tt * 25) * 0.25
            place(drums, tom * 0.7, b)
        if i % 32 == 28:
            sw = int(beat * 4 * SR); tt2 = np.arange(sw) / SR
            place(drums, highpass(rng.standard_normal(sw), 5000) * (tt2 / tt2[-1]) ** 2 * 0.12, b)
    mix = lowpass(pad, 3500) + lowpass(low, 1400) * 0.8 + drums * 0.9
    return verb(mix, 0.25)

def tension():
    bpm = 84
    prog = [[52, 55, 59], [52, 55, 60], [50, 53, 57], [52, 56, 59]]  # Em Em(b6) Dm E
    pad = np.zeros(N); tick = np.zeros(N); hb = np.zeros(N)
    beat = 60 / bpm
    for tm, ch, spc in chords_track(prog, bpm):
        n = int(spc * SR * 1.2)
        place(pad, sum(pad_voice(note(m), n, 4) for m in ch) * adsr(n, 1.0, 0.3, 0.85, 1.0) * 0.09, tm)
        for k in range(8):
            s = tm + k * beat / 2
            if s < DUR:
                place(tick, pluck(note(ch[k % 3] + 24), int(0.5 * SR), 0.99) * 0.22, s)
    for b in np.arange(0, DUR, beat):
        nn = int(0.35 * SR); tt = np.arange(nn) / SR
        thump = np.sin(2 * np.pi * (50 + 60 * np.exp(-tt * 40)) * tt) * np.exp(-tt * 12)
        place(hb, thump * 0.8, b); place(hb, thump * 0.5, b + 0.22)
    mix = lowpass(pad, 1800) + highpass(tick, 300) * 0.8 + hb * 0.7
    return verb(mix, 0.4)

TRACKS = {'mystic': mystic, 'epic': epic, 'tension': tension}

if __name__ == '__main__':
    names = sys.argv[1:] or list(TRACKS)
    os.makedirs('public/sfx', exist_ok=True)
    for nm in names:
        st = loopify(norm(TRACKS[nm]()))
        wavfile.write(f'public/sfx/music_{nm}.wav', SR, (st.T * 32767).astype(np.int16))
        print('wrote', f'public/sfx/music_{nm}.wav', round(st.shape[1] / SR, 1), 's')
