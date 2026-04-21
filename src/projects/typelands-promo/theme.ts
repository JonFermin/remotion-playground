export const COLORS = {
  tan: "#D8C49A",
  brown: "#6B4423",
  forest: "#2D5016",
  cream: "#F4EEE0",
  ink: "#2A1F14",
  gold: "#C9A959",
};

export const BOOK_PALETTES = [
  { name: "Homer", bg: "#7A3A12", fg: "#F2C66A", accent: "#B0421C" },
  { name: "Dante", bg: "#1E3A5C", fg: "#E8F2FF", accent: "#6FA8D6" },
  { name: "Grimm", bg: "#142818", fg: "#C9B89A", accent: "#6E8F3A" },
  { name: "Doyle", bg: "#2A1F1A", fg: "#D6C9A8", accent: "#8A6F3C" },
];

export const DURATION_FRAMES = 900;
export const FPS = 30;

export type Beat = {
  from: number;
  duration: number;
};

export const BEATS = {
  logo:      { from: 0,   duration: 120 },
  dwarf:     { from: 120, duration: 120 },
  word:      { from: 240, duration: 120 },
  gem:       { from: 360, duration: 120 },
  books:     { from: 480, duration: 120 },
  score:     { from: 600, duration: 180 },
  cta:       { from: 780, duration: 120 },
} satisfies Record<string, Beat>;
