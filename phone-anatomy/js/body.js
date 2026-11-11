// Outer body of a slab phone: glass, display, frame, buttons, SIM tray, back cover, rear cameras.
// Coordinates are "front view": +x right, +y up, +z toward the viewer of the screen.
import * as THREE from 'three';
import { mat, rr, hole, extrude, slab, box, cyl, face, at, group, screenTex } from './kit.js';

export const GAP = 13; // mm between layers at full explode

export const surf = ([kind, c]) => kind === 'Glass' ? mat.gloss(c)
  : /Alum|Titan|Steel/.test(kind) ? mat.metal(c, kind === 'Stainless steel' ? 0.12 : 0.38)
  : mat.plastic(c, kind === 'Polycarbonate' ? 0.45 : 0.85);

export function dims(s) {
  const W = s.w, H = s.h, D = s.d, R = s.r ?? 10, wall = 2.6;
  const [tG, tD, tB] = s.thin ? [0.15, 0.45, 0.5] : [0.7, 1.0, 0.7]; // glass, display, back
  const zMid = D / 2 - tG - tD - 0.3;
  const z0 = zMid - 0.25 - (s.vc ? 0.35 : 0), z1 = -D / 2 + tB + 0.1 + (s.qi ? 0.45 : 0);
  return { W, H, D, R, wall, tG, tD, tB, zMid, z0, z1, zc: (z0 + z1) / 2, dep: z0 - z1, cx: W / 2 - wall - 0.4, cy: H / 2 - wall - 0.4 };
}

// Where each rear lens sits. Layout is written in back-view x (bx) and mirrored into front-view.
export function camLayout(s, { W, H }) {
  const cams = s.cams || [];
  if (!cams.length) return { lenses: [], isl: null, cb: null, bump: 0 };
  const big = s.year < 2015 ? (cams[0][0] >= 40 ? 9 : 3.6) : s.year < 2019 ? 4.6 : 6.4;
  const p = big * 2 + 3.2, m = 4.5, n = cams.length, apple = s.brand === 'Apple';
  const L = cams.map(([mp, kind]) => ({ mp, kind, r: kind === 'tof' ? 2.6 : kind === 'wide' ? big : big * 0.9, dir: [0, -1] }));
  const put = (i, bx, by) => { if (L[i]) { L[i].x = -bx; L[i].y = by; } };
  const top = H / 2 - m - big - 1.5, hs = p / 2 + big + 2;
  let isl = null, style = s.isl;
  if (style === 'bar' && apple && n > 1) style = 'plateau';

  if (style === 'sq' || style === 'plateau') {
    const x0 = -W / 2 + m + hs, y0 = H / 2 - m - hs;
    put(0, x0 - p / 2, y0 + p / 2); put(1, x0 - p / 2, y0 - p / 2); put(2, x0 + p / 2, y0); put(3, x0 + p / 2, y0 - p * 0.72);
    if (n === 3 && L[2].kind === 'tof') put(2, x0 + p / 2, y0 - p * 0.5);
    isl = style === 'sq' ? { x: -x0, y: y0, w: hs * 2, h: hs * 2, r: hs * 0.45 } : { x: 0, y: y0, w: W - 4, h: hs * 2, r: hs * 0.5 };
    L.forEach((l) => (l.dir = [-1, 0]));
  } else if (style === 'bar') {
    const x0 = apple ? -W / 2 + m + big + 4 : -(n - 1) * p / 2;
    L.forEach((l, i) => put(i, x0 + i * p, top - 8));
    isl = { x: 0, y: top - 8, w: W - (apple ? 5 : 0.6), h: big * 2 + 6, r: apple ? big + 3 : 2.5 };
  } else if (style === 'circ') {
    const rc = n === 1 ? big + 3.5 : p * 0.707 + big + 2, y0 = H / 2 - m - rc - 3, q = p / 2;
    if (n === 1) put(0, 0, y0);
    else if (n === 2) { put(0, -q, y0); put(1, q, y0); }
    else [[-q, q], [q, q], [-q, -q], [q, -q]].forEach(([x, y], i) => put(i, x, y0 + y));
    isl = { x: 0, y: y0, w: rc * 2, h: rc * 2, r: rc };
  } else if (style === 'ctr') {
    L.forEach((l, i) => put(i, 0, top - 6 - i * p));
  } else { // 'tl': column down the top-left corner, overflow into a second column
    const bx = -W / 2 + m + big + 1;
    L.forEach((l, i) => (i < 3 ? put(i, bx, top - i * p) : put(i, bx + p * 0.95, top - (i - 3) * p - p * 0.5)));
    L.forEach((l) => (l.dir = [-1, 0]));
    if (n > 1 && !s.bare) {
      const xs = L.map((l) => l.x), ys = L.map((l) => l.y), pad = big + 2.5;
      const x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
      isl = { x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0, r: pad };
    }
  }
  // footprint of the camera modules inside the phone (periscopes are long)
  const cb = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9 };
  L.forEach((l) => {
    l.hs = l.r * 2 + 3; l.len = l.kind === 'peri' ? l.hs * 1.15 : 0;
    cb.x0 = Math.min(cb.x0, l.x - l.hs / 2 + Math.min(0, l.dir[0] * l.len)); cb.x1 = Math.max(cb.x1, l.x + l.hs / 2);
    cb.y0 = Math.min(cb.y0, l.y - l.hs / 2 + Math.min(0, l.dir[1] * l.len)); cb.y1 = Math.max(cb.y1, l.y + l.hs / 2);
  });
  return { lenses: L, isl, cb, bump: s.year < 2014 && big < 9 ? 0.4 : s.year < 2019 ? 0.8 : 2.2 };
}

