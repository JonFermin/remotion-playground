# remotion-playground

Multi-project Remotion workspace. Each video project is a self-contained folder under `src/projects/<name>/` with its own scenes, theme, and Composition registration, sharing one React/Remotion install.

## Layout

```
src/
├─ Root.tsx                          mounts every project's <Folder>
├─ index.css · index.ts
└─ projects/
   └─ typelands-promo/
      ├─ register.tsx                <Folder> + <Composition> entries
      ├─ Promo.tsx                   master composition
      ├─ scenes/…                    scene components
      ├─ theme.ts · fonts.ts         project constants + local font loading
      └─ PaperBackground.tsx

public/
└─ typelands-promo/…                 static assets resolved via staticFile()

scripts/
├─ copy-typelands-assets.js          pulls assets from a sibling typelands-v1 checkout
├─ video-dims.js                     reads MOV/MP4 tkhd atom for dimensions
└─ sprite-centroid.js                measures per-cell centroid of a sprite sheet
```

## Setup

```bash
npm install
npm run assets:typelands-promo       # hydrates heavy binaries from ../typelands-v1
npm run dev                          # http://localhost:3000
```

Large binaries (`*.mov`, `*.mp4`, `*.mp3`, `*.ttf`) under `public/` are `.gitignored`
— they're staged from adjacent repos via scripts so the Git history stays small.
Run the `assets:*` script for each project after cloning.

## Rendering

```bash
npx remotion render TypelandsPromo-Portrait  out/typelands-portrait.mp4
npx remotion render TypelandsPromo-Landscape out/typelands-landscape.mp4
```

## Adding a new project

1. `mkdir src/projects/my-project`
2. Author scenes + a `register.tsx` that exports `<Folder name="my-project">…</Folder>`
3. Import and mount it from `src/Root.tsx`
4. If it has heavy assets, add a `scripts/copy-<project>-assets.js` and matching `.gitignore` entries + `npm run assets:<project>` script

## Projects

| Project | Compositions | Source |
|---|---|---|
| **typelands-promo** | `TypelandsPromo-Portrait` (1080×1920), `TypelandsPromo-Landscape` (1920×1080) | `../typelands-v1` |

## Remotion docs

[Fundamentals](https://www.remotion.dev/docs/the-fundamentals) · [License terms](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) (some commercial use requires a company license).
