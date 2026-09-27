import type { Metadata } from "next";
import Icon from "@/@components/core/Icon/Icon";

export const metadata: Metadata = {
  title: "Nylon Strap Churi in Bangladesh",
  description:
    "Shop nylon-strap churi at Rangonaa, light everyday styles with delivery across Bangladesh.",
  robots: { index: true, follow: true },
};

const page = async () => {
  return (
    <div className="max-w-layout mx-auto py-5 min-h-[47vh]">
      <div className="flex gap-6">
        {/* <FilterSideBar /> */}

        <div className="xl:w-4/5 w-full">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg">Home / Churi</p>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Icon name={"tune"} />
              <p className="text-lg">Filters</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
