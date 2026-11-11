// spec (one row of phones.js) → { root, parts, pivots }
// part = { id, name, desc, specs, obj, home, ex, user, bb, rank }
//   home: assembled position · ex: offset at full explode · user: offset from dragging · bb: bounds around home
import * as THREE from 'three';
import { dims, camLayout, shell, cameras } from './body.js';
import { internals } from './internals.js';
import { classic, folding } from './special.js';

export function buildPhone(s) {
  const root = new THREE.Group(), parts = [];
  const ctx = {
    root, pivots: [],
    scope: {}, // { pivot, ox, oy, pre, suf } — foldables build each half with the slab code, shifted and re-parented
    add(id, name, desc, obj, pos, ex, specs = []) {
      const { pivot, ox = 0, oy = 0, pre = '', suf = '' } = ctx.scope;
      const bb = new THREE.Box3().setFromObject(obj);
      const part = {
        id: pre + id, name: name + suf, desc, specs, obj,
        home: new THREE.Vector3(pos[0] + ox, pos[1] + oy, pos[2]),
        ex: new THREE.Vector3(...ex), user: new THREE.Vector3(),
        bb,
      };
      if (pivot) part.home.sub(pivot.position);
      obj.position.copy(part.home);
      obj.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); m.userData.part = part; } }); // own materials → per-part highlight / x-ray
      (pivot || root).add(obj);
      parts.push(part);
      return part;
    },
  };

  if (s.lay === 'classic') classic(ctx, s);
  else if (s.lay === 'fold' || s.lay === 'flip') folding(ctx, s);
  else {
    const d = dims(s), cam = camLayout(s, d);
    shell(ctx, s, d, cam); cameras(ctx, s, d, cam); internals(ctx, s, d, cam);
  }

  const max = Math.max(...parts.map((p) => p.ex.length()), 1);
  parts.forEach((p) => (p.rank = p.ex.length() / max)); // far-travelling parts leave first
  return { root, parts, pivots: ctx.pivots };
}
