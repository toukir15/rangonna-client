/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const TeamService = {
  getPermission: async ({ searchTerm, page, limit }: any): Promise<any> => {
    return await apiIns.get(
      `/permission?searchTerm=${searchTerm}&page=${page}&limit=${limit}`
    );
  },
  getPermissionSuggestion: async (): Promise<any> => {
    return await apiIns.get(
      `/permission/suggestions`
    );
  },
  createPermission: async (payload: any): Promise<any> =>
    await apiIns.post("/permission", payload),
  permissionDelete: async (permissionId: string): Promise<any> =>
    await apiIns.delete("/permission/" + permissionId),
  updatePermission: async (permissionId: string, payload: any): Promise<any> =>
    await apiIns.patch("/permission/" + permissionId, payload),
  getPermissionById: async (permissionId: string): Promise<any> =>
    await apiIns.get("/permission/" + permissionId),

  //team path
  getUsers: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/user` + queryStringMapper(queryParams));
  },

  createTeam: async (payload: any): Promise<any> =>
    await apiIns.post("/user", payload),

  updateTeam: async (permissionId: any, payload: any): Promise<any> =>
    await apiIns.patch("/user/" + permissionId, payload),

  updateTeamStatus: async (supId: string, payload: any): Promise<any> =>
    await apiIns.patch("/user/status/" + supId, payload),

  getUserById: async (eId: any): Promise<any> =>
    await apiIns.get("/user/" + eId),

  getWarehouseUserSuggestions: async (queryParams?: any): Promise<any> =>
    await apiIns.get(
      `/user/warehouse-user-suggestions` + queryStringMapper(queryParams),
    ),

  teamDelete: async (permissionId: any): Promise<any> =>
    await apiIns.delete("/user/" + permissionId),

  updatePassword: async (payload: any): Promise<any> =>
    await apiIns.patch("/user/change-password", payload),
};
