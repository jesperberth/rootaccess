// One office room, defined as data. Coordinates are meters; the room is
// centered on the origin. x: east/west, z: north/south (negative z is "north",
// the direction the player starts facing).
export const OFFICE = {
  name: 'Open Plan Office',
  room: { width: 14, depth: 10, height: 2.8 },
  playerStart: { x: 0, z: 3.5, yaw: 0, pitch: 0 },
  player: { radius: 0.3, eyeHeight: 1.6, speed: 3, interactRange: 1.5, fireRange: 6 },
  obstacles: [
    // A row of desks facing the north wall.
    { id: 'desk-1', kind: 'desk', x: -4.5, z: -3, w: 1.6, d: 0.8, h: 0.75 },
    { id: 'desk-2', kind: 'desk', x: -1.5, z: -3, w: 1.6, d: 0.8, h: 0.75 },
    { id: 'desk-3', kind: 'desk', x: 1.5, z: -3, w: 1.6, d: 0.8, h: 0.75 },
    { id: 'desk-4', kind: 'desk', x: 4.5, z: -3, w: 1.6, d: 0.8, h: 0.75 },
    // Office chairs, roughly at each desk.
    { id: 'chair-1', kind: 'chair', x: -4.5, z: -1.8, w: 0.6, d: 0.6, h: 0.9 },
    { id: 'chair-2', kind: 'chair', x: -1.2, z: -1.9, w: 0.6, d: 0.6, h: 0.9 },
    { id: 'chair-3', kind: 'chair', x: 1.8, z: -1.7, w: 0.6, d: 0.6, h: 0.9 },
    // The jammed printer everyone is angry at.
    { id: 'printer-1', kind: 'printer', x: 6, z: 0, w: 0.9, d: 0.7, h: 1.1 },
    // Kitchen corner: a overflowing bin and a sofa.
    { id: 'bin-1', kind: 'bin', x: -6, z: 2.5, w: 0.8, d: 0.8, h: 0.9 },
    { id: 'sofa-1', kind: 'sofa', x: -3, z: 4, w: 2.4, d: 1, h: 0.8 },
    // Filing cabinets along the east wall.
    { id: 'cabinet-1', kind: 'cabinet', x: 6.5, z: -4, w: 1, d: 0.5, h: 1.4 },
    { id: 'cabinet-2', kind: 'cabinet', x: 6.5, z: 3.5, w: 1, d: 0.5, h: 1.4 },
    // A potted plant in the corner.
    { id: 'plant-1', kind: 'plant', x: -6.5, z: -4, w: 0.7, d: 0.7, h: 1.2 },
  ],
  // Incidents: the office is broken, and each Incident has exactly one
  // correct resolver (see RESOLVERS in the simulation). The printer Incident
  // shares its position with the printer-1 obstacle.
  incidents: [
    { id: 'printer-1', type: 'jammed-printer', x: 6, z: 0 },
  ],
  // McNorton, left on a desk: the player's first Tool.
  pickups: [
    { id: 'mcnorton-1', kind: 'mcnorton', x: -2, z: -2.2 },
  ],
};
