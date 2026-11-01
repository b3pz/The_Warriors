#!/usr/bin/env python3
"""Integra nel gioco le immagini caricate in assets/incoming/ (da un'AI o a mano).

Gira da solo su GitHub a ogni caricamento (.github/workflows/integra_immagini.yml) e si può lanciare a mano:
    python3 tools/import_incoming.py

Legge                                             Scrive (usato dal gioco)
  personaggi/<set>/<posa>_<n>.png                   assets/sprites_ai/<set>.png + js/atlas_ai.js
  fondali/<area>_<a|b|c>.png                        assets/backgrounds_ai/<area>.jpg + js/art_ai.js (W.BG_AI)
  scene/<id scena>.png                              assets/scenes_ai/<id>.jpg + js/art_ai.js (W.ART_AI.scene)
  ritratti/<set>.png                                assets/portraits_ai/<set>.png (W.ART_AI.portrait)
  oggetti/<nome>.png                                assets/objects_ai/<nome>.png (W.ART_AI.object)
e un rapporto in assets/incoming/RAPPORTO.md (cosa è entrato, cosa è stato scartato e perché).

Regole: sfondo magenta #FF00FF (o PNG trasparente) tolto in automatico; ogni personaggio scalato sulla sua posa
idle_1 (in gioco ~185 px), piedi allineati in basso; un set entra nel gioco solo quando ha idle_1.
I fondali si affiancano (a, b, c), si scalano a 720 px di altezza e la riga del pavimento (65% dell'immagine)
viene portata sul pavimento dell'area.
"""
import json, re, pathlib, sys
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
INC = ROOT / 'assets' / 'incoming'
TARGET_H = 168            # altezza della posa idle nel foglio (il gioco la mostra a ~185 px)
GAME_SCALE = 2.2 * 84 / TARGET_H
POSE_RE = re.compile(r'^([a-z][a-z_]*?)_(\d+)$')
report = []

# ---- cache: ogni immagine si rielabora solo se è cambiata (impronta del contenuto), così l'integrazione resta veloce
import hashlib
CACHE_F = ROOT / 'assets' / '.import_cache.json'
try: CACHE = json.loads(CACHE_F.read_text())
except Exception: CACHE = {}
NEWCACHE = {}
def digest(files):
    h = hashlib.sha1()
    for f in files: h.update(str(f.relative_to(INC)).encode()); h.update(f.read_bytes())
    return h.hexdigest()
def cached(key, files, outputs):
    d = digest(files); NEWCACHE.setdefault(key, {})['d'] = d
    c = CACHE.get(key)
    if c and c.get('d') == d and all(o.exists() for o in outputs): NEWCACHE[key] = c; return c
    return None
def valid(f):
    """False se il file è rotto (caricamento non riuscito): viene saltato invece di fermare tutto."""
    try:
        with Image.open(f) as im: im.load()
        return True
    except Exception:
        return False


