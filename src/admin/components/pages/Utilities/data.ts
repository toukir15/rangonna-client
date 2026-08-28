import { ISideBarItems, RoleEnum } from "@admin/@interfaces/common.interface";

import {
  ACCOUNTS,
  COURIERS,
  DASHBOARD,
  PRODUCTS,
  TEAM,
} from "@admin/utils/path-name";

export const dateOptions = [
  { value: "last24hours", label: "Last 24 Hours" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "thismonth", label: "This Month" },
  { value: "lastmonth", label: "Last Month" },
  { value: "thisyear", label: "This Year" },
  { value: "", label: "Max" },
];

export const CourierOptions = [
  { value: "All", label: "All Couriers" },
  { value: "Pathao", label: "Pathao" },
  { value: "SteadFast", label: "SteadFast" },
];

export const sideBarItems: ISideBarItems[] = [
  {
    href: DASHBOARD,
    label: "Dashboard",
    icon: "grid_view",
    mainSubLink: true,
    role: [
      RoleEnum.SUPER_ADMIN,
      RoleEnum.ADMIN,
      RoleEnum.TEAM_LEADER,
      RoleEnum.CALL_CENTER,
      RoleEnum.MESSAGING,
      RoleEnum.PACKAGING,
    ],
    submenu: [
      {
        href: "/admin/dashboard/all",
        label: "All Order",
        icon: "list_alt",
      },
      {
        href: "/admin/dashboard/summary",
        label: "Summary",
        icon: "list_alt",
      },
    ],
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: "shopping_cart",
    mainSubLink: true,
    submenu: [
      {
        href: "/admin/orders/all-order",
        label: "All Order",
        icon: "list_alt",
      },
      {
        href: "/admin/orders/incompleate",
        label: "Incompleate",
        icon: "shopping_cart_checkout",
      },
      {
        href: "/admin/orders/return",
        label: "Return",
        icon: "reply_all",
      },
      {
        href: "/admin/orders/refund",
        label: "Refund & Exchange",
        icon: "assignment_return",
      },
      {
        href: "/admin/orders/wholesale-return",
        label: "Wholesale Return",
        icon: "low_priority",
      },
      {
        href: "/admin/orders/sms",
        label: "SMS",
        icon: "sms",
      },
    ],
  },

  {
    href: "/admin/contents",
    label: "Contents",
    icon: "content_paste",
    mainSubLink: false,
  },
  {
    href: "/admin/fulfillment",
    label: "Fulfillment",
    icon: "inventory_2",
    mainSubLink: false,
  },

  {
    href: COURIERS,
    label: "Couriers",
    icon: "local_shipping",
    mainSubLink: true,
    submenu: [
      {
        href: "/admin/couriers/booking",
        label: "Booking",
        icon: "inventory",
      },
      {
        href: "/admin/couriers/report",
        label: "Report",
        icon: "bar_chart",
      },
      {
        href: "/admin/couriers/setting",
        label: "Setting",
        icon: "settings",
      },
    ],
  },

  {
    href: "/admin/customer",
    label: "Customer",
    icon: "list_alt",
    mainSubLink: true,
    submenu: [
      {
        href: "/admin/customer/all",
        label: "All Customers",
        icon: "clear_all",
      },
      {
        href: "/admin/customer/repeat",
        label: "Repeat",
        icon: "autorenew",
      },
      {
        href: "/admin/customer/monthly",
        label: "Monthly",
        icon: "calendar_month",
      },
    ],
  },

  {
    href: ACCOUNTS,
    label: "Account",
    icon: "account_balance",
    mainSubLink: true,
    submenu: [
      {
        href: "/admin/account/accounts",
        label: "Accounts List",
        icon: "fact_check",
      },
      {
        href: "/admin/account/balance-sheet",
        label: "Balance Sheet",
        icon: "paid",
      },
      {
        href: "/admin/account/expense",
        label: "Expenses",
        icon: "diamond",
      },
      {
        href: "/admin/account/deposit",
        label: "Deposit",
        icon: "local_atm",
      },
      {
        href: "/admin/account/deposit-report",
        label: "Deposit Report",
        icon: "currency_exchange",
      },
      {
        href: "/admin/account/expense-report",
        label: "Expense Report",
        icon: "explore",
      },
      {
        href: "/admin/account/expense-category",
        label: "Expense Category",
        icon: "receipt",
      },
      {
        href: "/admin/account/deposit-category",
        label: "Deposit Category",
        icon: "request_page",
      },
    ],
  },
  {
    href: "/admin/payment-report",
    label: "Payment Report",
    icon: "payments",
    mainSubLink: true,
    submenu: [
      {
        href: "/admin/payment-report/summary",
        label: "Summary",
        icon: "receipt",
      },
      {
        href: "/admin/payment-report/method-summary",
        label: "Method Summary",
        icon: "fact_check",
      },
    ],
  },

  {
    href: "/admin/purchase",
    label: "Purchase",
    icon: "shopping_bag",
    mainSubLink: true,
    submenu: [
      {
        href: "/admin/purchase/purchase",
        label: "Purchase",
        icon: "list_alt",
      },
      {
        href: "/admin/purchase/return",
        label: "Return",
        icon: "low_priority",
      },
      {
        href: "/admin/purchase/supplier",
        label: "Supplier",
        icon: "open_with",
      },
      {
        href: "/admin/purchase/supplier-report",
        label: "Supplier Report",
        icon: "support",
      },
    ],
  },

  {
    href: PRODUCTS,
    label: "Product",
    icon: "library_books",
    mainSubLink: true,
    submenu: [
      {
        href: "/admin/product/products",
        label: "Products",
        icon: "dataset",
      },
      {
        href: "/admin/product/pricing",
        label: "Pricing",
        icon: "attach_money",
      },
      {
        href: "/admin/product/report",
        label: "Report",
        icon: "topic",
      },
      {
        href: "/admin/product/stock-logs",
        label: "Stock Logs",
        icon: "history_toggle_off",
      },
      {
        href: "/admin/product/category",
        label: "Category",
        icon: "topic",
      },
      {
        href: "/admin/product/reviews",
        label: "Reviews",
        icon: "reviews",
      },
      // {
      //   href: "/admin/product/catalogue",
      //   label: "Catalogue",
      //   icon: "reviews",
      // },
      {
        href: "/admin/product/sales-report",
        label: "Sales Report",
        icon: "sell",
      },
      {
        href: "/admin/product/single-report",
        label: "Single Report",
        icon: "filter_1",
      },
      {
        href: "/admin/product/category-report",
        label: "Category Report",
        icon: "label",
      },
    ],
  },
  {
    href: "/admin/product-stock",
    label: "Product Stock",
    icon: "storefront",
    mainSubLink: true,
    submenu: [
      {
        href: "/admin/product-stock/summary",
        label: "Summary",
        icon: "dashboard",
      },
      {
        href: "/admin/product-stock/stock-sync",
        label: "Stock Sync",
        icon: "sync",
      },
      {
        href: "/admin/product-stock/report",
        label: "Report",
        icon: "assessment",
      },
      {
        href: "/admin/product-stock/this-month",
        label: "This Month",
        icon: "date_range",
      },
      {
        href: "/admin/product-stock/categories-report",
        label: "Categories Report",
        icon: "category",
      },
    ],
  },

  {
    href: "activity",
    label: "Activity",
    icon: "history_toggle_off",
    submenu: [
      {
        href: "/admin/activity/my-order",
        label: "My Order",
        icon: "track_changes",
      },
      {
        href: "/admin/activity/my-activity",
        label: "My Activity",
        icon: "surfing",
      },
      {
        href: "/admin/activity/all-activity",
        label: "All Activity",
        icon: "group_work",
      },
      {
        href: "/admin/activity/order-transaction",
        label: "Order Transaction",
        icon: "donut_large",
      },
    ],
    mainSubLink: true,
  },
  {
    href: TEAM,
    label: "Team",
    icon: "groups",
    mainSubLink: true,
    submenu: [
      {
        href: "/admin/team/member",
        label: "Member",
        icon: "groups",
      },
      {
        href: "/admin/team/permission",
        label: "Role & Permission",
        icon: "admin_panel_settings",
      },
      {
        href: "/admin/team/report",
        label: "Report",
        icon: "assessment",
      },
    ],
  },

  {
    href: "marketing",
    label: "Marketing",
    icon: "bar_chart",
    submenu: [
      {
        href: "/admin/marketing/daily",
        label: "Daily",
        icon: "analytics",
      },
      {
        href: "/admin/marketing/monthly-cost",
        label: "Monthly Cost",
        icon: "analytics",
      },
      {
        href: "/admin/marketing/monthly-report",
        label: "Monthly Reports",
        icon: "filter_1",
      },
      {
        href: "/admin/marketing/marketing-webhook",
        label: "Marketing Webhook",
        icon: "webhook",
      },
      {
        href: "/admin/marketing/campaign-source",
        label: "Campaign Source",
        icon: "campaign",
      },
      {
        href: "/admin/marketing/google-ads-campaign",
        label: "G Campaign",
        icon: "campaign",
      },
      {
        href: "/admin/marketing/cities-campaign",
        label: "City Campaign",
        icon: "campaign",
      },
      {
        href: "/admin/marketing/facebook-utm-content",
        label: "FB Ads",
        icon: "campaign",
      },
      {
        href: "/admin/marketing/facebook-utm-term",
        label: "FB Adset",
        icon: "campaign",
      },
      {
        href: "/admin/marketing/facebook-utm-campaign",
        label: "FB Campaign",
        icon: "campaign",
      },
      {
        href: "/admin/marketing/campaign-search",
        label: "Campaign Search",
        icon: "travel_explore",
      },
      {
        href: "/admin/marketing/search-order",
        label: "Search by Order",
        icon: "travel_explore",
      },
    ],
    mainSubLink: true,
  },

  {
    href: "task-manager",
    label: "Task Manager",
    icon: "pending_actions",
    submenu: [
      {
        href: "/admin/task-manager/project",
        label: "Project",
        icon: "next_plan",
      },
      {
        href: "/admin/task-manager/task",
        label: "Task",
        icon: "task",
      },
    ],
    mainSubLink: true,
  },

  {
    href: "profit",
    label: "Profit",
    icon: "payments",
    submenu: [
      {
        href: "/admin/profit/order",
        label: "Order",
        icon: "date_range",
      },
      {
        href: "/admin/profit/daily",
        label: "Daily",
        icon: "today",
      },
      {
        href: "/admin/profit/monthly",
        label: "Monthly",
        icon: "calendar_month",
      },
      {
        href: "/admin/profit/current-value",
        label: "Current Value",
        icon: "bolt",
      },
    ],
    mainSubLink: true,
  },

  {
    href: "order-report",
    label: "Order Report",
    icon: "receipt_long",
    submenu: [
      {
        href: "/admin/order-report/daily-report",
        label: "Daily",
        icon: "today",
      },
      {
        href: "/admin/order-report/monthly-report",
        label: "Monthly",
        icon: "calendar_month",
      },
      {
        href: "/admin/order-report/source-report",
        label: "Source",
        icon: "diversity_2",
      },
      {
        href: "/admin/order-report/cancel-report",
        label: "Cancel",
        icon: "timeline",
      },
      {
        href: "/admin/order-report/cancel-by-order",
        label: "Cancel Order",
        icon: "do_not_disturb_on",
      },
      {
        href: "/admin/order-report/cancel-by-source",
        label: "Cancel Source",
        icon: "do_not_disturb_off",
      },
      {
        href: "/admin/order-report/return-by-order",
        label: "Return Order",
        icon: "low_priority",
      },
      {
        href: "/admin/order-report/return-by-source",
        label: "Return Source",
        icon: "roundabout_left",
      },
    ],
    mainSubLink: true,
  },

  {
    href: "setting",
    label: "Setting",
    icon: "settings",
    submenu: [
      {
        href: "/admin/setting/warehouse",
        label: "Warehouse",
        icon: "warehouse",
      },
      {
        href: "/admin/setting/general",
        label: "General",
        icon: "settings_applications",
      },
      {
        href: "/admin/setting/dashboard-theme",
        label: "Appearance",
        icon: "palette",
      },
      {
        href: "/admin/setting/deposit",
        label: "Deposit",
        icon: "attach_money",
      },
      {
        href: "/admin/setting/expense",
        label: "Expense",
        icon: "data_exploration",
      },
      {
        href: "/admin/setting/company",
        label: "Company",
        icon: "business_center",
      },
      {
        href: "/admin/setting/sms",
        label: "SMS Settings",
        icon: "sms",
      },
      {
        href: "/admin/setting/mim-sms",
        label: "MIM SMS",
        icon: "send_to_mobile",
      },
      {
        href: "/admin/setting/report-issue-category",
        label: "Report Category",
        icon: "report",
      },
    ],
    mainSubLink: true,
  },
  {
    href: "customer-front",
    label: "Customer Front",
    icon: "web",
    submenu: [
      {
        href: "/admin/customer-front/menu",
        label: "Menu",
        icon: "menu",
      },
      {
        href: "/admin/customer-front/banner",
        label: "Banner",
        icon: "image",
      },
      {
        href: "/admin/customer-front/featured-collection",
        label: "Featured Collection",
        icon: "grid_view",
      },
      {
        href: "/admin/customer-front/shop-occasion",
        label: "Shop by Occasion",
        icon: "event",
      },
      {
        href: "/admin/customer-front/customer-review",
        label: "Customer Review",
        icon: "reviews",
      },
      {
        href: "/admin/customer-front/girls-emotion",
        label: "Girls Emotion",
        icon: "photo_library",
      },
      {
        href: "/admin/customer-front/instagram-gallery",
        label: "Instagram Gallery",
        icon: "photo_library",
      },
      {
        href: "/admin/customer-front/brand-story",
        label: "Brand Story",
        icon: "auto_awesome",
      },
    ],
    mainSubLink: true,
  },
  {
    href: "/admin/blog",
    label: "Blog Page",
    icon: "web",
  },
  {
    href: "/admin/pages",
    label: "Pages",
    icon: "article",
  },
];

