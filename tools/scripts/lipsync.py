"""Make mouth cues for every scene of a storyboard with Rhubarb Lip Sync (MIT).

Usage: python3 scripts/lipsync.py storyboards/<slug>.json
Writes src/generated/<slug>.mouth.json:
  {"fps": 30, "scenes": {"<scene id>": [{"start": 0.0, "end": 0.18, "value": "X"}, ...]}}
Shapes (Preston Blair set): A closed (M/B/P), B slightly open, C open (EH), D wide open (AA),
E rounded (AO/ER), F puckered (UW/OO), G teeth on lip (F/V), H tongue (L), X idle/rest.
Each scene's script is passed as the dialog file so recognition is accurate.
Rhubarb lives in /home/claude/tools/rhubarb (backup: media repo tools/bin/rhubarb-linux.zip).
"""
import json, os, subprocess, sys, tempfile

RHUBARB = os.environ.get('RHUBARB', '/home/claude/tools/rhubarb/rhubarb')

def main(path):
    sb = json.load(open(path))
    slug = sb['slug']
    vo_dir = f'public/vo/{slug}'
    out = {'fps': 30, 'scenes': {}}
    for sc in sb['scenes']:
        wav = os.path.join(vo_dir, f"{sc['id']}.wav")
        if not os.path.exists(wav):
            print('no audio for', sc['id']); continue
        with tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False) as d:
            d.write(sc['vo'])
        res = subprocess.run([RHUBARB, '-q', '-f', 'json', '-d', d.name, wav], capture_output=True, text=True)
        os.unlink(d.name)
        if res.returncode:
            print('rhubarb failed on', sc['id'], res.stderr[:200]); continue
        out['scenes'][sc['id']] = json.loads(res.stdout)['mouthCues']
        print(sc['id'], len(out['scenes'][sc['id']]), 'cues')
    dst = f'src/generated/{slug}.mouth.json'
    json.dump(out, open(dst, 'w'))
    print('wrote', dst)

if __name__ == '__main__':
    main(sys.argv[1])
