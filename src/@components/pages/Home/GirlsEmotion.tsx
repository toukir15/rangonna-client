import SectionHeader from "./SectionHeader";
import GirlsEmotionGrid from "./GirlsEmotionGrid";
import { getGirlsEmotionData } from "./getGirlsEmotionData";

export default async function GirlsEmotion() {
  const content = await getGirlsEmotionData();
  if (!content?.mobile.length && !content?.desktop.length) return null;

  return (
    <section className="rongonaa-home-section">
      <div className="rongonaa-home-section__inner">
        <SectionHeader
          eyebrow={content.eyebrow}
          title={content.heading}
          description={content.description}
          href={content.href}
          linkLabel={content.linkLabel}
        />

        <GirlsEmotionGrid mobileItems={content.mobile} desktopItems={content.desktop} />
      </div>
    </section>
  );
}
