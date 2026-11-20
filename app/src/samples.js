// Four procedural midday scenes, drawn on canvas in a flat poster style.
// No photo, no real person, no Rockstar artwork: every shape below is drawn
// by this file. Each scene draws into a rectangle (x, y, w, h) of any canvas,
// so the cover engine can paint it into a panel of any size, and the editor
// can use it as a stand-in photo until the user loads their own.
//
// Scenes: beach (bright Vice City beach at noon), skyline (downtown towers in
// sun-bleach), chase (sports-car freeze-frame), portrait (low-angle hero
// close-up with sunglasses and a gold chain — the cover's anchor).

const INK = '#12333a'; // deep teal outline used across every scene

function clipRect(ctx, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
}

function sunDisc(ctx, cx, cy, r) {
  const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 2.6);
  glow.addColorStop(0, 'rgba(255, 250, 220, 0.95)');
  glow.addColorStop(0.45, 'rgba(255, 244, 190, 0.45)');
  glow.addColorStop(1, 'rgba(255, 244, 190, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 2.6, cy - r * 2.6, r * 5.2, r * 5.2);
  ctx.fillStyle = '#fffbe8';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
  ctx.fill();
}

// A palm tree leaning `lean` (-1..1), drawn from (bx, by) upward, `s` tall.
function palmTree(ctx, bx, by, s, lean) {
  ctx.save();
  ctx.translate(bx, by);
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = Math.max(2, s * 0.045);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(lean * s * 0.25, -s * 0.55, lean * s * 0.45, -s);
  ctx.stroke();
  const tx = lean * s * 0.45;
  const ty = -s;
  ctx.strokeStyle = '#0e7a5f';
  ctx.lineWidth = Math.max(3, s * 0.06);
  for (let i = 0; i < 7; i++) {
    const a = (-Math.PI * 0.08) - (i / 6) * Math.PI * 0.95;
    const len = s * (0.5 + (i % 2) * 0.12);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(
      tx + Math.cos(a) * len * 0.6, ty + Math.sin(a) * len * 0.5 - s * 0.08,
      tx + Math.cos(a) * len, ty + Math.sin(a) * len + s * 0.16,
    );
    ctx.stroke();
  }
  ctx.fillStyle = '#5c3a17';
  ctx.beginPath();
  ctx.arc(tx, ty, s * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function skyBand(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#8fd4e2');
  g.addColorStop(0.55, '#c8ecdd');
  g.addColorStop(1, '#fff3d6');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

function cloudPuff(ctx, cx, cy, s) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  for (const [dx, dy, r] of [[-1.1, 0.1, 0.55], [0, -0.25, 0.7], [1.05, 0.12, 0.5], [0.4, 0.2, 0.55]]) {
    ctx.beginPath();
    ctx.arc(cx + dx * s, cy + dy * s, r * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Bright midday Vice City beach: sun, turquoise sea, sand, umbrella, tower, palms. */
export function drawBeach(ctx, x, y, w, h) {
  clipRect(ctx, x, y, w, h);
  skyBand(ctx, x, y, w, h * 0.52);
  sunDisc(ctx, x + w * 0.78, y + h * 0.16, w * 0.09);
  cloudPuff(ctx, x + w * 0.22, y + h * 0.14, w * 0.05);
  cloudPuff(ctx, x + w * 0.55, y + h * 0.07, w * 0.04);
  // Sea: teal bands with white wave lines.
  const sea = ctx.createLinearGradient(0, y + h * 0.5, 0, y + h * 0.78);
  sea.addColorStop(0, '#17b8a6');
  sea.addColorStop(1, '#0b7d8c');
  ctx.fillStyle = sea;
  ctx.fillRect(x, y + h * 0.5, w, h * 0.28);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(1.5, h * 0.006);
  for (let i = 0; i < 4; i++) {
    const yy = y + h * (0.55 + i * 0.055);
    ctx.beginPath();
    for (let px = 0; px <= w; px += w / 24) {
      const wy = yy + Math.sin(px * 0.02 + i * 2.1) * h * 0.008;
      if (px === 0) ctx.moveTo(x + px, wy); else ctx.lineTo(x + px, wy);
    }
    ctx.stroke();
  }
  // Sand.
  ctx.fillStyle = '#ffe9b8';
  ctx.fillRect(x, y + h * 0.78, w, h * 0.22);
  ctx.fillStyle = 'rgba(255, 46, 136, 0.25)';
  ctx.fillRect(x, y + h * 0.78, w, h * 0.015);
  // Striped umbrella.
  const ux = x + w * 0.3;
  const uy = y + h * 0.8;
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = Math.max(2, w * 0.008);
  ctx.beginPath();
  ctx.moveTo(ux, uy);
  ctx.lineTo(ux, uy - h * 0.16);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 ? '#fff3d6' : '#ff2e88';
    ctx.beginPath();
    ctx.moveTo(ux, uy - h * 0.16);
    const a0 = Math.PI + (i / 6) * Math.PI;
    const a1 = Math.PI + ((i + 1) / 6) * Math.PI;
    ctx.arc(ux, uy - h * 0.16, w * 0.16, a0, a1);
    ctx.closePath();
    ctx.fill();
  }
  // Lifeguard tower.
  const tx = x + w * 0.72;
  ctx.fillStyle = '#0b6e6e';
  ctx.fillRect(tx, y + h * 0.62, w * 0.02, h * 0.18);
  ctx.fillRect(tx + w * 0.1, y + h * 0.62, w * 0.02, h * 0.18);
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(tx - w * 0.02, y + h * 0.56, w * 0.16, h * 0.07);
  ctx.fillStyle = '#fff3d6';
  ctx.fillRect(tx - w * 0.02, y + h * 0.585, w * 0.16, h * 0.02);
  palmTree(ctx, x + w * 0.08, y + h * 0.82, h * 0.34, -0.5);
  palmTree(ctx, x + w * 0.94, y + h * 0.84, h * 0.3, 0.6);
  ctx.restore();
}

/** Downtown skyline in sun-bleach: teal glass towers, pink windows, palms at the base. */
export function drawSkyline(ctx, x, y, w, h) {
  clipRect(ctx, x, y, w, h);
  skyBand(ctx, x, y, w, h);
  sunDisc(ctx, x + w * 0.5, y + h * 0.2, w * 0.1);
  cloudPuff(ctx, x + w * 0.15, y + h * 0.12, w * 0.045);
  cloudPuff(ctx, x + w * 0.85, y + h * 0.3, w * 0.04);
  const towers = [
    [0.02, 0.42, 0.16, 0.62, '#0b6e6e'],
    [0.2, 0.3, 0.15, 0.74, '#0e8a8a'],
    [0.37, 0.5, 0.13, 0.54, '#0a4d5c'],
    [0.52, 0.24, 0.17, 0.8, '#0b6e6e'],
    [0.71, 0.38, 0.14, 0.66, '#0e8a8a'],
    [0.87, 0.48, 0.12, 0.56, '#0a4d5c'],
  ];
  for (const [fx, fy, fw, fh, color] of towers) {
    ctx.fillStyle = color;
    ctx.fillRect(x + w * fx, y + h * fy, w * fw, h * fh);
    ctx.fillStyle = 'rgba(255, 233, 168, 0.85)';
    const rows = Math.floor(fh / 0.09);
    const cols = Math.floor(fw / 0.045);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r * 3 + c * 7) % 4 === 0) continue;
        ctx.fillRect(
          x + w * (fx + 0.012 + c * 0.045),
          y + h * (fy + 0.02 + r * 0.09),
          w * 0.02, h * 0.035,
        );
      }
    }
    ctx.fillStyle = '#ff2e88';
    ctx.fillRect(x + w * fx, y + h * fy, w * fw, h * 0.015);
  }
  // Street + palms at the base.
  ctx.fillStyle = '#12333a';
  ctx.fillRect(x, y + h * 0.94, w, h * 0.06);
  ctx.fillStyle = '#ffe9a8';
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(x + w * (0.03 + i * 0.125), y + h * 0.962, w * 0.06, h * 0.012);
  }
  palmTree(ctx, x + w * 0.1, y + h * 0.96, h * 0.22, -0.4);
  palmTree(ctx, x + w * 0.62, y + h * 0.96, h * 0.2, 0.5);
  palmTree(ctx, x + w * 0.9, y + h * 0.96, h * 0.24, -0.6);
  ctx.restore();
}

