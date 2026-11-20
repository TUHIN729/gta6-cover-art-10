# Vice City Heat — Cinematic Key-Art Cover Studio

[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/TUHIN729/gta6-cover-art-10/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/TUHIN729/gta6-cover-art-10/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An offline web app that turns your photo and a caption into cinematic GTA-style
key art — the sun-bleached midday Miami look: hot pink, deep teal and cream,
with a dramatic low-angle hero portrait, a huge stacked-letter title block and
film grain. Export a real poster in one click, in 1080×1080, 1080×1350 or
1920×1080. Built for the [make.fun gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01).

## What it does

- **Real key-art composition.** A low-angle hero portrait anchors the cover,
  with a huge condensed stacked title ("VICE / CITY / HEAT") that stays
  readable at thumbnail size, a script subtitle and a date line — the classic
  stacked-letter poster treatment, drawn by the app itself.
- **Three cinematic layouts.** Key Art (hero portrait + two scene panels +
  title band), Trio (three scene panels under one title block) and Full Bleed
  (one photo, title over the heat haze).
- **Any photo.** Load your own photo into each panel, or fill every panel with
  one photo. Drag inside a panel to reframe it, scroll or slide to zoom.
  Four canvas-drawn midday sample scenes are included, so it works with no
  upload at all: bright Vice City beach, downtown skyline, car-chase
  freeze-frame and a character close-up.
- **Midday grades, not sunset.** Midday (hot pink + deep teal + cream),
  Heatwave and Ocean — each re-grades every panel, the title block and the
  grain, for a sun-bleached printed-poster feel.
- **One-click export.** 1080×1080, 1080×1350 and 1920×1080 PNGs, straight
  from the browser. No upload, no network, no build step: `app/index.html`
  opens in desktop Chrome and works offline. Your photos never leave your
  machine.

The hero portrait, the beach, the skyline, the chase car, the palms and the
grain are all drawn in the app itself, on canvas. The sample scenes under
`app/src/samples.js` are drawn too — no real person, no Rockstar artwork,
no Rockstar logo and no font files.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

## Files

- `app/index.html`, `app/style.css` — the editor page and its midday styling.
- `app/src/cover.js` — the cover engine: layouts, midday grades, title block, grain.
- `app/src/samples.js` — four procedural midday scenes (beach, skyline, chase, portrait), drawn on canvas.
- `app/src/main.js` — the editor wiring: uploads, drag/zoom, export.
- `app/src/shots.js` — fixed scenes for the screenshots.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to
  `/output` and writes `/output/dossier.json`.

## License

MIT — see `LICENSE`.
