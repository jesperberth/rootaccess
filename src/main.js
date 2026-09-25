// Browser entry point: input + rendering as thin adapters over the simulation.
// No game rules live here.
import * as THREE from 'three';
import { createGame } from './sim/game.js';
import { buildScene } from './render/scene.js';
import { createQuipSystem } from './render/quip.js';
import { createHud } from './render/hud.js';
import { OFFICE } from './level/office.js';

const game = createGame(OFFICE);
const level = OFFICE;

const canvas = document.getElementById('game');
const overlay = document.getElementById('overlay');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = buildScene(level);
const quips = createQuipSystem(scene);
const hud = createHud();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  50,
);
camera.rotation.order = 'YXZ';

// --- Targeting: whatever the crosshair is on, if it is an Incident ---
const raycaster = new THREE.Raycaster();
const crosshairNdc = new THREE.Vector2(0, 0);

function aimIncident() {
  raycaster.setFromCamera(crosshairNdc, camera);
  for (const hit of raycaster.intersectObjects(scene.children, true)) {
    if (hit.object.isSprite) continue; // Quip bubbles never block a shot
    return hit.object.userData.incidentId ?? null;
  }
  return null;
}

function handleEvents(events) {
  for (const event of events) {
    if (event.type === 'Quip') {
      quips.show(event.text, scene.userData.incidents[event.incident].position);
    } else if (event.type === 'PickupCollected') {
      scene.remove(scene.userData.pickups[event.pickup]);
    }
  }
}

// --- Input: pointer lock mouse-look ---
const LOOK_SENSITIVITY = 0.0022;

document.addEventListener('click', () => {
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
    return;
  }
  handleEvents(game.dispatch({ type: 'fire', target: aimIncident() }).events);
});
document.addEventListener('pointerlockchange', () => {
  overlay.classList.toggle('hidden', document.pointerLockElement === canvas);
});
document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== canvas) return;
  game.dispatch({
    type: 'look',
    dyaw: -e.movementX * LOOK_SENSITIVITY,
    dpitch: -e.movementY * LOOK_SENSITIVITY,
  });
});

// --- Input: WASD + interact keys ---
const keys = new Set();
document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  keys.add(e.code);
  if (document.pointerLockElement !== canvas) return;
  if (e.code === 'KeyE') {
    handleEvents(game.dispatch({ type: 'pickup' }).events);
  } else if (e.code === 'KeyF') {
    // F uses whatever Tool the player carries; the sim decides what it does.
    const tool = game.state.inventory.tools[0];
    if (tool) {
      handleEvents(
        game.dispatch({ type: 'use', tool, target: aimIncident() }).events,
      );
    }
  }
});
document.addEventListener('keyup', (e) => keys.delete(e.code));

function moveIntent() {
  let forward = 0;
  let right = 0;
  if (keys.has('KeyW')) forward += 1;
  if (keys.has('KeyS')) forward -= 1;
  if (keys.has('KeyD')) right += 1;
  if (keys.has('KeyA')) right -= 1;
  return { forward, right };
}

// --- Frame loop: drive the sim, then mirror state into the camera ---
const clock = new THREE.Clock();

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  const { forward, right } = moveIntent();
  if (forward !== 0 || right !== 0) {
    game.dispatch({ type: 'move', forward, right, dt });
  }

  const { x, z, yaw, pitch } = game.state.player;
  camera.position.set(x, level.player.eyeHeight, z);
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  // Incident indicators blink red while unresolved, sit green once resolved.
  const elapsed = clock.elapsedTime;
  for (const [id, light] of Object.entries(scene.userData.incidentLights)) {
    const resolved = game.state.incidents[id].resolved;
    light.material.color.setHex(resolved ? 0x00c000 : 0xff2200);
    light.visible = resolved || Math.floor(elapsed * 4) % 2 === 0;
  }

  quips.update(dt);
  hud.update(game.state);
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

frame();
