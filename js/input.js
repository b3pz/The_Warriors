// Input astratto: tastiera (layout singolo o due giocatori) e controller.
// Ogni pressione viene registrata con l'istante; le azioni restano nel buffer per W.CFG.BUFFER.
'use strict';
var W = window.W;

W.Input = (function () {
  var ACTIONS = ['light', 'heavy', 'jump', 'dodge', 'interact', 'fury', 'throw'];
  var LAYOUTS = {
    solo: {
      up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
      light: ['KeyJ'], heavy: ['KeyK'], jump: ['Space'], dodge: ['ShiftLeft', 'ShiftRight'], interact: ['KeyE'], fury: ['KeyL'], throw: ['KeyQ']
    },
    p1: {
      up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'],
      light: ['KeyF'], heavy: ['KeyG'], jump: ['Space'], dodge: ['ShiftLeft'], interact: ['KeyR'], fury: ['KeyT'], throw: ['KeyV']
    },
    p2: {
      up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'],
      light: ['Numpad1'], heavy: ['Numpad2'], jump: ['Numpad0'], dodge: ['ControlRight'], interact: ['Numpad3'], fury: ['Numpad4'], throw: ['Numpad5']
    }
  };
  // Controller standard: X=2 Y=3 A=0 B=1 LB=4 RB=5 RT=7 Start=9
  var PAD = { light: 2, heavy: 3, jump: 0, dodge: 5, interact: 1, fury: 4, throw: 7 };

  var down = {};            // code -> true
  var pressedAt = {};       // code -> time of last keydown
  var now = 0;
  var listeners = [];

  function Device(layoutName, padIndex) {
    this.layout = layoutName; this.pad = padIndex; // pad: null o indice gamepad
    this.buf = {}; this.lastDirTap = { dir: 0, t: -9 }; this.runIntent = false;
    this.prevPad = {}; this.prevDirX = 0;
    this.held = {}; this.edge = {};
    // ignora le pressioni avvenute prima della creazione (es. Invio/J del menu)
    for (var i = 0; i < ACTIONS.length; i++) this.buf['_seen_' + ACTIONS[i]] = now;
  }
  Device.prototype.keys = function (a) { return this.layout ? LAYOUTS[this.layout][a] : []; };
  Device.prototype.isDown = function (a) {
    var ks = this.keys(a);
    for (var i = 0; i < ks.length; i++) if (down[ks[i]]) return true;
    if ((this.layout === 'solo' || this.layout === 'p1') && W.Touch && W.Touch.held[a]) return true;
    return !!this.held[a];
  };
  Device.prototype.poll = function () {
    // controller
    this.held = {}; this.edge = {};
    var ax = 0, ay = 0;
    if (this.pad !== null && navigator.getGamepads) {
      var gp = navigator.getGamepads()[this.pad];
      if (gp) {
        ax = gp.axes[0] || 0; ay = gp.axes[1] || 0;
        if (gp.buttons[14] && gp.buttons[14].pressed) ax = -1;
        if (gp.buttons[15] && gp.buttons[15].pressed) ax = 1;
        if (gp.buttons[12] && gp.buttons[12].pressed) ay = -1;
        if (gp.buttons[13] && gp.buttons[13].pressed) ay = 1;
        for (var a in PAD) {
          var b = gp.buttons[PAD[a]]; var p = !!(b && (b.pressed || b.value > 0.5));
          this.held[a] = p;
          if (p && !this.prevPad[a]) this.buf[a] = now;
          this.prevPad[a] = p;
        }
        var st = gp.buttons[9] && gp.buttons[9].pressed;
        if (st && !this.prevPad.start) this.edge.pause = true;
        this.prevPad.start = st;
      }
    }
    if (Math.abs(ax) > 0.35) this.held[ax < 0 ? 'left' : 'right'] = true;
    if (Math.abs(ay) > 0.35) this.held[ay < 0 ? 'up' : 'down'] = true;
    // keyboard action edges
    for (var i = 0; i < ACTIONS.length; i++) {
      var act = ACTIONS[i], ks = this.keys(act);
      for (var k = 0; k < ks.length; k++) {
        if (pressedAt[ks[k]] !== undefined && pressedAt[ks[k]] > (this.buf['_seen_' + act] || -1)) {
          this.buf[act] = pressedAt[ks[k]]; this.buf['_seen_' + act] = pressedAt[ks[k]];
        }
      }
    }
    // tasti touch: ogni pressione entra nel buffer come un tasto della tastiera
    if ((this.layout === 'solo' || this.layout === 'p1') && W.Touch) {
      for (var ti = 0; ti < ACTIONS.length; ti++) { var ta = ACTIONS[ti], tp = W.Touch.pressed[ta]; if (tp !== undefined && tp > (this.buf['_seen_t_' + ta] || -1)) { this.buf[ta] = tp; this.buf['_seen_t_' + ta] = tp; } }
    }
    // doppio tocco orizzontale = corsa
    var dx = this.axisX();
    if (dx !== 0 && this.prevDirX === 0) {
      if (this.lastDirTap.dir === dx && now - this.lastDirTap.t < 0.25) this.runIntent = true;
      this.lastDirTap = { dir: dx, t: now };
    }
    if (this.prevDirX !== 0 && dx !== this.prevDirX) this.runIntent = false;
    if ((this.layout === 'solo' || this.layout === 'p1') && W.Touch && W.Touch.run()) this.runIntent = true;
    this.prevDirX = dx;
  };
  Device.prototype.axisX = function () { return (this.isDown('right') ? 1 : 0) - (this.isDown('left') ? 1 : 0); };
  Device.prototype.axisY = function () { return (this.isDown('down') ? 1 : 0) - (this.isDown('up') ? 1 : 0); };
  // consuma un'azione se premuta negli ultimi BUFFER secondi
  Device.prototype.take = function (a) {
    var t = this.buf[a];
    if (t !== undefined && t !== null && now - t <= W.CFG.BUFFER) { this.buf[a] = null; return true; }
    return false;
  };
  Device.prototype.peek = function (a) { var t = this.buf[a]; return t !== undefined && t !== null && now - t <= W.CFG.BUFFER; };
  Device.prototype.clear = function () { for (var i = 0; i < ACTIONS.length; i++) this.buf[ACTIONS[i]] = null; };

  window.addEventListener('keydown', function (e) {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].indexOf(e.code) >= 0) e.preventDefault();
    if (!down[e.code]) pressedAt[e.code] = now;
    down[e.code] = true;
    for (var i = 0; i < listeners.length; i++) listeners[i](e.code);
  });
  window.addEventListener('keyup', function (e) { down[e.code] = false; });
  window.addEventListener('blur', function () { down = {}; });

  return {
    Device: Device,
    LAYOUTS: LAYOUTS,
    setTime: function (t) { now = t; },
    time: function () { return now; },
    onKey: function (fn) { listeners.push(fn); },
    isDown: function (code) { return !!down[code]; },
    // per i test automatici
    _press: function (code) { if (!down[code]) pressedAt[code] = now; down[code] = true; for (var i = 0; i < listeners.length; i++) listeners[i](code); },
    _release: function (code) { down[code] = false; }
  };
})();

