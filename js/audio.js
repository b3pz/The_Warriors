// Mixer minimo con bus separati musica/effetti. Suoni sintetizzati SEGNAPOSTO, da sostituire con i master del catalogo.
'use strict';
var W = window.W;

W.Audio = (function () {
  var ac = null, master, sfx, amb, seen = {}, vol = { sfx: 0.8, music: 0.5 }, ambNode = null;
  function ensure() {
    if (ac) return true;
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = 0.8; master.connect(ac.destination);
      sfx = ac.createGain(); sfx.gain.value = vol.sfx; sfx.connect(master);
      amb = ac.createGain(); amb.gain.value = vol.music * 0.35; amb.connect(master);
    } catch (e) { ac = null; }
    return !!ac;
  }
  function noise(dur) {
    var b = ac.createBuffer(1, Math.max(1, ac.sampleRate * dur), ac.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var s = ac.createBufferSource(); s.buffer = b; return s;
  }
  function env(node, t, a, peak, dur) { node.gain.setValueAtTime(0.0001, t); node.gain.exponentialRampToValueAtTime(peak, t + a); node.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  function tone(type, f0, f1, dur, peak, out) {
    var t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    env(g, t, 0.005, peak, dur); o.connect(g); g.connect(out || sfx); o.start(t); o.stop(t + dur + 0.02);
  }
  function burst(dur, peak, fType, freq, q) {
    var t = ac.currentTime, n = noise(dur), f = ac.createBiquadFilter(), g = ac.createGain();
    f.type = fType; f.frequency.value = freq; f.Q.value = q || 1;
    env(g, t, 0.004, peak, dur); n.connect(f); f.connect(g); g.connect(sfx); n.start(t);
  }
  var SFX = {
    hit: function (e) { tone('sine', e.heavy ? 140 : 190, 50, e.heavy ? 0.18 : 0.11, e.heavy ? 0.9 : 0.6); burst(0.06, 0.4, 'lowpass', 1800); if (e.weapon) burst(0.05, 0.5, 'bandpass', 900, 6); },
    swing: function (e) { burst(e.heavy ? 0.16 : 0.1, e.enemy ? 0.12 : 0.18, 'bandpass', e.weapon ? 700 : 1400, 1.5); },
    disarm: function () { burst(0.08, 0.5, 'bandpass', 1200, 8); tone('triangle', 600, 300, 0.2, 0.2); },
    'break': function () { burst(0.22, 0.6, 'highpass', 2500); },
    pickup: function () { tone('square', 520, 780, 0.08, 0.15); },
    heal: function () { tone('triangle', 520, 1040, 0.18, 0.2); },
    ko: function () { tone('sawtooth', 200, 60, 0.6, 0.3); },
    fury: function () { tone('sawtooth', 120, 480, 0.3, 0.3); },
    wave: function () { tone('square', 98, 92, 0.5, 0.15); },
    open: function () { burst(0.12, 0.3, 'bandpass', 400, 3); },
    revive: function () { tone('triangle', 330, 660, 0.3, 0.2); },
    toss: function () { burst(0.15, 0.2, 'bandpass', 1000, 2); },
    throw: function () { tone('sine', 120, 40, 0.3, 0.6); },
    shot: function () { burst(0.25, 0.9, 'lowpass', 2500); tone('square', 90, 30, 0.2, 0.5); },
    siren: function () { tone('sawtooth', 700, 980, 0.6, 0.12); setTimeout(function () { ac && tone('sawtooth', 980, 700, 0.6, 0.12); }, 600); },
    horn: function () { tone('square', 233, 233, 0.5, 0.18); tone('square', 277, 277, 0.5, 0.12); },
    train: function () { burst(1.6, 0.35, 'lowpass', 300); tone('sine', 60, 50, 1.6, 0.25); },
    fire: function () { burst(0.9, 0.4, 'bandpass', 600, 0.7); },
    bottle: function () { burst(0.12, 0.4, 'highpass', 3000); tone('triangle', 1200, 900, 0.12, 0.2); },
    ricochet: function () { tone('sine', 2200, 600, 0.18, 0.15); },
    aim: function (e) { if (!e.bottle) tone('square', 880, 880, 0.08, 0.06); },
    clear: function () { tone('triangle', 392, 392, 0.15, 0.2); setTimeout(function () { ac && tone('triangle', 523, 523, 0.3, 0.2); }, 140); }
  };
  function startAmbience() {
    if (!ensure() || ambNode) return;
    // vento notturno: rumore filtrato lento
    var n = noise(4); n.loop = true;
    var f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 380;
    var lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 0.08; lg.gain.value = 160; lfo.connect(lg); lg.connect(f.frequency); lfo.start();
    var g = ac.createGain(); g.gain.value = 0.5; n.connect(f); f.connect(g); g.connect(amb); n.start();
    ambNode = n;
  }
  return {
    unlock: function () { if (ensure() && ac.state === 'suspended') ac.resume(); startAmbience(); },
    consume: function (events) {
      if (!ac) return;
      for (var i = 0; i < events.length; i++) { var e = events[i]; if (seen[e.eid]) continue; seen[e.eid] = true; if (SFX[e.type]) try { SFX[e.type](e); } catch (x) {} }
    },
    ui: function () { if (ac) tone('square', 660, 660, 0.04, 0.08); },
    setVol: function (k, v) { vol[k] = v; if (!ac) return; if (k === 'sfx') sfx.gain.value = v; else amb.gain.value = v * 0.35; },
    vol: vol,
    suspend: function () { if (ac && ac.state === 'running') ac.suspend(); },
    resume: function () { if (ac && ac.state === 'suspended') ac.resume(); }
  };
})();
