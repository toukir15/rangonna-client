/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const FraudDetectionService = {
  getFraudDetectionLists: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/fraud-detection-logs` + queryStringMapper(queryParams),
    );
  },
  approveFraudDetection: async (trsId: string, payload: any): Promise<any> => {
    return await apiIns.patch(
      `/fraud-detection-logs/approval/` + trsId,
      payload,
    );
  },
};
