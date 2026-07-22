// export enum NewPermissionsEnum {
//   DASHBOARD_VIEW = "dash_v", // dashboard_view

//   ORDER_EDIT = "orde_e", // order_edit
//   ORDER_VIEW = "orde_v", // order_view

//   WHOLESALE_ORDER_EDIT = "whol_orde_e", // wholesale_order_edit
//   WHOLESALE_ORDER_VIEW = "whol_orde_v", // wholesale_order_view

//   WHOLESALE_PRODUCT_EDIT = "whol_prod_e", // wholesale_product_edit
//   WHOLESALE_PRODUCT_VIEW = "whol_prod_v", // wholesale_product_view

//   INCOMPLETE_ORDER_VIEW = "inco_orde_v", // incomplete_order_view
//   INCOMPLETE_ORDER_EDIT = "inco_orde_e", // incomplete_order_edit
//   INCOMPLETE_ORDER_DELETE = "inco_orde_d", // incomplete_order_delete

//   REPORT_ISSUE_CREATE = "repo_issu_c", // report_issue_create
//   REPORT_ISSUE_VIEW = "repo_issu_v", // report_issue_view
//   REPORT_ISSUE_EDIT = "repo_issu_e", // report_issue_edit
//   REPORT_ISSUE_DELETE = "repo_issu_d", // report_issue_delete

//   ADMIN_ORDER_VIEW = "admi_orde_v", // admin_order_view
//   ADMIN_ORDER_EDIT = "admi_orde_e", // admin_order_edit

//   PRODUCT_VIEW = "prod_v", // product_view
//   PRODUCT_CREATE = "prod_c", // product_create
//   PRODUCT_EDIT = "prod_e", // product_edit
//   PRODUCT_DELETE = "prod_d", // product_delete
//   PRODUCT_PRICING_VIEW = "prod_pric_v", // product_pricing_view

//   PRODUCT_CATEGORY_CREATE = "prod_cate_c", // product_category_create
//   PRODUCT_CATEGORY_VIEW = "prod_cate_v", // product_category_view
//   PRODUCT_CATEGORY_EDIT = "prod_cate_e", // product_category_edit
//   PRODUCT_CATEGORY_DELETE = "prod_cate_d", // product_category_delete

//   PRODUCT_BRAND_CREATE = "prod_bran_c", // product_brand_create
//   PRODUCT_BRAND_VIEW = "prod_bran_v", // product_brand_view
//   PRODUCT_BRAND_EDIT = "prod_bran_e", // product_brand_edit
//   PRODUCT_BRAND_DELETE = "prod_bran_d", // product_brand_delete

//   PRODUCT_REVIEW_CREATE = "prod_revi_c", // product_review_create
//   PRODUCT_REVIEW_VIEW = "prod_revi_v", // product_review_view
//   PRODUCT_REVIEW_EDIT = "prod_revi_e", // product_review_edit
//   PRODUCT_REVIEW_DELETE = "prod_revi_d", // product_review_delete

//   FRAUD_CHECK_VIEW = "frau_chec_v", // fraud_check_view

//   COURIER_BOOKING_CREATE = "cour_book_c", // courier_booking_create
//   COURIER_BOOKING_VIEW = "cour_book_v", // courier_booking_view
//   COURIER_REPORT_VIEW = "cour_repo_v", // courier_report_view

//   USER_CREATE = "user_c", // user_create
//   USER_VIEW = "user_v", // user_view
//   USER_EDIT = "user_e", // user_edit
//   USER_DELETE = "user_d", // user_delete

//   WHOLESALE_USER_VIEW = "whol_user_v", // wholesale_user_view
//   WHOLESALE_USER_EDIT = "whol_user_e", // wholesale_user_edit

//   PERMISSION_CREATE = "perm_c", // permission_create
//   PERMISSION_VIEW = "perm_v", // permission_view
//   PERMISSION_EDIT = "perm_e", // permission_edit
//   PERMISSION_DELETE = "perm_d", // permission_delete

//   SUPPLIER_CREATE = "supp_c", // supplier_create
//   SUPPLIER_VIEW = "supp_v", // supplier_view
//   SUPPLIER_EDIT = "supp_e", // supplier_edit
//   SUPPLIER_DELETE = "supp_d", // supplier_delete

//   PRODUCT_REPORT_VIEW = "prod_repo_v", // product_report_view
//   ORDER_ACTIVITY_VIEW = "orde_acti_v", // order_activity_view
//   PURCHASE_PAYMENT_VIEW = "purc_paym_v", // purchase_payment_view
//   SUPPLIER_REPORT_VIEW = "supp_repo_v", // supplier_report_view
//   DEPOSIT_REPORT_VIEW = "depo_repo_v", // deposit_report_view
//   EXPENSE_REPORT_VIEW = "expe_repo_v", // expense_report_view

