# Project gallery performance — 4 November 2026

The approved composition, contour background, camera paths, eight projects and real demos are retained. This is a rendering and scheduling repair.

## Causes and changes

- Every project-index change invalidated the entire narrative lettering system. A change to one stage heading could also invalidate all panels. The old composition routine assembled large JavaScript number arrays and flattened them repeatedly. Local profiling recorded lettering passes of approximately 498–752 ms. Dirty state now belongs to each panel; unchanged glyph layouts keep their geometry. Geometry composition preallocates typed buffers and copies attribute slices directly, preserving the same native coordinates, normals and material groups. Gallery glyphs are prepared one at a time in browser idle slices when that API is available; idle work is cancelled during cleanup.
- Static demonstrations ran an animation loop and uploaded their display even when their content had not changed. Static projects now draw only for actual state, stage or content changes. RealityForge, receipt animation and the real replay continue to animate when appropriate. Immediate input bypasses the animation throttle. Reduced motion remains on demand, except for an explicitly controlled running game.
- The current live display now uploads the demo canvas directly, rather than first copying it into a second full-resolution canvas on every frame. Before the shared engine changes projects, the departing display freezes its pixels into its owned canvas. Each previous exhibit therefore retains its last image; a late poster load cannot replace it. Streaming textures avoid repeated mip-chain generation; stationary evidence retains its original mip filtering. Preview resolution is unchanged.
- Completed demo frames identify the project they actually contain. The gallery consumes each revision once and reconciles a completed frame when its state catches up, preventing the first on-demand update from being lost between the demo and scene callbacks.
- Fixed scene shadows are retained between frames. Moving sculpture/atlas geometry, motion preference changes and stationary-mode updates invalidate them. Fully transparent opening lettering does not submit draw calls in later chapters. The existing camera choreography and contour simulation remain intact.

## Evidence and limits

Temporary, opt-in instrumentation measured CPU stages, render submissions and GPU timer queries in the actual browser. It has been removed from deployment and archived with the review fixture outside the checkout at `../backups/gallery-performance-2026-11-04/qa/`.

After the lettering repair, observed ordinary project/stage lettering updates were around 9–16 ms. A cold rapid-selection pass contained a 44 ms update before the later idle glyph preparation was added. Initial font/whole-page assembly still takes a separate one-time pass (roughly 211–263 ms in these local runs); these numbers are not a claim that every frame is below 16 ms. Animated replay texture uploads still have GPU cost. No universal FPS, Lighthouse or physical-device result is claimed.

For a stationary, active WNAMS demo, the scene render timestamp remained exactly `77080` across separate observations, and the demo revision stayed at `2`. The previous implementation kept redrawing static content. Native survey-point input was checked against the displayed point count and stage; the actual replay continued advancing.

Browser checks covered rapid selection across all eight projects, native scrolling, live survey updates, animated replay, 1440×900 and 390×844 framed layouts, phone project selection, and motion-off followed by restoring motion. A browser viewport override produced blank captures, so it was reset and responsive review used real fixed-size iframe viewports. The QA host recorded a MutationObserver error during iframe tooling; clean single-page checks are recorded separately in the deployment log.

The 47-test suite includes extended regressions for static settling, immediate stage changes, animated playback, reduced-motion behavior, completed-frame identity, pre-switch freezing, retained exhibit pixels and texture filtering. Existing typography alignment and gallery camera tests remain in place.

Recovery baseline: `backup/before-gallery-performance-2026-11-04` at `8135c9f915adfe10826cbd8a474895cd6a05aa8f`.
