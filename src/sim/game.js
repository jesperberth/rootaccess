// The one-to-one rule from CONTEXT.md: each Incident type is resolved by
// exactly one Tool or Weapon. Anything else draws a Quip and changes nothing.
export const RESOLVERS = {
  'dumpster-fire': 'extinguisher-grenade',
  'infected-pc': 'mcnorton',
  'jammed-printer': 'shotgun',
};

// Mocking lines for the wrong resolver, keyed "incidentType:resolver".
const QUIPS = {
  'jammed-printer:mcnorton':
    'Scan complete. The virus is a sheet of A4 stuck in tray two.',
  'jammed-printer:extinguisher-grenade':
    'The printer is not on fire. Legally, it is not on fire.',
  'infected-pc:shotgun':
    'Threat removed. The threat was the PC. Mostly the PC.',
  'infected-pc:extinguisher-grenade':
    'The PC is damp now. The virus is dry and unimpressed.',
  'dumpster-fire:mcnorton':
    'The dumpster is not a computer. Check your priorities.',
  'dumpster-fire:shotgun':
    'That was not a jam. That was burning. Now it is more burning.',
};

const GENERIC_QUIP = 'That is not how any of this works.';

export function createGame(levelSpec) {
  const state = {
    player: { ...levelSpec.playerStart },
    inventory: { weapons: ['shotgun'], tools: [] },
    incidents: Object.fromEntries(
      (levelSpec.incidents ?? []).map((incident) => [
        incident.id,
        { type: incident.type, resolved: false },
      ]),
    ),
    pickups: Object.fromEntries(
      (levelSpec.pickups ?? []).map((pickup) => [
        pickup.id,
        { kind: pickup.kind, collected: false },
      ]),
    ),
    incidentsResolved: 0,
    incidentsTotal: (levelSpec.incidents ?? []).length,
  };
  const radius = levelSpec.player.radius;

  // True if the player circle at (x, z) overlaps any obstacle or the room walls.
  function collides(x, z) {
    const halfW = levelSpec.room.width / 2;
    const halfD = levelSpec.room.depth / 2;
    if (x - radius < -halfW || x + radius > halfW) return true;
    if (z - radius < -halfD || z + radius > halfD) return true;
    return levelSpec.obstacles.some((obstacle) => {
      const nearestX = Math.max(
        obstacle.x - obstacle.w / 2,
        Math.min(x, obstacle.x + obstacle.w / 2),
      );
      const nearestZ = Math.max(
        obstacle.z - obstacle.d / 2,
        Math.min(z, obstacle.z + obstacle.d / 2),
      );
      const dx = x - nearestX;
      const dz = z - nearestZ;
      return dx * dx + dz * dz < radius * radius;
    });
  }

  // Apply the resolver table to one attempt: correct resolver resolves the
  // Incident, wrong resolver draws a Quip, anything else changes nothing.
  function attemptResolve(incident, resolver, maxRange) {
    if (state.incidents[incident.id].resolved) return { state, events: [] };
    const { x, z } = state.player;
    if (Math.hypot(incident.x - x, incident.z - z) > maxRange) {
      return { state, events: [] };
    }
    if (RESOLVERS[incident.type] === resolver) {
      state.incidents[incident.id].resolved = true;
      state.incidentsResolved += 1;
      return {
        state,
        events: [{ type: 'IncidentResolved', incident: incident.id, resolver }],
      };
    }
    return {
      state,
      events: [
        {
          type: 'Quip',
          incident: incident.id,
          text: QUIPS[`${incident.type}:${resolver}`] ?? GENERIC_QUIP,
        },
      ],
    };
  }

  function findIncident(id) {
    return levelSpec.incidents?.find((entry) => entry.id === id);
  }

  function dispatch(action) {
    switch (action.type) {
      case 'move': {
        const { x, z, yaw } = state.player;
        // Convert forward/right intent into a world displacement at the
        // level's walk speed. Camera forward is -z rotated by yaw.
        const dist = levelSpec.player.speed * action.dt;
        const dx =
          (Math.sin(yaw) * -action.forward + Math.cos(yaw) * action.right) *
          dist;
        const dz =
          (Math.cos(yaw) * -action.forward - Math.sin(yaw) * action.right) *
          dist;
        let nx = x + dx;
        let nz = z + dz;
        if (collides(nx, nz)) {
          // Try each axis alone so the player slides along obstacles and walls.
          if (!collides(x + dx, z)) {
            nx = x + dx;
            nz = z;
          } else if (!collides(x, z + dz)) {
            nx = x;
            nz = z + dz;
          } else {
            nx = x;
            nz = z;
          }
        }
        state.player.x = nx;
        state.player.z = nz;
        const blocked = nx === x && nz === z && (dx !== 0 || dz !== 0);
        return { state, events: blocked ? [{ type: 'MoveBlocked' }] : [] };
      }
      case 'pickup': {
        const { x, z } = state.player;
        // Nearest in-reach uncollected Pickup wins.
        let candidate;
        let best = Infinity;
        for (const pickup of levelSpec.pickups ?? []) {
          if (state.pickups[pickup.id].collected) continue;
          const d = Math.hypot(pickup.x - x, pickup.z - z);
          if (d <= levelSpec.player.interactRange && d < best) {
            candidate = pickup;
            best = d;
          }
        }
        if (!candidate) return { state, events: [] };
        state.pickups[candidate.id].collected = true;
        if (candidate.kind === 'mcnorton') state.inventory.tools.push('mcnorton');
        return {
          state,
          events: [
            { type: 'PickupCollected', pickup: candidate.id, kind: candidate.kind },
          ],
        };
      }
      case 'fire': {
        if (!state.inventory.weapons.includes('shotgun')) {
          return { state, events: [] };
        }
        const incident = action.target && findIncident(action.target);
        if (!incident) return { state, events: [] };
        return attemptResolve(incident, 'shotgun', levelSpec.player.fireRange);
      }
      case 'use': {
        if (!state.inventory.tools.includes(action.tool)) {
          return { state, events: [] };
        }
        const incident = action.target && findIncident(action.target);
        if (!incident) return { state, events: [] };
        return attemptResolve(incident, action.tool, levelSpec.player.interactRange);
      }
      case 'look': {
        state.player.yaw += action.dyaw;
        state.player.pitch = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, state.player.pitch + action.dpitch),
        );
        return { state, events: [] };
      }
      default:
        return { state, events: [] };
    }
  }

  return { state, dispatch };
}
