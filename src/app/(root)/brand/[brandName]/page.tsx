import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import BrandPageClient from "@/@components/pages/Brand/BrandPageClient/BrandPageClient";

type PageProps = {
    params: {
        brandName: string;
    };
};

const formatBrandName = (value: string) => {
    return value
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const brandNameParam = params?.brandName ?? "";
    const brandName = formatBrandName(brandNameParam || "brand");

    return {
        title: `${brandName} Watches in Bangladesh`,
        description: `Buy original ${brandName} watches at best price in Bangladesh. Official products, warranty and fast delivery.`,
        robots: {
            index: true,
            follow: true,
        },
        openGraph: {
            title: `${brandName} Watches in Bangladesh`,
            description: `Shop original ${brandName} watches in Bangladesh at the best price.`,
            url: `http://localhost:3000/brand/${brandNameParam}`,
            siteName: "Your Store Name",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `${brandName} Watches in Bangladesh`,
            description: `Buy original ${brandName} watches at the best price in Bangladesh.`,
        },
        alternates: {
            canonical: `http://localhost:3000/brand/${brandNameParam}`,
        },
    };
}

export default function BrandPage({ params }: PageProps) {
    const brandName = params?.brandName ?? "";

    return (
        <Suspense fallback={<GlobalLoading />}>
            <BrandPageClient slug={brandName} />
        </Suspense>
    );
}