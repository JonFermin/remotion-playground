import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PaperBackground } from "../PaperBackground";
import { COLORS } from "../theme";
import { SERIF, SANS } from "../fonts";

export const CTACard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const portrait = height > width;
  const unit = Math.min(width, height);

  const iconSize = unit * (portrait ? 0.42 : 0.38);

  const iconPop = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 160, mass: 1 },
  });
  const iconScale = interpolate(iconPop, [0, 1], [0.7, 1]);

  const logoIn = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subIn = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeIn = interpolate(frame, [35, 60], [0, 1], {
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
          gap: unit * 0.03,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: unit * 0.09,
            letterSpacing: unit * 0.006,
            color: COLORS.ink,
            opacity: logoIn,
            transform: `translateY(${(1 - logoIn) * -20}px)`,
          }}
        >
          TYPELANDS
        </div>

        <Img
          src={staticFile("typelands-promo/images/icon.png")}
          style={{
            width: iconSize,
            height: iconSize,
            borderRadius: iconSize * 0.22,
            boxShadow: `0 ${iconSize * 0.06}px ${iconSize * 0.14}px rgba(42,31,20,0.4)`,
            transform: `scale(${iconScale})`,
            opacity: iconPop,
          }}
        />

        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: unit * 0.04,
            color: COLORS.brown,
            opacity: subIn,
            transform: `translateY(${(1 - subIn) * 20}px)`,
          }}
        >
          A word-building roguelite.
        </div>

        <div
          style={{
            display: "flex",
            gap: unit * 0.02,
            marginTop: unit * 0.02,
            flexDirection: portrait ? "column" : "row",
            alignItems: "center",
            opacity: badgeIn,
            transform: `translateY(${(1 - badgeIn) * 20}px)`,
          }}
        >
          <StoreBadge
            primary="Download on the"
            secondary="App Store"
            unit={unit}
          />
          <StoreBadge primary="Get it on" secondary="Google Play" unit={unit} />
        </div>

        <div
          style={{
            marginTop: unit * 0.02,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: unit * 0.025,
            color: COLORS.brown,
            letterSpacing: unit * 0.003,
            textTransform: "uppercase",
            opacity: badgeIn,
          }}
        >
          Coming soon to iOS and Android
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const StoreBadge: React.FC<{
  primary: string;
  secondary: string;
  unit: number;
}> = ({ primary, secondary, unit }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: `${unit * 0.012}px ${unit * 0.025}px`,
        background: COLORS.ink,
        color: COLORS.cream,
        borderRadius: unit * 0.015,
        minWidth: unit * 0.22,
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontSize: unit * 0.014,
          opacity: 0.85,
          letterSpacing: unit * 0.001,
        }}
      >
        {primary}
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: unit * 0.028,
          letterSpacing: unit * 0.001,
        }}
      >
        {secondary}
      </div>
    </div>
  );
};
