import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {
  ReviewAnimation,
  ReviewClip,
  ReviewProps,
  ReviewRegion,
} from "./types";

const BG = "#0b0d12";
const INSET = 0.06;

function Sprite({
  animation,
  region,
  boxW,
  boxH,
  scale,
}: {
  animation: ReviewAnimation;
  region: ReviewRegion;
  boxW: number;
  boxH: number;
  scale: number;
}) {
  // Each frame is centered inside the fixed display box so that frames of
  // varying dimensions don't cause the sprite to "breathe" at animation
  // boundaries. The box itself is stable per-character.
  const frameW = region.w * scale;
  const frameH = region.h * scale;
  const offsetX = (boxW - frameW) / 2;
  const offsetY = (boxH - frameH) / 2;
  return (
    <div
      style={{
        width: boxW,
        height: boxH,
        position: "relative",
        imageRendering: "pixelated",
      }}
    >
      <div
        style={{
          width: frameW,
          height: frameH,
          overflow: "hidden",
          position: "absolute",
          left: offsetX,
          top: offsetY,
        }}
      >
        <Img
          src={staticFile(`asset-review/${animation.sheet}`)}
          style={{
            width: animation.sheetWidth * scale,
            height: animation.sheetHeight * scale,
            maxWidth: "none",
            maxHeight: "none",
            position: "absolute",
            top: -region.y * scale,
            left: -region.x * scale,
            imageRendering: "pixelated",
          }}
        />
      </div>
    </div>
  );
}

function findClipIndex(clips: ReviewClip[], frame: number): number {
  let lo = 0;
  let hi = clips.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (clips[mid].startFrame <= frame) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

function timecode(frame: number, fps: number): string {
  const sec = Math.floor(frame / fps);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const f = frame % fps;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(
    f,
  ).padStart(2, "0")}`;
}

export const AssetReview: React.FC<ReviewProps> = ({
  characters,
  schedule,
  framesPerSprite,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

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
  const headerH = short * 0.12;
  const footerH = short * 0.18;
  const maxW = width - pad * 2;
  const maxH = height - pad * 2 - headerH - footerH;

  // Lock the display scale to the character's largest frame so the sprite
  // box stays the same size across every animation transition.
  const scale = Math.min(
    maxW / character.maxFrameW,
    maxH / character.maxFrameH,
  );
  const boxW = character.maxFrameW * scale;
  const boxH = character.maxFrameH * scale;

  // Preload upcoming sheets so Remotion doesn't block the last frame of an
  // animation while the next animation's PNG is being fetched. Pixelfrog uses
  // one PNG per animation, so we have to preload across same-character
  // animation transitions too — not just character transitions.
  const PRELOAD_AHEAD = 3;
  const preloadSheets: string[] = [];
  const seen = new Set<string>([animation.sheet]);
  for (let i = 1; i <= PRELOAD_AHEAD; i++) {
    const idx = clipIndex + i;
    if (idx >= schedule.clips.length) break;
    const c = schedule.clips[idx];
    const a = characters[c.characterIndex].animations[c.animationIndex];
    if (!seen.has(a.sheet)) {
      seen.add(a.sheet);
      preloadSheets.push(a.sheet);
    }
  }

  const totalChars = characters.length;
  const progress = (clipIndex + 1) / schedule.clips.length;

  const detectorColor =
    character.detector === "T2-pixelfrog"
      ? "#86e3a8"
      : character.detector === "T1-kenney-xml"
        ? "#f2d27a"
        : "#9ad1ff";

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* Top header strip: detector + pack */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: `${pad * 0.5}px ${pad}px`,
          color: "white",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          display: "flex",
          flexDirection: "column",
          gap: short * 0.01,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0))",
          height: headerH,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: short * 0.024,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: detectorColor,
            fontWeight: 700,
          }}
        >
          <span>{character.detector}</span>
          <span style={{ color: "#aab0bd", fontFamily: "ui-monospace, monospace" }}>
            {timecode(frame, fps)}
          </span>
        </div>
        <div
          style={{
            fontSize: short * 0.034,
            fontWeight: 600,
            color: "#dfe2ec",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {character.pack}
        </div>
      </div>

      {/* Sprite area */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: pad + headerH,
          paddingLeft: pad,
          paddingRight: pad,
          paddingBottom: pad + footerH,
        }}
      >
        <Sprite
          animation={animation}
          region={region}
          boxW={boxW}
          boxH={boxH}
          scale={scale}
        />
      </AbsoluteFill>

      {preloadSheets.map((sheet) => (
        <Img
          key={sheet}
          src={staticFile(`asset-review/${sheet}`)}
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Bottom footer: character name + animation + progress */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: `${pad * 0.4}px ${pad}px`,
          background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
          color: "white",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          display: "flex",
          flexDirection: "column",
          gap: short * 0.012,
          height: footerH,
        }}
      >
        <div
          style={{
            fontSize: short * 0.05,
            fontWeight: 800,
            lineHeight: 1.05,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {character.name}
        </div>
        <div
          style={{
            fontSize: short * 0.028,
            color: "#aab0bd",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>
            {animation.name} · {animation.frames.length}f ·{" "}
            {region.w}×{region.h}
          </span>
          <span>
            {clipIndex + 1}/{schedule.clips.length} clips · {clip.characterIndex + 1}/
            {totalChars} chars
          </span>
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
              background: detectorColor,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