export const allStatuses = [
  "pending",
  "waiting-payment",
  "approved",
  "ready-for-box",
  "in-transit",
  "follow-up",
  "delivery",
  "cancel",
  "refunded",
  "return",
];

export const allSalesData = ["all", "pending", "completed", "error"];

export const curiarOption = [
  {
    value: "All",
    label: "All Couriers",
  },
  {
    value: "Pathao",
    label: "Pathao",
  },
  {
    value: "SteadFast",
    label: "SteadFast",
  },
];

export const paymentOption = [
  {
    value: "due",
    label: "Due",
  },
  {
    value: "partial",
    label: "Partial",
  },
  {
    value: "paid",
    label: "Paid",
  },
];

export const filterOrderOption = [
  {
    value: "all_orders",
    label: "All Orders",
  },
  {
    value: "assign_orders",
    label: "Assign Orders",
  },
];
export const filterSalesOption = [
  {
    value: "r-d",
    label: "R-D",
  },
  {
    value: "in-transit",
    label: "In Transit",
  },
];

export const statusOptions = [
  {
    value: "r-d",
    label: "RD",
  },
  {
    value: "processing",
    label: "Processing",
  },
  {
    value: "unpaid",
    label: "Unpaid",
  },
  {
    value: "confirmed",
    label: "Confirmed",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
  {
    value: "in-transit",
    label: "In-transit",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "on-hold",
    label: "On-hold",
  },
  {
    value: "return",
    label: "Return",
  },
  {
    value: "report-issue",
    label: "Report-issue",
  },
];

export const typeOption = [
  {
    label: "Cash",
    value: "cash",
  },
  {
    label: "Bank ",
    value: "bank",
  },
  {
    label: "Mobile Banking",
    value: "mobile_banking",
  },
];

export const statussOptions = [
  {
    value: "demo1",
    label: "Demo1",
  },
  {
    value: "demo2",
    label: "Demo2",
  },
];

export const TEMPLATES = [
  {
    id: "TEMP003",
    title: "Modern Electronics Store",
    image:
      "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    category: "E-commerce",
    html: `
    <div class="ecommerce-landing font-sans bg-gray-50">
      <!-- Hero Section -->
      <header class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4">
        <div class="max-w-6xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">Premium Electronics</h1>
          <p class="text-lg md:text-xl mb-8">Cutting-edge tech for your digital lifestyle</p>
          <button class="bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition duration-300 shadow-lg hover:shadow-xl">
            Shop Now
          </button>
        </div>
      </header>

      <!-- Featured Products -->
      <section class="py-16 px-4 max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-12">Featured Products</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Product 1 -->
          <div class="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
            <div class="h-64 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                   alt="Wireless Headphones" 
                   class="w-full h-full object-cover"/>
            </div>
            <div class="p-6">
              <h3 class="font-bold text-xl mb-2">Noise-Canceling Headphones</h3>
              <p class="text-gray-600 mb-4">Premium sound with 30hr battery life</p>
              <div class="flex justify-between items-center mt-4">
                <span class="font-bold text-lg">$149.99</span>
                <button class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
          
          <!-- Product 2 -->
          <div class="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
            <div class="h-64 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                   alt="Smart Watch" 
                   class="w-full h-full object-cover"/>
            </div>
            <div class="p-6">
              <h3 class="font-bold text-xl mb-2">Smart Watch Pro</h3>
              <p class="text-gray-600 mb-4">Fitness tracking & notifications</p>
              <div class="flex justify-between items-center mt-4">
                <span class="font-bold text-lg">$199.99</span>
                <button class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
          
          <!-- Product 3 -->
          <div class="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
            <div class="h-64 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                   alt="Bluetooth Speaker" 
                   class="w-full h-full object-cover"/>
            </div>
            <div class="p-6">
              <h3 class="font-bold text-xl mb-2">Portable Speaker</h3>
              <p class="text-gray-600 mb-4">360° sound with 20hr playtime</p>
              <div class="flex justify-between items-center mt-4">
                <span class="font-bold text-lg">$89.99</span>
                <button class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="py-16 bg-gray-100">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <h2 class="text-3xl font-bold mb-6">Summer Sale - Up to 50% Off</h2>
          <p class="text-xl mb-8">Limited time offer on selected items. Don't miss out!</p>
          <button class="bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition duration-300 shadow-lg">
            Shop the Sale
          </button>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-gray-900 text-white py-12 px-4">
        <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="font-bold text-xl mb-4">TechStore</h3>
            <p class="text-gray-400">Premium electronics for your digital lifestyle</p>
          </div>
          <div>
            <h4 class="font-bold mb-4">Quick Links</h4>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white">Shipping Policy</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white">Returns</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4">Contact</h4>
            <p class="text-gray-400">123 Tech Street, Silicon Valley</p>
            <p class="text-gray-400">support@techstore.com</p>
            <p class="text-gray-400">(555) 123-4567</p>
          </div>
        </div>
        <div class="max-w-6xl mx-auto mt-12 pt-6 border-t border-gray-800 text-center text-gray-400">
          <p>© 2023 TechStore. All rights reserved.</p>
        </div>
      </footer>
    </div>
    `,
  },
  {
    id: "TEMP004",
    title: "Fashion Boutique",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    category: "E-commerce",
    html: `
    <div class="fashion-landing font-sans">
      <!-- Hero Section -->
      <header class="relative h-96 flex items-center">
        <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80" 
             alt="Fashion Collection" 
             class="absolute inset-0 w-full h-full object-cover"/>
        <div class="absolute inset-0 bg-black opacity-50"></div>
        <div class="relative z-10 px-6 max-w-4xl mx-auto text-center text-white">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">New Collection</h1>
          <p class="text-xl mb-8">Elevate your style with our premium designs</p>
          <button class="bg-pink-600 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-700 transition duration-300 shadow-lg">
            Discover Now
          </button>
        </div>
      </header>

      <!-- Featured Categories -->
      <section class="py-16 px-4 max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-12">Shop by Category</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <!-- Category 1 -->
          <div class="group text-center cursor-pointer">
            <div class="h-48 overflow-hidden rounded-lg mb-4">
              <img src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                   alt="Women's Fashion" 
                   class="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
            </div>
            <h3 class="font-medium text-lg group-hover:text-pink-600">Women</h3>
          </div>
          
          <!-- Category 2 -->
          <div class="group text-center cursor-pointer">
            <div class="h-48 overflow-hidden rounded-lg mb-4">
              <img src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                   alt="Men's Fashion" 
                   class="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
            </div>
            <h3 class="font-medium text-lg group-hover:text-pink-600">Men</h3>
          </div>
          
          <!-- Category 3 -->
          <div class="group text-center cursor-pointer">
            <div class="h-48 overflow-hidden rounded-lg mb-4">
              <img src="https://images.unsplash.com/photo-1604917018039-34a0d2c01ba1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                   alt="Kids Fashion" 
                   class="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
            </div>
            <h3 class="font-medium text-lg group-hover:text-pink-600">Kids</h3>
          </div>
          
          <!-- Category 4 -->
          <div class="group text-center cursor-pointer">
            <div class="h-48 overflow-hidden rounded-lg mb-4">
              <img src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                   alt="Accessories" 
                   class="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
            </div>
            <h3 class="font-medium text-lg group-hover:text-pink-600">Accessories</h3>
          </div>
        </div>
      </section>

      <!-- Featured Products -->
      <section class="py-16 bg-gray-100">
        <div class="max-w-6xl mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12">Trending Now</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Product 1 -->
            <div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
              <div class="h-64 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                     alt="Denim Jacket" 
                     class="w-full h-full object-cover"/>
              </div>
              <div class="p-4">
                <h3 class="font-bold text-lg mb-1">Classic Denim Jacket</h3>
                <p class="text-pink-600 font-bold">$79.99</p>
              </div>
            </div>
            
            <!-- More products... -->
          </div>
        </div>
      </section>

      <!-- Newsletter -->
      <section class="py-16 bg-pink-50">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <h2 class="text-3xl font-bold mb-4">Join Our Newsletter</h2>
          <p class="text-xl mb-8">Get 15% off your first order and exclusive offers</p>
          <div class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input type="email" placeholder="Your email address" class="flex-grow py-3 px-4 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500">
            <button class="bg-pink-600 text-white font-bold py-3 px-6 rounded hover:bg-pink-700 transition duration-300">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-gray-900 text-white py-12 px-4">
        <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="font-bold text-xl mb-4">Boutique</h3>
            <p class="text-gray-400">Premium fashion for every occasion</p>
          </div>
          <div>
            <h4 class="font-bold mb-4">Shop</h4>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-400 hover:text-white">New Arrivals</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white">Best Sellers</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white">Sale</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4">Customer Service</h4>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-400 hover:text-white">Contact Us</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white">FAQs</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white">Returns</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4">Follow Us</h4>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-400 hover:text-white">Instagram</a>
              <a href="#" class="text-gray-400 hover:text-white">Facebook</a>
              <a href="#" class="text-gray-400 hover:text-white">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    `,
  },
];

export const allStatusesOption = [
  { status: "all", name: "All" },
  { status: "pending", name: "Pending" },
  { status: "waiting-payment", name: "To be Paid" },
  { status: "approved", name: "Approved" },
  { status: "ready-for-box", name: "R-D" },
  { status: "in-transit", name: "Transit" },
  { status: "follow-up", name: "Follow Up" },
  { status: "delivery", name: "Delivery" },
  { status: "cancel", name: "Cancelled" },
  { status: "refunded", name: "Refunded" },
  { status: "return", name: "Return" },
];

export const dhakaKeywords = [
  "dhaka",
  "dhakka",
  "daka",
  "dahka",
  "gulshan",
  "gulshen",
  "gulsan",
  "gulshn",
  "banani",
  "bananni",
  "bonani",
  "bananee",
  "motijheel",
  "motijhil",
  "motijheel",
  "motijheal",
  "mirpur",
  "mirpoor",
  "mirpur",
  "mirpore",
  "uttara",
  "utara",
  "utarra",
  "uttra",
  "dhanmondi",
  "dhanmondy",
  "dhanmondi",
  "dhanmondee",
  "bashundhara",
  "bashudhara",
  "bashundara",
  "basundhara",
  "mohakhali",
  "mohakhali",
  "mohakholy",
  "mohakhalee",
  "baridhara",
  "baridara",
  "baridhara",
  "baridhara",
  "farmgate",
  "farmget",
  "farmgate",
  "farmgait",
  "shahbag",
  "shahbagh",
  "shabag",
  "shaabag",
  "tejgaon",
  "tejgon",
  "tejgaon",
  "tezgaon",
  "badda",
  "bada",
  "badda",
  "badha",
  "shyamoli",
  "shamoli",
  "shyamoly",
  "shyamolee",
  "elephant road",
  "elefant road",
  "elliphant rod",
  "new market",
  "nu market",
  "new markit",
  "azar",
  "azimpur",
  "azimpur",
  "ajimpur",
  "savar",
  "shavar",
  "saver",
  "sabar",
  "paltan",
  "palton",
  "pultan",
  "jatrabari",
  "jatrabari",
  "jatrabari",
  "rampura",
  "rampura",
  "rampura",
  "malibagh",
  "malibag",
  "mali bagh",
  "kuril",
  "kuril",
  "kuril",
  "kalabagan",
  "kalabagan",
  "calabagan",
  "wari",
  "wari",
  "wary",
  "cantonment",
  "cantoment",
  "canttonment",
  "kafrul",
  "kafrul",
  "cafrul",
  "green road",
  "green rd",
  "gren road",
  "siddheshwari",
  "siddeswari",
  "siddheshwary",
  "gandaria",
  "gandaria",
  "gandariah",
  "ঢাকা",
  "গুলশান",
  "বনানী",
  "মতিঝিল",
  "মিরপুর",
  "উত্তরা",
  "ধানমন্ডি",
  "বসুন্ধরা",
  "মোহাখালী",
  "বারিধারা",
  "ফার্মগেট",
  "শাহবাগ",
  "তেজগাঁও",
  "বাড্ডা",
  "শ্যামলী",
  "হাতিরঝিল",
  "কাকরাইল",
  "সাভার",
  "আজিমপুর",
  "নিউ মার্কেট",
  "পল্টন",
  "যাত্রাবাড়ী",
  "রামপুরা",
  "মালিবাগ",
  "কুড়িল",
  "কালাবাগান",
  "ওয়ারি",
  "ক্যান্টনমেন্ট",
  "কাফরুল",
  "গ্রীন রোড",
  "সিদ্ধেশ্বরী",
  "গান্ধারীয়া",
];

/* ================= Dhaka Auto-Select Helpers (one-time, above component) ================= */

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const buildDhakaRegex = (words: string[]) => {
  const latin: string[] = [],
    nonLatin: string[] = [];
  for (const w of words)
    (/[A-Za-z]/.test(w) ? latin : nonLatin).push(escapeRe(w.trim()));
  const latinPart = latin.length ? String.raw`\b(?:${latin.join("|")})\b` : "";
  const nonLatinPart = nonLatin.length ? `(?:${nonLatin.join("|")})` : "";
  return new RegExp([latinPart, nonLatinPart].filter(Boolean).join("|"), "i");
};
const DHAKA_RE = buildDhakaRegex(dhakaKeywords);
export const inferShippingFromAddress = (addr?: string) =>
  addr && DHAKA_RE.test(addr.replace(/\s+/g, " ").trim())
    ? "dhaka city"
    : "all bangladesh";

// middlere route
export const publicRoutes = ["/admin", "/admin/signup", "/admin/verify"];

export const routePermissionMap: { [key: string]: string | string[] } = {
  "/dashboard/all": ["dashboard_all_view"],
  "/dashboard/summary": ["dashboard_summary_view"],
  "/dashboard/showroom": ["showroom_view"],
  "/fulfillment": ["order_fulfillment_view"],
  "/orders/return": ["order_return_view"],
  "/orders/refund": ["order_refund_view"],
  "/orders/wholesale-return": ["order_wholesale_return_view"],
  "/orders/incompleate": ["order_incomplete_view"],
  "/orders/all-order": ["order_all_view"],
};

export const shiftTimeOptions = [
  {
    label: "Morning",
    value: "morning",
  },
  {
    label: "Evening",
    value: "evening",
  },
  {
    label: "Night",
    value: "night",
  },
  {
    label: "Full Day",
    value: "full-day",
  },
];

const parseDate = (dateStr?: string) => {
  if (!dateStr) return null;

  const [day, month, year] = dateStr.split("-");
  if (!day || !month || !year) return null;

  const date = new Date(Number(year), Number(month) - 1, Number(day));
  date.setHours(0, 0, 0, 0);

  return date;
};

export const getRosterStatus = (fromDate?: string, toDate?: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = parseDate(fromDate);
  const end = parseDate(toDate);

  if (!start || !end) {
    return {
      label: "Unknown",
      value: "unknown",
      className:
        "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    };
  }

  if (today < start) {
    return {
      label: "Upcoming",
      value: "upcoming",
      className:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
  }

  if (today > end) {
    return {
      label: "Ended",
      value: "ended",
      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
  }

  return {
    label: "Running",
    value: "running",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
};
