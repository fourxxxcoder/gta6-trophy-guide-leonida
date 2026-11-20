// Leonida Legend — GTA VI trophy guide & tracker.
// Vanilla JS, fully offline: the only file it ever fetches is its own
// data/trophies.json sitting beside it. Progress and settings live in
// localStorage; source links are ordinary anchors a reader may choose to
// follow — the app itself requests nothing else.

import { ROADMAP_STAGES, stageFor } from './roadmap.js';

const PROGRESS_KEY = 'leonida-legend-progress-v1';
const SPOILER_KEY = 'leonida-legend-spoiler-v1';
const TOTAL = 55;

const view = document.getElementById('view');
const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

// ?demo=1 seeds a small, harmless demo state for screenshots and first looks:
// a handful of story trophies earned, nothing else touched. It only applies
// when the visitor has no saved progress of their own yet.
function seedDemoProgress() {
  const demoIds = [2, 8, 3, 16, 21, 35];
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(demoIds));
  return new Set(demoIds);
}

function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? 'null');
    if (Array.isArray(raw)) return new Set(raw.filter((id) => byId.has(id)));
  } catch {
    /* a corrupt save falls through to a fresh set */
  }
  if (new URLSearchParams(location.search).has('demo')) return seedDemoProgress();
  return new Set();
}

let earned = loadEarned();
let spoilerOn = localStorage.getItem(SPOILER_KEY) !== 'off';

function saveEarned() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned]));
}

function setEarned(id, on) {
  if (on) earned.add(id);
  else earned.delete(id);
  saveEarned();
  updateProgressHeader();
}

function isSpoilered(t) {
  return spoilerOn && !earned.has(t.id) && (t.kind === 'story' || t.hidden);
}

function displayName(t) {
  return isSpoilered(t) ? 'Hidden trophy' : t.name;
}

function displayDesc(t) {
  return isSpoilered(t) ? 'Earn it to reveal what PlayStation says.' : t.description;
}

function gradeCount(grade) {
  return trophies.filter((t) => t.grade === grade && earned.has(t.id)).length;
}

function updateProgressHeader() {
  const n = earned.size;
  document.getElementById('progress-count').textContent = String(n);
  document.getElementById('progress-pct').textContent = `${Math.round((n / TOTAL) * 100)}%`;
  document.getElementById('progress-left').textContent =
    n === TOTAL ? 'platinum earned — you are a Leonida Legend' : `${TOTAL - n} to go`;
  document.getElementById('progress-fill').style.width = `${(n / TOTAL) * 100}%`;
  document.getElementById('progress-grades').textContent =
    `Platinum ${gradeCount('platinum')}/1 · Gold ${gradeCount('gold')}/2 · Silver ${gradeCount('silver')}/6 · Bronze ${gradeCount('bronze')}/46`;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function badge(text, className) {
  return el('span', `badge ${className ?? ''}`.trim(), text);
}

function trophyCard(t) {
  const card = el('article', `trophy-card grade-${t.grade}${earned.has(t.id) ? ' earned' : ''}${isSpoilered(t) ? ' spoilered' : ''}`);
  const top = el('div', 'card-top');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.className = 'card-check';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    setEarned(t.id, box.checked);
    renderRoute();
  });
  const titleWrap = el('div');
  const h = el('h3', 'card-title');
  const link = el('a', null, displayName(t));
  link.href = `#/trophy/${t.id}`;
  h.append(link);
  const desc = el('p', 'card-desc', displayDesc(t));
  titleWrap.append(h, desc);
  if (isSpoilered(t)) titleWrap.append(el('span', 'spoiler-tag', 'Spoiler hidden — earn it or turn spoiler mode off'));
  top.append(box, titleWrap);

  const meta = el('div', 'card-meta');
  meta.append(badge(t.grade, `grade-${t.grade}`));
  meta.append(badge(t.kind, 'kind'));
  if (t.count) meta.append(badge(`Target ${t.count.toLocaleString('en-US')}`, 'count'));
  if (t.hidden && !isSpoilered(t)) meta.append(badge('Hidden on PSN', 'hidden-badge'));
  if (t.missable) {
    const flag = el('span', 'flag-missable', 'Missable');
    meta.append(flag);
  }
  card.append(top, meta);
  return card;
}

