import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProductService } from "@/@services/apis/Product/Product.service";
import ProductPageClient from "@/@components/pages/ProductPageClient/ProductPageClient";

type Params = { pid: string };

// ⬇️ Params comes as a Promise — await before using.
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { pid } = await params;

  try {
    const productRes = await ProductService.getSingleProduct(pid);

    if (!productRes?.success || !productRes?.data) {
      return {
        title: "Product Not Found",
        description: "This product does not exist.",
        alternates: { canonical: `https://Naviforce.com.bd/product/${pid}` },
      };
    }

    const product = productRes.data;
    const title = `${product?.title} Watch Price in Bangladesh | Naviforce Bangladesh`;
    const description = `Buy Original ${product?.title} Watch Best prices in Bangladesh at Naviforce Bangladesh . ${product?.title} Watch in BD`;
    const canonical = `https://Naviforce.com.bd/product/${pid}`;
    const ogImage = product?.featured_image?.src;

    return {
      title,
      description,
      openGraph: {
        title: product?.title || title,
        description: product?.short_description || description,
        type: "website",
        url: canonical,
        images: ogImage
          ? [{ url: ogImage, alt: product?.title || "Product image" }]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: product?.title || title,
        description,
        images: ogImage ? [ogImage] : [],
      },
      alternates: { canonical },
    };
  } catch (error: unknown) {
    const status = (error as { status?: number })?.status;

    return {
      title: status === 404 ? "Product Not Found" : "Product Unavailable",
      description:
        status === 404
          ? "This product does not exist."
          : "Unable to load this product right now. Please try again later.",
      alternates: { canonical: `https://Naviforce.com.bd/product/${pid}` },
    };
  }
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { pid } = await params;

  let singleProduct = null;

  try {
    singleProduct = await ProductService.getSingleProduct(pid);
  } catch {
    notFound();
  }

  let moreProducts = null;

  try {
    moreProducts = await ProductService.getMoreWatches(pid);
  } catch (error) {
    console.log("moreProducts error", error);
  }

  if (!singleProduct?.success || !singleProduct?.data) {
    notFound();
  }

  return (
    <ProductPageClient
      initialSingleWatch={singleProduct.data}
      initialMoreWatchData={moreProducts?.data || []}
    />
  );
}
