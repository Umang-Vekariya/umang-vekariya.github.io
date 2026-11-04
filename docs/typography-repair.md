# Narrative typography repair — 4 November 2026

## Faults addressed

The old controller fit generic Helvetiker runs into native Manrope and serif measurements. That changed letter proportions, erased the typography pairing and made spacing inconsistent. It also measured one camera pose and rendered another during easing. Controls could move under the pointer, and the four-corner atlas caption was approximated by a different rectangle.

## Current implementation

Native headings stay visible, selectable and accessible. Manrope 500/600 and Instrument Serif regular/italic supply matching shallow bevelled outline relief behind each native face. Browser character positions, whitespace, wrapping and font baselines supply geometry placement; words are never scaled to fit another font. Unsupported or unavailable outline data leaves the native face readable. The original custom solid hero is retained.

`narrative-lettering.js` caches matching glyph geometry and merges each panel into at most three material groups. `world-lettering.js` rebuilds composed geometry only for layout, font or actual content changes. The outline JSON is fetched lazily rather than inflating the main hero bundle. Existing scene scheduling and disposal remain in use.

Reading surfaces are reconstructed from a stable screen quadrilateral using the **actual** camera position, orientation and lens each frame. Supporting prose has a restrained constant keystone; interactive panels retain their exact native rectangle. These reading surfaces follow document flow; they are not fixed architectural signs. The hero and atlas caption retain their fixed world anchors. The caption geometry and native face now share all four source corners.

Smaller heading tracking is looser. The Neural Studio backdrop darkens bright world evidence while the tool is in use, then releases with the existing reversible finale. The native font face is the primary readable surface; physical depth is deliberately secondary.

## Font provenance and regeneration

Manrope and Instrument Serif are supplied under the SIL Open Font License. Source: [Google Fonts Manrope](https://github.com/google/fonts/tree/main/ofl/manrope) and [Google Fonts Instrument Serif](https://github.com/google/fonts/tree/main/ofl/instrumentserif). Both licenses are retained in `dist/assets/fonts/`.

The shipped WOFF subsets and normalized Three.js outlines are generated from the same official TTF sources. To regenerate, place the source fonts in a local directory as `portfolio-manrope.ttf`, `portfolio-instrument-italic.ttf`, `portfolio-instrument-regular.ttf`, then run `python3 scripts/build-narrative-fonts.py /path/to/source-fonts` with FontTools available. This script is an asset preparation utility, not a runtime or deployment requirement. No new JavaScript package is required.

## Verification

Four new regression cases cover matching font keys and counters, finite geometry with all relief behind the readable face, exact native whitespace and baselines, stable reading/control positions across camera and FOV changes, and exact caption quadrilaterals. Together with the existing suite, 44 tests pass.

Browser review used a 1440×900 desktop and 390×844 / 320×640 responsive frames. Opening, atlas, About, education/experience, live gallery headings, Neural Studio and contact were inspected. Skill-category selection, desktop/mobile project selection and the real training start control were exercised. A bright-screen contrast defect observed at the studio was corrected in a second visual pass. Screenshots and the temporary review fixture are archived outside `dist/`. No FPS score or physical-device certification is claimed.

Recoverable pre-repair baseline: `backup/before-typography-repair-2026-11-04` at `114969901c801b4895de9bed58042e7fd5207f45`.
