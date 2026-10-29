// Verifiche automatiche del nucleo: carica la pagina headless, esegue casi Q01/Q02/Q05/Q06/Q09/Q18
// direttamente sulla simulazione, poi una partita guidata con screenshot.
// Uso: node tools/qa.js [cartella-screenshot]
const { chromium } = require('playwright');
const path = require('path');
const out = process.argv[2] || path.join(__dirname, '..', 'qa-shots');
require('fs').mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  await page.goto('file://' + path.join(__dirname, '..', 'index.html'));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, '01-titolo.png') });

  const results = await page.evaluate(() => {
    const W = window.W, r = [];
    function mk(opts) {
      const dev = new W.Input.Device('solo', null);
      const w = new W.World(Object.assign({ players: [{ id: 'swan', device: dev }], difficulty: 'normale', seed: 3 }, opts || {}));
      w.area = new W.AreaRun(W.AREAS['C4-02'], w); w.area.step = function () {};
      return w;
    }
    function run(w, s) { for (let i = 0; i < s * 60; i++) { W.Input.setTime(w.time); w.step(1 / 60); } }
    // Q01: un solo danno per bersaglio anche se la fase attiva dura più frame
    let w = mk(); let p = w.players[0]; p.x = 400; p.y = 560; p.face = 1;
    let e = new W.Enemy(w, 'fury_flanker', 470, 560); e.setState('approach'); e.think = 99; e.update = function () {}; w.enemies.push(e);
    p.startAttack('l1'); for (let i = 0; i < 30 && p.att; i++) p.stepAttack(1 / 60, p.device);
    r.push(['Q01 un danno per swing', e.maxhp - e.hp === Math.round(8 * p.mods.dmg * 100) / 100 || Math.abs((e.maxhp - e.hp) - 8 * p.mods.dmg) < 0.01, (e.maxhp - e.hp).toFixed(2)]);
    // Q02: vicino in x ma lontano in profondità → nessun colpo
    w = mk(); p = w.players[0]; p.x = 400; p.y = 470; p.face = 1;
    e = new W.Enemy(w, 'fury_flanker', 460, 600); e.update = function () {}; e.setState('approach'); w.enemies.push(e);
    p.startAttack('heavy'); for (let i = 0; i < 60 && p.att; i++) p.stepAttack(1 / 60, p.device);r.push(['Q02 nessun colpo fuori fascia y', e.hp === e.maxhp, e.hp]);
    // Q05: arma con uno swing su tre nemici → un solo consumo
    w = mk(); p = w.players[0]; p.x = 400; p.y = 560; p.face = 1; p.weapon = { type: 'bat', dur: 10 };
    for (let k = 0; k < 3; k++) { const q = new W.Enemy(w, 'fury_flanker', 450 + k * 25, 556 + k * 4); q.update = function () {}; q.setState('approach'); w.enemies.push(q); }
    p.startAttack('heavy'); for (let i = 0; i < 60 && p.att; i++) p.stepAttack(1 / 60, p.device);const hitN = w.enemies.filter(q => q.hp < q.maxhp).length;
    r.push(['Q05 durabilità -1 con tre bersagli', p.weapon.dur === 9 && hitN === 3, 'dur ' + p.weapon.dur + ', colpiti ' + hitN]);
    // Q06: disarmo → una mazza soltanto, nemico a mani nude; secondo pesante non duplica
    w = mk(); p = w.players[0]; p.x = 400; p.y = 560; p.face = 1;
    e = new W.Enemy(w, 'fury_batter', 480, 560); e.update = function () {}; w.enemies.push(e);
    e.setState('atk'); e.att = new W.Attack(e, 'elight', { prep: .4, act: .1, rec: .5, reach: 1, ty: 1, dmg: 0 }); e.att.phase = 'rec';
    p.startAttack('heavy'); for (let i = 0; i < 60 && p.att; i++) p.stepAttack(1 / 60, p.device);e.setState('atk'); e.att = new W.Attack(e, 'elight', { prep: .4, act: .1, rec: .5, reach: 1, ty: 1, dmg: 0 }); e.att.phase = 'rec'; e.protect = 0;
    p.startAttack('heavy'); for (let i = 0; i < 60 && p.att; i++) p.stepAttack(1 / 60, p.device);const bats = w.items.filter(i => i.kind === 'weapon').length;
    r.push(['Q06 disarmo una sola mazza', bats === 1 && !e.weapon && e.disarmed, 'mazze a terra ' + bats]);
    // Q09: singolo senza CPU → KO = retry; in due → finestra di soccorso
    w = mk(); p = w.players[0]; p.hp = 1; p.takeHit({ x: 500, face: -1 }, { spec: { dmg: 10 } }); run(w, 0.1);
    r.push(['Q09 KO singolo → retry', w.failed === true, String(w.failed)]);
    w = mk({ cpu: 'snow' }); p = w.players[0]; p.hp = 1; p.takeHit({ x: 500, face: -1 }, { spec: { dmg: 10 } }); run(w, 0.5);
    r.push(['Q09 KO con compagno → finestra soccorso', !w.failed && p.state === 'ko' && !p.out, p.state]);
    run(w, 4);
    r.push(['Q09 la CPU soccorre', p.state !== 'ko', p.state + ' prog ' + p.reviveProg.toFixed(2)]);
    // Q18: retry ripristina snapshot senza duplicare risorse/punteggio
    w = mk(); p = w.players[0]; const snap = w.snapshot(); w.score[0] = 9999; p.weapon = { type: 'bat', dur: 3 }; w.items.push({ kind: 'snack', x: 1, y: 500 });
    w.restore(snap, false);
    r.push(['Q18 retry ripristina snapshot', w.score[0] === 0 && !p.weapon && w.items.length === 0, 'score ' + w.score[0]]);
    // Coordinatore: max 1 attaccante in singolo
    w = mk(); p = w.players[0]; p.x = 600; p.y = 560; w.cam.x = 0;
    for (let k = 0; k < 4; k++) { const q = new W.Enemy(w, 'fury_batter', 640 + (k % 2 ? -1 : 1) * (60 + k * 10), 540 + k * 10); q.setState('approach'); w.enemies.push(q); }
    let maxAtt = 0; for (let i = 0; i < 600; i++) { p.hp = p.maxhp; if (p.state === 'ko') p.setState('idle'); W.Input.setTime(w.time); w.step(1 / 60); maxAtt = Math.max(maxAtt, w.enemies.filter(q => q.state === 'atk' && q.att && q.att.phase !== 'rec').length); }
    r.push(['Coordinatore: max 1 attacco attivo in singolo', maxAtt <= 1, 'max ' + maxAtt]);
    return r;
  });
  let fails = 0;
  for (const [name, ok, info] of results) { console.log((ok ? 'PASS ' : 'FAIL ') + name + '  (' + info + ')'); if (!ok) fails++; }

  // partita guidata: menu → selezione → combattimento
  const key = async (k, ms = 60) => { await page.keyboard.down(k); await page.waitForTimeout(ms); await page.keyboard.up(k); await page.waitForTimeout(80); };
  await key('Enter'); await key('Enter'); // titolo → menu → prova C4
  await key('ArrowDown'); await key('Enter'); // modalità: + CPU
  await key('Enter'); // difficoltà normale
  await key('Enter'); await key('Enter'); // swan, compagno
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(out, '02-inizio-area.png') });
  await page.keyboard.down('KeyD'); await page.waitForTimeout(2600); await page.keyboard.up('KeyD');
  for (let i = 0; i < 40; i++) { await key('KeyJ', 40); if (i % 6 === 5) await key('KeyK', 40); if (i === 12) await page.screenshot({ path: path.join(out, '03-rissa.png') }); }
  await page.evaluate(() => { W.Game.game.world.debug = true; });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, '04-debug.png') });
  const st = await page.evaluate(() => { const g = W.Game.game, w = g.world; return { state: g.state, area: w.area.id, enemies: w.enemies.map(e => e.type + ':' + e.state + ':' + Math.ceil(e.hp)), players: w.players.map(p => p.char.id + ':' + p.state + ':' + Math.ceil(p.hp)), score: w.score }; });
  console.log('stato partita', JSON.stringify(st));

  // simulazione lunga: CPU contro CPU per completare le due aree senza input umano
  const full = await page.evaluate(() => {
    const W = window.W, g = W.Game.game;
    g.world.debug = false;
    const w = g.world, p0 = w.players[0];
    // il giocatore 1 diventa CPU per il test di percorso completo
    p0.cpu = true; p0.qaHuman = true;
    const origThink = p0.thinkCpu;
    p0.thinkCpu = function (dt) {
      origThink.call(this, dt);
      const c = this.cpuCtl, ws = this.world;
      if (!ws.enemies.some(e => e.alive()) && c.ax === 0) { c.ax = 1; }
      if (ws.exitOpen && c.ax === 0) c.ax = 1;
      W.steerAround(this, c);
    };
    p0.buddy = function () { return w.players[1]; };
    let steps = 0, areas = [], fails = 0;
    while (steps < 60 * 600 && g.state !== 'result') {
      if (g.state === 'fail') { fails++; W.Game.onKey('Enter'); }
      if (g.state === 'pause') W.Game.onKey('Escape');
      W.Game.tick(1 / 60); steps++;
      if (g.world && g.world.area && areas[areas.length - 1] !== g.world.area.id) areas.push(g.world.area.id);
    }
    const ww = g.world; return { state: g.state, areas, fails, seconds: (steps / 60).toFixed(0), result: g.result, dbg: ww.area.id + ' wave' + ww.area.waveIdx + ' fight' + ww.area.fighting + ' exit' + ww.exitOpen + ' cam' + ww.cam.x.toFixed(0) + ' | ' + ww.players.map(q => q.char.id + ':' + q.state + ':' + Math.ceil(q.hp) + '@' + q.x.toFixed(0) + ',' + q.y.toFixed(0) + ' out' + q.out).join(' ') + ' | ' + ww.enemies.map(e => e.type + ':' + e.state + '@' + e.x.toFixed(0) + ',' + e.y.toFixed(0)).join(' ') };
  });
  console.log('percorso completo', JSON.stringify(full));
  await page.screenshot({ path: path.join(out, '05-risultato.png') });
  if (full.state !== 'result') fails++;
  console.log(errors.length ? 'ERRORI:\n' + errors.join('\n') : 'nessun errore JS');
  await browser.close();
  process.exit(fails || errors.length ? 1 : 0);
})();
