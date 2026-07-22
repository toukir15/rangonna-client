export interface IExpensesData {
  _id: string;
  title: string;
  sub_titles: string[]; // ✅ dynamic array of strings
  note: string;
  createdAt: string;
}

export interface PaginationMeta {
  total_record: number;
  total_page: number;
  page: string;
  limit: string;
}

export type ExpensesCategoryContextType = {
  expensesData: IExpensesData[];
  tableLoading: boolean;
  handleEditClick: (data: IExpensesData) => void;
  handleRemove: (id: string) => void;
  modalMode: "Add" | "Edit";
  items: IExpensesData | null;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isModalOpen: boolean;
  getExpensesCategory: () => void;
  isPriorityEditMode: boolean;
  setPriorityExpensesData: React.Dispatch<
    React.SetStateAction<IExpensesData[]>
  >;
  activeToggleLoading: any;
  toggleIsActive: any;
};
