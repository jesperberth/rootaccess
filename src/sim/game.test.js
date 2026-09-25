import { describe, expect, it } from 'vitest';
import { createGame } from './game.js';

// A minimal one-room level used across these tests.
// Room spans x [-6, 6], z [-4, 4]. Desk AABB: x [-2, -0.4], z [-1, 0.2].
const LEVEL = {
  name: 'Office',
  room: { width: 12, depth: 8 },
  playerStart: { x: 0, z: 2, yaw: 0, pitch: 0 },
  player: { radius: 0.3, speed: 2 },
  obstacles: [
    { id: 'desk-1', kind: 'desk', x: -1.2, z: -0.4, w: 1.6, d: 1.2, h: 0.75 },
  ],
};

describe('Game simulation', () => {
  it('places the player at the level start position', () => {
    const game = createGame(LEVEL);
    expect(game.state.player.x).toBe(0);
    expect(game.state.player.z).toBe(2);
  });

  it('move converts forward intent into displacement at the level speed', () => {
    const game = createGame(LEVEL);
    // yaw 0 faces -z; one second at speed 2 walks 2m north.
    game.dispatch({ type: 'move', forward: 1, right: 0, dt: 1 });
    expect(game.state.player.x).toBe(0);
    expect(game.state.player.z).toBeCloseTo(0);
  });

  it('dispatching a move action changes the player position', () => {
    const game = createGame(LEVEL);
    game.dispatch({ type: 'move', forward: 0, right: 1, dt: 0.75 });
    const { state } = game.dispatch({ type: 'move', forward: 1, right: 0, dt: 0.25 });
    expect(state.player.x).toBe(1.5);
    expect(state.player.z).toBe(1.5);
    expect(game.state.player.x).toBe(1.5);
  });

  it('player cannot walk through furniture', () => {
    const game = createGame(LEVEL);
    // Walk to just clear of the desk's west face (x = -2), z aligned with desk.
    game.dispatch({ type: 'move', forward: 1, right: -1, dt: 1.2 });
    expect(game.state.player.x).toBeCloseTo(-2.4);
    expect(game.state.player.z).toBeCloseTo(-0.4);
    // Push east through the desk: player stays put, blocked by the face.
    const { state } = game.dispatch({ type: 'move', forward: 0, right: 1, dt: 0.5 });
    expect(state.player.x).toBeCloseTo(-2.4);
    expect(state.player.z).toBeCloseTo(-0.4);
  });

  it('player cannot walk through room walls', () => {
    const game = createGame(LEVEL);
    // Room north wall at z = -4; a huge northward shove must not move the player.
    game.dispatch({ type: 'move', forward: 1, right: 0, dt: 5 });
    expect(game.state.player.z).toBe(2);
  });

  it('player slides along a wall when moving diagonally into it', () => {
    const game = createGame(LEVEL);
    // Mostly north (blocked by the wall) with a little east: slides east.
    game.dispatch({ type: 'move', forward: 1, right: 0.2, dt: 5 });
    expect(game.state.player.x).toBeCloseTo(2);
    expect(game.state.player.z).toBe(2);
  });

  it('dispatching a look action turns the player', () => {
    const game = createGame(LEVEL);
    const { state } = game.dispatch({ type: 'look', dyaw: 0.4, dpitch: -0.2 });
    expect(state.player.yaw).toBeCloseTo(0.4);
    expect(state.player.pitch).toBeCloseTo(-0.2);
  });

  it('pitch is clamped to looking straight up or down', () => {
    const game = createGame(LEVEL);
    game.dispatch({ type: 'look', dyaw: 0, dpitch: -10 });
    expect(game.state.player.pitch).toBeCloseTo(-Math.PI / 2);
    game.dispatch({ type: 'look', dyaw: 0, dpitch: 10 });
    expect(game.state.player.pitch).toBeCloseTo(Math.PI / 2);
  });

  it('a move blocked with no slide available emits MoveBlocked', () => {
    const game = createGame(LEVEL);
    // Walk to the desk's west face, then push into it.
    game.dispatch({ type: 'move', forward: 1, right: -1, dt: 1.2 });
    const { events } = game.dispatch({ type: 'move', forward: 0, right: 1, dt: 0.5 });
    expect(events).toEqual([{ type: 'MoveBlocked' }]);
  });

  it('a free move emits no events', () => {
    const game = createGame(LEVEL);
    const { events } = game.dispatch({ type: 'move', forward: -1, right: 1, dt: 0.25 });
    expect(events).toEqual([]);
  });
});
