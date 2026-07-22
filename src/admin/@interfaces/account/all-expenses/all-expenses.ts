export interface IAllExpense {
  _id: string;
  warehouse: {
    _id: string;
    title: string;
  };
  account: {
    _id: string;
    account_name: string;
  };
  expense_category: {
    _id: string;
    title: string;
  };
  user_id: string;
  amount: number;
  note: string;
  reference_no: string;
  createdAt: string;
}

export interface IExpenseWarehouse {
  _id: string;
  title: string;
}

export interface IExpenseCategory {
  _id: string;
  title: string;
}

export interface IExpenseUser {
  _id: string;
  name: string;
}

export interface IExpense {
  _id: string;
  warehouse: IExpenseWarehouse;
  account: {
    _id: string;
    account_name: string;
  } | null;
  expense_category: IExpenseCategory;
  expense_sub_title: string;
  user_id: string;
  amount: number;
  note: string;
  reference_no: string;
  createdAt: string;
  updatedAt: string;
  user: IExpenseUser;
  payment_method: string;
  source: string;
}

export interface IExpenseMeta {
  total_record: number;
  total_page: number;
  page: number | string;
  limit: number | string;
}

export interface IExpenseData {
  data: IExpense[];
  meta: IExpenseMeta;
}

export interface IExpenseResponse {
  success: boolean;
  message: string;
  data: IExpenseData;
}
