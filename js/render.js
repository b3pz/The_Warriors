// Renderer: legge lo stato della simulazione e consuma gli eventi per FX. Non modifica la salute.
// Grafica SEGNAPOSTO: manichini neutri e parco procedurale finché gli asset reali non sono prodotti.
'use strict';
var W = window.W;

W.Render = (function () {
  var C = W.CFG, ctx, cv, bgCache = {}, fx = [], seenEvents = {}, shake = 0, flash = 0;
  var opts = { shake: true, flash: true };
  var COL = {
    ink: '#e9e4d6', dim: '#8b8678', hp: '#d8443a', hpBack: '#3a1c1c', fury: '#e8b13a', p1: '#f2c14e', p2: '#5ec4e6',
    body: '#cfc8b8', bodyShade: '#9e9788', enemy: '#59606e', bat: '#a0703c', danger: '#ff5a3c'
  };

  var IMG = {}, bgImg = null;
  function loadImg(file) {
    var im = new Image(); im.ok = false;
    im.onload = function () { im.ok = true; }; im.onerror = function () { console.warn('asset mancante', file); };
    im.src = (W.ASSET_DATA && W.ASSET_DATA[file]) || ('assets/' + file);
    return im;
  }
  function init(canvas) {
    cv = canvas; ctx = cv.getContext('2d');
    var A = W.ATLAS; if (!A) return;
    for (var sid in A.sets) for (var fn in A.sets[sid].frames) { var f = A.sets[sid].frames[fn]; if (!IMG[f.file]) IMG[f.file] = loadImg(f.file); }
    if (A.backgrounds.park_night) bgImg = loadImg(A.backgrounds.park_night.file);
  }
  var useSprites = true;

  // stato → posa della tavola. Le pose mancanti nel materiale ricevuto sono indicate.
  function playerFrame(a) {
    var st = a.state, m = a.curMove, ph = a.att ? a.att.phase : null;
    var walkF = Math.floor(a.anim * (st === 'run' ? 9 : 5.5)) % 2 ? 'walk2' : 'walk1';
    switch (st) {
      case 'walk': case 'run': return { f: walkF };
      case 'jump': return { f: 'jump' };
      case 'dodge': return { f: 'walk2', ghost: true };
      case 'hurt': case 'getup': return { f: 'hurt' };
      case 'down': case 'ko': return { f: 'hurt', lie: true };          // posa a terra non presente nella tavola
      case 'grab': case 'throwobj': return { f: 'punch' };
      case 'atk': case 'fury_sq': case 'grabhit':
        if (a.att && a.att.weaponSwing) return { f: ph === 'prep' ? 'bat_windup' : 'punch', batArc: ph !== 'prep' }; // swing orizzontale con mazza mancante
        if (m === 'l3' || m === 'heavy' || m === 'run') return { f: ph === 'prep' ? 'guard' : 'kick' };
        return { f: ph === 'prep' ? 'guard' : 'punch' };
    }
    return { f: 'guard' };
  }
  function furyFrame(e) {
    var st = e.state, ph = e.att ? e.att.phase : null;
    var moving = Math.abs(e.x - (e.px === undefined ? e.x : e.px)) + Math.abs(e.y - (e.py === undefined ? e.y : e.py)) > 0.4;
    var walkF = Math.floor(e.anim * 5) % 2 ? 'walk2' : 'walk1';
    switch (st) {
      case 'enter': case 'approach': return { f: moving ? walkF : 'idle' };
      case 'atk':
        if (e.att.spec.heavy) return { f: ph === 'prep' ? 'windup' : 'downswing' };
        return { f: ph === 'prep' ? 'idle' : 'swing' };
      case 'hurt': case 'grabbed': case 'getup': return { f: 'hurt' };
      case 'down': case 'dead': return { f: 'down' };
      case 'thrown': return { f: 'down', spin: true };
    }
    return { f: 'idle' };
  }

  function drawSprite(a, cx, w) {
    var A = W.ATLAS; if (!A || !useSprites) return false;
    var setId = a.isEnemy ? (a.weapon ? 'fury' : 'fury_nobat') : 'warrior_a';
    var set = A.sets[setId]; if (!set) return false;
    var sel = a.isEnemy ? furyFrame(a) : playerFrame(a), fr = set.frames[sel.f];
    var im = fr && IMG[fr.file]; if (!im || !im.ok) return false;
    var x = a.x - cx, y = a.y, z = a.z || 0, k = set.scale * (a.isEnemy && a.def.elite ? 1.1 : 1);
    ctx.fillStyle = 'rgba(0,0,0,' + (0.42 - Math.min(0.25, z / 400)) + ')';
    ctx.beginPath(); ctx.ellipse(x, y, (sel.lie || sel.f === 'down' ? 70 : 34) * k / 0.7, 9, 0, 0, Math.PI * 2); ctx.fill();
    var alpha = 1;
    if (a.state === 'dead') alpha = Math.max(0, 1 - (a.fade || 0) / 1.2);
    if (a.protect > 0 && Math.floor(w.time * 20) % 2 === 0 && a.state !== 'ko') alpha *= 0.55;
    if (a.state === 'ko') alpha *= 0.85;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.translate(x, y - z);
    if (sel.lie) { ctx.translate(0, -fr.h * k * 0.18); ctx.rotate(-a.face * Math.PI / 2 * Math.min(1, a.st / 0.15)); }
    if (sel.spin) ctx.rotate(-a.face * a.st * 9);
    ctx.scale(a.face * k, k);
    if (a.isEnemy && a.def.elite) { try { ctx.filter = 'drop-shadow(0 0 6px rgba(220,60,80,0.9))'; } catch (x2) {} }
    if (sel.ghost) { ctx.globalAlpha = alpha * 0.25; ctx.drawImage(im, -fr.px - a.dvx * 0.06 / k * a.face, -fr.py); ctx.globalAlpha = alpha * 0.7; }
    ctx.drawImage(im, -fr.px, -fr.py);
    ctx.filter = 'none';
    // mazza in mano fuori dagli swing: sovrapposta finché non esistono le pose armate
    if (!a.isEnemy && a.weapon && sel.f !== 'bat_windup') {
      var def = W.WEAPONS[a.weapon.type], L = def.len / k;
      ctx.save(); ctx.translate(fr.w * (sel.f === 'punch' ? 0.95 : 0.78) - fr.px, -fr.py + fr.h * (sel.f === 'punch' ? 0.17 : 0.24));
      ctx.rotate(sel.batArc ? -Math.PI / 2 : -0.5);
      ctx.strokeStyle = '#5a3a1c'; ctx.lineCap = 'round'; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -L); ctx.stroke();
      ctx.strokeStyle = def.color; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -L); ctx.stroke();
      if (a.weapon.type === 'bat') { ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(0, -L * 0.6); ctx.lineTo(0, -L); ctx.stroke(); }
      ctx.restore();
    }
    ctx.restore();
    if (sel.batArc && a.att && a.att.phase === 'act') {
      ctx.strokeStyle = 'rgba(255,245,220,0.55)'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(x, y - z - 110, 95, a.face > 0 ? -1.3 : Math.PI - 0.6, a.face > 0 ? 0.6 : Math.PI + 1.3); ctx.stroke();
    }
    if (a.isEnemy) { a.px = a.x; a.py = a.y; }
    return true;
  }

  // ------------------------------------------------------------------ fondale procedurale
  function rnd(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function buildBg(area) {
    var key = area.id; if (bgCache[key]) return bgCache[key];
    var r = rnd(area.id === 'C4-02' ? 91 : 173);
    var far = document.createElement('canvas'); far.width = C.VIEW_W + area.width * 0.2 + 40; far.height = 470;
    var g = far.getContext('2d');
    var sky = g.createLinearGradient(0, 0, 0, 470); sky.addColorStop(0, '#05070f'); sky.addColorStop(0.6, '#0e1426'); sky.addColorStop(1, '#1b2034');
    g.fillStyle = sky; g.fillRect(0, 0, far.width, 470);
    for (var i = 0; i < 90; i++) { g.fillStyle = 'rgba(220,225,255,' + (0.2 + r() * 0.5) + ')'; g.fillRect(r() * far.width, r() * 220, 1.5, 1.5); }
    // skyline generica lontana
    var x = 0;
    while (x < far.width) {
      var bw = 40 + r() * 90, bh = 90 + r() * 200;
      g.fillStyle = '#0b0f1c'; g.fillRect(x, 410 - bh, bw, bh + 60);
      for (var wy = 410 - bh + 10; wy < 400; wy += 14) for (var wx = x + 6; wx < x + bw - 6; wx += 11) if (r() < 0.12) { g.fillStyle = 'rgba(240,200,120,' + (0.25 + r() * 0.4) + ')'; g.fillRect(wx, wy, 4, 6); }
      x += bw + 4 + r() * 20;
    }
    var mid = document.createElement('canvas'); mid.width = C.VIEW_W + area.width * 0.55 + 40; mid.height = 480;
    g = mid.getContext('2d');
    // alberi in silhouette
    for (var t = 0; t < mid.width / 70; t++) {
      var tx = t * 70 + r() * 40, th = 160 + r() * 140, base = 470;
      g.fillStyle = '#0a110f'; g.fillRect(tx + 18, base - th * 0.45, 12, th * 0.45);
      for (var b = 0; b < 6; b++) {
        g.fillStyle = b % 2 ? '#0d1a15' : '#11221b';
        g.beginPath(); g.arc(tx + 24 + (r() - 0.5) * 70, base - th * (0.45 + r() * 0.5), 34 + r() * 36, 0, Math.PI * 2); g.fill();
      }
    }
    // siepe
    g.fillStyle = '#0f1d17'; g.fillRect(0, 430, mid.width, 50);
    for (var hx = 0; hx < mid.width; hx += 26) { g.beginPath(); g.arc(hx, 432, 18 + r() * 8, Math.PI, 0); g.fill(); }
    // terreno: erba e vialetto
    var gnd = document.createElement('canvas'); gnd.width = 256; gnd.height = C.VIEW_H;
    g = gnd.getContext('2d');
    var f = area.floor;
    g.fillStyle = '#16231b'; g.fillRect(0, 0, 256, C.VIEW_H);
    var path = g.createLinearGradient(0, f[0], 0, f[1]); path.addColorStop(0, '#2b2a2e'); path.addColorStop(1, '#3a3836');
    g.fillStyle = path; g.fillRect(0, f[0] - 10, 256, f[1] - f[0] + 30);
    g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2;
    for (var py = f[0]; py < f[1] + 20; py += 38) { g.beginPath(); g.moveTo(0, py); g.lineTo(256, py); g.stroke(); }
    for (var px = 0; px < 256; px += 64) { g.beginPath(); g.moveTo(px, f[0] - 10); g.lineTo(px - 30, f[1] + 20); g.stroke(); }
    g.fillStyle = '#1a2a20'; g.fillRect(0, f[0] - 16, 256, 8); g.fillRect(0, f[1] + 18, 256, 30);
    for (var k = 0; k < 200; k++) { g.fillStyle = 'rgba(255,255,255,' + r() * 0.04 + ')'; g.fillRect(r() * 256, f[0] + r() * (f[1] - f[0]), 2, 2); }
    bgCache[key] = { far: far, mid: mid, gnd: gnd };
    return bgCache[key];
  }

  function drawBg(w) {
    var a = w.area.def, cx = w.cam.x;
    if (useSprites && bgImg && bgImg.ok) {
      // fondale ricevuto, ripetuto a specchio per coprire aree di due schermate senza giunture
      var bw = bgImg.width * (C.VIEW_H / bgImg.height), i0 = Math.floor(cx / bw);
      for (var i = i0; i * bw - cx < C.VIEW_W; i++) {
        var x0 = i * bw - cx;
        ctx.save();
        if (i % 2) { ctx.translate(x0 + bw, 0); ctx.scale(-1, 1); ctx.drawImage(bgImg, 0, 0, bw, C.VIEW_H); }
        else ctx.drawImage(bgImg, x0, 0, bw, C.VIEW_H);
        ctx.restore();
      }
    } else {
      var bg = buildBg(a);
      ctx.drawImage(bg.far, -cx * 0.2, 0);
      ctx.drawImage(bg.mid, -cx * 0.55, 0);
      for (var x = -((cx) % 256) - 256; x < C.VIEW_W + 256; x += 256) ctx.drawImage(bg.gnd, 0, 440, 256, C.VIEW_H - 440, x, 440, 256, C.VIEW_H - 440);
    }
    // zona di uscita
    if (w.exitOpen) {
      var ex = a.width - 200 - cx, pulse = 0.25 + 0.15 * Math.sin(w.time * 5);
      ctx.fillStyle = 'rgba(242,193,78,' + pulse * 0.4 + ')'; ctx.fillRect(ex, a.floor[0], 200, a.floor[1] - a.floor[0]);
      ctx.fillStyle = COL.p1; ctx.font = 'bold 28px "Oswald", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('USCITA ▶', ex + 100, a.floor[0] - 20);
    }
  }

  function drawLamp(p, cx, t) {
    var x = p.x - cx, y = p.y;
    var glow = ctx.createRadialGradient(x, y - 210, 4, x, y - 210, 160);
    glow.addColorStop(0, 'rgba(255,214,140,0.55)'); glow.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = glow; ctx.fillRect(x - 160, y - 370, 320, 320);
    var pool = ctx.createRadialGradient(x, y + 90, 4, x, y + 90, 200);
    pool.addColorStop(0, 'rgba(255,214,140,0.16)'); pool.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.save(); ctx.scale(1, 0.35); ctx.fillStyle = pool; ctx.fillRect(x - 200, (y + 90) / 0.35 - 200, 400, 400); ctx.restore();
    ctx.fillStyle = '#15171c'; ctx.fillRect(x - 3, y - 210, 6, 210); ctx.fillRect(x - 10, y - 4, 20, 8);
    ctx.fillStyle = '#ffe3a8'; ctx.beginPath(); ctx.arc(x, y - 214, 8, 0, Math.PI * 2); ctx.fill();
  }

  // ------------------------------------------------------------------ oggetti
  function drawProp(p, cx) {
    if (p.kind === 'bench') {
      var x = p.x0 - cx, w = p.x1 - p.x0, y = p.y1;
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x + 4, y - 4, w, 10);
      ctx.fillStyle = '#20232a'; ctx.fillRect(x + 8, y - 34, 6, 34); ctx.fillRect(x + w - 14, y - 34, 6, 34);
      ctx.fillStyle = '#2b3a33'; for (var i = 0; i < 3; i++) ctx.fillRect(x, y - 38 - i * 7, w, 5);
      ctx.fillStyle = '#24312b'; for (var j = 0; j < 3; j++) ctx.fillRect(x, y - 70 - j * 9, w, 6);
      ctx.fillStyle = '#20232a'; ctx.fillRect(x + 8, y - 92, 6, 56); ctx.fillRect(x + w - 14, y - 92, 6, 56);
    } else if (p.kind === 'bin') {
      var bx = p.x0 - cx, bw = p.x1 - p.x0, by = p.y1;
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(bx + bw / 2, by, bw * 0.7, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3a3d40'; ctx.fillRect(bx, by - 62, bw, 62);
      ctx.fillStyle = '#4c5054'; for (var s = 0; s < 4; s++) ctx.fillRect(bx + 3 + s * 9, by - 60, 4, 58);
      ctx.fillStyle = p.used ? '#111' : '#2e3134'; ctx.fillRect(bx + 8, by - 40, bw - 16, 22);
      if (p.used) { ctx.fillStyle = '#2d4a3a'; ctx.fillRect(bx - 10, by - 40, 12, 22); }
      ctx.fillStyle = '#26292c'; ctx.fillRect(bx - 3, by - 66, bw + 6, 6);
    }
  }

  function drawItem(it, cx, t) {
    var x = it.x - cx, y = it.y, bob = Math.sin((t + it.t) * 4) * 2;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x, y, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
    if (it.kind === 'weapon') {
      var def = W.WEAPONS[it.w.type];
      ctx.save(); ctx.translate(x, y - 6); ctx.rotate(-0.15);
      ctx.strokeStyle = def.color; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-def.len / 2, 0); ctx.lineTo(def.len / 2, 0); ctx.stroke();
      if (it.w.type === 'bat') { ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(def.len / 2 - 22, 0); ctx.lineTo(def.len / 2, 0); ctx.stroke(); }
      ctx.restore();
      ctx.fillStyle = 'rgba(242,193,78,' + (0.5 + 0.3 * Math.sin(t * 6)) + ')'; ctx.beginPath(); ctx.moveTo(x, y - 34 + bob); ctx.lineTo(x - 6, y - 44 + bob); ctx.lineTo(x + 6, y - 44 + bob); ctx.fill();
      return;
    }
    var colors = { snack: '#e0a040', drink: '#4fa3d9', kit: '#e8e8e8' };
    ctx.fillStyle = colors[it.kind]; ctx.fillRect(x - 12, y - 24 + bob, 24, 18);
    if (it.kind === 'kit') { ctx.fillStyle = '#d33'; ctx.fillRect(x - 3, y - 22 + bob, 6, 14); ctx.fillRect(x - 7, y - 18 + bob, 14, 6); }
    if (it.kind === 'drink') { ctx.fillStyle = '#ddd'; ctx.fillRect(x - 12, y - 28 + bob, 24, 4); }
  }

  // ------------------------------------------------------------------ manichino
  // Rig minimo: posa calcolata da stato e tempo. Valori in unità logiche, piedi in (0,0).
  function pose(a, t) {
    var P = { lean: 0, armF: 0.3, armB: -0.3, elbF: 0.4, elbB: 0.4, legF: 0.1, legB: -0.1, kneeF: 0, kneeB: 0, crouch: 0, rot: 0, bat: null };
    var st = a.state, m = a.curMove;
    var walkC = Math.sin(a.anim * (st === 'run' ? 15 : 10));
    if (st === 'idle') { P.crouch = 2 + Math.sin(a.anim * 3) * 2; P.armF = 0.6; P.armB = 0.9; P.elbF = 1.6; P.elbB = 1.7; }
    if (st === 'walk' || st === 'run' || st === 'approach' || st === 'enter') {
      var k = st === 'run' ? 0.8 : 0.5;
      P.legF = walkC * k; P.legB = -walkC * k; P.kneeF = Math.max(0, -walkC) * 0.5; P.kneeB = Math.max(0, walkC) * 0.5;
      P.armF = -walkC * 0.5 + 0.4; P.armB = walkC * 0.5 + 0.4; P.elbF = 1.3; P.elbB = 1.3; P.lean = st === 'run' ? 0.18 : 0.05;
    }
    if ((st === 'atk' || st === 'fury_sq' || st === 'grabhit') && a.att) {
      var ph = a.att.phase, sp = a.att.spec, prog = ph === 'prep' ? a.att.t / Math.max(0.01, sp.prep) : ph === 'act' ? 1 : 1 - a.att.t / Math.max(0.01, sp.rec);
      var kick = m === 'l3' || m === 'heavy' || m === 'run';
      if (a.isEnemy || (a.weapon && a.att.weaponSwing)) {
        // swing di mazza: carica sopra la spalla, attivo orizzontale
        var heavyE = sp.heavy;
        if (ph === 'prep') { P.armF = -2.4 * prog; P.armB = -2.2 * prog; P.elbF = 0.6; P.elbB = 0.6; P.lean = -0.12 * prog; P.bat = -2.9 * prog; if (heavyE) P.crouch = 6 * prog; }
        else if (ph === 'act') { P.armF = 1.5; P.armB = 1.3; P.elbF = 0.1; P.elbB = 0.2; P.lean = 0.2; P.bat = 1.55; }
        else { P.armF = 1.2 * prog + 0.3; P.armB = 1.0 * prog + 0.3; P.elbF = 0.4; P.lean = 0.1 * prog; P.bat = 1.4 * prog + 0.4; }
        if (!a.weapon && a.isEnemy) P.bat = null;
      } else if (kick) {
        P.legF = ph === 'prep' ? -0.3 * prog : 1.5 * prog; P.kneeF = ph === 'prep' ? 1.2 * prog : 0.2; P.lean = -0.25 * prog;
        P.armF = 0.2; P.armB = -0.6; P.elbF = 1.4; P.elbB = 1.4;
      } else {
        P.armF = ph === 'prep' ? 0.2 : 1.55 * prog + 0.1; P.elbF = ph === 'prep' ? 2.0 : 0.15; P.lean = 0.15 * prog;
        P.armB = 0.7; P.elbB = 1.8; P.legF = 0.35; P.legB = -0.35;
      }
      if (m === 'fury') { var f = Math.sin(a.anim * 30); P.armF = 1.2 + f * 0.4; P.armB = 1.2 - f * 0.4; P.elbF = 0.2; P.elbB = 0.2; P.lean = 0.25; }
    }
    if (st === 'jump') { P.legF = 0.6; P.kneeF = 1.6; P.legB = -0.2; P.kneeB = 1.4; P.armF = -0.8; P.armB = -1.0; if (a.att) { P.legF = 1.5; P.kneeF = 0.1; P.lean = -0.3; } }
    if (st === 'dodge') { P.crouch = 30; P.lean = 0.5 * (a.dvx * a.face > 0 ? 1 : -1); P.legF = 0.7; P.legB = -0.7; P.kneeF = 0.8; P.kneeB = 0.6; }
    if (st === 'hurt' || st === 'grabbed') { P.lean = -0.35; P.armF = -0.6; P.armB = -0.9; P.elbF = 0.6; P.crouch = 6; }
    if (st === 'grab') { P.armF = 1.4; P.armB = 1.3; P.elbF = 0.5; P.elbB = 0.6; P.lean = 0.12; }
    if (st === 'getup') { P.crouch = 40 * (1 - Math.min(1, a.st / 0.4)); P.kneeF = 1.4; P.kneeB = 1.2; P.legF = 0.6; P.lean = 0.3; }
    if (st === 'throwobj') { P.armF = 1.6; P.elbF = 0.1; P.lean = 0.3; }
    if (st === 'down' || st === 'ko' || st === 'dead') { P.rot = -Math.PI / 2 * Math.min(1, a.st / 0.15); P.armF = 2.6; P.armB = 2.2; P.elbF = 0.3; P.legF = 0.2; P.legB = -0.1; }
    if (st === 'thrown') { P.rot = -a.st * 10; P.armF = 2.6; P.armB = -1; P.legF = 0.8; P.kneeF = 1; }
    return P;
  }

  function limb(x, y, a1, l1, a2, l2, w, col) {
    var ex = x + Math.sin(a1) * l1, ey = y + Math.cos(a1) * l1;
    var hx = ex + Math.sin(a1 + a2) * l2, hy = ey + Math.cos(a1 + a2) * l2;
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
    return [hx, hy];
  }

  function drawFigure(a, cx, w) {
    if (drawSprite(a, cx, w)) { drawTelegraph(a, cx); return; }
    var x = a.x - cx, y = a.y, z = a.z || 0;
    var P = pose(a, w.time), face = a.face, scale = a.isEnemy && a.def.elite ? 1.08 : (a.char && a.char.r >= 5 ? 1.06 : 1);
    // ombra a terra
    ctx.fillStyle = 'rgba(0,0,0,' + (0.4 - Math.min(0.25, z / 400)) + ')';
    ctx.beginPath(); ctx.ellipse(x, y, 30 * scale, 8, 0, 0, Math.PI * 2); ctx.fill();
    var alpha = 1;
    if (a.state === 'dead') alpha = Math.max(0, 1 - (a.fade || 0) / 1.2);
    if (a.protect > 0 && Math.floor(w.time * 20) % 2 === 0 && a.state !== 'ko') alpha *= 0.55;
    if (a.state === 'dodge' && a.invuln()) alpha *= 0.6;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.translate(x, y - z); ctx.scale(face * scale, scale);
    if (P.rot) { ctx.translate(0, -10); ctx.rotate(P.rot); ctx.translate(0, 10); }
    var body = a.isEnemy ? a.def.tint : COL.body, shade = a.isEnemy ? '#2c313b' : COL.bodyShade;
    var hipY = -78 + P.crouch, shY = hipY - 58;
    // gambe (retro più scura)
    ctx.save(); ctx.translate(-4, hipY); ctx.rotate(-P.legB);
    limb(0, 0, 0, 40, -P.kneeB, 40, 13, shade); ctx.restore();
    // braccio retro
    ctx.save(); ctx.translate(-6 + P.lean * 30, shY + 6); ctx.rotate(-P.armB);
    limb(0, 0, 0, 30, P.elbB, 28, 10, shade); ctx.restore();
    // busto
    ctx.save(); ctx.translate(0, hipY); ctx.rotate(P.lean);
    ctx.fillStyle = body; roundRect(-15, -60, 30, 62, 10); ctx.fill();
    if (a.isEnemy) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-15, -60, 30, 8); }
    else { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-15, -30, 30, 6); }
    // testa
    ctx.fillStyle = body; ctx.beginPath(); ctx.arc(4, -76, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(9, -80, 6, 3); // direzione dello sguardo
    ctx.restore();
    // gamba fronte
    ctx.save(); ctx.translate(4, hipY); ctx.rotate(-P.legF);
    limb(0, 0, 0, 40, -P.kneeF, 40, 14, body); ctx.restore();
    // braccio fronte + arma
    ctx.save(); ctx.translate(6 + P.lean * 30, shY + 6); ctx.rotate(-P.armF);
    var hand = limb(0, 0, 0, 30, P.elbF, 28, 11, body);
    var wpn = a.weapon ? W.WEAPONS[a.weapon.type] : null;
    if (wpn) {
      var ang = P.bat !== null ? P.bat : 0.9;
      ctx.translate(hand[0], hand[1]); ctx.rotate(-ang + P.armF);
      ctx.strokeStyle = wpn.color; ctx.lineCap = 'round'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, wpn.len); ctx.stroke();
      if (a.weapon.type === 'bat') { ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, wpn.len - 24); ctx.lineTo(0, wpn.len); ctx.stroke(); }
    }
    ctx.restore();
    ctx.restore();
    drawTelegraph(a, cx);
  }
  // telegraph nemico: segnale leggibile durante la preparazione
  function drawTelegraph(a, cx) {
    var x = a.x - cx, y = a.y, z = a.z || 0;
    if (a.isEnemy && a.att && a.att.phase === 'prep') {
      var hv = a.att.spec.heavy, pr = a.att.t / a.att.spec.prep;
      ctx.strokeStyle = hv ? COL.danger : '#ffd36a'; ctx.lineWidth = 3; ctx.globalAlpha = 0.5 + pr * 0.5;
      ctx.beginPath(); ctx.arc(x, y - z - 205, 9 + pr * 5, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', x, y - z - 199);
      ctx.globalAlpha = 1;
    }
  }

  function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  function drawSlotMarker(p, cx, w) {
    var x = p.x - cx, y = p.y + 16, col = p.slot === 0 ? COL.p1 : COL.p2;
    ctx.fillStyle = col; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    ctx.beginPath();
    if (p.slot === 0) { ctx.moveTo(x, y - 7); ctx.lineTo(x - 8, y + 6); ctx.lineTo(x + 8, y + 6); } // triangolo
    else ctx.rect(x - 7, y - 6, 14, 12);                                                              // quadrato
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.font = '600 13px "Oswald", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(233,228,214,0.8)';
    ctx.fillText(p.char.name.toUpperCase() + (p.cpu ? ' · CPU' : ''), x, p.y - (p.z || 0) - 200);
    if (p.state === 'ko' && !p.out) {
      var left = Math.max(0, w.diff.revive - p.koT);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, p.y - 60, 24, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(x, p.y - 60, 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (p.reviveProg / C.REVIVE.hold)); ctx.stroke();
      ctx.fillStyle = COL.ink; ctx.font = '600 15px "Oswald", sans-serif'; ctx.fillText('KO ' + left.toFixed(0) + 's', x, p.y - 96);
    }
  }

  // ------------------------------------------------------------------ FX da eventi
  function consume(w) {
    for (var i = 0; i < w.events.length; i++) {
      var e = w.events[i]; if (seenEvents[e.eid]) continue; seenEvents[e.eid] = true;
      if (e.type === 'hit') { fx.push({ k: 'spark', x: e.x, y: e.y - (e.z || 60), t: 0, big: e.heavy, col: e.target === 'player' ? '#ff6b5a' : '#fff1c2' }); if (opts.shake) shake = Math.max(shake, e.heavy ? 9 : 4); }
      if (e.type === 'disarm') fx.push({ k: 'text', x: e.x, y: e.y - 190, t: 0, s: 'DISARMATO', col: COL.p1 });
      if (e.type === 'break') fx.push({ k: 'text', x: e.x, y: e.y - 120, t: 0, s: 'SPEZZATA', col: '#c9c4b8' });
      if (e.type === 'heal') fx.push({ k: 'text', x: e.x, y: e.y - 190, t: 0, s: '+' + e.amt, col: '#7fd18a' });
      if (e.type === 'full') fx.push({ k: 'text', x: e.x, y: e.y - 190, t: 0, s: 'SALUTE PIENA', col: '#c9c4b8' });
      if (e.type === 'pickup') fx.push({ k: 'text', x: e.x, y: e.y - 190, t: 0, s: e.what.toUpperCase(), col: COL.p1 });
      if (e.type === 'fury') { if (opts.flash) flash = 0.25; }
      if (e.type === 'revive') fx.push({ k: 'text', x: e.x, y: e.y - 190, t: 0, s: 'IN PIEDI', col: '#7fd18a' });
    }
    w.events.length = 0;
  }
  function drawFx(cx, dt) {
    for (var i = fx.length - 1; i >= 0; i--) {
      var f = fx[i]; f.t += dt;
      if (f.k === 'spark') {
        var r = (f.big ? 34 : 22) * (0.5 + f.t * 6), a = Math.max(0, 1 - f.t / 0.18);
        ctx.strokeStyle = f.col; ctx.globalAlpha = a; ctx.lineWidth = f.big ? 5 : 3;
        for (var k = 0; k < 7; k++) { var an = k / 7 * Math.PI * 2 + f.x; ctx.beginPath(); ctx.moveTo(f.x - cx + Math.cos(an) * r * 0.4, f.y + Math.sin(an) * r * 0.4); ctx.lineTo(f.x - cx + Math.cos(an) * r, f.y + Math.sin(an) * r); ctx.stroke(); }
        ctx.globalAlpha = 1;
        if (f.t > 0.18) fx.splice(i, 1);
      } else {
        ctx.globalAlpha = Math.max(0, 1 - f.t / 1.0); ctx.fillStyle = f.col; ctx.font = 'bold 20px "Oswald", sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(f.s, f.x - cx, f.y - f.t * 40); ctx.globalAlpha = 1;
        if (f.t > 1) fx.splice(i, 1);
      }
    }
  }

  // ------------------------------------------------------------------ HUD
  function bar(x, y, w, h, v, col, back) { ctx.fillStyle = back; ctx.fillRect(x, y, w, h); ctx.fillStyle = col; ctx.fillRect(x, y, w * Math.max(0, Math.min(1, v)), h); ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h); }
  function drawHud(w, ui) {
    for (var i = 0; i < w.players.length; i++) {
      var p = w.players[i], x = 24 + i * 330, y = 22, col = p.slot === 0 ? COL.p1 : COL.p2;
      ctx.fillStyle = 'rgba(8,10,16,0.72)'; ctx.fillRect(x - 8, y - 8, 312, 82);
      ctx.fillStyle = col; ctx.beginPath();
      if (p.slot === 0) { ctx.moveTo(x + 9, y); ctx.lineTo(x, y + 16); ctx.lineTo(x + 18, y + 16); } else ctx.rect(x + 1, y + 1, 16, 15);
      ctx.fill();
      ctx.fillStyle = COL.ink; ctx.font = '600 20px "Oswald", sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(p.char.name.toUpperCase() + (p.cpu ? '  ·  CPU' : ''), x + 26, y + 16);
      ctx.font = '500 14px "Oswald", sans-serif'; ctx.fillStyle = COL.dim; ctx.textAlign = 'right';
      ctx.fillText(Math.ceil(p.hp) + '/' + p.maxhp, x + 296, y + 15); ctx.textAlign = 'left';
      bar(x, y + 24, 296, 14, p.hp / p.maxhp, p.hp / p.maxhp < 0.3 ? '#ff7a4a' : COL.hp, COL.hpBack);
      bar(x, y + 44, 180, 8, p.fury / 100, p.fury >= 100 ? (Math.floor(w.time * 6) % 2 ? '#fff0b0' : COL.fury) : COL.fury, '#2b2410');
      ctx.fillStyle = COL.dim; ctx.font = '500 13px "Oswald", sans-serif';
      ctx.fillText(p.fury >= 100 ? 'FURIA PRONTA' : 'FURIA', x, y + 68);
      if (p.weapon) {
        var def = W.WEAPONS[p.weapon.type];
        ctx.fillStyle = COL.ink; ctx.fillText(def.name.toUpperCase(), x + 192, y + 52);
        for (var d = 0; d < def.dur; d++) { ctx.fillStyle = d < p.weapon.dur ? def.color : '#333'; ctx.fillRect(x + 192 + d * 10, y + 58, 8, 8); }
      }
      if (p.combo >= 3) { ctx.fillStyle = col; ctx.font = 'bold 18px "Oswald", sans-serif'; ctx.fillText(p.combo + ' COLPI', x + 100, y + 68); }
      var pr = !p.cpu && w.promptFor(p);
      if (pr && p.state !== 'ko') {
        var px = p.x - w.cam.x, py = p.y - (p.z || 0) - 228;
        ctx.font = '600 15px "Oswald", sans-serif'; var tw = ctx.measureText(pr).width + 44;
        ctx.fillStyle = 'rgba(8,10,16,0.82)'; ctx.fillRect(px - tw / 2, py - 18, tw, 26);
        ctx.fillStyle = col; ctx.fillRect(px - tw / 2 + 6, py - 13, 22, 16); ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.font = 'bold 12px sans-serif';
        ctx.fillText(ui.keyFor(p, 'interact'), px - tw / 2 + 17, py); ctx.fillStyle = COL.ink; ctx.font = '600 15px "Oswald", sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(pr, px - tw / 2 + 36, py);
      }
    }
    // punteggio
    ctx.textAlign = 'right'; ctx.fillStyle = COL.ink; ctx.font = '600 22px "Oswald", sans-serif';
    ctx.fillText(String(w.score[0]).padStart(7, '0'), C.VIEW_W - 24, 40);
    if (w.players.length > 1 && !w.players[1].cpu) { ctx.fillStyle = COL.p2; ctx.fillText(String(w.score[1]).padStart(7, '0'), C.VIEW_W - 24, 68); }
    // obiettivo
    var ar = w.area;
    ctx.textAlign = 'center'; ctx.font = '600 18px "Oswald", sans-serif'; ctx.fillStyle = 'rgba(233,228,214,0.85)';
    ctx.fillText(ar.objective, C.VIEW_W / 2, 108);
    if (ar.banner.t < 3) {
      ctx.globalAlpha = Math.min(1, (3 - ar.banner.t)); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 300, C.VIEW_W, 90);
      ctx.fillStyle = COL.ink; ctx.font = '700 46px "Oswald", sans-serif'; ctx.fillText(ar.banner.text.toUpperCase(), C.VIEW_W / 2, 362); ctx.globalAlpha = 1;
    }
    // tutorial
    var tut = ar.def.tutorial || [], show = null;
    for (var ti = 0; ti < tut.length; ti++) {
      var st0 = tut[ti].flag ? w.flags[tut[ti].flag] : tut[ti].at;
      if (st0 !== undefined && st0 !== null && ar.t >= st0 && ar.t < st0 + tut[ti].until) show = tut[ti]; // solo il più recente
    }
    if (show) {
      var tt = show;
      {
        ctx.font = '500 17px "Oswald", sans-serif'; var txt = ui.tutorialText(tt.text), tw2 = ctx.measureText(txt).width + 40;
        ctx.fillStyle = 'rgba(8,10,16,0.82)'; ctx.fillRect(C.VIEW_W / 2 - tw2 / 2, 124, tw2, 32);
        ctx.fillStyle = COL.p1; ctx.fillText(txt, C.VIEW_W / 2, 146);
      }
    }
    // barra élite solo con il veterano in campo
    var boss = ar.bossEnemy(w);
    if (boss) {
      var bx = C.VIEW_W / 2 - 300;
      ctx.fillStyle = 'rgba(8,10,16,0.75)'; ctx.fillRect(bx - 10, 650, 620, 50);
      ctx.fillStyle = COL.ink; ctx.font = '600 16px "Oswald", sans-serif'; ctx.textAlign = 'left'; ctx.fillText('VETERANO', bx, 668);
      bar(bx, 676, 600, 14, boss.hp / boss.maxhp, '#c0485e', '#2a1218');
    }
    ctx.textAlign = 'left'; ctx.font = '500 12px "Oswald", sans-serif'; ctx.fillStyle = 'rgba(233,228,214,0.45)';
    ctx.fillText((useSprites ? 'NUCLEO 0.4 · TAVOLE DI PROVA · G GRAFICA · F3 DEBUG' : 'NUCLEO 0.4 · MANICHINI · G GRAFICA · F3 DEBUG'), 16, C.VIEW_H - 12);
  }

  function drawDebug(w) {
    var cx = w.cam.x, f = w.floor();
    ctx.strokeStyle = 'rgba(80,200,255,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(-cx, f[0], w.area.width, f[1] - f[0]);
    w.props.forEach(function (p) { if (p.solid) { ctx.strokeStyle = 'rgba(255,80,80,0.8)'; ctx.strokeRect(p.x0 - cx, p.y0, p.x1 - p.x0, p.y1 - p.y0); } });
    var all = w.players.concat(w.enemies);
    all.forEach(function (a) {
      if (a.att && a.att.phase === 'act') {
        var sp = a.att.spec, r = sp.reach + (sp.weaponReach || 0);
        ctx.fillStyle = 'rgba(255,60,60,0.35)';
        ctx.fillRect(a.face > 0 ? a.x - cx - 14 : a.x - cx - r, a.y - sp.ty, r + 14, sp.ty * 2);
      }
      ctx.fillStyle = a.hasToken ? '#ff5a3c' : '#9cf'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(a.state + (a.isEnemy ? ' ' + Math.ceil(a.hp) : ''), a.x - cx, a.y + 30);
    });
    ctx.fillStyle = '#9cf'; ctx.textAlign = 'left'; ctx.font = '12px monospace';
    ctx.fillText('attaccanti ' + w.attackers + ' · nemici ' + w.enemies.length + ' · oggetti ' + w.items.length + ' · cam ' + w.cam.x.toFixed(0), 16, 170);
  }

  // ------------------------------------------------------------------ frame
  function frame(w, dt, ui) {
    consume(w);
    ctx.save();
    if (shake > 0) { ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake); shake *= 0.85; if (shake < 0.5) shake = 0; }
    drawBg(w);
    var cx = w.cam.x;
    if (!(useSprites && bgImg && bgImg.ok)) w.props.forEach(function (p) { if (p.kind === 'lamp') drawLamp(p, cx, w.time); }); // i lampioni sono già dipinti nel fondale
    // ordinamento per profondità
    var list = [];
    w.props.forEach(function (p) { if (p.kind !== 'lamp') list.push({ y: p.y1, d: function () { drawProp(p, cx); } }); });
    w.items.forEach(function (it) { list.push({ y: it.y - 1, d: function () { drawItem(it, cx, w.time); } }); });
    w.enemies.forEach(function (e) { e.isEnemy = true; list.push({ y: e.y, d: function () { drawFigure(e, cx, w); } }); });
    w.players.forEach(function (p) { list.push({ y: p.y + 0.5, d: function () { drawFigure(p, cx, w); drawSlotMarker(p, cx, w); } }); });
    w.projectiles.forEach(function (pr) {
      list.push({ y: pr.y, d: function () {
        var def = W.WEAPONS[pr.w.type];
        ctx.save(); ctx.translate(pr.x - cx, pr.y - pr.z - 60); ctx.rotate(pr.t * 22);
        ctx.strokeStyle = def.color; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-def.len / 2, 0); ctx.lineTo(def.len / 2, 0); ctx.stroke(); ctx.restore();
      } });
    });
    list.sort(function (a, b) { return a.y - b.y; });
    for (var i = 0; i < list.length; i++) list[i].d();
    drawFx(cx, dt);
    if (flash > 0) { ctx.fillStyle = 'rgba(255,230,160,' + flash + ')'; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H); flash -= dt; }
    // vignetta notturna
    var vg = ctx.createRadialGradient(C.VIEW_W / 2, C.VIEW_H * 0.6, 300, C.VIEW_W / 2, C.VIEW_H * 0.6, 900);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    if (w.debug) drawDebug(w);
    ctx.restore();
    drawHud(w, ui);
  }

  return { toggleSprites: function () { useSprites = !useSprites; }, init: init, frame: frame, opts: opts, COL: COL, ctx: function () { return ctx; }, reset: function () { fx = []; seenEvents = {}; } };
})();
