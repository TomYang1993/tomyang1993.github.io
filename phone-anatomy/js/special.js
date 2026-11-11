// Non-slab archetypes: foldables (book + clamshell) and keypad-era phones.
import * as THREE from 'three';
import { mat, rr, hole, rhole, extrude, slab, box, cyl, face, at, group, screenTex, labelTex, pcbTex } from './kit.js';
import { GAP as G, dims, camLayout, shell, cameras, surf } from './body.js';
import { internals, batteryMesh } from './internals.js';

export function folding(ctx, s) {
  const book = s.lay === 'fold', D = s.d;
  const hw = book ? s.w / 2 : s.w, hh = book ? s.h : s.h / 2;
  const hs = { ...s, w: hw, h: hh, thin: 1 }, d = dims(hs);
  const none = { lenses: [], isl: null, cb: null, bump: 0 }, cam = camLayout(hs, d);
  const wall = screenTex(s.h / s.w, s.back[1]);
  const names = book ? [' (left half)', ' (right half)'] : [' (bottom half)', ' (top half)'];

  [-1, 1].forEach((sg, i) => { // i=0: plain half · i=1: half with cameras + logic board
    const pivot = new THREE.Group(); pivot.position.set(0, 0, D / 2 + 0.12); ctx.root.add(pivot);
    ctx.pivots.push({ g: pivot, axis: book ? 'y' : 'x', sign: book ? -sg : sg });
    ctx.scope = { pivot, ox: book ? sg * hw / 2 : 0, oy: book ? 0 : sg * hh / 2, pre: i ? 'b-' : 'a-', suf: names[i] };
    const main = i === 1, c = main ? cam : none;

    const t = wall.clone(); t.needsUpdate = true; // each half shows its half of one wallpaper
    book ? (t.repeat.set(0.5, 1), t.offset.set(i * 0.5, 0)) : (t.repeat.set(1, 0.5), t.offset.set(0, i * 0.5));
    // the lit area runs right up to the crease: bezel on the three outer edges only
    const lw = hw - (book ? 2.3 : 4.4), lh = hh - (book ? 4.4 : 2.3), lx = book ? -sg * 1.1 : 0, ly = book ? 0 : -sg * 1.1;
    const scr = group(slab(hw - 0.3, hh - 0.3, 1.2, d.tD, mat.plastic(0x060607, 0.35)), at(face(lw, lh, 0.6, mat.glow(t)), lx, ly, d.tD / 2 + 0.02),
      at(face(lw, lh, 0.6, mat.glass(0xaabbcc, 0.12)), lx, ly, d.tD / 2 + 0.05));
    if (main) scr.add(at(face(3.6, 3.6, 1.8, new THREE.MeshBasicMaterial({ color: 0 })), 0, hh / 2 - 7, d.tD / 2 + 0.04));
    ctx.add('display', 'Foldable OLED', 'One continuous plastic-substrate OLED topped with ultra-thin glass about 30 µm thick — thin enough to bend around a ~1.5 mm radius. Shown split at the crease so each half can be lifted.',
      scr, [0, 0, D / 2 - d.tG - d.tD / 2], [0, 0, 3 * G], [['Diagonal (open)', `${s.scr}″`], ['Refresh', `${s.hz} Hz`]]);

    const flipTop = !book && main;
    shell(ctx, hs, d, c, { glass: false, display: false, back: main, buttons: main, sim: !main, port: book ? main : !main });
    if (main) cameras(ctx, hs, d, c);
    internals(ctx, hs, d, c, { top: main, bottom: book ? main : !main, front: main, coil: book ? main : !main, mah: Math.round(s.mah * (book ? (main ? 0.52 : 0.48) : (main ? 0.28 : 0.72)) / 10) * 10 });

    if (!main) { // outer side of the plain half
      if (book) {
        const cs = group(slab(hw - 0.5, hh - 0.5, s.r, d.tB, mat.plastic(0x060607, 0.3), 0.2), at(face(hw - 5, hh - 5, s.r - 2, mat.glow(screenTex((hh - 5) / (hw - 5), s.back[1])), true), 0, 0, -d.tB / 2 - 0.02));
        ctx.add('cover', 'Cover display', 'A second, rigid OLED on the outside so the phone works closed. Its glass doubles as this half’s back cover.', cs, [0, 0, -D / 2 + d.tB / 2], [0, 0, -5.4 * G], [['Type', 'Rigid OLED']]);
      } else {
        ctx.add('back', 'Back cover', 'Glass rear panel of the lower half; the wireless charging coil sits right behind it.', slab(hw - 0.5, hh - 0.5, s.r, d.tB, surf(s.back), 0.2), [0, 0, -D / 2 + d.tB / 2], [0, 0, -5.4 * G]);
      }
    } else if (flipTop) {
      const w = hw - 26, h = hh - 16;
      ctx.add('cover', 'Cover display', 'Small outer OLED set into the top half’s back glass for notifications and selfies with the main cameras.',
        group(slab(w, h, 4, 0.3, mat.plastic(0x060607, 0.3)), at(face(w - 1.5, h - 1.5, 3.5, mat.glow(screenTex(h / w, s.back[1])), true), 0, 0, -0.17)), [-9, -2, -D / 2 - 0.16], [0, 0, -6 * G], [['Type', 'Rigid OLED']]);
    }
  });
  ctx.scope = {};

  const len = (book ? s.h : s.w) - 9, fm = surf(s.frame), barrel = cyl(D * 0.58, len, fm);
  barrel.rotation.set(0, 0, book ? 0 : Math.PI / 2);
  const hinge = group(barrel);
  [-1, 1].forEach((e) => { const k = box(book ? D * 2.4 : 9, book ? 9 : D * 2.4, D * 0.5, mat.metal(0x8a8d92, 0.3)); k.position.set(book ? 0 : e * len * 0.36, book ? e * len * 0.36 : 0, D * 0.25); hinge.add(k); });
  ctx.add('hinge', 'Hinge', 'Dual-rail hinge with interlocking gears so both halves open in sync. The display folds into a teardrop-shaped cavity inside it, which keeps the bend radius gentle and the crease shallow.',
    hinge, [0, 0, -D * 0.22], [0, 0, -2.2 * G], [['Rated folds', '≈200,000']]);
}

