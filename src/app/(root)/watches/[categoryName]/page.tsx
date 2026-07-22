import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import CategoryPageClient from "@/@components/pages/CategoryPageClient/CategoryPageClient";

type PageProps = {
    params: {
        categoryName: string;
    };
};

const formatCategoryName = (value: string) => {
    return value
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const categoryNameParam = params?.categoryName ?? "";
    const categoryName = formatCategoryName(categoryNameParam || "category");

    return {
        title: `${categoryName} Watches in Bangladesh`,
        description: `Buy original ${categoryName} watches at best price in Bangladesh. Official products, warranty and fast delivery.`,
        robots: {
            index: true,
            follow: true,
        },
        openGraph: {
            title: `${categoryName} Watches in Bangladesh`,
            description: `Shop original ${categoryName} watches in Bangladesh at the best price.`,
            url: `http://localhost:3000/brand/${categoryNameParam}`,
            siteName: "Your Store Name",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `${categoryName} Watches in Bangladesh`,
            description: `Buy original ${categoryName} watches at the best price in Bangladesh.`,
        },
        alternates: {
            canonical: `http://localhost:3000/brand/${categoryNameParam}`,
        },
    };
}

export default function CategoryPage({ params }: PageProps) {
    const categoryName = params?.categoryName ?? "";

    return (
        <Suspense fallback={<GlobalLoading />}>
            <CategoryPageClient categoryName={categoryName} />
        </Suspense>
    );
}