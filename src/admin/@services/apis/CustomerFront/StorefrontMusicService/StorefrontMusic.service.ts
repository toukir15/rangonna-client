/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";

export const StorefrontMusicService = {
  list: async (): Promise<any> => apiIns.get("/storefront-music"),
  create: async (payload: {
    title: string;
    src: string;
    is_active?: boolean;
  }): Promise<any> => apiIns.post("/storefront-music", payload),
  update: async (
    id: string,
    payload: { title?: string; src?: string; is_active?: boolean }
  ): Promise<any> => apiIns.patch(`/storefront-music/${id}`, payload),
  remove: async (id: string): Promise<any> =>
    apiIns.delete(`/storefront-music/${id}`),
};
