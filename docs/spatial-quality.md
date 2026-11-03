# Persistent world and surface-quality pass — 3 November 2026

Recovery: `backup/before-spatial-quality-pass-2026-11-03` preserves `b65b719db3e838fb02d629490ee20317ec1ee0ca` before these changes.

The observed popping came from chapter-based visibility on the overview sculpture and index-based visibility on project roots. Both switches are removed. All eight exhibits and the overview sculpture stay in the scene; camera framing, geometry and continuous distance fog determine their appearance. The world also keeps its last frame behind opaque reading/tool sections rather than fading its canvas at chapter boundaries.

Each exhibit now owns a canvas texture. Frames are copied from the active working demo into that exhibit, then retained when moving elsewhere. A late evidence-image load cannot replace a live frame. Previously a shared texture was reused and the outgoing display was switched back to its poster, making the content visibly reset. Revisited live displays redraw the selected stage from preserved model state.

The visual pass replaces polygonal platforms with smooth turned profiles, rounds screen housings and object edges, adds structural supports and contact shadows, and replaces floating overview slabs with a grounded array of machined apertures. The gallery sits further behind the introduction, improving the opening composition without hiding objects. The larger opening sculpture sits close to its pedestal; its cross-section has more samples, smoother curvature and stitched seam normals in both morph states. Broad reflection cards replace the former room environment. Rich cobalt, midnight surfaces and lime inlays remain.

Live demonstrations render at a higher internal resolution, and annotation blue is lighter for readability. Independent exhibit textures use viewport-appropriate sizes; phones retain antialiasing. The original real projects, demo calculations, case studies, application embeds, Neural Studio, résumé and native access controls remain.

Validation includes the existing tests plus regressions for valid surface normals, bezel occlusion, morph seam normals, and independent display-frame retention with a late poster load. Camera framing tests now include the complete beveled housing at seven viewport sizes. Nineteen tests pass.

Actual browser review covers desktop and phone compositions, traversal through all eight gallery positions, returning to a modified WNAMS demonstration without losing its fifth sample, and project entry/return. During traversal the scene reports all eight roots visible and the overview sculpture present at every checked position. Temporary review pages are excluded from publication. No device-performance score or physical-device certification is claimed.
