/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const CustomerLoveService = {
  getCustomerLoves: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/customer-love` + queryStringMapper(queryParams));
  },

  createCustomerLove: async (payload: any): Promise<any> =>
    await apiIns.post("/customer-love", payload),

  updateCustomerLove: async (id: string, payload: any): Promise<any> =>
    await apiIns.patch("/customer-love/" + id, payload),

  getSingleCustomerLove: async (id: any): Promise<any> =>
    await apiIns.get("/customer-love/" + id),

  deleteCustomerLove: async (id: string): Promise<any> =>
    await apiIns.delete("/customer-love/" + id),

  uploadFileDirect: async (file: File, folder: string): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    return await apiIns.post("/upload/direct", formData);
  },
};
