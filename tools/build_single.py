#!/usr/bin/env python3
"""Crea dist/night-run.html: un solo file con script e favicon inline (anteprima e condivisione)."""
import base64, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')
block = re.search(r'<!--SCRIPTS-->(.*?)<!--/SCRIPTS-->', html, re.S)
srcs = re.findall(r'src="([^"]+)"', block.group(1))
import json, mimetypes
atlas_files = re.findall(r'"file": "([^"]+)"', ''.join((root / 'js' / n).read_text(encoding='utf-8') for n in ['atlas_px.js', 'backgrounds_px.js', 'atlas_ai.js', 'art_ai.js']))
atlas_files += re.findall(r'"((?:scenes|portraits|objects)_ai/[^"]+)"', (root / 'js/art_ai.js').read_text(encoding='utf-8'))
data = {}
for f in sorted(set(atlas_files)) + ['menu/cover.jpg', 'menu/mappa_bande.jpg', 'menu/emblema.png']:
    mime = mimetypes.guess_type(f)[0] or 'image/png'
    data[f] = 'data:' + mime + ';base64,' + base64.b64encode((root / 'assets' / f).read_bytes()).decode()
assets_js = '<script>window.W = window.W || {}; W.ASSET_DATA = ' + json.dumps(data) + ';</script>\n'
import sys
def script_text(s):
    t = (root / s).read_text(encoding='utf-8')
    # tracce originali: incluse nel file unico solo con --musica (possono pesare molto)
    if s.endswith('musiche.js') and '--musica' in sys.argv:
        def emb(m):
            f = root / m.group(1)
            if not f.exists(): return m.group(0)
            return "'data:" + (mimetypes.guess_type(str(f))[0] or 'audio/mpeg') + ';base64,' + base64.b64encode(f.read_bytes()).decode() + "'"
        t = re.sub(r"'(assets/music/[^']+)'", emb, t)
    return t
inline = assets_js + '\n'.join('<script>\n' + script_text(s) + '\n</script>' for s in srcs)
html = html[:block.start()] + inline + html[block.end():]
fav = base64.b64encode((root / 'assets/favicon.svg').read_bytes()).decode()
html = html.replace('href="assets/favicon.svg"', 'href="data:image/svg+xml;base64,' + fav + '"')
for f in ['favicon-32.png', 'favicon-16.png', 'apple-touch-icon.png']:
    html = html.replace('href="assets/' + f + '"', 'href="data:image/png;base64,' + base64.b64encode((root / 'assets' / f).read_bytes()).decode() + '"')
html = re.sub(r"url\('(assets/fonts/[^']+)'\)", lambda m: "url('data:font/woff2;base64," + base64.b64encode((root / m.group(1)).read_bytes()).decode() + "')", html)
html = re.sub(r'<link rel="manifest"[^>]*>\n?', '', html)
out = root / 'dist' / 'night-run.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print(out, len(html), 'byte')
