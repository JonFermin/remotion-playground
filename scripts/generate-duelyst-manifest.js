// Parses Godot SpriteFrames (.tres) files from the openduelyst asset pack into a
// JSON manifest that Remotion can consume, and copies the referenced PNG
// spritesheets into public/.
//
// Usage: node scripts/generate-duelyst-manifest.js [--source <path>] [--kind units]
//
// Defaults:
//   --source   ../game-assets/openduelyst/2d/animated-sprites
//   --kind     units  (only units/characters for now)

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
function getArg(name, fallback) {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 ? args[idx + 1] : fallback;
}

const SOURCE = path.resolve(
  __dirname,
  "..",
  getArg("source", "../game-assets/openduelyst/2d/animated-sprites"),
);
const KIND = getArg("kind", "units");
const DST = path.resolve(__dirname, "../public/duelyst-animations");

const framesDir = path.join(SOURCE, "spriteframes", KIND);
const sheetsDir = path.join(SOURCE, "spritesheets", KIND);
if (!fs.existsSync(framesDir)) {
  console.error(`Missing spriteframes dir: ${framesDir}`);
  process.exit(1);
}
if (!fs.existsSync(sheetsDir)) {
  console.error(`Missing spritesheets dir: ${sheetsDir}`);
  process.exit(1);
}

const outSheetsDir = path.join(DST, "spritesheets", KIND);
fs.mkdirSync(outSheetsDir, { recursive: true });

function parseTres(text) {
  // 1. Collect AtlasTexture sub-resources: id -> {x,y,w,h}
  const atlasRegex =
    /\[sub_resource type="AtlasTexture" id="([^"]+)"\][\s\S]*?region = Rect2\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/g;
  const atlases = {};
  let m;
  while ((m = atlasRegex.exec(text)) !== null) {
    atlases[m[1]] = {
      x: Number(m[2]),
      y: Number(m[3]),
      w: Number(m[4]),
      h: Number(m[5]),
    };
  }

  // 2. Find animations = [...] block in the [resource] section.
  const animsMatch = text.match(/animations\s*=\s*\[([\s\S]*?)\]\s*$/m);
  if (!animsMatch) return { atlases, animations: [] };
  const animsBlock = animsMatch[1];

  // 3. Split into per-animation objects (outer `{...}` groups at depth 1).
  const animations = [];
  let depth = 0;
  let objectStart = -1;
  for (let i = 0; i < animsBlock.length; i++) {
    const c = animsBlock[i];
    if (c === "{") {
      if (depth === 0) objectStart = i;
      depth++;
    } else if (c === "}") {
      depth--;
      if (depth === 0 && objectStart >= 0) {
        const body = animsBlock.slice(objectStart + 1, i);
        const nameMatch = body.match(/"name":\s*&?"([^"]+)"/);
        const speedMatch = body.match(/"speed":\s*([\d.]+)/);
        const loopMatch = body.match(/"loop":\s*(true|false)/);
        const frames = [];
        const frameRegex =
          /"texture":\s*SubResource\("([^"]+)"\)/g;
        let fm;
        while ((fm = frameRegex.exec(body)) !== null) frames.push(fm[1]);
        if (nameMatch) {
          animations.push({
            name: nameMatch[1],
            speed: speedMatch ? Number(speedMatch[1]) : 9,
            loop: loopMatch ? loopMatch[1] === "true" : true,
            frameIds: frames,
          });
        }
        objectStart = -1;
      }
    }
  }
  return { atlases, animations };
}

function detectFaction(name) {
  // boss_*, critter_*, neutral_*, f1_*..f6_* (lyonar/songhai/vetruvian/abyssian/magmar/vanar)
  if (name.startsWith("boss_")) return "boss";
  if (name.startsWith("critter_")) return "misc";
  if (name.startsWith("neutral_")) return "neutral";
  if (name.startsWith("f1_")) return "lyonar";
  if (name.startsWith("f2_")) return "songhai";
  if (name.startsWith("f3_")) return "vetruvian";
  if (name.startsWith("f4_")) return "abyssian";
  if (name.startsWith("f5_")) return "magmar";
  if (name.startsWith("f6_")) return "vanar";
  return "other";
}

// Import dimension lookup (tres text points to spritesheet filename).
const { execSync } = require("child_process");

function getPngSize(file) {
  // Parse PNG IHDR manually — first 8 bytes sig, then 4 len + 4 type + width(4) + height(4).
  const fd = fs.openSync(file, "r");
  const buf = Buffer.alloc(24);
  fs.readSync(fd, buf, 0, 24, 0);
  fs.closeSync(fd);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

const tresFiles = fs.readdirSync(framesDir).filter((f) => f.endsWith(".tres"));
tresFiles.sort();

const characters = [];
let copied = 0;
let skipped = 0;
for (const file of tresFiles) {
  const name = path.basename(file, ".tres");
  const tresPath = path.join(framesDir, file);
  const pngSrc = path.join(sheetsDir, `${name}.png`);
  if (!fs.existsSync(pngSrc)) {
    console.warn(`skip ${name}: missing png`);
    skipped++;
    continue;
  }
  const text = fs.readFileSync(tresPath, "utf8");
  const { atlases, animations } = parseTres(text);

  // Resolve frames -> regions, drop atlases we can't find.
  const resolvedAnims = animations
    .map((a) => ({
      name: a.name,
      speed: a.speed,
      loop: a.loop,
      frames: a.frameIds
        .map((id) => atlases[id])
        .filter(Boolean),
    }))
    .filter((a) => a.frames.length > 0);

  if (resolvedAnims.length === 0) {
    console.warn(`skip ${name}: no animations`);
    skipped++;
    continue;
  }

  // Copy spritesheet.
  const pngDst = path.join(outSheetsDir, `${name}.png`);
  fs.copyFileSync(pngSrc, pngDst);
  const { width, height } = getPngSize(pngDst);
  copied++;

  characters.push({
    name,
    faction: detectFaction(name),
    sheet: `spritesheets/${KIND}/${name}.png`,
    sheetWidth: width,
    sheetHeight: height,
    animations: resolvedAnims,
  });
}

const manifestPath = path.join(DST, "manifest.json");
fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(
  manifestPath,
  JSON.stringify(
    {
      source: path.relative(path.resolve(__dirname, ".."), SOURCE),
      kind: KIND,
      generatedAt: new Date().toISOString(),
      characters,
    },
    null,
    2,
  ),
);

// Rough stats.
const totalAnims = characters.reduce((s, c) => s + c.animations.length, 0);
const totalFrames = characters.reduce(
  (s, c) => s + c.animations.reduce((ss, a) => ss + a.frames.length, 0),
  0,
);
const approxSec = totalFrames / 9;
console.log(
  `copied ${copied} spritesheets, skipped ${skipped}\n` +
    `${characters.length} characters, ${totalAnims} animations, ${totalFrames} frames\n` +
    `approx ${approxSec.toFixed(1)}s (${(approxSec / 60).toFixed(1)} min) at 9 fps source`,
);
console.log(`manifest: ${manifestPath}`);
