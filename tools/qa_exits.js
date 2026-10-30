// Prova con tasti veri tutte le uscite a piedi o a interazione delle aree senza combattimento.
// Uso: node tools/qa_exits.js
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
 p.on('pageerror', e => console.log('ERR', e.message, (e.stack||'').split('\n').slice(1,4).join(' | '))); await p.route(/fonts/, r => r.abort());
 await p.goto('file://' + require('path').join(__dirname, '..', 'index.html') + ''); await p.waitForTimeout(600);
 const ids = ['P0-01','C1-01','C1-04','C2-01','C5-02','C5-04','C5-05','C6-01','C6-04','C7-01','C8-01'];
 for (const id of ids) {
  await p.evaluate((id) => { W.Game.startAt(W.areaIndex(id), 'solo'); }, id);
  for (let k = 0; k < 4; k++) { const st0 = await p.evaluate(() => W.Game.game.state); if (st0 === 'party') { await p.keyboard.press('Enter'); await p.waitForTimeout(100); } }
  let res = null;
  for (let t = 0; t < 140 && !res; t++) {
    const s = await p.evaluate(() => { const g = W.Game.game, a = g.world.area || { id: 'party' }; if (!g.world.area || g.state === 'party' || g.state === 'comic') return { state: g.state, id: g.state === 'comic' ? 'comic' : a.id }; return { state: g.state, id: a.id, scene: !!a.scene, done: a.done, x: Math.round(g.world.players[0].x), prompt: g.world.promptFor(g.world.players[0]), talks: a.talkCount, couple: !!(a.talked && a.talked.couple) }; });
    if (s.state === 'party' || s.id !== id || s.done) { res = 'OK (' + t + ' passi)'; break; }
    if (s.scene) { await p.keyboard.press('Enter'); await p.waitForTimeout(150); continue; }
    if (s.prompt && !(/^Parla/.test(s.prompt) && s.talks >= 1 && !(/Passeggeri/.test(s.prompt) && !s.couple))) { await p.keyboard.press('KeyE'); await p.waitForTimeout(300); continue; }
    const xb = s.x; await p.keyboard.down('KeyD'); await p.waitForTimeout(400);
    const xa = await p.evaluate(() => W.Game.game.world && W.Game.game.world.players[0] ? W.Game.game.world.players[0].x : 0);
    if (xb !== undefined && Math.abs(xa - xb) < 20) { await p.keyboard.press('Space'); await p.waitForTimeout(500); } // ostacolo basso: salta
    await p.keyboard.up('KeyD');

  }
  if (!res) res = 'BLOCCATO ' + JSON.stringify(await p.evaluate(() => { const g = W.Game.game, a = g.world.area, pl = g.world.players[0]; return { state: g.state, x: Math.round(pl.x), y: Math.round(pl.y), scene: !!a.scene, q: a.sceneQueue.length, exitOpen: g.world.exitOpen, talks: a.talkCount, prompt: g.world.promptFor(pl), obj: a.objective, cam: Math.round(g.world.cam.x) }; }));
  console.log(id, res);
 }
 await b.close(); })();