export function classic(ctx, s) {
  const { w: W, h: H, d: D, r: R } = s, qw = s.front === 'qwerty', body = mat.plastic(s.frame[1], 0.4), tc = 2.4;
  const sw = qw ? 55 : 31, sh = qw ? 36.6 : 21, sy = H * (qw ? 0.22 : 0.2);
  // key rectangles: [x, y, w, h, r]
  const keys = [];
  if (qw) {
    [[-22, 10], [-11, 8], [11, 8], [22, 10]].forEach(([x, w]) => keys.push([x, sy - sh / 2 - 8.5, w, 6, 2]));
    for (let r = 0; r < 4; r++) for (let c = 0; c < 10; c++) keys.push([(c - 4.5) * 6.1, sy - sh / 2 - 19 - r * 8.3, 5.3, 7, 1.6]);
  } else {
    keys.push([0, sy - sh / 2 - 9, 17, 7, 3.5], [-15, sy - sh / 2 - 11.5, 8, 6, 3], [15, sy - sh / 2 - 11.5, 8, 6, 3]);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) keys.push([(c - 1) * 13.4, sy - sh / 2 - 21.5 - r * 9.4 - Math.abs(c - 1) * -1.5, 11, 6.6, 3.2]);
  }
  const fs = rr(W, H, R);
  fs.holes.push(rhole(0, sy, sw, sh, 1.5), ...keys.map(([x, y, w, h, r]) => rhole(x, y, w + 0.5, h + 0.5, r)));
  if (qw) fs.holes.push(hole(0, sy - sh / 2 - 8.5, 3.8));
  ctx.add('cover', 'Front cover', `Snap-on ${s.frame[0].toLowerCase()} fascia. On phones like this it was a consumer part — pop it off and click on another colour.`,
    group(extrude(fs, tc, body, 0.9), at(face(sw + 1, sh + 1, 1.5, mat.glass(0x8899aa, 0.18)), 0, sy, tc / 2 - 0.3)), [0, 0, D / 2 - tc / 2], [0, 0, 3.4 * G], [['Material', s.frame[0]]]);

  const rubber = mat.plastic(qw ? 0x1a1a1c : 0xd8d9d4, 0.7), km = group(at(slab(W - 8, (qw ? 50 : 52), 2, 0.6, rubber), 0, sy - sh / 2 - (qw ? 30 : 29), 0));
  keys.forEach(([x, y, w, h, r]) => km.add(at(slab(w, h, r, 3.4, rubber, 0.5), x, y, 1.7)));
  if (qw) km.add(at(new THREE.Mesh(new THREE.SphereGeometry(3.4, 24, 16), mat.plastic(0xe8e8e8, 0.2)), 0, sy - sh / 2 - 8.5, 1.2));
  ctx.add('keymat', qw ? 'QWERTY keypad & trackball' : 'Keypad mat', 'One moulded silicone sheet. Each key has a small plunger underneath that collapses a metal dome on the circuit board to close the contact.',
    km, [0, 0, D / 2 - tc - 0.5], [0, 0, 2.5 * G], [['Keys', String(keys.length)]]);

  const mono = s.panel === 'Mono LCD';
  ctx.add('display', `${s.panel} module`, mono ? '84 × 48 pixel reflective monochrome LCD. Four green LEDs and a light guide behind it provide the backlight; it connects to the board through a rubber zebra strip rather than a cable.'
    : 'Transmissive colour TFT with LED backlight, in a steel frame clipped to the chassis.',
    group(slab(sw + 6, sh + 6, 1, 1.8, mat.metal(0x9a9da2, 0.5)), at(face(sw, sh, 0.5, mat.glow(screenTex(sh / sw, s.back[1], mono))), 0, 0, 0.92)),
    [0, sy, D / 2 - tc - 1.3], [0, 0, 1.7 * G], [['Diagonal', `${s.scr}″`], ['Type', s.panel]]);

  const cs = rr(W - 0.8, H - 0.8, R); cs.holes.push(rr(W - 5, H - 5, R - 2));
  ctx.add('frame', 'Chassis', 'Inner frame that everything clips or screws to. Six Torx screws through it clamp the keypad, board and shielding into one sandwich.',
    extrude(cs, D - tc - 1.6, mat.plastic(0x2a2c30, 0.6), 0.6), [0, 0, (1.6 - tc) / 2], [0, 0, 0], [['Body', `${W} × ${H} × ${D} mm`]]);

  const zP = D / 2 - tc - 3.4, pw = W - 7, ph = H - 9, dome = mat.gold();
  const pcb = group(slab(pw, ph, R - 3, 1, mat.tex(pcbTex(0x0f3b2a), 0.65)));
  keys.forEach(([x, y]) => pcb.add(at(cyl(2, 0.15, dome), x, y, 0.55)));
  ctx.add('board', 'Circuit board', 'Single board: keypad contacts and display pads on the front, all the chips under shield cans on the back. The gold discs are the dome-switch landing pads.', pcb, [0, 0, zP], [0, 0, -0.5 * G]);
  const chip = (id, name, lines, x, y, w, h, desc) => ctx.add(id, name, desc, group(box(w, h, 1, mat.plastic(0x1b1c1f, 0.35)), at(face(w - 0.6, h - 0.6, 0.4, mat.tex(labelTex(lines, { w: 256, h: Math.round(256 * h / w), size: 0.2, fg: '#9a9da3', bg: '#1d1e21' }), 0.4), true), 0, 0, -0.52)), [x, y, zP - 1], [0, 0, -1.1 * G]);
  chip('soc', s.soc, [s.soc.split(' ').pop(), 'CPU'], -pw * 0.18, ph * 0.22, 13, 13, 'Baseband processor: runs the phone’s software and the cellular protocol stack on one chip.');
  chip('nand', 'Flash memory', ['FLASH'], pw * 0.2, ph * 0.24, 9, 12, 'Holds the firmware, contacts and messages.');
  chip('modem', 'RF power amplifier', ['PA', 'RF'], pw * 0.15, ph * 0.38, 8, 6, 'Boosts the transmit signal to up to 2 W toward the antenna — the hungriest part during a call.');

  const zb = -D / 2 + 1.7, bt = Math.min(D * 0.3, 6), bw = W - 12, bh = H * 0.46;
  ctx.add('antenna', 'Internal antenna', 'Stamped metal radiator on a plastic carrier at the top of the back — one of the first phones to hide the antenna inside the body.',
    group(box(W - 12, 14, 3, mat.plastic(0x3a3c40, 0.6)), at(box(W - 16, 10, 0.2, mat.metal(0xc9b37a, 0.4)), 0, 0, -1.6)), [0, H / 2 - 13, zb + 3.5], [0, 0, -1.9 * G]);
  ctx.add('earpiece', 'Earpiece', 'Dynamic receiver capsule pressed against the front cover.', cyl(5.5, 2.4, mat.metal(0x77797d, 0.4)), [0, H / 2 - 9, D / 2 - tc - 1.4], [0, 4, 1.2 * G]);
  const vib = group(cyl(2.4, 9, mat.metal(0xb9bcc0, 0.3)), at(cyl(2.6, 3, mat.metal(0x8a6a3a, 0.4)), 0, 0, 6)); vib.rotation.y = Math.PI / 2;
  ctx.add('haptic', 'Vibration motor', 'A small DC motor spinning an off-centre brass weight.', vib, [-pw * 0.2, -H / 2 + 9, zP - 3], [0, -6, -1.3 * G]);
  ctx.add('sim', 'SIM card', 'Mini-SIM in a sliding holder under the battery.', group(box(25, 15, 0.76, mat.plastic(0xeeeeee, 0.5)), at(face(11, 9, 1.5, mat.gold(), true), -4, 0, -0.4)), [0, H * 0.3 - 22, zb + bt + 0.6], [0, 0, -1.7 * G]);
  ctx.add('battery', 'Battery', `${s.year < 2003 ? 'Nickel-metal-hydride' : 'Lithium-ion'} pack that lifts straight out once the back cover is off — no tools, no adhesive.`,
    batteryMesh(s, bw, bh, bt), [0, -H * 0.1, zb + bt / 2], [0, 0, -2.6 * G], [['Capacity', `${s.mah} mAh`], ['Removable', 'Yes']]);

  const cam = camLayout({ ...s, year: 2008 }, { W, H }), bs = rr(W, H, R);
  cam.lenses.forEach((l) => { bs.holes.push(hole(l.x, l.y, l.r + 0.4));
    ctx.add('cam0', `${l.mp} MP camera`, 'Fixed-focus module with a tiny plastic lens stack.', group(box(8, 8, 4, mat.metal(0x2a2c31, 0.5)), at(cyl(l.r * 0.8, 1.6, mat.lens()), 0, 0, -2.6)), [l.x, l.y, -D / 2 + 3.6], [0, 0, -2.1 * G], [['Resolution', `${l.mp} MP`]]); });
  ctx.add('back', 'Back cover', `${s.back[0]} battery door that slides or unclips by hand.`, extrude(bs, 1.5, surf(s.back), 0.7), [0, 0, -D / 2 + 0.75], [0, 0, -3.8 * G], [['Material', s.back[0]]]);
  const barrel = s.port === 'DC barrel', pc = barrel ? cyl(1.9, 7, mat.metal(0xb9bcc0, 0.3)) : box(7.4, 6, 2.4, mat.metal(0xb9bcc0, 0.3));
  if (barrel) pc.rotation.x = 0;
  ctx.add('port', `${s.port} port`, barrel ? 'Charging-only barrel socket; the pads beside it are for desk-stand contacts.' : 'Charging and data socket soldered to the board.', pc, [barrel ? 0 : -W / 2 + 4, barrel ? -H / 2 + 4.5 : -H * 0.05, zP - 1.8], barrel ? [0, -14, -0.5 * G] : [-14, 0, -0.5 * G]);
}
