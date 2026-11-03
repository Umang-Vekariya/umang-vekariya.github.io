# Identity and camera pacing — 3 November 2026

Recovery point: `backup/before-identity-pacing-2026-11-03` preserves `3ee70fcdcc81673d3b56326e9c85eb6d5731b110`.

The name uses an expressive italic serif, a drawn lime stroke and a precisely spaced surname. The opening uses a slower masked reveal, and the identity stays readable further into the first scroll. Native HTML and vector elements retain sharp text and accessible full-name labeling. Phone composition places the name and role above the sculpture.

The largest motion burst was the original gallery entry: a roughly fifty-unit camera move and a reversed view were compressed into the first 18% of one exhibit. The first exhibit now sits across the courtyard facing the approaching camera. The arrival chapter includes the overview, a pause and a longer forward-facing approach; the first exhibit starts at its composed viewing position. Gallery transit occupies 42% of each exhibit instead of 28%, giving each turn more scroll distance. The opening also uses a single easing curve over a longer scroll span.

Direct journeys take 1.7–3.2 seconds according to distance and angular change. Long direct entries lift over the front display rather than intersecting it. Display focus takes 1.15 seconds. The click-through opening scroll is paced separately and cancels immediately on wheel, touch, pointer or navigation keys. Ordinary wheel scrolling stays native. Reduced motion bypasses the timed journeys and title animation.

All eight exhibits remain present; their independent display textures, real demonstrations, case studies and applications are retained. Tests cover continuous arrival/first-exhibit endpoints, the absence of a compressed first-exhibit movement, monotonic journey timing, front-display clearance and the earlier camera, geometry, display and model regressions. All 22 pass.

Browser review inspected 2560×1440, 1440×844, 1280×720, 390×844 and 320×640 compositions, the click-through opening, wheel interruption, gallery arrival, mobile case entry/return and reduced motion. The name and role do not overlap in the checked desktop layouts; the 320px document has no horizontal overflow. Wheel interruption retained the same scroll position after other checks. No main-tab application console errors were observed. No frame-rate or hardware benchmark is claimed.
