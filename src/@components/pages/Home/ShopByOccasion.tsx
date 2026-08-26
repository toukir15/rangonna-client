import SectionHeader from "./SectionHeader";
import { getShopOccasionData } from "./getShopOccasionData";
import ShopOccasionGrid from "./ShopOccasionGrid";

export default async function ShopByOccasion() {
  const data = await getShopOccasionData();

  if (!data) return null;

  return (
    <section className="rongonaa-home-section rongonaa-home-section--alt">
      <div className="rongonaa-home-section__inner">
        <SectionHeader
          eyebrow={data.eyebrow}
          title={data.heading}
          description={data.description}
          href={data.href || undefined}
          linkLabel={data.linkLabel || undefined}
          align="center"
        />

        <ShopOccasionGrid mobile={data.mobile} desktop={data.desktop} />
      </div>
    </section>
  );
}
