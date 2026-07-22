/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { CreateCourierPayload } from "@admin/@interfaces/couriers/couriers.interface";

export const CourierService = {
  getCouriers: async (courierType: string): Promise<any> =>
    await apiIns.get("/courier", { params: { courierType } }),

  createCourier: async (payload: CreateCourierPayload): Promise<any> =>
    await apiIns.post("/courier", payload),

  deleteCourier: async (id: string): Promise<any> =>
    await apiIns.delete("/courier/" + id),

  // getPathaoCity: async ({ payload }: { payload: string }) => {
  //   return await apiIns.get(`/pathao/pathao-city?address=${payload}`);
  // },

  getPathaoCity: async (): Promise<any> =>
    await apiIns.get("/pathao/city-list"),

  getPathaoZone: async (cID: string): Promise<any> =>
    await apiIns.get("/pathao/zone-list/" + cID),

  getPathaoZones: async ({ searchTerm }: { searchTerm: string }) => {
    return await apiIns.get(`/pathao/pathao-zone?zone_name=${searchTerm}`);
  },
  createBooking: async (oID: string): Promise<any> =>
    await apiIns.post("/courier-booking/" + oID),

  getPathao: async () => {
    return await apiIns.get(`/pathao`);
  },

  createPathao: async (payload: any): Promise<any> =>
    await apiIns.post("/pathao", payload),

  updateCourier: async (pId: any, payload: any): Promise<any> =>
    await apiIns.patch("/pathao/" + pId, payload),

  getStore: async (): Promise<any> => {
    return await apiIns.get(`/pathao
`);
  },

  updateStore: async (pId: any, payload: any): Promise<any> =>
    await apiIns.patch("/pathao/" + pId, payload),

  getStorePathao: async (cID: string): Promise<any> =>
    await apiIns.get("/pathao/store/" + cID),

  updateStorePathao: async (pId: any, payload: any): Promise<any> =>
    await apiIns.patch("/courier/" + pId, payload),

  deletePathao: async (accId: string): Promise<any> =>
    await apiIns.delete("/pathao/" + accId),

  getSteadfast: async (): Promise<any> => await apiIns.get("/steadfast"),

  createSteadfast: async (payload: any): Promise<any> =>
    await apiIns.post("/steadfast", payload),

  updateSteadfast: async (pId: any, payload: any): Promise<any> =>
    await apiIns.patch("/steadfast/" + pId, payload),

  deleteSteadfast: async (accId: string): Promise<any> =>
    await apiIns.delete("/steadfast/" + accId),
};
