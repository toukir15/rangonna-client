import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import ZeblazeBrand from "@/@components/pages/Brand/Zeblaze/Zeblaze";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Zeblaze Watches in Bangladesh",
  description:
    "Buy Original Zeblaze Watches Best prices in Bangladesh at Naviforce Bangladesh. Zeblaze Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <ZeblazeBrand />
    </Suspense>
  );
}
