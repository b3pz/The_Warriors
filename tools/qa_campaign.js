// Percorso completo della campagna con giocatori guidati dalla CPU: dal prologo ai crediti.
// Avanza i dialoghi, sceglie la prima risposta, raggiunge interazioni e uscite, salta l'allenamento dopo il primo passo.
// Uso: node tools/qa_campaign.js [cartella-screenshot] [modalità: cpu|solo]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const out = process.argv[2] || path.join(__dirname, '..', 'qa-shots');
const mode = process.argv[3] || 'cpu';
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 3).join('\n')));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  await page.goto('file://' + path.join(__dirname, '..', 'index.html'));
  await page.waitForTimeout(800);

  if (process.env.START) await page.evaluate(s => { window.__START = s; }, process.env.START);
  await page.evaluate((mode) => {
    const W = window.W, G = W.Game, g = G.game;
    window.__qa = { log: [], areas: {}, shots: [] };
    G.startAt(window.__START ? W.areaIndex(window.__START) : 0, mode);
    // bot: guida il giocatore 1 come CPU con obiettivi d'area
    window.__bot = function () {
      const w = g.world; if (!w || !w.area || g.state !== 'play') return;
      const ar = w.area, p0 = w.players[0];
      if (ar.scene) { if (ar.scene.line && ar.scene.lineT > 0.3) ar.scene.input('confirm'); if (ar.scene.choice) ar.scene.input('confirm'); return; }
      if (ar.kind === 'training' && (ar.stepIdx >= 1 || ar.t > 15) && !ar.trainDone) ar.stepIdx = ar.def.steps.length;
      w.players.forEach(p => { if (!p.cpu) { p.cpu = true; p.qaHuman = p.slot === 0; } });
      if (!p0.__bot) {
        p0.__bot = true;
        const orig = W.Player.prototype.thinkCpu;
        p0.thinkCpu = function (dt) {
          const enemiesUp = w.enemies.some(e => e.alive() && e.def.behavior !== 'spar' && e.onScreen());
          orig.call(this, dt);
          const c = this.cpuCtl, a = w.area;
          if (a.kind === 'training' && !a.trainDone) return;
          if (enemiesUp && !(a.kind === 'escape' && !a.fighting && !a.def.busDrops)) return;
          let target = null;
          const ints = a.interactions ? a.interactions() : [];
          const talk = ints.find(i => !i.exit && /Parla/.test(i.label));
          const needNpc = a.def.needTalk && !a.talked[a.def.needTalk] && w.npcs.find(n => n.id === a.def.needTalk);
          if (needNpc) target = { x: needNpc.x, y: needNpc.y };
          else if (a.def.needTalks && a.talkCount < a.def.needTalks && talk) target = talk;
          else if (ints.find(i => /pannello|Aiuta/.test(i.label))) target = ints.find(i => /pannello|Aiuta/.test(i.label));
          else if (ints.find(i => i.exit)) target = ints.find(i => i.exit);
          else if (a.def.mark && !a.markReached) target = a.def.mark;
          else target = { x: a.width - 100, y: (a.floor[0] + a.floor[1]) / 2, zone: true };
          c.ax = 0; c.ay = 0;
          if (Math.abs(target.x - this.x) > 30) c.ax = Math.sign(target.x - this.x);
          if (Math.abs(target.y - this.y) > 16) c.ay = Math.sign(target.y - this.y);
          W.steerAround(this, c);
          if (!target.zone && Math.abs(target.x - this.x) < 75 && Math.abs(target.y - this.y) < 36 && Math.random() < 0.1) a.tryInteract(this);
          if (c.ax) c.runIntent = true;
        };
        p0.buddy = function () { return w.players[1] || null; };
      }
    };
  }, mode);

  const seen = new Set(); let last = '', stuck = 0, lastId = '';
  const t0 = Date.now();
  for (let i = 0; i < 6000; i++) {
    const st = await page.evaluate(() => {
      const W = window.W, g = W.Game.game;
      for (let k = 0; k < 30; k++) {
        if (g.state === 'party') W.Game.onKey('Enter');
        if (g.state === 'gameover') { window.__qa.log.push('GAME OVER ' + g.world.area.id); g.gameoverT = 9; W.Game.onKey('Enter'); }
        if (g.state === 'fail') { window.__qa.log.push('KO ' + g.world.area.id + ' ' + (g.world.failReasonShown || '')); W.Game.onKey('Enter'); }
        if (g.state === 'pause') W.Game.onKey('Escape');
        window.__bot();
        W.Game.tick(1 / 60);
        if (g.state === 'credits' || g.state === 'result') break;
      }
      const w = g.world, a = w && w.area;
      return { state: g.state, id: a && a.id, kind: a && a.kind, scene: !!(a && a.scene), t: a ? a.t : 0, x: w && w.players[0] ? Math.round(w.players[0].x) : 0, en: w ? w.enemies.filter(e => e.alive()).length : 0, obj: a && a.objective };
    });
    if (st.state === 'credits' || st.state === 'result') { console.log('FINE CAMPAGNA', st.state, ((Date.now() - t0) / 1000).toFixed(0) + 's reali'); break; }
    if (st.id && !seen.has(st.id) && !st.scene && st.t > 1.5) { seen.add(st.id); await page.screenshot({ path: path.join(out, st.id + '.png') }); }
    if (st.id && !seen.has(st.id + '_sc') && st.scene) { seen.add(st.id + '_sc'); await page.waitForTimeout(50); await page.screenshot({ path: path.join(out, st.id + '_scena.png') }); }
    const key = st.id + ':' + st.x + ':' + st.en + ':' + st.scene;
    if (st.id !== lastId) { console.log('→', st.id, st.kind, await page.evaluate(() => W.Game.game.world.players.map(p => p.char.id + ':' + Math.round(p.hp) + '/' + p.maxhp).join(' '))); lastId = st.id; stuck = 0; if (process.env.STOP && st.id === process.env.STOP) break; }
    if (key === last) stuck++; else stuck = 0; last = key;
    if (stuck > 60) { console.log('BLOCCO in', JSON.stringify(st)); console.log(await page.evaluate(() => { const w = W.Game.game.world, a = w.area; return JSON.stringify({ players: w.players.map(p => [p.char.id, Math.round(p.x), Math.round(p.y), p.state, p.hp, p.out, p.cpu, !!p.qaHuman, p.hidden]), cam: [Math.round(w.cam.x), w.cam.lockMin, w.cam.lockMax], wave: a.waveIdx, fighting: a.fighting, done: a.done, npcs: w.npcs.map(n => [n.id, Math.round(n.x)]), sceneQ: (a.sceneQueue || []).length, ints: a.interactions ? a.interactions().map(i => i.label) : [] }); })); break; }
  }
  const log = await page.evaluate(() => window.__qa.log);
  console.log('eventi:', log.join(' | ') || 'nessun KO');
  const res = await page.evaluate(() => { const g = window.W.Game.game; return g.result; });
  console.log('risultato', JSON.stringify(res));
  console.log(errors.length ? 'ERRORI:\n' + errors.slice(0, 10).join('\n') : 'nessun errore JS');
  await browser.close();
})();
