export interface IProductBrandData {
  _id: string;
  key: string;
  value: string;
}

export interface ProductReviewContextType {
  productReviewData: IReview[];
  tableLoading: boolean;
  handleEditClick: (item: any) => void;
  handleRemove: (id: any) => void;
  modalMode: "create" | "edit" | string;
  items: IProductBrandData | any;
  setIsModalOpen: (isOpen: boolean) => void;
  fetchProductReview: () => void;
  isModalOpen: boolean;
  handleImageClick: any;
}

export interface IReviewResponse {
  success: boolean;
  message: string;
  data: IReview[];
  meta: IMeta;
}

export interface IMeta {
  total_record: number;
  total_page: number;
  page: string;
  limit: string;
}
export interface IUser {
  _id: string;
  name: string;
}

export interface IReview {
  _id: string;
  rating: number;
  customer: ICustomer;
  user?: IUser;
  product: IProduct;
  headline: string;
  description: string;
  images: IReviewImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ICustomer {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface IProduct {
  _id: string;
  title: string;
  featured_image: IFeaturedImage;
}

export interface IFeaturedImage {
  src: string;
  title: string;
  alt: string;
}

export interface IReviewImage {
  src: string;
  title: string;
  alt: string;
}
