// A working gta6-trophy-guide-01 entry (Node 22, standard library only): the guide is this directory's app/ folder,
// plain static files a browser opens at app/index.html (ES modules, CSS, no build step), offline: it loads nothing
// over the network, and its trophy list and guides are app/data/trophies.json. The program hands it in: it copies app/
// and screenshots/ from beside this file to /output and writes /output/dossier.json, the summary the judge reads (your
// screenshots, the first load's files and bytes, and your source), with the vendored make.fun library. Leave
// vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to be byte for byte what its own copy writes.
//
// Only the plumbing, not a winner: a plain checklist of the 55 trophies with a one-line hint each. Write a real guide
// for every trophy in your own words, a roadmap to the platinum, filters and a spoiler setting in app/, put 3 or 4 PNG
// or JPEG screenshots of it in screenshots/ (the first by name is the cover; shots.json says which views this
// starter's were taken of), and run it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Sanity-check the guide before handing it in: the gate refuses an entry whose
// trophy file does not name every official trophy with a guide, and one whose
// screenshots folder holds fewer than 3 or more than 4 images, so fail loudly
// here (in the maker's own run) instead of discovering it in the grade.
function validateGuide(dir: string): { trophies: number; screenshots: number; grades: string; shotBytes: number } {
  const data = JSON.parse(readFileSync(join(dir, 'app', 'data', 'trophies.json'), 'utf8')) as {
    trophies?: { name?: unknown; guide?: unknown; grade?: unknown }[];
  };
  const list = Array.isArray(data.trophies) ? data.trophies : [];
  const unguided = list.filter((t) => typeof t.name !== 'string' || typeof t.guide !== 'string' || t.guide.trim() === '');
  if (list.length !== 55) throw new Error(`trophies.json must hold exactly 55 trophies, found ${list.length}`);
  if (unguided.length > 0) throw new Error(`trophies.json has ${unguided.length} trophies without a name or a guide`);
  const byGrade = new Map<string, number>();
  for (const t of list) {
    const grade = typeof t.grade === 'string' ? t.grade : 'unknown';
    byGrade.set(grade, (byGrade.get(grade) ?? 0) + 1);
  }
  const grades = [...byGrade.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([grade, n]) => `${grade} ${n}`)
    .join(', ');
  const shotsDir = join(dir, 'screenshots');
  const shotFiles = existsSync(shotsDir)
    ? readdirSync(shotsDir).filter((f) => /\.(png|jpe?g)$/i.test(f) && !f.startsWith('.')).sort()
    : [];
  if (shotFiles.length < 3 || shotFiles.length > 4)
    throw new Error(`screenshots/ must hold 3 or 4 images, found ${shotFiles.length}`);
  let shotBytes = 0;
  for (const f of shotFiles) {
    const bytes = statSync(join(shotsDir, f)).size;
    if (bytes > 262144) throw new Error(`screenshot ${f} is ${bytes} bytes, over the 256 KiB cap`);
    shotBytes += bytes;
  }
  return { trophies: list.length, screenshots: shotFiles.length, grades, shotBytes };
}

const summary = validateGuide(here);
console.log(
  `gta6-trophy-guide-01: validated ${summary.trophies} trophies (${summary.grades}) and ${summary.screenshots} screenshots (${summary.shotBytes} bytes total)`,
);

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
