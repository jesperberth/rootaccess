import { describe, expect, it } from 'vitest';
import { createGame } from './game.js';

// A minimal one-room level used across these tests.
// Room spans x [-6, 6], z [-4, 4]. Desk AABB: x [-2, -0.4], z [-1, 0.2].
const LEVEL = {
  name: 'Office',
  room: { width: 12, depth: 8 },
  playerStart: { x: 0, z: 2, yaw: 0, pitch: 0 },
  player: { radius: 0.3, speed: 2, interactRange: 1.5, fireRange: 6 },
  obstacles: [
    { id: 'desk-1', kind: 'desk', x: -1.2, z: -0.4, w: 1.6, d: 1.2, h: 0.75 },
  ],
  incidents: [
    { id: 'printer-1', type: 'jammed-printer', x: 5, z: 0 },
  ],
  pickups: [
    { id: 'mcnorton-1', kind: 'mcnorton', x: 0, z: 1 },
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

  it('player can pick up McNorton when standing next to it', () => {
    const game = createGame(LEVEL);
    // Pickup sits 1m north of the start, inside interactRange.
    const { events } = game.dispatch({ type: 'pickup' });
    expect(events).toEqual([
      { type: 'PickupCollected', pickup: 'mcnorton-1', kind: 'mcnorton' },
    ]);
    expect(game.state.inventory.tools).toContain('mcnorton');
  });

  it('a pickup out of reach is not collected and emits nothing', () => {
    const game = createGame(LEVEL);
    game.dispatch({ type: 'move', forward: -1, right: 0, dt: 0.5 });
    // Now 2m south of the McNorton box, beyond interactRange.
    const { events } = game.dispatch({ type: 'pickup' });
    expect(events).toEqual([]);
    expect(game.state.inventory.tools).not.toContain('mcnorton');
  });

  it('a collected pickup cannot be collected twice', () => {
    const game = createGame(LEVEL);
    game.dispatch({ type: 'pickup' });
    const { events } = game.dispatch({ type: 'pickup' });
    expect(events).toEqual([]);
  });

  it('firing the Shotgun at the jammed printer resolves the Incident', () => {
    const game = createGame(LEVEL);
    // Printer at (5,0), player at (0,2): within the 6m fire range.
    const { events } = game.dispatch({ type: 'fire', target: 'printer-1' });
    expect(events).toEqual([
      { type: 'IncidentResolved', incident: 'printer-1', resolver: 'shotgun' },
    ]);
    expect(game.state.incidents['printer-1'].resolved).toBe(true);
    expect(game.state.incidentsResolved).toBe(1);
    expect(game.state.incidentsTotal).toBe(1);
  });

  it('using McNorton on the jammed printer draws a Quip and changes nothing', () => {
    const game = createGame(LEVEL);
    game.dispatch({ type: 'pickup' });
    // Walk to the printer: east along the wall, then a step north.
    game.dispatch({ type: 'move', forward: 0, right: 1, dt: 2.5 });
    game.dispatch({ type: 'move', forward: 1, right: 0, dt: 0.5 });
    const { events } = game.dispatch({
      type: 'use',
      tool: 'mcnorton',
      target: 'printer-1',
    });
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('Quip');
    expect(events[0].incident).toBe('printer-1');
    expect(events[0].text.length).toBeGreaterThan(0);
    expect(game.state.incidents['printer-1'].resolved).toBe(false);
    expect(game.state.incidentsResolved).toBe(0);
  });

  it('using the correct Tool on its Incident resolves it', () => {
    const withPc = {
      ...LEVEL,
      incidents: [...LEVEL.incidents, { id: 'pc-1', type: 'infected-pc', x: 0, z: 1 }],
    };
    const game = createGame(withPc);
    game.dispatch({ type: 'pickup' });
    // The infected PC sits where the McNorton box was, within interactRange.
    const { events } = game.dispatch({
      type: 'use',
      tool: 'mcnorton',
      target: 'pc-1',
    });
    expect(events).toEqual([
      { type: 'IncidentResolved', incident: 'pc-1', resolver: 'mcnorton' },
    ]);
    expect(game.state.incidentsResolved).toBe(1);
  });

  it('using a Tool the player does not carry does nothing', () => {
    const game = createGame(LEVEL);
    const { events } = game.dispatch({
      type: 'use',
      tool: 'mcnorton',
      target: 'printer-1',
    });
    expect(events).toEqual([]);
  });

  it('firing the Shotgun at the wrong Incident draws a Quip and changes nothing', () => {
    const withPc = {
      ...LEVEL,
      incidents: [...LEVEL.incidents, { id: 'pc-1', type: 'infected-pc', x: 0, z: 1 }],
    };
    const game = createGame(withPc);
    // The infected PC stands 1m in front of the player start.
    const { events } = game.dispatch({ type: 'fire', target: 'pc-1' });
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('Quip');
    expect(events[0].incident).toBe('pc-1');
    expect(game.state.incidents['pc-1'].resolved).toBe(false);
    expect(game.state.incidentsResolved).toBe(0);
  });

  it('a resolved Incident stays resolved and draws nothing more', () => {
    const game = createGame(LEVEL);
    game.dispatch({ type: 'fire', target: 'printer-1' });
    const { events } = game.dispatch({ type: 'fire', target: 'printer-1' });
    expect(events).toEqual([]);
    expect(game.state.incidentsResolved).toBe(1);
  });

  it('firing beyond Shotgun range resolves nothing', () => {
    const game = createGame(LEVEL);
    game.dispatch({ type: 'move', forward: 0, right: -1, dt: 0.5 });
    // Now 6.3m from the printer, past the 6m fire range.
    const { events } = game.dispatch({ type: 'fire', target: 'printer-1' });
    expect(events).toEqual([]);
    expect(game.state.incidents['printer-1'].resolved).toBe(false);
    expect(game.state.incidentsResolved).toBe(0);
  });
});
