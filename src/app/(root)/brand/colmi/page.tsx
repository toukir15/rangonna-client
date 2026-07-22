import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import ColmiBrand from "@/@components/pages/Brand/Colmi/Colmi";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Colmi Watches in Bangladesh",
  description:
    "Buy Original Colmi Watches Best prices in Bangladesh at Naviforce Bangladesh. Colmi Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <ColmiBrand />
    </Suspense>
  );
}
