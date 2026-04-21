import { AbsoluteFill, Img, staticFile } from "remotion";
import { COLORS } from "./theme";

export const PaperBackground: React.FC<{ tint?: string }> = ({ tint }) => {
  return (
    <AbsoluteFill
      style={{ backgroundColor: tint ?? COLORS.cream, overflow: "hidden" }}
    >
      <Img
        src={staticFile("typelands-promo/overlay/paper.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.55,
          mixBlendMode: "multiply",
        }}
      />
    </AbsoluteFill>
  );
};
