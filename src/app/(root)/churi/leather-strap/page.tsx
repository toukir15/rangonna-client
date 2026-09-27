import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import LeatherStrap from "@/@components/pages/Collection/LeatherStrap/LeatherStrap";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Leather Strap Churi in Bangladesh",
  description:
    "Shop leather-strap churi at Rangonaa for a classic finish, with Cash on Delivery across Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <LeatherStrap />
    </Suspense>
  );
}
