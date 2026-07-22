import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import Sunglass from "@/@components/pages/Sunglass/Sunglass";

export const metadata: Metadata = {
  title: "Branded Sunglass in Bangladesh",
  description:
    "Buy Original Sunglass Best prices in Bangladesh at Naviforce Bangladesh. Sunglass in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <Sunglass />
    </Suspense>
  );
}
