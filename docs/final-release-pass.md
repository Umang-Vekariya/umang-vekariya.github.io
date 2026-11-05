# Final presentation and loading pass — 5 November 2026

Recovery baseline: `backup/before-final-release-pass-2026-11-05` at `fcd8956c4c7b6ee6ae560cfdc1ffb2d397ae8620`.

## Opening and finale

The production build now splits ES modules. The opening entry and shared Three.js/craft chunk load first; the detailed desk and sculpted hand data live in a separate hashed chunk. Commit all generated files in `dist/assets/world/` along with `spatial-world.bundle.js`. No second Three.js runtime, renderer or render loop is introduced.

`createDeferredScene` requests the finale once, constructs it during an idle opportunity, and attaches it off camera. Preparation starts at education, gallery arrival or a direct studio visit. Its completion requests the existing render/update flow. Disposal blocks late attachment; loading or construction failure leaves the native studio/contact usable. The studio reveal requires ready geometry. If a visitor has already reached its reveal boundary before readiness, the native document stays in place for that visit; scrolling back before the studio boundary rearms the 3D transition. This intentionally prevents late geometry from appearing around an already visible tool.

Measured production graph sizes against the recovery baseline:

| Scene code | Raw bytes | Gzip bytes |
| --- | ---: | ---: |
| Previous combined scene | 1,484,140 | 695,110 |
| New opening + shared chunk | 734,639 | 206,503 |

The detailed desk chunk is 753,912 raw bytes. Total scene code is similar; the change removes roughly half from the opening path. Gzip was measured locally with Node zlib, not taken from a browser network audit. No FPS, Core Web Vitals, cold-load duration or physical-device certification is claimed.

## Work and readability

The project index and Quick View lead with Intent Lab, RealityForge and PlayableReplay. Each selected index card states the contribution and a scoped evidence statement. All eight projects, filters, previews, original IDs and gallery station order remain. Selected entries receive a restrained label in the gallery and an accent border on the overview selector.

Physical displays reserve separate space for a large title, short premise and scope statement; actual screenshots fit proportionally in the middle. They are never cropped or overwritten by captions. Interactive canvases use larger stage/scope labels and shorter subtitles. Gallery notes are brief; full case studies retain detailed explanations and original controls. A late demo download cannot overwrite the current project's status.

## Pacing and verification

The gallery uses 1080svh on desktop and 1160svh on phones, an additional 120svh over the previous respective layouts. Stages change at .22/.44 and the camera holds until .62, giving the final stage more reading room without compressing travel into fewer scroll pixels. Direct camera flights allow 1900–3600ms according to distance and turn. The studio pullback runway increases from 1.65 to 1.9 viewport heights. Native scrolling, reversible paths and motion-off remain.

54 tests pass, including deferred resource lifecycle/failure/disposal, actual production import-graph isolation and runtime sharing, all-project presentation coverage, uncropped captioned evidence, longer stationary gallery framing, exact screen projection and native fallback/rearming. Browser checks are recorded separately after review. Temporary review pages and screenshots belong outside deployment in `../backups/final-release-pass-2026-11-05/qa/`.

Actual browser review confirmed the original opening, selected card order/filtering, Quick View, captioned physical displays and case-study entry/return. The desk reported ready at gallery arrival before the studio was visited. The live studio completed a full training run, and the same model remained visible after the pullback, with native contact content on the right display. The reviewed 390px index had matching document/client widths (390px), with no horizontal overflow. A 1280×844 frame was also inspected. Fresh local desktop console recorded no errors. Screenshots include `gallery-summary.png`, `quick-view.png`, `responsive.png` and `trained-finale.png` in the external QA archive.
