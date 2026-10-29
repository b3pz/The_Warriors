// The Warriors · Night Run — costanti del nucleo (fase B)
// Valori presi da docs/COMBAT_AND_SYSTEMS.md e docs/CAST.md. Da bilanciare in playtest.
'use strict';
var W = window.W = window.W || {};

W.CFG = {
  VIEW_W: 1280, VIEW_H: 720,
  STEP: 1 / 60,
  MAX_ACCUM: 0.25,
  FLOOR_Y0: 450, FLOOR_Y1: 680,
  WALK: { x: 230, y: 150 },
  RUN: { x: 340, y: 190 },
  JUMP_T: 0.65, JUMP_APEX: 100,
  BUFFER: 0.1,
  CHAIN_LATE: 0.14, CHAIN_AFTER: 0.18,
  HURT_PROTECT: 0.45, GETUP_PROTECT: 0.7,
  DOUBLE_HIT_WINDOW: 1.0,
  DODGE: { dur: 0.3, inv0: 0.08, inv1: 0.18, rec: 0.3, cd: 0.85, speed: 520 },
  INTERACT: { x: 64, y: 26 }, GRAB: { x: 48, y: 22 }, GRAB_MAX: 1.4,
  FURY_GAIN_HIT: 3, FURY_GAIN_KO: 6,
  REVIVE: { window: 10, hold: 2, x: 60, y: 28, keep: 0.8, hp: 0.3, protect: 1.2 },
  EXIT_CONFIRM: 0.6,
  CAM_MARGIN: 160, MAX_SPREAD: 850,
  MAX_ON_FIELD: [4, 6], MAX_ATTACKERS: [1, 2], ATTACK_GAP: 0.09,
  STUCK_REPATH: 3, STUCK_RESPAWN: 8,
  MAX_WEAPON_PICKUPS: 6
};

// Tempi in secondi: prep / attivo / recupero. Danno riferito a potenza 3.
W.MOVES = {
  l1:     { prep: .09, act: .07, rec: .15, dmg: 8,  reach: 82,  ty: 26, push: 30,  kd: false },
  l2:     { prep: .11, act: .07, rec: .17, dmg: 10, reach: 90,  ty: 28, push: 60,  kd: false },
  l3:     { prep: .16, act: .09, rec: .25, dmg: 16, reach: 106, ty: 30, push: 180, kd: true },
  heavy:  { prep: .23, act: .10, rec: .32, dmg: 22, reach: 112, ty: 32, push: 200, kd: false, heavy: true },
  run:    { prep: .13, act: .10, rec: .32, dmg: 16, reach: 105, ty: 30, push: 200, kd: true, lunge: 160 },
  air:    { prep: 0,   act: .16, rec: 0,   dmg: 14, reach: 100, ty: 30, push: 120, kd: true },
  grabhit:{ prep: .12, act: .06, rec: .22, dmg: 8,  reach: 60,  ty: 30, push: 0,   kd: false },
  throw:  { prep: .16, act: .10, rec: .28, dmg: 12, reach: 200, ty: 30, push: 0,   kd: true },
  fury:   { prep: .15, act: .90, rec: .35, dmg: 36, reach: 120, ty: 38, push: 160, kd: true, ticks: 3 }
};

W.WEAPONS = {
  bat:    { name: 'Mazza',     light: 14, heavy: 26, dur: 10, reach: 30, slow: 1.12, color: '#a0703c', len: 62 },
  pipe:   { name: 'Tubo',      light: 13, heavy: 24, dur: 8,  reach: 18, slow: 1.0,  color: '#8d969e', len: 48 },
  board:  { name: 'Asse',      light: 12, heavy: 23, dur: 6,  reach: 22, slow: 1.05, color: '#b88a52', len: 56 },
  bottle: { name: 'Bottiglia', light: 12, heavy: 12, dur: 1,  reach: 0,  slow: 1.0,  color: '#4f8f5b', len: 22, throwOnly: true }
};

W.PICKUPS = { snack: { name: 'Snack', hp: 15 }, drink: { name: 'Bevanda', hp: 10 }, kit: { name: 'Kit', hp: 35 } };

// Nove Warriors: potenza / velocità / resistenza / presa (1–5)
W.ROSTER = [
  { id: 'swan',      name: 'Swan',      p: 3, s: 4, r: 3, g: 3 },
  { id: 'ajax',      name: 'Ajax',      p: 5, s: 2, r: 5, g: 4 },
  { id: 'snow',      name: 'Snow',      p: 4, s: 3, r: 4, g: 3 },
  { id: 'cowboy',    name: 'Cowboy',    p: 2, s: 4, r: 3, g: 3 },
  { id: 'cochise',   name: 'Cochise',   p: 4, s: 4, r: 3, g: 2 },
  { id: 'vermin',    name: 'Vermin',    p: 3, s: 3, r: 4, g: 4 },
  { id: 'rembrandt', name: 'Rembrandt', p: 2, s: 5, r: 2, g: 2 },
  { id: 'fox',       name: 'Fox',       p: 2, s: 5, r: 3, g: 2 },
  { id: 'cleon',     name: 'Cleon',     p: 4, s: 3, r: 4, g: 4 }
];
W.rosterById = function (id) { for (var i = 0; i < W.ROSTER.length; i++) if (W.ROSTER[i].id === id) return W.ROSTER[i]; return null; };
W.statMods = function (c) {
  return {
    dmg: 0.85 + (c.p - 1) * 0.0875,           // 0,85 – 1,20
    spd: 0.9 + (c.s - 1) * 0.05,              // 0,90 – 1,10
    hp: Math.round(100 * (0.85 + (c.r - 1) * 0.075)), // 85 – 115
    anim: 1.1 - (c.s - 1) * 0.05,             // ±10% velocità animazioni
    grip: 0.8 + (c.g - 1) * 0.1
  };
};

// Archetipi nemici del parco (ID di design; aspetto = manichino neutro finché mancano gli asset)
W.ENEMIES = {
  fury_flanker: { label: 'flanker', hp: 42,  speed: 1.15, dmg: 7,  weapon: null,  atk: { prep: .38, act: .09, rec: .40, reach: 80,  ty: 24 }, tint: '#6d7f99' },
  fury_batter:  { label: 'batter',  hp: 65,  speed: 0.95, dmg: 10, weapon: 'bat', atk: { prep: .45, act: .10, rec: .55, reach: 120, ty: 26 }, heavyDmg: 18, tint: '#8a6d99' },
  fury_veteran: { label: 'veteran', hp: 145, speed: 1.0,  dmg: 12, weapon: 'bat', atk: { prep: .42, act: .10, rec: .50, reach: 125, ty: 28 }, heavyDmg: 18, tint: '#a4566a', elite: true }
};

W.DIFFICULTY = {
  facile:    { name: 'Facile',    edmg: 0.65, ehp: 0.85, revive: 14 },
  normale:   { name: 'Normale',   edmg: 1.0,  ehp: 1.0,  revive: 10 },
  difficile: { name: 'Difficile', edmg: 1.2,  ehp: 1.1,  revive: 10 }
};
