import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import Perfume from "@/@components/pages/Perfume/Perfume";

export const metadata: Metadata = {
    title: "Perfume in Bangladesh",
    description:
        "Shop perfume at Rangonaa to pair with bridal and daily churi looks, delivered across Bangladesh.",
    robots: { index: true, follow: true },
};

export default function PerfumePage() {
    return (
        <Suspense fallback={<GlobalLoading />}>
            <Perfume />
        </Suspense>
    );
}
