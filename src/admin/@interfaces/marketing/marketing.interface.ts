export interface IMarketingContext {
  marketingData: IMarketing[];
  tableLoading: boolean;
  handleEditClick: () => void;
  handleRemove: (id: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modalMode: "Add" | "Edit";
  items: IMarketing | null;
  getMarketingList: () => void;
  setItems: React.Dispatch<React.SetStateAction<IMarketing | null>>;
}

export interface IMarketing {
  _id: string;
  marketing_cost_bdt: number;
  marketing_cost_usd: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMarketingResponse {
  success: boolean;
  message: string;
  data: IMarketing[];
  meta: {
    total_record: number;
    total_page: number;
    page: number;
    limit: number;
  };
}
