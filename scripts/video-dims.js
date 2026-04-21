const fs = require("fs");

function readAtom(b, i) {
  if (i + 8 > b.length) return null;
  const size = b.readUInt32BE(i);
  const type = b.slice(i + 4, i + 8).toString("latin1");
  return { size, type, headerSize: 8 };
}

function findTkhd(b, start, end) {
  let i = start;
  while (i < end - 8) {
    const a = readAtom(b, i);
    if (!a || a.size < 8) return null;
    if (a.type === "tkhd") {
      const payload = i + 8;
      const version = b[payload];
      const widthOff = payload + (version === 1 ? 4 + 16 + 4 + 4 + 8 + 8 + 2 + 2 + 2 + 2 + 36 : 4 + 8 + 4 + 4 + 4 + 8 + 2 + 2 + 2 + 2 + 36);
      if (widthOff + 8 > b.length) return null;
      const w = b.readUInt16BE(widthOff);
      const h = b.readUInt16BE(widthOff + 4);
      if (w > 0 && h > 0) return { w, h };
    }
    if (["moov", "trak", "mdia"].includes(a.type)) {
      const inner = findTkhd(b, i + 8, i + a.size);
      if (inner) return inner;
    }
    i += a.size;
  }
  return null;
}

for (const file of process.argv.slice(2)) {
  const b = fs.readFileSync(file);
  const dims = findTkhd(b, 0, b.length);
  console.log(file, dims ? `${dims.w}x${dims.h}` : "unknown");
}
