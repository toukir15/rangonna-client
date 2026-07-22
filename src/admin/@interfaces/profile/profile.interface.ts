export interface IUser {
  id: number;
  name: string;
  email: string;
  wooCommerce: number;
  role: "team" | "admin" | "customer";
}
