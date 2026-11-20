// The cover engine: draws a cinematic GTA-style key-art cover onto any canvas.
// Layouts: keyart (low-angle hero portrait + two scene panels + stacked title
// band), trio (three scene panels over one title band) and bleed (one photo
// full-bleed with the title over a scrim). Grades are sun-bleached midday
// palettes — hot pink, deep teal and cream — never neon night, never sunset.
// A stacked-letter title block (one word a line, condensed, tilted) is the
// cover's anchor, and film grain over the whole cover gives the printed-poster
// feel. Every letter, panel and grain dot is drawn here; nothing is borrowed.
import { SAMPLE_SCENES } from './samples.js';

export const SIZES = {
  '1080x1080': { w: 1080, h: 1080, label: 'Square · 1080 × 1080' },
  '1080x1350': { w: 1080, h: 1350, label: 'Portrait · 1080 × 1350' },
  '1920x1080': { w: 1920, h: 1080, label: 'Wide · 1920 × 1080' },
};

export const LAYOUTS = {
  keyart: { label: 'Key Art — hero + two scenes' },
  trio: { label: 'Trio — three scene panels' },
  bleed: { label: 'Full Bleed — one photo' },
};

// Sun-bleached midday grades. `wash` tints the panels; `band` is the title
// band; `title`/`shadow`/`sub` colour the stacked title block.
export const GRADES = {
  midday: {
    label: 'Midday — hot pink + deep teal',
    band: '#fff3d6', title: '#ff2e88', shadow: '#0b6e6e', sub: '#0b6e6e',
    date: '#12333a', wash: 'rgba(255, 190, 120, 0.10)', scrim: 'rgba(11, 110, 110, 0.55)',
  },
  heatwave: {
    label: 'Heatwave — orange + cream',
    band: '#ffe9a8', title: '#ff5a1f', shadow: '#7a1030', sub: '#0b6e6e',
    date: '#12333a', wash: 'rgba(255, 120, 40, 0.14)', scrim: 'rgba(122, 16, 48, 0.55)',
  },
  ocean: {
    label: 'Ocean — teal + aqua',
    band: '#d8f2ee', title: '#0b6e6e', shadow: '#ff2e88', sub: '#ff2e88',
    date: '#12333a', wash: 'rgba(20, 160, 170, 0.12)', scrim: 'rgba(10, 77, 92, 0.55)',
  },
};

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Paints a photo cover-fit into rect, with zoom and pan offsets (-1..1). */
export function drawPhotoCover(ctx, img, rect, zoom, ox, oy) {
  const z = Math.max(0.5, zoom || 1);
  const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * z;
  const pw = img.naturalWidth * scale;
  const ph = img.naturalHeight * scale;
  const slackX = Math.max(0, (pw - rect.w) / 2);
  const slackY = Math.max(0, (ph - rect.h) / 2);
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, rect.x + (rect.w - pw) / 2 - (ox || 0) * slackX, rect.y + (rect.h - ph) / 2 - (oy || 0) * slackY, pw, ph);
  ctx.restore();
}

/** Paints one panel: a loaded photo, or one of the drawn sample scenes. */
export function drawPanel(ctx, rect, panel, grade) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (panel && panel.image) {
    drawPhotoCover(ctx, panel.image, rect, panel.zoom, panel.ox, panel.oy);
  } else if (panel && panel.scene && SAMPLE_SCENES[panel.scene]) {
    SAMPLE_SCENES[panel.scene].draw(ctx, rect.x, rect.y, rect.w, rect.h);
  } else {
    ctx.fillStyle = '#0b6e6e';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  ctx.fillStyle = grade.wash;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
  // Thin cream frame around the panel, like a poster cell.
  ctx.strokeStyle = '#fff3d6';
  ctx.lineWidth = Math.max(2, rect.w * 0.004);
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
}

