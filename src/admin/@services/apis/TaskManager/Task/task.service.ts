import { apiIns } from "@admin/@config/api.config";
import { MultipartApiIns } from "@admin/@config/multipartApi.Config";
import { queryStringMapper } from "@admin/utils";

export const TaskService = {
  getTask: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/task` + queryStringMapper(queryParams));
  },
  getMyTask: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/task/my-task` + queryStringMapper(queryParams));
  },

  getTaskDetails: async (tid: any): Promise<any> =>
    await apiIns.get("/task/" + tid),

  getTaskNote: async (tid: any): Promise<any> =>
    await apiIns.get("/task/note/" + tid),

  getTaskStatus: async (tid: any): Promise<any> =>
    await apiIns.get("/task/status/" + tid),

  getTaskLogs: async (tid: any): Promise<any> =>
    await apiIns.get("/task-logs/" + tid),

  createTask: async (payload: any): Promise<any> =>
    await MultipartApiIns.post("/task", payload),

  updateTask: async (brandId: string, payload: any): Promise<any> =>
    await MultipartApiIns.patch("/task/" + brandId, payload),

  deleteTask: async (brandId: string): Promise<any> =>
    await apiIns.delete("/task/" + brandId),

  getAssignEmploy: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/user/user-suggestion` + queryStringMapper(queryParams)
    );
  },
  getAssignEmploySuggestion: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/user/suggestions` + queryStringMapper(queryParams)
    );
  },

  createNotes: async (brandId: string, payload: any): Promise<any> =>
    await apiIns.patch("/task/note/" + brandId, payload),

  taskStatusUpdate: async (tid: any, payload: any): Promise<any> =>
    await apiIns.patch("/task/status/" + tid, payload),
};