//   PURCHASE_CREATE = "purc_c", // purchase_create
//   PURCHASE_VIEW = "purc_v", // purchase_view
//   PURCHASE_EDIT = "purc_e", // purchase_edit

//   ACCOUNT_CREATE = "acco_c", // account_create
//   ACCOUNT_VIEW = "acco_v", // account_view
//   ACCOUNT_EDIT = "acco_e", // account_edit
//   ACCOUNT_DELETE = "acco_d", // account_delete

//   EXPENSE_CREATE = "expe_c", // expense_create
//   EXPENSE_VIEW = "expe_v", // expense_view
//   EXPENSE_EDIT = "expe_e", // expense_edit
//   EXPENSE_DELETE = "expe_d", // expense_delete

//   EXPENSE_CATEGORY_CREATE = "expe_cate_c", // expense_category_create
//   EXPENSE_CATEGORY_VIEW = "expe_cate_v", // expense_category_view
//   EXPENSE_CATEGORY_EDIT = "expe_cate_e", // expense_category_edit
//   EXPENSE_CATEGORY_DELETE = "expe_cate_d", // expense_category_delete

//   TRANSFER_MONEY_CREATE = "tran_mone_c", // transfer_money_create
//   TRANSFER_MONEY_VIEW = "tran_mone_v", // transfer_money_view
//   TRANSFER_MONEY_EDIT = "tran_mone_e", // transfer_money_edit
//   TRANSFER_MONEY_DELETE = "tran_mone_d", // transfer_money_delete

//   DEPOSIT_CREATE = "depo_c", // deposit_create
//   DEPOSIT_VIEW = "depo_v", // deposit_view
//   DEPOSIT_EDIT = "depo_e", // deposit_edit
//   DEPOSIT_DELETE = "depo_d", // deposit_delete

//   WEBSITE_CREATE = "webs_c", // website_create
//   WEBSITE_VIEW = "webs_v", // website_view
//   WEBSITE_EDIT = "webs_e", // website_edit
//   WEBSITE_DELETE = "webs_d", // website_delete

//   DEPOSIT_CATEGORY_CREATE = "depo_cate_c", // deposit_category_create
//   DEPOSIT_CATEGORY_VIEW = "depo_cate_v", // deposit_category_view
//   DEPOSIT_CATEGORY_EDIT = "depo_cate_e", // deposit_category_edit
//   DEPOSIT_CATEGORY_DELETE = "depo_cate_d", // deposit_category_delete

//   WAREHOUSE_CREATE = "ware_c", // warehouse_create
//   WAREHOUSE_VIEW = "ware_v", // warehouse_view
//   WAREHOUSE_EDIT = "ware_e", // warehouse_edit
//   WAREHOUSE_DELETE = "ware_d", // warehouse_delete

//   COURIER_CREATE = "cour_c", // courier_create
//   COURIER_VIEW = "cour_v", // courier_view
//   COURIER_EDIT = "cour_e", // courier_edit
//   COURIER_DELETE = "cour_d", // courier_delete

//   GENERAL_CREATE = "gene_c", // general_create
//   GENERAL_VIEW = "gene_v", // general_view
//   GENERAL_EDIT = "gene_e", // general_edit
//   GENERAL_DELETE = "gene_d", // general_delete

//   COMPANY_VIEW = "comp_v", // company_view

//   REPORT_ISSUE_CATEGORY_CREATE = "repo_issu_cate_c", // report_issue_category_create
//   REPORT_ISSUE_CATEGORY_VIEW = "repo_issu_cate_v", // report_issue_category_view
//   REPORT_ISSUE_CATEGORY_EDIT = "repo_issu_cate_e", // report_issue_category_edit
//   REPORT_ISSUE_CATEGORY_DELETE = "repo_issu_cate_d", // report_issue_category_delete

//   ORDER_PROFIT_VIEW = "orde_prof_v", // order_profit_view
//   DAILY_PROFIT_VIEW = "dail_prof_v", // daily_profit_view
//   MONTHLY_PROFIT_VIEW = "mont_prof_v", // monthly_profit_view

//   DAILY_REPORT_VIEW = "dail_repo_v", // daily_report_view
//   MONTHLY_REPORT_VIEW = "mont_repo_v", // monthly_report_view

//   SOURCE_REPORT_VIEW = "sour_repo_v", // source_report_view
//   CANCEL_REPORT_VIEW = "canc_repo_v", // cancel_report_view
//   CANCEL_BY_ORDER_VIEW = "canc_orde_v", // cancel_by_order_view
//   CANCEL_BY_SOURCE_VIEW = "canc_sour_v", // cancel_by_source_view
//   RETURN_BY_ORDER_VIEW = "retu_orde_v", // return_by_order_view
//   RETURN_BY_SOURCE_VIEW = "retu_sour_v", // return_by_source_view

