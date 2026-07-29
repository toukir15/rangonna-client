import type {
  Product,
  ProductVariant,
} from "@/@interfaces/ProductDetails/productDetails.interface";

const normalizeStatus = (status?: string) =>
  String(status || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");

export const isVariantInStock = (variant?: ProductVariant | null): boolean => {
  if (!variant) return false;
  const status = normalizeStatus(variant?.inventory?.stock_status);
  const qty = Number(variant?.inventory?.stock_quantity || 0);
  if (status === "out-of-stock") return false;
  if (status === "in-stock" || status === "pre-order") return true;
  return qty > 0;
};

export const getProductVariants = (product?: Product | null): ProductVariant[] =>
  Array.isArray(product?.variants) ? product!.variants! : [];

export const getTotalStockQuantity = (product?: Product | null): number => {
  const variants = getProductVariants(product);
  if (variants.length) {
    return variants.reduce(
      (sum, v) => sum + (Number(v?.inventory?.stock_quantity) || 0),
      0,
    );
  }
  return Number(product?.inventory?.stock_quantity) || 0;
};

export const isProductInStock = (product?: Product | null): boolean => {
  const variants = getProductVariants(product);
  if (variants.length) {
    return variants.some(isVariantInStock);
  }
  const status = normalizeStatus(product?.inventory?.stock_status);
  if (status === "out-of-stock") return false;
  if (status === "in-stock") return true;
  return getTotalStockQuantity(product) > 0;
};

export const getDefaultVariant = (
  product?: Product | null,
): ProductVariant | null => {
  const variants = getProductVariants(product);
  if (!variants.length) return null;
  return variants.find(isVariantInStock) || variants[0];
};
