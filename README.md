# Umang Vekariya — The Art of Engineering

[Portfolio](https://umang-vekariya.github.io/)

A continuous 3D exhibition of intelligent systems, practical software, and open experiments. A flowing serif wordmark and an original folded cobalt sculpture introduce Umang. Readable native text introduces the person, education and experience before the camera enters an open courtyard containing all eight project displays. Each display shows actual project evidence and can switch to its preserved working walkthrough. Camera focus leads into accessible case studies and real browser applications. The Neural Studio remains a real, worker-trained network.

The palette uses midnight black, electric cobalt and acid lime across the world, interface and tools.
## Run and verify

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4176/. The static source and publishable output are in `dist/`.

```sh
npm run build
npm run check
npm test
```

The build bundles `spatial-world.js` and its Three.js dependencies. Commit the generated `dist/spatial-world.bundle.js` alongside the source. The existing GitHub Pages workflow uploads `dist/` on a push to `main`; no server, keys, or remote build is required.

## Presentation architecture

- `engineering.css` provides native layouts; `spatial.css` supplies the spatial compositions and rich palette. `neural-studio.css` retains the functional tool layout.
- `engineering.js` owns content, navigation, accessible dialogs, native scroll, project selection and the bridge from physical displays to case studies and apps.
- `spatial-world.js` owns the sole WebGL renderer, the sculpture, shared courtyard, actual evidence textures, persistent per-exhibit demo textures, pointer raycasting and camera flights. Rendering stops after settling and while dialogs or the Neural Studio cover the world.
- `spatial-craft.js` creates beveled housings, turned pedestals, machined apertures, reflection lighting and independent display surfaces. Exhibits stay in the scene throughout the journey; native frustum culling handles what lies outside the view.
- `spatial-layout.js` defines deterministic camera shots and curved, reversible travel between the eight exhibits. Position, orientation and lens movement are coordinated in the same renderer.
- `engineering-form.js` creates the original closed folded band and its aperture morph. It has no separate renderer.
- `portfolio-data.js`, `project-stories.js`, `project-proof.js` and `demo-content.js` preserve genuine content and scope labels.
- `project-demos.js`, `demo-models.js`, `project-previews.js` and `assets/replay-engine.js` retain project calculations, controls, state and previews. Native controls use unique IDs for the gallery and case study. On phones the compact display opens the full case and controls.
- `neural-studio.js`, `neural-worker.js` and `model.js` retain real inference, worker training, drawing/undo, neuron inspection, independent test examples and learning history.

The old rooms and corridor have been retired; this is one shared open space. The former implementation remains in `backup/before-art-of-engineering-2026-11-03` at `2f137fa34a3c02330325d676dfbd6c2d3e07c544`. The later editorial version is preserved in `backup/editorial-art-of-engineering-2026-11-03` at `ad2eb8448a87bfdc45411b4fd00c0bc8d2b94f06`.

## Direct access and accessibility

- `#about`, `#education`, `#experience`, `#work`, `#gallery`, `#collection`, `#lab`, `#contact` remain useful entry points.
- `#project-polyglot` (and the other project IDs) opens its case study directly.
- `?view=quick` opens the concise overview; Quick View is also available in the header.
- `?graphics=off` uses an inline vector opening and functional flat project displays without loading Three.js. Save-data connections use that same path.
- Motion respects the system preference and the footer toggle. The stationary view removes the pinned opening's extra travel; project opening/closing and navigation become immediate.
- Native dialogs contain keyboard focus and support Escape. Menu and skill/tool tabs support keyboard navigation. Project close returns focus and preserves underlying reading position.

## Recovery and verification notes

The pre-redesign baseline is also archived outside this checkout at `../backups/before-art-of-engineering-2026-11-03/github-pages.tar.gz`, with its SHA in `commit.txt`. The original private Sites checkout remains separate.

See [the spatial redesign and verification record](docs/spatial-gallery.md) and [the earlier editorial audit](docs/art-of-engineering.md). The 40 regression tests cover neural-network gradients and worker lifecycle, independent test data, opening and camera-path continuity, responsive exhibit framing, sculpture/morph integrity, shared-image proportions, retained project routes/evidence/apps, demo calculations, and idle/reduced-motion rendering. Browser checks are recorded separately; no performance score or physical-device certification is claimed.

The real Neural Studio pulls back into a separate cobalt closing space as the visitor scrolls beyond the tool. Its original DOM, canvas and worker remain in place; see [studio-finale.md](docs/studio-finale.md) for the reversible camera/HTML handoff, mobile window and verification.

The overview installation is now an interactive atlas of eight actual project folios. Hover a cover to bring it forward and read its label; select one to enter its gallery exhibit. The keyboard-accessible atlas link leads to the full index. Direct overview view: `#atlas`. See [project-atlas.md](docs/project-atlas.md).

The opening identity uses continuous custom outlines extruded into solid, bevelled 3D letters, with pale metallic faces and cobalt sides. Its staggered depth assembly, local hover lift and optional replay share the main scene renderer. Supporting narrative type uses sculpted headings and readable native HTML on matching 3D planes. See [solid-lettering.md](docs/solid-lettering.md).

The project atlas parts into two groups of four to make a physical camera passage. Scroll reverses the same camera and geometry; explicit opening controls pause at the atlas and continue through it. See `docs/atlas-passage.md`.

The atlas now rests as an overlapping hand with no default selection. Hover lifts and outlines any card, including after the banks separate. Stable full-border hit regions keep the response steady. See `docs/card-hand.md`.

The opening identity and transition phrase now occupy fixed world planes to the left of their installations, with genuine camera perspective and a clear central path. Native SVG/HTML retains sharp lettering and the original name interaction. See [spatial-copy.md](docs/spatial-copy.md).
