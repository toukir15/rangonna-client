import SectionHeader from "./SectionHeader";
import { getCustomerLoveData } from "./getCustomerLoveData";
import CustomerLoveGrid from "./CustomerLoveGrid";

export default async function CustomerLove() {
  const data = await getCustomerLoveData();

  if (!data) return null;

  return (
    <section className="rongonaa-home-section rongonaa-home-section--alt rongonaa-home-section--border">
      <div className="rongonaa-home-section__inner">
        <SectionHeader
          eyebrow={data.eyebrow}
          title={data.heading}
          description={data.description}
          align="center"
        />

        <CustomerLoveGrid mobile={data.mobile} desktop={data.desktop} />
      </div>
    </section>
  );
}
