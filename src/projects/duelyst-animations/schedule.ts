import type {
  DuelystCharacter,
  DuelystManifest,
  DuelystSchedule,
} from "./types";

const FACTION_ORDER = [
  "lyonar",
  "songhai",
  "vetruvian",
  "abyssian",
  "magmar",
  "vanar",
  "neutral",
  "boss",
  "misc",
  "other",
];

const ANIMATION_ORDER = [
  "idle",
  "breathing",
  "run",
  "attack",
  "caststart",
  "castloop",
  "castend",
  "cast",
  "hit",
  "death",
];

export function filterAndSortCharacters(
  manifest: DuelystManifest,
  factionFilter: string,
): DuelystCharacter[] {
  const wanted =
    factionFilter && factionFilter !== "all"
      ? factionFilter.split(",").map((s) => s.trim()).filter(Boolean)
      : null;

  const chars = manifest.characters
    .filter((c) => !wanted || wanted.includes(c.faction))
    .map((c) => ({
      ...c,
      animations: [...c.animations].sort((a, b) => {
        const ia = ANIMATION_ORDER.indexOf(a.name);
        const ib = ANIMATION_ORDER.indexOf(b.name);
        return (
          (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) ||
          a.name.localeCompare(b.name)
        );
      }),
    }));

  chars.sort((a, b) => {
    const ia = FACTION_ORDER.indexOf(a.faction);
    const ib = FACTION_ORDER.indexOf(b.faction);
    return (
      (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) ||
      a.name.localeCompare(b.name)
    );
  });

  return chars;
}

export function buildSchedule(
  chars: DuelystCharacter[],
  framesPerSprite: number,
): DuelystSchedule {
  const clips: DuelystSchedule["clips"] = [];
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
