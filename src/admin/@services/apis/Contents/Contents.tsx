/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const ContentsService = {
  getContents: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/page-content` + queryStringMapper(queryParams));
  },
  getContentById: async (contentId: string): Promise<any> =>
    await apiIns.get("/page-content/" + contentId),
  createContents: async (payload: any): Promise<any> =>
    await apiIns.post("/page-content", payload),

  updateContents: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/page-content/" + accId, payload),

  updateContentsPriority: async (payload: any): Promise<any> =>
    await apiIns.patch("/page-content/priority", payload),

  deleteContents: async (accId: string): Promise<any> =>
    await apiIns.delete("/page-content/" + accId),
};
