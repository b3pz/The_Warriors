#!/usr/bin/env python3
"""Estrae le figure dalle tavole pixel art approvate (Raccolta 04).

Per ogni tavola: maschera (alpha o fondo nero), componenti connesse con piccola dilatazione,
filtro per area, ordinamento per riga e colonna. Scrive i ritagli numerati e una tavola di
controllo con i numeri, così l'associazione figura → personaggio si fa su numeri stabili.
Uso: python3 tools/pixel_extract.py <tavola.png> <cartella_out> [y_max]
"""
import json, sys, pathlib
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

def mask_of(im):
    a = np.array(im.convert('RGBA')).astype(int)
    if im.mode == 'RGB':
        m = a[..., :3].max(-1) > 22
    else:
        m = a[..., 3] > 60
    return a, m

def extract(path, out, y_max=None, min_area=350, dil=1):
    im = Image.open(path); a, m = mask_of(im)
    if y_max: m[y_max:] = False
    # cornici dei riquadri: segmenti lunghi e sottili orizzontali/verticali
    hl = ndimage.binary_opening(m, structure=np.ones((1, 120)))
    vl = ndimage.binary_opening(m, structure=np.ones((70, 1)))
    lines = ndimage.binary_dilation(hl | vl, iterations=1)
    # una linea vera è sottile: scarta le aree spesse (corpi) dalla maschera linee
    thick = ndimage.binary_opening(m, structure=np.ones((5, 5)))
    m = m & ~(lines & ~thick)
    # rimuovi linee di cornice sottili (righe/colonne quasi piene e sottili)
    lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=dil))
    objs = ndimage.find_objects(lab)
    items = []
    for i, sl in enumerate(objs):
        h = sl[0].stop - sl[0].start; w = sl[1].stop - sl[1].start
        area = (m[sl] & (lab[sl] == i + 1)).sum()
        if area < min_area or h < 18: continue
        if w > 4 * h or h > 4 * w and w < 6: continue   # cornici e linee
        # figure accostate: taglia nelle colonne quasi vuote (contatto solo ai piedi)
        sub = m[sl] & (lab[sl] == i + 1)
        cols = sub.sum(0)
        thr = max(2, int(0.06 * h))
        cuts, x = [], 0
        while x < w:
            if cols[x] <= thr:
                x0 = x
                while x < w and cols[x] <= thr: x += 1
                c = (x0 + x) // 2
                if c > 0.28 * h and w - c > 0.28 * h and (not cuts or c - cuts[-1] > 0.28 * h): cuts.append(c)
            x += 1
        edges = [0] + cuts + [w]
        for a0, a1 in zip(edges[:-1], edges[1:]):
            part = np.zeros_like(lab[sl], dtype=bool); part[:, a0:a1] = sub[:, a0:a1]
            if part.sum() < min_area: continue
            rr = np.where(part.any(1))[0]; cc = np.where(part.any(0))[0]
            s2 = (slice(sl[0].start + rr[0], sl[0].start + rr[-1] + 1), slice(sl[1].start + cc[0], sl[1].start + cc[-1] + 1))
            items.append((s2, i + 1, int(part.sum()), (sl, a0, a1)))
    # righe: raggruppa per baseline (fondo del bbox)
    items.sort(key=lambda t: t[0][0].stop)
    rows = []; 
    for it in items:
        b = it[0][0].stop
        if rows and abs(rows[-1][0] - b) < 22: rows[-1][1].append(it); rows[-1][0] = max(rows[-1][0], b)
        else: rows.append([b, [it]])
    out = pathlib.Path(out); out.mkdir(parents=True, exist_ok=True)
    meta = []; k = 0
    for r, (base, its) in enumerate(rows):
        its.sort(key=lambda t: t[0][1].start)
        for sl, idx, area, (osl, a0, a1) in its:
            piece = a[sl].copy().astype(np.uint8)
            sel = (lab[sl] == idx) & m[sl]
            ox = sl[1].start - osl[1].start
            colx = np.arange(sl[1].stop - sl[1].start) + ox
            sel &= ((colx >= a0) & (colx < a1))[None, :]
            piece[..., 3] = np.where(sel, 255, 0)
            fn = f'{k:03d}.png'; Image.fromarray(piece).save(out / fn)
            meta.append({'n': k, 'file': fn, 'row': r, 'x': int(sl[1].start), 'y': int(sl[0].start), 'w': int(piece.shape[1]), 'h': int(piece.shape[0]), 'base': int(sl[0].stop)})
            k += 1
    (out / 'index.json').write_text(json.dumps(meta))
    # tavola di controllo
    W_, H_ = im.size; s = 2
    sheet = Image.new('RGB', (W_ * s, H_ * s), (40, 110, 60))
    rgba = Image.fromarray(np.where(m[..., None], a, 0).astype(np.uint8))
    sheet.paste(rgba.resize((W_ * s, H_ * s), Image.NEAREST), (0, 0), rgba.resize((W_ * s, H_ * s), Image.NEAREST))
    d = ImageDraw.Draw(sheet)
    for e in meta:
        d.rectangle([e['x'] * s, e['y'] * s, (e['x'] + e['w']) * s, (e['y'] + e['h']) * s], outline=(255, 255, 0))
        d.text((e['x'] * s + 2, e['y'] * s + 1), str(e['n']), fill=(255, 255, 255), stroke_width=2, stroke_fill=(0, 0, 0))
    sheet.save(out / '_numerata.png')
    print(path, len(meta), 'figure in', len(rows), 'righe')

if __name__ == '__main__':
    extract(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else None)
