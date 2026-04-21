import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PaperBackground } from "../PaperBackground";
import { COLORS } from "../theme";
import { SERIF } from "../fonts";

const SHEET_SIZE = 1024;
const COLS = 6;
const ROWS = 6;
const FRAME_SIZE = Math.floor(SHEET_SIZE / COLS); // 170 — typelands uses integer trim
const TOTAL_FRAMES = COLS * ROWS;
const SPRITE_FPS = 10; // matches TreasureScreen.tsx

// Measured horizontal centroid (in source px) of each frame's non-transparent content.
// The artist drew each pose at a slightly different x — row-wrap would otherwise look
// like the character teleports leftward every 6 frames. We subtract these from a
// reference to keep the character visually locked in place.
const CENTROID_X = [
  92.2, 92.8, 92.8, 93.6, 94.6, 94.8, 91.6, 92.3, 92.9, 93.5, 94.7, 95.9,
  93.2, 94.1, 93.9, 94.6, 95.5, 96.0, 92.3, 93.2, 94.0, 94.7, 95.5, 96.2,
  92.5, 93.4, 94.2, 95.4, 96.4, 97.0, 94.1, 94.6, 95.2, 98.8, 100.8, 102.9,
];
const REFERENCE_X = 95;

export const DwarfSprite: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const portrait = height > width;

  const spriteFrame = Math.min(
    TOTAL_FRAMES - 1,
    Math.floor(frame * (SPRITE_FPS / fps)),
  );
  const col = spriteFrame % COLS;
  const row = Math.floor(spriteFrame / COLS);

  const display = Math.min(width, height) * (portrait ? 0.55 : 0.7);
  const scale = display / FRAME_SIZE;
  const centerCorrectionX = (REFERENCE_X - CENTROID_X[spriteFrame]) * scale;

  const labelOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <PaperBackground />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: display * 0.05,
        }}
      >
        <div
          style={{
            width: display,
            height: display,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Img
            src={staticFile("typelands-promo/spritesheets/dwarf-gives-gem.png")}
            style={{
              width: SHEET_SIZE * scale,
              height: SHEET_SIZE * scale,
              maxWidth: "none",
              maxHeight: "none",
              position: "absolute",
              top: -row * FRAME_SIZE * scale,
              left: -col * FRAME_SIZE * scale + centerCorrectionX,
              imageRendering: "auto",
            }}
          />
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: display * 0.08,
            color: COLORS.brown,
            opacity: labelOpacity,
          }}
        >
          Earn gems from the dwarven keeper.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
