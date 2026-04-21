// Quick analysis: find the alpha-weighted centroid of each cell in a sprite sheet.
// Tells us if the character drifts horizontally between frames (drawn that way)
// or is well-centered.
const fs = require("fs");
const zlib = require("zlib");

function parsePNG(path) {
  const buf = fs.readFileSync(path);
  if (buf[0] !== 0x89 || buf[1] !== 0x50) throw new Error("not png");
  let i = 8;
  const chunks = [];
  let width, height, bitDepth, colorType;
  const idatChunks = [];
  while (i < buf.length) {
    const len = buf.readUInt32BE(i);
    const type = buf.slice(i + 4, i + 8).toString("ascii");
    const data = buf.slice(i + 8, i + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idatChunks.push(data);
    }
    chunks.push({ type, data });
    i += 12 + len;
    if (type === "IEND") break;
  }
  if (colorType !== 6 || bitDepth !== 8) {
    throw new Error(`unsupported: colorType=${colorType}, bitDepth=${bitDepth}`);
  }
  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  const bpp = 4;
  const stride = width * bpp;
  const out = Buffer.alloc(width * height * bpp);
  let src = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[src++];
    for (let x = 0; x < stride; x++) {
      const cur = raw[src++];
      let left = x >= bpp ? out[y * stride + x - bpp] : 0;
      let up = y > 0 ? out[(y - 1) * stride + x] : 0;
      let upLeft = x >= bpp && y > 0 ? out[(y - 1) * stride + x - bpp] : 0;
      let v;
      if (filter === 0) v = cur;
      else if (filter === 1) v = (cur + left) & 0xff;
      else if (filter === 2) v = (cur + up) & 0xff;
      else if (filter === 3) v = (cur + ((left + up) >> 1)) & 0xff;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        const pred = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
        v = (cur + pred) & 0xff;
      } else throw new Error(`filter ${filter}`);
      out[y * stride + x] = v;
    }
  }
  return { width, height, pixels: out };
}

function centroidOfCell(img, x0, y0, w, h) {
  let sumX = 0;
  let sumY = 0;
  let sumA = 0;
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = ((y0 + y) * img.width + (x0 + x)) * 4;
      const a = img.pixels[idx + 3];
      if (a > 30) {
        sumX += x * a;
        sumY += y * a;
        sumA += a;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (sumA === 0) return null;
  return {
    cx: sumX / sumA,
    cy: sumY / sumA,
    bbox: { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY },
  };
}

const path = process.argv[2];
const img = parsePNG(path);
const COLS = 6, ROWS = 6;
const cellW = Math.floor(img.width / COLS);
const cellH = Math.floor(img.height / ROWS);
console.log(`sheet: ${img.width}x${img.height}, cell ${cellW}x${cellH}`);
console.log("frame  col,row   cx     cy     bbox(x,y,w,h)");
for (let f = 0; f < COLS * ROWS; f++) {
  const col = f % COLS;
  const row = Math.floor(f / COLS);
  const c = centroidOfCell(img, col * cellW, row * cellH, cellW, cellH);
  if (!c) { console.log(`${f.toString().padStart(2)}     ${col},${row}     (empty)`); continue; }
  console.log(
    `${f.toString().padStart(2)}     ${col},${row}     ${c.cx.toFixed(1).padStart(5)}  ${c.cy.toFixed(1).padStart(5)}  (${c.bbox.minX},${c.bbox.minY},${c.bbox.w},${c.bbox.h})`,
  );
}
