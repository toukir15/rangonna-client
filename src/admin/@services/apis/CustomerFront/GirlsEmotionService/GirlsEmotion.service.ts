import { apiIns } from "@admin/@config/api.config";

export const GirlsEmotionService = {
  getAll: async (): Promise<any> => apiIns.get("/girls-emotion"),
  create: async (payload: any): Promise<any> => apiIns.post("/girls-emotion", payload),
  update: async (id: string, payload: any): Promise<any> =>
    apiIns.patch(`/girls-emotion/${id}`, payload),
  updateImage: async (
    id: string,
    payload: { type: "mobile" | "desktop"; index: number; image: string }
  ): Promise<any> => apiIns.patch(`/girls-emotion/${id}/item-image`, payload),
  uploadFileDirect: async (file: File, folder: string): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    return apiIns.post("/upload/direct", formData);
  },
};
