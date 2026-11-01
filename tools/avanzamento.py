#!/usr/bin/env python3
"""Quante immagini dell'elenco IMMAGINI_PER_AI.md sono già nel repository, per gruppo."""
import re, os, pathlib
os.chdir(pathlib.Path(__file__).resolve().parent.parent)
s = open('IMMAGINI_PER_AI.md', encoding='utf-8').read()
items = re.findall(r"^\d+\. `(assets/incoming/[^`]+)`", s, re.M)
extra = set(re.findall(r"`(assets/incoming/[^`]+)`", s.split('### 4b.')[1].split('### 5.')[0]))
W9 = ['swan', 'rembrandt', 'cochise', 'snow', 'cowboy', 'fox', 'ajax', 'cleon', 'vermin']
order = ['Mercy', 'Fondali', 'Warriors, pose di base e speciali', 'Pose in più dei Warriors', 'Bande e personaggi', 'Oggetti, veicoli ed effetti', 'Ritratti', 'Illustrazioni delle scene']
tot = {g: 0 for g in order}; done = {g: 0 for g in order}; sets_done = {}
for p in items:
    parts = p.split('/'); t = parts[2]
    if p in extra: g = 'Pose in più dei Warriors'
    elif t == 'personaggi': g = 'Mercy' if parts[3].startswith('mercy') else ('Warriors, pose di base e speciali' if parts[3] in W9 else 'Bande e personaggi')
    else: g = {'fondali': 'Fondali', 'oggetti': 'Oggetti, veicoli ed effetti', 'ritratti': 'Ritratti'}.get(t, 'Illustrazioni delle scene')
    tot[g] += 1
    if os.path.exists(p) or os.path.exists(p[:-4] + '.jpg'):
        done[g] += 1
        if t == 'personaggi': sets_done.setdefault(parts[3], 0); sets_done[parts[3]] += 1
miss = [p for p in items if not (os.path.exists(p) or os.path.exists(p[:-4] + '.jpg'))]
print(f'{len(items) - len(miss)} su {len(items)}; prossimo: {items.index(miss[0]) + 1 if miss else "-"} {miss[0] if miss else ""}')
for g in order: print(f'{g}: {done[g]}/{tot[g]}')
print('personaggi con immagini:', ', '.join(f'{k} {v}' for k, v in sorted(sets_done.items())))
