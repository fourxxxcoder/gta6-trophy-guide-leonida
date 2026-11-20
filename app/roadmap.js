// The platinum roadmap: five stages built from the official trophy descriptions.
// Stage 1 is the story itself (with the one potentially missable trophy flagged
// early), then character strands, collectibles and exploration, the big activity
// and crime cleanup, and finally the 100% checklist that ends with the platinum.

export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Stage 1 — Story playthrough',
    hours: '60–80 hours',
    blurb:
      'Play all five chapters as Jason and Lucia. Every chapter, mission and finale trophy below unlocks on its own, and progress toward stunts, scans and challenges already counts toward the 100% checklist. One warning rides along with this stage: the Chapter 1 balcony meditation (Positive Mental Attitude) is the only potentially missable trophy in the game, so it is listed here, in story order, with its warning attached.',
    tips: [
      'Never use cheats — they disable trophies and saving (PowerPyx roadmap).',
      'Keep a manual save at the start and end of every chapter; missions cannot be replayed (GTABase roadmap).',
      'Scan every new vehicle with the WAiNK app as you travel; it feeds three later trophies at once.'
    ]
  },
  {
    stage: 2,
    title: 'Stage 2 — Strangers & character strands',
    hours: '10–20 hours',
    blurb:
      'Finish the character questlines: Andy (Lucia), Kenton, Billy, Randy and Tyrone (Jason), plus Bret’s hunting strand. Each named character ends in their own trophy, and together they carry you to the 8 strands that Strangers & Freaks (Silver) asks for. None of these are missable — every trophy quest giver returns in free-roam after the story.',
    tips: [
      'Kenton disappears for a stretch mid-story and comes back later — that is normal (PowerPyx).',
      'Bret only texts Jason, and only after Coffee Break in Chapter 2.',
      'Stranger strands are not on the 100% checklist, so they get their own stage.'
    ]
  },
  {
    stage: 3,
    title: 'Stage 3 — Collectibles & exploration',
    hours: 'Along the way + cleanup',
    blurb:
      'The gathering stage: complete 3 Collectible Card sets, scan 100 WAiNK locations, discover 100 vehicles, clear the fog from all 52 areas of Leonida, buy all 8 garages and register 10 vehicles to the Scooter Bros app. Most of this accrues while travelling for other stages if you scan and explore as you go.',
    tips: [
      'Only 3 of the 18 card sets are needed — finish sets county by county.',
      'A WAiNK scan is enough to discover a vehicle; you do not need to drive it.',
      'Exploration, scanning and vehicle discovery all progress on the same trips.'
    ]
  },
  {
    stage: 4,
    title: 'Stage 4 — Activities, crime & cleanup',
    hours: 'The long middle',
    blurb:
      'Everything with a counter or a condition: 250 stunts, all 42 Shooting Range golds, drone races at 14 locations, 20 different race wins, the nine activity types, 50 Challenges, the partner crime trophies (bank vaults, shops, jewelry store, armored truck, gang operations) and the hidden one-off moments — an unscheduled airport departure, a showroom smash, a cocktail on Ocean Beach. The missable view in this tracker shows the single Chapter 1 warning again so it is never lost in the list.',
    tips: [
      'Partner trophies (Hot Together, Retail Therapy) need Jason and Lucia together.',
      'An escape only counts when the Wanted Level is fully lost.',
      'Hidden trophies with vague descriptions say so in their guides — no invented steps.'
    ]
  },
  {
    stage: 5,
    title: 'Stage 5 — 100% & the platinum',
    hours: 'About 100 hours',
    blurb:
      'Open Progress > Stats > 100% Completion and work what is left: every robbery, shooting range, drone race, underwater discovery and Bret quest, plus 70 of the 80 Challenges. PowerPyx puts the checklist at roughly 60% of everything in the game. When A Long Road (Gold) pops, Vice Got a Price! — the platinum — follows immediately.',
    tips: [
      'Progress made during the story already counts toward the checklist.',
      'Skip the ten hardest Challenges; only 70 of 80 are required.',
      'This is the longest stage by far — it is most of the roughly 200 hours to platinum.'
    ]
  }
];

export function stageFor(stageNumber) {
  return ROADMAP_STAGES.find((s) => s.stage === stageNumber) ?? ROADMAP_STAGES[0];
}
