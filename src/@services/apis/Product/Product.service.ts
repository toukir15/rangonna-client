import { apiIns } from "@/@config/api.config";
import { ENV } from "@/@config/env.config";
import { multipartApiIns } from "@/@config/multipartApi.config";
import { queryStringMapper } from "@/@services/utils";

export const ProductService = {
  // getProduct: async (queryParams?: any): Promise<any> => {
  //   return await apiIns.get("/product" + queryStringMapper(queryParams));
  // },
  getProduct: async (queryParams?: any): Promise<any> => {
    const updatedParams = {
      ...queryParams,
    };

    return await apiIns.get(
      "/naviforce-product" + queryStringMapper(updatedParams),
    );
  },

  getSingleProduct: async (slug: string): Promise<any> => {
    return await apiIns.get("/naviforce-product/" + encodeURIComponent(slug));
  },

  getMoreWatches: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      "/naviforce-product/related-products/" + encodeURIComponent(queryParams),
    );
  },

  getProductWithCategory: async (queryParams?: any): Promise<any> => {
    const updatedParams = {
      ...queryParams,
    };
    return await apiIns.get(
      "/naviforce-product" + queryStringMapper(updatedParams),
    );
  },

  createOrder: async (payload: any): Promise<any> => {
    return await apiIns.post("/order", payload);
  },

  applyCoupon: async (payload: any): Promise<any> => {
    return await apiIns.post("/coupon/apply", payload);
  },

  applyDuplicate: async (payload: any): Promise<any> => {
    return await apiIns.post("/order/check-duplicate", payload);
  },

  getSearchGlobal: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      "/naviforce-product/global-search" + queryStringMapper(queryParams),
    );
  },

  applyInComplete: async (payload: any): Promise<any> => {
    return await apiIns.post("/incomplete-order", payload);
  },

  createNotify: async (payload: any): Promise<any> =>
    await apiIns.post("/stock-notify", payload),

  fetchOtp: async (payload: any): Promise<any> => {
    return await apiIns.post("/otp/send-otp", payload);
  },

  verifyOtp: async (payload: any): Promise<any> => {
    return await apiIns.post("/otp/verify-otp", payload);
  },

  fetchOrderOtp: async (payload: any): Promise<any> => {
    return await apiIns.post("/otp/order-otp", payload);
  },

  verifyOrderOtp: async (payload: any): Promise<any> => {
    return await apiIns.post("/otp/verify-order-otp", payload);
  },

  getUser: async (): Promise<any> => {
    return await apiIns.get(`/customer`);
  },

  getOrderHistory: async (): Promise<any> => {
    return await apiIns.get("/order/order-history");
  },

  getPriceRange: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      "/naviforce-product/price-range" + queryStringMapper(queryParams),
    );
  },

  logOut: async (): Promise<any> => {
    return await apiIns.post("/auth/logout");
  },

  updateProfile: async (payload: any): Promise<any> =>
    await apiIns.patch("/customer/", payload),

  getReview: async (pId?: any): Promise<any> => {
    return await apiIns.get("/review/" + pId);
  },

  createReview: async (reviewId: string, payload: any): Promise<any> => {
    return await multipartApiIns.post("/review/" + reviewId, payload);
  },

  createBkashPayment: async (payload: any): Promise<any> => {
    return await apiIns.post("/bkash/checkout", payload);
  },
  createBkashCallBack: async (payload: any): Promise<any> => {
    return await apiIns.post("/bkash/callback", payload);
  },

  createSslCommerzPayment: async (payload: any): Promise<any> => {
    return await apiIns.post("/sslcommerz/checkout", payload);
  },

  validateSslCommerzPayment: async (payload: {
    orderId: string;
    val_id: string;
  }): Promise<any> => {
    return await apiIns.get(
      `/sslcommerz/validate?orderId=${encodeURIComponent(
        payload.orderId,
      )}&val_id=${encodeURIComponent(payload.val_id)}`,
    );
  },

  getOrderByIdPublic: async (orderId: string): Promise<any> => {
    return await apiIns.get(`/order/${orderId}`);
  },

  getUpdatePrice: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      "/naviforce-product/cart-product-sale-price" +
        queryStringMapper(queryParams),
    );
  },

  getReviews: async (queryParams?: any): Promise<any> => {
    return await apiIns.get("/review" + queryStringMapper(queryParams));
  },

  getRandomPickReviews: async (): Promise<any> => {
    return await apiIns.get("/review/random-pick");
  },

  getCampaignPage: async (slugOrId?: string): Promise<any> => {
    const key = String(slugOrId ?? "").trim();
    if (!key) return { success: false, data: null };

    return await apiIns.get(`/campaign-page/${encodeURIComponent(key)}`);
  },

  getSingleLanding: async (eId?: any): Promise<any> => {
    return await apiIns.get(`/landing-page/` + eId);
  },

  getBlog: async (queryParams?: any): Promise<any> => {
    return await apiIns.get("/blog" + queryStringMapper(queryParams));
  },
  getSingleBlog: async (routeParam?: string): Promise<any> => {
    const key = String(routeParam ?? "").trim();
    if (!key) return { success: false, data: null };

    type ApiPayload = { success?: boolean; data?: unknown };
    const primary = (await apiIns.get(
      `/blog/${encodeURIComponent(key)}`,
    )) as ApiPayload;
    if (primary?.success !== false && primary?.data) return primary;

    if (/^[a-f\d]{24}$/i.test(key)) {
      try {
        const byQuery = (await apiIns.get(
          `/blog?id=${encodeURIComponent(key)}`,
        )) as ApiPayload;
        if (byQuery?.success !== false && byQuery?.data) return byQuery;
      } catch {
        /* list fallback in fetchBlogRawByRouteParam */
      }
    }

    return primary;
  },
};
