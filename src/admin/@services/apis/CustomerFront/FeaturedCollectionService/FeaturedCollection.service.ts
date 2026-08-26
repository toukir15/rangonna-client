/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const FeaturedCollectionService = {
  getFeaturedCollections: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/featured-collection` + queryStringMapper(queryParams));
  },

  createFeaturedCollection: async (payload: any): Promise<any> =>
    await apiIns.post("/featured-collection", payload),

  updateFeaturedCollection: async (id: string, payload: any): Promise<any> =>
    await apiIns.patch("/featured-collection/" + id, payload),

  getSingleFeaturedCollection: async (id: any): Promise<any> =>
    await apiIns.get("/featured-collection/" + id),

  deleteFeaturedCollection: async (id: string): Promise<any> =>
    await apiIns.delete("/featured-collection/" + id),

  uploadFileDirect: async (file: File, folder: string): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    return await apiIns.post("/upload/direct", formData);
  },
};
