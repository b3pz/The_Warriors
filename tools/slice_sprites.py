#!/usr/bin/env python3
"""Pipeline asset: originali in assets/source → frame ritagliati in assets/sprites + atlas JSON.

- Conserva gli originali intatti con sha256 (assets/source/inventory.json).
- Rimuove l'alone dei pixel quasi trasparenti (alpha < 60).
- Isola le pose per componenti connesse (mazza unita alla mano con una dilatazione).
- Pivot ai piedi: centro orizzontale della base opaca, y = riga opaca più bassa.
Uso: python3 tools/slice_sprites.py
"""
import hashlib, json, pathlib
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets' / 'source'
OUT = ROOT / 'assets' / 'sprites'
OUT.mkdir(parents=True, exist_ok=True)

# Ordine delle pose come disegnate nelle tavole (riga per riga, da sinistra)
SHEETS = {
    'warrior_a': {'file': 'warrior_a_8pose.png',
                  'poses': ['guard', 'walk1', 'walk2', 'punch', 'kick', 'bat_windup', 'hurt', 'jump']},
    'fury': {'file': 'fury_8pose.png',
             'poses': ['idle', 'walk1', 'walk2', 'swing', 'windup', 'downswing', 'hurt', 'down']},
}
# Altezza logica del personaggio in piedi (unità di gioco) usata per la scala
STAND_H = 190


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def clean(a):
    a = a.copy()
    a[a[..., 3] < 60] = 0
    return a


def components(a, n_expected):
    mask = a[..., 3] > 0
    grown = ndimage.binary_dilation(mask, iterations=6)
    lab, n = ndimage.label(grown)
    boxes = ndimage.find_objects(lab)
    items = []
    for i, sl in enumerate(boxes):
        area = (lab[sl] == i + 1).sum()
        if area < 4000:
            continue
        items.append((sl, i + 1))
    # ordina per riga (metà altezza) e poi per x
    h = a.shape[0]
    items.sort(key=lambda it: (0 if (it[0][0].start + it[0][0].stop) / 2 < h / 2 else 1, it[0][1].start))
    if len(items) != n_expected:
        raise SystemExit(f'attese {n_expected} pose, trovate {len(items)}')
    return lab, items


def cut(a, lab, sl, idx):
    ys, xs = sl
    piece = a[ys, xs].copy()
    piece[lab[ys, xs] != idx] = 0
    al = piece[..., 3] > 0
    rows = np.where(al.any(1))[0]
    cols = np.where(al.any(0))[0]
    piece = piece[rows[0]:rows[-1] + 1, cols[0]:cols[-1] + 1]
    return piece


def foot_pivot(piece):
    al = piece[..., 3] > 0
    h = al.shape[0]
    bottom = np.where(al.any(1))[0][-1]
    band = al[max(0, bottom - int(h * 0.08)):bottom + 1]
    cols = np.where(band.any(0))[0]
    return int((cols[0] + cols[-1]) / 2), int(bottom)


def remove_bat(a):
    """Variante a mani nude ricavata per colore: toglie la componente di legno più allungata.
    Ripiego automatico (buchi dove la mazza copriva il corpo): sostituire con pose disegnate."""
    f = a.astype(float) / 255
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    mx, mn = f[..., :3].max(-1), f[..., :3].min(-1)
    d = mx - mn + 1e-6
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    wood = (a[..., 3] > 0) & (hue > 18) & (hue < 42) & (s > 0.45) & (mx > 0.35)
    lab, _ = ndimage.label(ndimage.binary_closing(wood, iterations=2))
    best = None
    for i, sl in enumerate(ndimage.find_objects(lab)):
        m = lab == i + 1
        if m.sum() < 300:
            continue
        ys, xs = np.nonzero(m)
        ev = np.linalg.eigvalsh(np.cov(np.vstack([xs, ys])))
        el = ev[1] / max(ev[0], 1)
        if el > 8 and (best is None or m.sum() * el > best[0]):
            best = (m.sum() * el, m)
    out = a.copy()
    if best:
        out[ndimage.binary_dilation(best[1], iterations=3)] = 0
    return out


