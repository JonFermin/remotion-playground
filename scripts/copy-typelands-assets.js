// Pulls Typelands promo assets from the sibling `typelands-v1` repo into
// `public/typelands-promo/`. Run after cloning or whenever source assets update.
//
// Usage: node scripts/copy-typelands-assets.js [--source <path-to-typelands-v1>]
//
// The heavy binaries (videos, audio, fonts) are .gitignored so this script is the
// reproducible way to get them locally. Images and overlays ARE committed.
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const sourceArgIdx = args.indexOf("--source");
const DEFAULT_SRC = path.resolve(__dirname, "../../typelands-v1");
const SRC = sourceArgIdx >= 0 ? path.resolve(args[sourceArgIdx + 1]) : DEFAULT_SRC;
const DST = path.resolve(__dirname, "../public/typelands-promo");

const COPIES = [
  ["assets/fonts/Inter/Inter-VariableFont.ttf", "fonts/Inter.ttf"],
  ["assets/fonts/Source_Serif_4/SourceSerif4-VariableFont.ttf", "fonts/SourceSerif4.ttf"],
  ["assets/images/final_icon.png", "images/icon.png"],
  ["assets/images/final_icon_splash.png", "images/splash.png"],
  ["assets/spritesheets/dwarf_gives_gem_spritesheet_transparent.png", "spritesheets/dwarf-gives-gem.png"],
  ["assets/overlay/light-paper-fibers.png", "overlay/paper.png"],
  ["assets/store/ios/typelands-promo.mov", "videos/promo.mov"],
  ["assets/store/ios/gem_highlight.mp4", "videos/gem.mp4"],
  ["assets/sounds/ambient.mp3", "sounds/ambient.mp3"],
  ["assets/sounds/score_tick.mp3", "sounds/tick.mp3"],
];

if (!fs.existsSync(SRC)) {
  console.error(`Source repo not found: ${SRC}`);
  console.error("Pass --source <path> to point at your typelands-v1 clone.");
  process.exit(1);
}

let copied = 0;
let skipped = 0;
for (const [rel, dest] of COPIES) {
  const from = path.join(SRC, rel);
  const to = path.join(DST, dest);
  if (!fs.existsSync(from)) {
    console.warn(`  missing source: ${rel}`);
    skipped++;
    continue;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  copied++;
}
console.log(`copied ${copied} files, skipped ${skipped} (source ${SRC})`);
