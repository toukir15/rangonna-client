export interface IDepositCategoryData {
  _id: string;
  title: string;
  note: string;
  createdAt: string;
}

export interface PaginationMeta {
  total_record: number;
  total_page: number;
  page: string;
  limit: string;
}

export type DepositCategoryContextType = {
  depositCategoryData: IDepositCategoryData[];
  tableLoading: boolean;
  handleEditClick: (data: IDepositCategoryData) => void;
  handleRemove: (id: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modalMode: "Add" | "Edit";
  items: IDepositCategoryData | null;
  getDepositCategory: () => void;
  isPriorityEditMode: boolean;
  setPriorityDepositCategoryData: React.Dispatch<
    React.SetStateAction<IDepositCategoryData[]>
  >;
  activeToggleLoading: any;
  toggleIsActive: any;
};