def main():
    inv = json.loads((SRC / 'inventory.json').read_text())
    atlas = {'version': 1, 'standHeight': STAND_H, 'sets': {}, 'props': {}, 'backgrounds': {}}
    for set_id, spec in SHEETS.items():
        img = np.array(Image.open(SRC / spec['file']).convert('RGBA'))
        a = clean(img)
        lab, items = components(a, len(spec['poses']))
        frames = {}
        pieces = [cut(a, lab, sl, idx) for sl, idx in items]
        # scala: l'altezza della prima posa (in piedi) diventa STAND_H unità
        ref_h = pieces[0].shape[0]
        # esportazione a ~1,4× la dimensione a schermo: nitida senza pesare quanto l'originale
        k = STAND_H * 1.4 / ref_h
        pieces = [np.array(Image.fromarray(p).resize((max(1, round(p.shape[1] * k)), max(1, round(p.shape[0] * k))), Image.LANCZOS)) for p in pieces]
        ref_h = pieces[0].shape[0]
        for name, piece in zip(spec['poses'], pieces):
            px, py = foot_pivot(piece)
            if name in ('jump',):  # posa in aria: pivot sotto il baricentro
                py = piece.shape[0] + int(ref_h * 0.05)
            if name == 'down':     # a terra: piedi a destra, ancoraggio al centro del corpo
                px = piece.shape[1] // 2
            fn = f'{set_id}_{name}.png'
            Image.fromarray(piece).save(OUT / fn, optimize=True)
            frames[name] = {'file': 'sprites/' + fn, 'w': piece.shape[1], 'h': piece.shape[0], 'px': px, 'py': py}
        atlas['sets'][set_id] = {'scale': STAND_H / ref_h, 'frames': frames,
                                 'source': spec['file'], 'sourceSha256': inv[spec['file']]['sha256'],
                                 'facing': 1}
        print(set_id, {k: (v['w'], v['h']) for k, v in frames.items()})
        if set_id == 'fury':
            nb = {}
            for name, f in frames.items():
                im = np.array(Image.open(OUT / pathlib.Path(f['file']).name))
                fn = f'fury_nobat_{name}.png'
                Image.fromarray(remove_bat(im)).save(OUT / fn, optimize=True)
                nb[name] = dict(f, file='sprites/' + fn)
            atlas['sets']['fury_nobat'] = {'scale': atlas['sets']['fury']['scale'], 'frames': nb, 'source': spec['file'],
                                           'sourceSha256': inv[spec['file']]['sha256'], 'facing': 1, 'derived': 'remove_bat automatico, da sostituire'}

    # fondale: copia a 720 px d'altezza; props ritagliati dal dipinto (collider dichiarati nei dati livello)
    bg = Image.open(SRC / 'park_night.png').convert('RGB')
    s = 720 / bg.height
    bgs = bg.resize((round(bg.width * s), 720), Image.LANCZOS)
    (OUT.parent / 'backgrounds').mkdir(exist_ok=True)
    bgs.save(OUT.parent / 'backgrounds' / 'park_night_720.jpg', quality=88)
    atlas['backgrounds']['park_night'] = {'file': 'backgrounds/park_night_720.jpg', 'w': bgs.width, 'h': 720,
                                          'floorTop': round(510 * s), 'source': 'park_night.png'}
    (ROOT / 'assets' / 'atlas.json').write_text(json.dumps(atlas, indent=1, ensure_ascii=False))
    # stessi dati come script, per funzionare anche aprendo index.html da disco
    (ROOT / 'js' / 'atlas_data.js').write_text("'use strict';\n// Generato da tools/slice_sprites.py: non modificare a mano.\nwindow.W = window.W || {};\nW.ATLAS = " + json.dumps(atlas, ensure_ascii=False) + ";\n")
    print('atlas scritto')


if __name__ == '__main__':
    main()
