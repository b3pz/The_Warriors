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

  var IMG = {}, bgImg = null, PX = {}, BGPX = {};
  function loadImg(file) {
    var im = new Image(); im.ok = false;
    im.onload = function () { im.ok = true; }; im.onerror = function () { console.warn('asset mancante', file); };
    im.src = (W.ASSET_DATA && W.ASSET_DATA[file]) || ('assets/' + file);
    return im;
  }
  function init(canvas) {
    cv = canvas; ctx = cv.getContext('2d');
    var P = W.ATLAS_PX;
    if (P) for (var ps in P.sets) PX[ps] = loadImg(P.sets[ps].file);
    if (W.BG_PX) for (var bk in W.BG_PX) BGPX[bk] = loadImg(W.BG_PX[bk].file);
    var A = W.USE_ILLUSTRATED ? W.ATLAS : null; if (!A) return;
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

  // ---- pixel art approvata (Raccolta 04): set per personaggio, pose con ripieghi dichiarati
  function setOf(a) {
    if (a.npc) return a.set;
    if (a.isEnemy) { if (a.sparSet) return a.sparSet; return (a.def.weapon && !a.weapon && a.def.unarmedSet) ? a.def.unarmedSet : a.def.set; }
    return a.char.id;
  }
  function pickPose(a) {
    var st = a.state, m = a.curMove, ph = a.att ? a.att.phase : null, wf = Math.floor(a.anim * (st === 'run' ? 9 : 6));
    if (a.npc) return a.pose === 'down' ? { p: 'down' } : (st === 'walk' ? { p: 'walk', i: wf } : { p: 'idle' });
    if (a.isEnemy) {
      var moving = Math.abs(a.x - (a.lx === undefined ? a.x : a.lx)) + Math.abs(a.y - (a.ly === undefined ? a.y : a.ly)) > 0.3;
      a.lx = a.x; a.ly = a.y;
      switch (st) {
        case 'enter': case 'approach': return moving ? { p: 'walk', i: wf } : { p: 'idle' };
        case 'atk': if (ph === 'prep') return { p: a.att.spec.heavy ? 'windup' : 'idle', lean: -0.06 }; return { p: 'swing', alt: 'punch', lean: 0.08 };
        case 'holding': return { p: 'punch' };
        case 'hurt': case 'grabbed': case 'getup': return { p: 'hurt' };
        case 'down': case 'dead': return { p: 'down' };
        case 'thrown': return { p: 'down', spin: true };
      }
      return { p: 'idle' };
    }
    switch (st) {
      case 'walk': case 'run': return { p: 'walk', i: wf };
      case 'jump': return a.att ? { p: 'kick', lean: -0.2 } : { p: 'jump' };
      case 'dodge': return { p: 'walk', i: 1, ghost: true };
      case 'hurt': case 'getup': case 'held': return { p: 'hurt' };
      case 'down': case 'ko': return { p: 'down' };
      case 'grab': case 'throwobj': return { p: 'punch' };
      case 'atk': case 'fury_sq': case 'grabhit':
        if (ph === 'prep') return { p: 'idle', lean: -0.05 };
        if (m === 'l3' || m === 'run') return { p: 'kick' };
        if (m === 'heavy') return { p: 'heavy', alt: 'kick' };
        if (m === 'fury') return { p: Math.floor(a.anim * 10) % 2 ? 'punch' : 'kick' };
        return { p: 'punch', batArc: !!(a.att && a.att.weaponSwing) };
    }
    return { p: 'idle' };
  }
  function drawPixel(a, cx, w) {
    var P = W.ATLAS_PX; if (!P || !useSprites) return false;
    var sid = setOf(a), set = P.sets[sid], im = PX[sid];
    if (!set || !im || !im.ok) return false;
    var sel = pickPose(a), list = set.frames[sel.p] || (sel.alt && set.frames[sel.alt]), fake = null;
    if (!list) {
      // ripieghi: colpito = idle inclinato, a terra = idle sdraiato, attacco = idle in avanti
      if (sel.p === 'down') fake = 'lie'; else if (sel.p === 'hurt') fake = 'tilt'; else if (sel.p === 'walk') fake = null;
      list = set.frames.walk && sel.p === 'walk' ? set.frames.walk : set.frames.idle;
    }
    var fr = list[(sel.i || 0) % list.length];
    var k = P.scale * ((a.isEnemy && a.def.scale) || 1);
    var x = Math.round(a.x - cx), y = a.y, z = a.z || 0;
    var lying = sel.p === 'down' || fake === 'lie';
    ctx.fillStyle = 'rgba(0,0,0,' + (0.42 - Math.min(0.25, z / 400)) + ')';
    ctx.beginPath(); ctx.ellipse(x, y, lying ? 64 : 30, 8, 0, 0, Math.PI * 2); ctx.fill();
    var alpha = 1;
    if (a.state === 'dead') alpha = Math.max(0, 1 - (a.fade || 0) / 1.2);
    if (a.protect > 0 && Math.floor(w.time * 20) % 2 === 0 && a.state !== 'ko') alpha *= 0.55;
    if (a.state === 'ko') alpha *= 0.85;
    ctx.save(); ctx.globalAlpha = alpha; ctx.imageSmoothingEnabled = false;
    ctx.translate(x, Math.round(y - z));
    if (fake === 'lie') { ctx.rotate(-a.face * Math.PI / 2); ctx.translate(0, 14); }
    if (fake === 'tilt') ctx.rotate(-a.face * 0.22);
    if (sel.lean) ctx.rotate(a.face * sel.lean);
    if (sel.spin) ctx.rotate(-a.face * a.st * 9);
    ctx.scale(a.face * k, k);
    if (a.isEnemy && a.def.elite) { try { ctx.filter = 'drop-shadow(0 0 3px rgba(220,60,80,0.95))'; } catch (x2) {} }
    if (sel.ghost) { ctx.globalAlpha = alpha * 0.3; ctx.drawImage(im, fr[0], fr[1], fr[2], fr[3], -fr[4] - 18, -fr[5], fr[2], fr[3]); ctx.globalAlpha = alpha * 0.75; }
    ctx.drawImage(im, fr[0], fr[1], fr[2], fr[3], -fr[4], -fr[5], fr[2], fr[3]);
    ctx.filter = 'none';
    // arma impugnata disegnata sopra (le tavole non hanno pose armate per i Warriors)
    var wpn = a.weapon && !(a.isEnemy && a.def.weapon === 'bat') ? W.WEAPONS[a.weapon.type] : null;
    if (wpn && !lying) {
      var L = wpn.len / k, hx = fr[2] * (sel.p === 'punch' ? 0.92 : 0.7) - fr[4], hy = -fr[5] + fr[3] * (sel.p === 'punch' ? 0.28 : 0.45);
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(sel.batArc ? -Math.PI / 2 : -0.45);
      ctx.strokeStyle = '#2a1a0c'; ctx.lineCap = 'butt'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -L); ctx.stroke();
      ctx.strokeStyle = wpn.color; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -L); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    if (sel.batArc && a.att && a.att.phase === 'act') {
      ctx.strokeStyle = 'rgba(255,245,220,0.55)'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(x, y - z - 110, 95, a.face > 0 ? -1.3 : Math.PI - 0.6, a.face > 0 ? 0.6 : Math.PI + 1.3); ctx.stroke();
    }
    if (a.isEnemy && a.att && a.att.phase === 'act' && a.def.weapon === 'bat' && a.weapon) {
      ctx.strokeStyle = 'rgba(255,240,210,0.5)'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(x, y - z - 100, 100, a.face > 0 ? -1.2 : Math.PI - 0.5, a.face > 0 ? 0.5 : Math.PI + 1.2); ctx.stroke();
    }
    return true;
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
    var bd = W.BG_PX && W.BG_PX[a.bg], bi = BGPX[a.bg];
    if (W.Scenery && opts.scenery !== false) {
      W.Scenery.draw(ctx, w.area, cx);
    } else if (bd && bi && bi.ok && useSprites) {
      // parte alta scalata fino a y=430, pavimento allungato fino al fondo; tasselli alternati a specchio
      var s2 = 430 / bd.floorTop, tw = Math.round(bd.w * s2);
      ctx.imageSmoothingEnabled = false;
      for (var ti = Math.floor(cx / tw); ti * tw - cx < C.VIEW_W; ti++) {
        var x0 = Math.round(ti * tw - cx);
        ctx.save();
        if (ti % 2) { ctx.translate(x0 + tw, 0); ctx.scale(-1, 1); } else ctx.translate(x0, 0);
        ctx.drawImage(bi, 0, 0, bd.w, bd.floorTop, 0, 0, tw, 430);
        ctx.drawImage(bi, 0, bd.floorTop, bd.w, bd.h - bd.floorTop, 0, 430, tw, C.VIEW_H - 430);
        ctx.restore();
      }
      ctx.imageSmoothingEnabled = true;
    } else if (useSprites && bgImg && bgImg.ok && W.USE_ILLUSTRATED) {
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
      var bg = buildBg({ id: a.id, width: a.width, floor: w.area.floor });
      ctx.drawImage(bg.far, -cx * 0.2, 0);
      ctx.drawImage(bg.mid, -cx * 0.55, 0);
      for (var x = -((cx) % 256) - 256; x < C.VIEW_W + 256; x += 256) ctx.drawImage(bg.gnd, 0, 440, 256, C.VIEW_H - 440, x, 440, 256, C.VIEW_H - 440);
    }
    // zona di uscita
    if (w.exitOpen && !(a.exitInteract)) {
      var ex = a.width - 200 - cx, pulse = 0.25 + 0.15 * Math.sin(w.time * 5);
      var fl = w.area.floor;
      ctx.fillStyle = 'rgba(242,193,78,' + pulse * 0.4 + ')'; ctx.fillRect(ex, fl[0], 200, fl[1] - fl[0]);
      ctx.fillStyle = COL.p1; ctx.font = 'bold 28px "Oswald", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('USCITA ▶', ex + 100, fl[0] - 20);
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
  // ostacoli bassi: transenne (strada), tornelli (metro), siepi (parco), fuoco
  function drawLowSeg(p, cx, y, t) {
    var x = p.x0 - cx + (y - p.y0) * 0.12;
    if (p.kind === 'fire') {
      for (var k = 0; k < 4; k++) {
        var fx = x + 10 + k * 20 + Math.sin(t * 9 + k + y) * 4, fh = 30 + Math.sin(t * 13 + k * 2 + y) * 10;
        var g = ctx.createLinearGradient(0, y - fh, 0, y); g.addColorStop(0, 'rgba(255,230,120,0)'); g.addColorStop(0.4, 'rgba(255,150,40,0.9)'); g.addColorStop(1, 'rgba(200,40,10,0.95)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(fx - 10, y); ctx.quadraticCurveTo(fx - 6, y - fh * 0.6, fx, y - fh); ctx.quadraticCurveTo(fx + 6, y - fh * 0.6, fx + 10, y); ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,140,40,0.12)'; ctx.beginPath(); ctx.ellipse(x + 45, y - 10, 70, 30, 0, 0, Math.PI * 2); ctx.fill();
      return;
    }
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x - 4, y - 3, 34, 7);
    if (p.style === 'turnstile') {
      ctx.fillStyle = '#3c4146'; ctx.fillRect(x, y - 44, 26, 44); ctx.fillStyle = '#9aa3a8'; ctx.fillRect(x + 2, y - 46, 22, 5);
      ctx.strokeStyle = '#b8bfc4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 13, y - 30); ctx.lineTo(x + 40, y - 34); ctx.stroke();
    } else if (p.style === 'hedge') {
      ctx.fillStyle = '#16261c'; ctx.beginPath(); ctx.arc(x + 12, y - 16, 18, Math.PI, 0); ctx.fill(); ctx.fillRect(x - 6, y - 16, 36, 16);
      ctx.fillStyle = '#20392a'; ctx.beginPath(); ctx.arc(x + 6, y - 20, 9, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = '#2d2d33'; ctx.fillRect(x + 2, y - 40, 5, 40); ctx.fillRect(x + 19, y - 40, 5, 40);
      ctx.fillStyle = Math.floor(y / 26) % 2 ? '#e0522d' : '#f2f2f2'; ctx.fillRect(x - 3, y - 38, 32, 10);
      ctx.fillStyle = Math.floor(y / 26) % 2 ? '#f2f2f2' : '#e0522d'; ctx.fillRect(x - 3, y - 26, 32, 8);
    }
  }
  function drawProp(p, cx) {
    if (p.kind === 'barrier') {
      var bx0 = p.x0 - cx, hh = p.y1 - p.y0;
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(bx0 - 4, p.y1 - 4, 34, 8);
      for (var bi2 = 0; bi2 < 2; bi2++) { ctx.fillStyle = '#2d2d33'; ctx.fillRect(bx0 + bi2 * 20, p.y0 - 30, 6, hh + 30); }
      for (var st2 = 0; st2 < 4; st2++) { ctx.fillStyle = st2 % 2 ? '#f2f2f2' : '#e0522d'; ctx.fillRect(bx0 - 4, p.y0 - 30 + st2 * 9 + hh * 0.2, 34, 9); }
      return;
    }
    if (p.kind === 'crate') {
      var cx0 = p.x0 - cx, cw = p.x1 - p.x0;
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(cx0 + 4, p.y1 - 4, cw, 8);
      ctx.fillStyle = '#7a5a34'; ctx.fillRect(cx0, p.y1 - 62, cw, 62); ctx.strokeStyle = '#4a3420'; ctx.lineWidth = 3; ctx.strokeRect(cx0 + 2, p.y1 - 60, cw - 4, 58);
      ctx.beginPath(); ctx.moveTo(cx0 + 2, p.y1 - 60); ctx.lineTo(cx0 + cw - 2, p.y1 - 2); ctx.stroke();
      return;
    }
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
    if (a.hidden) return;
    if (drawPixel(a, cx, w)) { drawTelegraph(a, cx); return; }
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
    if (a.isEnemy && a.att && a.att.phase === 'prep' && a.aim && a.def.behavior === 'shoot') {
      var pr0 = a.att.t / a.att.spec.prep;
      ctx.strokeStyle = 'rgba(255,70,50,' + (0.25 + pr0 * 0.6) + ')'; ctx.lineWidth = 3; ctx.setLineDash([14, 10]);
      ctx.beginPath(); ctx.moveTo(x, a.aim.y - 60); ctx.lineTo(a.face > 0 ? C.VIEW_W : 0, a.aim.y - 60); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,70,50,0.12)'; ctx.fillRect(a.face > 0 ? x : 0, a.aim.y - 22, a.face > 0 ? C.VIEW_W - x : x, 44);
    }
    if (a.isEnemy && a.att && a.att.phase === 'prep' && a.aim && a.def.behavior === 'throw') {
      ctx.strokeStyle = 'rgba(255,170,60,0.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(a.aim.x - cx, a.aim.y, 46, 14, 0, 0, Math.PI * 2); ctx.stroke();
    }
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
      if (e.type === 'flashfx' && opts.flash) flash = 0.5;
      if (e.type === 'shakefx' && opts.shake) shake = e.amt || 8;
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
    if (w.area && w.area.scene) { drawScene(w, w.area.scene, ui); return; }
    var ar0 = w.area;
    if (ar0.st && (ar0.st.phase === 'wait' || ar0.st.phase === 'patrol')) {
      var nz = Math.min(1, ar0.st.noise);
      ctx.fillStyle = 'rgba(8,10,16,0.8)'; ctx.fillRect(C.VIEW_W / 2 - 160, 130, 320, 44);
      ctx.fillStyle = COL.ink; ctx.font = '600 15px "Oswald", sans-serif'; ctx.textAlign = 'left'; ctx.fillText('RUMORE', C.VIEW_W / 2 - 148, 157);
      ctx.fillStyle = '#2a2f36'; ctx.fillRect(C.VIEW_W / 2 - 80, 145, 228, 14);
      ctx.fillStyle = nz > 0.7 ? '#e0453a' : nz > 0.4 ? '#e0a83a' : '#8fa0a8'; ctx.fillRect(C.VIEW_W / 2 - 80, 145, 228 * nz, 14);
    }
    if (ar0.timer !== null && ar0.timer !== undefined) {
      var tl = Math.ceil(ar0.timer), urgent = ar0.timer < 10;
      ctx.fillStyle = 'rgba(8,10,16,0.75)'; ctx.fillRect(C.VIEW_W - 160, 80, 136, 50);
      ctx.fillStyle = urgent && Math.floor(w.time * 4) % 2 ? '#ff5a3c' : COL.ink; ctx.font = '700 38px "Oswald", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(Math.floor(tl / 60) + ':' + String(tl % 60).padStart(2, '0'), C.VIEW_W - 92, 120);
    }
    if (ar0.bus && ar0.bus.phase === 'warn' && Math.floor(w.time * 6) % 2) {
      ctx.fillStyle = 'rgba(255,200,40,0.18)'; ctx.fillRect(0, ar0.bus.lane[0] - 30, C.VIEW_W, ar0.bus.lane[1] - ar0.bus.lane[0] + 30);
      ctx.fillStyle = '#ffd36a'; ctx.font = '700 20px "Oswald", sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(ar0.bus.kind === 'train' ? '◀ ARRIVA UN TRENO: VIA DAI BINARI' : '◀ BUS DEI TURNBULL: SCENDI DALLA CORSIA', 20, ar0.bus.kind === 'train' ? ar0.bus.lane[0] - 12 : ar0.bus.lane[0] - 36);
    }
    for (var i = 0; i < w.players.length; i++) {
      var p = w.players[i], x = 24 + i * 330, y = 22, col = p.slot === 0 ? COL.p1 : COL.p2;
      if (p.state === 'held' && !p.cpu) { ctx.fillStyle = '#ffd36a'; ctx.font = '700 20px "Oswald", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(p.char.id === 'rembrandt' ? ui.keyFor(p, 'interact') + ': BOMBOLETTA NEGLI OCCHI' : 'PREMI PIÙ VOLTE ' + ui.keyFor(p, 'light') + ' PER LIBERARTI', p.x - w.cam.x, p.y - 220); }
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
    // niente punteggio a schermo durante il gioco: resta nel resoconto finale
    // obiettivo
    var ar = w.area;
    ctx.textAlign = 'center'; ctx.font = '600 18px "Oswald", sans-serif'; ctx.fillStyle = 'rgba(233,228,214,0.85)';
    ctx.fillText(ui.tutorialText(ar.objective || ''), C.VIEW_W / 2, 108);
    if (false && ar.banner.t < 2.4) { // sostituito dalla vignetta a fumetto
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
      ctx.fillStyle = COL.ink; ctx.font = '600 16px "Oswald", sans-serif'; ctx.textAlign = 'left'; ctx.fillText(boss.def.label.toUpperCase(), bx, 668);
      bar(bx, 676, 600, 14, boss.hp / boss.maxhp, '#c0485e', '#2a1218');
    }
    ctx.textAlign = 'left'; ctx.font = '500 12px "Oswald", sans-serif'; ctx.fillStyle = 'rgba(233,228,214,0.45)';
    ctx.fillText(ar0.def.id + ' · ' + ar0.def.name.toUpperCase() + ' · VERSIONE 0.5', 16, C.VIEW_H - 12);
  }

  function wrapText(text, maxW) {
    var words = text.split(' '), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) { var t = cur ? cur + ' ' + words[i] : words[i]; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = words[i]; } else cur = t; }
    if (cur) lines.push(cur); return lines;
  }
  // studio radio della DJ: buio, insegna IN ONDA, microfono, onda sonora
  function drawRadio(w, sc) {
    var t = w.time;
    ctx.fillStyle = '#050307'; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    var glow = ctx.createRadialGradient(640, 300, 10, 640, 300, 520); glow.addColorStop(0, 'rgba(120,20,30,0.55)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    // insegna
    var on = Math.floor(t * 1.3) % 6 !== 0;
    ctx.fillStyle = on ? '#e0283a' : '#5a1018'; ctx.font = '700 30px "Oswald", sans-serif'; ctx.textAlign = 'center';
    ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 3; ctx.strokeRect(560, 92, 160, 50); ctx.fillText('IN ONDA', 640, 128);
    // microfono
    ctx.fillStyle = '#1c1a20'; ctx.fillRect(632, 300, 16, 170); ctx.fillRect(560, 462, 160, 14);
    var mg = ctx.createLinearGradient(590, 0, 690, 0); mg.addColorStop(0, '#2a2a30'); mg.addColorStop(0.5, '#8a8a96'); mg.addColorStop(1, '#2a2a30');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.ellipse(640, 250, 52, 78, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2; for (var gy = 190; gy < 320; gy += 10) { ctx.beginPath(); ctx.moveTo(592, gy); ctx.lineTo(688, gy); ctx.stroke(); }
    // onda: si muove quando la DJ parla
    var talking = sc.line && sc.lineT < 3.5;
    ctx.strokeStyle = 'rgba(255,90,90,0.85)'; ctx.lineWidth = 3; ctx.beginPath();
    for (var x = 340; x <= 940; x += 6) { var a = talking ? Math.sin(x * 0.07 + t * 18) * Math.sin(x * 0.013 + t * 3) * 34 : Math.sin(x * 0.05 + t * 2) * 3; if (x === 340) ctx.moveTo(x, 540 + a); else ctx.lineTo(x, 540 + a); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(233,228,214,0.55)'; ctx.font = '500 16px "Oswald", sans-serif'; ctx.fillText('LA RADIO DELLA NOTTE', 640, 600);
  }
  function drawScene(w, sc, ui) {
    if (sc.def.radio && !sc.title) drawRadio(w, sc);
    if (sc.def.radio && sc.title) { ctx.fillStyle = '#050307'; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H); }
    if (sc.letterbox) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, C.VIEW_W, 62); ctx.fillRect(0, C.VIEW_H - 62, C.VIEW_W, 62); }
    if (sc.fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, sc.fade) + ')'; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H); }
    if (sc.title) {
      var a = Math.min(1, sc.title.t / 0.5, (sc.title.dur - sc.title.t) / 0.5);
      ctx.globalAlpha = Math.max(0, a); ctx.textAlign = 'center';
      ctx.fillStyle = '#d62828'; ctx.font = '700 72px "Oswald", sans-serif'; ctx.fillText(sc.title.text.toUpperCase(), C.VIEW_W / 2, 350);
      if (sc.title.sub) { ctx.fillStyle = COL.ink; ctx.font = '500 26px "Oswald", sans-serif'; ctx.fillText(sc.title.sub, C.VIEW_W / 2, 398); }
      ctx.globalAlpha = 1;
    }
    var box = function (who, text) {
      ctx.font = '500 24px "Oswald", sans-serif';
      var lines = wrapText(text, 980), h = 40 + lines.length * 32 + (who ? 26 : 0), y0 = C.VIEW_H - 74 - h;
      ctx.fillStyle = 'rgba(6,6,10,0.88)'; ctx.fillRect(110, y0, C.VIEW_W - 220, h);
      ctx.fillStyle = '#d62828'; ctx.fillRect(110, y0, 5, h);
      var ty = y0 + 34;
      if (who) { var n = sc.actor(who); ctx.fillStyle = COL.p1; ctx.font = '700 20px "Oswald", sans-serif'; ctx.textAlign = 'left'; ctx.fillText(((n && n.name) || (W.rosterById(who) || {}).name || W.NPC_NAMES[who] || who).toUpperCase(), 140, ty); ty += 30; }
      ctx.fillStyle = COL.ink; ctx.font = '500 24px "Oswald", sans-serif'; ctx.textAlign = 'left';
      lines.forEach(function (l, i) { ctx.fillText(l, 140, ty + i * 32); });
      if (sc.lineT > 0.25 && Math.floor(w.time * 3) % 2) { ctx.textAlign = 'right'; ctx.fillStyle = COL.dim; ctx.font = '500 15px "Oswald", sans-serif'; ctx.fillText('INVIO ▶', C.VIEW_W - 130, y0 + h - 12); }
    };
    if (sc.line && !sc.line.who) {
      ctx.font = '700 24px "Oswald", sans-serif';
      var cl = wrapText(sc.line.text.toUpperCase(), 760), ch = 24 + cl.length * 32;
      ctx.save(); ctx.translate(80, 90); ctx.rotate(-0.015);
      ctx.fillStyle = '#111'; ctx.fillRect(6, 6, 800, ch); ctx.fillStyle = '#f2d23c'; ctx.fillRect(0, 0, 800, ch); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, 800, ch);
      ctx.fillStyle = '#111'; ctx.textAlign = 'left'; cl.forEach(function (l, i) { ctx.fillText(l, 20, 36 + i * 32); });
      ctx.restore();
    } else if (sc.line) box(sc.line.who, sc.line.text);
    if (sc.choice) {
      ctx.font = '500 24px "Oswald", sans-serif';
      var y1 = C.VIEW_H - 80 - sc.choice.opts.length * 50;
      ctx.fillStyle = 'rgba(6,6,10,0.9)'; ctx.fillRect(110, y1 - 50, C.VIEW_W - 220, sc.choice.opts.length * 50 + 60);
      ctx.fillStyle = COL.p1; ctx.font = '700 20px "Oswald", sans-serif'; ctx.textAlign = 'left'; ctx.fillText('SWAN RISPONDE', 140, y1 - 16);
      sc.choice.opts.forEach(function (o, i) {
        var sel = i === sc.choice.sel; if (sel) { ctx.fillStyle = 'rgba(214,40,40,0.25)'; ctx.fillRect(130, y1 + i * 50 - 2, C.VIEW_W - 260, 44); }
        ctx.fillStyle = sel ? '#fff' : COL.ink; ctx.font = '500 23px "Oswald", sans-serif'; ctx.fillText((sel ? '▶ ' : '   ') + o, 146, y1 + i * 50 + 28);
      });
    }
    ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(233,228,214,0.4)'; ctx.font = '500 13px "Oswald", sans-serif'; ctx.fillText('ESC: PAUSA E SALTA SCENA', C.VIEW_W - 20, 40);
  }

  // ---- correzione colore da film: notte desaturata e fredda, sodio delle strade, alba pallida; grana pellicola
  var LIGHT = {
    dusk:  { desat: 0.25, mult: 'rgba(170,140,160,0.30)', warm: 'rgba(255,140,60,0.10)', dark: 0.04, vig: 0.45 },
    night: { desat: 0.35, mult: 'rgba(120,134,166,0.38)', warm: 'rgba(255,150,60,0.10)', dark: 0.06, vig: 0.55 },
    dawn:  { desat: 0.55, mult: 'rgba(190,170,165,0.45)', warm: 'rgba(255,200,160,0.10)', dark: 0.05, vig: 0.45 }
  };
  var grainC = null, grainT = 0;
  function grainCanvas() {
    if (grainC) return grainC;
    grainC = document.createElement('canvas'); grainC.width = 256; grainC.height = 256;
    var g = grainC.getContext('2d'), id = g.createImageData(256, 256);
    for (var i = 0; i < id.data.length; i += 4) { var v = 128 + (Math.random() - 0.5) * 140; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    g.putImageData(id, 0, 0); return grainC;
  }
  function grade(w) {
    var L = LIGHT[(w.area && w.area.def.light) || 'night'];
    ctx.save();
    ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = 'rgba(128,128,128,' + L.desat + ')'; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = L.mult; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = L.warm; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(4,6,12,' + L.dark + ')'; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    var vg = ctx.createRadialGradient(C.VIEW_W / 2, C.VIEW_H * 0.6, 260, C.VIEW_W / 2, C.VIEW_H * 0.6, 860);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,' + L.vig + ')');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    if (opts.grain !== false) {
      grainT++; var gc = grainCanvas(), ox = (grainT * 37) % 256, oy = (grainT * 91) % 256;
      ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.09;
      ctx.translate(-ox, -oy); ctx.fillStyle = ctx.createPattern(gc, 'repeat'); ctx.fillRect(0, 0, C.VIEW_W + 256, C.VIEW_H + 256);
    }
    ctx.restore();
  }

  function drawSkates(n, cx) {
    var x = n.x - cx, y = n.y;
    ctx.fillStyle = '#d8d0c0'; ctx.fillRect(x - 22, y - 7, 44, 5);
    ctx.fillStyle = '#c0392b'; [-16, -6, 6, 16].forEach(function (o) { ctx.beginPath(); ctx.arc(x + o, y - 1, 3.5, 0, Math.PI * 2); ctx.fill(); });
  }
  function drawStalls(w, cx, list) {
    var a = w.area, st = a.st, f = a.floor;
    a.def.stalls.forEach(function (sx, i) {
      var checked = st && st.phase !== 'hide' && (i < st.target || (i === st.target && st.checking > 0 && i !== st.stall && st.checking < 0.7));
      var mine = st && st.stall === i;
      list.push({ y: f[0] - 2, d: function () {
        var x = sx - cx - 52, top = f[0] - 210, h = 200;
        ctx.fillStyle = '#20262b'; ctx.fillRect(x - 6, top - 6, 116, h + 6);
        if (checked) { ctx.fillStyle = '#0c0e10'; ctx.fillRect(x, top, 104, h); ctx.fillStyle = '#5e6a70'; ctx.fillRect(x + 104, top, 26, h); }
        else { ctx.fillStyle = mine ? '#6f7d84' : '#58646a'; ctx.fillRect(x, top, 104, h); ctx.fillStyle = '#3b4449'; ctx.fillRect(x + 10, top + 12, 84, 70); ctx.fillStyle = '#c9b46a'; ctx.fillRect(x + 88, top + 100, 6, 14); }
        ctx.fillStyle = '#2b3338'; ctx.fillRect(x - 6, top + h, 116, 8);
        // graffiti sulle porte
        ctx.strokeStyle = 'rgba(200,60,60,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 18, top + 140 + i * 4); ctx.lineTo(x + 52, top + 120); ctx.lineTo(x + 80, top + 150); ctx.stroke();
      } });
    });
    if (a.sprayFx) { var sf = a.sprayFx; sf.t += 1 / 60; list.push({ y: sf.y + 2, d: function () {
      for (var k = 0; k < 18; k++) { var ang = k * 0.7, r = 10 + sf.t * 90 * (0.5 + (k % 3) * 0.25); ctx.fillStyle = 'rgba(220,60,90,' + Math.max(0, 0.6 - sf.t * 0.4) + ')'; ctx.beginPath(); ctx.arc(sf.x - cx + Math.cos(ang) * r * 0.6, sf.y - 150 + Math.sin(ang) * r * 0.4, 8 + sf.t * 6, 0, Math.PI * 2); ctx.fill(); }
    } }); }
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
    if (w.area && w.area.scene && w.area.def && (w.area.def.kind === 'scene' || w.area.def.kind === 'epilogue')) shake *= 0.9;
    ctx.save();
    if (shake > 0) { ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake); shake *= 0.85; if (shake < 0.5) shake = 0; }
    drawBg(w);
    var cx = w.cam.x;
    if (!(useSprites && bgImg && bgImg.ok)) w.props.forEach(function (p) { if (p.kind === 'lamp') drawLamp(p, cx, w.time); }); // i lampioni sono già dipinti nel fondale
    // ordinamento per profondità
    var list = [];
    w.props.forEach(function (p) {
      if (p.kind === 'lamp') return;
      if (p.kind === 'low' || p.kind === 'fire') { for (var yy = p.y0 + 10; yy <= p.y1; yy += 26) (function (y) { list.push({ y: y, d: function () { drawLowSeg(p, cx, y, w.time); } }); })(yy); return; }
      list.push({ y: p.y1, d: function () { drawProp(p, cx); } });
    });
    w.items.forEach(function (it) { list.push({ y: it.y - 1, d: function () { drawItem(it, cx, w.time); } }); });
    w.enemies.forEach(function (e) { e.isEnemy = true; list.push({ y: e.y, d: function () { drawFigure(e, cx, w); } }); });
    w.players.forEach(function (p) { if (p.hidden) return; list.push({ y: p.y + 0.5, d: function () { drawFigure(p, cx, w); if (!(w.area && w.area.scene)) drawSlotMarker(p, cx, w); } }); });
    w.npcs.forEach(function (n) { if (n.hidden) return; list.push({ y: n.y, d: function () { drawPixel(n, cx, w); if (n.skates) drawSkates(n, cx); } }); });
    if (w.area && w.area.def.kind === 'stealth') drawStalls(w, cx, list);
    w.eproj.forEach(function (pr) { list.push({ y: pr.y, d: function () {
      if (pr.kind === 'bullet') { ctx.strokeStyle = '#fff3c4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(pr.x - cx, pr.y - 60); ctx.lineTo(pr.x - cx - Math.sign(pr.vx) * 40, pr.y - 60); ctx.stroke(); }
      else { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(pr.tx - cx, pr.ty, 20, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.save(); ctx.translate(pr.x - cx, pr.y - pr.z - 20); ctx.rotate(pr.t * 14); ctx.fillStyle = '#3f8f4f'; ctx.fillRect(-4, -12, 8, 24); ctx.restore(); }
    } }); });
    if (w.area && w.area.bus && w.area.bus.kind === 'train' && w.area.bus.lane) {
      var tr = w.area.bus; list.push({ y: tr.lane[1] + 2, d: function () {
        var ty = tr.lane[1];
        // binari sempre visibili, con bordo giallo di sicurezza
        ctx.fillStyle = 'rgba(10,10,12,0.75)'; ctx.fillRect(0, tr.lane[0], C.VIEW_W, ty - tr.lane[0] + 6);
        ctx.fillStyle = '#c9a227'; ctx.fillRect(0, tr.lane[0] - 4, C.VIEW_W, 4);
        ctx.fillStyle = '#5a5f66'; ctx.fillRect(0, ty - 18, C.VIEW_W, 3); ctx.fillRect(0, ty - 6, C.VIEW_W, 3);
        if (tr.phase === 'warn') { var bl = Math.floor(w.time * 6) % 2; ctx.fillStyle = bl ? '#fff3c4' : '#6a5a2a'; ctx.beginPath(); ctx.arc(30, tr.lane[0] - 20, 8, 0, Math.PI * 2); ctx.fill(); }
        if (tr.phase === 'pass') {
          var bx2 = tr.x - cx;
          ctx.fillStyle = '#8b9399'; ctx.fillRect(bx2, ty - 190, 900, 186);
          ctx.fillStyle = '#5c646a'; for (var c2 = 0; c2 < 4; c2++) ctx.fillRect(bx2 + c2 * 225, ty - 190, 6, 186);
          ctx.fillStyle = '#1d2226'; for (var wi = 0; wi < 12; wi++) ctx.fillRect(bx2 + 20 + wi * 74, ty - 165, 52, 46);
          ctx.fillStyle = 'rgba(230,60,90,0.55)'; for (var g2 = 0; g2 < 6; g2++) { ctx.beginPath(); ctx.ellipse(bx2 + 70 + g2 * 150, ty - 70, 46, 18, 0.2, 0, Math.PI * 2); ctx.fill(); }
          ctx.fillStyle = '#fff6b0'; ctx.fillRect(bx2 + 890, ty - 80, 10, 18);
        }
      } });
    }
    if (w.area && w.area.bus && w.area.bus.kind === 'bus' && w.area.bus.phase === 'pass') { var bus = w.area.bus; list.push({ y: bus.lane[0], d: function () {
      var bx = bus.x - cx, by = bus.lane[1];
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(bx, by - 6, 380, 14);
      ctx.fillStyle = '#2f6b3a'; ctx.fillRect(bx, by - 150, 380, 140); ctx.fillStyle = '#2b2b33'; for (var wi = 0; wi < 6; wi++) ctx.fillRect(bx + 20 + wi * 58, by - 135, 44, 40);
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(bx + 70, by - 8, 20, 0, Math.PI * 2); ctx.arc(bx + 310, by - 8, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff6b0'; ctx.fillRect(bx + 368, by - 60, 12, 16);
      ctx.fillStyle = '#e8e2c8'; ctx.font = '700 22px "Oswald", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('TURNBULL A.C.', bx + 190, by - 70);
    } }); }
    if (w.area && !w.area.scene && w.area.interactions) w.area.interactions().forEach(function (it) {
      list.push({ y: it.y + 1, d: function () {
        var ix = it.x - cx, b = Math.sin(w.time * 5) * 4;
        ctx.fillStyle = it.exit ? '#f2c14e' : '#7fd1ff'; ctx.beginPath(); ctx.moveTo(ix, it.y - 205 + b); ctx.lineTo(ix - 9, it.y - 220 + b); ctx.lineTo(ix + 9, it.y - 220 + b); ctx.fill();
      } });
    });
    if (w.area && w.area.sprayFx && w.area.def.kind !== 'stealth') { var sf2 = w.area.sprayFx; sf2.t += 1 / 60; if (sf2.t < 1.6) list.push({ y: sf2.y + 2, d: function () {
      for (var k2 = 0; k2 < 18; k2++) { var an2 = k2 * 0.7, rr = 10 + sf2.t * 90 * (0.5 + (k2 % 3) * 0.25); ctx.fillStyle = 'rgba(220,60,90,' + Math.max(0, 0.6 - sf2.t * 0.4) + ')'; ctx.beginPath(); ctx.arc(sf2.x - cx + Math.cos(an2) * rr * 0.6, sf2.y - 150 + Math.sin(an2) * rr * 0.4, 8 + sf2.t * 6, 0, Math.PI * 2); ctx.fill(); }
    } }); }
        if (w.area && w.area.def.mark && !w.area.markReached) { var mk = w.area.def.mark; ctx.strokeStyle = 'rgba(242,193,78,' + (0.5 + 0.3 * Math.sin(w.time * 4)) + ')'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(mk.x - cx, mk.y, 50, 14, 0, 0, Math.PI * 2); ctx.stroke(); }
    if (w.area && w.area.def.radioProp) { var rp = w.area.def.radioProp, smashed = w.area.radioSmashed; list.push({ y: rp.y, d: function () {
      var rx = rp.x - cx; ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(rx - 34, rp.y - 4, 70, 8);
      ctx.fillStyle = smashed ? '#2a1a10' : '#5a3a22'; ctx.fillRect(rx - 30, rp.y - 70, 60, 66);
      if (!smashed) { ctx.fillStyle = '#c9a227'; ctx.fillRect(rx - 22, rp.y - 60, 44, 14); ctx.fillStyle = '#1a1008'; ctx.beginPath(); ctx.arc(rx - 10, rp.y - 28, 9, 0, Math.PI * 2); ctx.arc(rx + 12, rp.y - 28, 9, 0, Math.PI * 2); ctx.fill();
        var nt = (w.time * 2) % 1; ctx.fillStyle = 'rgba(255,220,160,' + (1 - nt) + ')'; ctx.font = '700 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('♪', rx + 20, rp.y - 80 - nt * 30); }
      else { ctx.strokeStyle = '#120a06'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(rx - 26, rp.y - 66); ctx.lineTo(rx + 10, rp.y - 30); ctx.lineTo(rx - 4, rp.y - 8); ctx.stroke(); }
    } }); }
    if (w.area && w.area.def.panel) { var pn = w.area.def.panel, open = w.area.panelOpen; list.push({ y: pn.y - 40, d: function () {
      var px2 = pn.x - cx; ctx.fillStyle = open ? 'rgba(160,200,255,0.5)' : '#5a4630'; ctx.fillRect(px2 - 50, pn.y - 230, 100, 150);
      ctx.strokeStyle = '#2a2018'; ctx.lineWidth = 4; ctx.strokeRect(px2 - 50, pn.y - 230, 100, 150);
      if (!open) for (var cr = 0; cr < w.area.panelHits; cr++) { ctx.beginPath(); ctx.moveTo(px2 - 30 + cr * 20, pn.y - 220); ctx.lineTo(px2 - 10 + cr * 20, pn.y - 100); ctx.stroke(); }
      ctx.fillStyle = COL.ink; ctx.font = '600 16px "Oswald", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(open ? 'USCITA' : 'PORTA CHIUSA', px2, pn.y - 238);
    } }); }
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
    grade(w);
    if (w.debug) drawDebug(w);
    ctx.restore();
    drawHud(w, ui);
  }

  return { pxImage: function (id) { return PX[id]; }, toggleSprites: function () { useSprites = !useSprites; }, init: init, frame: frame, opts: opts, COL: COL, ctx: function () { return ctx; }, reset: function () { fx = []; seenEvents = {}; } };
})();
