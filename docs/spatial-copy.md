# Lettering within the world

The opening identity and “From a question. / To a possibility.” now have fixed planes beside their respective installations. The camera approaches and passes these positions; they do not remain centered over the scene or track the viewport. The duplicate atlas introduction is hidden while this presentation is active.

`spatial-copy.js` composes four coplanar world corners at a reference camera shot, once on initialization and on resize. The main renderer projects those corners using its actual camera. The existing projective transform helper maps the original SVG/HTML into the resulting quadrilateral. This keeps the custom wordmark, native text, accessible heading, pointer interaction and replay button sharp. It is planar lettering, not extruded text or a bitmap texture. There is no additional renderer or animation loop.

Desktop lettering occupies the left side, leaving the sculpture and project hand to the right. Narrow screens use an upper composition with larger source body text and a touch-sized replay control. Name assembly and hover retain their existing controller. The transition copy appears after the foreground sculpture clears the view, then fades as the card banks separate. The camera path and all eight project hover targets remain intact.

The controller moves the existing nodes rather than cloning IDs. It restores them and their original styles on context loss or disposal. Skipped chapters hide the lettering even when WebGL rendering stops. Graphics-off uses the original native layout; the motion toggle retains stationary readable text.

Validation for this change: 35 regression tests, including coplanarity, finite projection, responsive bounds, fixed anchors, perspective travel and the clear center path. Actual browser checks covered the opening, approach, atlas and separated banks at 1440×900; opening and atlas at 390×844 and 320×640; and the normal 2560×1440 view. Name replay, atlas hover before/after separation, direct Neural Studio navigation and real worker training were exercised. No frame-rate or physical-device performance claim is made.
