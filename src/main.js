// Browser entry point: input + rendering as thin adapters over the simulation.
// No game rules live here.
import * as THREE from 'three';
import { createGame } from './sim/game.js';
import { buildScene } from './render/scene.js';
import { OFFICE } from './level/office.js';

const game = createGame(OFFICE);
const level = OFFICE;

const canvas = document.getElementById('game');
const overlay = document.getElementById('overlay');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = buildScene(level);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  50,
);
camera.rotation.order = 'YXZ';

// --- Input: pointer lock mouse-look ---
const LOOK_SENSITIVITY = 0.0022;

document.addEventListener('click', () => {
  if (document.pointerLockElement !== canvas) canvas.requestPointerLock();
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

// --- Input: WASD ---
const keys = new Set();
document.addEventListener('keydown', (e) => keys.add(e.code));
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
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

frame();
