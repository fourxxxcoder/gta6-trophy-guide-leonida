# gta6-trophy-guide-leonida

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/fourxxxcoder/gta6-trophy-guide-leonida/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/fourxxxcoder/gta6-trophy-guide-leonida/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Legend is an offline trophy guide and tracker for all 55 Grand Theft Auto VI PlayStation 5 trophies: every trophy with its official name, description and grade, a guide in our own words that cites its sources, a five-stage roadmap to the platinum, and a clear warning for the one potentially missable trophy. Progress is saved in the browser and can be exported and imported, and a spoiler mode hides story and hidden trophies until you earn them — no account, no network, no build step.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That validates the guide data, copies `app/` and `screenshots/` into `out/`, and writes `out/dossier.json`. To read the guide, serve `out/app/` with any static file server and open it in a desktop browser — or, for a quick dev preview of the same app straight from the repository, run `node serve.ts` and open http://localhost:8080. The app works with the network off; the only file it ever loads is its own `app/data/trophies.json`.

## What's inside

- **Tracker** — all 55 trophies as cards with official name, description and grade badge; tick them off and progress (counter, percentage bar, per-grade totals) is saved in `localStorage`. Export your progress to a JSON file and import it back on any machine.
- **Filters & search** — by kind (story, missable, collectibles, activities, completion; GTA VI has no online trophies), by grade, by earned status, plus free-text search.
- **Spoiler mode** — on by default: story and hidden trophies show as "Hidden trophy" placeholders until you earn them, mirroring how PlayStation hides them.
- **Trophy pages** — every trophy has its own view (`#/trophy/<id>`) with the full guide, steps where they help, a missable warning where one applies, and its cited sources as links.
- **Roadmap** (`#/roadmap`) — five stages built from the official descriptions: story playthrough, character strands, collectibles & exploration, activities & crime cleanup, then the 100% checklist and the platinum.
- **Missable page** (`#/missable`) — the single potentially missable trophy, Positive Mental Attitude, and its Chapter 1 window, explained with sources.

## How the guide data was sourced

Trophy names, descriptions and grades are the official ones as PlayStation publishes them, cross-checked against the Exophase PS5 trophy listing and PSNProfiles-based lists (they agree on all 55: 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden). The guides themselves are written for this tracker in our own words — never copied — and each trophy entry in `app/data/trophies.json` carries a `sources` array naming the public guides it draws on (PowerPyx's trophy guide and roadmap, GTABase, GamesFuze, GameMapa, GTASpotter, KeenGamer and Exophase among them). Where the community has not yet confirmed the exact method for a hidden trophy, the guide says so plainly instead of inventing steps. The only missable call — Positive Mental Attitude, for its Chapter 1 balcony meditation — is the one PowerPyx and GTABase both flag.

The visual design is original (a neon-sunset Leonida look in pure CSS); the app ships no Rockstar logos, artwork or game screenshots, and makes no network requests at run time.

---
<sub>Entered on [make.fun](https://make.fun/?ref=7z89ba3s&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
