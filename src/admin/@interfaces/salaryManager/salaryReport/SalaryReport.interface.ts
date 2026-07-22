export interface ISalaryContext {
  salaryData: ISalary[];
  tableLoading: boolean;
  handleEditClick: () => void;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modalMode: "Add" | "Edit";
  items: ISalary | null;
  getSalaryReport: () => void;
  setItems: React.Dispatch<React.SetStateAction<ISalary | null>>;
  handleStatusUpdate: (id: string) => void;
  handleRemove: (id: string) => void;
}

export enum SalaryStatusEnum {
  PAID = "paid",
  UNPAID = "unpaid",
}

export interface IEmployeeShort {
  _id: string;
  name: string;
  phone: string;
}

// export interface ISalary {
//   _id: string;
//   employee: IEmployeeShort;
//   month: string;
//   base_salary: number;
//   working_days: number;
//   leave_days: number;
//   absent_days: number;
//   late_count: number;
//   bonus?: number;
//   advance_taken?: number;
//   status: SalaryStatusEnum;
//   createdAt: string;
//   updatedAt: string;
// }

export interface IMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export type SalaryStatus = "paid" | "unpaid";

export interface IEmployeeMini {
  _id: string;
  name: string;
  phone: string;
}

export interface ISalaryDeductions {
  absent_deduction: number;
  late_penalty: number;
  advance_taken: number;
  total_deductions: number;
}

export interface ISalaryEarnings {
  base_salary: number;
  daily_salary_rate: number;
  working_days_salary: number;
  leave_days_salary: number;
  bonus: number;
  total_earnings: number;
}
export interface ISalaryDetails {
  month: string; // e.g. "2025-12"
  days_in_month: number;
  standard_working_days: number;
  earnings: ISalaryEarnings;
  deductions: ISalaryDeductions;
  net_salary: number;
}

export interface IAccount {
  _id: string;
  account_no: string;
  account_name: string;
}
export interface ISalary {
  _id: string;
  account: IAccount;
  additional_bonus: number;
  final_salary: number;

  employee: IEmployeeMini;

  month: string; // "YYYY-MM"
  base_salary: number;

  working_days: number;
  leave_days: number;
  absent_days: number;
  late_count: number;

  bonus: number;
  status: SalaryStatus;

  advance_taken: number;

  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string

  details: ISalaryDetails;
}

export interface IPaginationMeta {
  total_record: number;
  total_page: number;
  page: number | string;
  limit: number | string;
}
export interface ISalaryListData {
  data: ISalary[];
  meta: IMeta;
}

export interface ISalaryListResponse {
  success: boolean;
  message: string;
  data: ISalaryListData;
}
