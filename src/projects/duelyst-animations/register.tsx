import {
  CalculateMetadataFunction,
  Composition,
  Folder,
  staticFile,
} from "remotion";
import { DuelystAnimations } from "./DuelystAnimations";
import { buildSchedule, filterAndSortCharacters } from "./schedule";
import type { DuelystManifest, DuelystProps } from "./types";

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1080;

async function loadManifest(
  abortSignal: AbortSignal | undefined,
): Promise<DuelystManifest> {
  const res = await fetch(staticFile("duelyst-animations/manifest.json"), {
    signal: abortSignal,
  });
  if (!res.ok) {
    throw new Error(`Failed to load duelyst manifest: ${res.status}`);
  }
  return (await res.json()) as DuelystManifest;
}

const calculateMetadata: CalculateMetadataFunction<DuelystProps> = async ({
  props,
  abortSignal,
}) => {
  const manifest = await loadManifest(abortSignal);
  const characters = filterAndSortCharacters(manifest, props.factionFilter);
  const schedule = buildSchedule(characters, props.framesPerSprite);
  return {
    durationInFrames: schedule.totalFrames,
    props: {
      ...props,
      characters,
      schedule,
    },
  };
};

const defaultProps: DuelystProps = {
  factionFilter: "all",
  framesPerSprite: 3,
  characters: [],
  schedule: { clips: [], totalFrames: 1 },
};

export const DuelystAnimationsFolder: React.FC = () => {
  return (
    <Folder name="duelyst-animations">
      <Composition
        id="DuelystAnimations-All"
        component={DuelystAnimations}
        durationInFrames={1}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={defaultProps}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="DuelystAnimations-Lyonar"
        component={DuelystAnimations}
        durationInFrames={1}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ ...defaultProps, factionFilter: "lyonar" }}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="DuelystAnimations-FastPreview"
        component={DuelystAnimations}
        durationInFrames={1}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          ...defaultProps,
          factionFilter: "lyonar",
          framesPerSprite: 1,
        }}
        calculateMetadata={calculateMetadata}
      />
    </Folder>
  );
};
