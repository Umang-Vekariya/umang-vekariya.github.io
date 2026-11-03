# Living Lab implementation notes

Baseline: e0feac41e1dd1f133e7884037d0284e9652eb261. An exact archive and commit record are in the workspace backup folder `before-living-lab-2026-11-02`.

## Audit

The site is static HTML, CSS and ES modules. Three.js is bundled with esbuild. GitHub Pages publishes committed `dist/`; no backend or framework migration is needed. Genuine content lives in portfolio-data, project-stories, demo-content and project-proof. Eight actual demonstrations, four embedded apps, evidence/case pages, résumé, education, certificates, contacts, command palette, Quick View and the worker-trained neural network must remain.

The existing renderer owns a frame loop; flow.js derives intro/profile/project phases from native scroll. Both flow easing and a second camera easing/1700ms flight affect the same movement. Flight targets are selected after an index changes, so fast scroll and reversal can disagree with the timed move. The exhibition uses one repeated rectangular room and fixed serpentine stations. Native spatial labels are already preferable to rasterized small type. The ivory index, original folded ribbon, project engine and worker/model separation are strong retained foundations.

## Direction and architecture

One Three.js camera rig owns the final camera pose. Native scroll supplies deterministic shot goals; direct navigation and display focus use explicit, interruptible rig transitions. Cubic spatial rails, bounded banking and damped following provide dolly, orbit and curved transit. No second scroll library, wheel hijacking, GSAP ticker or framework is introduced.

Original procedural environments: an identity aperture, a personal constellation, open project islands connected by light paths, and a converging contact composition. The generic room is replaced. All installations keep their functioning live display textures and truthful labels. Browser-native text carries reading content.

A selected display supplies its projected screen bounds to the real HTML dialog entrance. Closing returns the same camera, project, scroll position and demo state. The studio's decorative network is driven by the current real model weights/activations, not synthetic scores.

Reference study: samsy.ninja, bruno-simon.com, landonorris.com, siena.film, joseph-san.com, the two supplied Codrops articles, and Jonathan-Jesni/portfolio-ver-2. Principles: meaningful spatial scale, distinct shots, restrained light, screen-to-DOM matching and interaction continuity. No third-party geometry, imagery or source code is copied.

## Verification

Record build, source checks, camera geometry/continuity tests, feature tests and actual browser observations after implementation. Distinguish local browser performance observations from measured Core Web Vitals or physical-device benchmarks. Do not claim an award, 60 FPS or metric target without evidence.

### Implemented and checked — 3 November 2026

- Identity aperture, GPU ribbon-to-annulus reconstruction, separate personal architecture, open exhibition islands, curved project transits with bounded banking, quaternion orientation, display focus/return, and contact convergence are implemented with original procedural geometry.
- The same eight project identities, source links, genuine content/evidence and ivory index are retained. The data, proof, story and index files match the backup baseline. No external asset or new dependency is introduced.
- Fourteen automated tests pass: numerical gradients, training/test independence, snapshot inference, noise immutability, worker lifecycle, installation framing, native label placement, route consistency, reversible opening/gallery rails, exact station endpoints, interrupted/focused camera control and bounded rapid reversals. Geometry framing covers 1920×1080, 1440×900, 1280×720, 768×1024, 390×844 and 320×640, with additional profile bounds checks.
- Browser checks exercised all eight station controls; Vault produced a queued SHA-256 receipt. The actual PolyGlot app executed its mixed-syntax sample locally and produced 0, 1, 3, 6, 12, done. Closing returned to the same project and scroll position. Case-study display focus and app display entry were verified.
- Neural training reached 3000 epochs; the live heading diagram matched the current epoch. Inspection selected a real neuron. Challenge displayed 80 independent examples, noise changed only test data, and keyboard drawing/undo changed the point count from 3 to 2. Network resizing and tab keyboard navigation work. Credentials retain all 16 entries.
- Quick View exposes all three personal panels. AI/ML filtering returns the four matching projects; All restores eight. Command search, browser back to the prior project, reduced-motion selection (zero bank/no flight), fallback canvas actions and fallback display expansion were verified.
- Direct lab entry does not create a WebGL canvas. Long navigation jumps use a short interruptible chapter wipe to avoid activating every intermediate demo. Ordinary scroll remains native. One stale preview tab crashed during earlier navigation; fresh normal and fallback sessions were then tested and long-jump loading was corrected.
- Build, source/reference checks and whitespace checks pass. The compiled world bundle is approximately 667 KB minified. Static GitHub Pages hosting and existing embedded app paths are retained.

Local desktop browser checks ran at 1600×900 and a larger desktop viewport; narrow opening/passage views were also inspected. The browser viewport override did not consistently apply requested dimensions to localhost, so geometry tests are not represented as complete responsive DOM/device testing. No physical-device FPS target or Core Web Vitals score is claimed. Rendering quality adapts to slow frames; narrow screens omit bloom. Further live responsive verification is recorded with the deployment handoff.