def keyed(path):
    """Apre un PNG e rende trasparente lo sfondo magenta (o tiene la trasparenza vera)."""
    im = Image.open(path).convert('RGBA')
    px = im.load(); w, h = im.size
    alpha_used = any(px[x, y][3] < 250 for x, y in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0)])
    if alpha_used:
        return im, 'trasparente'
    data = []
    mag = 0
    pix = im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata()
    for r, g, b, a in pix:
        d = ((255 - r) ** 2 + g ** 2 + (255 - b) ** 2) ** 0.5
        if d < 120:
            data.append((0, 0, 0, 0)); mag += 1
        elif d < 190 and r > 120 and b > 120 and g < 140:
            # bordo sfumato verso il magenta: tiene il pixel ma toglie la dominante
            m = min(r, b); data.append((max(0, r - (m - g) // 2), g, max(0, b - (m - g) // 2), 255))
        else:
            data.append((r, g, b, 255))
    im.putdata(data)
    return im, 'magenta' if mag > w * h * 0.05 else 'sfondo non riconosciuto'


def trim(im):
    bb = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    return im.crop(bb) if bb else None


def pixelize(im, size):
    """Riduce con media e poi quantizza: resta pixel art pulita, alfa netta."""
    im = im.resize(size, Image.BOX)
    a = im.getchannel('A').point(lambda v: 255 if v > 110 else 0)
    rgb = im.convert('RGB').quantize(64, method=Image.Quantize.MEDIANCUT).convert('RGB')
    out = rgb.convert('RGBA'); out.putalpha(a)
    return out


def feet_x(im):
    w, h = im.size; a = im.getchannel('A').load()
    xs = [x for y in range(max(0, h - max(4, h // 14)), h) for x in range(w) if a[x, y] > 0]
    return int(sum(xs) / len(xs)) if xs else w // 2


def hips_x(im):
    """Centro del bacino (fascia al 38–58% dell'altezza): per la corsa, dove i piedi cambiano a ogni passo."""
    w, h = im.size; a = im.getchannel('A').load()
    xs = [x for y in range(int(h * 0.38), int(h * 0.58)) for x in range(w) if a[x, y] > 0]
    return int(sum(xs) / len(xs)) if xs else w // 2


def pack(frames, max_w=2048):
    x = y = row_h = 0; placed = []; W = 0
    for f in frames:
        w, h = f.size
        if x + w > max_w: x = 0; y += row_h + 2; row_h = 0
        placed.append((x, y)); x += w + 2; row_h = max(row_h, h); W = max(W, x)
    sheet = Image.new('RGBA', (max(1, W), y + row_h), (0, 0, 0, 0))
    for f, (px_, py_) in zip(frames, placed): sheet.paste(f, (px_, py_))
    return sheet, placed


def do_characters():
    out_dir = ROOT / 'assets' / 'sprites_ai'; out_dir.mkdir(parents=True, exist_ok=True)
    sets = {}
    base = INC / 'personaggi'
    if not base.exists(): return sets
    for sd in sorted(p for p in base.iterdir() if p.is_dir()):
        files = {}
        for f in sorted(sd.glob('*.png')):
            if not valid(f): continue
            m = POSE_RE.match(f.stem)
            if not m: report.append(f'- scartato `{f.relative_to(INC)}`: nome non nel formato `<posa>_<numero>.png`'); continue
            files[(m.group(1), int(m.group(2)))] = f
        if ('idle', 1) not in files:
            if files: report.append(f'- set `{sd.name}`: in attesa di `idle_1.png` ({len(files)} pose caricate, non ancora nel gioco)')
            continue
        hit = cached('set:' + sd.name, [files[k] for k in sorted(files)], [out_dir / f'{sd.name}.png'])
        if hit and 'set' in hit: sets[sd.name] = hit['set']; continue
        imgs = {}
        for k, f in files.items():
            im, how = keyed(f); t = trim(im)
            if t is None: report.append(f'- scartato `{f.relative_to(INC)}`: immagine vuota dopo aver tolto lo sfondo'); continue
            if how == 'sfondo non riconosciuto': report.append(f'- attenzione `{f.relative_to(INC)}`: lo sfondo non è magenta né trasparente, il ritaglio può essere sbagliato')
            imgs[k] = t
        ref = imgs.get(('idle', 1))
        if ref is None: continue
        s = TARGET_H / ref.size[1]
        order = sorted(imgs.keys()); frames = []; meta = []
        # i fotogrammi della corsa hanno tutti la stessa altezza (se l'AI ne disegna uno più grande, il ciclo «pulsa»)
        runs = sorted(imgs[k].size[1] for k in imgs if k[0] == 'run'); run_h = runs[len(runs) // 2] if runs else None
        for k in order:
            im = imgs[k]; sk = s * (run_h / im.size[1] if k[0] == 'run' and run_h else 1)
            size = (max(1, round(im.size[0] * sk)), max(1, round(im.size[1] * sk)))
            if size[1] > TARGET_H * 1.6 or size[0] > TARGET_H * 2.6:
                report.append(f'- attenzione `{sd.name}/{k[0]}_{k[1]}`: molto più grande della posa idle (scala diversa?)')
            px_ = pixelize(im, size); frames.append(px_)
            lying = k[0].startswith(('down', 'pinned', 'arrest', 'sit'))
            meta.append((k, px_.size[0] // 2 if lying else hips_x(px_) if k[0] == 'run' else feet_x(px_), px_.size[1]))
        sheet, placed = pack(frames)
        sheet.save(out_dir / f'{sd.name}.png')
        fr = {}
        for (k, ax, ay), (x, y), f in zip(meta, placed, frames):
            fr.setdefault(k[0], []).append([x, y, f.size[0], f.size[1], ax, ay])
        sets[sd.name] = {'file': f'sprites_ai/{sd.name}.png', 'scale': round(GAME_SCALE, 4), 'frames': fr}; NEWCACHE['set:' + sd.name]['set'] = sets[sd.name]
        report.append(f'- **{sd.name}**: nel gioco con {len(frames)} immagini ({", ".join(sorted(fr))})')
    return sets


def area_table():
    """Larghezza e riga del pavimento di ogni area (tabella in docs/SPRITE_MANCANTI.md)."""
    t = {}
    for m in re.finditer(r'^\| ((?:P0|PQ|C\d)-\d\d) \| [^|]+ \| [^|]+ \| [^|]+ \| (\d+) × 720 \| (\d+) \|$', (ROOT / 'docs' / 'SPRITE_MANCANTI.md').read_text(encoding='utf-8'), re.M):
        t[m.group(1)] = (int(m.group(2)), int(m.group(3)))
    return t


def do_backgrounds():
    out_dir = ROOT / 'assets' / 'backgrounds_ai'; out_dir.mkdir(parents=True, exist_ok=True)
    base = INC / 'fondali'; bg = {}
    if not base.exists(): return bg
    areas = area_table(); groups = {}
    for f in sorted(base.glob('*.png')) + sorted(base.glob('*.jpg')):
        m = re.match(r'^((?:P0|PQ|C\d)-\d\d)_([abc])$', f.stem)
        if not m or m.group(1) not in areas: report.append(f'- scartato `{f.relative_to(INC)}`: nome non nel formato `<area>_a.png` (es. `C4-02_a.png`)'); continue
        groups.setdefault(m.group(1), []).append((m.group(2), f))
    for aid, pieces in sorted(groups.items()):
        pieces = [pc for pc in pieces if valid(pc[1])]
        if not pieces: continue
        hit = cached('bg:' + aid, [f for _, f in sorted(pieces)], [out_dir / f'{aid}.jpg'])
        if hit and 'bg' in hit: bg[aid] = hit['bg']; continue
        pieces = [Image.open(f).convert('RGB') for _, f in sorted(pieces)]
        H = 1024; pieces = [p.resize((round(p.size[0] * H / p.size[1]), H), Image.LANCZOS) for p in pieces]
        ov = 48; total = sum(p.size[0] for p in pieces) - ov * (len(pieces) - 1)
        strip = Image.new('RGB', (total, H)); x = 0
        for i, p in enumerate(pieces):
            if i == 0: strip.paste(p, (0, 0)); x = p.size[0] - ov; continue
            # dissolvenza sulla giunta
            mask = Image.linear_gradient('L').rotate(90).resize((ov, H))
            left = strip.crop((x, 0, x + ov, H)); right = p.crop((0, 0, ov, H))
            strip.paste(Image.composite(left, right, mask), (x, 0)); strip.paste(p.crop((ov, 0, p.size[0], H)), (x + ov, 0)); x += p.size[0] - ov
        aw, floor = areas[aid]
        s = max(720 / H, aw / total)
        img = strip.resize((round(total * s), round(H * s)), Image.LANCZOS)
        off = round(floor - 0.65 * H * s)
        canvas = Image.new('RGB', (aw, 720))
        canvas.paste(img.crop((0, 0, aw, img.size[1])), (0, off))
        if off > 0: canvas.paste(img.crop((0, 0, aw, 1)).resize((aw, off)), (0, 0))
        bottom = off + img.size[1]
        if bottom < 720: canvas.paste(img.crop((0, img.size[1] - 1, aw, img.size[1])).resize((aw, 720 - bottom)), (0, bottom))
        canvas.save(out_dir / f'{aid}.jpg', quality=88)
        bg[aid] = {'file': f'backgrounds_ai/{aid}.jpg', 'w': aw, 'h': 720}; NEWCACHE['bg:' + aid]['bg'] = bg[aid]
        report.append(f'- **fondale {aid}**: nel gioco ({len(pieces)} pezzi, {aw}×720)')
    return bg


def do_simple(sub, out_sub, fmt, key=False, max_side=None):
    base = INC / sub; out = {}
    if not base.exists(): return out
    od = ROOT / 'assets' / out_sub; od.mkdir(parents=True, exist_ok=True)
    for f in sorted(base.glob('*.png')) + sorted(base.glob('*.jpg')):
        if f.name.startswith('.'): continue
        if not valid(f): continue
        name = f'{f.stem}.{fmt}'
        if cached(sub + ':' + f.name, [f], [od / name]): out[f.stem] = f'{out_sub}/{name}'; continue
        if key:
            im, _ = keyed(f); im = trim(im)
            if im is None: continue
        else:
            im = Image.open(f).convert('RGB')
        if max_side: im.thumbnail((max_side, max_side), Image.LANCZOS)
        name = f'{f.stem}.{fmt}'
        if fmt == 'jpg': im.convert('RGB').save(od / name, quality=88)
        else: im.save(od / name)
        out[f.stem] = f'{out_sub}/{name}'
    if out: report.append(f'- {sub}: {", ".join(sorted(out))}')
    return out



# brani dell'album «The Warriors – Original Motion Picture Soundtrack» (1979): nome libero, riconosciuti dal titolo
TRACKS = [
    ('theme', ['theme']), ('nowhere_to_run', ['nowhere']), ('in_havana', ['havana']), ('echoes_in_my_mind', ['echoes']),
    ('baseball_furies_chase', ['furies', 'baseball']), ('the_fight', ['fight']), ('in_the_city', ['city']),
    ('love_is_a_fire', ['love', 'fire']), ('youre_movin_too_slow', ['movin', 'moving', 'slow']), ('last_of_an_ancient_breed', ['ancient', 'breed'])]


def do_music():
    """Brani dell'album in assets/incoming/musica/ (qualsiasi nome che contenga il titolo): convertiti in mp3 in assets/music/.
    I brani già in assets/music/ restano collegati anche se l'originale in incoming viene tolto."""
    import shutil, subprocess
    od = ROOT / 'assets' / 'music'; od.mkdir(parents=True, exist_ok=True)
    keys = [k for k, _ in TRACKS]
    out = {f.stem: f'assets/music/{f.name}' for f in sorted(od.iterdir()) if f.stem in keys and f.suffix.lower() in ('.mp3', '.m4a', '.ogg')}
    base = INC / 'musica'; new = []
    if base.exists():
        ff = shutil.which('ffmpeg')
        for f in sorted(base.iterdir()):
            if f.suffix.lower() not in ('.mp3', '.m4a', '.ogg', '.wav', '.aac', '.flac', '.aif', '.aiff'): continue
            name = re.sub(r'[^a-z]', ' ', f.stem.lower())
            key = next((k for k, words in TRACKS if any(wd in name.split() or wd in name for wd in words) and k not in new), None)
            if key == 'the_fight' and 'furies' in name: key = 'baseball_furies_chase'
            if not key: report.append(f'- musica: `{f.name}` non riconosciuto (rinominalo con il titolo del brano)'); continue
            if f.suffix.lower() in ('.mp3', '.m4a', '.ogg'):
                dst = od / (key + f.suffix.lower()); dst.write_bytes(f.read_bytes())
            elif ff:
                dst = od / (key + '.mp3')
                r = subprocess.run([ff, '-y', '-loglevel', 'error', '-i', str(f), '-vn', '-c:a', 'libmp3lame', '-b:a', '128k', '-ar', '44100', str(dst)])
                if r.returncode != 0: report.append(f'- **musica rotta** `{f.name}`: non si riesce a leggerla'); continue
            else: report.append(f'- musica: `{f.name}` va convertita in mp3 (ffmpeg non disponibile)'); continue
            for o in od.glob(key + '.*'):
                if o != dst: o.unlink()
            out[key] = f'assets/music/{dst.name}'; new.append(key)
    if new: report.append('- **musica**: ' + ', '.join(sorted(new)))
    return out


# effetti sonori: nome del file (o del pacchetto Kenney «Impact Sounds», licenza CC0) → evento del gioco
SFX_RULES = [
    ('hit_heavy', ['hit_heavy', 'impactpunch_heavy', 'pugno_forte']), ('hit_light', ['hit_light', 'impactpunch_medium', 'impactpunch_light', 'pugno']),
    ('hit_weapon', ['hit_weapon', 'impactwood', 'impactplank', 'mazza']), ('hit_metal', ['hit_metal', 'impactmetal', 'tubo']),
    ('bottle', ['bottle', 'impactglass_light', 'impactglass_medium', 'bottiglia']), ('break', ['break', 'impactglass_heavy', 'rottura', 'vetro']),
    ('ko', ['ko', 'impactsoft_heavy', 'caduta']), ('throw', ['throw', 'impactsoft_medium', 'lancio']), ('swing', ['swing', 'whoosh', 'fendente']),
    ('pickup', ['pickup', 'raccogli', 'impacttin']), ('land', ['land', 'atterra', 'impactgeneric_light']), ('shot', ['shot', 'gunshot', 'sparo']), ('siren', ['siren', 'sirena']), ('train', ['train', 'subway', 'treno', 'metro']),
    ('skate', ['skate', 'roller', 'pattini']), ('spray', ['spray', 'bomboletta']), ('fire', ['fire', 'fuoco', 'fiamme']), ('open', ['door', 'porta'])]


def do_sfx():
    """Effetti in assets/incoming/suoni/ (anche sottocartelle): convertiti in mp3 mono in assets/sfx/<evento>_<n>.mp3."""
    import shutil, subprocess
    od = ROOT / 'assets' / 'sfx'; od.mkdir(parents=True, exist_ok=True)
    base = INC / 'suoni'; ff = shutil.which('ffmpeg'); new = 0
    man_f = od / '_fonti.json'; man = json.loads(man_f.read_text()) if man_f.exists() else {}
    if base.exists():
        for f in sorted(base.rglob('*')):
            if f.suffix.lower() not in ('.wav', '.ogg', '.mp3', '.flac', '.aif', '.aiff', '.m4a'): continue
            rel = str(f.relative_to(INC))
            if rel in man and (od / man[rel]).exists(): continue
            name = f.stem.lower().replace(' ', '_').replace('-', '_')
            key = next((k for k, words in SFX_RULES if any(name.startswith(wd) or ('_' + wd) in name for wd in words)), None)
            if not key: report.append(f'- suono: `{rel}` non riconosciuto (rinominalo con l\'evento, es. mazza_1.wav)'); continue
            if not ff: report.append('- suoni: ffmpeg non disponibile'); break
            n = 1
            while (od / f'{key}_{n}.mp3').exists(): n += 1
            dst = od / f'{key}_{n}.mp3'
            r = subprocess.run([ff, '-y', '-loglevel', 'error', '-i', str(f), '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '96k', str(dst)])
            if r.returncode != 0: report.append(f'- **suono rotto** `{f.name}`'); continue
            man[rel] = dst.name; new += 1
    man_f.write_text(json.dumps(man, indent=1, sort_keys=True))
    out = {}
    for f in sorted(od.glob('*.mp3')):
        k = f.stem.rsplit('_', 1)[0]; out.setdefault(k, []).append(f'assets/sfx/{f.name}')
    if new: report.append(f'- **suoni**: {new} nuovi · ' + ', '.join(f'{k} {len(v)}' for k, v in sorted(out.items())))
    return out


VIDEO_IDS = ['v_attract', 'v_radio_dj', 'v_wonder_wheel', 'v_beach_dawn', 'v_cyrus_shot', 'v_luther_bottles', 'v_furies_bats', 'v_conclave', 'v_train_night', 'v_duel',
             'v_riffs_order', 'v_turnbull_bus', 'v_car_fire', 'v_ajax_cuffs', 'v_lizzies_lock', 'v_punks_skates', 'v_rembrandt_tag', 'v_train_dawn', 'v_riffs_beach']


def do_video():
    """Video in assets/incoming/video/ (elenco in VIDEO_PER_AI.md): compressi in H.264 720p senza audio in assets/video/."""
    import shutil, subprocess
    base = INC / 'video'; out = {}
    if not base.exists(): return out
    od = ROOT / 'assets' / 'video'; od.mkdir(parents=True, exist_ok=True)
    ff = shutil.which('ffmpeg')
    for f in sorted(base.iterdir()):
        if f.suffix.lower() not in ('.mp4', '.mov', '.webm', '.m4v'): continue
        stem = f.stem.lower().replace('-', '_').replace(' ', '_')
        vid = stem if stem in VIDEO_IDS else ('v_' + stem if 'v_' + stem in VIDEO_IDS else None)
        if not vid: report.append(f'- video: `{f.name}` non riconosciuto (il nome deve essere uno di quelli in VIDEO_PER_AI.md)'); continue
        dst = od / (vid + '.mp4')
        if dst.exists() and dst.stat().st_mtime >= f.stat().st_mtime: out[vid] = f'assets/video/{dst.name}'; continue
        if ff:
            r = subprocess.run([ff, '-y', '-loglevel', 'error', '-i', str(f), '-vf', "scale='min(1280,iw)':-2,fps=30", '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24',
                                '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', str(dst)])
            if r.returncode != 0: report.append(f'- **video rotto** `{f.name}`: non si riesce a leggerlo, rigeneralo e ricaricalo'); continue
        elif f.suffix.lower() == '.mp4': dst.write_bytes(f.read_bytes())
        else: report.append(f'- video: `{f.name}` va convertito in mp4 (ffmpeg non disponibile)'); continue
        out[vid] = f'assets/video/{dst.name}'
    if out: report.append('- **video**: ' + ', '.join(sorted(out)))
    return out


def check_files():
    """Segnala i file che non sono immagini valide (caricamenti rotti): vanno ricaricati."""
    for f in sorted(INC.rglob('*')):
        if f.suffix.lower() not in ('.png', '.jpg', '.jpeg') or 'riferimenti' in f.parts: continue
        try:
            with Image.open(f) as im: im.verify()
        except Exception:
            report.append(f'- **file rotto** `{f.relative_to(INC)}`: non è un\'immagine valida (caricamento non riuscito). Rigeneralo e ricaricalo con lo stesso nome.')


def main():
    check_files()
    sets = do_characters()
    bg = do_backgrounds()
    art = {'scene': do_simple('scene', 'scenes_ai', 'jpg', max_side=1600),
           'portrait': do_simple('ritratti', 'portraits_ai', 'png', key=True, max_side=320),
           'object': do_simple('oggetti', 'objects_ai', 'png', key=True, max_side=900)}
    tracks = do_music()
    videos = do_video()
    sounds = do_sfx()
    head = "'use strict';\n// Generato da tools/import_incoming.py dalle immagini in assets/incoming/: non modificare a mano.\nwindow.W = window.W || {};\n"
    (ROOT / 'js' / 'atlas_ai.js').write_text(head + 'W.ATLAS_AI = ' + json.dumps({'sets': sets}) + ';\n', encoding='utf-8')
    (ROOT / 'js' / 'suoni_auto.js').write_text(head.replace('dalle immagini', 'dai suoni') + 'W.SFX_AUTO = ' + json.dumps(sounds) + ';\n', encoding='utf-8')
    (ROOT / 'js' / 'videos_auto.js').write_text(head.replace('dalle immagini', 'dai video') + 'W.VIDEOS_AUTO = ' + json.dumps(videos) + ';\n', encoding='utf-8')
    (ROOT / 'js' / 'musiche_auto.js').write_text(head + 'W.MUSIC_AUTO = ' + json.dumps(tracks) + ';\n', encoding='utf-8')
    (ROOT / 'js' / 'art_ai.js').write_text(head + 'W.BG_AI = ' + json.dumps(bg) + ';\nW.ART_AI = ' + json.dumps(art) + ';\n', encoding='utf-8')
    CACHE_F.write_text(json.dumps(NEWCACHE, sort_keys=True))
    (INC / 'RAPPORTO.md').write_text('# Rapporto dell\'integrazione automatica\n\nAggiornato a ogni caricamento in `assets/incoming/`.\n\n' + ('\n'.join(report) if report else 'Nessuna immagine da integrare.') + '\n', encoding='utf-8')
    print('\n'.join(report) or 'nessuna immagine')


if __name__ == '__main__':
    main()
