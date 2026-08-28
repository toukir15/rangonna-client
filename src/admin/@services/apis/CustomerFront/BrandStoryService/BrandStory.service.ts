import { apiIns } from "@admin/@config/api.config";

export const BrandStoryService = {
  getAll: async (): Promise<any> => apiIns.get("/brand-story"),
  create: async (payload: any): Promise<any> => apiIns.post("/brand-story", payload),
  update: async (id: string, payload: any): Promise<any> =>
    apiIns.patch(`/brand-story/${id}`, payload),
  uploadFileDirect: async (file: File, folder: string): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    return apiIns.post("/upload/direct", formData);
  },
};
