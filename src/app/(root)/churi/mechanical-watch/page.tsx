import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import MechanicalWatch from "@/@components/pages/Collection/MechanicalWatch/MechanicalWatch";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Mechanical Style Churi in Bangladesh",
  description:
    "Explore mechanical-style churi at Rangonaa, crafted for collectors and daily wear in Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <MechanicalWatch />
    </Suspense>
  );
}
