import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PaperBackground } from "../PaperBackground";
import { COLORS } from "../theme";
import { SERIF } from "../fonts";

const VIDEO_ASPECT = 886 / 1920;

export const WordSelection: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const portrait = height > width;

  const clipH = portrait ? height * 0.74 : height * 0.88;
  const clipW = clipH * VIDEO_ASPECT;

  const clipIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const captionIn = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const captionSize = Math.min(width, height) * (portrait ? 0.07 : 0.08);

  return (
    <AbsoluteFill>
      <PaperBackground />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: portrait ? "column" : "row",
          gap: clipH * 0.04,
        }}
      >
        <div
          style={{
            width: clipW,
            height: clipH,
            borderRadius: clipW * 0.05,
            overflow: "hidden",
            boxShadow: `0 ${clipW * 0.03}px ${clipW * 0.08}px rgba(42,31,20,0.35)`,
            border: `${clipW * 0.01}px solid ${COLORS.brown}`,
            transform: `scale(${0.92 + clipIn * 0.08})`,
            opacity: clipIn,
            flexShrink: 0,
          }}
        >
          <Video
            src={staticFile("typelands-promo/videos/promo.mov")}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: captionSize,
            color: COLORS.ink,
            opacity: captionIn,
            transform: `translateY(${(1 - captionIn) * 20}px)`,
            textAlign: "center",
            maxWidth: portrait ? "90%" : "28%",
          }}
        >
          Build words.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
