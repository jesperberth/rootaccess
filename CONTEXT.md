# rootaccess

A 90's-style first-person shooter set in an office, parodying IT-crowd culture. A compact single-player browser prototype: three small Levels in one office building, ~10 minutes of play, statically hosted.

## Language

### Cast & world

**Enemy**:
Anything that moves, attacks the player, and can be killed. Hackers are the only Enemies in the game.
_Avoid_: villain, mob, bad guy

**Hacker**:
The sole Enemy type — idles at a terminal until the player nears, then fires slow visible projectiles. 2–4 per Level.
_Avoid_: hacker enemy, NPC

**Incident**:
A static office malfunction resolved by exactly one correct Tool or Weapon: dumpster fire → Extinguisher Grenade, infected PC → McNorton, jammed printer → Shotgun. The wrong resolver does nothing but draw a mocking quip. Incidents do not move or attack.
_Avoid_: object, task, quest, hazard

### Items

**Weapon**:
An item whose purpose is to damage Enemies. Weapons double as Tools against their matching Incident.
_Avoid_: gun, armament

**Tool**:
An item whose purpose is to resolve an Incident or open a locked door. A Tool may also work (weakly or jokingly) as a Weapon.
_Avoid_: utility

**Shotgun**:
The Weapon the player starts with; fires Shells, and clears jammed printers by percussive maintenance.
_Avoid_: shortgun

**Extinguisher Grenade**:
A throwable pickup that douses dumpster fires (as Tool) and deals splash damage to Hackers (as Weapon).
_Avoid_: fire grenade, molotov

**Keycard**:
A collectible that opens locked Side Rooms. It never gates the main path or an Exit Door.
_Avoid_: badge, access card

**Side Room**:
An optional room behind a Keycard-locked door, containing loot. Never required for progression.
_Avoid_: secret area

**Shell**:
Ammo for the Shotgun, found scattered in Levels.
_Avoid_: ammo (as a noun for the Shotgun)

**Coffee Mug**:
A pickup restoring 25 Health; the only way to regain Health.

**Stash**:
A resolver-guaranteeing pickup staged at each Incident (a grenade by every dumpster fire, a shell box by every printer). Ensures an Incident is always resolvable.
_Avoid_: safety net, ammo drop

**McNorton**:
Brand-name antivirus; the Tool that cures infected PCs, and a joke Weapon doing trivial damage to Hackers. A permanent item acquired once in Level 1.
_Avoid_: Norton, antivirus (as a proper noun)

### Win & lose

**Resolve**:
To end an Incident by applying the correct Tool or Weapon to it. A Level's exit unlocks only when every Incident in it is resolved.
_Avoid_: fix, complete, clear (an Incident)

**Level**:
One contiguous area of the office building containing all three Incident types. Three Levels chained in order by Exit Doors; there is no level-select. Dying restarts the current Level; there are no checkpoints.
_Avoid_: map, stage, area

**Exit Door**:
The door that unlocks once all Incidents in the current Level are resolved; passing through it ends the Level successfully. Never gated by a Keycard.
_Avoid_: goal, finish

**Quip**:
The floating text bubble a wrong-resolver attempt on an Incident draws. Also a counted stat on the Punchline.
_Avoid_: voice line, taunt

**Punchline**:
The end screen after Level 3: a root-access joke plus stats (time, shots fired, Quips triggered, deaths). Best time persists in localStorage.
_Avoid_: credits, ending screen

**Health**:
The player's survivability; starts at 100, drained only by Hacker projectiles, restored only by Coffee Mugs. Reaching zero ends the run in defeat.
_Avoid_: HP bar (as a term), lives
