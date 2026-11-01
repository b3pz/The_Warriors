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
  MAX_WEAPON_PICKUPS: 6,
  // risse brevi e violente come nel film: i colpi pesano di più per tutti
  BRUTAL: { player: 1.3, enemy: 1.15 }
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
  baton:  { name: 'Manganello', light: 10, heavy: 18, dur: 8, reach: 16, slow: 1.0, color: '#2a2a33', len: 44 },
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
W.MERCY = { id: 'mercy', name: 'Mercy', p: 1, s: 4, r: 3, g: 1, noncombat: true };
// Mercy combattente: solo nell'Arcade, sbloccata con tutte le W di Rembrandt
W.MERCY_FIGHTER = { id: 'mercy', name: 'Mercy', p: 2, s: 5, r: 2, g: 4 };
W.rosterById = function (id) { if (id === 'mercy') return W.mercyFights ? W.MERCY_FIGHTER : W.MERCY; for (var i = 0; i < W.ROSTER.length; i++) if (W.ROSTER[i].id === id) return W.ROSTER[i]; return null; };
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
// 15 archetipi (docs/CAST.md). behavior: melee, charge, grab, shoot, throw, pursue, block.
// set = set di sprite pixel art (tools/pixel_frames.json). HP e danni: COMBAT_AND_SYSTEMS.md.
W.ENEMIES = {
  turnbull_rusher: { label: 'Turnbull', set: 'turnbull_fast',   hp: 55,  speed: 1.25, dmg: 9,  weapon: null,    behavior: 'charge', atk: { prep: .45, act: .16, rec: .55, reach: 95,  ty: 26, lunge: 170 } },
  turnbull_heavy:  { label: 'Turnbull', set: 'turnbull_b', hp: 90,  speed: 0.8,  dmg: 14, weapon: null,    behavior: 'melee',  atk: { prep: .58, act: .12, rec: .60, reach: 112, ty: 30, kd: true }, scale: 1.08 },
  orphan_brawler:  { label: 'Orphan',   set: 'orphan',     hp: 55,  speed: 1.05, dmg: 8,  weapon: null,    behavior: 'melee',  atk: { prep: .36, act: .09, rec: .42, reach: 82,  ty: 24 }, yield: true },
  orphan_board:    { label: 'Orphan',   set: 'orphan',     hp: 65,  speed: 0.95, dmg: 10, weapon: 'board', behavior: 'melee',  atk: { prep: .48, act: .10, rec: .55, reach: 112, ty: 26 }, heavyDmg: 16 },
  fury_batter:     { label: 'Fury',     set: 'fury',       hp: 65,  speed: 0.95, dmg: 10, weapon: 'bat',   behavior: 'melee',  atk: { prep: .45, act: .10, rec: .55, reach: 120, ty: 26 }, heavyDmg: 18, unarmedSet: 'fury_nobat' },
  fury_flanker:    { label: 'Fury',     set: 'fury_hood',  hp: 42,  speed: 1.15, dmg: 9,  weapon: 'bat',   behavior: 'melee',  atk: { prep: .40, act: .10, rec: .45, reach: 112, ty: 24 }, heavyDmg: 14, flank: true, unarmedSet: 'fury_hood_nobat' },
  fury_veteran:    { label: 'Veterano', set: 'fury_boss',       hp: 145, speed: 1.0,  dmg: 10, weapon: 'bat',   behavior: 'melee',  atk: { prep: .42, act: .10, rec: .50, reach: 125, ty: 28 }, heavyDmg: 18, elite: true, scale: 1.1, unarmedSet: 'fury_nobat' },
  lizzie_blocker:  { label: 'Lizzie',   set: 'lizzie_b',   hp: 55,  speed: 1.0,  dmg: 6,  weapon: null,    behavior: 'block',  atk: { prep: .45, act: .12, rec: .50, reach: 85,  ty: 26, kd: true } },
  lizzie_shooter:  { label: 'Lizzie',   set: 'lizzie',     hp: 42,  speed: 0.9,  dmg: 12, weapon: null,    behavior: 'shoot',  atk: { prep: .95, act: .05, rec: 1.4, reach: 900, ty: 22 } },
  punk_grappler:   { label: 'Punk',     set: 'punk',       hp: 90,  speed: 0.9,  dmg: 4,  weapon: null,    behavior: 'grab',   atk: { prep: .50, act: .14, rec: .70, reach: 70,  ty: 22, lunge: 90 }, scale: 1.06 },
  punk_brawler:    { label: 'Punk',     set: 'punk',       hp: 55,  speed: 1.0,  dmg: 9,  weapon: null,    behavior: 'melee',  atk: { prep: .40, act: .09, rec: .45, reach: 86,  ty: 24 } },
  punk_leader:     { label: 'Capo Punks', set: 'punk_boss',     hp: 240, speed: 1.0,  dmg: 12, weapon: null,    behavior: 'melee',  atk: { prep: .44, act: .10, rec: .48, reach: 95,  ty: 28 }, elite: true, scale: 1.12, pushCombo: true },
  rogue_brawler:   { label: 'Rogue',    set: 'rogue',      hp: 55,  speed: 1.0,  dmg: 9,  weapon: null,    behavior: 'melee',  atk: { prep: .40, act: .10, rec: .45, reach: 86,  ty: 24 } },
  rogue_bottle:    { label: 'Rogue',    set: 'rogue',      hp: 42,  speed: 0.95, dmg: 12, weapon: null,    behavior: 'throw',  atk: { prep: .70, act: .08, rec: .90, reach: 520, ty: 40 } },
  police_pursuer:  { label: 'Polizia',  set: 'police',     hp: 70,  speed: 1.2,  dmg: 6,  weapon: null,    behavior: 'pursue', atk: { prep: .42, act: .14, rec: .55, reach: 92,  ty: 26, lunge: 120, kd: true } },
  sparring:        { label: 'Sparring', set: 'snow',       hp: 999, speed: 0.6,  dmg: 0,  weapon: null,    behavior: 'spar',   atk: { prep: .6, act: .1, rec: .6, reach: 80, ty: 24 } }
};


W.DIFFICULTY = {
  facile:    { name: 'Facile',    edmg: 0.65, ehp: 0.85, revive: 14, recover: 0.75 },
  normale:   { name: 'Normale',   edmg: 1.0,  ehp: 1.0,  revive: 10, recover: 0.55 },
  difficile: { name: 'Difficile', edmg: 1.2,  ehp: 1.1,  revive: 10, recover: 0.4 }
};
