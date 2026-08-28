import { apiIns } from "@admin/@config/api.config";

export const InstagramGalleryService = {
  getAll: async (): Promise<any> => apiIns.get("/instagram-gallery"),
  create: async (payload: any): Promise<any> => apiIns.post("/instagram-gallery", payload),
  update: async (id: string, payload: any): Promise<any> =>
    apiIns.patch(`/instagram-gallery/${id}`, payload),
  updateImage: async (id: string, index: number, image: string): Promise<any> =>
    apiIns.patch(`/instagram-gallery/${id}/item-image`, { index, image }),
  uploadFileDirect: async (file: File, folder: string): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    return apiIns.post("/upload/direct", formData);
  },
};
