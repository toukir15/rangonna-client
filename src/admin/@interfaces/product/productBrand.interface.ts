export interface IProductBrandData {
  _id: string;
  key: string;
  value: string;
}

export interface ProductBrandContextType {
  productBrandData: IProductBrandData[];
  tableLoading: boolean;
  handleEditClick: (item: any) => void;
  handleRemove: (id: any) => void;
  modalMode: "create" | "edit" | string;
  items: IProductBrandData | any;
  setIsModalOpen: (isOpen: boolean) => void;
  fetchProductBrand: () => void;
  isModalOpen: boolean;
}
