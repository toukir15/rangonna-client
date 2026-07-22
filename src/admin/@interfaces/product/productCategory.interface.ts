/* eslint-disable no-unused-vars */
export interface IProductCategoryData {
  _id: string;
  key: string;
  value: string;
}

export interface ProductCategoryContextType {
  productCategoryData: IProductCategoryData[];
  tableLoading: boolean;
  handleEditClick: (item: any) => void;
  handleRemove: (id: any) => void;
  modalMode: "create" | "edit" | string;
  items: IProductCategoryData | any;
  setIsModalOpen: (isOpen: boolean) => void;
  fetchProductCategory: () => void;
  isModalOpen: boolean;
}

export interface IProductCategoriesResponse {
  success: boolean;
  message: string;
  data: IProductCategoriesData;
}

export interface IProductCategoriesData {
  data: IProductCategory[];
  meta: IMeta;
}

export interface IProductCategory {
  _id: string;
  key: string;
  value: string;
}

export interface IMeta {
  total_record: number;
  total_page: number;
  page: number | string;
  limit: number | string;
}
