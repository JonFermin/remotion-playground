import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import "./fonts";
import { BEATS, DURATION_FRAMES } from "./theme";
import { LogoIntro } from "./scenes/LogoIntro";
import { DwarfSprite } from "./scenes/DwarfSprite";
import { WordSelection } from "./scenes/WordSelection";
import { GemHighlight } from "./scenes/GemHighlight";
import { BookThemes } from "./scenes/BookThemes";
import { ScoreReveal } from "./scenes/ScoreReveal";
import { CTACard } from "./scenes/CTACard";

export const Promo: React.FC = () => {
  const { fps } = useVideoConfig();
  const premount = fps;

  return (
    <AbsoluteFill>
      <Audio
        src={staticFile("typelands-promo/sounds/ambient.mp3")}
        loop
        volume={(f) => {
          const fadeIn = interpolate(f, [0, fps], [0, 0.35], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const fadeOut = interpolate(
            f,
            [DURATION_FRAMES - 2 * fps, DURATION_FRAMES],
            [1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          return fadeIn * fadeOut;
        }}
      />

      <Sequence
        from={BEATS.logo.from}
        durationInFrames={BEATS.logo.duration}
        premountFor={premount}
      >
        <LogoIntro />
      </Sequence>
      <Sequence
        from={BEATS.dwarf.from}
        durationInFrames={BEATS.dwarf.duration}
        premountFor={premount}
      >
        <DwarfSprite />
      </Sequence>
      <Sequence
        from={BEATS.word.from}
        durationInFrames={BEATS.word.duration}
        premountFor={premount}
      >
        <WordSelection />
      </Sequence>
      <Sequence
        from={BEATS.gem.from}
        durationInFrames={BEATS.gem.duration}
        premountFor={premount}
      >
        <GemHighlight />
      </Sequence>
      <Sequence
        from={BEATS.books.from}
        durationInFrames={BEATS.books.duration}
        premountFor={premount}
      >
        <BookThemes />
      </Sequence>
      <Sequence
        from={BEATS.score.from}
        durationInFrames={BEATS.score.duration}
        premountFor={premount}
      >
        <ScoreReveal />
      </Sequence>
      <Sequence
        from={BEATS.cta.from}
        durationInFrames={BEATS.cta.duration}
        premountFor={premount}
      >
        <CTACard />
      </Sequence>
    </AbsoluteFill>
  );
};
