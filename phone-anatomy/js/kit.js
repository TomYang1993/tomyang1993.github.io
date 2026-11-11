// Geometry, material and texture helpers. Units are millimetres.
import * as THREE from 'three';

// --- materials -------------------------------------------------------------
export const mat = {
  metal: (c, rough = 0.35) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.88, roughness: rough }), // <1 so anodised colour survives a dark reflection
  plastic: (c, rough = 0.55) => new THREE.MeshStandardMaterial({ color: c, roughness: rough }),
  gloss: (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 }),
  glass: (c = 0x9fb0c0, o = 0.1) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.03, clearcoat: 1, transparent: true, opacity: o, depthWrite: false }),
  lens: () => new THREE.MeshPhysicalMaterial({ color: 0x0a1020, roughness: 0.02, clearcoat: 1, metalness: 0.6, iridescence: 1, iridescenceIOR: 1.6 }),
  copper: () => new THREE.MeshStandardMaterial({ color: 0xc87533, metalness: 1, roughness: 0.4 }),
  gold: () => new THREE.MeshStandardMaterial({ color: 0xd9b25a, metalness: 1, roughness: 0.3 }),
  tex: (map, rough = 0.6, metalness = 0) => new THREE.MeshStandardMaterial({ map, roughness: rough, metalness }),
  glow: (map) => new THREE.MeshBasicMaterial({ map, toneMapped: false }),
};

// --- shapes ------------------------------------------------------------------
export function rr(w, h, r) { // centred rounded rectangle
  r = Math.max(0.01, Math.min(r, w / 2, h / 2));
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2, q = Math.PI / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -q, 0);
  s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, q);
  s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, q, 2 * q);
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, 2 * q, 3 * q);
  return s;
}
export function hole(x, y, r) { const p = new THREE.Path(); p.absarc(x, y, r, 0, Math.PI * 2, true); return p; }
export function rhole(x, y, w, h, r) { // rounded-rect hole at offset
  return new THREE.Path().setFromPoints(rr(w, h, r).getPoints(6).map((p) => new THREE.Vector2(p.x + x, p.y + y)));
}

// Extrude a shape along z, centred on z=0. bevel rounds the edges without growing the outline.
export function extrude(shape, depth, material, bevel = 0) {
  const b = Math.min(bevel, depth / 2 - 0.01);
  const g = new THREE.ExtrudeGeometry(shape, b > 0
    ? { depth: depth - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelOffset: -b, bevelSegments: 4, curveSegments: 12 }
    : { depth, bevelEnabled: false, curveSegments: 12 });
  g.translate(0, 0, -depth / 2);
  const m = new THREE.Mesh(g, material);
  m.castShadow = m.receiveShadow = true;
  return m;
}
export const slab = (w, h, r, depth, material, bevel = 0) => extrude(rr(w, h, r), depth, material, bevel);
export function box(w, h, d, material) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.castShadow = m.receiveShadow = true;
  return m;
}
export function cyl(r, depth, material, seg = 40) { // axis along z
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, depth, seg), material);
  m.rotation.x = Math.PI / 2; m.castShadow = true;
  return m;
}
// Flat textured face (rounded corners). faces +z; pass flip to face -z.
export function face(w, h, r, material, flip = false) {
  const g = new THREE.ShapeGeometry(rr(w, h, r), 12);
  const uv = g.attributes.uv, pos = g.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  const m = new THREE.Mesh(g, material);
  if (flip) m.rotation.y = Math.PI;
  return m;
}
export const at = (o, x = 0, y = 0, z = 0) => { o.position.set(x, y, z); return o; };
export const group = (...kids) => { const g = new THREE.Group(); kids.forEach((k) => k && g.add(k)); return g; };

// --- canvas textures ---------------------------------------------------------
function canvas(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
const hex = (n) => '#' + n.toString(16).padStart(6, '0');
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; // deterministic, so a phone looks the same every load

export function screenTex(aspect, tint, mono = false) {
  return canvas(512, Math.round(512 * aspect), (g, w, h) => {
    if (mono) { // reflective STN LCD
      g.fillStyle = '#9db08a'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#1c2a18'; g.font = `700 ${w * 0.2}px monospace`; g.textAlign = 'center';
      g.fillText('12:00', w / 2, h * 0.55);
      for (let i = 0; i < 4; i++) g.fillRect(w * 0.06, h * (0.3 - i * 0.06), w * (0.03 + i * 0.012), h * 0.04);
      g.font = `${w * 0.09}px monospace`; g.fillText('Menu', w / 2, h * 0.92);
      return;
    }
    const c = new THREE.Color(tint), hsl = c.getHSL({});
    if (hsl.s < 0.2) c.setHSL(0.62, 0.55, 0.42); // grey/black/white phones get a default blue wallpaper
    const a = c.clone().offsetHSL(0.08, 0.2, 0.1), b = c.clone().offsetHSL(-0.1, 0.1, -0.25);
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#' + a.getHexString()); grad.addColorStop(1, '#' + b.getHexString());
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 5; i++) { // soft blobs
      const r = g.createRadialGradient(rnd() * w, rnd() * h, 0, w / 2, h / 2, w * (0.5 + rnd()));
      r.addColorStop(0, 'rgba(255,255,255,.18)'); r.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = r; g.fillRect(0, 0, w, h);
    }
    g.fillStyle = '#fff'; g.textAlign = 'center';
    g.font = `600 ${w * 0.24}px -apple-system, Helvetica, sans-serif`; g.fillText('9:41', w / 2, h * 0.24);
    g.font = `500 ${w * 0.05}px -apple-system, Helvetica, sans-serif`; g.fillText('Tuesday, November 10', w / 2, h * 0.11);
  });
}

export function labelTex(lines, { w = 512, h = 256, bg = '#16171a', fg = '#d8d8d8', size = 0.16 } = {}) {
  return canvas(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach((t, i) => {
      g.font = `${i ? 500 : 700} ${h * size * (i ? 0.62 : 1)}px Helvetica, Arial, sans-serif`;
      g.fillText(t, w / 2, h * (0.5 + (i - (lines.length - 1) / 2) * size * 1.15), w * 0.9);
    });
  });
}

export function pcbTex(color = 0x0f3b2a) { // traces, vias and passives
  return canvas(512, 512, (g, w, h) => {
    g.fillStyle = hex(color); g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 1.5;
    for (let i = 0; i < 90; i++) {
      let x = rnd() * w, y = rnd() * h; g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 4; k++) { rnd() > 0.5 ? (x += (rnd() - 0.5) * 120) : (y += (rnd() - 0.5) * 120); g.lineTo(x, y); }
      g.stroke();
    }
    for (let i = 0; i < 260; i++) {
      const x = rnd() * w, y = rnd() * h, t = rnd();
      g.fillStyle = t > 0.7 ? '#c9a24a' : t > 0.4 ? '#8d8f93' : '#2a2a2c';
      t > 0.85 ? (g.beginPath(), g.arc(x, y, 2.5, 0, 7), g.fill()) : g.fillRect(x, y, 3 + rnd() * 7, 3 + rnd() * 4);
    }
  });
}
