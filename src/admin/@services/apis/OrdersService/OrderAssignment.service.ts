/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export type AvailabilityStatus = "offline" | "available" | "busy" | "break";

export interface IEmployeeAvailability {
  user_id?: string;
  status: AvailabilityStatus;
  max_orders?: number;
  active_order_count?: number;
  domains?: string[];
  last_heartbeat_at?: string | null;
  went_online_at?: string | null;
}

export interface IGoOnlinePayload {
  max_orders?: number;
  domains?: string[];
}

export interface INeedOrdersNotification {
  id: string;
  user_id: string;
  user_name: string;
  active_order_count: number;
  max_orders: number;
  domains?: string[];
  created_at: string;
  claimed_by?: string | null;
  claimed_by_name?: string | null;
  claimed_at?: string | null;
}

export interface IEmployeeAssignmentSnapshot {
  user_id: string;
  name: string;
  email: string;
  role: string;
  status: AvailabilityStatus;
  domains?: string[];
  active_order_count: number;
  max_orders: number;
  remaining_capacity: number;
}

export const OrderAssignmentService = {
  goOnline: async (payload?: IGoOnlinePayload): Promise<any> =>
    await apiIns.post("/order-assignment/online", payload || {}),

  goOffline: async (): Promise<any> =>
    await apiIns.post("/order-assignment/offline"),

  goBreak: async (): Promise<any> =>
    await apiIns.post("/order-assignment/break"),

  resume: async (): Promise<any> =>
    await apiIns.post("/order-assignment/resume"),

  heartbeat: async (): Promise<any> =>
    await apiIns.post("/order-assignment/heartbeat"),

  getMe: async (): Promise<any> =>
    await apiIns.get("/order-assignment/me"),

  getMyQueue: async (queryParams?: any): Promise<any> =>
    await apiIns.get(
      "/order-assignment/my-queue" + queryStringMapper(queryParams)
    ),

  unassign: async (orderId: string): Promise<any> =>
    await apiIns.post(`/order-assignment/unassign/${orderId}`),

  requestNeedOrders: async (): Promise<any> =>
    await apiIns.post("/order-assignment/need-orders"),

  listNeedOrdersNotifications: async (): Promise<any> =>
    await apiIns.get("/order-assignment/admin/need-orders"),

  claimNeedOrdersNotification: async (userId: string): Promise<any> =>
    await apiIns.post(`/order-assignment/admin/need-orders/${userId}/claim`),

  releaseNeedOrdersNotificationClaim: async (userId: string): Promise<any> =>
    await apiIns.post(`/order-assignment/admin/need-orders/${userId}/release`),

  listEmployees: async (): Promise<any> =>
    await apiIns.get("/order-assignment/admin/employees"),

  adminTransfer: async (payload: {
    from_user: string;
    to_user: string;
    quantity: number;
  }): Promise<any> =>
    await apiIns.post("/order-assignment/admin/transfer", payload),
};
