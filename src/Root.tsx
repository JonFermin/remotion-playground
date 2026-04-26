import "./index.css";
import { TypelandsPromoFolder } from "./projects/typelands-promo/register";
import { DuelystAnimationsFolder } from "./projects/duelyst-animations/register";
import { AssetReviewFolder } from "./projects/asset-review/register";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <TypelandsPromoFolder />
      <DuelystAnimationsFolder />
      <AssetReviewFolder />
      {/* Add future projects here: <OtherProjectFolder /> */}
    </>
  );
};
