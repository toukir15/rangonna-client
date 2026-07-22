/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const BannerService = {
  getBanner: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/banner` + queryStringMapper(queryParams)
    );
  },

  createBanner: async (payload: any): Promise<any> =>
    await apiIns.post("/banner", payload),

  updateBanner: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/banner/" + accId, payload),
  getSingleBanner: async (accId: any): Promise<any> =>
    await apiIns.get("/banner/" + accId),

  deleteBanner: async (accId: string): Promise<any> =>
    await apiIns.delete("/banner/" + accId),

  createImageUrl: async (payload: any): Promise<any> =>
    await apiIns.post("/upload/upload-url", payload),

  /** Server-side upload — avoids browser CORS preflight to DigitalOcean Spaces. */
  uploadFileDirect: async (file: File, folder: string): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    return await apiIns.post("/upload/direct", formData);
  },
};
