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
        title: `${categoryName} Churi & Bangles in Bangladesh | Rangonaa`,
        description: `Shop ${categoryName} churi and bangles at Rangonaa — handcrafted women's collections with Cash on Delivery across Bangladesh.`,
        robots: {
            index: true,
            follow: true,
        },
        openGraph: {
            title: `${categoryName} Churi & Bangles | Rangonaa`,
            description: `Explore ${categoryName} churi and bangle sets at Rangonaa.`,
            url: `https://rangonaa.com/churi/${categoryNameParam}`,
            siteName: "Rangonaa",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `${categoryName} Churi & Bangles | Rangonaa`,
            description: `Shop ${categoryName} churi and bangles at Rangonaa.`,
        },
        alternates: {
            canonical: `https://rangonaa.com/churi/${categoryNameParam}`,
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