//   USER_REPORT_VIEW = "user_repo_v", // user_report_view
//   ORDER_HISTORY_VIEW = "orde_hist_v", // order_history_view
//   WAREHOUSE_REPORT_VIEW = "ware_repo_v", // warehouse_report_view
//   BRAND_REPORT_VIEW = "bran_repo_v", // brand_report_view
//   CATEGORY_REPORT_VIEW = "cate_repo_v", // category_report_view
//   SALES_REPORT_VIEW = "sale_repo_v", // sales_report_view
//   SINGLE_PRODUCT_VIEW = "sing_prod_v", // single_product_view

//   MARKETING_CREATE = "mark_c", // marketing_create
//   MARKETING_VIEW = "mark_v", // marketing_view
//   MARKETING_EDIT = "mark_e", // marketing_edit
//   MARKETING_DELETE = "mark_d", // marketing_delete
//   MARKETING_REPORT_VIEW = "mark_repo_v", // marketing_report_view

//   ORDER_STATUS_PENDING = "orde_stat_pend", // order_status_pending
//   ORDER_STATUS_TO_BE_PAID = "orde_stat_payd", // order_status_to_be_paid
//   ORDER_STATUS_APPROVED = "orde_stat_appr", // order_status_approved
//   ORDER_STATUS_PRINTED = "orde_stat_prin", // order_status_printed
//   ORDER_STATUS_RD = "orde_stat_rd", // order_status_rd
//   ORDER_STATUS_TRANSIT = "orde_stat_tran", // order_status_transit
//   ORDER_STATUS_RETURN = "orde_stat_retu", // order_status_return
//   ORDER_STATUS_FOLLOW_UP = "orde_stat_foll", // order_status_follow_up
//   ORDER_STATUS_DELIVERY = "orde_stat_delv", // order_status_delivery
//   ORDER_STATUS_CANCELLED = "orde_stat_canc", // order_status_cancelled
//   ORDER_STATUS_EXCHANGE = "orde_stat_exch", // order_status_exchange

//   WHOLESALE_ORDER_STATUS_PENDING = "whol_stat_pend", // wholesale_order_status_pending
//   WHOLESALE_ORDER_STATUS_TO_BE_PAID = "whol_stat_payd", // wholesale_order_status_to_be_paid
//   WHOLESALE_ORDER_STATUS_APPROVED = "whol_stat_appr", // wholesale_order_status_approved
//   WHOLESALE_ORDER_STATUS_PRINTED = "whol_stat_prin", // wholesale_order_status_printed
//   WHOLESALE_ORDER_STATUS_RD = "whol_stat_rd", // wholesale_order_status_rd
//   WHOLESALE_ORDER_STATUS_TRANSIT = "whol_stat_tran", // wholesale_order_status_transit
//   WHOLESALE_ORDER_STATUS_RETURN = "whol_stat_retu", // wholesale_order_status_return
//   WHOLESALE_ORDER_STATUS_FOLLOW_UP = "whol_stat_foll", // wholesale_order_status_follow_up
//   WHOLESALE_ORDER_STATUS_DELIVERY = "whol_stat_delv", // wholesale_order_status_delivery
//   WHOLESALE_ORDER_STATUS_CANCELLED = "whol_stat_canc", // wholesale_order_status_cancelled
//   WHOLESALE_ORDER_STATUS_EXCHANGE = "whol_stat_exch", // wholesale_order_status_exchange

//   WHOLESALE_SALES_RETURN_CREATE = "whol_sale_retu_c", // wholesale_sales_return_create
//   WHOLESALE_SALES_RETURN_VIEW = "whol_sale_retu_v", // wholesale_sales_return_view
//   WHOLESALE_SALES_RETURN_EDIT = "whol_sale_retu_e", // wholesale_sales_return_edit

//   WHOLESALE_USER_REPORT_VIEW = "whol_user_repo_v", // wholesale_user_report_view

//   PROJECT_CREATE = "proj_c", // project_create
//   PROJECT_VIEW = "proj_v", // project_view
//   PROJECT_EDIT = "proj_e", // project_edit
//   PROJECT_DELETE = "proj_d", // project_delete

//   TASK_CREATE = "task_c", // task_create
//   TASK_VIEW = "task_v", // task_view
//   TASK_EDIT = "task_e", // task_edit
//   TASK_DELETE = "task_d", // task_delete

//   MY_TASK_VIEW = "myta_task_v", // my_task_view

//   ORDER_LOGS_VIEW = "orde_logs_v", // order_logs_view
// }
