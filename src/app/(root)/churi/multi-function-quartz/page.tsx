import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import MultiFunctionQuartz from "@/@components/pages/Collection/MultiFunctionQuartz/MultiFunctionQuartz";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Multi-Function Churi in Bangladesh",
  description:
    "Browse multi-function churi designs at Rangonaa, made for everyday and occasion wear in Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <MultiFunctionQuartz />
    </Suspense>
  );
}