/** Car-chase freeze-frame: pink sports car on a teal highway, motion streaks, heat haze. */
export function drawChase(ctx, x, y, w, h) {
  clipRect(ctx, x, y, w, h);
  skyBand(ctx, x, y, w, h * 0.45);
  sunDisc(ctx, x + w * 0.82, y + h * 0.14, w * 0.08);
  // Distant towers.
  ctx.fillStyle = 'rgba(11, 110, 110, 0.55)';
  for (const [fx, fw, fh] of [[0.05, 0.08, 0.2], [0.16, 0.06, 0.28], [0.26, 0.1, 0.16], [0.68, 0.07, 0.24]]) {
    ctx.fillRect(x + w * fx, y + h * (0.45 - fh), w * fw, h * fh);
  }
  // Road with perspective.
  ctx.fillStyle = '#12333a';
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w * 0.28, y + h * 0.45);
  ctx.lineTo(x + w * 0.72, y + h * 0.45);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  for (let i = 0; i < 5; i++) {
    const t = i / 5;
    const cy = y + h * (0.48 + t * 0.5);
    const cw = w * (0.008 + t * 0.03);
    ctx.fillRect(x + w * 0.5 - cw / 2, cy, cw, h * 0.03);
  }
  // Motion streaks.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = Math.max(1.5, h * 0.008);
  for (let i = 0; i < 6; i++) {
    const yy = y + h * (0.55 + i * 0.07);
    ctx.beginPath();
    ctx.moveTo(x + w * (0.04 + (i % 3) * 0.06), yy);
    ctx.lineTo(x + w * (0.2 + (i % 3) * 0.05), yy);
    ctx.stroke();
  }
  // The car: low pink sports coupe, side view, frozen mid-chase.
  const cx = x + w * 0.5;
  const cy = y + h * 0.78;
  const cw = w * 0.62;
  const ch = h * 0.2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, ch * 0.42, cw * 0.52, ch * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff2e88';
  ctx.beginPath();
  ctx.moveTo(-cw * 0.5, ch * 0.28);
  ctx.quadraticCurveTo(-cw * 0.52, -ch * 0.05, -cw * 0.3, -ch * 0.08);
  ctx.lineTo(-cw * 0.12, -ch * 0.42);
  ctx.lineTo(cw * 0.18, -ch * 0.42);
  ctx.lineTo(cw * 0.38, -ch * 0.08);
  ctx.quadraticCurveTo(cw * 0.52, -ch * 0.02, cw * 0.5, ch * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(2, w * 0.004);
  ctx.stroke();
  ctx.fillStyle = '#bfe8ef';
  ctx.beginPath();
  ctx.moveTo(-cw * 0.1, -ch * 0.36);
  ctx.lineTo(cw * 0.15, -ch * 0.36);
  ctx.lineTo(cw * 0.3, -ch * 0.1);
  ctx.lineTo(-cw * 0.26, -ch * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff3d6';
  ctx.beginPath();
  ctx.arc(cw * 0.44, -ch * 0.02, ch * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0b6e6e';
  ctx.fillRect(-cw * 0.42, ch * 0.08, cw * 0.84, ch * 0.08);
  for (const wx of [-0.3, 0.3]) {
    ctx.fillStyle = '#12333a';
    ctx.beginPath();
    ctx.arc(cw * wx, ch * 0.28, ch * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.arc(cw * wx, ch * 0.28, ch * 0.11, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  palmTree(ctx, x + w * 0.06, y + h * 0.52, h * 0.26, -0.5);
  ctx.restore();
}

/** Low-angle hero close-up: sunglasses, gold chain, open teal shirt, pink midday sky. */
export function drawPortrait(ctx, x, y, w, h) {
  clipRect(ctx, x, y, w, h);
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, '#ff7ab8');
  sky.addColorStop(0.45, '#ffb3d4');
  sky.addColorStop(1, '#fff3d6');
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  sunDisc(ctx, x + w * 0.8, y + h * 0.14, w * 0.1);
  cloudPuff(ctx, x + w * 0.18, y + h * 0.1, w * 0.05);
  palmTree(ctx, x + w * 0.04, y + h * 0.42, h * 0.4, -0.55);
  palmTree(ctx, x + w * 0.98, y + h * 0.5, h * 0.36, 0.55);
  const cx = x + w * 0.5;
  const cy = y + h * 0.42;
  const s = Math.min(w, h) * 0.62; // head size
  // Shoulders: open teal shirt over a cream tee.
  ctx.fillStyle = '#0b6e6e';
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.52, y + h);
  ctx.quadraticCurveTo(cx - w * 0.42, cy + s * 0.62, cx - w * 0.16, cy + s * 0.55);
  ctx.lineTo(cx - w * 0.1, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.52, y + h);
  ctx.quadraticCurveTo(cx + w * 0.42, cy + s * 0.62, cx + w * 0.16, cy + s * 0.55);
  ctx.lineTo(cx + w * 0.1, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff3d6';
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.1, y + h);
  ctx.lineTo(cx - w * 0.16, cy + s * 0.55);
  ctx.quadraticCurveTo(cx, cy + s * 0.72, cx + w * 0.16, cy + s * 0.55);
  ctx.lineTo(cx + w * 0.1, y + h);
  ctx.closePath();
  ctx.fill();
  // Gold chain.
  ctx.strokeStyle = '#f5b90d';
  ctx.lineWidth = Math.max(3, s * 0.03);
  ctx.beginPath();
  ctx.arc(cx, cy + s * 0.52, s * 0.3, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  // Neck and head, seen slightly from below (low angle).
  ctx.fillStyle = '#d99a6c';
  ctx.fillRect(cx - s * 0.14, cy + s * 0.28, s * 0.28, s * 0.34);
  ctx.fillStyle = '#e8b08a';
  ctx.beginPath();
  ctx.ellipse(cx, cy, s * 0.42, s * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Jaw shading for the low angle.
  ctx.fillStyle = 'rgba(180, 110, 70, 0.35)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + s * 0.3, s * 0.3, s * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hair: dark, swept back.
  ctx.fillStyle = '#1d1b22';
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.42, cy - s * 0.05);
  ctx.quadraticCurveTo(cx - s * 0.45, -s * 0.62 + cy, cx, cy - s * 0.56);
  ctx.quadraticCurveTo(cx + s * 0.45, cy - s * 0.62, cx + s * 0.42, cy - s * 0.05);
  ctx.quadraticCurveTo(cx + s * 0.3, cy - s * 0.34, cx, cy - s * 0.36);
  ctx.quadraticCurveTo(cx - s * 0.3, cy - s * 0.34, cx - s * 0.42, cy - s * 0.05);
  ctx.closePath();
  ctx.fill();
  // Sunglasses: big black frames, pink sky reflected in the lenses.
  ctx.fillStyle = '#12333a';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.roundRect(cx + side * s * 0.24 - s * 0.17, cy - s * 0.12, s * 0.34, s * 0.24, s * 0.05);
    ctx.fill();
  }
  ctx.fillRect(cx - s * 0.07, cy - s * 0.08, s * 0.14, s * 0.05);
  ctx.fillStyle = '#ff2e88';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.roundRect(cx + side * s * 0.24 - s * 0.14, cy - s * 0.09, s * 0.28, s * 0.09, s * 0.03);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.28, cy - s * 0.06);
  ctx.lineTo(cx - s * 0.14, cy - s * 0.06);
  ctx.lineTo(cx - s * 0.24, cy + s * 0.08);
  ctx.lineTo(cx - s * 0.32, cy + s * 0.08);
  ctx.closePath();
  ctx.fill();
  // Nose and smile.
  ctx.strokeStyle = 'rgba(150, 90, 55, 0.8)';
  ctx.lineWidth = Math.max(2, s * 0.015);
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.08);
  ctx.lineTo(cx - s * 0.03, cy + s * 0.22);
  ctx.lineTo(cx + s * 0.02, cy + s * 0.24);
  ctx.stroke();
  ctx.strokeStyle = '#7a3a1e';
  ctx.lineWidth = Math.max(2.5, s * 0.02);
  ctx.beginPath();
  ctx.arc(cx, cy + s * 0.3, s * 0.12, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  // Gold hoop earring, sitting on the ear at the head's edge.
  ctx.strokeStyle = '#f5b90d';
  ctx.lineWidth = Math.max(2.5, s * 0.02);
  ctx.beginPath();
  ctx.arc(cx + s * 0.38, cy + s * 0.06, s * 0.06, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export const SAMPLE_SCENES = {
  beach: { label: 'Vice Beach — midday', draw: drawBeach },
  skyline: { label: 'Downtown Skyline', draw: drawSkyline },
  chase: { label: 'Car Chase Freeze', draw: drawChase },
  portrait: { label: 'Hero Close-Up', draw: drawPortrait },
};
