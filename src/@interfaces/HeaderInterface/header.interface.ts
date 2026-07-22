export interface ICartItem {
  id: string;
  sku: string;
  title: string;
  brand: string;
  image: string;
  price: number;
  quantity: number;
  max_quantity: number;
  categories: string[];
}

export interface ISuggestion {
  _id: string;
  sku: string;
  slug: string;
  title: string;
  featured_image?: { src: string; title?: string };
  pricing?: { regular_price: number; sale_price: number };
}