const PORT = { 'USB-C': [8.4, 2.6], Lightning: [8, 2.2], '30-pin': [21.5, 2.6], 'Micro-USB': [7, 2], 'DC barrel': [3.6, 3.6] };
export const portSize = (s) => PORT[s.port] || PORT['USB-C'];
const dark = () => mat.plastic(0x060607, 0.35);

// o: { glass, display, back, plate, buttons, sim } — foldables switch pieces off per half.
export function shell(ctx, s, d, cam, o = {}) {
  const { W, H, D, R, wall, tG, tD, tB, zMid } = d, fm = surf(s.frame), apple = s.brand === 'Apple';
  const side = s.front === 'chin' ? 4.2 : s.front === 'bezel' ? 3 : 2.4;
  const sw = W - 2 * side, diag = s.scr * 25.4;
  const sh = Math.min(H - 2 * side, Math.sqrt(Math.max(diag * diag - sw * sw, 1))); // lit area follows the real diagonal
  const sr = s.front === 'chin' || s.year < 2017 ? 0.6 : Math.max(R - side, 1);

  if (o.glass !== false) {
    const g = group(slab(W - 0.5, H - 0.5, R, tG, mat.glass(), 0.25));
    const bez = (H / 2 + sh / 2) / 2;
    if (s.front === 'chin') g.add(at(cyl(5.3, 0.12, mat.plastic(0x101012, 0.2)), 0, -bez, 0));
    if (s.front === 'chin' || s.front === 'bezel') g.add(at(slab(10, 1.4, 0.7, 0.12, dark()), 0, bez, 0));
    ctx.add('glass', 'Cover glass', `Chemically strengthened aluminosilicate glass bonded to the display. It carries the oleophobic coating${s.front === 'chin' ? ' and the home button opening' : ''}; on most phones it is laminated to the panel and replaced as one assembly.`,
      g, [0, 0, D / 2 - tG / 2], [0, 0, 4 * GAP], [['Thickness', '≈0.7 mm'], ['Size', `${W} × ${H} mm`]]);
  }
  if (o.display !== false) {
    const lcd = s.panel === 'LCD', z = tD / 2 + 0.02, blk = () => new THREE.MeshBasicMaterial({ color: 0x000000 });
    const g = group(slab(W - 1.2, H - 1.2, Math.max(R - 0.5, 0.5), tD, dark()),
      at(face(sw, sh, sr, mat.glow(screenTex(sh / sw, s.back[1]))), 0, 0, z),
      at(face(W - 4, H - 4, R, mat.metal(lcd ? 0xb9bcc0 : 0x9a6b3f, 0.55), true), 0, 0, -tD / 2 - 0.02));
    if (s.front === 'notch') g.add(at(face(s.year > 2020 ? 27 : 35, 5.8, 2.6, blk()), 0, sh / 2 - 2.6, z + 0.02));
    if (s.front === 'island') g.add(at(face(21, 6.2, 3.1, blk()), 0, sh / 2 - 6.6, z + 0.02));
    if (s.front === 'punch') g.add(at(face(3.8, 3.8, 1.9, blk()), 0, sh / 2 - 5, z + 0.02));
    ctx.add('display', `${s.panel} display`, lcd
      ? 'Liquid-crystal panel with an LED backlight stack behind it (light guide, diffuser, prism films). The steel back plate stiffens the assembly.'
      : 'Self-emissive OLED: every sub-pixel is its own light source, so black pixels are simply off. The copper-graphite film on the back spreads heat and shields the panel.',
      g, [0, 0, D / 2 - tG - tD / 2], [0, 0, 3 * GAP],
      [['Diagonal', `${s.scr}″`], ['Lit area', `${sw.toFixed(1)} × ${sh.toFixed(1)} mm`], ['Type', s.panel], ...(s.hz ? [['Refresh', `${s.hz} Hz`]] : [])]);
  }

  const depth = D - tG - tB, zr = (tB - tG) / 2, ring = rr(W, H, R), [pw, ph] = portSize(s);
  ring.holes.push(rr(W - 2 * wall, H - 2 * wall, Math.max(R - wall, 0.5)));
  const f = group(extrude(ring, depth, fm, s.flat ? 0.3 : Math.min(1.4, depth / 2 - 0.2)));
  if (o.plate !== false) f.add(at(slab(W - 2 * wall + 0.2, H - 2 * wall - 9, Math.max(R - wall, 0.5), 0.3, mat.metal(0x7d8188, 0.5)), 0, -4.6, zMid - zr));
  if (o.port !== false) f.add(at(box(pw, 0.3, Math.min(ph, depth - 0.6), dark()), 0, -H / 2 + 0.1, 0));
  ctx.add('frame', 'Frame & mid-plate', `${s.frame[0]} band that doubles as the antenna system — the thin plastic breaks split it into separate radiators. The mid-plate is the structural spine everything else screws into.`,
    f, [0, 0, zr], [0, 0, 0], [['Material', s.frame[0]], ['Body', `${W} × ${H} × ${D} mm`]]);

  if (o.buttons !== false) {
    const bz = Math.min(2.2, depth * 0.5), bx = W / 2 + 0.25, vx = apple ? -bx : bx;
    ctx.add('power', 'Power button', 'Metal key cap pressing a dome switch on a flex cable inside the frame.', box(1.1, 10, bz, fm), [bx, H * (apple ? 0.17 : 0.1), zr], [9, 0, 0]);
    ctx.add('volume', 'Volume buttons', 'Two key caps on one flex cable. A rubber gasket around each seals the opening against water.',
      group(at(box(1.1, 8, bz, fm), 0, 5.2, 0), at(box(1.1, 8, bz, fm), 0, -5.2, 0)), [vx, H * 0.26, zr], [vx > 0 ? 9 : -9, 0, 0]);
  }
  if (o.sim !== false && s.year > 2006) {
    const gold = mat.gold();
    const t = group(box(0.9, 14.5, 1.3, fm), at(box(11, 13, 0.35, mat.plastic(0x2b2d31)), 6, 0, 0), at(face(8, 10.5, 1, gold), 6.6, 0, 0.19), at(face(8, 10.5, 1, gold, true), 6.6, 0, -0.19));
    ctx.add('sim', 'SIM tray', 'Ejectable tray holding the nano-SIM. An O-ring on the tray lip keeps water out.', t, [-W / 2 + 0.45, -H * 0.12, zr], [-24, 0, 0]);
  }

  if (o.back !== false) {
    const sh2 = rr(W - 0.5, H - 0.5, R), hr = (l) => l.r + 0.4;
    cam.lenses.forEach((l) => sh2.holes.push(hole(l.x, l.y, hr(l))));
    const b = group(extrude(sh2, tB, s.clear ? mat.glass(s.back[1], 0.32) : surf(s.back), 0.25));
    if (cam.isl) {
      const i = cam.isl, ish = rr(i.w, i.h, i.r);
      cam.lenses.forEach((l) => ish.holes.push(hole(l.x - i.x, l.y - i.y, hr(l))));
      b.add(at(extrude(ish, cam.bump, surf(s.back[0] === 'Glass' ? s.back : s.frame), 0.3), i.x, i.y, -tB / 2 - cam.bump / 2));
    } else cam.lenses.forEach((l) => {
      const c = new THREE.Shape().absarc(0, 0, l.r + 1.8, 0, Math.PI * 2); c.holes.push(hole(0, 0, hr(l)));
      b.add(at(extrude(c, cam.bump + 0.3, fm, 0.2), l.x, l.y, -tB / 2 - cam.bump / 2));
    });
    ctx.add('back', 'Back cover', `${s.back[0]} rear panel${s.qi ? ' — non-metallic so the wireless charging field can pass through' : ''}. Held by adhesive${s.swap ? ' or clips; on this phone it comes off by hand to reach the battery' : ' and softened with heat for removal'}.`,
      b, [0, 0, -D / 2 + tB / 2], [0, 0, -5.4 * GAP], [['Material', s.back[0]], ['Camera bump', `≈${cam.bump} mm`]]);
  }
}

