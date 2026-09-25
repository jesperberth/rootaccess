// Three.js scene builder: turns a level spec into geometry. No game rules here.
import * as THREE from 'three';

const KIND_COLORS = {
  desk: 0x8a6f4d,
  chair: 0x333333,
  printer: 0xbfbfbf,
  bin: 0x4a7a4a,
  sofa: 0x6b4a7a,
  cabinet: 0x999999,
  plant: 0x2d6b2d,
};

export function buildScene(levelSpec) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);
  scene.userData = { incidents: {}, pickups: {}, faultLights: {} };
  const { width, depth, height } = levelSpec.room;

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const light = new THREE.DirectionalLight(0xfff2d9, 1.1);
  light.position.set(2, height - 0.2, 1);
  scene.add(light);

  const carpet = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshLambertMaterial({ color: 0x3a4a5a }),
  );
  carpet.rotation.x = -Math.PI / 2;
  scene.add(carpet);

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshLambertMaterial({ color: 0xd8d8d0 }),
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = height;
  scene.add(ceiling);

  const wallMat = new THREE.MeshLambertMaterial({ color: 0xb8b0a0 });
  const walls = [
    { w: width, x: 0, z: -depth / 2, ry: 0 },
    { w: width, x: 0, z: depth / 2, ry: Math.PI },
    { w: depth, x: -width / 2, z: 0, ry: Math.PI / 2 },
    { w: depth, x: width / 2, z: 0, ry: -Math.PI / 2 },
  ];
  for (const { w, x, z, ry } of walls) {
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(w, height),
      wallMat,
    );
    wall.position.set(x, height / 2, z);
    wall.rotation.y = ry;
    scene.add(wall);
  }

  for (const obstacle of levelSpec.obstacles) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(obstacle.w, obstacle.h, obstacle.d),
      new THREE.MeshLambertMaterial({
        color: KIND_COLORS[obstacle.kind] ?? 0x888888,
      }),
    );
    mesh.position.set(obstacle.x, obstacle.h / 2, obstacle.z);
    scene.add(mesh);

    // An Incident sharing this obstacle's id gets a flashing fault light and
    // a userData tag so the input adapter can raycast it.
    const incident = (levelSpec.incidents ?? []).find(
      (entry) => entry.id === obstacle.id,
    );
    if (incident) {
      mesh.userData.incidentId = incident.id;
      scene.userData.incidents[incident.id] = mesh;
      const light = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.12, 0.12),
        new THREE.MeshBasicMaterial({ color: 0xff2200 }),
      );
      light.position.set(obstacle.x, obstacle.h + 0.1, obstacle.z);
      scene.add(light);
      scene.userData.faultLights[incident.id] = light;
    }
  }

  // Incidents that share no obstacle id still need a position for Quips.
  for (const incident of levelSpec.incidents ?? []) {
    if (!scene.userData.incidents[incident.id]) {
      scene.userData.incidents[incident.id] = {
        position: new THREE.Vector3(incident.x, 1, incident.z),
      };
    }
  }

  for (const pickup of levelSpec.pickups ?? []) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.25, 0.06),
      new THREE.MeshLambertMaterial({ color: 0xd8d8f8 }),
    );
    mesh.position.set(pickup.x, pickup.y ?? 0.9, pickup.z);
    mesh.rotation.y = Math.PI / 6; // lean it like a box left in a hurry
    mesh.userData.pickupId = pickup.id;
    scene.add(mesh);
    scene.userData.pickups[pickup.id] = mesh;
  }

  return scene;
}
