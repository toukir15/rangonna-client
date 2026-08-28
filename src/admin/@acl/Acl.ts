export const labelPermissionMap: Record<string, string[]> = {
  holidayshift: ["team_user_dashboard_view"],
  // ===== Dashboard =====
  dashboard: [
    "dashboard_all_view",
    "dashboard_summary_view",
    "dashboard_naviforce_view",
    "dashboard_timeverse_view",
    "dashboard_bikreta_view",
    "dashboard_olevs_view",
    "dashboard_wholesale_view",
    "dashboard_order_skip_twenty_summary_view",
    "dashboard_last_sixty_days_view",
    "showroom_view",
    "showroom_view_admin",
  ],
  "dashboard/all": ["dashboard_all_view"],
  "dashboard/summary": ["dashboard_summary_view"],
  "dashboard/naviforce": ["dashboard_naviforce_view"],
  "dashboard/timeverse": ["dashboard_timeverse_view"],
  "dashboard/bikreta": ["dashboard_bikreta_view"],
  "dashboard/showroom": ["showroom_view"],
  "dashboard/olevs": ["dashboard_olevs_view"],
  "dashboard/wholesale": ["dashboard_wholesale_view"],
  "dashboard/showroomreport": ["showroom_view_admin"],
  "dashboard/report": ["dashboard_order_skip_twenty_summary_view"],

  // ===== Orders =====
  orders: [
    "order_all_view",
    "order_naviforce_view",
    "order_timeverse_view",
    "order_bikreta_view",
    "order_olevs_view",
    "order_wholesale_view",
    "order_incomplete_view",
    "order_edit",
    "order_view",
    "order_return_view",
    "order_return_create",
    "order_wholesale_return_view",
    "order_wholesale_return_create",
    "order_showroom_view",
    "order_refund_view",
    "order_delay_delivery_view",
    "sslcommerz_transaction_view",
    "activity_my_order_view",
    "order_assignment_view",
    "order_assignment_transfer",
  ],
  "orders/assignorder": ["order_assignment_view"],
  "orders/assignorders": ["order_assignment_view"],
  "orders/olevs": ["order_olevs_view"],
  "orders/allorder": ["order_all_view"],
  "orders/naviforce": ["order_naviforce_view"],
  "orders/timeverse": ["order_timeverse_view"],
  "orders/bikreta": ["order_bikreta_view"],
  "orders/view": ["order_view"],
  "orders/edit": ["order_edit"],
  "orders/showroom": ["order_showroom_view"],
  "orders/sslcommerz": ["sslcommerz_transaction_view"],
  "orders/wholesaleorders": [
    "order_wholesale_view",
    // "order_wholesale_edit"
  ],
  "orders/incompleate": ["order_incomplete_view"],
  "orders/return": ["order_return_view"],
  "orders/delaydelivery": ["order_delay_delivery_view"],
  "orders/wholesalereturn": ["order_wholesale_return_view"],
  "orders/refund": ["order_refund_view"],
  "orders/sms": ["team_user_dashboard_view"],
  // ===== Content =====
  contents: ["content_view"],
  fulfillment: ["order_fulfillment_view"],
  // ===== Report Issue =====
  reportissue: ["report_issue_view"],
  // ===== Fraud Check =====
  fraudcheck: ["fraud_check_view"],
  // ===== Couriers =====
  couriers: ["courier_booking_view", "courier_report_view", "courier_view"],
  "couriers/booking": ["courier_booking_view"],
  "couriers/report": ["courier_report_view"],
  "couriers/setting": ["courier_view"],
  // ===== Customer =====
  customer: ["customer_view", "customer_report_view", "customer_repeat"],
  "customer/all": ["customer_view"],
  "customer/repeat": ["customer_report_view"],
  "customer/monthly": ["customer_repeat"],

  // ===== Accounts =====
  account: [
    "account_view",
    "account_expense_view",
    "account_expense_category_view",
    "account_deposit_view",
    "account_deposit_edit",
    "account_deposit_category_view",
    "account_transfer_money_view",
    "account_payment_report_view",
    "account_deposit_report_view",
    "account_expense_report_view",
    "account_balance_sheet_view",
  ],
  "account/accounts": ["account_view"],
  "account/expense": ["account_expense_view"],
  "account/deposit": ["account_deposit_view"],
  "account/transfermoney": ["account_transfer_money_view"],
  "account/paymentreport": ["account_payment_report_view"],
  "account/depositreport": ["account_deposit_report_view"],
  "account/expensereport": ["account_expense_report_view"],
  "account/expensecategory": ["account_expense_category_view"],
  "account/depositcategory": ["account_deposit_category_view"],
  "account/depositsetting": ["account_settings_view"],
  "account/balancesheet": ["account_balance_sheet_view"],

  //payment report
  paymentreport: [
    "account_payment_report_view",
    "account_report_monthly_summary_view",
    "account_report_payment_method_view",
  ],
  "paymentreport/summary": [
    "account_payment_report_view",
    "account_report_monthly_summary_view",
  ],
  "paymentreport/methodsummary": ["account_report_payment_method_view"],

  // ===== Purchase =====

  purchase: [
    "purchase_view",

    "purchase_return_view",

    "purchase_supplier_view",

    "purchase_supplier_report_view",
  ],
  "purchase/purchase": ["purchase_create", "purchase_view", "purchase_edit"],
  "purchase/return": ["purchase_return_view"],
  "purchase/supplier": ["purchase_supplier_view"],
  "purchase/supplierreport": ["purchase_supplier_report_view"],
  // fraud detection
  frauddetection: ["fraud_detection_log_view"],

  // ===== Wholesale =====

  wholesale: [
    "wholesale_user_view",
    "wholesale_user_edit",
    "wholesale_user_report_view",
  ],
  "wholesale/user": ["wholesale_user_view", "wholesale_user_edit"],
  "wholesale/duereport": ["wholesale_user_report_view"],

  // ===== Product =====

  product: [
    "product_view",
    "wholesale_product_view",
    "product_pricing_view",
    "product_report_view",
    "product_stock_logs_view",
    "product_category_view",
    "product_brand_view",
    "product_review_view",
    "product_sales_report_view",
    "product_single_report_view",
    "product_brand_report_view",
    "product_category_report_view",
  ],
  "product/products": ["product_view"],
  "product/wholesale": ["wholesale_product_view"],
  "product/pricing": ["product_pricing_view"],
  "product/report": ["product_report_view"],
  "product/stocklogs": ["product_stock_logs_view"],
  "product/category": ["product_category_view"],
  "product/brand": ["product_brand_view"],
  "product/reviews": ["product_review_view"],
  "product/catalogue": ["product_review_view"],
  "product/salesreport": ["product_sales_report_view"],
  "product/singlereport": ["product_single_report_view"],
  "product/brandreport": ["product_brand_report_view"],
  "product/categoryreport": ["product_category_report_view"],

  // product stock
  productstock: [
    "product_stock_report_view",
    "product_stock_report_summery_view",
    "product_stock_report_this_month_view",
    "product_stock_report_sync",
    "stock_transfer_view",
    "stock_transfer_receive",
    "stock_transfer_my_warehouse",
  ],
  "productstock/summary": ["product_stock_report_summery_view"],
  "productstock/stocksync": ["product_stock_report_sync"],
  "productstock/report": ["product_stock_report_view"],
  "productstock/thismonth": ["product_stock_report_this_month_view"],
  "productstock/transfer": ["stock_transfer_view"],
  "productstock/mywarehouse": [
    "stock_transfer_receive",
    "stock_transfer_my_warehouse",
  ],
  "productstock/brandreport": ["product_stock_report_view"],
  "productstock/categoriesreport": ["product_stock_report_view"],

  // stock_transfer_my_warehouse

  // lading

  landingpage: ["landing_page_view"],

  // ===== Wholesale =====

  activity: [
    "activity_my_order_view",
    "activity_my_activity_view",
    "activity_all_activity_view",
    "activity_order_transaction_view",
  ],
  "activity/myorder": ["activity_my_order_view"],
  "activity/myactivity": ["activity_my_activity_view"],
  "activity/allactivity": ["activity_all_activity_view"],
  "activity/ordertransaction": ["activity_order_transaction_view"],

  // ===== Team =====

  team: [
    "team_permission_view",
    "team_user_report_view",
    "team_user_view",
    "team_holiday_salary_view",
    "team_advance_salary_view",
    "team_salary_view",
    "leave_application_view",
    "leave_policy_view",
  ],
  "team/member": ["team_user_view"],
  "team/permission": ["team_permission_view"],
  "team/report": ["team_user_report_view"],
  "team/holidaypayment": ["team_holiday_salary_view"],
  "team/advancesalary": ["team_advance_salary_view"],
  "team/salary": ["team_salary_view"],
  "team/salaryreport": ["team_salary_view", "team_user_report_view"],
  "team/leaveapplication": ["leave_application_view"],
  "team/leavepolicy": ["leave_policy_view"],

  // ===== marketing =====
  marketing: [
    "marketing_view",
    "marketing_report_view",
    "marketing_campaign_source_view",
    "marketing_google_campaign_view",
    "marketing_facebook_campaign_view",
    "marketing_facebook_adset_view",
    "marketing_facebook_ad_view",
    "marketing_campaign_search_view",
    "marketing_coupon_report_view",
    "marketing_webhook_view",
    "marketing_webhook_create",
    "marketing_daily_report",
    "marketing_city_report_view",
  ],
  "marketing/monthlycost": ["marketing_view"],
  "marketing/daily": ["marketing_daily_report"],
  "marketing/monthlyreport": ["marketing_report_view"],
  "marketing/marketingwebhook": ["marketing_webhook_view"],
  "marketing/campaignsource": ["marketing_campaign_source_view"],
  "marketing/googleadscampaign": ["marketing_google_campaign_view"],
  "marketing/citiescampaign": ["marketing_city_report_view"],
  "marketing/facebookutmcontent": ["marketing_facebook_ad_view"],
  "marketing/facebookutmterm": ["marketing_facebook_adset_view"],
  "marketing/facebookutmcampaign": ["marketing_facebook_campaign_view"],
  "marketing/campaignsearch": ["marketing_campaign_search_view"],
  "marketing/searchorder": ["marketing_campaign_search_view"],

  // ===== Task Manager =====
  taskmanager: ["task_view", "task_project_view", "task_my_task_view"],
  "taskmanager/project": ["task_project_view"],
  "taskmanager/task": ["task_view"],
  // ===== Profit =====
  profit: [
    "profit_order_view",
    "profit_daily_view",
    "profit_monthly_view",
    "current_value_monthly_view",
    "current_value_summary_view",
  ],
  "profit/order": ["profit_order_view"],
  "profit/daily": ["profit_daily_view"],
  "profit/monthly": ["profit_monthly_view"],
  "profit/currentvalue": [
    "current_value_monthly_view",
    "current_value_summary_view",
    "current_value_monthly_create",
  ],
  // ===== Order Report =====
  orderreport: [
    "order_report_daily_view",
    "order_report_monthly_view",
    "order_report_source_view",
    "order_report_cancel_view",
    "order_report_cancel_by_order_view",
    "order_report_cancel_by_source_view",
    "order_report_return_view",
    "order_report_return_by_order_view",
    "order_report_return_by_source_view",
  ],
  "orderreport/dailyreport": ["order_report_daily_view"],
  "orderreport/monthlyreport": ["order_report_monthly_view"],
  "orderreport/sourcereport": ["order_report_source_view"],
  "orderreport/cancelreport": ["order_report_cancel_view"],
  "orderreport/cancelbyorder": ["order_report_cancel_by_order_view"],
  "orderreport/cancelbysource": ["order_report_cancel_by_source_view"],
  "orderreport/returnbyorder": ["order_report_return_by_order_view"],
  "orderreport/returnbysource": ["order_report_return_by_source_view"],

  // duty plan

  dutyplan: [
    "roster_plan_view",
    "team_holiday_notice_view",
    "notice_view",
    "company_policy_view",
    "weekly_holiday_view",
    "duty_view",
  ],
  "dutyplan/notice": ["notice_view"],
  "dutyplan/duty": ["roster_plan_view", "duty_view"],
  "dutyplan/holidaynotice": ["team_holiday_notice_view"],
  "dutyplan/weeklyholiday": ["weekly_holiday_view"],
  "dutyplan/companypolicy": ["company_policy_view"],
  // ===== Setting =====

  setting: [
    "setting_general_view",
    "setting_company_view",
    "setting_report_issue_category_view",
    "warehouse_view",
    "setting_mim_sms_view",
    "mim_sms_template_view",
    "account_settings_view",
    "account_expense_settings_view",
  ],
  "setting/general": ["setting_general_view"],
  "setting/dashboardtheme": ["setting_general_view"],
  "setting/company": ["setting_company_view"],
  "setting/sms": ["setting_mim_sms_view"],
  "setting/mimsms": ["mim_sms_template_view"],
  "setting/reportissuecategory": ["setting_report_issue_category_view"],
  "setting/deposit": ["account_settings_view"],
  "setting/expense": [
    "account_expense_settings_view",
    "account_settings_view",
  ],
  "setting/warehouse": ["warehouse_view"],

  // ===== Customer Front =====
  customerfront: ["customer_front_menu"],
  "customerfront/menu": ["customer_front_menu"],
  "customerfront/banner": ["customer_front_menu"],
  "customerfront/featuredcollection": ["customer_front_menu"],
  "customerfront/shopoccasion": ["customer_front_menu"],
  "customerfront/customerreview": ["customer_front_menu"],
  "customerfront/girlsemotion": ["customer_front_menu"],
  "customerfront/instagramgallery": ["customer_front_menu"],
  "customerfront/brandstory": ["customer_front_menu"],
  // ===== Blog Page =====
  blog: ["blog_view"],
  pages: ["campaign_page_view"],
  "pages/addpage": ["campaign_page_create"],
  "pages/edit": ["campaign_page_edit"],
};
