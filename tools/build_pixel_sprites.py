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


out_dir = ROOT / 'assets' / 'sprites_px'
data = {'scale': spec['scale'], 'sets': {}}
for sid, poses in spec['sets'].items():
    frames, imgs, x = {}, [], 0
    for pose, refs in poses.items():
        lst = []
        for r in refs:
            a, px, py = frame(r)
            imgs.append((a, x))
            lst.append([x, 0, a.shape[1], a.shape[0], px, py])
            x += a.shape[1] + 2
        frames[pose] = lst
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
