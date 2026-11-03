# Umang Vekariya — Living Lab

Portfolio: https://umang-vekariya.github.io/

An original cinematic portfolio built around an identity aperture, spatial personal overview, and eight connected project installations. Scroll moves through curved 3D camera rails; direct project selection uses an interruptible camera flight. Approaching a display leads into the actual accessible case study, canvas or browser application, with a return to the same project state. The approved ivory project index, Quick View, command palette, résumé, certificates and contacts remain available.


## Development

```sh
npm ci
npm run dev
```

Open http://localhost:4176/. Source files and the ready-to-publish output are in `dist/`. After editing scene modules, run:

```sh
npm run build
npm run check
npm test
```

`camera-rig.js` is the sole camera owner: scroll rails, quaternion orientation, bounded banking, direct navigation, display focus and return. `flow.js` maps native scroll to chapter progress. `workshop-architecture.js` builds open exhibition islands; `project-worlds.js` retains the live project textures and state-linked props. `lab-effects.js` supplies the original GPU aperture reconstruction and architectural geometry. `spatial-dialog.js` matches projected display bounds to real HTML dialog entrances. `section-navigation.js` handles long section jumps without scrolling through every intermediate demo. No additional animation or scrolling framework is required.

`profile-layout.js` and `profile-foyer.js` retain the personal installations, with native labels from `spatial-type.js`. `living-lab.css` and `living-lab.js` own the visual and interaction layer; the approved library remains isolated in `project-index.css` and `project-index.js`.

## Deployment

The GitHub Pages workflow publishes `dist/` when `main` changes. The built scene bundle is committed; hosting requires no server or build environment. Only the static output is uploaded to Pages.

The original private Sites checkout and the pre-workshop snapshot remain separate backups on the owner's computer.

Small personal-installation labels use `spatial-type.js` to position native browser text from 3D anchors. This keeps glyph proportions and clarity independent of the WebGL resolution. Education stays on the right; the experience installation sits on the left with its supporting copy opposite it. The desktop overview reading layer is fixed while its scene is active.

Rendering caps pixel ratio, adapts quality when frames are slow, limits active neighboring islands, disables bloom on narrow screens, and suspends the renderer offscreen or behind dialogs. Direct lab and library entry defers 3D loading. Use `?graphics=off` to exercise the working non-WebGL fallback, or `?view=quick` for the recruiter path. `?audit=1` writes local browser diagnostics into `#performance-audit`; it is not a Core Web Vitals certification or a physical-device benchmark.

See `docs/living-lab.md` for the audit, architecture, verification notes and limits.

## Neural studio

The playground is now a browser-only teaching experiment: draw labeled examples with pointer or keyboard, inspect hidden-neuron activation fields, change network width, and compare training accuracy with a separate unseen set. The default intertwined spirals, circles, and moons each use 120 training examples and 80 independently generated test examples. Noise affects only the test examples and pauses training for comparison. Blank drawings have no fabricated test score. Undo removes a complete stroke; resetting weights preserves examples.

`neural-studio.js` owns the interface and inference views; `neural-worker.js` trains off the main thread and suspends while the studio is offscreen or the tab is hidden. `model.js` implements the tanh network and backpropagation. Tests check gradients, generalization, snapshot parity, test-data immutability, and worker resets.

The studio now presents Learn, Inspect, and Challenge as separate accessible tabs around a persistent prediction field. Learn contains the pattern choice and drawing tools; network tuning and loss history start collapsed. Inspect reveals the network, and Challenge pauses training before showing independent test examples and noise controls. Switching tabs preserves data, weights, and training progress. Captions and controls use a more spacious layout and larger type.


The ivory, staggered project library is isolated in `project-index.css` and `project-index.js`. The immersive scenes use the Living Lab camera system; the model diagram beside the studio heading displays actual current weights and activations.