// ------------------------------------------------------------------ comandi touch (telefono e tablet)
// Joystick a sinistra, tasti a destra, pausa in alto. Le coordinate sono quelle logiche 1280×720 del gioco.
W.Touch = (function () {
  var active = false, held = {}, pressed = {}, stick = null, canvas = null, run = false, lastNav = 0, navDir = 0;
  var BTN = [
    { a: 'light', x: 1150, y: 600, r: 62, label: 'COLPO' },
    { a: 'heavy', x: 1028, y: 652, r: 48, label: 'FORTE' },
    { a: 'jump', x: 1180, y: 470, r: 48, label: 'SALTO' },
    { a: 'dodge', x: 1050, y: 528, r: 42, label: 'SCHIVA' },
    { a: 'interact', x: 912, y: 616, r: 46, label: 'AZIONE' },
    { a: 'fury', x: 932, y: 500, r: 38, label: 'FURIA' },
    { a: 'throw', x: 1220, y: 360, r: 32, label: 'LANCIA' },
    { a: 'pause', x: 1232, y: 44, r: 30, label: '❚❚' }
  ];
  var STICK = { x: 170, y: 560, r: 96 };
  var pointers = {};
  function toLogical(e) { var r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * 1280, y: (e.clientY - r.top) / r.height * 720 }; }
  function hit(p) { for (var i = 0; i < BTN.length; i++) { var b = BTN[i]; if (Math.hypot(p.x - b.x, p.y - b.y) < b.r * 1.25) return b; } return null; }
  function setStick(p) {
    var dx = p.x - STICK.x, dy = p.y - STICK.y, m = Math.hypot(dx, dy), k = m > STICK.r ? STICK.r / m : 1;
    stick = { dx: dx * k, dy: dy * k };
    var nx = stick.dx / STICK.r, ny = stick.dy / STICK.r;
    held.left = nx < -0.35; held.right = nx > 0.35; held.up = ny < -0.35; held.down = ny > 0.35;
    run = Math.abs(nx) > 0.92;
  }
  function clearStick() { stick = null; held.left = held.right = held.up = held.down = false; run = false; }
  function down(e) {
    if (e.pointerType === 'mouse') return;
    active = true; e.preventDefault();
    try { if (!document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {}); } catch (x) {}
    var p = toLogical(e), b = hit(p);
    if (b) { pointers[e.pointerId] = { btn: b }; held[b.a] = true; pressed[b.a] = W.Input.time(); W.Touch.onButton && W.Touch.onButton(b.a); }
    else if (p.x < 640) { pointers[e.pointerId] = { stick: true }; setStick(p); }
  }
  function move(e) { var pt = pointers[e.pointerId]; if (pt && pt.stick) { e.preventDefault(); setStick(toLogical(e)); } }
  function up(e) { var pt = pointers[e.pointerId]; if (!pt) return; if (pt.btn) held[pt.btn.a] = false; if (pt.stick) clearStick(); delete pointers[e.pointerId]; }
  return {
    attach: function (cv) {
      canvas = cv; cv.style.touchAction = 'none';
      cv.addEventListener('pointerdown', down, { passive: false }); window.addEventListener('pointermove', move, { passive: false });
      window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
      if ('ontouchstart' in window || (window.matchMedia && matchMedia('(pointer: coarse)').matches)) active = true;
    },
    active: function () { return active; },
    held: held, pressed: pressed, run: function () { return run; },
    // navigazione dei menu con il joystick: una mossa ogni 0,28 s
    navTick: function (now, onKey) {
      if (!active || !stick) { navDir = 0; return; }
      var dir = held.up ? -1 : held.down ? 1 : 0, h = held.left ? -1 : held.right ? 1 : 0;
      if ((dir || h) && (now - lastNav > 0.28 || (dir * 10 + h) !== navDir)) { lastNav = now; navDir = dir * 10 + h; onKey(dir < 0 ? 'ArrowUp' : dir > 0 ? 'ArrowDown' : h < 0 ? 'ArrowLeft' : 'ArrowRight'); }
      if (!dir && !h) navDir = 0;
    },
    draw: function (ctx, playing, portrait) {
      if (!active) return;
      ctx.save();
      if (portrait) {
        ctx.fillStyle = 'rgba(0,0,0,0.88)'; ctx.fillRect(0, 0, 1280, 720); ctx.fillStyle = '#fff'; ctx.font = '700 48px "Oswald", sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Ruota il telefono in orizzontale', 640, 360); ctx.restore(); return;
      }
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(STICK.x, STICK.y, STICK.r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(STICK.x + (stick ? stick.dx : 0), STICK.y + (stick ? stick.dy : 0), 40, 0, Math.PI * 2); ctx.fill();
      BTN.forEach(function (b) {
        if (!playing && ['heavy', 'jump', 'dodge', 'fury', 'throw'].indexOf(b.a) >= 0) return;
        ctx.fillStyle = held[b.a] ? 'rgba(214,40,40,0.75)' : 'rgba(20,20,26,0.55)'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = '600 ' + Math.max(12, Math.round(b.r * 0.34)) + 'px "Oswald", sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(!playing && b.a === 'light' ? 'OK' : !playing && b.a === 'interact' ? 'INDIETRO' : b.label, b.x, b.y + 5);
      });
      ctx.restore();
    }
  };
})();
