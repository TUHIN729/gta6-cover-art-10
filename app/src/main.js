// Wires the editor: pick a layout, a midday grade and a post size, type the
// title, subtitle and date, load your own photo into any panel (or use one of
// the drawn sample scenes), drag a photo inside its panel to reframe it,
// scroll to zoom, and export the cover as a PNG. A `?shot=` query sets up a
// fixed scene for a screenshot instead (./shots.js).
import { drawCover, SIZES, LAYOUTS, GRADES, layoutPanels } from './cover.js';
import { SAMPLE_SCENES } from './samples.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const panelList = document.getElementById('panels');

// One panel per layout cell: a drawn sample scene, or a photo the user loaded.
const DEFAULT_PANELS = {
  keyart: [{ scene: 'portrait' }, { scene: 'skyline' }, { scene: 'beach' }],
  trio: [{ scene: 'beach' }, { scene: 'skyline' }, { scene: 'chase' }],
  bleed: [{ scene: 'portrait' }],
};

const state = {
  size: '1080x1350',
  layout: 'keyart',
  grade: 'midday',
  title: 'VICE CITY HEAT',
  subtitle: 'Midday in Leonida',
  date: 'NOV 19 2026',
  panels: DEFAULT_PANELS.keyart.map((p) => ({ ...p, zoom: 1, ox: 0, oy: 0 })),
};

function redraw() {
  drawCover(canvas, state);
  buildPanelRows();
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function optionButtons(containerId, entries, current, onPick) {
  const box = document.getElementById(containerId);
  box.innerHTML = '';
  for (const [key, value] of entries) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (key === current ? ' on' : '');
    b.textContent = value.label;
    b.addEventListener('click', () => onPick(key));
    box.appendChild(b);
  }
}

function buildOptionRows() {
  optionButtons('layoutRow', Object.entries(LAYOUTS), state.layout, (key) => {
    state.layout = key;
    const fresh = DEFAULT_PANELS[key].map((p) => ({ ...p, zoom: 1, ox: 0, oy: 0 }));
    // Keep photos the user already loaded, in order, where the new layout has cells.
    state.panels.forEach((p, i) => { if (p.image && fresh[i]) fresh[i] = { ...p }; });
    state.panels = fresh;
    redraw();
    buildOptionRows();
  });
  optionButtons('gradeRow', Object.entries(GRADES), state.grade, (key) => {
    state.grade = key;
    redraw();
    buildOptionRows();
  });
  optionButtons('sizeRow', Object.entries(SIZES), state.size, (key) => {
    state.size = key;
    redraw();
    buildOptionRows();
  });
}

function panelLabel(panel, i) {
  if (panel.image) return `Panel ${i + 1} — your photo`;
  return `Panel ${i + 1} — ${SAMPLE_SCENES[panel.scene]?.label ?? panel.scene}`;
}

function buildPanelRows() {
  panelList.innerHTML = '';
  state.panels.forEach((panel, i) => {
    const row = document.createElement('div');
    row.className = 'panel-row';
    const name = document.createElement('span');
    name.textContent = panelLabel(panel, i);
    const scene = document.createElement('select');
    scene.setAttribute('aria-label', `Scene for panel ${i + 1}`);
    for (const [key, value] of Object.entries(SAMPLE_SCENES)) {
      const o = document.createElement('option');
      o.value = key;
      o.textContent = value.label;
      if (!panel.image && panel.scene === key) o.selected = true;
      scene.appendChild(o);
    }
    scene.addEventListener('change', () => {
      state.panels[i] = { scene: scene.value, zoom: 1, ox: 0, oy: 0 };
      redraw();
    });
    const upload = document.createElement('label');
    upload.className = 'upload';
    upload.textContent = 'Load photo';
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.hidden = true;
    file.addEventListener('change', async () => {
      const f = file.files[0];
      if (!f) return;
      state.panels[i] = { image: await loadImage(URL.createObjectURL(f)), zoom: 1, ox: 0, oy: 0 };
      redraw();
      status.textContent = `Photo loaded into panel ${i + 1}.`;
    });
    upload.appendChild(file);
    const zoom = document.createElement('input');
    zoom.type = 'range';
    zoom.min = '1';
    zoom.max = '2.5';
    zoom.step = '0.05';
    zoom.value = String(panel.zoom || 1);
    zoom.setAttribute('aria-label', `Zoom for panel ${i + 1}`);
    zoom.addEventListener('input', () => {
      panel.zoom = Number(zoom.value);
      redraw();
    });
    const fill = document.createElement('button');
    fill.type = 'button';
    fill.className = 'mini';
    fill.textContent = 'Fill all panels';
    fill.addEventListener('click', () => {
      state.panels = state.panels.map(() => ({ ...panel }));
      redraw();
      status.textContent = 'All panels filled with this scene.';
    });
    row.append(name, scene, upload, zoom, fill);
    panelList.appendChild(row);
  });
}

document.getElementById('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
document.getElementById('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
document.getElementById('date').addEventListener('input', (e) => { state.date = e.target.value; redraw(); });

document.getElementById('export').addEventListener('click', () => exportCover(state.size));
for (const key of Object.keys(SIZES)) {
  document.getElementById(`export-${key}`).addEventListener('click', () => exportCover(key));
}

function exportCover(sizeKey) {
  state.size = sizeKey;
  redraw();
  buildOptionRows();
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-city-heat-${sizeKey}.png`;
    a.click();
    status.textContent = `Saved vice-city-heat-${sizeKey}.png — ${SIZES[sizeKey].label}.`;
  }, 'image/png');
}

// Drag a photo inside its panel to reframe it; scroll to zoom that panel.
let dragPanel = null;
let dragStart = null;
function panelAt(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const x = (clientX - r.left) * (canvas.width / r.width);
  const y = (clientY - r.top) * (canvas.height / r.height);
  const rects = layoutPanels(state.layout, canvas.width, canvas.height);
  const i = rects.findIndex((rc) => x >= rc.x && x <= rc.x + rc.w && y >= rc.y && y <= rc.y + rc.h);
  return i === -1 ? null : { i, rect: rects[i], x, y };
}
canvas.addEventListener('pointerdown', (e) => {
  const hit = panelAt(e.clientX, e.clientY);
  if (!hit) return;
  dragPanel = hit.i;
  dragStart = { x: e.clientX, y: e.clientY, ox: state.panels[hit.i].ox || 0, oy: state.panels[hit.i].oy || 0 };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (dragPanel === null || !dragStart) return;
  const panel = state.panels[dragPanel];
  if (!panel.image) return;
  const r = canvas.getBoundingClientRect();
  const dx = (e.clientX - dragStart.x) * (canvas.width / r.width);
  const dy = (e.clientY - dragStart.y) * (canvas.height / r.height);
  panel.ox = Math.max(-1, Math.min(1, dragStart.ox - dx / (canvas.width * 0.4)));
  panel.oy = Math.max(-1, Math.min(1, dragStart.oy - dy / (canvas.height * 0.4)));
  redraw();
});
canvas.addEventListener('pointerup', () => { dragPanel = null; dragStart = null; });
canvas.addEventListener('wheel', (e) => {
  const hit = panelAt(e.clientX, e.clientY);
  if (!hit) return;
  e.preventDefault();
  const panel = state.panels[hit.i];
  panel.zoom = Math.max(1, Math.min(2.5, (panel.zoom || 1) - Math.sign(e.deltaY) * 0.1));
  redraw();
}, { passive: false });

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), (next) => {
    Object.assign(state, next);
    redraw();
    buildOptionRows();
  });
} else {
  buildOptionRows();
  redraw();
}
