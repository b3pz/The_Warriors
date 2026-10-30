// Arcade: quattro giocatori (due tastiere e due CPU) attraverso tutte le risse sbloccate, guidati dalla CPU.
// Uso: node tools/qa_arcade.js [cartella-screenshot]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const out = process.argv[2] || path.join(__dirname, '..', 'qa-shots'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('warriors-unlocks-v1', JSON.stringify(['P0', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'])); localStorage.removeItem('warriors-arcade-v1'); });
  await p.goto('file://' + path.join(__dirname, '..', 'index.html')); await p.waitForTimeout(600);
  const G = (code) => p.evaluate(c => W.Game.onKey(c), code);
  await G('Enter'); // titolo → menu
  const items = await p.evaluate(() => W.Game.game.state);
  // apre Arcade dal menu
  await p.evaluate(() => { const g = W.Game.game; for (let i = 0; i < 8; i++) { W.Game.onKey('ArrowDown'); } });
  await p.evaluate(() => { const g = W.Game.game; g.menuIdx = 0; });
  let found = false;
  for (let i = 0; i < 8 && !found; i++) { const st = await p.evaluate(() => { const g = W.Game.game; return g.state; }); if (st === 'arcade') found = true; else { await p.evaluate(i => { W.Game.game.menuIdx = i; }, i); await G('Enter'); if (await p.evaluate(() => W.Game.game.state) !== 'arcade') await p.evaluate(() => { W.Game.game.state = 'menu'; }); } }
  console.log('schermata arcade:', found);
  // G2 frecce, G3 e G4 CPU (impostati dal menu: ← → comando, Invio cambia Warrior)
  await p.evaluate(() => { const g = W.Game.game; g.menuIdx = 1; W.Game.onKey('ArrowLeft'); W.Game.onKey('ArrowLeft'); W.Game.onKey('ArrowLeft'); W.Game.onKey('ArrowLeft'); W.Game.onKey('ArrowLeft'); W.Game.onKey('Enter');
    g.menuIdx = 2; W.Game.onKey('ArrowLeft'); W.Game.onKey('Enter'); W.Game.onKey('Enter'); g.menuIdx = 3; W.Game.onKey('ArrowLeft'); W.Game.onKey('Enter'); W.Game.onKey('Enter'); W.Game.onKey('Enter'); W.Game.tick(1/60); });
  await p.waitForTimeout(300); await p.screenshot({ path: path.join(out, 'arcade_menu.png') });
  console.log(await p.evaluate(() => JSON.stringify(W.Game.game.arc)));
  if (process.env.STAGE) await p.evaluate(s => { const g = W.Game.game; g.arc.stage = +s; }, process.env.STAGE);
  await p.evaluate(() => { const g = W.Game.game; g.menuIdx = 6; W.Game.onKey('Enter'); });
  await p.evaluate(() => { W.QA_NODRAW = true; });
  console.log('stato:', await p.evaluate(() => W.Game.game.state + ' ' + W.Game.game.world.players.map(q => q.char.id + (q.cpu ? '(cpu)' : '(' + q.device.layout + ')')).join(' ')));
  let shot = 0, last = '';
  for (let i = 0; i < 1500; i++) {
    const st = await p.evaluate(() => {
      const g = W.Game.game;
      for (let k = 0; k < 60; k++) {
        if (g.state === 'fail') { window.__ko = (window.__ko || 0) + 1; W.Game.onKey('Enter'); }
        if (g.state === 'comic' && g.comic) { const c = g.comic; g.comic = null; c.then(); }
        if (g.state === 'play') {
          const w = g.world, a = w.area, p0 = w.players[0];
          w.players.forEach(q => { if (!q.cpu) { q.cpu = true; q.qaHuman = true; } });
          // senza nemici: il primo giocatore va alle interazioni (cancelli, porte) e poi a destra
          if (!w.enemies.some(e => e.alive()) && !p0.__bot) { p0.__bot = 1; const orig = W.Player.prototype.thinkCpu; p0.thinkCpu = function (dt) { orig.call(this, dt);
            if (w.enemies.some(e => e.alive() && e.onScreen())) return;
            const c = this.cpuCtl, ints = a.interactions ? a.interactions() : [], t = ints[0] || { x: a.width - 80, y: (a.floor[0] + a.floor[1]) / 2, zone: 1 };
            c.ax = Math.abs(t.x - this.x) > 30 ? Math.sign(t.x - this.x) : 0; c.ay = Math.abs(t.y - this.y) > 16 ? Math.sign(t.y - this.y) : 0; W.steerAround(this, c); c.runIntent = !!c.ax;
            if (!t.zone && Math.abs(t.x - this.x) < 75 && Math.abs(t.y - this.y) < 36 && Math.random() < 0.1) a.tryInteract(this); }; }
          if (w.area !== window.__lastArea) { window.__lastArea = w.area; p0.__bot = 0; }
        }
        W.Game.tick(1 / 60);
        if (g.state === 'result') break;
      }
      const w = g.world; return { state: g.state, id: w.area && w.area.id, en: w.enemies.filter(e => e.alive()).length, ko: window.__ko || 0, x: Math.round(w.players[0].x), obj: w.area && w.area.objective };
    });
    if (st.state === 'play' && st.en >= 4 && !shot) { shot = 1; await p.evaluate(() => { W.QA_NODRAW = false; W.Game.tick(1 / 60); }); await p.screenshot({ path: path.join(out, 'arcade_4p.png') }); await p.evaluate(() => { W.QA_NODRAW = true; }); }
    if (st.id !== last) { console.log('→', st.id, st.state); last = st.id; }
    if (process.env.EVERY && i % +process.env.EVERY === 0) console.log('t', i, Date.now() % 100000, st.en);
    if (i % 50 === 0) console.log('  ', i, JSON.stringify(st), await p.evaluate(() => { const w = W.Game.game.world; return JSON.stringify(w.players.map(q => [q.char.id, Math.round(q.x), Math.round(q.y), q.state, Math.round(q.hp), q.out, q.cpuCtl && [q.cpuCtl.ax, q.cpuCtl.ay]])) + ' EN ' + JSON.stringify(w.enemies.filter(e => e.alive()).map(e => [e.type || e.def.label, Math.round(e.x), Math.round(e.y), e.state])) + ' cam ' + Math.round(w.cam.x) + ' ' + w.cam.lockMax + ' exitOpen ' + w.exitOpen; }));
    if (st.state === 'result') { await p.evaluate(() => { W.QA_NODRAW = false; W.Game.tick(1 / 60); }); console.log('FINE', JSON.stringify(await p.evaluate(() => W.Game.game.result)), 'KO', st.ko); await p.screenshot({ path: path.join(out, 'arcade_result.png') }); break; }
    if (i === 1499) console.log('NON FINITO', JSON.stringify(st));
  }
  console.log(errors.length ? 'ERRORI:\n' + errors.slice(0, 8).join('\n') : 'nessun errore JS');
  await b.close();
})();
