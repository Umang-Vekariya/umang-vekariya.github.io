# Kinetic opening identity — 4 November 2026

The former italic first name and small tracked surname are replaced with a substantial two-line uppercase lockup. Manrope letterforms remain native HTML, with one accessible heading name and decorative layers hidden from assistive technology. The surname has a softer cobalt tint and nearly matches the first line's width. Name, replay and description share a normal flow stack so responsive font changes cannot overlap them.

The entrance assembles each letter through a masked perspective fold. Two delayed cobalt copies follow the face and collapse into it, while a single light sweep crosses the lockup. The sequence lasts roughly two seconds and never blocks navigation or scroll. A keyboard-accessible replay is optional. A fine pointer lifts and tilts the nearby letters with damped movement and reveals their cobalt edge. Its animation frame loop stops once the pointer settles, when the title goes offscreen, and on page teardown.

The controller owns its Web Animations instances and cleans up listeners, observers and scheduled frames. Motion-off and reduced-motion changes cancel the entrance and pointer work immediately; the unanimated name is also the no-JavaScript fallback. The existing scroll controller still owns the name's departure alongside the camera journey. The type layer becomes inert after its scroll fade so its replay cannot receive invisible focus.

Browser review covered actual 1440×900, 390×844 and 320×640 frames, refined spacing, keyboard replay, native pointer movement and phone motion-off. A mocked controller regression covers cancellation, a stationary pointer returning to idle, offscreen suspension, reduced motion and cleanup. All 27 repository tests pass. Recovery branch `backup/before-kinetic-name-2026-11-04` retains the prior published design at `0d505d10a8ac9c539f5fdc001a9be75024ddc01d`.

The 3D gallery, project atlas, eight project engines and Neural Studio finale remain unchanged. No performance score or physical-device benchmark is claimed.
