export interface IPageItem {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageContextType {
  pageData: IPageItem[];
  tableLoading: boolean;
  handleRemove: (id: string) => void;
  getPages: () => void;
}