const CAM = {
  wide: ['main camera', 'The largest sensor in the phone, behind a wide lens with optical image stabilisation — the sensor or lens floats on tiny voice-coil actuators.'],
  ultra: ['ultra-wide camera', 'Short focal length lens with a ~120° field of view; usually doubles as the macro camera.'],
  tele: ['telephoto camera', 'Longer lens stack for optical zoom. The module is as tall as the phone is thick, which is why the bump exists.'],
  peri: ['periscope telephoto', 'A prism folds the light 90° so the long lens path runs sideways through the body instead of sticking out the back.'],
  tof: ['depth sensor', 'Infrared time-of-flight sensor: fires laser pulses and times the return to build a depth map for focus and AR.'],
};
export function cameras(ctx, s, d, cam) {
  cam.lenses.forEach((l, i) => {
    const tip = -d.D / 2 - cam.bump - 0.2 - d.zc, base = -d.dep * 0.46, peri = l.kind === 'peri';
    const g = group(box(l.hs, l.hs, d.dep * 0.92, mat.metal(0x2a2c31, 0.45)),
      at(cyl(l.r * 0.86, base - tip, mat.plastic(0x09090b, 0.3)), 0, 0, (base + tip) / 2),
      at(peri ? box(l.r * 1.05, l.r * 1.05, 0.14, mat.lens()) : cyl(l.r * 0.6, 0.14, mat.lens()), 0, 0, tip - 0.05),
      at(box(l.hs * 0.5, 1.2, 0.5, mat.gold()), 0, l.hs / 2 + 0.6, 0));
    if (peri) g.add(at(box(l.dir[0] ? l.len : l.hs, l.dir[1] ? l.len : l.hs, d.dep * 0.8, mat.metal(0x8d9096, 0.35)), l.dir[0] * (l.hs + l.len) / 2, l.dir[1] * (l.hs + l.len) / 2, 0));
    const [label, desc] = CAM[l.kind], tof = l.kind === 'tof';
    ctx.add(`cam${i}`, tof ? (s.brand === 'Apple' ? 'LiDAR scanner' : 'ToF depth sensor') : `${l.mp} MP ${label}`, desc, g,
      [l.x, l.y, d.zc], [0, 0, -(2.7 + i * 0.25) * GAP], tof ? [] : [['Resolution', `${l.mp} MP`], ['Lens opening', `≈${(l.r * 2).toFixed(1)} mm`]]);
  });
}
