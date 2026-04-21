import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PaperBackground } from "../PaperBackground";
import { BOOK_PALETTES, COLORS } from "../theme";
import { SERIF } from "../fonts";

export const BookThemes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const portrait = height > width;

  const cardW = Math.min(width, height) * (portrait ? 0.72 : 0.18);
  const cardH = cardW * (portrait ? 0.38 : 1.5);
  const gap = cardW * 0.08;

  const captionIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <PaperBackground tint={COLORS.cream} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: gap * 1.2,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: portrait ? "column" : "row",
            gap,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {BOOK_PALETTES.map((book, i) => {
            const delay = 5 + i * 8;
            const pop = spring({
              frame: frame - delay,
              fps,
              config: { damping: 13, stiffness: 160, mass: 0.9 },
            });
            const translate = interpolate(pop, [0, 1], [40, 0]);
            return (
              <div
                key={book.name}
                style={{
                  width: cardW,
                  height: cardH,
                  background: `linear-gradient(160deg, ${book.accent} 0%, ${book.bg} 100%)`,
                  borderRadius: cardW * 0.06,
                  border: `${cardW * 0.015}px solid ${COLORS.brown}`,
                  boxShadow: `0 ${cardW * 0.04}px ${cardW * 0.1}px rgba(42,31,20,0.4)`,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  padding: cardW * 0.06,
                  opacity: pop,
                  transform: `translateY(${translate}px)`,
                }}
              >
                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: cardW * 0.14,
                    color: book.fg,
                    letterSpacing: cardW * 0.005,
                    textShadow: "0 2px 6px rgba(0,0,0,0.5)",
                  }}
                >
                  {book.name}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: cardW * (portrait ? 0.13 : 0.22),
            color: COLORS.ink,
            opacity: captionIn,
            marginTop: gap,
          }}
        >
          Conquer the classics.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
