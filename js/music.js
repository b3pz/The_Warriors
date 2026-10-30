'use strict';
// Lettore delle tracce originali (W.MUSIC in musiche.js) con dissolvenza incrociata.
// Quando una traccia suona, la musica sintetizzata si abbassa; ambienti, effetti e radio restano.
window.W = window.W || {};
W.Music = (function () {
  var decks = [null, null], cur = -1, curKey = null, curSrc = null, vol = 0.5, unlocked = false, broken = {}, want = null, raf = null;
  function entry(key) {
    var e = W.MUSIC && W.MUSIC[key]; if (!e) return null;
    if (e === 'silence') return { silence: true };
    if (typeof e === 'string') e = { src: e };
    return broken[e.src] ? null : e;
  }
  function resolve(ctx) {
    var keys = [];
    if (ctx.scene) keys.push(ctx.scene);
    if (ctx.area) {
      keys.push(ctx.area + ':' + ctx.sit, ctx.area);
      var ch = ctx.area.split('-')[0]; keys.push(ch + ':' + ctx.sit, ch);
    }
    if (ctx.sit) keys.push(ctx.sit);
    if (ctx.screen) keys.push(ctx.screen);
    for (var i = 0; i < keys.length; i++) { var e = entry(keys[i]); if (e) return { key: keys[i], e: e, scene: keys[i] === ctx.scene }; }
    return null;
  }
  function fadeTo(el, target, secs, done) {
    var from = el.volume, t0 = performance.now(), d = Math.max(0.05, secs) * 1000;
    (function stepF() {
      var k = Math.min(1, (performance.now() - t0) / d); el.volume = Math.max(0, Math.min(1, from + (target - from) * k));
      if (k < 1) el.__f = requestAnimationFrame(stepF); else if (done) done();
    })();
  }
  function stopDeck(i, secs) {
    var el = decks[i]; if (!el) return;
    cancelAnimationFrame(el.__f); fadeTo(el, 0, secs, function () { el.pause(); });
  }
  function play(r) {
    var e = r.e, fade = e.fade === undefined ? 1.5 : e.fade;
    if (cur >= 0) stopDeck(cur, fade);
    cur = cur === 0 ? 1 : 0;
    var el = decks[cur] || (decks[cur] = new Audio());
    cancelAnimationFrame(el.__f);
    el.src = e.src; el.loop = e.loop === undefined ? !r.scene : !!e.loop; el.volume = 0; el.__gain = e.vol === undefined ? 1 : e.vol;
    el.onerror = function () { broken[e.src] = true; if (curSrc === e.src) { curSrc = null; curKey = null; apply(); } }; // file mancante: passa alla chiave seguente
    try { el.currentTime = e.start || 0; } catch (x) {}
    var p = el.play(); if (p && p.catch) p.catch(function () {});
    fadeTo(el, vol * el.__gain, fade);
    curSrc = e.src;
  }
  function apply() {
    var r = want ? resolve(want) : null;
    if (!r || r.e.silence) {
      if (curSrc) { stopDeck(cur, 1.2); curSrc = null; }
      curKey = r ? r.key : null; W.Audio.duck(!!r); return;
    }
    W.Audio.duck(true);
    if (r.e.src === curSrc) { curKey = r.key; return; }   // stessa traccia: continua
    curKey = r.key; if (unlocked) play(r);
  }
  return {
    // ctx: { scene, area, sit, screen }
    update: function (ctx) {
      var sig = ctx.scene + '|' + ctx.area + '|' + ctx.sit + '|' + ctx.screen;
      if (want && want.sig === sig) return;
      ctx.sig = sig; want = ctx; apply();
    },
    unlock: function () { if (unlocked) return; unlocked = true; curSrc = null; apply(); },
    setVol: function (v) { vol = v; var el = decks[cur]; if (el && curSrc) { cancelAnimationFrame(el.__f); el.volume = Math.min(1, vol * (el.__gain || 1)); } },
    suspend: function () { decks.forEach(function (d) { if (d) d.pause(); }); },
    resume: function () { var el = decks[cur]; if (el && curSrc) { var p = el.play(); if (p && p.catch) p.catch(function () {}); } },
    current: function () { var el = decks[cur]; return { key: curKey, src: curSrc, playing: !!(el && curSrc && !el.paused), vol: el ? +el.volume.toFixed(2) : 0 }; },
    count: function () { return W.MUSIC ? Object.keys(W.MUSIC).length : 0; }
  };
})();
