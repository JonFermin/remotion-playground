import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PaperBackground } from "../PaperBackground";
import { COLORS } from "../theme";
import { SERIF, SANS } from "../fonts";

const TARGET_SCORE = 12450;

export const ScoreReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const portrait = height > width;
  const unit = Math.min(width, height);

  const labelIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const countStart = 20;
  const countEnd = 110;
  const progress = interpolate(frame, [countStart, countEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const score = Math.floor(progress * TARGET_SCORE);

  const landFrame = countEnd;
  const landPop = spring({
    frame: frame - landFrame,
    fps,
    config: { damping: 8, stiffness: 200, mass: 1.2 },
    durationInFrames: 45,
  });
  const scale = 1 + landPop * 0.18;

  const shakeMag = interpolate(frame, [landFrame, landFrame + 18], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shakeX = (random(`sx${Math.floor(frame / 2)}`) - 0.5) * shakeMag;
  const shakeY = (random(`sy${Math.floor(frame / 2)}`) - 0.5) * shakeMag;

  const glow = interpolate(frame, [landFrame - 5, landFrame + 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const victoryOpacity = interpolate(
    frame,
    [landFrame + 10, landFrame + 35],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill>
      <PaperBackground />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: unit * 0.03,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: unit * 0.035,
            letterSpacing: unit * 0.006,
            color: COLORS.brown,
            opacity: labelIn,
            textTransform: "uppercase",
          }}
        >
          Final Score
        </div>

        <div
          style={{
            position: "relative",
            transform: `translate(${shakeX}px, ${shakeY}px) scale(${scale})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -unit * 0.04,
              borderRadius: unit * 0.1,
              background: `radial-gradient(closest-side, ${COLORS.gold}, transparent 70%)`,
              opacity: glow * 0.55,
              filter: `blur(${unit * 0.02}px)`,
            }}
          />
          <div
            style={{
              position: "relative",
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: unit * (portrait ? 0.28 : 0.22),
              color: COLORS.ink,
              letterSpacing: unit * 0.003,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {score.toLocaleString()}
          </div>
        </div>

        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: unit * 0.05,
            color: COLORS.forest,
            opacity: victoryOpacity,
            marginTop: unit * 0.02,
          }}
        >
          VICTORY
        </div>
      </AbsoluteFill>

      <Sequence from={countStart} durationInFrames={countEnd - countStart}>
        <Audio
          src={staticFile("typelands-promo/sounds/tick.mp3")}
          volume={0.8}
          loop
        />
      </Sequence>
      <Sequence
        from={landFrame}
        durationInFrames={Math.max(1, durationInFrames - landFrame)}
      >
        <Audio src={staticFile("typelands-promo/sounds/tick.mp3")} volume={1} />
      </Sequence>
    </AbsoluteFill>
  );
};
