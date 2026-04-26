import {
  CalculateMetadataFunction,
  Composition,
  Folder,
  staticFile,
} from "remotion";
import { AssetReview } from "./AssetReview";
import { buildSchedule, filterCharacters } from "./schedule";
import type { ReviewManifest, ReviewProps } from "./types";

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1080;

async function loadManifest(
  abortSignal: AbortSignal | undefined,
): Promise<ReviewManifest> {
  const res = await fetch(staticFile("asset-review/manifest.json"), {
    signal: abortSignal,
  });
  if (!res.ok) throw new Error(`Failed to load asset-review manifest: ${res.status}`);
  return (await res.json()) as ReviewManifest;
}

const calculateMetadata: CalculateMetadataFunction<ReviewProps> = async ({
  props,
  abortSignal,
}) => {
  const manifest = await loadManifest(abortSignal);
  const characters = filterCharacters(
    manifest,
    props.detectorFilter,
    props.packFilter,
  );
  const schedule = buildSchedule(characters, props.framesPerSprite);
  return {
    durationInFrames: schedule.totalFrames,
    props: { ...props, characters, schedule },
  };
};

const baseProps: ReviewProps = {
  detectorFilter: "all",
  packFilter: "all",
  framesPerSprite: 4,
  characters: [],
  schedule: { clips: [], totalFrames: 1 },
};

export const AssetReviewFolder: React.FC = () => {
  return (
    <Folder name="asset-review">
      <Composition
        id="AssetReview-All"
        component={AssetReview}
        durationInFrames={1}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={baseProps}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="AssetReview-Pixelfrog"
        component={AssetReview}
        durationInFrames={1}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ ...baseProps, detectorFilter: "T2-pixelfrog" }}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="AssetReview-Kenney"
        component={AssetReview}
        durationInFrames={1}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ ...baseProps, detectorFilter: "T1-kenney-xml" }}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="AssetReview-Loose"
        component={AssetReview}
        durationInFrames={1}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ ...baseProps, detectorFilter: "T3-loose-frames" }}
        calculateMetadata={calculateMetadata}
      />
    </Folder>
  );
};
