import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import Wallet from "@/@components/pages/Wallet/Wallet";

export const metadata: Metadata = {
  title: "Branded Wallet in Bangladesh",
  description:
    "Buy Original Wallet Best prices in Bangladesh at Naviforce Bangladesh. Watch Wallet in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <Wallet />
    </Suspense>
  );
}
