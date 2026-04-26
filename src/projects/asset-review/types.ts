export type ReviewRegion = { x: number; y: number; w: number; h: number };

export type ReviewAnimation = {
  name: string;
  speed: number;
  loop: boolean;
  frames: ReviewRegion[];
  sheet: string;
  sheetWidth: number;
  sheetHeight: number;
};

export type ReviewCharacter = {
  name: string;
  pack: string;
  faction: string; // creator, e.g. "pixelfrog"
  detector: string;
  sheet: string;
  sheetWidth: number;
  sheetHeight: number;
  animations: ReviewAnimation[];
  // Largest frame extent across all animations of this character.
  // Used to keep the display box stable so sprites don't "breathe" between
  // animations / frames of differing dimensions.
  maxFrameW: number;
  maxFrameH: number;
};

export type ReviewManifest = {
  generatedAt: string;
  source: string;
  detectors: string[];
  stats: Record<string, number>;
  characters: ReviewCharacter[];
};

export type ReviewClip = {
  characterIndex: number;
  animationIndex: number;
  startFrame: number;
  durationFrames: number;
};

export type ReviewSchedule = {
  clips: ReviewClip[];
  totalFrames: number;
};

export type ReviewProps = {
  detectorFilter: string; // "all" | "T2-pixelfrog" | "T1-kenney-xml" | comma-list
  packFilter: string; // "all" | substring match
  framesPerSprite: number;
  characters: ReviewCharacter[];
  schedule: ReviewSchedule;
};
