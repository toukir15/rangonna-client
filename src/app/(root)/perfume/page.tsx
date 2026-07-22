import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import Perfume from "@/@components/pages/Perfume/Perfume";

export const metadata: Metadata = {
    title: "Branded Perfume in Bangladesh",
    description:
        "Buy Original Perfume Best prices in Bangladesh at Naviforce Bangladesh. Perfume in BD",
    robots: { index: true, follow: true },
};

export default function PerfumePage() {
    return (
        <Suspense fallback={<GlobalLoading />}>
            <Perfume />
        </Suspense>
    );
}
