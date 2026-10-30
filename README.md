# Umang Vekariya — The Workshop

Portfolio: https://umang-vekariya.github.io/

The introduction, personal foyer, floor plan, and eight project installations share one 3D workshop. The foyer introduces Umang, his education and tools, and his experience before the project hall opens. Scroll to move through the tour, use the floor plan or project selector to jump to a station, and launch the working browser demonstrations from the station controls. Quick view, case studies, résumé, and contact remain directly accessible.

## Development

```sh
npm ci
npm run dev
```

Open http://localhost:4176/. Source files and the ready-to-publish output are in `dist/`. After editing scene modules, run:

```sh
npm run build
npm run check
npm test
```

`profile-layout.js` and `profile-foyer.js` define the personal stops and their physical installations; `profile.css` keeps the matching overview readable and available in Quick view. `workshop-layout.js` holds the shared station addresses and camera framing. `workshop-architecture.js` builds the room. `world.js` directs the shared renderer and camera. `project-worlds.js` places the existing demonstrations at their stations. `workshop-nav.js` connects the accessible floor plan to the tour.

## Deployment

The GitHub Pages workflow publishes `dist/` when `main` changes. The built scene bundle is committed; hosting requires no server or build environment. Only the static output is uploaded to Pages.

The original private Sites checkout and the pre-workshop snapshot remain separate backups on the owner's computer.

Small personal-installation labels use `spatial-type.js` to position native browser text from 3D anchors. This keeps glyph proportions and clarity independent of the WebGL resolution. Education stays on the right; the experience installation sits on the left with its supporting copy opposite it. The desktop overview reading layer is fixed while its scene is active.
