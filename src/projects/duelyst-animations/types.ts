export type DuelystRegion = { x: number; y: number; w: number; h: number };

export type DuelystAnimation = {
  name: string;
  speed: number;
  loop: boolean;
  frames: DuelystRegion[];
};

export type DuelystCharacter = {
  name: string;
  faction: string;
  sheet: string;
  sheetWidth: number;
  sheetHeight: number;
  animations: DuelystAnimation[];
};

export type DuelystManifest = {
  source: string;
  kind: string;
  generatedAt: string;
  characters: DuelystCharacter[];
};

export type DuelystClip = {
  characterIndex: number;
  animationIndex: number;
  startFrame: number;
  durationFrames: number;
};

export type DuelystSchedule = {
  clips: DuelystClip[];
  totalFrames: number;
};

export type DuelystProps = {
  factionFilter: string;
  framesPerSprite: number;
  characters: DuelystCharacter[];
  schedule: DuelystSchedule;
};
