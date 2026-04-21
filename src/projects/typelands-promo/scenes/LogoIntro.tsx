import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PaperBackground } from "../PaperBackground";
import { COLORS } from "../theme";
import { SERIF } from "../fonts";

const WORD = "TYPELANDS";

export const LogoIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const portrait = height > width;

  const gapRatio = 0.08;
  const maxTotalW = width * 0.88;
  const tileSize = Math.min(
    Math.min(width, height) * (portrait ? 0.13 : 0.1),
    maxTotalW / (WORD.length + (WORD.length - 1) * gapRatio),
  );
  const gap = tileSize * gapRatio;
  const totalWidth = WORD.length * tileSize + (WORD.length - 1) * gap;

  return (
    <AbsoluteFill>
      <PaperBackground />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: portrait ? "column" : "row",
          gap,
        }}
      >
        <div
          style={{
            display: "flex",
            gap,
            width: totalWidth,
            justifyContent: "center",
          }}
        >
          {WORD.split("").map((letter, i) => {
            const delay = i * 3;
            const pop = spring({
              frame: frame - delay,
              fps,
              config: { damping: 14, stiffness: 180, mass: 0.9 },
            });
            const translateY = interpolate(pop, [0, 1], [-60, 0]);
            const opacity = interpolate(pop, [0, 0.3, 1], [0, 0.6, 1]);
            return (
              <div
                key={i}
                style={{
                  width: tileSize,
                  height: tileSize,
                  borderRadius: tileSize * 0.08,
                  background: COLORS.tan,
                  boxShadow: `0 ${tileSize * 0.04}px ${tileSize * 0.08}px rgba(42,31,20,0.25), inset 0 ${tileSize * 0.015}px 0 rgba(255,255,255,0.35)`,
                  border: `${tileSize * 0.015}px solid ${COLORS.brown}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: SERIF,
                  fontWeight: 700,
                  fontSize: tileSize * 0.55,
                  color: COLORS.ink,
                  transform: `translateY(${translateY}px)`,
                  opacity,
                }}
              >
                {letter}
              </div>
            );
          })}
        </div>
        <TaglineSub tileSize={tileSize} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const TaglineSub: React.FC<{ tileSize: number }> = ({ tileSize }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [45, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const translateY = interpolate(frame, [45, 65], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return (
    <div
      style={{
        marginTop: tileSize * 0.4,
        fontFamily: SERIF,
        fontStyle: "italic",
        fontSize: tileSize * 0.28,
        color: COLORS.brown,
        letterSpacing: tileSize * 0.02,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      A Word. A Gem. A Legend.
    </div>
  );
};