function parseRoute() {
  const hash = location.hash.replace(/^#/, '') || '/';
  const parts = hash.split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'tracker' };
  if (parts[0] === 'roadmap') return { name: 'roadmap' };
  if (parts[0] === 'missable') return { name: 'missable' };
  if (parts[0] === 'about') return { name: 'about' };
  if (parts[0] === 'trophy' && byId.has(Number(parts[1]))) return { name: 'trophy', id: Number(parts[1]) };
  return { name: 'tracker' };
}

function markNav(routeName) {
  for (const a of document.querySelectorAll('.view-nav a')) {
    a.classList.toggle('active', a.dataset.nav === routeName);
  }
}

const filterState = { kind: 'all', grade: 'all', status: 'all', query: '' };

function renderTracker() {
  markNav('tracker');
  view.replaceChildren();
  const controls = el('section', 'controls');

  const searchLabel = el('label', null, 'Search');
  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'Trophy, mission, activity…';
  search.value = filterState.query;
  search.addEventListener('input', () => {
    filterState.query = search.value;
    drawList();
  });
  searchLabel.append(search);

  const kindLabel = el('label', null, 'Kind');
  const kind = document.createElement('select');
  for (const [value, label] of [
    ['all', 'All kinds'],
    ['story', 'Story'],
    ['missable', 'Missable'],
    ['collectibles', 'Collectibles'],
    ['activities', 'Activities'],
    ['completion', 'Completion'],
    ['online', 'Online (none in GTA VI)']
  ]) {
    const opt = el('option', null, label);
    opt.value = value;
    kind.append(opt);
  }
  kind.value = filterState.kind;
  kind.addEventListener('change', () => {
    filterState.kind = kind.value;
    drawList();
  });
  kindLabel.append(kind);

  const gradeLabel = el('label', null, 'Grade');
  const grade = document.createElement('select');
  for (const [value, label] of [
    ['all', 'All grades'],
    ['platinum', 'Platinum'],
    ['gold', 'Gold'],
    ['silver', 'Silver'],
    ['bronze', 'Bronze']
  ]) {
    const opt = el('option', null, label);
    opt.value = value;
    grade.append(opt);
  }
  grade.value = filterState.grade;
  grade.addEventListener('change', () => {
    filterState.grade = grade.value;
    drawList();
  });
  gradeLabel.append(grade);

  const statusLabel = el('label', null, 'Status');
  const status = document.createElement('select');
  for (const [value, label] of [
    ['all', 'Earned + not earned'],
    ['earned', 'Earned only'],
    ['open', 'Not earned only']
  ]) {
    const opt = el('option', null, label);
    opt.value = value;
    status.append(opt);
  }
  status.value = filterState.status;
  status.addEventListener('change', () => {
    filterState.status = status.value;
    drawList();
  });
  statusLabel.append(status);

  const spoilerLabel = el('label', 'toggle');
  const spoilerBox = document.createElement('input');
  spoilerBox.type = 'checkbox';
  spoilerBox.checked = spoilerOn;
  spoilerBox.addEventListener('change', () => {
    spoilerOn = spoilerBox.checked;
    localStorage.setItem(SPOILER_KEY, spoilerOn ? 'on' : 'off');
    drawList();
  });
  spoilerLabel.append(spoilerBox, document.createTextNode('Spoiler mode: hide story & hidden trophies until earned'));

  const exportBtn = el('button', 'btn', 'Export progress');
  exportBtn.type = 'button';
  exportBtn.addEventListener('click', exportProgress);
  const importBtn = el('label', 'btn secondary import-label', 'Import progress');
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = 'application/json,.json';
  importInput.addEventListener('change', () => importProgress(importInput));
  importBtn.append(importInput);
  const resetBtn = el('button', 'btn ghost', 'Reset');
  resetBtn.type = 'button';
  resetBtn.addEventListener('click', () => {
    earned = new Set();
    saveEarned();
    updateProgressHeader();
    drawList();
  });

  controls.append(searchLabel, kindLabel, gradeLabel, statusLabel, spoilerLabel, exportBtn, importBtn, resetBtn);
  const count = el('p', 'result-count');
  count.id = 'result-count';
  const list = el('div', 'trophy-list');
  list.id = 'trophy-list';
  view.append(controls, count, list);
  drawList();

  function drawList() {
    const q = filterState.query.trim().toLowerCase();
    const shown = trophies.filter((t) => {
      if (filterState.kind === 'missable' && !t.missable) return false;
      if (filterState.kind !== 'all' && filterState.kind !== 'missable' && t.kind !== filterState.kind) return false;
      if (filterState.grade !== 'all' && t.grade !== filterState.grade) return false;
      if (filterState.status === 'earned' && !earned.has(t.id)) return false;
      if (filterState.status === 'open' && earned.has(t.id)) return false;
      if (q && !`${t.name} ${t.description} ${t.guide}`.toLowerCase().includes(q)) return false;
      return true;
    });
    list.replaceChildren(...shown.map(trophyCard));
    if (shown.length === 0) list.append(el('p', 'empty', 'No trophies match those filters.'));
    count.textContent = `Showing ${shown.length} of ${TOTAL} trophies · ${earned.size} earned overall · spoiler mode ${spoilerOn ? 'on' : 'off'}`;
  }
}

