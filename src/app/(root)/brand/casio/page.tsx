import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import CasioBrand from "@/@components/pages/Brand/Casio/Casio";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Casio Watches in Bangladesh",
  description:
    "Buy Original Casio Watches Best prices in Bangladesh at Naviforce Bangladesh. Casio Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <CasioBrand />
    </Suspense>
  );
}
