import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PHONES } from './phones.js';
import { buildPhone } from './build.js';

const $ = (id) => document.getElementById(id);
const canvas = $('c'), calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const AMBER = 0xffb000, SHELL = /^(a-|b-)?(glass|display|frame|back|cover)$/;

// --- scene -------------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.35;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(32, 1, 5, 5000);
const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(140, 260, 220); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0008;
Object.assign(sun.shadow.camera, { left: -200, right: 200, top: 200, bottom: -200, near: 10, far: 900 });
const rim = new THREE.DirectionalLight(0xcfdcff, 1.5); rim.position.set(-180, 120, -240); // so the back isn't in the dark
scene.add(sun, rim, new THREE.HemisphereLight(0xdfe8ff, 0x30343c, 0.9));

const st = { explode: 0, explodeTo: 0, fold: 0, move: true, spin: !calm, xray: false, labels: true };
let phone = { root: new THREE.Group(), parts: [], pivots: [] }, spec, selected = null, hovered = null, drag = null, down = null;
let swing = null; // azimuth the camera is easing toward after Explode / Assemble
const FRONT = 0.6, SIDE = 1.12, UP = new THREE.Vector3(0, 1, 0);

// --- parts: explode maths, highlight -----------------------------------------
const clamp = (v) => Math.min(1, Math.max(0, v));
const tOf = (p) => { const t = clamp(st.explode * 1.5 - (1 - p.rank) * 0.5); return t * t * (3 - 2 * t); }; // far parts leave first
const rest = (p, out) => out.copy(p.home).addScaledVector(p.ex, tOf(p));

