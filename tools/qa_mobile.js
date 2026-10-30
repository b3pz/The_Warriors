// Telefono simulato in orizzontale: menu e partita con i comandi touch (eventi pointer di tipo touch).
// Uso: node tools/qa_mobile.js [screenshot.png]
const { chromium, devices } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts/, r => r.abort());
  await p.goto('file://' + path.join(__dirname, '..', 'index.html')); await p.waitForTimeout(600);
  // tocco su coordinate logiche del gioco (1280×720)
  const touch = (type, lx, ly, id) => p.evaluate(([type, lx, ly, id]) => {
    const cv = document.getElementById('game'), r = cv.getBoundingClientRect();
    const ev = new PointerEvent(type, { pointerType: 'touch', pointerId: id, clientX: r.left + lx / 1280 * r.width, clientY: r.top + ly / 720 * r.height, bubbles: true, cancelable: true });
    (type === 'pointerdown' ? cv : window).dispatchEvent(ev);
  }, [type, lx, ly, id]);
  const tap = async (lx, ly) => { await touch('pointerdown', lx, ly, 1); await p.waitForTimeout(60); await touch('pointerup', lx, ly, 1); await p.waitForTimeout(120); };
  const st = () => p.evaluate(() => ({ s: W.Game.game.state, idx: W.Game.game.menuIdx, touch: W.Touch.active() }));
  await tap(640, 360); // titolo
  console.log('dopo tocco sul titolo', JSON.stringify(await st()));
  await tap(1150, 600); // OK su "Nuova storia"? (prima voce se non c'è salvataggio)
  await tap(1150, 600); await tap(1150, 600); // modalità e difficoltà
  for (let i = 0; i < 12; i++) { const s = await st(); if (s.s === 'party') await tap(1150, 600); else if (s.s === 'play') break; await p.waitForTimeout(100); }
  console.log('avvio', JSON.stringify(await st()));
  // salta le scene con OK
  for (let i = 0; i < 40; i++) { const sc = await p.evaluate(() => !!(W.Game.game.world && W.Game.game.world.area && W.Game.game.world.area.scene)); if (!sc) break; await tap(1150, 600); await p.waitForTimeout(200); }
  const x0 = await p.evaluate(() => W.Game.game.world.players[0].x);
  await touch('pointerdown', 170, 560, 2); await touch('pointermove', 260, 560, 2); await p.waitForTimeout(1200);
  const x1 = await p.evaluate(() => W.Game.game.world.players[0].x);
  await p.screenshot({ path: process.argv[2] || '/tmp/mobile.png' });
  await touch('pointerup', 260, 560, 2);
  await tap(1150, 600); await p.waitForTimeout(30);
  const atk = await p.evaluate(() => W.Game.game.world.players[0].state);
  console.log('joystick: da', Math.round(x0), 'a', Math.round(x1), '· dopo COLPO:', atk);
  await tap(1232, 44); console.log('pausa:', (await st()).s);
  console.log(errs.length ? 'ERRORI ' + errs.join(' | ') : 'nessun errore JS');
  await b.close();
})();
