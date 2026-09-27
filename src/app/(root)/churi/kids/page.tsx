import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import KidsWatch from "@/@components/pages/Shop/Kids/KidsWatch";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Kids' Churi & Bangles in Bangladesh",
  description:
    "Browse kids' churi and bangles at Rangonaa, with colorful sets and Cash on Delivery in Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <KidsWatch />
    </Suspense>
  );
}
