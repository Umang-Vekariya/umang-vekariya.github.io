# Umang Vekariya — The Art of Engineering

[Portfolio](https://umang-vekariya.github.io/)

An editorial portfolio of intelligent systems, practical software, and open experiments. One original metallic sculpture introduces Umang; native reading sections introduce the person and education before an oversized, screenshot-led project index. Project images expand into accessible case studies with the original interactive demonstrations and browser applications. The Neural Studio remains a real, worker-trained network.

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

The build bundles only `engineering-form.js` and its Three.js dependencies. Commit the generated `dist/engineering-form.bundle.js` alongside the source. The existing GitHub Pages workflow uploads `dist/` on a push to `main`; no server, keys, or remote build is required.

## Presentation architecture

- `engineering.css`: one presentation stylesheet, with phone, tablet and desktop compositions. `neural-studio.css` retains the tool's underlying control layout.
- `engineering.js`: factual content, navigation, accessible dialogs, focus return, project selection, one shared-image transition, native scroll and visibility scheduling.
- `engineering-motion.js`: the deterministic, reversible title-frame motion and image-frame bounds. No scroll hijacking, secondary camera controller or animation framework.
- `engineering-form.js`: one original closed folded band, a morph to an aperture, studio lighting and subtle pointer response. It draws on scroll or interaction and stops after settling. It is not a permanent background scene.
- `portfolio-data.js`, `project-stories.js`, `project-proof.js` and `demo-content.js`: the retained genuine content and scope labels.
- `project-demos.js`, `demo-models.js`, `project-previews.js` and `assets/replay-engine.js`: the retained project calculations, state and previews. Demos stop drawing outside their visible project display. The large display keeps controls available on phones.
- `neural-studio.js`, `neural-worker.js` and `model.js`: real inference, off-main-thread training, drawing/undo, neuron inspection, independent test examples and learning history. Training pauses when the tool or document is hidden.

The old rooms, installation renderers, spatial labels and camera-flight controllers have been retired. Their exact source remains in the recovery branch `backup/before-art-of-engineering-2026-11-03` at `2f137fa34a3c02330325d676dfbd6c2d3e07c544`.

## Direct access and accessibility

- `#about`, `#education`, `#experience`, `#work`, `#collection`, `#lab`, `#contact` remain useful entry points.
- `#project-polyglot` (and the other project IDs) opens its case study directly.
- `?view=quick` opens the concise overview; Quick View is also available in the header.
- `?graphics=off` uses the original inline vector fallback without loading Three.js. Save-data connections use that same path.
- Motion respects the system preference and the footer toggle. The stationary view removes the pinned opening's extra travel; project opening/closing and navigation become immediate.
- Native dialogs contain keyboard focus and support Escape. Menu and skill/tool tabs support keyboard navigation. Project close returns focus and preserves underlying reading position.

## Recovery and verification notes

The pre-redesign baseline is also archived outside this checkout at `../backups/before-art-of-engineering-2026-11-03/github-pages.tar.gz`, with its SHA in `commit.txt`. The original private Sites checkout remains separate.

See [the audit and verification record](docs/art-of-engineering.md). The eleven regression tests cover neural-network gradients and worker lifecycle, independent test data, opening continuity, sculpture/morph integrity, shared-image proportions, retained project routes/evidence/apps, demo calculations, and idle/reduced-motion rendering. Browser checks are recorded separately; no performance score or physical-device certification is claimed.
