export interface Suggestion {
  sysId: number;
  orderID: string;
  customerName: string;
}
export enum RoleEnum {
  SUPER_ADMIN = "super-admin",
  ADMIN = "admin",
  CALL_CENTER = "call-center",
  TEAM_LEADER = "team-leader",
  MESSAGING = "messaging",
  PACKAGING = "packaging",
  SHOWROOM = "showroom",
}

export interface ISideBarItems {
  href?: string;
  label?: string;
  icon?: string;
  submenu?: any[];
  mainSubLink?: boolean;
  role?: RoleEnum[];
}

export interface SidebarItemProps {
  item: ISideBarItems;
  activeSubMenu: string | null;
  activeItem: string;
  setActiveItem: (label: string) => void;
  setActiveSubMenu: React.Dispatch<React.SetStateAction<string | null>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export interface GlobalSearchInputProps {
  searchId: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  showSuggestions: boolean;
  filteredSuggestions: Suggestion[];
  handleSuggestionClick: (suggestion: Suggestion) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  suggestionBoxRef: React.RefObject<HTMLDivElement>;
}

export interface NotificationProps {
  iconName: string;
  notificationsText: string;
  showNotifications: boolean;
  setShowNotifications: (state: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

export interface UserInfoModalProps {
  showUserDropdown: boolean;
  setShowUserDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  showAlert: () => void;
  userLogo: string | any;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface IWebsiteOption {
  value: string;
  label: string;
}

export interface IBaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface IFeaturedImage {
  src: string;
  title: string;
  alt: string;
}

export interface IInventory {
  stock_quantity: number;
  low_stock_notify: number | null;
  stock_status: "in-stock" | "out-of-stock" | string;
  manage_stock: boolean;
  sold_quantity: number;
}

export interface IPricing {
  sale_price: number;
  regular_price: number;
  purchase_price: number;
}

export interface IProductSuggestion {
  _id: string;
  product_id: string;
  title: string;
  featured_image: IFeaturedImage;
  inventory: IInventory;
  pricing: IPricing;
}

export interface IProductSuggestionResponse {
  success: boolean;
  message: string;
  data: IProductSuggestion[];
}

// ---------- Single website ----------
export interface IWebsiteResponse {
  _id: string;
  web_url: string;
  web_name: string;
  createdAt: string;
  __v: number;
}

export interface IWebsiteMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface IWebsiteData {
  data: IWebsiteResponse[];
  meta: IWebsiteMeta;
}

export interface IWebsiteResponse {
  success: boolean;
  message: string;
  data: IWebsiteData;
}

export interface IWebsiteRes {
  success: boolean;
  message: string;
  data: IWebsiteResponse[];
}
