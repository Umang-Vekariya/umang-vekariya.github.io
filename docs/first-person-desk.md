# First-person dual-monitor finale — 5 November 2026

The end of Neural Studio now reveals a seated first-person workstation. The camera stays at the desk: no exterior view, third-person character or distant room orbit. Sleeved forearms enter the foreground, the right hand rests on the mouse, and the left hand rests on the mechanical keyboard.

## Composition

Two matching, slightly inward-facing 16:10 monitors occupy the main view. The original Neural Studio is fitted proportionally inside the left display. The right display gradually reveals the original contact document: “Let’s build what’s next,” email, copy button, GitHub, LinkedIn and résumé. Its DOM nodes and event handlers are moved and restored, not cloned or rasterized.

The procedural scene includes bevelled individual keycaps and legends, a sculpted wireless mouse, continuous left/right hand surfaces and fitted cloth sleeves, desk mat and edge lighting, monitor stands, speakers, a PC tower with three cobalt fan rings, acoustic panels and dark room surfaces. Cobalt lighting and small lime details retain the existing identity. Opaque geometry is batched by material and keycaps are instanced. The geometry regression limits mesh submissions and vertex count; the browser adds a transparent keyboard legend plane. This is an inventory, not a measured frame-rate result. There is no added animation loop or continuously spinning hardware.

## Camera and native screens

The first camera pose is derived from the actual native console rectangle in the left monitor’s rotated plane. Its four corners exactly match the original HTML at the handoff. Scroll drives one deterministic reversible pullback to eye position `[0.2, 12.8, 104.2]`, approximately 14 world units ahead of the monitors, instead of the old distant endpoint at Z=125/129. Both screen projections use the same scene camera and four-corner homography.

The right contact document stays native, with a 960×600 source layout mapped onto its physical screen. Its content appears in the later half of the pullback. On phone layouts, the seated view turns from the left display toward the right; larger email/link type and a simpler vertical arrangement keep the contact screen readable. The person remains behind the camera in both compositions.

Native training, drawing, prediction, inspection and challenge behavior are unchanged. The live console is not replaced, and its model/worker state survives the reveal. Returning restores interactivity. Motion-off, reduced motion and graphics-off restore the normal tool and contact layout. Contact restoration moves the current child wrappers as a unit, including wrappers created after a direct visit to the end of the page. Contact relief meshes pause while the native text is projected onto the physical right monitor, avoiding a duplicate or misaligned extrusion.

Scene geometry/materials use the existing world cleanup; the keyboard legend texture is explicitly disposed. The desk and both displays exist before the first render, rather than appearing or disappearing while scrolling.

## Verification

- Camera regression covers exact native rectangle matching, finite continuous reversible poses at desktop/tablet/phone sizes, seated endpoint and large contact-screen framing.
- Geometry regression covers two physical displays, finite vertices/normals, physical keycaps, bounded mesh submissions, monitor/contact alignment and hand–mouse contact.
- Native handoff regression covers focus, intentional scroll, motion-off, node identity and restoration of wrappers created while the screen was pinned.
- Browser review used a normal desktop view plus 1440×900 and 390×844 frames, initial and reverse pullback positions, real training through completion, restored Inspect controls, readable phone contact content without overflow, and motion-off restoration. Temporary review controls and screenshots are archived outside deployment at `../backups/first-person-desk-2026-11-05/qa/`.

No FPS, Core Web Vitals, photorealism or physical-device certification is claimed. Existing project-gallery performance fixes remain intact.

Recovery branch: `backup/before-first-person-desk-2026-11-04` at `55cda9ea9ec55fbea03b327095c19b4994144822`.

## Hand anatomy and identity repair

Recovery baseline: `backup/before-hand-anatomy-2026-11-05` at `a75a5921efef34cc34a65b6707e0e845275cb2a8`. The left thumb faces the spacebar and the right thumb curls around the mouse. Original hand volumes are sculpted offline and exported as indexed quantized meshes, with curved nails, subtle skin texture and continuous sleeves. No runtime sculpting or extra animation loop is introduced. The generated assets increase the spatial bundle size; no speed improvement is claimed. The mouse cable is removed while monitor and keyboard wiring remain.

Regression checks validate opposite thumb placement against the actual mesh, five distinct nails, unit normals and closed manifold skin surfaces. The shared UV SVG removes the fine cut at its join and the header uses the same external artwork as the footer, with explicit non-shrinking image dimensions. The favicon carries the same silhouette.

This repair passed all 49 automated tests and the site syntax/reference check. Browser review confirmed opposite hands, sleeve joins, wireless mouse and readable shared UV mark on a desktop view and a 390×844 embedded phone frame. Screenshots and the temporary review page are archived outside `dist` at `../backups/hand-anatomy-2026-11-05/qa/`. The desktop console contained no errors.
