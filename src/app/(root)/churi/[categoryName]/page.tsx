import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import CategoryPageClient from "@/@components/pages/CategoryPageClient/CategoryPageClient";
import { absoluteUrl, SITE_NAME } from "@/@config/site";
import { fetchStoreCategory } from "@/utils/storeCategory.server";

type PageProps = {
    params: Promise<{
        categoryName: string;
    }>;
};

const formatCategoryName = (value: string) => {
    return value
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { categoryName: categoryNameParam = "" } = await params;
    const category = await fetchStoreCategory(categoryNameParam);
    const categoryName = category?.key || formatCategoryName(categoryNameParam || "category");

    return {
        title: `${categoryName} Churi & Bangles in Bangladesh`,
        description: `Shop ${categoryName} churi and bangles at Rangonaa — handcrafted women's collections with Cash on Delivery across Bangladesh.`,
        robots: {
            index: true,
            follow: true,
        },
        openGraph: {
            title: `${categoryName} Churi & Bangles`,
            description: `Explore ${categoryName} churi and bangle sets at Rangonaa.`,
            url: absoluteUrl(`/churi/${categoryNameParam}`),
            siteName: SITE_NAME,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `${categoryName} Churi & Bangles`,
            description: `Shop ${categoryName} churi and bangles at Rangonaa.`,
        },
        alternates: {
            canonical: absoluteUrl(`/churi/${categoryNameParam}`),
        },
    };
}

export default async function CategoryPage({ params }: PageProps) {
    const { categoryName = "" } = await params;

    return (
        <Suspense fallback={<GlobalLoading />}>
            <CategoryPageClient categoryName={categoryName} />
        </Suspense>
    );
}
