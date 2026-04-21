import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

loadFont({
  family: "Inter",
  url: staticFile("typelands-promo/fonts/Inter.ttf"),
  format: "truetype",
});

loadFont({
  family: "SourceSerif4",
  url: staticFile("typelands-promo/fonts/SourceSerif4.ttf"),
  format: "truetype",
});

export const SERIF = "SourceSerif4, Georgia, serif";
export const SANS = "Inter, -apple-system, system-ui, sans-serif";
