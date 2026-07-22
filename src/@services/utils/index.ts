export interface IQueryParams {
  page?: string | number;
  limit?: string | number;
  searchTerm?: string;
  category?: string;
  brand?: string;
  "inventory.stock_status": string;
  min_price?: number | string;
  priceRange?: any;
  sort?: any;
  product_ids?: any;
  slug?: string;
}

export const queryStringMapper = (params?: IQueryParams): string => {
  if (!params) return "";

  const encodedParams = new URLSearchParams();
  const rawParams: string[] = [];
  if (params.searchTerm) encodedParams.append("searchTerm", params.searchTerm);
  if (params.page) encodedParams.append("page", params.page.toString());
  if (params.limit) encodedParams.append("limit", params.limit.toString());
  if (params.slug) encodedParams.append("slug", params.slug.toString());

  if (params.category)
    encodedParams.append("category", params.category.toString());
  if (params.brand) encodedParams.append("brand", params.brand.toString());
  if (params["inventory.stock_status"])
    encodedParams.append(
      "inventory.stock_status",
      params["inventory.stock_status"].toString(),
    );
  if (params.priceRange)
    encodedParams.append("priceRange", params.priceRange.toString());
  if (params.sort) encodedParams.append("sort", params.sort.toString());
  if (params.product_ids)
    encodedParams.append("product_ids", params.product_ids.toString());

  const encodedQuery = encodedParams.toString();
  const fullQuery = [encodedQuery, ...rawParams].filter(Boolean).join("&");

  return fullQuery ? `?${fullQuery}` : "";
};
