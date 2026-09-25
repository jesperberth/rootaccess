# rootaccess

A 90's-style first-person shooter set in an office, for the IT crowd.

## The game

You creep through an office building, dodging Hackers and resolving the IT Incidents that only the right tool can fix. Clear every Incident in a Level and the Exit Door unlocks.

- **3 Levels** in one building, ~10 minutes, chained by Exit Doors. No level-select, no checkpoints — dying restarts the Level.
- **Enemies**: Hackers, and only Hackers. They idle at terminals and lob slow projectiles when you come near.
- **Incidents**: dumpster fires, virus-infected PCs, jammed printers. Each has exactly one correct resolver; the wrong tool does nothing but draw a Quip.
  - Dumpster fire → Extinguisher Grenade
  - Infected PC → antivirus McNorton
  - Jammed printer → Shotgun (percussive maintenance)
- **Items**: you start with the Shotgun; McNorton is a permanent find in Level 1; grenades, shells and Coffee Mugs (+25 Health) are pickups. Inventory carries across Levels, and every Incident has a Stash of its resolver nearby — you can never soft-lock a Level.
- **Keycards** open optional Side Rooms full of loot. They never gate the path forward.
- **End**: a punchline screen with your stats — time, shots fired, Quips triggered, deaths. Best time is saved locally.

The 90's feel comes from art direction, not rendering: low-poly free assets, low-res textures, a palette-shifting post-process, and a chunky pixel HUD.

## Technical

- JavaScript, Three.js, built with Vite.
- Single-player, no backend, no accounts. Persistence is localStorage at most.
- Runs in the browser; deployed to an S3 bucket behind CloudFront via GitHub Actions.

See [CONTEXT.md](./CONTEXT.md) for the canonical vocabulary and [docs/adr/](./docs/adr/) for the decisions behind the shape of the game.
