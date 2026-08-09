import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import WatchBox from "@/@components/pages/Accessories/WatchBox/WatchBox";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Branded Watch Box in Bangladesh",
  description:
    "Buy Original Watch Box Best prices in Bangladesh at Naviforce Bangladesh. Watch Box in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <WatchBox />
    </Suspense>
  );
}
