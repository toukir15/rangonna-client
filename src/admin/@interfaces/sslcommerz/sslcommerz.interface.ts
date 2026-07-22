export interface ISslcommerzTransaction {
  status: string;
  tran_date: string;
  tran_id: string;
  amount: string;
}

export interface ISslcommerzTransactionResponse {
  success: boolean;
  message: string;
  data: ISslcommerzTransaction;
}
