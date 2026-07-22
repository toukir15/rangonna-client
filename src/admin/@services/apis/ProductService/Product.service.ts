/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { MultipartApiIns } from "@admin/@config/multipartApi.Config";
import { queryStringMapper } from "@admin/utils";

export const productService = {
  getProductSuggestion: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product/product-suggestion` + queryStringMapper(queryParams),
    );
  },
  getProductShowroomSuggestion: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product/showroom-product-suggestion` + queryStringMapper(queryParams),
    );
  },

  getProductWholesaleGlobalSuggestion: async (
    queryParams?: any,
  ): Promise<any> => {
    return await apiIns.get(
      `/wholesale-product/wholesale-product-suggestion` +
        queryStringMapper(queryParams),
    );
  },

  updateProductItem: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/order/add-line-item/" + orderId, payload),

  productDelete: async (oId: any, payload: any): Promise<any> =>
    await apiIns.patch("/order/remove-line-item/" + oId, payload),

  updateProduct: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/order/" + orderId, payload),

  updatePathaoBooking: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/order/update-city-zone/" + orderId, payload),

  createPathaoBooking: async (payload: any): Promise<any> =>
    await apiIns.post("/courier-booking", payload),

  getProduct: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/product` + queryStringMapper(queryParams));
  },
  getProductCard: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/product/card` + queryStringMapper(queryParams));
  },
  getProductPriceList: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product/price-list` + queryStringMapper(queryParams),
    );
  },

  updateProductListProduct: async (eId: any, payload: any): Promise<any> =>
    await apiIns.patch("/product/" + eId, payload),

  getSingleProduct: async (eId?: any): Promise<any> => {
    return await apiIns.get(`/product/` + eId);
  },

  getPurchaseProductSuggestion: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product/purchase-product-suggestion` + queryStringMapper(queryParams),
    );
  },
  getOrderSuggestion: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order/order-return-list-suggestion` + queryStringMapper(queryParams),
    );
  },
  getAllOrderSuggestion: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order/order-suggestion` + queryStringMapper(queryParams),
    );
  },
  getProductWholesaleSuggestion: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/wholesale-product/wholesale-return-product-suggestion` +
        queryStringMapper(queryParams),
    );
  },
  getProductExternal: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product/external-sync-suggestion` + queryStringMapper(queryParams),
    );
  },

  createProduct: async (payload: any): Promise<any> => {
    return await MultipartApiIns.post("/product", payload);
  },

  // fetchProductReport: async (queryParams?: any): Promise<any> => {
  //   return await apiIns.get(
  //     `/product-stock-report` + queryStringMapper(queryParams)
  //   );
  // },
  fetchProductStockReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product-stock-report` + queryStringMapper(queryParams),
    );
  },
  fetchProductThisMonthReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product-stock-report/this-month` + queryStringMapper(queryParams),
    );
  },

  getProductReportStatus: async (pId?: any): Promise<any> => {
    return await MultipartApiIns.get(
      `/product-stock-report/warehouse-by-product/` + pId,
    );
  },

  editProduct: async (productId: any, payload: any): Promise<any> =>
    await MultipartApiIns.patch("/product/" + productId, payload),

  deleteProduct: async (brandId: string): Promise<any> =>
    await apiIns.delete("/product/" + brandId),

  getProductReview: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/review` + queryStringMapper(queryParams));
  },

  createReview: async (reviewId: string, payload: any): Promise<any> => {
    return await MultipartApiIns.post("/review/" + reviewId, payload);
  },

  updateProductReview: async (orderId: any, payload: any): Promise<any> =>
    await MultipartApiIns.patch("/review/" + orderId, payload),

  deleteProductReview: async (oId: any): Promise<any> =>
    await apiIns.delete("/review/" + oId),

  getGalleryImage: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/gallery` + queryStringMapper(queryParams));
  },

  deleteGalleryImage: async (ids: string[]): Promise<any> => {
    return await apiIns.delete("/gallery", {
      data: { ids },
    });
  },

  bulkUpdateSeo: async (payload: {
    is_seo: boolean;
    product_ids: string[];
  }): Promise<any> => {
    return await apiIns.patch("/product/bulk/seo-flag", payload);
  },

  // createGallery: async (payload: any): Promise<any> => {
  //   return await MultipartApiIns.post("/gallery", payload);
  // },
  // createGallery: async (
  //   payload: FormData,
  //   onUploadProgress?: (progressEvent: ProgressEvent) => void
  // ): Promise<any> => {
  //   return await MultipartApiIn.post("/gallery", payload, {
  //     onUploadProgress,
  //   });
  // },

  createGallery: async (
    payload: FormData,
    onUploadProgress?: (percent: number) => void,
  ): Promise<any> => {
    return await MultipartApiIns.post("/gallery", payload, {
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) return;
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        if (onUploadProgress) onUploadProgress(percent);
      },
    });
  },
};
