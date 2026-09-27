import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import StainlessSteel from "@/@components/pages/Collection/StainlessSteel/StainlessSteel";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Stainless Steel Churi in Bangladesh",
  description:
    "Shop stainless steel churi at Rangonaa for a polished everyday look, with delivery across Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <StainlessSteel />
    </Suspense>
  );
}