function glow(p, level) {
  p?.obj.traverse((m) => { if (m.isMesh && m.material.emissive) { m.material.emissive.setHex(level ? AMBER : 0); m.material.emissiveIntensity = level; } });
}
function repaint() {
  phone.parts.forEach((p) => glow(p, p === selected ? 0.42 : p === hovered ? 0.2 : 0));
  phone.parts.forEach((p) => [p.li, p.label, p.line].forEach((el) => el.classList.toggle('sel', p === selected)));
  const d = $('detail'); d.hidden = !selected;
  if (selected) d.innerHTML = `<h3>${selected.name}</h3><p>${selected.desc}</p><dl>${selected.specs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
}
const select = (p) => { selected = p; repaint(); p?.li.scrollIntoView({ block: 'nearest' }); };
const hover = (p) => { if (p !== hovered) { hovered = p; repaint(); canvas.style.cursor = p ? (st.move ? 'move' : 'pointer') : 'grab'; } };

function xray() {
  phone.parts.filter((p) => SHELL.test(p.id)).forEach((p) => p.obj.traverse((m) => {
    if (!m.isMesh) return;
    const o = (m.userData.o ??= { transparent: m.material.transparent, opacity: m.material.opacity, depthWrite: m.material.depthWrite });
    Object.assign(m.material, st.xray ? { transparent: true, opacity: Math.min(o.opacity, 0.1), depthWrite: false } : o);
    m.material.needsUpdate = true; // toggling .transparent needs a recompile
    m.castShadow = !st.xray;
  }));
}

// --- pointer: drag parts, click to inspect -------------------------------------
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), v = new THREE.Vector3();
function aim(e) {
  const r = canvas.getBoundingClientRect();
  ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ptr, camera);
}
function pick(e) {
  aim(e);
  return ray.intersectObject(phone.root, true).find((h) => { const p = h.object.userData.part; return p && p.obj.visible && !(st.xray && SHELL.test(p.id)); });
}
canvas.addEventListener('pointerdown', (e) => { // registered before OrbitControls so it can veto the orbit
  const hit = pick(e), part = hit?.object.userData.part;
  down = { x: e.clientX, y: e.clientY, part };
  if (!part || !st.move || e.button !== 0) return;
  controls.enabled = false;
  const parent = part.obj.parent;
  drag = { part, plane: new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()), hit.point), grab: parent.worldToLocal(hit.point.clone()).sub(part.obj.position) };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return hover(e.buttons ? hovered : pick(e)?.object.userData.part ?? null);
  aim(e);
  if (!ray.ray.intersectPlane(drag.plane, v)) return;
  const p = drag.part;
  p.obj.position.copy(p.obj.parent.worldToLocal(v).sub(drag.grab));
  p.user.copy(p.obj.position).sub(rest(p, new THREE.Vector3()));
});
addEventListener('pointerup', (e) => {
  if (!down) return;
  if (Math.hypot(e.clientX - down.x, e.clientY - down.y) < 5 && e.target === canvas) select(down.part ?? null);
  drag = down = null; controls.enabled = true;
});
canvas.addEventListener('dblclick', (e) => pick(e)?.object.userData.part.user.set(0, 0, 0));

const controls = new OrbitControls(camera, canvas);
Object.assign(controls, { enableDamping: true, dampingFactor: 0.08, autoRotateSpeed: 0.9, minDistance: 60, maxDistance: 1500 });
controls.addEventListener('start', () => (swing = null)); // the user's hand wins

// --- viewport ------------------------------------------------------------------
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight, pr = renderer.getPixelRatio();
  if (!w || !h || (canvas.width === Math.round(w * pr) && canvas.height === Math.round(h * pr))) return false;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  return true;
}
function fit() { // pull the camera back until the phone (and its exploded stack) fits both ways
  const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const w = canvas.clientWidth, h = canvas.clientHeight || 1, room = w > 560 ? (w - 280) / h : camera.aspect; // keep clear of the callout columns
  const dist = Math.max(spec.h * 0.64, (spec.w * 0.5 + 42) / room) / t;
  camera.position.sub(controls.target).setLength(dist).add(controls.target);
}

// --- load a phone --------------------------------------------------------------
function load(id) {
  spec = PHONES.find((p) => p.id === id) ?? PHONES.find((p) => p.id === 'iphone-15-pro-max');
  scene.remove(phone.root);
  phone.root.traverse((m) => { if (m.isMesh) { m.geometry.dispose(); m.material.map?.dispose(); m.material.dispose(); } });
  phone = buildPhone(spec); scene.add(phone.root);
  selected = hovered = null;
  Object.assign(st, { explode: calm ? 0 : 1.15, explodeTo: 0, fold: 0 }); // arrive exploded, then assemble
  phone.parts.forEach((p) => rest(p, p.obj.position));
  camera.position.set(Math.sin(FRONT), 0.24, Math.cos(FRONT)); controls.target.set(0, 0, 0); swing = null; resize(); fit();

  history.replaceState(null, '', '#' + spec.id);
  $('t-name').textContent = `${spec.brand} ${spec.name}`;
  $('t-meta').textContent = `${spec.year} · ${spec.w} × ${spec.h} × ${spec.d} mm · ${phone.parts.length} parts`;
  const cams = spec.cams.filter((c) => c[0]).map((c) => `${c[0]} MP ${c[1] === 'peri' ? 'periscope' : c[1]}`).join('<br>') || 'none';
  $('specs').innerHTML = [['Year', spec.year], ['Body', `${spec.w} × ${spec.h} × ${spec.d} mm`], ['Weight', `≈${spec.g} g`], ['Display', `${spec.scr}″ ${spec.panel}${spec.hz ? ` ${spec.hz} Hz` : ''}`],
    ['Chipset', spec.soc], ['Battery', `${spec.mah} mAh`], ['Rear cameras', cams], ['Port', spec.port], ['Frame', spec.frame[0]], ['Back', spec.back[0]]].map(([k, val]) => `<dt>${k}</dt><dd>${val}</dd>`).join('');

  $('labels').replaceChildren(); $('leaders').replaceChildren(); $('parts').replaceChildren(); $('count').textContent = `(${phone.parts.length})`;
  phone.parts.forEach((p) => {
    p.label = $('labels').appendChild(Object.assign(document.createElement('span'), { textContent: p.name }));
    p.line = $('leaders').appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'polyline'));
    p.li = $('parts').appendChild(document.createElement('li'));
    const name = p.li.appendChild(Object.assign(document.createElement('button'), { textContent: p.name }));
    const eye = p.li.appendChild(Object.assign(document.createElement('button'), { className: 'eye', textContent: 'hide', title: 'Show / hide this part' }));
    name.onclick = () => select(p); p.li.onpointerenter = () => hover(p); p.li.onpointerleave = () => hover(null);
    eye.onclick = () => { p.obj.visible = !p.obj.visible; p.li.classList.toggle('off', !p.obj.visible); eye.textContent = p.obj.visible ? 'hide' : 'show'; };
  });
  phone.parts.forEach((p) => (p.lw = p.label.offsetWidth));
  $('foldwrap').hidden = !phone.pivots.length; $('fold').value = 0; $('explode').value = 0; $('toggle').textContent = 'Explode';
  document.querySelectorAll('#list button').forEach((b) => b.setAttribute('aria-current', b.dataset.id === spec.id));
  xray(); repaint();
}

// --- phone list + controls -----------------------------------------------------
function list(q = '') {
  const match = PHONES.filter((p) => `${p.brand} ${p.name} ${p.year} ${p.soc}`.toLowerCase().includes(q.toLowerCase()));
  const brands = [...new Set(match.map((p) => p.brand))];
  $('list').innerHTML = brands.map((b) => `<h3>${b}</h3>` + match.filter((p) => p.brand === b)
    .map((p) => `<button data-id="${p.id}" aria-current="${p.id === spec?.id}">${p.name}<small>${p.year}</small></button>`).join('')).join('') || '<p class="fine">No match.</p>';
}
$('list').onclick = (e) => { const b = e.target.closest('button'); if (b) load(b.dataset.id); };
$('q').oninput = (e) => list(e.target.value);
$('q').placeholder = `Search ${PHONES.length} phones…`;
$('explode').oninput = (e) => { st.explodeTo = +e.target.value; $('toggle').textContent = st.explodeTo > 0.5 ? 'Assemble' : 'Explode'; };
$('toggle').onclick = () => {
  st.explodeTo = st.explodeTo > 0.5 ? 0 : 1; $('explode').value = st.explodeTo; $('toggle').textContent = st.explodeTo ? 'Assemble' : 'Explode';
  if (!calm) swing = st.explodeTo ? SIDE : FRONT; // turn side-on so the layers fan out instead of hiding each other
};
$('fold').oninput = (e) => { st.fold = +e.target.value; };
[['move', 'move'], ['spin', 'spin'], ['xray', 'xray'], ['lab', 'labels']].forEach(([id, k]) => {
  $(id).setAttribute('aria-pressed', st[k]);
  $(id).onclick = () => { st[k] = !st[k]; $(id).setAttribute('aria-pressed', st[k]); if (k === 'xray') xray(); };
});
$('reset').onclick = () => load(spec.id);
addEventListener('hashchange', () => location.hash.slice(1) !== spec.id && load(location.hash.slice(1)));

// --- frame loop ------------------------------------------------------------------
const clock = new THREE.Clock(), goal = new THREE.Vector3();
function labels() { // callouts in a column down each side, joined to their part by a leader line
  const w = canvas.clientWidth, h = canvas.clientHeight, show = st.labels && st.explode > 0.45 && w > 560, cols = { [-1]: [], 1: [] };
  for (const p of phone.parts) {
    const { min, max } = p.bb;
    p.bb.getCenter(v).add(p.obj.position); p.obj.parent.localToWorld(v).project(camera);
    const on = show && p.obj.visible && v.z < 1, side = v.x < 0 ? -1 : 1;
    p.label.style.opacity = p.line.style.opacity = on ? 1 : 0;
    if (!on) continue;
    v.set(side < 0 ? min.x : max.x, (min.y + max.y) / 2, (min.z + max.z) / 2).add(p.obj.position); p.obj.parent.localToWorld(v).project(camera);
    cols[side].push({ p, x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h });
  }
  for (const side of [-1, 1]) {
    const col = cols[side].sort((a, b) => a.y - b.y), step = 15;
    let y = 60; for (const c of col) { c.ly = Math.max(c.y, y); y = c.ly + step; } // push down past the one above…
    y = h - 14; for (let i = col.length - 1; i >= 0; i--) { col[i].ly = Math.min(col[i].ly, y); y = col[i].ly - step; } // …then back up if the column ran off the bottom
    for (const { p, x, y: py, ly } of col) {
      const lx = side < 0 ? 14 : w - 14 - p.lw, end = side < 0 ? lx + p.lw + 5 : lx - 5;
      p.label.style.transform = `translate(${lx}px,${ly - 7}px)`;
      p.line.setAttribute('points', `${x.toFixed(1)},${py.toFixed(1)} ${end + side * -12},${ly} ${end},${ly}`);
    }
  }
}
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05), k = 1 - Math.exp(-dt * 9);
  st.explode += (st.explodeTo - st.explode) * (1 - Math.exp(-dt * 3.2));
  for (const p of phone.parts) if (drag?.part !== p) p.obj.position.lerp(rest(p, goal).add(p.user), k);
  const angle = st.fold * (1 - clamp(st.explode)) * 1.553; // ≈89° per half
  for (const { g, axis, sign } of phone.pivots) g.rotation[axis] += (sign * angle - g.rotation[axis]) * k;
  if (swing !== null) {
    const o = v.copy(camera.position).sub(controls.target), d = Math.atan2(Math.sin(swing - Math.atan2(o.x, o.z)), Math.cos(swing - Math.atan2(o.x, o.z)));
    if (Math.abs(d) < 0.01) swing = null; else camera.position.copy(controls.target).add(o.applyAxisAngle(UP, d * (1 - Math.exp(-dt * 3.5))));
  }
  controls.autoRotate = st.spin && !down && swing === null;
  controls.update();
  if (resize()) fit();
  renderer.render(scene, camera);
  labels();
  requestAnimationFrame(frame);
}

list(); load(location.hash.slice(1));
frame();
window.__pa = { st, get phone() { return phone; }, PHONES, load, camera }; // console handle for poking at the scene
