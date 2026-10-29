#!/usr/bin/env python3
"""Crea dist/night-run.html: un solo file con script e favicon inline (anteprima e condivisione)."""
import base64, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')
block = re.search(r'<!--SCRIPTS-->(.*?)<!--/SCRIPTS-->', html, re.S)
srcs = re.findall(r'src="([^"]+)"', block.group(1))
import json, mimetypes
atlas_files = re.findall(r'"file": "([^"]+)"', (root / 'js/atlas_data.js').read_text(encoding='utf-8'))
data = {}
for f in sorted(set(atlas_files)) + ['menu/cover.jpg']:
    mime = mimetypes.guess_type(f)[0] or 'image/png'
    data[f] = 'data:' + mime + ';base64,' + base64.b64encode((root / 'assets' / f).read_bytes()).decode()
assets_js = '<script>window.W = window.W || {}; W.ASSET_DATA = ' + json.dumps(data) + ';</script>\n'
inline = assets_js + '\n'.join('<script>\n' + (root / s).read_text(encoding='utf-8') + '\n</script>' for s in srcs)
html = html[:block.start()] + inline + html[block.end():]
fav = base64.b64encode((root / 'assets/favicon.svg').read_bytes()).decode()
html = html.replace('href="assets/favicon.svg"', 'href="data:image/svg+xml;base64,' + fav + '"')
out = root / 'dist' / 'night-run.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print(out, len(html), 'byte')
