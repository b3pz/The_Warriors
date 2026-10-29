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
    // doppio tocco orizzontale = corsa
    var dx = this.axisX();
    if (dx !== 0 && this.prevDirX === 0) {
      if (this.lastDirTap.dir === dx && now - this.lastDirTap.t < 0.25) this.runIntent = true;
      this.lastDirTap = { dir: dx, t: now };
    }
    if (this.prevDirX !== 0 && dx !== this.prevDirX) this.runIntent = false;
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
