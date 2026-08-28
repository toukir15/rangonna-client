/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const ShopOccasionService = {
  getShopOccasions: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/shop-occasion` + queryStringMapper(queryParams));
  },

  createShopOccasion: async (payload: any): Promise<any> =>
    await apiIns.post("/shop-occasion", payload),

  updateShopOccasion: async (id: string, payload: any): Promise<any> =>
    await apiIns.patch("/shop-occasion/" + id, payload),

  updateShopOccasionImage: async (
    id: string,
    payload: { type: "mobile" | "desktop"; index: number; image: string }
  ): Promise<any> =>
    await apiIns.patch("/shop-occasion/" + id + "/item-image", payload),

  getSingleShopOccasion: async (id: any): Promise<any> =>
    await apiIns.get("/shop-occasion/" + id),

  deleteShopOccasion: async (id: string): Promise<any> =>
    await apiIns.delete("/shop-occasion/" + id),

  uploadFileDirect: async (file: File, folder: string): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    return await apiIns.post("/upload/direct", formData);
  },
};
