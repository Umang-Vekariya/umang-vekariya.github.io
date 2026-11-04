# Sculptural ribbon field

The previous cursor-following light footprint has been removed. The background now contains eighteen solid, twisted cobalt bands with a few narrow lime inlays. The geometry stays visible at rest. Cursor proximity displaces actual ribbon vertices laterally and into depth; leaving, pausing or entering a real tool releases the field back into its original form.

The backdrop is camera-local, scaled with the lens and aspect ratio. It is not claimed to be a fixed architectural wall. Its depth keeps it behind the featured installations and in front of remote display backs that would otherwise break its continuous sweep. Existing exhibits remain in place. Normal recomputation provides real changes in material response as the bands bend.

`ribbon-field.js` uses one merged indexed geometry and the existing scene renderer. No extra canvas, library, pointer overlay or independent animation loop is used. Positions and normals update only while the deformation changes; render scheduling stops after settling. Event listeners, timers, geometry, materials and lights are cleaned up. The previous glow module and CSS are deleted.

Native cursor, links, card picking and control hit targets remain intact. Fine pointers bend the field; touch and reduced-motion visitors retain the stationary form. Motion-off restores the resting geometry immediately. Real Neural Studio tools and dialogs keep their original interaction feedback.

Tests cover finite, indexed geometry with real width and thickness; local XYZ deformation, bounded displacement, an unchanged far field and exact return to rest. The existing project, typography, camera and neural tests remain. Browser review covers desktop and phone framing, rest versus pointer response, return to rest, reading and project controls. No FPS or Core Web Vitals score is claimed.

Pre-change baseline: `backup/before-ribbon-field-2026-11-04` at `1bf23531ae25c913329343d801ed917c3c26a5d5`.
