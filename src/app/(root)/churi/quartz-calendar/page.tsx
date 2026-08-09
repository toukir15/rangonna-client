import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import QuartzCalendar from "@/@components/pages/Collection/QuartzCalendar/QuartzCalendar";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Branded Quartz Calendar Watches in Bangladesh",
  description:
    "Buy Original Quartz Calendar Watches Best prices in Bangladesh at Naviforce Bangladesh. Quartz Calendar Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <QuartzCalendar />
    </Suspense>
  );
}
