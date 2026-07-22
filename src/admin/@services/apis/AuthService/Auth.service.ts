/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import {
  ILogin,
  ISignUp,
  IVerifyCode,
} from "@admin/@interfaces/auth/auth.interface";
import { queryStringMapper } from "@admin/utils";

export const AuthService = {
  login: async (payload: ILogin): Promise<any> =>
    await apiIns.post("/auth/login", payload),
  signup: async (payload: ISignUp): Promise<any> =>
    await apiIns.post("/auth/signup", payload),
  create_store: async (payload: any): Promise<any> =>
    await apiIns.post("/store", payload),
  verify_otp: async (payload: IVerifyCode): Promise<any> =>
    await apiIns.post("/otp/verify-otp", payload),
  getSuggestedDomain: async (queryParams?: any): Promise<any> => {
    await apiIns.get(
      `/store/subdomain-suggestion` + queryStringMapper(queryParams)
    );
  },
  resend_otp: async (payload: any): Promise<any> =>
    await apiIns.post("/otp/resend-otp", payload),
  master_user: async (payload: any): Promise<any> =>
    await apiIns.patch("/master-user", payload),
};
