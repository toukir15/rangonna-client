import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { absoluteUrl, SITE_NAME } from "@/@config/site";
import { ProductService } from "@/@services/apis/Product/Product.service";
import ProductPageClient from "@/@components/pages/ProductPageClient/ProductPageClient";

type Params = { pid: string };

function plainText(value?: string): string {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function productAvailability(product: {
  variants?: { inventory?: { stock_status?: string; stock_quantity?: number } }[];
  inventory?: { stock_status?: string };
}): string {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const inStock = variants.some((variant) => {
    const status = String(variant?.inventory?.stock_status || "").toLowerCase();
    const quantity = Number(variant?.inventory?.stock_quantity || 0);
    if (status === "out_of_stock" || status === "out-of-stock") return false;
    if (status === "in_stock" || status === "in-stock") return true;
    return quantity > 0;
  });

  if (variants.length) {
    return inStock
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";
  }

  const status = String(product?.inventory?.stock_status || "").toLowerCase();
  if (status === "out_of_stock" || status === "out-of-stock") {
    return "https://schema.org/OutOfStock";
  }
  return "https://schema.org/InStock";
}

function productJsonLd(product: {
  title?: string;
  short_description?: string;
  description?: string;
  featured_image?: { src?: string };
  pricing?: { sale_price?: number; regular_price?: number };
  sku?: string;
  variants?: { inventory?: { stock_status?: string; stock_quantity?: number } }[];
  inventory?: { stock_status?: string };
}, canonical: string) {
  const price = Number(
    product?.pricing?.sale_price || product?.pricing?.regular_price || 0,
  );
  const description = plainText(
    product?.short_description || product?.description,
  );

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product?.title,
    description,
    image: product?.featured_image?.src ? [product.featured_image.src] : [],
    sku: product?.sku,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "BDT",
      ...(price > 0 ? { price } : {}),
      availability: productAvailability(product),
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { pid } = await params;
  const canonical = absoluteUrl(`/product/${pid}`);

  try {
    const productRes = await ProductService.getSingleProduct(pid);

    if (!productRes?.success || !productRes?.data) {
      return {
        title: "Product Not Found",
        description: "This product does not exist.",
        alternates: { canonical },
      };
    }

    const product = productRes.data;
    const title =
      product?.meta_title ||
      `${product?.title} Price in Bangladesh`;
    const description =
      product?.meta_description ||
      plainText(product?.short_description) ||
      `Buy ${product?.title} at Rangonaa. Handcrafted churi and bangles with Cash on Delivery across Bangladesh.`;
    const ogImage = product?.featured_image?.src;

    return {
      title,
      description,
      keywords: Array.isArray(product?.keywords) ? product.keywords : undefined,
      openGraph: {
        title: product?.title || title,
        description,
        type: "website",
        url: canonical,
        siteName: SITE_NAME,
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
      alternates: { canonical },
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

  const product = singleProduct.data;
  const canonical = absoluteUrl(`/product/${product?.slug || pid}`);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product, canonical)),
        }}
      />
      <ProductPageClient
        initialSingleWatch={product}
        initialMoreWatchData={moreProducts?.data || []}
      />
    </>
  );
}
