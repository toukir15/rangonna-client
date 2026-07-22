import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const ProjectService = {
  getProject: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/project` + queryStringMapper(queryParams));
  },

  createProject: async (payload: any): Promise<any> =>
    await apiIns.post("/project", payload),

  updateProject: async (brandId: string, payload: any): Promise<any> =>
    await apiIns.patch("/project/" + brandId, payload),

  deleteProject: async (brandId: string): Promise<any> =>
    await apiIns.delete("/project/" + brandId),
};
