import SectionHeader from "./SectionHeader";
import { getFeaturedCollectionData } from "./getFeaturedCollectionData";
import FeaturedCollectionGrid from "./FeaturedCollectionGrid";

export default async function StoreCategories() {
  const data = await getFeaturedCollectionData();

  if (!data) return null;

  return (
    <section
      className="rongonaa-feat-collections"
      aria-labelledby="featured-collections-heading"
    >
      <div className="rongonaa-feat-collections__inner">
        <SectionHeader
          className="rongonaa-feat-collections__header rongonaa-feat-collections__header--hide-mobile-description"
          eyebrow={data.eyebrow}
          title={data.heading}
          description={data.description}
          href={data.href}
          linkLabel={data.linkLabel}
        />

        <FeaturedCollectionGrid mobile={data.mobile} desktop={data.desktop} />
      </div>
    </section>
  );
}
