// Everything between the mid-plate and the back cover of a slab phone (or one half of a foldable).
import * as THREE from 'three';
import { mat, rr, extrude, slab, box, cyl, face, at, group, labelTex, pcbTex } from './kit.js';
import { GAP as G, portSize } from './body.js';

const PCB = { Apple: 0x14161b, Samsung: 0x0c3558, Sony: 0x14161b, OnePlus: 0x15171c };
const radio = (y) => (y < 2008 ? '2G GSM/EDGE' : y < 2012 ? '3G HSPA' : y < 2020 ? '4G LTE' : '5G');
const steel = () => mat.metal(0xb9bcc0, 0.32), black = () => mat.plastic(0x101113, 0.5);
const ycyl = (r, len, m) => { const c = cyl(r, len, m); c.rotation.x = 0; return c; }; // axis along y

export function batteryMesh(s, w, h, t, foot) { // foot: [fw, fh] extra lobe at bottom-right → L-shaped cell
  let shape = rr(w, h, 1.6);
  if (foot) {
    const [fw, fh] = foot, x = w / 2, y = h / 2;
    shape = new THREE.Shape([[-x, -y], [x + fw, -y], [x + fw, -y + fh], [x, -y + fh], [x, y], [-x, y]].map(([a, b]) => new THREE.Vector2(a, b)));
  }
  const nimh = s.year < 2003, v = nimh ? 3.6 : 3.87, lw = Math.min(w * 0.82, 42), lh = lw * 0.5;
  const tex = () => mat.tex(labelTex([nimh ? 'Ni-MH Battery' : 'Li-ion Polymer Battery', `${s.mah} mAh  ·  ${(s.mah * v / 1000).toFixed(2)} Wh`, `${v} V ⎓   Do not puncture`], { bg: '#1a1b1e' }), 0.5);
  return group(extrude(shape, t, mat.plastic(0x22252a, 0.38), 0.35),
    at(face(lw, lh, 1, tex()), 0, h * 0.12, t / 2 + 0.02), at(face(lw, lh, 1, tex(), true), 0, h * 0.12, -t / 2 - 0.02),
    at(box(Math.min(w * 0.45, 18), 2, t * 0.6, mat.gold()), -w * 0.18, h / 2 + 0.6, 0));
}

