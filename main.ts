// Vice City Heat — Cinematic Key-Art Cover Studio (make.fun gta6-cover-art-01, round 10).
// The entry program (Node 22, standard library only). It hands the app in: it
// copies this repository's app/ and screenshots/ into the output directory and
// writes /output/dossier.json with the vendored make.fun library, so the sealed
// scorer can gate the entry and the judge can read its dossier.
//
// The output directory itself is never removed: the grader mounts it, so this
// program only empties what is inside it, then writes the fresh files in.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the app locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Empty the output directory's contents, leaving the directory itself in place.
mkdirSync(outputDir, { recursive: true });
for (const entry of readdirSync(outputDir)) {
  rmSync(join(outputDir, entry), { recursive: true, force: true });
}

cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
if (!existsSync(join(outputDir, 'app', 'index.html'))) {
  throw new Error('app/index.html is missing: the app cannot be handed in without it');
}
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): text_max_bytes shapes the
// dossier's text; the other caps refuse an entry the scorer would refuse
// (more than 4 screenshots or one over 256 KiB; more than 993 files in app/
// or 48 MiB of app files in all, or a path under app/ over 1000 bytes).
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

console.log(`Wrote ${outputDir}/app, ${outputDir}/screenshots and ${outputDir}/dossier.json`);
console.log(
  `App files: ${readdirSync(join(outputDir, 'app', 'src')).length} modules under app/src, ` +
  `${readdirSync(join(outputDir, 'screenshots')).length} screenshots, ` +
  `dossier ${Math.round(statSync(join(outputDir, 'dossier.json')).size / 1024)} KiB`,
);
