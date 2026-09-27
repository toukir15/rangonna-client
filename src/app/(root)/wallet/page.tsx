import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import Wallet from "@/@components/pages/Wallet/Wallet";

export const metadata: Metadata = {
  title: "Wallets in Bangladesh",
  description:
    "Shop wallets at Rangonaa alongside handcrafted churi collections, with delivery across Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <Wallet />
    </Suspense>
  );
}
