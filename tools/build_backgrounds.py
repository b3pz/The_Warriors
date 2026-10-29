#!/usr/bin/env python3
"""Fondali pixel art per ambiente (dalla grafica approvata, Raccolta 04 e Asset Pack 02).

Ogni voce: sorgente, ritaglio (x0, y0, x1, y1) e floorTop = riga del ritaglio dove inizia il
pavimento. Il renderer scala la parte alta fino a y=430 e allunga il pavimento fino in fondo.
Scrive assets/backgrounds_px/<id>.png e js/backgrounds_px.js.
"""
import json, pathlib
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
S = ROOT / 'assets' / 'source'
BG = {
    # id: (file, crop, floorTop, nota)
    'park':      ('pack_02/Fondali/Parco/parco_sheet_01.png', (2, 2, 847, 211), 168, 'Parco notturno con panchine e lungofiume'),
    'park_b':    ('raccolta_04/Fondali/Parco/parco_05.png', (2, 2, 413, 194), 158, 'Parco, variante'),
    'metro':     ('raccolta_04/Fondali/Metro/metro_04.png', (2, 2, 802, 135), 104, 'Banchina con treno'),
    'metro_b':   ('raccolta_04/Fondali/Metro/metro_05.png', (2, 2, 582, 194), 150, 'Banchina e scale'),
    'alley':     ('raccolta_04/Fondali/Industriale/vicolo_04.png', (2, 2, 281, 153), 112, 'Vicolo con saracinesche'),
    'street':    ('raccolta_04/Fondali/Industriale/strada_04.png', (2, 2, 230, 135), 104, 'Strada con negozi'),
    'street_b':  ('raccolta_04/Fondali/Industriale/strada_05.png', (2, 2, 220, 194), 150, 'Strada stretta'),
    'harbor':    ('raccolta_04/Fondali/Industriale/porto_04.png', (2, 2, 587, 153), 118, 'Strada e banchina sul fiume'),
    'interior':  ('pack_02/Fondali/Industriale/industriale_sheet_01.png', (2, 2, 288, 120), 92, 'Interno piastrellato (ripiego per bagno e appartamento)'),
    'coney':     ('raccolta_04/Fondali/Coney_Island/coney_06.png', (2, 2, 273, 194), 142, 'Coney Island, luna park'),
    'coney_b':   ('pack_02/Fondali/Coney_Island/coney_sheet_01.png', (2, 8, 329, 184), 138, 'Coney Island, viale'),
    'boardwalk': ('raccolta_04/Fondali/Coney_Island/coney_05.png', (2, 2, 231, 153), 116, 'Lungomare (ripiego per la spiaggia)'),
}
out = ROOT / 'assets' / 'backgrounds_px'; out.mkdir(parents=True, exist_ok=True)
data = {}
for k, (f, box, ft, note) in BG.items():
    im = Image.open(S / f).convert('RGB').crop(box)
    im.save(out / f'{k}.png', optimize=True)
    data[k] = {'file': f'backgrounds_px/{k}.png', 'w': im.width, 'h': im.height, 'floorTop': ft - box[1], 'note': note, 'source': f}
(ROOT / 'js' / 'backgrounds_px.js').write_text("'use strict';\n// Generato da tools/build_backgrounds.py: non modificare a mano.\nwindow.W = window.W || {};\nW.BG_PX = " + json.dumps(data, ensure_ascii=False) + ";\n")
print(len(data), 'fondali')
