// Minigioco del bagno (C6-02) con tasti veri: esito riuscito (E al momento giusto) ed esito fallito (rumore).
// Uso: node tools/qa_stealth.js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts/, r => r.abort());
  await p.goto('file://' + path.join(__dirname, '..', 'index.html')); await p.waitForTimeout(500);
  const st = () => p.evaluate(() => { const g = W.Game.game, a = g.world.area; return { state: g.state, id: a && a.id, scene: !!(a && a.scene), phase: a && a.st && a.st.phase, obj: a && a.objective, res: a && a.st && a.st.result, flag: !!g.world.flags.skater_down, prompt: g.world.players[0] && g.world.promptFor(g.world.players[0]) }; });
  async function run(mode) {
    await p.evaluate(() => W.Game.startAt(W.areaIndex('C6-02'), 'solo'));
    for (let i = 0; i < 40; i++) { const s = await st(); if (s.state === 'party' || s.scene) { await p.keyboard.press('Enter'); await p.waitForTimeout(120); } else break; }
    // raggiungi la seconda porta e nasconditi
    await p.keyboard.down('KeyD'); await p.waitForTimeout(900); await p.keyboard.up('KeyD');
    let s = await st(); for (let i = 0; i < 20 && s.phase === 'hide'; i++) { if (s.prompt) await p.keyboard.press('KeyE'); else { await p.keyboard.down('KeyD'); await p.waitForTimeout(150); await p.keyboard.up('KeyD'); } await p.waitForTimeout(100); s = await st(); }
    if (mode === 'shot') await p.screenshot({ path: process.argv[2] || '/tmp/stealth.png' });
    for (let i = 0; i < 300; i++) {
      s = await st(); if (s.phase === 'done' || s.id !== 'C6-02') break;
      if (mode === 'noise') { await p.keyboard.down('KeyA'); await p.waitForTimeout(100); await p.keyboard.up('KeyA'); }
      else if (/ORA/.test(s.obj)) { if (mode === 'shot') await p.screenshot({ path: (process.argv[2] || '/tmp/stealth.png').replace('.png', '_ora.png') }); await p.keyboard.press('KeyE'); }
      await p.waitForTimeout(60);
    }
    const end = await st();
    for (let i = 0; i < 60; i++) { const s2 = await st(); if (s2.id !== 'C6-02') break; await p.waitForTimeout(100); }
    const after = await st();
    return { end, after: after.id || after.state };
  }
  console.log('riuscito:', JSON.stringify(await run('shot')));
  console.log('rumore:', JSON.stringify(await run('noise')));
  console.log(errs.length ? 'ERRORI ' + errs.join(' | ') : 'nessun errore JS');
  await b.close();
})();
