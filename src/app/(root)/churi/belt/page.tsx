import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import WatchBelt from "@/@components/pages/Accessories/WatchBelt/WatchBelt";

export const metadata: Metadata = {
  title: "Churi Belts in Bangladesh",
  description:
    "Browse churi belts and straps at Rangonaa, matched to everyday and occasion sets in Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <WatchBelt />
    </Suspense>
  );
}