export function internals(ctx, s, d, cam, o = {}) {
  const { cx, cy, zc, dep, z0, z1, H } = d, apple = s.lay === 'apple', pen = s.pen ? 7 : 0;
  const zb = o.bottom === false ? 0 : Math.max(12, cy * 0.23); // height of the bottom zone
  const yBot = -cy + zb + 1.5, cb = cam.cb;
  let rects = [], bat = [-cx + 2, yBot, cx - 2, cy - 2], foot = null;

  if (o.top !== false && cb) {
    if (apple) { // board is a strip under the cameras, battery beside it
      const sw = Math.max(cb.x1 - cb.x0 + 1, cx * 0.68), yT = cb.y0 - 1, L = s.batt === 'L';
      const yB = L ? yT - cy * 0.72 : yBot;
      rects.push([cx - sw, yB, cx, yT]);
      bat = [-cx + 2, yBot, cx - sw - 1.5, cb.x0 < 0 ? yT - 0.5 : cy - 8];
      if (L) foot = [sw - 0.5, yB - 1.5 - yBot];
    } else { // board across the top wrapping the cameras, battery below
      const yB = cb.y0 - 1 - Math.max(16, cy * 0.6 - (cy - cb.y0));
      rects.push([-cx + pen, yB, cx, cb.y0 - 1]);
      if (cb.x1 - cb.x0 < cx * 1.3) {
        if (cb.x0 + cx > 12) rects.push([-cx, cb.y0 - 1, cb.x0 - 1, cy - 8]);
        if (cx - cb.x1 > 12) rects.push([cb.x1 + 1, cb.y0 - 1, cx, cy - 8]);
      }
      bat = [-cx + 2 + pen, yBot, cx - 2, yB - 1.5];
    }
  }

  // --- logic board + chips ---------------------------------------------------
  if (rects.length) {
    const [bx0, by0, bx1, by1] = rects[0], bw = bx1 - bx0, bh = by1 - by0, ox = (bx0 + bx1) / 2, oy = (by0 + by1) / 2;
    const pm = mat.tex(pcbTex(PCB[s.brand] ?? 0x0f3b2a), 0.65), zB = z1 + 0.6;
    const board = group(...rects.map(([a, b, c, e]) => at(slab(c - a, e - b, 1.2, 0.6, pm), (a + c) / 2 - ox, (b + e) / 2 - oy, 0)));
    ctx.add('board', 'Logic board', 'Multi-layer PCB carrying nearly every chip. Flagships stack two boards with an interposer ring between them to fit more silicon in less area; the cut-outs clear the camera modules.',
      board, [ox, oy, zB], [0, 0, -1.6 * G], [['Layers', s.year < 2012 ? '6–8' : '10–12 (HDI)']]);

    const gen = radio(s.year), short = s.soc.replace(/^(Apple|Google|Samsung|Qualcomm|Marvell|Nokia) /, '');
    const chips = [
      ['soc', s.soc, [short, 'SoC · RAM'], 12.5, 12.5, `System-on-chip: CPU, GPU, image processor and neural engine on one die. The RAM is ${s.year < 2024 ? 'stacked directly on top (package-on-package)' : 'packaged alongside or on top'} to keep traces short.`],
      ['nand', 'NAND flash storage', ['NAND', 'Flash'], 11, 13, 'Non-volatile storage for the OS, apps and photos. Soldered down — there is no upgrading it later.'],
      ['modem', `${gen} modem & RF transceiver`, [gen, 'Modem'], 9, 9, 'Translates between digital data and radio. Surrounded by power amplifiers and filters for every band the phone supports.'],
      ['pmic', 'Power management IC', ['PMIC'], 6.5, 6.5, 'Generates the dozen-plus voltage rails the other chips need and controls battery charging.'],
      ...(s.year > 2006 ? [['wifi', 'Wi-Fi / Bluetooth module', ['Wi-Fi', 'BT'], 7, 8, 'Combined short-range radio in a shielded system-in-package.']] : []),
    ];
    let k = 1, spots = [];
    for (; k > 0.3; k *= 0.92) { // flow-pack the chips, shrinking until they fit this board
      spots = []; let x = 1.5, y = 1.5, row = 0, ok = true;
      for (const c of chips) {
        const w = c[3] * k, h = c[4] * k;
        if (x + w > bw - 1.5) { x = 1.5; y += row + 1.2; row = 0; }
        if (x + w > bw - 1.5 || y + h > bh - 1.5) { ok = false; break; }
        spots.push([bx0 + x + w / 2, by1 - y - h / 2, w, h]); x += w + 1.2; row = Math.max(row, h);
      }
      if (ok) break;
    }
    const zC = zB + 0.3 + 0.35;
    chips.forEach(([id, name, lines, , , desc], i) => {
      const [x, y, w, h] = spots[i] || spots[0];
      const c = group(box(w, h, 0.7, mat.plastic(0x1b1c1f, 0.35)), at(face(w - 0.6, h - 0.6, 0.4, mat.tex(labelTex(lines, { w: 256, h: Math.round(256 * h / w), size: 0.2, fg: '#9a9da3', bg: '#1d1e21' }), 0.4)), 0, 0, 0.36));
      ctx.add(id, name, desc, c, [x, y, zC], [0, 0, -1.15 * G], id === 'soc' ? [['Chip', s.soc], ['Package', `≈${w.toFixed(1)} × ${h.toFixed(1)} mm`]] : []);
    });
    const [sx, sy, sw, sh] = spots[0];
    ctx.add('shield', 'EMI shield', 'Stamped metal can soldered over the processor. It blocks radio interference in both directions and, with thermal paste, passes heat on to the frame.',
      slab(sw + 1.6, sh + 1.6, 0.8, 0.2, steel()), [sx, sy, zC + 0.5], [0, 0, -0.7 * G]);
  }

  // --- battery, charging coil, heat ------------------------------------------
  const [x0, y0, x1, y1] = bat, bw = x1 - x0, bh = y1 - y0, by = (y0 + y1) / 2, wh = (s.mah * 3.87 / 1000).toFixed(2);
  ctx.add('battery', 'Battery', `${s.year < 2003 ? 'Nickel-metal-hydride pack' : 'Lithium-ion polymer pouch cell'}${foot ? ', L-shaped to fill the space beside the logic board' : ''}. The small board on its edge is the protection circuit that cuts off over-charge and short circuits. ${s.swap ? 'User-removable on this phone.' : 'Held down with stretch-release adhesive.'}`,
    batteryMesh({ ...s, mah: o.mah ?? s.mah }, bw, bh, dep - 0.4, foot), [(x0 + x1) / 2, by, zc], [0, 0, -2.1 * G],
    [['Capacity', `${o.mah ?? s.mah} mAh`], ['Energy', `≈${o.mah ? (o.mah * 3.87 / 1000).toFixed(2) : wh} Wh`], ['Cell size', `≈${bw.toFixed(0)} × ${bh.toFixed(0)} mm`]]);

  if (s.qi && o.coil !== false) {
    const rc = Math.min(21, cx * 0.62), cu = mat.copper();
    const coil = group(cyl(rc + 2, 0.1, black()));
    for (let i = 0; i < 9; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(rc - i * 1.05, 0.34, 6, 72), cu); t.scale.z = 0.45; coil.add(t); }
    ctx.add('coil', 'Wireless charging coil', 'Flat copper spiral on a ferrite sheet. An alternating magnetic field from the charger induces current in it; the ferrite stops that field from heating the battery.',
      coil, [0, by, z1 - 0.22], [0, 0, -3.9 * G], [['Standard', s.mag ? 'Qi2 / magnetic' : 'Qi']]);
    if (s.mag) {
      const m = group(), rm = Math.min(rc + 5, cx - 1.5);
      for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2 + Math.PI / 2; if (i === 9) continue; const b = box(4.6, 2.4, 0.4, steel()); b.position.set(Math.cos(a) * rm, Math.sin(a) * rm, 0); b.rotation.z = a + Math.PI / 2; m.add(b); }
      m.add(at(box(2.4, 6.5, 0.4, steel()), 0, -rm - 6, 0));
      ctx.add('magnets', s.brand === 'Apple' ? 'MagSafe magnet array' : 'Qi2 magnet array', 'Ring of alternating-polarity magnets that snaps a charger into perfect alignment with the coil. The single bar below it stops accessories from rotating.',
        m, [0, by, z1 - 0.22], [0, 0, -4.5 * G]);
    }
  }
  if (s.vc && o.top !== false) ctx.add('vapor', 'Vapor chamber', 'Sealed copper envelope holding a few drops of water. It boils at the hot processor, condenses at the cool end and wicks back — moving heat far faster than solid copper.',
    slab(cx * 1.1, cy * 0.95, 2, 0.3, mat.copper()), [0, cy * 0.2, z0 + 0.17], [0, 0, -0.25 * G]);

  // --- bottom zone: port, speaker, haptics -------------------------------------
  if (o.bottom !== false) {
    const yz = -cy + zb / 2, [pw, ph] = portSize(s), sp = apple || pen ? 1 : -1, zs = Math.min(1, dep / (ph + 0.6));
    const sh = rr(pw + 0.6, ph + 0.6, ph / 2 + 0.3); sh.holes.push(rr(pw - 0.4, ph - 0.4, ph / 2 - 0.2));
    const can = extrude(sh, 6.5, steel()); can.rotation.x = Math.PI / 2; can.scale.y = zs;
    const port = group(at(can, 0, 0, 0), at(box(pw - 2.4, 4.6, 0.45 * zs, black()), 0, 0.6, 0),
      at(slab(pw + 6, zb - 2, 0.8, 0.14, mat.plastic(0xb4651f, 0.6)), 0, zb / 2 - 0.5, -dep * 0.3), at(cyl(1.3, 1, steel()), pw / 2 + 3.4, 1.5, -dep * 0.2));
    ctx.add('port', `${s.port} port`, `Charging and data connector on its own flex cable, so a worn port can be swapped without touching the logic board. The small can beside it is the main microphone.`,
      port, [0, -cy + 3, zc], [0, -16, -1.7 * G], [['Opening', `${pw} × ${ph} mm`]]);

    const spw = cx * 0.72, spd = Math.min(dep * 0.85, 4.2);
    ctx.add('speaker', 'Loudspeaker', 'Sealed acoustic chamber around a tiny driver. The enclosed air acts as the spring, so the box is made as large as the layout allows.',
      group(box(spw, zb - 3, spd, black()), at(face(spw * 0.5, (zb - 3) * 0.55, 1, steel()), -spw * 0.15, 0, spd / 2 + 0.02), at(box(3, 1.2, 0.5, mat.gold()), spw * 0.3, (zb - 3) / 2, 0)),
      [sp * cx * 0.56, yz + 0.5, zc], [sp * 4, -4, -1.9 * G]);

    const hx = -sp * cx * (pen ? 0.42 : 0.56), taptic = s.brand === 'Apple' && s.year >= 2015, lra = s.year >= 2017;
    const hw = pen ? 9 : Math.min(cx * 0.66, taptic ? 22 : 12), hd = Math.min(dep * 0.85, 3.4);
    const hm = taptic || lra ? group(box(hw, taptic ? zb - 4 : 6, hd, steel()), at(face(hw * 0.7, 3.2, 0.5, mat.tex(labelTex([taptic ? 'TAPTIC ENGINE' : 'LRA'], { h: 96, size: 0.5, bg: '#b7babf', fg: '#33363a' }), 0.4, 0.6)), 0, 0, hd / 2 + 0.02)) : cyl(4.2, Math.min(dep * 0.8, 2.6), steel());
    ctx.add('haptic', taptic ? 'Taptic Engine' : lra ? 'Linear vibration motor' : 'Vibration motor', taptic || lra
      ? 'Linear resonant actuator: a weight on springs driven back and forth by a voice coil. It starts and stops within milliseconds, which is what makes taps feel crisp.'
      : 'Eccentric rotating mass motor — an off-centre weight spun by a tiny DC motor. Cheap, but slow to spin up and down.', hm, [hx, yz + 0.5, zc], [-sp * 4, -4, -1.9 * G]);
  }
  if (s.jack && o.top !== false) ctx.add('jack', '3.5 mm headphone jack', 'Barrel socket with spring contacts for tip, rings and sleeve. Its depth — about 14 mm of solid volume — is a large part of why it disappeared.',
    group(ycyl(2.3, 13, black()), at(box(4.6, 2, 0.5, mat.gold()), 0, -7, 0)), [-cx * 0.62, cy - 6.5, zc], [0, 14, -1.7 * G]);
  if (pen) {
    const p = group(ycyl(2.3, 100, mat.plastic(s.back[1], 0.5)), at(ycyl(0.7, 4, black()), 0, 52, 0));
    ctx.add('pen', 'S Pen', 'Passive stylus read by a digitiser layer under the display. A supercapacitor inside powers its Bluetooth button and recharges in the silo.', p, [-cx + 2.9, -H / 2 + 52, zc], [0, -75, 0], [['Length', '≈105 mm']]);
  }

  // --- front sensors -----------------------------------------------------------
  if (o.front !== false) {
    ctx.add('earpiece', 'Earpiece speaker', 'Small receiver firing through a slit at the top of the glass. On most recent phones it also plays the second stereo channel.',
      group(box(10, 1.6, 1.5, mat.metal(0x35373b, 0.5)), at(box(8, 0.5, 0.2, steel()), 0, 0, 0.8)), [0, cy - 0.9, z0 - 0.8], [0, 5, 2 * G]);
    const lensAt = (x, r) => at(cyl(r, 0.3, mat.lens()), x, 0, 1.1), faceId = s.brand === 'Apple' && (s.front === 'notch' || s.front === 'island');
    if (faceId) ctx.add('truedepth', 'TrueDepth camera system', 'Three parts on one bracket: a dot projector that throws ~30,000 infrared dots onto your face, a flood illuminator, and an infrared camera that reads the pattern for Face ID. The selfie camera sits beside them.',
      group(box(24, 4.2, 2, mat.metal(0x2a2c31, 0.5)), lensAt(-8.5, 1.5), lensAt(-2.5, 1.1), lensAt(4, 1.7), lensAt(9.5, 1.3)), [0, cy - 4.6, z0 - 1.05], [0, 0, 2 * G], [['Selfie camera', s.year >= 2025 ? '18 MP' : '12 MP' ]]);
    else ctx.add('frontcam', 'Front camera', 'Fixed- or auto-focus selfie module. On punch-hole phones it peers through a laser-cut hole in the display stack.',
      group(box(5.5, 5.5, 2, mat.metal(0x2a2c31, 0.5)), lensAt(0, 1.7)), [s.front === 'punch' ? 0 : -9, cy - 4.5, z0 - 1.05], [0, 0, 2 * G]);
  }
}
