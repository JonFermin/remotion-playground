// Walks game-assets/ and produces a "review reel" manifest of detected sprite
// animations across creators. Two detectors today:
//
//   T2-pixelfrog   filename pattern "Name (WxH).png" → horizontal-strip animation
//   T1-kenney-xml  TexturePacker XML "Spritesheet/spritesheet_*.xml" → showcase
//
// Output:
//   public/asset-review/manifest.json
//   public/asset-review/sheets/<creator>__<pack>__<file>.png
//
// The manifest schema is a superset of the duelyst manifest so it can drive the
// same Sprite renderer in Remotion. Each character carries `pack` and
// `detector` fields so the review composition can label them for triage.

const fs = require("fs");
const path = require("path");

const ASSETS_ROOT = path.resolve(
  __dirname,
  "../../game-assets",
);
const DST = path.resolve(__dirname, "../public/asset-review");
const SHEETS_DIR = path.join(DST, "sheets");
fs.mkdirSync(SHEETS_DIR, { recursive: true });

if (!fs.existsSync(ASSETS_ROOT)) {
  console.error(`Missing assets root: ${ASSETS_ROOT}`);
  process.exit(1);
}

function getPngSize(file) {
  const fd = fs.openSync(file, "r");
  const buf = Buffer.alloc(24);
  fs.readSync(fd, buf, 0, 24, 0);
  fs.closeSync(fd);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function walk(dir, fn) {
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const full = path.join(cur, e.name);
      if (e.isDirectory()) {
        // Skip macOS metadata noise.
        if (e.name === "__MACOSX" || e.name === "node_modules") continue;
        stack.push(full);
      } else {
        fn(full);
      }
    }
  }
}

function flatName(parts) {
  return parts
    .map((p) => p.replace(/[^a-zA-Z0-9._-]+/g, "-"))
    .join("__");
}

function copySheet(src, flat) {
  const dst = path.join(SHEETS_DIR, flat);
  if (!fs.existsSync(dst)) fs.copyFileSync(src, dst);
  return `sheets/${flat}`;
}

function relUnderRoot(file) {
  return path.relative(ASSETS_ROOT, file).split(path.sep);
}

const characters = [];
const stats = { pixelfrog: 0, kenneyXml: 0, skipped: 0 };

// ---------------------------------------------------------------------------
// T2: Pixelfrog filename pattern
// ---------------------------------------------------------------------------
const PF_REGEX = /^(.+?)\s*\((\d+)x(\d+)\)\.png$/;

walk(path.join(ASSETS_ROOT, "pixelfrog"), (file) => {
  if (!file.endsWith(".png")) return;
  const base = path.basename(file);
  const m = base.match(PF_REGEX);
  if (!m) return;

  const animName = m[1].trim();
  const cellW = Number(m[2]);
  const cellH = Number(m[3]);
  const { width: sheetW, height: sheetH } = getPngSize(file);
  if (sheetW % cellW !== 0 || sheetH % cellH !== 0) {
    stats.skipped++;
    return;
  }
  const cols = sheetW / cellW;
  const rows = sheetH / cellH;
  const frameCount = cols * rows;
  if (frameCount < 1 || frameCount > 60) {
    stats.skipped++;
    return;
  }

  const rel = relUnderRoot(file); // e.g. ["pixelfrog","2d","kings-and-pigs","Sprites","01-King Human","Run (78x58).png"]
  const creator = rel[0];
  const packParts = rel.slice(2, -1); // skip "2d" and the file
  const pack = packParts.join("/") || rel[1];
  const charName = rel[rel.length - 2]; // parent dir name = character

  // Build frames left-to-right, top-to-bottom.
  const frames = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      frames.push({ x: c * cellW, y: r * cellH, w: cellW, h: cellH });
    }
  }

  const flat = flatName([creator, ...packParts, base]).replace(
    /\.png$/,
    "",
  ) + ".png";
  const sheet = copySheet(file, flat);

  // Group: one character per directory, multiple animations per character.
  let entry = characters.find(
    (c) => c.detector === "T2-pixelfrog" && c.pack === pack && c.name === charName,
  );
  if (!entry) {
    entry = {
      name: charName,
      pack: `${creator}/${pack}`,
      faction: creator,
      detector: "T2-pixelfrog",
      sheet: null, // pixelfrog has one sheet per animation; pick the first
      sheetWidth: 0,
      sheetHeight: 0,
      animations: [],
      perAnimSheets: {},
    };
    characters.push(entry);
  }
  entry.animations.push({
    name: animName,
    speed: 12,
    loop: true,
    frames,
  });
  entry.perAnimSheets[animName] = { sheet, sheetWidth: sheetW, sheetHeight: sheetH };
  stats.pixelfrog++;
});