// Panel rectangles for a layout, as fractions of the cover. The title band
// starts at `bandTop` (fraction of height); panels fill above it.
export function layoutPanels(layout, W, H) {
  const g = Math.round(W * 0.014);
  const bandTop = layout === 'bleed' ? 1 : 0.62;
  const top = 0;
  const ph = H * bandTop;
  if (layout === 'trio') {
    const pw = (W - g * 4) / 3;
    return [
      { x: g, y: top + g, w: pw, h: ph - g * 2 },
      { x: g * 2 + pw, y: top + g, w: pw, h: ph - g * 2 },
      { x: g * 3 + pw * 2, y: top + g, w: pw, h: ph - g * 2 },
    ];
  }
  if (layout === 'bleed') {
    return [{ x: 0, y: 0, w: W, h: H }];
  }
  // keyart: hero portrait left, two scene panels stacked right.
  const heroW = W * 0.55 - g * 1.5;
  const rightX = heroW + g * 2;
  const rightW = W - rightX - g;
  const halfH = (ph - g * 3) / 2;
  return [
    { x: g, y: top + g, w: heroW, h: ph - g * 2 },
    { x: rightX, y: top + g, w: rightW, h: halfH },
    { x: rightX, y: top + g * 2 + halfH, w: rightW, h: halfH },
  ];
}

/** Draws the stacked-letter title block: one word a line, stretched and tracked
 *  so every line spans the band — the wide poster-letter look that reads at
 *  thumbnail size. Wide bands take two lines (first two words, then the rest);
 *  portrait and square bands take one word a line. */
export function drawTitleBlock(ctx, x, y, w, h, title, subtitle, date, grade) {
  const words = (title || 'VICE CITY HEAT').toUpperCase().split(/\s+/).filter(Boolean).slice(0, 4);
  let lines = words.length ? words : ['VICE', 'CITY', 'HEAT'];
  if (w / h > 3 && lines.length >= 3) {
    lines = [lines.slice(0, 2).join(' '), lines.slice(2).join(' ')];
  }
  // The stacked words take most of the band: big letters are what read at
  // thumbnail size, so they get ~72% of the band height.
  const lineH = (h * 0.72) / lines.length;
  let size = lineH * 1.0;
  const fontFor = (s) => `900 ${s}px "Arial Black", Arial, sans-serif`;
  // Fit: even stretched 1.7x, no line may overflow the band.
  ctx.font = fontFor(size);
  for (const line of lines) {
    const measured = ctx.measureText(line).width;
    if (measured > 0) size = Math.min(size, (size * (w * 0.94)) / (measured * 1.7));
  }
  ctx.save();
  ctx.translate(x + w / 2, y + h * 0.06);
  ctx.rotate(-0.018);
  ctx.translate(-(x + w / 2), -(y + h * 0.06));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.forEach((line, i) => {
    const cy = y + h * 0.02 + lineH * (i + 0.5);
    ctx.save();
    ctx.font = fontFor(size);
    const measured = ctx.measureText(line).width;
    // Stretch the line toward the band width, then track out what is left.
    const sx = measured > 0 ? Math.min(1.7, Math.max(0.92, (w * 0.94) / measured)) : 1;
    const spare = w * 0.94 - measured * sx;
    const tracking = line.length > 1 ? Math.max(0, Math.min(size * 0.5, spare / (line.length - 1) / sx)) : 0;
    ctx.translate(x + w / 2, cy);
    ctx.scale(sx, 1);
    ctx.font = fontFor(size);
    ctx.letterSpacing = `${tracking}px`;
    ctx.fillStyle = grade.shadow;
    ctx.fillText(line, size * 0.045, size * 0.06);
    ctx.lineWidth = Math.max(2, size * 0.055);
    ctx.strokeStyle = '#fff3d6';
    ctx.strokeText(line, 0, 0);
    ctx.fillStyle = grade.title;
    ctx.fillText(line, 0, 0);
    ctx.restore();
  });
  ctx.restore();
  // Pink rule, then the script subtitle and date line under the stacked title.
  const ruleY = y + h * 0.77;
  ctx.fillStyle = grade.title;
  ctx.fillRect(x + w * 0.38, ruleY, w * 0.24, Math.max(2, h * 0.012));
  ctx.fillStyle = grade.shadow;
  for (const dx of [-0.16, 0.16]) {
    ctx.save();
    ctx.translate(x + w * (0.5 + dx), ruleY + h * 0.006);
    ctx.rotate(Math.PI / 4);
    const d = Math.max(3, h * 0.012);
    ctx.fillRect(-d / 2, -d / 2, d, d);
    ctx.restore();
  }
  const subY = y + h * 0.84;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = grade.sub;
  ctx.font = `italic 700 ${Math.round(h * 0.05)}px Georgia, serif`;
  if (subtitle) ctx.fillText(subtitle, x + w / 2, subY);
  ctx.fillStyle = grade.date;
  ctx.font = `700 ${Math.round(h * 0.036)}px Arial, sans-serif`;
  if (date) {
    const spaced = date.toUpperCase().split('').join(' ');
    ctx.fillText(spaced, x + w / 2, subY + h * 0.085);
  }
}

