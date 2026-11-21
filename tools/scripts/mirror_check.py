"""Mirrored-text check (user request 21 Nov: some answer-card covers showed flipped text).
usage: python3 scripts/mirror_check.py <video.mp4>
Grabs frame 0 (the Instagram cover), 1 s, the middle and 1 s before the end; OCRs each frame as-is and
horizontally flipped. If the flipped image reads as MORE real words than the original, that frame has
mirrored text -> exit 1."""
import subprocess, sys, json, re, tempfile, os
from PIL import Image, ImageOps
v=sys.argv[1]
dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',v]).decode())
from wordfreq import zipf_frequency
def real(txt):
    # count tokens that are common English words (zipf >= 3); mirrored text rarely forms real words
    return sum(1 for t in re.findall(r"[A-Za-z]{3,}",txt) if zipf_frequency(t.lower(),'en')>=3)
bad=[]; rep=[]
for t in sorted(set(min(x, max(0,dur-0.1)) for x in (0, 1.0, dur/2, max(0,dur-1)))):
    f=tempfile.mktemp(suffix='.png')
    subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(t),'-i',v,'-frames:v','1',f],check=True)
    im=Image.open(f).convert('L')
    def ocr(img):
        p=tempfile.mktemp(suffix='.png'); img.save(p)
        return subprocess.run(['tesseract',p,'-','--psm','11'],capture_output=True,text=True).stdout
    a,b=real(ocr(im)),real(ocr(ImageOps.mirror(im)))
    rep.append({'t':round(t,1),'normal_words':a,'mirrored_words':b})
    if b>a and b>=2: bad.append(round(t,1))
print(json.dumps({'video':v,'frames':rep,'mirrored_at':bad}))
print('MIRROR FAIL' if bad else 'MIRROR OK'); sys.exit(1 if bad else 0)
