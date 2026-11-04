# Living topographic surface — 4 November 2026

## Reference and composition

The live [Lando Norris site](https://landonorris.com/) was inspected in a real browser, including pointer movement and scrolling. Its background uses faint irregular contour loops that reshape while the portrait and typography remain dominant. This informed the visual hierarchy; no reference assets or implementation were copied.

The previous cobalt ribbon wall has been removed. A sparse, low-contrast contour field now follows a continuous displaced 3D membrane. Noise is warped at multiple scales to avoid a repeated stripe pattern. The original sculpture, name, project atlas and eight exhibits retain their presentation and functionality. The membrane is camera-local background relief, not a fixed architectural terrain or a free-floating volumetric simulation.

## Interaction and rendering

A 128×128 pair of half-float render targets solves a damped finite-difference wave equation at a fixed 1/120 second step. Pointer segments inject disturbances into velocity; nearby contours deform with the changing height field. The membrane's actual vertices also move in depth. A gentle local dimple provides immediate feedback, and small perspective changes reinforce depth. Waves propagate after the pointer leaves, rather than clearing abruptly when it enters a navigation control.

Bicubic sampling smooths the pressure field before generating the contour lines, avoiding visible grid stepping. Contour antialiasing uses screen-space derivatives. The procedural base height is evaluated in the vertex shader and interpolated, avoiding repeated full-noise evaluation per screen pixel. All simulation and scene passes use the existing Three.js renderer and canvas. The previous render target is restored before the exhibition renders.

No extra idle animation loop is introduced. Rendering continues while a disturbance settles, then the pressure buffers clear and scheduling stops. The topographic pattern keeps its gently evolved resting shape. Motion-off and reduced motion immediately clear disturbances. Fine-pointer input is suppressed over real tools and when the world is covered by the index, studio or finale. Touch keeps the stationary composition. Browsers without half-float render-target support use an analytic wave fallback; that fallback is implementation-reviewed, not claimed as tested on unsupported physical hardware. Graphics-off retains the existing native fallback.

Geometry, shaders, render targets, textures and listeners are disposed with the existing scene. Simulated waves have no network or application-state side effects. Existing project controls, demos, case studies, Quick View, résumé and Neural Studio remain native.

## Verification

Three new regressions cover dense finite indexed surface geometry and responsive perspective margins, the solver’s still state and stable fixed step, and local wave propagation with bounded amplitude and dissipation. Together with the existing suite, 47 tests pass. Actual browser screenshots were used to iterate line density, contrast and wave smoothness on desktop and phone-sized layouts. Browser verification records and screenshots are archived outside deployment. No FPS, Core Web Vitals or physical-device certification is claimed.

Recovery baseline: `backup/before-contour-surface-2026-11-04` at `742f75798e91bad9affca2b2725b1453576a4760`.
