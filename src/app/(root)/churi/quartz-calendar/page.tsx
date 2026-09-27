import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import QuartzCalendar from "@/@components/pages/Collection/QuartzCalendar/QuartzCalendar";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Calendar Churi in Bangladesh",
  description:
    "Shop calendar-style churi at Rangonaa, a detailed collection for gifts and daily wear in Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <QuartzCalendar />
    </Suspense>
  );
}