function exportProgress() {
  const payload = JSON.stringify(
    { game: 'Grand Theft Auto VI', exportedFrom: 'Leonida Legend tracker', earned: [...earned].sort((a, b) => a - b) },
    null,
    2
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(input) {
  const file = input.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list');
    earned = new Set(
      ids
        .map((v) => (typeof v === 'number' ? v : byId.get([...byId.values()].find((t) => t.name === v)?.id)?.id))
        .filter((id) => byId.has(id))
    );
    saveEarned();
    updateProgressHeader();
    renderRoute();
  } catch {
    alert('That file does not look like an exported trophy progress file.');
  }
}

function renderDetail(id) {
  markNav('tracker');
  const t = byId.get(id);
  view.replaceChildren();
  const panel = el('article', 'detail');
  const back = el('a', null, '← Back to the tracker');
  back.href = '#/';
  panel.append(back);
  panel.append(el('h2', null, displayName(t)));
  panel.append(el('p', 'official', displayDesc(t)));

  const meta = el('div', 'card-meta');
  meta.append(badge(t.grade, `grade-${t.grade}`));
  meta.append(badge(t.kind, 'kind'));
  if (t.count) meta.append(badge(`Target ${t.count.toLocaleString('en-US')}`, 'count'));
  if (t.hidden) meta.append(badge('Hidden on PlayStation until earned', 'hidden-badge'));
  const stage = stageFor(t.roadmapStage);
  meta.append(badge(stage.title, 'kind'));
  panel.append(meta);

  if (t.missable) {
    const warn = el('p', 'missable-warning', `MISSABLE — ${t.missableNote ?? 'This trophy can be missed; read the guide before playing past its window.'}`);
    panel.append(warn);
  }

  panel.append(el('h3', null, 'Guide'));
  panel.append(el('p', 'guide', t.guide));
  if (Array.isArray(t.steps) && t.steps.length > 0) {
    panel.append(el('h3', null, 'Steps'));
    const ol = el('ol');
    for (const s of t.steps) ol.append(el('li', null, s));
    panel.append(ol);
  }

  panel.append(el('h3', null, 'Sources'));
  const ul = el('ul', 'sources');
  for (const s of t.sources ?? []) {
    const li = el('li');
    const a = el('a', null, s.name);
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    li.append(a);
    ul.append(li);
  }
  panel.append(ul);

  const actions = el('div', 'detail-actions');
  const label = el('label');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.addEventListener('change', () => {
    setEarned(t.id, box.checked);
    renderDetail(id);
  });
  label.append(box, document.createTextNode('I earned this trophy'));
  actions.append(label);
  const roadmapLink = el('a', 'btn ghost', 'See it on the roadmap');
  roadmapLink.href = '#/roadmap';
  actions.append(roadmapLink);
  panel.append(actions);
  view.append(panel);
  window.scrollTo(0, 0);
}

function renderRoadmap() {
  markNav('roadmap');
  view.replaceChildren();
  const intro = el('section', 'callout');
  intro.append(el('h2', null, 'Roadmap to the platinum'));
  intro.append(
    el(
      'p',
      null,
      'One playthrough, roughly 200 hours, difficulty about 4/10 (PowerPyx roadmap). No online trophies, no difficulty trophies, no mission replay — but free-roam continues after the credits, so almost everything can be cleaned up. The single exception is flagged in Stage 1 and on the Missable page. Note: this roadmap always names every trophy — it is the planning view, so treat it as spoiler territory even when spoiler mode is on in the tracker.'
    )
  );
  view.append(intro);
  for (const stage of ROADMAP_STAGES) {
    const section = el('section', 'roadmap-stage');
    section.append(el('p', 'stage-hours', stage.hours));
    section.append(el('h2', null, stage.title));
    const members = trophies
      .filter((t) => t.roadmapStage === stage.stage)
      .sort((a, b) => a.roadmapOrder - b.roadmapOrder || a.id - b.id);
    const done = members.filter((t) => earned.has(t.id)).length;
    section.append(el('p', 'stage-progress', `${done} of ${members.length} earned in this stage`));
    section.append(el('p', null, stage.blurb));
    const ul = el('ul', 'stage-trophies');
    for (const t of members) {
      const li = el('li');
      const link = el('a', null, `${earned.has(t.id) ? '✓ ' : ''}${t.name}`);
      link.href = `#/trophy/${t.id}`;
      li.append(link);
      li.append(badge(t.grade, `grade-${t.grade}`));
      if (t.missable) li.append(el('span', 'flag-missable', 'Missable'));
      ul.append(li);
    }
    section.append(ul);
    const tips = el('ul', 'stage-tips');
    for (const tip of stage.tips) tips.append(el('li', null, tip));
    section.append(tips);
    view.append(section);
  }
}

function renderMissable() {
  markNav('missable');
  view.replaceChildren();
  const callout = el('section', 'callout');
  callout.append(el('h2', null, 'Missable trophies: exactly one to watch'));
  callout.append(
    el(
      'p',
      null,
      'PowerPyx, GTABase and KeenGamer all agree: Positive Mental Attitude is the only potentially missable trophy in GTA VI. Everything else — story trophies included — can be earned in free-roam after the credits, and every trophy quest giver returns. Optional missions and some fences can disappear, but none of that touches trophies or the 100% checklist.'
    )
  );
  view.append(callout);
  const list = el('div', 'trophy-list');
  for (const t of trophies.filter((x) => x.missable)) list.append(trophyCard(t));
  view.append(list);
  const note = el('section', 'about-card');
  note.append(el('h2', null, 'The Chapter 1 window, in short'));
  note.append(
    el(
      'p',
      null,
      'After the Chapter 1 mission Down to Earth, visit Jason’s house in the morning. Lucia says she is going to meditate and heads to the balcony — follow her and choose Accept. That one session cannot be repeated after Chapter 1. Guides have not confirmed whether the trophy strictly requires it, but the safe play is free: do it, then meditate at the remaining spots at your leisure.'
    )
  );
  view.append(note);
}

function renderAbout() {
  markNav('about');
  view.replaceChildren();
  const grid = el('div', 'about-grid');
  const facts = el('section', 'about-card');
  facts.append(el('h2', null, 'The list at a glance'));
  const factsList = el('ul');
  for (const line of [
    '55 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze.',
    '28 are hidden on PlayStation until earned; spoiler mode in this tracker hides story and hidden trophies the same way.',
    'No online trophies — the whole list is single-player and one playthrough is enough.',
    'Roughly 200 hours to the platinum; difficulty about 4/10 (PowerPyx).',
    'Hardest trophy: A Long Road, the 100% Completion gold.',
    'Cheats disable trophies and saving — keep them off a trophy run.'
  ]) {
    factsList.append(el('li', null, line));
  }
  facts.append(factsList);
  const sourcing = el('section', 'about-card');
  sourcing.append(el('h2', null, 'How this guide was sourced'));
  sourcing.append(
    el(
      'p',
      null,
      'Trophy names, descriptions and grades are the official ones as PlayStation publishes them, cross-checked against the Exophase PS5 listing and the PSNProfiles-based lists before this tracker was built — they agree on all 55. Each trophy’s guide is written for this tracker in its own words and names its sources on the trophy’s own page; no guide text is copied from any other guide. Where the method for a hidden trophy is still being confirmed by the community, the guide says so instead of inventing steps.'
    )
  );
  const sourcesCard = el('section', 'about-card');
  sourcesCard.append(el('h2', null, 'Principal sources'));
  const ul = el('ul', 'sources');
  const seen = new Map();
  for (const t of trophies) for (const s of t.sources ?? []) if (!seen.has(s.url)) seen.set(s.url, s);
  for (const s of seen.values()) {
    const li = el('li');
    const a = el('a', null, s.name);
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    li.append(a);
    ul.append(li);
  }
  sourcesCard.append(ul);
  grid.append(facts, sourcing, sourcesCard);
  view.append(grid);
}

function renderRoute() {
  const route = parseRoute();
  if (route.name === 'roadmap') renderRoadmap();
  else if (route.name === 'missable') renderMissable();
  else if (route.name === 'about') renderAbout();
  else if (route.name === 'trophy') renderDetail(route.id);
  else renderTracker();
}

window.addEventListener('hashchange', renderRoute);
updateProgressHeader();
renderRoute();
