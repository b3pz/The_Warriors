#!/usr/bin/env python3
"""Costruisce gli atlas pixel art da tools/pixel_frames.json.

1. Estrae le figure numerate dalla tavola approvata (tools/pixel_extract.py).
2. Applica i tagli manuali, rifila, calcola il pivot ai piedi.
3. Scrive un PNG per set (frame affiancati) in assets/sprites_px e i dati in js/atlas_px.js.
Uso: python3 tools/build_pixel_sprites.py
"""
import json, pathlib, sys
import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tools'))
from pixel_extract import extract  # noqa: E402

spec = json.loads((ROOT / 'tools' / 'pixel_frames.json').read_text())
RAW = ROOT / 'build' / 'raw_figures'
extract(str(ROOT / spec['sheet']), str(RAW), spec.get('y_max'))
index = {e['n']: e for e in json.loads((RAW / 'index.json').read_text())}


def frame(ref):
    if isinstance(ref, int):
        ref = {'n': ref}
    a = np.array(Image.open(RAW / index[ref['n']]['file']).convert('RGBA'))
    if 'cut' in ref:
        edges = [0] + ref['cut'] + [a.shape[1]]
        a = a[:, edges[ref['part']]:edges[ref['part'] + 1]]
    al = a[..., 3] > 0
    rows, cols = np.where(al.any(1))[0], np.where(al.any(0))[0]
    a = a[rows[0]:rows[-1] + 1, cols[0]:cols[-1] + 1]
    al = a[..., 3] > 0
    h = a.shape[0]
    band = al[max(0, h - max(3, h // 10)):]
    c = np.where(band.any(0))[0]
    px = int((c[0] + c[-1]) / 2)
    return a, px, h


# ---- controllo d'identità: una posa resta solo se capelli e pantaloni somigliano alla posa di riposo
def signature(a):
    al = a[..., 3] > 0; h = a.shape[0]
    def mean(y0, y1):
        m = al[int(h * y0):int(h * y1)]
        px = a[int(h * y0):int(h * y1)][m][:, :3].astype(float)
        return px.mean(0) if len(px) else np.zeros(3)
    return mean(0.0, 0.18), mean(0.62, 0.9)

def same_person(ref, cand, pose):
    if pose in ('down',):  # sdraiato: confronta i colori medi di tutta la figura
        ra = ref[..., :3][ref[..., 3] > 0].astype(float).mean(0); ca = cand[..., :3][cand[..., 3] > 0].astype(float).mean(0)
        return np.abs(ra - ca).mean() < 22
    (rh, rl), (ch, cl) = signature(ref), signature(cand)
    return np.abs(rh - ch).mean() < 18 and np.abs(rl - cl).mean() < 14

def plausible(ref, cand, pose):
    rh, rw = ref.shape[0], ref.shape[1]; ch, cw = cand.shape[0], cand.shape[1]
    if pose == 'down': return ch < rh * 0.5 and cw < rw * 3.2            # niente figura in piedi incollata
    if pose in ('kick', 'punch', 'heavy', 'swing', 'windup'): return cw < rw * 2.4 and ch > rh * 0.75
    if pose == 'jump': return ch > rh * 0.55 and cw < rw * 1.3
    return cw < rw * 1.3 and ch > rh * 0.8                               # idle, walk, hurt: una sola figura in piedi

rejected = {}
IDENTITY = {'swan', 'ajax', 'snow', 'cowboy', 'cochise', 'vermin', 'rembrandt', 'fox', 'cleon', 'mercy', 'luther', 'cyrus', 'masai'}
out_dir = ROOT / 'assets' / 'sprites_px'
data = {'scale': spec['scale'], 'sets': {}}
for sid, poses in spec['sets'].items():
    frames, imgs, x = {}, [], 0
    ref = frame(poses['idle'][0])[0]
    for pose, refs in poses.items():
        lst = []
        for r in refs:
            a, px, py = frame(r)
            ident = sid in IDENTITY
            if pose != 'idle' and not (plausible(ref, a, pose) and (not ident or same_person(ref, a, pose))):
                rejected.setdefault(sid, []).append(pose); continue
            imgs.append((a, x))
            lst.append([x, 0, a.shape[1], a.shape[0], px, py])
            x += a.shape[1] + 2
        if lst: frames[pose] = lst
    H = max(a.shape[0] for a, _ in imgs)
    sheet = Image.new('RGBA', (x, H), (0, 0, 0, 0))
    for a, ox in imgs:
        sheet.paste(Image.fromarray(a), (ox, 0))
    fn = f'{sid}.png'
    sheet.save(out_dir / fn, optimize=True)
    data['sets'][sid] = {'file': 'sprites_px/' + fn, 'frames': frames}
(ROOT / 'js' / 'atlas_px.js').write_text("'use strict';\n// Generato da tools/build_pixel_sprites.py da tools/pixel_frames.json: non modificare a mano.\nwindow.W = window.W || {};\nW.ATLAS_PX = " + json.dumps(data) + ";\n")

# tavola di controllo: tutte le pose per set, piedi sulla linea
rowh = 210
ctrl = Image.new('RGB', (1800, rowh * len(data['sets'])), (30, 34, 44))
from PIL import ImageDraw
d = ImageDraw.Draw(ctrl)
for i, (sid, st) in enumerate(data['sets'].items()):
    im = Image.open(out_dir / f'{sid}.png')
    d.text((6, i * rowh + 4), sid, fill=(255, 220, 120))
    x = 90
    for pose, lst in st['frames'].items():
        for (fx, fy, fw, fh, px, py) in lst:
            fr = im.crop((fx, fy, fx + fw, fy + fh)).resize((fw * 2, fh * 2), Image.NEAREST)
            ox, oy = x + 40 - px * 2, i * rowh + 190 - py * 2
            ctrl.paste(fr, (ox, oy), fr)
            d.text((x, i * rowh + 194), pose[:5], fill=(180, 180, 180))
            x += max(fw * 2, 80) + 6
    d.line([(80, i * rowh + 190), (1800, i * rowh + 190)], fill=(255, 255, 0))
ctrl.save(out_dir / '_controllo.png')
print('set', len(data['sets']))
for k, v in rejected.items(): print('  scartate', k, ', '.join(v))
(ROOT / 'assets' / 'sprites_px' / 'scartate.json').write_text(json.dumps(rejected, indent=1))
