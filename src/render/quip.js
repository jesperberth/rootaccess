// Floating Quip text: a comic-style speech bubble rendered as a sprite.
// Purely cosmetic — the text comes from the simulation's Quip event.
import * as THREE from 'three';

const DURATION_S = 5;
const RISE_M_PER_S = 0.12;

function makeBubble(text) {
  const font = 'bold 30px "Comic Sans MS", "Trebuchet MS", sans-serif';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = font;
  const padX = 28;
  const padY = 20;
  const textW = Math.ceil(ctx.measureText(text).width);
  canvas.width = textW + padX * 2;
  canvas.height = 76;

  // Redraw after the canvas resize reset the context.
  ctx.fillStyle = '#fffbe8';
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 4;
  roundRect(ctx, 2, 2, canvas.width - 4, canvas.height - 4, 18);
  ctx.fill();
  ctx.stroke();

  ctx.font = font;
  ctx.fillStyle = '#1a1a1a';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, padX, canvas.height / 2 + 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false, // keep the joke readable through furniture
    }),
  );
  const worldHeight = 0.45;
  sprite.scale.set((canvas.width / canvas.height) * worldHeight, worldHeight, 1);
  sprite.renderOrder = 10;
  return sprite;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function createQuipSystem(scene) {
  const active = [];

  return {
    show(text, position) {
      const sprite = makeBubble(text);
      sprite.position.set(position.x, position.y + 0.7, position.z);
      scene.add(sprite);
      active.push({ sprite, age: 0 });
    },
    update(dt) {
      for (let i = active.length - 1; i >= 0; i -= 1) {
        const quip = active[i];
        quip.age += dt;
        const t = quip.age / DURATION_S;
        if (t >= 1) {
          scene.remove(quip.sprite);
          quip.sprite.material.map.dispose();
          quip.sprite.material.dispose();
          active.splice(i, 1);
          continue;
        }
        quip.sprite.position.y += RISE_M_PER_S * dt;
        quip.sprite.material.opacity = t < 0.7 ? 1 : (1 - t) / 0.3;
      }
    },
  };
}
