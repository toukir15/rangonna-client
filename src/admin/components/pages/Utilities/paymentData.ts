import { SelectOption } from "@admin/@interfaces/common.interface";

export const allPaymentMethodOptions = [
  { value: "bkash", label: "Bkash" },
  { value: "cash", label: "Cash" },
  { value: "pos-dbbl", label: "Pos Dbbl" },
  { value: "pos-city", label: "Pos City" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "sslcommerz", label: "SSL Commerz" },
  { value: "bank-transfer", label: "Bank Transfer" },
];

export const depositSourceOptions = [
  { value: "order-payment", label: "Order Payment" },
  { value: "showroom-payment", label: "Showroom Payment" },
  { value: "courier-payment", label: "Courier Payment" },
  { value: "customer-payment", label: "Customer Payment" },
  { value: "purchase-return-payment", label: "Purchase Return Payment" },
  { value: "report-issue-payment", label: "Report Issue Payment" },
  { value: "wholesale-order-payment", label: "Wholesale Order payment" },
];

export const expenseSourceOptions = [
  { value: "manual", label: "Manual" },
  { value: "purchase-payment", label: "Purchase Payment" },
  { value: "salary-payment", label: "Salary Payment" },
  { value: "showroom-payment", label: "Showroom Payment" },
  { value: "holiday-salary-payment", label: "Holiday Salary Payment" },
  { value: "advance-salary-payment", label: "Advance Salary Payment" },
  { value: "order-refund-payment", label: "Order Refund payment" },
];

export const userRoleOptions = [
  { value: "super-admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "call-center", label: "Call Center" },
  { value: "team-leader", label: "Team Leader" },
  { value: "messaging", label: "Messaging" },
  { value: "packaging", label: "Packaging" },
  { value: "showroom", label: "Showroom" },
];
export const userStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "In Active" },
];
export const stockOptions = [{ value: "stock-out", label: "Stock Out" }];

export enum ExpenseSource {
  MANUAL = "manual",
  HOLIDAY_SALARY_PAYMENT = "holiday-salary-payment",
  ADVANCE_SALARY_PAYMENT = "advance-salary-payment",
  PURCHASE_PAYMENT = "purchase-payment",
  SALARY_PAYMENT = "salary-payment",
  SHOWROOM_PAYMENT = "showroom-payment",
}

export const allSourceOptions = [
  { value: "showroom", label: "Showroom" },
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "Whatsapp" },
  { value: "incomplete", label: "Incomplete" },
  { value: "website", label: "Website" },
  { value: "phone", label: "Phone" },
];

export const priorityOption = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "High",
    value: "high",
  },
  {
    label: "Medium",
    value: "medium",
  },
  {
    label: "Low",
    value: "low",
  },
];

export const reasonOptions: SelectOption[] = [
  { label: "প্রোডাক্ট পছন্দ হয়নি", value: "not_liked" },
  { label: "প্রোডাক্ট ড্যামেজ", value: "damaged" },
  { label: "দামের অমিল", value: "price_mismatch" },
  { label: "স্টক নেই", value: "out_of_stock" },
  {
    label: "ডেলিভারি/সার্ভিস চার্জ সংক্রান্ত সমস্যা",
    value: "delivery_charge_issue",
  },
];
