// Mixer con bus separati (musica, ambiente, effetti, radio). Tutto sintetizzato in tempo reale,
// da sostituire con i master del catalogo. Tono: notte sporca, synth cupi, silenzi; niente fanfare.
//   musica:   setMood('silence' | 'tension' | 'chase' | 'fight' | 'dawn' | 'radio')
//   ambiente: setAmbience('city' | 'subway' | 'park' | 'interior' | 'beach' | 'none')
'use strict';
var W = window.W;

W.Audio = (function () {
  var ac = null, master, sfx, mus, amb, seen = {}, vol = { sfx: 0.8, music: 0.5 };
  var ducked = false, mood = 'silence', ambName = 'none', layers = {}, ambNodes = null, seqT = null, step = 0, noiseBuf = null;
  function ensure() {
    if (ac) return true;
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = 0.85; master.connect(ac.destination);
      var comp = ac.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.connect(master);
      sfx = ac.createGain(); sfx.gain.value = vol.sfx; sfx.connect(comp);
      mus = ac.createGain(); mus.gain.value = vol.music; mus.connect(comp);
      amb = ac.createGain(); amb.gain.value = vol.music * 0.9; amb.connect(comp);
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate);
      var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ac = null; }
    return !!ac;
  }
  function noise(loop) { var s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = !!loop; return s; }
  function env(g, t, a, peak, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  function tone(type, f0, f1, dur, peak, out, when) {
    var t = (when || ac.currentTime), o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    env(g, t, 0.004, peak, dur); o.connect(g); g.connect(out || sfx); o.start(t); o.stop(t + dur + 0.05);
  }
  function burst(dur, peak, fType, freq, q, out, when) {
    var t = (when || ac.currentTime), n = noise(), f = ac.createBiquadFilter(), g = ac.createGain();
    f.type = fType; f.frequency.value = freq; f.Q.value = q || 0.8;
    env(g, t, 0.003, peak, dur); n.connect(f); f.connect(g); g.connect(out || sfx); n.start(t, Math.random() * 2); n.stop(t + dur + 0.05);
  }

  // ------------------------------------------------------------------ effetti registrati (W.SFX_AUTO da js/suoni_auto.js)
  // Ogni evento cerca prima un suono registrato (più varianti: ne sceglie una a caso, con un filo di variazione d'intonazione);
  // se non c'è, resta il suono sintetizzato qui sotto.
  var bufs = {}, loading = {};
  function sampleKey(e) {
    switch (e.type) {
      case 'hit': return e.weapon ? (e.weaponType === 'pipe' ? 'hit_metal' : 'hit_weapon') : (e.heavy ? 'hit_heavy' : 'hit_light');
      case 'break': return 'break';
      case 'enemyko': return 'ko';
      default: return e.type;
    }
  }
  function loadSample(src) {
    if (bufs[src] || loading[src]) return; loading[src] = true;
    fetch(src).then(function (r) { return r.arrayBuffer(); }).then(function (ab) { return new Promise(function (ok, ko) { ac.decodeAudioData(ab, ok, ko); }); })
      .then(function (b) { bufs[src] = b; }).catch(function () { bufs[src] = null; });
  }
  function preloadSamples() { var A = W.SFX_AUTO || {}; for (var k in A) A[k].forEach(loadSample); }
  function playSample(e) {
    var A = W.SFX_AUTO, key = A && sampleKey(e), list = key && A[key]; if (!list || !list.length) return false;
    var src = list[Math.floor(Math.random() * list.length)], b = bufs[src];
    if (!b) { loadSample(src); return false; }       // ancora in caricamento: per questa volta suona il sintetizzato
    var n = ac.createBufferSource(), g = ac.createGain(); n.buffer = b; n.playbackRate.value = 0.94 + Math.random() * 0.12;
    g.gain.value = SAMPLE_GAIN[key] || 0.9; n.connect(g); g.connect(key === 'siren' || key === 'train' ? amb : sfx); n.start();
    return true;
  }
  var SAMPLE_GAIN = { swing: 0.5, step: 0.4, pickup: 0.6, spray: 0.7 };

  // ------------------------------------------------------------------ effetti: secchi, bassi, sporchi
  var SFX = {
    hit: function (e) {
      burst(e.heavy ? 0.16 : 0.09, e.heavy ? 0.9 : 0.6, 'lowpass', e.heavy ? 380 : 650, 1);
      tone('sine', e.heavy ? 90 : 120, 40, e.heavy ? 0.2 : 0.12, e.heavy ? 0.8 : 0.5);
      if (e.weapon) burst(0.05, 0.35, 'bandpass', 1600, 4);
    },
    swing: function (e) { burst(e.heavy ? 0.2 : 0.12, e.enemy ? 0.08 : 0.12, 'bandpass', e.weapon ? 500 : 900, 0.9); },
    disarm: function () { burst(0.07, 0.4, 'bandpass', 1100, 6); tone('triangle', 300, 200, 0.25, 0.08); },
    'break': function () { burst(0.3, 0.5, 'highpass', 2600, 0.7); },
    pickup: function () { burst(0.04, 0.2, 'bandpass', 1800, 3); },
    heal: function () { burst(0.06, 0.15, 'bandpass', 1200, 3); },
    ko: function () { tone('sine', 110, 45, 0.9, 0.35); burst(0.4, 0.25, 'lowpass', 220); },
    fury: function () { tone('sawtooth', 70, 140, 0.35, 0.2); burst(0.3, 0.25, 'lowpass', 500); },
    wave: function () { tone('sawtooth', 55, 52, 1.2, 0.14, mus); },
    clear: function () { tone('sine', 110, 110, 1.4, 0.08, mus); tone('sine', 164.8, 164.8, 1.4, 0.05, mus); },
    open: function () { burst(0.14, 0.25, 'bandpass', 380, 3); },
    revive: function () { tone('triangle', 220, 330, 0.3, 0.08); },
    toss: function () { burst(0.15, 0.18, 'bandpass', 900, 1.5); },
    throw: function () { tone('sine', 100, 38, 0.35, 0.6); burst(0.2, 0.3, 'lowpass', 300); },
    shot: function () { burst(0.35, 1, 'lowpass', 3000, 0.5); tone('square', 80, 30, 0.25, 0.4); },
    siren: function () { var t = ac.currentTime; for (var i = 0; i < 3; i++) { tone('sawtooth', 620, 880, 0.55, 0.05, amb, t + i * 1.1); tone('sawtooth', 880, 620, 0.55, 0.05, amb, t + i * 1.1 + 0.55); } },
    horn: function () { tone('square', 196, 196, 0.7, 0.14); tone('square', 233, 233, 0.7, 0.1); },
    train: function () { burst(2.5, 0.4, 'lowpass', 220); tone('sine', 55, 48, 2.5, 0.25); burst(0.6, 0.15, 'bandpass', 3200, 8, sfx, ac.currentTime + 1.6); },
    fire: function () { burst(1.2, 0.4, 'bandpass', 500, 0.6); },
    bottle: function () { burst(0.06, 0.35, 'bandpass', 2600, 6); tone('triangle', 2100, 1700, 0.08, 0.1); },
    ricochet: function () { tone('sine', 2400, 500, 0.2, 0.1); },
    aim: function (e) { if (!e.bottle) tone('sine', 1400, 1400, 0.05, 0.05); },
    line: function () {},
    trainwarn: function () { var t = ac.currentTime; for (var i = 0; i < 3; i++) tone('square', 880, 880, 0.12, 0.06, sfx, t + i * 0.3); },
    skate: function () { burst(1.8, 0.12, 'bandpass', 900, 0.6); },
    land: function (e) { burst(e.heavy ? 0.2 : 0.12, e.heavy ? 0.7 : 0.4, 'lowpass', 300, 1); },
    spray: function () { burst(0.7, 0.5, 'highpass', 4200, 0.5); },
    flashfx: function () {}, shakefx: function () {}
  };

  // ------------------------------------------------------------------ musica: bordone in minore + pulsazione
  // Re minore: bordone su Re e La, ostinato di basso che cambia con lo stato.
  var MOODS = {
    silence: { drone: 0, pulse: 0, kick: 0, cut: 300 },
    tension: { drone: 0.16, pulse: 0, kick: 0, cut: 520 },
    chase:   { drone: 0.12, pulse: 0.16, kick: 0.12, cut: 900, bpm: 128 },
    fight:   { drone: 0.12, pulse: 0.14, kick: 0.18, cut: 760, bpm: 112 },
    dawn:    { drone: 0.12, pulse: 0, kick: 0, cut: 1400, bright: true },
    radio:   { drone: 0.05, pulse: 0, kick: 0, cut: 400 },
    // apertura sulla Wonder Wheel: tema originale del gioco, arpeggio di synth lento e lucido (non è il brano del film)
    wonder:  { drone: 0.08, pulse: 0, kick: 0, cut: 1100, bpm: 64, arp: true, bright: true }
  };
  function startMusic() {
    if (layers.drone) return;
    var f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500; f.Q.value = 2;
    var lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 0.05; lg.gain.value = 180; lfo.connect(lg); lg.connect(f.frequency); lfo.start();
    var dg = ac.createGain(); dg.gain.value = 0; f.connect(dg); dg.connect(mus);
    var oscs = [[73.42, -7], [73.42, 6], [110, -4], [146.83, 3]].map(function (p) {
      var o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = p[0]; o.detune.value = p[1]; o.connect(f); o.start(); return o;
    });
    layers.drone = { gain: dg, filter: f, oscs: oscs };
    layers.pulse = ac.createGain(); layers.pulse.gain.value = 0; layers.pulse.connect(mus);
    layers.kick = ac.createGain(); layers.kick.gain.value = 0; layers.kick.connect(mus);
    var BASS = [36.71, 36.71, 0, 36.71, 43.65, 0, 36.71, 32.7, 36.71, 36.71, 0, 36.71, 48.99, 0, 43.65, 41.2];
    seqT = setInterval(function () {
      if (!ac || ac.state !== 'running') return;
      var M = MOODS[mood]; if (!M.bpm || ducked) return;
      var now = ac.currentTime, n = BASS[step % 16];
      if (n && M.pulse) {
        var o = ac.createOscillator(), g = ac.createGain(), lf = ac.createBiquadFilter();
        o.type = 'sawtooth'; o.frequency.value = n * 2; lf.type = 'lowpass'; lf.frequency.setValueAtTime(M.cut, now); lf.frequency.exponentialRampToValueAtTime(120, now + 0.18);
        env(g, now, 0.005, 0.9, 0.2); o.connect(lf); lf.connect(g); g.connect(layers.pulse); o.start(now); o.stop(now + 0.25);
      }
      if (M.arp && step % 4 === 0) {
        // la ruota gira: arpeggio di La minore, Fa, Do, Sol, con eco
        var ARP = [220, 261.63, 329.63, 440, 174.61, 220, 261.63, 349.23, 261.63, 329.63, 392, 523.25, 196, 246.94, 293.66, 392], fq = ARP[(step / 4) % 16];
        [0, 0.36].forEach(function (dl, ei) { var ao = ac.createOscillator(), ag = ac.createGain(); ao.type = 'triangle'; ao.frequency.value = fq * (ei ? 2 : 1); env(ag, now + dl, 0.01, ei ? 0.05 : 0.11, 0.9); ao.connect(ag); ag.connect(mus); ao.start(now + dl); ao.stop(now + dl + 1); });
      }
      if (M.kick && step % 4 === 0) { var k = ac.createOscillator(), kg = ac.createGain(); k.frequency.setValueAtTime(110, now); k.frequency.exponentialRampToValueAtTime(40, now + 0.15); env(kg, now, 0.002, 1, 0.25); k.connect(kg); kg.connect(layers.kick); k.start(now); k.stop(now + 0.3); }
      if (M.kick && step % 8 === 4) { var hn = noise(), hf = ac.createBiquadFilter(), hg = ac.createGain(); hf.type = 'highpass'; hf.frequency.value = 6000; env(hg, now, 0.002, 0.25, 0.06); hn.connect(hf); hf.connect(hg); hg.connect(layers.kick); hn.start(now); hn.stop(now + 0.1); }
      step++;
    }, 60000 / 128 / 4);
  }
  function applyMood() {
    if (!ac || !layers.drone) return;
    var M = MOODS[mood] || MOODS.silence, t = ac.currentTime;
    if (ducked) M = MOODS.silence; // traccia originale in corso: il synth tace
    layers.drone.gain.gain.setTargetAtTime(M.drone, t, 1.2);
    layers.drone.filter.frequency.setTargetAtTime(M.cut, t, 1.5);
    layers.drone.oscs[3].frequency.setTargetAtTime(M.bright ? 174.6 : 146.83, t, 2); // all'alba la terza sale: Re maggiore → Fa
    layers.pulse.gain.setTargetAtTime(M.pulse, t, 0.6);
    layers.kick.gain.setTargetAtTime(M.kick, t, 0.6);
  }

  // ------------------------------------------------------------------ ambienti
  var AMB = {
    city:     { rumble: [140, 0.22], hiss: [2500, 0.025], sirens: 18 },
    subway:   { rumble: [70, 0.35], hiss: [1800, 0.03], screech: 14 },
    park:     { rumble: [260, 0.12], hiss: [900, 0.05], crickets: true },
    interior: { rumble: [55, 0.12], hum: 60 },
    beach:    { rumble: [400, 0.08], hiss: [600, 0.12], waves: true },
    none:     {}
  };
  function stopAmb() { if (ambNodes) { ambNodes.forEach(function (n) { try { n.stop ? n.stop() : n.disconnect(); } catch (e) {} }); ambNodes = null; } }
  function startAmb(name) {
    stopAmb(); var A = AMB[name] || {}, nodes = [];
    if (A.rumble) { var n = noise(true), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'lowpass'; f.frequency.value = A.rumble[0]; g.gain.value = A.rumble[1]; n.connect(f); f.connect(g); g.connect(amb); n.start(); nodes.push(n); }
    if (A.hiss) { var n2 = noise(true), f2 = ac.createBiquadFilter(), g2 = ac.createGain(); f2.type = 'bandpass'; f2.frequency.value = A.hiss[0]; f2.Q.value = 0.4; g2.gain.value = A.hiss[1]; n2.connect(f2); f2.connect(g2); g2.connect(amb);
      if (A.waves) { var wl = ac.createOscillator(), wg = ac.createGain(); wl.frequency.value = 0.12; wg.gain.value = A.hiss[1] * 0.9; wl.connect(wg); wg.connect(g2.gain); wl.start(); nodes.push(wl); }
      n2.start(); nodes.push(n2); }
    if (A.hum) { var h = ac.createOscillator(), hg = ac.createGain(); h.frequency.value = A.hum; hg.gain.value = 0.015; h.connect(hg); hg.connect(amb); h.start(); nodes.push(h); }
    ambNodes = nodes; ambName = name;
    var ev = setInterval(function () {
      if (ambName !== name) { clearInterval(ev); return; }
      if (!ac || ac.state !== 'running') return;
      var t = ac.currentTime;
      if (A.sirens && Math.random() < 1 / A.sirens) { tone('sine', 700, 950, 1.2, 0.012, amb); tone('sine', 950, 700, 1.2, 0.012, amb, t + 1.2); }
      if (A.screech && Math.random() < 1 / A.screech) burst(1.4, 0.04, 'bandpass', 3400, 14, amb);
      if (A.crickets && Math.random() < 0.5) for (var c = 0; c < 3; c++) tone('sine', 4200, 4200, 0.03, 0.006, amb, t + c * 0.07);
    }, 1000);
  }

  // ------------------------------------------------------------------ radio della DJ: crepitio e banda stretta
  var radioNodes = null;
  function radio(on) {
    if (!ensure()) return;
    if (on && !radioNodes) {
      var n = noise(true), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = 1.2; g.gain.value = 0.03;
      n.connect(f); f.connect(g); g.connect(sfx); n.start();
      var crackle = setInterval(function () { if (ac && Math.random() < 0.6) burst(0.015, 0.08 + Math.random() * 0.1, 'highpass', 3000, 1); }, 90);
      radioNodes = { n: n, crackle: crackle };
      burst(0.3, 0.25, 'bandpass', 1500, 2);
    } else if (!on && radioNodes) { try { radioNodes.n.stop(); } catch (e) {} clearInterval(radioNodes.crackle); radioNodes = null; burst(0.15, 0.2, 'bandpass', 1200, 2); }
  }

  return {
    unlock: function () { if (W.Music) W.Music.unlock(); if (ensure()) { if (ac.state === 'suspended') ac.resume(); preloadSamples(); startMusic(); applyMood(); if (ambName === 'none' && pendingAmb) startAmb(pendingAmb); } },
    consume: function (events) {
      if (!ac) return;
      for (var i = 0; i < events.length; i++) { var e = events[i]; if (seen[e.eid]) continue; seen[e.eid] = true; if (playSample(e)) continue; if (SFX[e.type]) try { SFX[e.type](e); } catch (x) {} }
    },
    duck: function (on) { if (ducked === !!on) return; ducked = !!on; applyMood(); },
    setMood: function (m) { if (m === mood) return; mood = MOODS[m] ? m : 'silence'; applyMood(); },
    setAmbience: function (a) { pendingAmb = a; if (!ac || a === ambName) return; startAmb(a); },
    radio: radio,
    ui: function () { if (ac) burst(0.03, 0.08, 'bandpass', 1400, 4); },
    setVol: function (k, v) { vol[k] = v; if (k === 'music' && W.Music) W.Music.setVol(v); if (!ac) return; if (k === 'sfx') sfx.gain.value = v; else { mus.gain.value = v; amb.gain.value = v * 0.9; } },
    vol: vol,
    mood: function () { return mood; },
    suspend: function () { if (W.Music) W.Music.suspend(); if (ac && ac.state === 'running') ac.suspend(); },
    resume: function () { if (W.Music) W.Music.resume(); if (ac && ac.state === 'suspended') ac.resume(); }
  };
  var pendingAmb = 'none';
})();
