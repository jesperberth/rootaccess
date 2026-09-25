export function createGame(levelSpec) {
  const state = {
    player: { ...levelSpec.playerStart },
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
