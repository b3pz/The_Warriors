// Fondali disegnati a codice, provvisori finché non arrivano le tavole definitive.
// Ogni ambiente è costruito sulla scala dei personaggi (circa 185 px di altezza) e allineato al piano
// calpestabile dell'area: la base dei muri coincide con l'inizio del pavimento.
// Si disegna a metà risoluzione e si ingrandisce senza filtro, così il tratto è a pixel come gli sprite.
'use strict';
var W = window.W;

W.Scenery = (function () {
  var cache = {};
  var ENV_BY_BG = { park: 'park', park_b: 'park', metro: 'platform', metro_b: 'platform', alley: 'alley', street: 'street', street_b: 'street',
    harbor: 'courtyard', interior: 'bathroom', coney: 'coney', coney_b: 'coney', boardwalk: 'beach' };
  var SIGNS = { 'P0-04': 'CONEY ISLAND', 'C2-04': 'GUN HILL RD', 'C3-04': '96 ST', 'C6-01': 'UNION SQ', 'C6-04': 'UNION SQ', 'C7-02': 'CONEY ISLAND' };

  function rng(seed) { var s = 0; for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) | 0; s = Math.abs(s) || 7; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function shade(hex, k) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; r = Math.min(255, Math.max(0, Math.round(r * k))); g = Math.min(255, Math.max(0, Math.round(g * k))); b = Math.min(255, Math.max(0, Math.round(b * k))); return 'rgb(' + r + ',' + g + ',' + b + ')'; }

  // tavolozze per ora del giorno
  var SKY = {
    dusk:  ['#2a1e3a', '#6a3a4a', '#c0704a'],
    night: ['#05070f', '#0c1226', '#1a2140'],
    dawn:  ['#3a4a6a', '#a08aa0', '#e8b48a']
  };

  // ------------------------------------------------------------------ elementi comuni
  function sky(g, w, h, light, r, moon) {
    var c = SKY[light] || SKY.night, gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, c[0]); gr.addColorStop(0.6, c[1]); gr.addColorStop(1, c[2]);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    if (light === 'night') for (var i = 0; i < w / 6; i++) { g.fillStyle = 'rgba(220,225,255,' + (0.15 + r() * 0.5) + ')'; g.fillRect(Math.floor(r() * w), Math.floor(r() * h * 0.6), 1, 1); }
    if (moon) { g.fillStyle = light === 'dawn' ? 'rgba(255,240,220,0.5)' : '#e8e4d0'; g.beginPath(); g.arc(moon, 26, 9, 0, Math.PI * 2); g.fill(); }
  }
  function skyline(g, w, base, light, r, tall) {
    var x = 0, col = light === 'dawn' ? '#4a4e66' : light === 'dusk' ? '#2a2236' : '#0b0f1c';
    while (x < w) {
      var bw = 12 + Math.floor(r() * 30), bh = 20 + Math.floor(r() * (tall || 70));
      g.fillStyle = col; g.fillRect(x, base - bh, bw, bh + 4);
      for (var wy = base - bh + 4; wy < base - 4; wy += 5) for (var wx = x + 2; wx < x + bw - 2; wx += 4) if (r() < (light === 'dawn' ? 0.04 : 0.16)) { g.fillStyle = 'rgba(255,200,120,' + (0.4 + r() * 0.4) + ')'; g.fillRect(wx, wy, 1, 2); }
      x += bw + Math.floor(r() * 4);
    }
  }
  function streetlamp(g, x, base, h, light) {
    g.fillStyle = '#14161a'; g.fillRect(x, base - h, 2, h); g.fillRect(x - 1, base - 2, 4, 2); g.fillRect(x, base - h, 10, 2);
    g.fillStyle = light === 'dawn' ? '#c9b48a' : '#ffcf7a'; g.fillRect(x + 8, base - h + 2, 4, 2);
    if (light !== 'dawn') { var gl = g.createRadialGradient(x + 10, base - h + 3, 1, x + 10, base - h + 3, 46); gl.addColorStop(0, 'rgba(255,170,70,0.45)'); gl.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = gl; g.fillRect(x - 40, base - h - 40, 100, 100); }
  }
  function lampPool(g, x, y, w, light) {
    if (light === 'dawn') return;
    var gl = g.createRadialGradient(x, y, 2, x, y, w); gl.addColorStop(0, 'rgba(255,160,70,0.22)'); gl.addColorStop(1, 'rgba(255,160,70,0)');
    g.save(); g.scale(1, 0.35); g.fillStyle = gl; g.fillRect(x - w, y / 0.35 - w, w * 2, w * 2); g.restore();
  }
  function graffiti(g, x, y, r, n) {
    var cols = ['#c0392b', '#e0a83a', '#3a8fc0', '#8e44ad', '#2e9e5b', '#e8e2c8'];
    for (var i = 0; i < (n || 3); i++) {
      g.strokeStyle = cols[Math.floor(r() * cols.length)]; g.lineWidth = 2; g.globalAlpha = 0.7; g.beginPath();
      var px = x + r() * 30, py = y + r() * 10; g.moveTo(px, py);
      for (var k = 0; k < 5; k++) { px += 4 + r() * 8; py += (r() - 0.5) * 14; g.lineTo(px, py); }
      g.stroke(); g.globalAlpha = 1;
    }
  }
  function brick(g, x, y, w, h, base, r) {
    g.fillStyle = base; g.fillRect(x, y, w, h);
    for (var by = y; by < y + h; by += 4) for (var bx = x + ((by / 4) % 2) * 4; bx < x + w; bx += 8) { g.fillStyle = shade(base, 0.8 + r() * 0.35); g.fillRect(bx, by, 7, 3); }
  }
  function wetFloor(g, w, top, h, base, r, light, lamps) {
    var gr = g.createLinearGradient(0, top, 0, top + h); gr.addColorStop(0, shade(base, 0.8)); gr.addColorStop(1, shade(base, 1.15));
    g.fillStyle = gr; g.fillRect(0, top, w, h);
    // giunti in prospettiva e pozzanghere che riflettono le luci
    g.fillStyle = 'rgba(0,0,0,0.18)';
    for (var y = top + 6, k = 0; y < top + h; y += 6 + k, k++) g.fillRect(0, y, w, 1);
    for (var i = 0; i < w / 40; i++) { var px = r() * w, py = top + 8 + r() * (h - 12), pw = 8 + r() * 26; g.fillStyle = 'rgba(120,140,170,0.12)'; g.fillRect(px, py, pw, 2); }
    (lamps || []).forEach(function (lx) { if (light === 'dawn') return; for (var s = 0; s < 6; s++) { g.fillStyle = 'rgba(255,170,80,' + (0.18 - s * 0.025) + ')'; g.fillRect(lx + 6 + (r() - 0.5) * 6, top + 4 + s * 8, 6 - s * 0.6, 4); } });
  }

  // ------------------------------------------------------------------ ambienti (coordinate a metà risoluzione: 640×360 per schermo)
  var ENV = {};

  ENV.street = function (g, w, ft, light, r, opt) {
    sky(g, w, ft, light, r, 0); skyline(g, w, 70, light, r, 50);
    var x = 0, wallTop = 30;
    while (x < w) {
      var bw = 90 + Math.floor(r() * 70), top = wallTop + Math.floor(r() * 30), col = ['#4a2a22', '#3a2a26', '#4e3428', '#2e2a30', '#46302a'][Math.floor(r() * 5)];
      brick(g, x, top, bw, ft - top, col, r);
      g.fillStyle = shade(col, 0.6); g.fillRect(x, top, bw, 3); g.fillRect(x + bw - 2, top, 2, ft - top);
      // finestre
      for (var wy = top + 10; wy < ft - 70; wy += 24) for (var wx = x + 8; wx < x + bw - 14; wx += 20) {
        var lit = r() < (light === 'dawn' ? 0.1 : 0.32);
        g.fillStyle = '#0d0f14'; g.fillRect(wx, wy, 10, 14);
        if (lit) { g.fillStyle = r() < 0.5 ? '#e8b25a' : '#d8c890'; g.fillRect(wx + 1, wy + 1, 8, 12); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(wx + 1, wy + 7, 8, 1); }
        g.fillStyle = shade(col, 0.55); g.fillRect(wx - 1, wy + 14, 12, 2);
      }
      // scala antincendio
      if (r() < 0.6) { var fx = x + 10 + Math.floor(r() * (bw - 50)); g.strokeStyle = '#121418'; g.lineWidth = 1; for (var fy = top + 30; fy < ft - 70; fy += 24) { g.strokeRect(fx, fy, 34, 1); g.beginPath(); g.moveTo(fx + 2, fy); g.lineTo(fx + 30, fy + 22); g.stroke(); } }
      // negozio o portone al piano terra
      var sh = ft - 60;
      if (r() < 0.55) { g.fillStyle = '#2a2c30'; g.fillRect(x + 6, sh, bw - 12, 58); for (var gy = sh + 2; gy < sh + 56; gy += 3) { g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(x + 6, gy, bw - 12, 1); } graffiti(g, x + 10, sh + 20, r, 3); g.fillStyle = shade(col, 0.5); g.fillRect(x + 4, sh - 8, bw - 8, 8); }
      else { g.fillStyle = '#1a1410'; g.fillRect(x + bw / 2 - 12, sh + 6, 24, 52); g.fillStyle = 'rgba(255,190,110,0.25)'; g.fillRect(x + bw / 2 - 10, sh + 8, 20, 10); g.fillStyle = shade(col, 0.5); g.fillRect(x + bw / 2 - 16, ft - 4, 32, 4); }
      x += bw;
    }
    var lamps = []; for (var lx = 120; lx < w; lx += 300) { streetlamp(g, lx, ft + 6, 120, light); lamps.push(lx); }
    // marciapiede e strada
    g.fillStyle = '#4a4a4e'; g.fillRect(0, ft, w, 12); g.fillStyle = '#2a2a2e'; g.fillRect(0, ft + 12, w, 2);
    wetFloor(g, w, ft + 14, 360 - ft - 14, '#26272c', r, light, lamps);
    for (var tb = 0; tb < w / 160; tb++) { var bx = r() * w; g.fillStyle = '#121212'; g.beginPath(); g.ellipse(bx, ft + 6, 7, 5, 0, 0, Math.PI * 2); g.fill(); }
    if (opt.gate) { var gx = w - 70; g.strokeStyle = 'rgba(180,190,200,0.6)'; for (var cx = gx; cx < gx + 60; cx += 4) { g.beginPath(); g.moveTo(cx, ft - 90); g.lineTo(cx + 8, ft); g.stroke(); g.beginPath(); g.moveTo(cx + 8, ft - 90); g.lineTo(cx, ft); g.stroke(); } g.fillStyle = '#2a2e33'; g.fillRect(gx - 2, ft - 92, 64, 3); }
  };

  ENV.alley = function (g, w, ft, light, r, opt) {
    g.fillStyle = '#07080c'; g.fillRect(0, 0, w, ft);
    brick(g, 0, 10, w, ft - 10, '#3a2622', r);
    for (var x = 30; x < w; x += 140 + Math.floor(r() * 60)) {
      g.fillStyle = '#16181c'; g.fillRect(x, ft - 64, 36, 64); g.fillStyle = 'rgba(255,190,110,0.18)'; g.fillRect(x + 4, ft - 60, 28, 8);
      g.strokeStyle = '#101216'; for (var fy = 30; fy < ft - 80; fy += 26) { g.strokeRect(x - 10, fy, 56, 1); g.beginPath(); g.moveTo(x - 8, fy); g.lineTo(x + 40, fy + 24); g.stroke(); }
      graffiti(g, x + 50, ft - 40, r, 4);
      // cassonetto
      if (r() < 0.6) { var dx = x + 60; g.fillStyle = '#23402e'; g.fillRect(dx, ft - 26, 44, 26); g.fillStyle = '#1a3022'; g.fillRect(dx - 2, ft - 30, 48, 5); }
    }
    var lamps = []; for (var lx = 200; lx < w; lx += 360) { g.fillStyle = '#ffcf7a'; g.fillRect(lx, 40, 6, 3); lamps.push(lx); var gl = g.createRadialGradient(lx + 3, 42, 1, lx + 3, 42, 60); gl.addColorStop(0, 'rgba(255,170,70,0.35)'); gl.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = gl; g.fillRect(lx - 60, 0, 126, 120); }
    wetFloor(g, w, ft, 360 - ft, '#222327', r, light, lamps);
    if (opt.gate) ENV.street.gateOnly(g, w, ft);
  };
  ENV.street.gateOnly = function (g, w, ft) { var gx = w - 70; g.strokeStyle = 'rgba(180,190,200,0.6)'; g.lineWidth = 1; for (var cx = gx; cx < gx + 60; cx += 4) { g.beginPath(); g.moveTo(cx, ft - 100); g.lineTo(cx + 8, ft); g.stroke(); g.beginPath(); g.moveTo(cx + 8, ft - 100); g.lineTo(cx, ft); g.stroke(); } g.fillStyle = '#2a2e33'; g.fillRect(gx - 2, ft - 102, 64, 3); g.fillRect(gx - 2, ft - 102, 3, 102); g.fillRect(gx + 60, ft - 102, 3, 102); };

  ENV.courtyard = function (g, w, ft, light, r) {
    sky(g, w, ft, light, r, 0); skyline(g, w, ft - 70, light, r, 60);
    brick(g, 0, ft - 70, w, 70, '#3e2a24', r);
    g.fillStyle = '#2a1c18'; g.fillRect(0, ft - 72, w, 4);
    g.strokeStyle = 'rgba(160,170,180,0.45)'; g.lineWidth = 1;
    for (var x = 0; x < w; x += 5) { g.beginPath(); g.moveTo(x, ft - 120); g.lineTo(x + 10, ft - 72); g.stroke(); }
    g.fillStyle = '#20242a'; for (var p = 0; p < w; p += 120) g.fillRect(p, ft - 124, 3, 54);
    for (var i = 0; i < w / 260; i++) graffiti(g, 40 + i * 260 + r() * 60, ft - 50, r, 4);
    // auto bruciata
    var cx = Math.floor(w * 0.45); g.fillStyle = '#1a1614'; g.fillRect(cx, ft - 24, 70, 18); g.fillRect(cx + 12, ft - 36, 44, 14); g.fillStyle = '#0a0a0a'; g.beginPath(); g.arc(cx + 14, ft - 4, 6, 0, Math.PI * 2); g.arc(cx + 56, ft - 4, 6, 0, Math.PI * 2); g.fill();
    var lamps = [120, w - 200]; lamps.forEach(function (lx) { streetlamp(g, lx, ft + 4, 110, light); });
    wetFloor(g, w, ft, 360 - ft, '#2a2826', r, light, lamps);
  };

  ENV.platform = function (g, w, ft, light, r, opt) {
    // soffitto, travi, muro di piastrelle con fascia e cartello della stazione, pilastri
    g.fillStyle = '#101214'; g.fillRect(0, 0, w, 40);
    for (var bx = 0; bx < w; bx += 40) { g.fillStyle = '#181b1e'; g.fillRect(bx, 30, 38, 6); }
    var tileTop = 40, wallBase = ft;
    g.fillStyle = '#c8c0a8'; g.fillRect(0, tileTop, w, wallBase - tileTop);
    for (var ty = tileTop; ty < wallBase; ty += 4) for (var tx = 0; tx < w; tx += 6) { g.fillStyle = 'rgba(0,0,0,' + (0.04 + r() * 0.08) + ')'; g.fillRect(tx, ty, 6, 1); g.fillRect(tx, ty, 1, 4); }
    var band = tileTop + Math.floor((wallBase - tileTop) * 0.38);
    g.fillStyle = '#5a3a2a'; g.fillRect(0, band, w, 10); g.fillStyle = '#8a6a3a'; g.fillRect(0, band + 2, w, 2);
    g.fillStyle = 'rgba(40,30,20,0.35)'; g.fillRect(0, wallBase - 40, w, 40);
    for (var gx = 0; gx < w; gx += 70) if (r() < 0.6) graffiti(g, gx, wallBase - 36, r, 5);
    // cartelli della stazione
    var sign = opt.sign || '';
    if (sign) for (var sx = 160; sx < w; sx += 480) {
      g.fillStyle = '#1a1a1e'; g.fillRect(sx - 4, band - 30, 118, 22); g.fillStyle = '#e8e2c8'; g.fillRect(sx - 2, band - 28, 114, 18);
      g.fillStyle = '#1a1a1e'; g.font = 'bold 12px monospace'; g.textAlign = 'center'; g.fillText(sign, sx + 55, band - 15);
    }
    // manifesti
    for (var px = 300; px < w; px += 480) { g.fillStyle = '#3a4a6a'; g.fillRect(px, band + 20, 40, 54); g.fillStyle = '#c0392b'; g.fillRect(px + 4, band + 24, 32, 14); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(px + 4, band + 44, 30, 2); g.fillRect(px + 4, band + 50, 22, 2); }
    // pilastri d'acciaio con rivetti
    for (var cx = 60; cx < w; cx += 150) {
      g.fillStyle = '#1e2a24'; g.fillRect(cx, 30, 14, ft - 30 + 6); g.fillStyle = '#2c3a32'; g.fillRect(cx + 2, 30, 3, ft - 24);
      for (var ry = 50; ry < ft; ry += 12) { g.fillStyle = '#121a16'; g.fillRect(cx + 9, ry, 2, 2); }
    }
    // luci al neon
    for (var lx = 30; lx < w; lx += 110) { g.fillStyle = '#eaf2e0'; g.fillRect(lx, 41, 40, 2); var gl = g.createLinearGradient(0, 42, 0, 120); gl.addColorStop(0, 'rgba(220,240,210,0.18)'); gl.addColorStop(1, 'rgba(220,240,210,0)'); g.fillStyle = gl; g.fillRect(lx - 20, 42, 80, 80); }
    // panchine e cestini contro il muro
    for (var bb = 250; bb < w; bb += 420) { g.fillStyle = '#3a2a1a'; g.fillRect(bb, ft - 14, 50, 4); g.fillRect(bb + 2, ft - 10, 3, 10); g.fillRect(bb + 45, ft - 10, 3, 10); g.fillStyle = '#2a2e33'; g.fillRect(bb + 70, ft - 16, 12, 16); }
    if (opt.stairs) { var st = Math.floor(w * 0.72); for (var k = 0; k < 10; k++) { g.fillStyle = shade('#4a4a50', 0.7 + k * 0.03); g.fillRect(st + k * 6, ft - k * 8, 60, 8); } g.fillStyle = '#1a1a1e'; g.fillRect(st + 58, ft - 90, 3, 90); }
    // pavimento della banchina con bordo giallo
    g.fillStyle = '#5a5850'; g.fillRect(0, ft, w, 360 - ft);
    for (var fy = ft + 6; fy < 360; fy += 8) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, fy, w, 1); }
    for (var sp = 0; sp < w / 20; sp++) { g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(r() * w, ft + 4 + r() * (360 - ft - 8), 2 + r() * 5, 1); }
  };

  ENV.underpass = function (g, w, ft, light, r, opt) {
    ENV.platform(g, w, ft, light, r, opt);
    // scala che sale verso l'uscita alla fine
    var st = w - 90; for (var k = 0; k < 12; k++) { g.fillStyle = shade('#55524a', 0.7 + k * 0.025); g.fillRect(st + k * 4, ft - k * 9, 90, 9); }
    g.fillStyle = 'rgba(255,220,150,0.25)'; g.fillRect(st + 40, 40, 50, ft - 140);
  };

  ENV.tunnel = function (g, w, ft, light, r) {
    g.fillStyle = '#050607'; g.fillRect(0, 0, w, ft);
    for (var ax = 0; ax < w; ax += 120) {
      g.strokeStyle = '#1c1e20'; g.lineWidth = 6; g.beginPath(); g.arc(ax + 60, ft + 40, 150, Math.PI, 0); g.stroke();
      g.fillStyle = '#121416'; g.fillRect(ax, 60, 8, ft - 60);
    }
    brick(g, 0, ft - 50, w, 50, '#1e1a18', r);
    for (var lx = 80; lx < w; lx += 260) { g.fillStyle = '#e8b25a'; g.fillRect(lx, ft - 120, 4, 4); var gl = g.createRadialGradient(lx + 2, ft - 118, 1, lx + 2, ft - 118, 70); gl.addColorStop(0, 'rgba(255,170,70,0.4)'); gl.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = gl; g.fillRect(lx - 70, ft - 190, 144, 144); }
    for (var cx = 30; cx < w; cx += 90) { g.strokeStyle = '#2a1e14'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, ft - 46); g.lineTo(cx + 60, ft - 46); g.stroke(); }
    g.fillStyle = '#1c1c1e'; g.fillRect(0, ft, w, 360 - ft);
    for (var t = ft + 4; t < 360; t += 7) { g.fillStyle = '#2a241e'; for (var sx = 0; sx < w; sx += 14) g.fillRect(sx, t, 10, 2); }
    g.fillStyle = '#6a6e74'; g.fillRect(0, ft + 20, w, 2); g.fillRect(0, ft + 44, w, 2);
  };

  ENV.park = function (g, w, ft, light, r, opt) {
    sky(g, w, ft, light, r, opt.moon ? 140 : 0);
    if (opt.river) { skyline(g, w, ft - 70, light, r, 60); g.fillStyle = '#0a1424'; g.fillRect(0, ft - 70, w, 26); for (var i = 0; i < w / 5; i++) { g.fillStyle = 'rgba(255,200,120,' + r() * 0.3 + ')'; g.fillRect(r() * w, ft - 68 + r() * 22, 3, 1); } }
    else skyline(g, w, ft - 60, light, r, 40);
    // alberi: tronchi e chiome scure
    for (var tx = 0; tx < w; tx += 70 + Math.floor(r() * 50)) {
      var th = 110 + r() * 60, tw = 6 + r() * 5;
      g.fillStyle = '#0e1410'; g.fillRect(tx, ft - th * 0.6, tw, th * 0.6);
      for (var b = 0; b < 7; b++) { g.fillStyle = b % 2 ? '#122016' : '#18291c'; g.beginPath(); g.arc(tx + tw / 2 + (r() - 0.5) * 60, ft - th * (0.55 + r() * 0.45), 18 + r() * 20, 0, Math.PI * 2); g.fill(); }
      if (light !== 'night') { g.fillStyle = 'rgba(200,140,70,0.08)'; g.beginPath(); g.arc(tx, ft - th * 0.8, 20, 0, Math.PI * 2); g.fill(); }
    }
    // siepe, ringhiera di ferro, panchine e lampioni
    g.fillStyle = '#0f1c14'; g.fillRect(0, ft - 26, w, 26);
    for (var hx = 0; hx < w; hx += 12) { g.beginPath(); g.arc(hx, ft - 26, 8 + r() * 4, Math.PI, 0); g.fill(); }
    g.fillStyle = '#121418'; g.fillRect(0, ft - 38, w, 2); for (var fx = 0; fx < w; fx += 6) g.fillRect(fx, ft - 40, 1, 14);
    var lamps = []; for (var lx = 100; lx < w; lx += 320) { streetlamp(g, lx, ft + 4, 105, light); lamps.push(lx); }
    for (var bx = 220; bx < w; bx += 380) { g.fillStyle = '#1e2a22'; g.fillRect(bx, ft - 14, 54, 3); g.fillRect(bx, ft - 22, 54, 3); g.fillRect(bx + 2, ft - 22, 2, 22); g.fillRect(bx + 50, ft - 22, 2, 22); }
    // vialetto
    wetFloor(g, w, ft, 360 - ft, '#2e2e30', r, light, lamps);
    g.fillStyle = '#16231b'; g.fillRect(0, 352, w, 8);
  };


  // il cimitero di Woodlawn: lapidi, croci, obelischi e una cappella, cancellata di ferro, nebbia bassa
  ENV.cemetery = function (g, w, ft, light, r, opt) {
    sky(g, w, ft, light, r, 180);
    skyline(g, w, ft - 64, light, r, 30);
    // alberi spogli in controluce
    for (var tx = 30; tx < w; tx += 110 + Math.floor(r() * 70)) {
      var th = 90 + r() * 50; g.strokeStyle = '#0b0e10'; g.lineWidth = 4; g.beginPath(); g.moveTo(tx, ft); g.lineTo(tx, ft - th); g.stroke();
      g.lineWidth = 2; for (var b = 0; b < 6; b++) { var by = ft - th * (0.45 + r() * 0.5), dir = r() < 0.5 ? -1 : 1; g.beginPath(); g.moveTo(tx, by); g.lineTo(tx + dir * (14 + r() * 26), by - 10 - r() * 20); g.stroke(); }
    }
    // cappella con colonne
    var mx = Math.floor(w * 0.62); g.fillStyle = '#1a1c22'; g.fillRect(mx, ft - 70, 90, 70); g.beginPath(); g.moveTo(mx - 8, ft - 70); g.lineTo(mx + 45, ft - 96); g.lineTo(mx + 98, ft - 70); g.fill();
    g.fillStyle = '#25272e'; for (var c = 0; c < 4; c++) g.fillRect(mx + 8 + c * 22, ft - 64, 6, 64); g.fillStyle = '#0a0b0e'; g.fillRect(mx + 34, ft - 40, 22, 40);
    // file di lapidi, croci e obelischi su tre piani
    for (var row = 0; row < 3; row++) {
      var y0 = ft - 30 + row * 12, sc = 0.7 + row * 0.18, col = shade('#4a4e58', 0.6 + row * 0.2);
      for (var gx = 10 + row * 17; gx < w; gx += 34 + Math.floor(r() * 26)) {
        if (gx > mx - 10 && gx < mx + 100 && row === 0) continue;
        var kind = r(); g.fillStyle = col;
        if (kind < 0.55) { var hw = 10 * sc, hh = (14 + r() * 8) * sc; g.fillRect(gx, y0 - hh, hw, hh); g.beginPath(); g.arc(gx + hw / 2, y0 - hh, hw / 2, Math.PI, 0); g.fill(); }
        else if (kind < 0.8) { g.fillRect(gx + 4 * sc, y0 - 24 * sc, 3 * sc, 24 * sc); g.fillRect(gx, y0 - 18 * sc, 11 * sc, 3 * sc); }
        else { g.beginPath(); g.moveTo(gx, y0); g.lineTo(gx + 3 * sc, y0 - 34 * sc); g.lineTo(gx + 6 * sc, y0 - 38 * sc); g.lineTo(gx + 9 * sc, y0 - 34 * sc); g.lineTo(gx + 12 * sc, y0); g.fill(); }
      }
    }
    // cancellata di ferro con punte
    g.fillStyle = '#0d0f12'; g.fillRect(0, ft - 6, w, 2); for (var fx = 0; fx < w; fx += 5) { g.fillRect(fx, ft - 22, 1, 20); g.fillRect(fx - 1, ft - 23, 3, 1); }
    // nebbia
    var fg = g.createLinearGradient(0, ft - 30, 0, ft + 10); fg.addColorStop(0, 'rgba(150,160,180,0)'); fg.addColorStop(1, 'rgba(150,160,180,0.22)'); g.fillStyle = fg; g.fillRect(0, ft - 30, w, 40);
    // erba e vialetto di ghiaia
    g.fillStyle = '#121a14'; g.fillRect(0, ft, w, 360 - ft);
    for (var i = 0; i < w * 2; i++) { g.fillStyle = r() < 0.5 ? '#18231a' : '#0e150f'; g.fillRect(Math.floor(r() * w), ft + Math.floor(r() * (360 - ft)), 2, 1); }
    g.fillStyle = '#2a2a2c'; g.fillRect(0, ft + Math.floor((360 - ft) * 0.35), w, Math.floor((360 - ft) * 0.4));
    for (var k = 0; k < w; k++) { g.fillStyle = 'rgba(200,200,210,' + (r() * 0.08) + ')'; g.fillRect(Math.floor(r() * w), ft + Math.floor((360 - ft) * (0.35 + r() * 0.4)), 1, 1); }
  };

  ENV.rally = function (g, w, ft, light, r) {
    ENV.park(g, w, ft, light, r, { moon: true });
    // palco con fari e la grande folla sullo sfondo
    var sx = Math.floor(w * 0.55);
    g.fillStyle = '#1a1612'; g.fillRect(sx, ft - 54, 160, 54); g.fillStyle = '#2a2018'; g.fillRect(sx - 6, ft - 58, 172, 6);
    for (var k = 0; k < 4; k++) { var lx = sx + 20 + k * 40, gl = g.createLinearGradient(lx, ft - 160, lx, ft - 50); gl.addColorStop(0, 'rgba(255,240,200,0.0)'); gl.addColorStop(1, 'rgba(255,240,200,0.18)'); g.fillStyle = gl; g.beginPath(); g.moveTo(lx, ft - 160); g.lineTo(lx - 30, ft - 54); g.lineTo(lx + 30, ft - 54); g.fill(); }
    for (var c = 0; c < w / 4; c++) { var cx = r() * w; if (cx > sx - 10 && cx < sx + 170) continue; g.fillStyle = ['#151820', '#1c1a22', '#201418', '#141c18'][Math.floor(r() * 4)]; g.fillRect(cx, ft - 16 - r() * 14, 4, 22); g.beginPath(); g.arc(cx + 2, ft - 18 - r() * 14, 2.5, 0, Math.PI * 2); g.fill(); }
  };

  ENV.bathroom = function (g, w, ft, light, r) {
    g.fillStyle = '#d6dccf'; g.fillRect(0, 0, w, ft);
    for (var ty = 0; ty < ft; ty += 6) for (var tx = 0; tx < w; tx += 6) { g.fillStyle = 'rgba(0,0,0,' + (0.03 + r() * 0.07) + ')'; g.fillRect(tx, ty, 6, 1); g.fillRect(tx, ty, 1, 6); }
    g.fillStyle = '#3a6a5a'; g.fillRect(0, ft - 60, w, 6); g.fillStyle = 'rgba(60,70,50,0.25)'; g.fillRect(0, ft - 54, w, 54);
    for (var sx = 0; sx < w; sx += 3) { if (r() < 0.12) { g.fillStyle = 'rgba(80,70,40,0.25)'; g.fillRect(sx, ft - 54 + r() * 40, 1, 6 + r() * 20); } }
    // specchi e lavandini, orinatoi
    for (var mx = 40; mx < w; mx += 200) {
      g.fillStyle = '#5a6a70'; g.fillRect(mx, ft - 130, 60, 44); g.fillStyle = 'rgba(200,220,230,0.35)'; g.fillRect(mx + 3, ft - 127, 54, 38); g.strokeStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.moveTo(mx + 10, ft - 120); g.lineTo(mx + 40, ft - 95); g.stroke();
      g.fillStyle = '#e8e8e0'; g.fillRect(mx + 6, ft - 72, 48, 10); g.fillStyle = '#9aa0a0'; g.fillRect(mx + 26, ft - 62, 6, 30);
      graffiti(g, mx + 70, ft - 120, r, 4);
    }
    for (var lx = 60; lx < w; lx += 150) { g.fillStyle = '#f0f8f0'; g.fillRect(lx, 4, 50, 3); }
    g.fillStyle = '#7a8070'; g.fillRect(0, ft, w, 360 - ft);
    for (var fy = ft; fy < 360; fy += 10) for (var fx = ((fy - ft) / 10 % 2) * 10; fx < w; fx += 20) { g.fillStyle = '#5a6054'; g.fillRect(fx, fy, 10, 10); }
    g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(0, ft, w, 8);
  };

  ENV.apartment = function (g, w, ft, light, r) {
    g.fillStyle = '#3a2228'; g.fillRect(0, 0, w, ft);
    for (var px = 0; px < w; px += 16) for (var py = 0; py < ft; py += 16) { g.fillStyle = 'rgba(200,120,140,0.08)'; g.beginPath(); g.arc(px + 8, py + 8, 3, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#2a161a'; g.fillRect(0, ft - 24, w, 24); g.fillStyle = '#5a3a2a'; g.fillRect(0, ft - 26, w, 3);
    for (var x = 120; x < w; x += 320) {
      // finestra con la città e tende
      g.fillStyle = '#0a0e1a'; g.fillRect(x, 40, 70, 80); skylineMini(g, x, 120, r); g.fillStyle = '#6a2a3a'; g.fillRect(x - 10, 34, 18, 96); g.fillRect(x + 62, 34, 18, 96); g.fillStyle = '#2a161a'; g.fillRect(x - 2, 118, 74, 4);
      // divano e lampada
      g.fillStyle = '#5a2a3a'; g.fillRect(x + 110, ft - 36, 80, 26); g.fillStyle = '#4a2230'; g.fillRect(x + 110, ft - 50, 80, 16);
      var gl = g.createRadialGradient(x + 220, ft - 80, 2, x + 220, ft - 80, 70); gl.addColorStop(0, 'rgba(255,170,120,0.4)'); gl.addColorStop(1, 'rgba(255,170,120,0)'); g.fillStyle = gl; g.fillRect(x + 150, ft - 150, 140, 140);
      g.fillStyle = '#e8c090'; g.fillRect(x + 212, ft - 92, 16, 10); g.fillStyle = '#1a1010'; g.fillRect(x + 219, ft - 82, 2, 82);
    }
    // porta chiusa a chiave
    g.fillStyle = '#2a1810'; g.fillRect(30, ft - 110, 46, 110); g.fillStyle = '#c9a227'; g.fillRect(68, ft - 56, 4, 4);
    g.fillStyle = '#4a2e22'; g.fillRect(0, ft, w, 360 - ft); for (var fy = ft; fy < 360; fy += 7) { g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, fy, w, 1); }
    g.fillStyle = 'rgba(120,40,60,0.35)'; g.fillRect(140, ft + 20, 240, 60);
  };
  function skylineMini(g, x, base, r) { for (var i = 0; i < 6; i++) { var h = 20 + r() * 40; g.fillStyle = '#141a2a'; g.fillRect(x + i * 12, base - h, 11, h); if (r() < 0.6) { g.fillStyle = 'rgba(255,200,120,0.6)'; g.fillRect(x + i * 12 + 4, base - h + 6, 2, 2); } } }

  ENV.traincar = function (g, w, ft, light, r) {
    // vagone: finestrini con la luce dell'alba, sedili lungo la parete, maniglie, pubblicità e graffiti
    g.fillStyle = '#7a7e7a'; g.fillRect(0, 0, w, ft);
    g.fillStyle = '#5a5e5a'; g.fillRect(0, 0, w, 24);
    for (var x = 20; x < w; x += 120) {
      var gr = g.createLinearGradient(0, 40, 0, 110); gr.addColorStop(0, '#a08aa0'); gr.addColorStop(1, '#e8b48a');
      g.fillStyle = '#2a2e30'; g.fillRect(x - 3, 37, 86, 76); g.fillStyle = gr; g.fillRect(x, 40, 80, 70);
      g.fillStyle = 'rgba(40,40,60,0.5)'; for (var b = 0; b < 4; b++) g.fillRect(x + b * 22, 80 - r() * 30, 14, 40);
      g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(x + 8, 44, 4, 60);
      graffiti(g, x, 120, r, 2);
      g.fillStyle = '#c0b080'; g.fillRect(x + 10, 26, 60, 10);
    }
    for (var hx = 40; hx < w; hx += 60) { g.fillStyle = '#c0c4c0'; g.fillRect(hx, 24, 1, 14); g.beginPath(); g.arc(hx, 40, 3, 0, Math.PI * 2); g.strokeStyle = '#c0c4c0'; g.stroke(); }
    g.fillStyle = '#c87a3a'; g.fillRect(0, ft - 34, w, 14); g.fillStyle = '#a0602a'; g.fillRect(0, ft - 20, w, 20);
    for (var px = 0; px < w; px += 300) { g.fillStyle = '#d8d8d0'; g.fillRect(px + 140, 0, 4, ft); }
    g.fillStyle = '#4a4a46'; g.fillRect(0, ft, w, 360 - ft); for (var fy = ft; fy < 360; fy += 5) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, fy, w, 1); }
  };

  ENV.coney = function (g, w, ft, light, r) {
    sky(g, w, ft, light, r, 0);
    if (light === 'dawn') { g.fillStyle = '#5a7090'; g.fillRect(0, ft - 54, w, 20); }
    // la ruota e le montagne russe come sagome, chioschi chiusi
    var wx = Math.floor(w * 0.3);
    g.strokeStyle = light === 'dusk' ? '#3a2a3a' : '#1a1e2a'; g.lineWidth = 2; g.beginPath(); g.arc(wx, ft - 130, 80, 0, Math.PI * 2); g.stroke();
    for (var s = 0; s < 16; s++) { var a = s / 16 * Math.PI * 2; g.beginPath(); g.moveTo(wx, ft - 130); g.lineTo(wx + Math.cos(a) * 80, ft - 130 + Math.sin(a) * 80); g.stroke(); if (light === 'dusk') { g.fillStyle = s % 2 ? '#e8b25a' : '#e04a5a'; g.fillRect(wx + Math.cos(a) * 80 - 2, ft - 130 + Math.sin(a) * 80 - 2, 4, 4); } }
    g.beginPath(); g.moveTo(wx - 50, ft - 30); g.lineTo(wx, ft - 130); g.lineTo(wx + 50, ft - 30); g.stroke();
    g.beginPath(); var cx0 = Math.floor(w * 0.55); g.moveTo(cx0, ft - 30); for (var k = 0; k < 12; k++) g.lineTo(cx0 + k * 30, ft - 40 - Math.abs(Math.sin(k * 0.9)) * 110); g.stroke();
    for (var lt = 0; lt < 12; lt++) { g.beginPath(); g.moveTo(cx0 + lt * 30, ft - 30); g.lineTo(cx0 + lt * 30, ft - 40 - Math.abs(Math.sin(lt * 0.9)) * 110); g.stroke(); }
    for (var x = 0; x < w; x += 110) {
      var col = ['#6a2a2a', '#2a4a6a', '#6a5a2a', '#3a2a4a'][Math.floor(r() * 4)];
      g.fillStyle = col; g.fillRect(x + 6, ft - 56, 90, 56); g.fillStyle = shade(col, 1.4); for (var st = 0; st < 6; st++) g.fillRect(x + 6 + st * 15, ft - 66, 8, 10);
      g.fillStyle = '#20232a'; g.fillRect(x + 12, ft - 40, 78, 40); for (var gy = ft - 38; gy < ft; gy += 3) { g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(x + 12, gy, 78, 1); }
      graffiti(g, x + 16, ft - 22, r, 3);
      if (light === 'dusk') for (var bl = 0; bl < 9; bl++) { g.fillStyle = bl % 2 ? '#ffd36a' : '#ff8a4a'; g.fillRect(x + 8 + bl * 10, ft - 58, 2, 2); }
    }
    var lamps = []; for (var lx = 60; lx < w; lx += 280) { streetlamp(g, lx, ft + 4, 110, light); lamps.push(lx); }
    // passerella di legno
    g.fillStyle = '#5a4630'; g.fillRect(0, ft, w, 360 - ft);
    for (var bx = 0; bx < w; bx += 10) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(bx, ft, 1, 360 - ft); }
    for (var by = ft + 8; by < 360; by += 14) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, by, w, 1); }
    lamps.forEach(function (lx) { lampPool(g, lx + 10, ft + 30, 60, light); });
  };

  ENV.beach = function (g, w, ft, light, r) {
    sky(g, w, ft, 'dawn', r, 0);
    var sun = g.createRadialGradient(w * 0.6, ft - 40, 2, w * 0.6, ft - 40, 120); sun.addColorStop(0, 'rgba(255,220,160,0.8)'); sun.addColorStop(1, 'rgba(255,200,140,0)'); g.fillStyle = sun; g.fillRect(0, 0, w, ft);
    // mare, pontile, parachute jump all'orizzonte
    g.fillStyle = '#4a6a8a'; g.fillRect(0, ft - 70, w, 70);
    for (var i = 0; i < w / 3; i++) { g.fillStyle = 'rgba(255,230,190,' + r() * 0.35 + ')'; g.fillRect(r() * w, ft - 68 + r() * 66, 4 + r() * 8, 1); }
    var pj = Math.floor(w * 0.18); g.strokeStyle = '#2a2a36'; g.lineWidth = 1; for (var k = 0; k < 6; k++) { g.beginPath(); g.moveTo(pj + k * 4, ft - 70); g.lineTo(pj + 12, ft - 160); g.stroke(); } g.beginPath(); g.arc(pj + 12, ft - 162, 18, Math.PI, 0); g.stroke();
    g.fillStyle = '#3a3030'; for (var p = 0; p < w; p += 24) g.fillRect(p + Math.floor(w * 0.7) % 24, ft - 80, 3, 14);
    // sabbia
    var sd = g.createLinearGradient(0, ft, 0, 360); sd.addColorStop(0, '#a08a6a'); sd.addColorStop(1, '#c8aa80'); g.fillStyle = sd; g.fillRect(0, ft, w, 360 - ft);
    for (var s2 = 0; s2 < w; s2++) if (r() < 0.25) { g.fillStyle = 'rgba(80,60,40,0.18)'; g.fillRect(s2, ft + r() * (360 - ft), 1, 1); }
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(0, ft, w, 2);
  };

  // ------------------------------------------------------------------ scelta e cache
  function envFor(def) {
    if (def.env) return def.env;
    var id = def.id;
    if (id === 'C1-01' || id === 'C1-02') return 'rally';
    if (id === 'C1-04') return 'cemetery';
    if (id === 'C2-02') return 'alley';
    if (id === 'C5-02' || id === 'C5-03') return 'apartment';
    if (id === 'C5-04') return 'tunnel';
    if (id === 'C6-02' || id === 'C6-03') return 'bathroom';
    if (id === 'C7-01') return 'traincar';
    if (id === 'C8-03' || id === 'C8-04') return 'beach';
    if (id === 'P0-04' || id === 'C7-02') return 'platform';
    return ENV_BY_BG[def.bg] || 'street';
  }
  function build(area) {
    var def = area.def, key = def.id;
    if (cache[key]) return cache[key];
    var env = envFor(def), light = def.light || 'night', ft = Math.round(area.floor[0] / 2) - 2;
    var w = Math.ceil(Math.max(area.width, 1280) / 2) + 2, c = document.createElement('canvas');
    c.width = w; c.height = 360;
    var g = c.getContext('2d'), r = rng(key);
    var opt = { sign: SIGNS[def.id] || (env === 'platform' ? '' : ''), river: /^C4|^C5-01/.test(def.id), moon: true, gate: def.id === 'C2-02', stairs: def.bg === 'metro_b' };
    (ENV[env] || ENV.street)(g, w, ft, light, r, opt);
    // ambienti molto bui: una luce d'ambiente leggera perché si leggano forme e profondità
    if (['alley', 'courtyard', 'park', 'rally', 'apartment', 'tunnel'].indexOf(env) >= 0) { g.globalCompositeOperation = 'screen'; g.fillStyle = 'rgba(60,66,84,0.55)'; g.fillRect(0, 0, w, 360); g.globalCompositeOperation = 'source-over'; }
    cache[key] = { canvas: c, env: env };
    return cache[key];
  }
  return {
    draw: function (ctx, area, camX) {
      var b = build(area);
      ctx.save(); ctx.imageSmoothingEnabled = false;
      ctx.drawImage(b.canvas, Math.floor(camX / 2), 0, 641, 360, 0, 0, 1282, 720);
      ctx.restore();
    },
    envFor: envFor,
    clear: function () { cache = {}; }
  };
})();
