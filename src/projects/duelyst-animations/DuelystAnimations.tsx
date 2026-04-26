import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {
  DuelystCharacter,
  DuelystClip,
  DuelystProps,
  DuelystRegion,
} from "./types";

const BG = "#0b0d12";
const INSET = 0.08;
const LABEL_BG = "rgba(0,0,0,0.55)";

function Sprite({
  character,
  region,
  maxWidth,
  maxHeight,
}: {
  character: DuelystCharacter;
  region: DuelystRegion;
  maxWidth: number;
  maxHeight: number;
}) {
  const scale = Math.min(maxWidth / region.w, maxHeight / region.h);
  const displayW = region.w * scale;
  const displayH = region.h * scale;

  return (
    <div
      style={{
        width: displayW,
        height: displayH,
        overflow: "hidden",
        position: "relative",
        imageRendering: "pixelated",
      }}
    >
      <Img
        src={staticFile(`duelyst-animations/${character.sheet}`)}
        style={{
          width: character.sheetWidth * scale,
          height: character.sheetHeight * scale,
          maxWidth: "none",
          maxHeight: "none",
          position: "absolute",
          top: -region.y * scale,
          left: -region.x * scale,
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}

function findClipIndex(clips: DuelystClip[], frame: number): number {
  let lo = 0;
  let hi = clips.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (clips[mid].startFrame <= frame) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export const DuelystAnimations: React.FC<DuelystProps> = ({
  characters,
  schedule,
  framesPerSprite,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  if (!schedule.clips.length || !characters.length) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: BG,
          color: "white",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui",
          fontSize: 48,
        }}
      >
        No characters matched filter.
      </AbsoluteFill>
    );
  }

  const clamped = Math.min(frame, schedule.totalFrames - 1);
  const clipIndex = findClipIndex(schedule.clips, clamped);
  const clip = schedule.clips[clipIndex];
  const character = characters[clip.characterIndex];
  const animation = character.animations[clip.animationIndex];
  const localFrame = clamped - clip.startFrame;
  const spriteIndex = Math.min(
    animation.frames.length - 1,
    Math.floor(localFrame / framesPerSprite),
  );
  const region = animation.frames[spriteIndex];

  const short = Math.min(width, height);
  const pad = short * INSET;
  const labelArea = short * 0.22;
  const maxW = width - pad * 2;
  const maxH = height - pad * 2 - labelArea;

  // Warm up the next character's spritesheet ~20 frames before its first clip
  // to avoid a blank frame at transitions.
  const nextClipIndex = Math.min(clipIndex + 1, schedule.clips.length - 1);
  const nextClip = schedule.clips[nextClipIndex];
  const nextChar =
    nextClip && nextClip.characterIndex !== clip.characterIndex
      ? characters[nextClip.characterIndex]
      : null;

  const totalChars = characters.length;
  const progress = (clip.characterIndex + 1) / totalChars;
  const prettyName = character.name
    .replace(/^(f[1-6]_|boss_|neutral_|critter_)/, "")
    .split("_")
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: pad,
          paddingLeft: pad,
          paddingRight: pad,
          paddingBottom: pad + labelArea,
        }}
      >
        <Sprite
          character={character}
          region={region}
          maxWidth={maxW}
          maxHeight={maxH}
        />
      </AbsoluteFill>

      {nextChar ? (
        <Img
          src={staticFile(`duelyst-animations/${nextChar.sheet}`)}
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      ) : null}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: `${pad * 0.4}px ${pad}px`,
          background: `linear-gradient(to top, ${LABEL_BG}, rgba(0,0,0,0))`,
          color: "white",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          display: "flex",
          flexDirection: "column",
          gap: short * 0.015,
        }}
      >
        <div
          style={{
            fontSize: short * 0.028,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#f2d27a",
          }}
        >
          {character.faction}
        </div>
        <div
          style={{
            fontSize: short * 0.06,
            fontWeight: 800,
            lineHeight: 1.05,
            textTransform: "capitalize",
          }}
        >
          {prettyName}
        </div>
        <div
          style={{
            fontSize: short * 0.026,
            color: "#aab0bd",
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          {animation.name}
          {" · "}
          {clip.characterIndex + 1}/{totalChars}
        </div>
        <div
          style={{
            height: short * 0.006,
            width: "100%",
            background: "rgba(255,255,255,0.1)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              background: "#f2d27a",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
