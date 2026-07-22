/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { MultipartApiIns } from "@admin/@config/multipartApi.Config";
import { queryStringMapper } from "@admin/utils";

export const BlogService = {
  getBlog: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/blog` + queryStringMapper(queryParams));
  },
  getSingleBlog: async (blogId: string): Promise<any> => {
    return await apiIns.get(`/blog/${blogId}`);
  },
  createBlog: async (payload: any): Promise<any> => {
    return await MultipartApiIns.post("/blog", payload);
  },
  updateBlog: async (blogId: string, payload: any): Promise<any> => {
    return await MultipartApiIns.patch(`/blog/${blogId}`, payload);
  },
  deleteBlog: async (brandId: string): Promise<any> =>
    await apiIns.delete("/blog/" + brandId),
};
