import type {
  ReviewCharacter,
  ReviewManifest,
  ReviewSchedule,
} from "./types";

export function filterCharacters(
  manifest: ReviewManifest,
  detectorFilter: string,
  packFilter: string,
): ReviewCharacter[] {
  const detectors =
    !detectorFilter || detectorFilter === "all"
      ? null
      : detectorFilter.split(",").map((s) => s.trim()).filter(Boolean);
  const packNeedle =
    !packFilter || packFilter === "all" ? null : packFilter.toLowerCase();

  return manifest.characters
    .filter((c) => {
      if (detectors && !detectors.includes(c.detector)) return false;
      if (packNeedle && !c.pack.toLowerCase().includes(packNeedle))
        return false;
      return true;
    })
    .map((c) => {
      let maxW = 0;
      let maxH = 0;
      for (const a of c.animations) {
        for (const f of a.frames) {
          if (f.w > maxW) maxW = f.w;
          if (f.h > maxH) maxH = f.h;
        }
      }
      return {
        ...c,
        maxFrameW: maxW || 1,
        maxFrameH: maxH || 1,
      };
    });
}

export function buildSchedule(
  chars: ReviewCharacter[],
  framesPerSprite: number,
): ReviewSchedule {
  const clips: ReviewSchedule["clips"] = [];
  let cursor = 0;
  for (let ci = 0; ci < chars.length; ci++) {
    const c = chars[ci];
    for (let ai = 0; ai < c.animations.length; ai++) {
      const a = c.animations[ai];
      const duration = a.frames.length * framesPerSprite;
      clips.push({
        characterIndex: ci,
        animationIndex: ai,
        startFrame: cursor,
        durationFrames: duration,
      });
      cursor += duration;
    }
  }
  return { clips, totalFrames: Math.max(cursor, 1) };
}