// ---------------------------------------------------------------------------
// T1: Kenney TexturePacker XML
// ---------------------------------------------------------------------------
const KENNEY_ROOT = path.join(ASSETS_ROOT, "kenney");
walk(KENNEY_ROOT, (file) => {
  if (!file.endsWith(".xml")) return;
  if (!/spritesheet[^/\\]*\.xml$/i.test(file)) return;

  const text = fs.readFileSync(file, "utf8");
  const imageMatch = text.match(/<TextureAtlas[^>]*imagePath="([^"]+)"/);
  if (!imageMatch) return;
  const sheetSrc = path.join(path.dirname(file), imageMatch[1]);
  if (!fs.existsSync(sheetSrc)) return;

  const subRegex =
    /<SubTexture\s+name="([^"]+)"\s+x="([-\d.]+)"\s+y="([-\d.]+)"\s+width="([-\d.]+)"\s+height="([-\d.]+)"/g;
  const frames = [];
  let m;
  while ((m = subRegex.exec(text)) !== null) {
    const w = Math.round(Number(m[4]));
    const h = Math.round(Number(m[5]));
    if (w < 8 || h < 8) continue; // skip tiny UI bits
    frames.push({
      name: m[1].replace(/\.png$/, ""),
      x: Math.round(Number(m[2])),
      y: Math.round(Number(m[3])),
      w,
      h,
    });
  }
  if (frames.length === 0) return;

  const { width: sheetW, height: sheetH } = getPngSize(sheetSrc);
  const rel = relUnderRoot(file);
  const creator = rel[0];
  const packParts = rel.slice(2, -1).filter((p) => p !== "Spritesheet");
  const pack = packParts.join("/") || rel[1];
  const sheetBase = path.basename(file, ".xml");

  // Group SubTextures by name root: "playerBlue_walk1" → "playerBlue_walk".
  const groups = new Map();
  for (const f of frames) {
    const root = f.name.replace(/_?\d+$/, "") || f.name;
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(f);
  }

  // Animations: groups with >= 2 frames become real anims;
  // single-frame entries are bundled into one "_showcase" slideshow.
  const animations = [];
  const showcase = [];
  for (const [root, list] of groups) {
    list.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    if (list.length >= 2) {
      animations.push({
        name: root,
        speed: 8,
        loop: true,
        frames: list.map((f) => ({ x: f.x, y: f.y, w: f.w, h: f.h })),
      });
    } else {
      showcase.push(...list);
    }
  }
  if (showcase.length > 0) {
    showcase.sort((a, b) => a.name.localeCompare(b.name));
    animations.push({
      name: "_showcase",
      speed: 4,
      loop: true,
      frames: showcase.map((f) => ({ x: f.x, y: f.y, w: f.w, h: f.h })),
    });
  }
  if (animations.length === 0) return;

  const flat =
    flatName([creator, ...packParts, sheetBase]) + path.extname(imageMatch[1]);
  const sheet = copySheet(sheetSrc, flat);

  characters.push({
    name: sheetBase,
    pack: `${creator}/${pack}`,
    faction: creator,
    detector: "T1-kenney-xml",
    sheet,
    sheetWidth: sheetW,
    sheetHeight: sheetH,
    animations,
  });
  stats.kenneyXml++;
});

// ---------------------------------------------------------------------------
// Normalise pixelfrog entries (one sheet per animation → keep per-anim refs).
// ---------------------------------------------------------------------------
for (const c of characters) {
  if (c.detector !== "T2-pixelfrog") continue;
  // First animation provides the default sheet (used when rendering).
  // Each animation also carries its own sheet to handle differing dims.
  c.animations = c.animations.map((a) => {
    const ref = c.perAnimSheets[a.name];
    return { ...a, sheet: ref.sheet, sheetWidth: ref.sheetWidth, sheetHeight: ref.sheetHeight };
  });
  const first = c.perAnimSheets[c.animations[0].name];
  c.sheet = first.sheet;
  c.sheetWidth = first.sheetWidth;
  c.sheetHeight = first.sheetHeight;
  delete c.perAnimSheets;
}

// Ensure every animation carries its own sheet ref (inherit from char if absent).
for (const c of characters) {
  for (const a of c.animations) {
    if (!a.sheet) {
      a.sheet = c.sheet;
      a.sheetWidth = c.sheetWidth;
      a.sheetHeight = c.sheetHeight;
    }
  }
}

// Sort: detector → pack → name.
characters.sort((a, b) => {
  return (
    a.detector.localeCompare(b.detector) ||
    a.pack.localeCompare(b.pack) ||
    a.name.localeCompare(b.name)
  );
});

const totalAnims = characters.reduce((s, c) => s + c.animations.length, 0);
const totalFrames = characters.reduce(
  (s, c) => s + c.animations.reduce((ss, a) => ss + a.frames.length, 0),
  0,
);

const manifest = {
  generatedAt: new Date().toISOString(),
  source: path.relative(path.resolve(__dirname, ".."), ASSETS_ROOT),
  detectors: ["T1-kenney-xml", "T2-pixelfrog"],
  stats: { ...stats, totalCharacters: characters.length, totalAnims, totalFrames },
  characters,
};

fs.writeFileSync(
  path.join(DST, "manifest.json"),
  JSON.stringify(manifest, null, 2),
);

console.log(
  `pixelfrog anims:    ${stats.pixelfrog}\n` +
    `kenney xml sheets:  ${stats.kenneyXml}\n` +
    `skipped:            ${stats.skipped}\n` +
    `total characters:   ${characters.length}\n` +
    `total animations:   ${totalAnims}\n` +
    `total frames:       ${totalFrames}\n` +
    `manifest:           ${path.join(DST, "manifest.json")}`,
);
