import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import MechanicalWatch from "@/@components/pages/Collection/MechanicalWatch/MechanicalWatch";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Branded Mechanical Watches in Bangladesh",
  description:
    "Buy Original Mechanical Watches Best prices in Bangladesh at Naviforce Bangladesh. Mechanical Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <MechanicalWatch />
    </Suspense>
  );
}
