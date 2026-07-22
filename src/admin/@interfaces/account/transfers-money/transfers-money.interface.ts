export interface ITransaction {
  _id: string;
  amount: number;
  from_account: string;
  to_account: string;
  note: string;
  reference_no: string;
  user_id: string;
  createdAt: string;
}

interface Account {
  _id: string;
  account_name: string;
}

interface TransferMoneyItem {
  _id: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  from_account: Account;
  to_account: Account;
  reference_no: string;
  note: string;
  user_id: string;
}

export interface TransferMoneyContextType {
  transfersMoneyData: ITransaction[];
  tableLoading: boolean;
  handleEditClick: () => void;
  handleRemove: (id: any) => void;
  modalMode: "create" | "edit" | string;
  items: TransferMoneyItem | any;
  setIsModalOpen: (isOpen: boolean) => void;
  getTransferMoney: () => void | Promise<void>;
  isModalOpen: boolean;
  setItems: any;
}
