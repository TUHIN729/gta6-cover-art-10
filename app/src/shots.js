// Fixed scenes for screenshots: ?shot=editor shows the page with a sample
// scene loaded; ?shot=cover shows the cover alone, full frame. The query picks
// the layout, grade, size, words and the scene in each panel, e.g.
//   ?shot=cover&size=1080x1350&layout=keyart&grade=midday
//   &title=VICE%20CITY%20HEAT&subtitle=Midday%20in%20Leonida
//   &photos=portrait,skyline,beach
// window.__shotReady is set once the cover has been painted.
const DEFAULT_PHOTOS = {
  keyart: ['portrait', 'skyline', 'beach'],
  trio: ['beach', 'skyline', 'chase'],
  bleed: ['portrait'],
};

export function runShot(shot, query, apply) {
  const layout = query.get('layout') || 'keyart';
  const photos = (query.get('photos') || '').split(',').filter(Boolean);
  const scenes = photos.length ? photos : (DEFAULT_PHOTOS[layout] || DEFAULT_PHOTOS.keyart);
  const next = {
    size: query.get('size') || '1080x1350',
    layout,
    grade: query.get('grade') || 'midday',
    title: query.get('title') || 'VICE CITY HEAT',
    subtitle: query.get('subtitle') || 'Midday in Leonida',
    date: query.get('date') || 'NOV 19 2026',
    panels: scenes.map((scene) => ({ scene, zoom: 1, ox: 0, oy: 0 })),
  };
  if (shot === 'cover') document.body.classList.add('shot-cover');
  apply(next);
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
