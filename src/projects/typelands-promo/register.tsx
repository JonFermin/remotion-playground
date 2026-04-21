import { Composition, Folder } from "remotion";
import { Promo } from "./Promo";
import { DURATION_FRAMES, FPS } from "./theme";

export const TypelandsPromoFolder: React.FC = () => {
  return (
    <Folder name="typelands-promo">
      <Composition
        id="TypelandsPromo-Portrait"
        component={Promo}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="TypelandsPromo-Landscape"
        component={Promo}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </Folder>
  );
};