/** Film grain: seeded speckles over the whole cover, printed-poster feel. */
function drawGrain(ctx, W, H, seed) {
  const rand = mulberry32(seed);
  const count = Math.floor((W * H) / 260);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const v = rand();
    ctx.fillStyle = v > 0.5 ? `rgba(255,255,255,${0.05 + rand() * 0.06})` : `rgba(18,51,58,${0.04 + rand() * 0.06})`;
    ctx.fillRect(rand() * W, rand() * H, 1 + rand() * 2, 1 + rand() * 2);
  }
  ctx.restore();
}

/** Draws the whole cover. `state` holds size, layout, grade, title, subtitle,
 *  date and panels (one per layout cell: {image} | {scene} plus zoom/ox/oy). */
export function drawCover(canvas, state) {
  const size = SIZES[state.size] || SIZES['1080x1350'];
  const W = size.w;
  const H = size.h;
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;
  const ctx = canvas.getContext('2d');
  const grade = GRADES[state.grade] || GRADES.midday;
  const layout = LAYOUTS[state.layout] ? state.layout : 'keyart';
  const panels = state.panels || [];

  ctx.fillStyle = '#fff3d6';
  ctx.fillRect(0, 0, W, H);

  const rects = layoutPanels(layout, W, H);
  rects.forEach((rect, i) => drawPanel(ctx, rect, panels[i] || { scene: 'portrait' }, grade));

  if (layout === 'bleed') {
    // Scrim behind the title so the stacked letters read over any photo.
    const bandH = H * 0.4;
    const scrim = ctx.createLinearGradient(0, H - bandH, 0, H);
    scrim.addColorStop(0, 'rgba(11, 110, 110, 0)');
    scrim.addColorStop(0.35, grade.scrim);
    scrim.addColorStop(1, grade.scrim);
    ctx.fillStyle = scrim;
    ctx.fillRect(0, H - bandH, W, bandH);
    drawTitleBlock(ctx, W * 0.05, H - bandH + H * 0.02, W * 0.9, bandH - H * 0.02, state.title, state.subtitle, state.date, grade);
  } else {
    const bandTop = H * 0.62;
    ctx.fillStyle = grade.band;
    ctx.fillRect(0, bandTop, W, H - bandTop);
    ctx.fillStyle = grade.shadow;
    ctx.fillRect(0, bandTop, W, Math.max(3, H * 0.006));
    drawTitleBlock(ctx, W * 0.05, bandTop + H * 0.01, W * 0.9, H - bandTop - H * 0.02, state.title, state.subtitle, state.date, grade);
  }

  // Vignette, then grain over everything.
  const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.75);
  vig.addColorStop(0, 'rgba(18, 51, 58, 0)');
  vig.addColorStop(1, 'rgba(18, 51, 58, 0.16)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  drawGrain(ctx, W, H, 20261120 + W + H);
}
