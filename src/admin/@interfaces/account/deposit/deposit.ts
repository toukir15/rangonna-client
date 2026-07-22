export interface IDeposit {
  _id: string;
  warehouse: {
    _id: string;
    title: string;
  };
  account: {
    _id: string;
    account_name: string;
  };
  deposit_category: {
    _id: string;
    title: string;
  };
  customer_id: string;
  user_id: string;
  amount: number;
  note: string;
  reference_no: string;

  createdAt: string;
  updatedAt: string;
  user: any;
}

export interface DepositContextType {
  deposit: IDeposit[];
  tableLoading: boolean;
  handleEditClick: (item: any) => void;
  handleRemove: (id: any) => void;
  modalMode: "create" | "edit" | string;
  items: IDeposit | any;
  setIsModalOpen: (isOpen: boolean) => void;
  getDeposit: () => void;
  isModalOpen: boolean;
}
