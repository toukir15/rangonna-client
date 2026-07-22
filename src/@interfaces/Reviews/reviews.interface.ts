export interface IReviewImage {
  src: string;
  title?: string;
  alt?: string;
}

export interface IFeaturedImage {
  src: string;
  title?: string;
  alt?: string;
}

export interface IReviewProduct {
  _id: string;
  title: string;
  featured_image?: IFeaturedImage;
  product: {
    slug: string;
  };
}

export interface IReview {
  _id: string;
  rating: number; // 1-5
  customer: any; // or you can replace with ICustomer | null later
  product: IReviewProduct;

  headline: string;
  description: string;

  images: IReviewImage[];

  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface IRandomPickReview {
  reviewer_name: string;
  profile_url: string;
}

export interface IRandomPickReviewData {
  total_reviews: number;
  reviews: IRandomPickReview[];
}
