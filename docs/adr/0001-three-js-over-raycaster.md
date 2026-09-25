# Three.js rather than a raycaster

"3D first-person in 90's style" could be built as a Wolfenstein-style raycaster (authentic, tiny, pure canvas) or as full 3D with Three.js. We chose Three.js: the office needs free-look movement and furniture/prop objects (dumpsters, printers, PCs) that a grid-based raycaster handles poorly, and the ecosystem makes low-poly assets cheap. The 90's feel is therefore an art-direction decision (low-res textures, simple geometry), not a rendering-technique one.
