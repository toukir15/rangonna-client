// components/pages/ReturnLists/ReturnFilter.tsx
"use client";
import React from "react";
import SelectComponent from "@admin/components/core/Select/Select";
import CalendarRange from "@admin/components/core/Calendar/CalendarRange";
import { SelectOption } from "@admin/@interfaces/common.interface";
import CustomDatePicker from "@admin/components/core/Calendar/DatePicker";
import Icon from "@admin/components/core/Icon/Icon";

type Props = {
  isCalendarFilter?: boolean;
  range?: any;
  setRange?: any;
  isSourceFilter?: boolean;
  allSourceOptions?: SelectOption[];
  selectedSource?: SelectOption;
  setSelectedSource?: (_val: SelectOption) => void;
  isStatusFilter?: boolean;
  statusOption?: SelectOption[];
  selectedStatus?: SelectOption;
  setSelectedStatus?: any
  isWarehouseFilter?: boolean;
  warehouseDataOption?: SelectOption[];
  selectedWarehouse?: SelectOption;
  setSelectedWarehouse?: (_val: SelectOption) => void;
  isCategoryFilter?: boolean;
  reportCategories?: SelectOption[];
  selectedIssueTitle?: SelectOption;
  setSelectedIssueTitle?: any;
  setCurrentPage?: any;
  isErrorFilter?: boolean;
  errorOption?: SelectOption[];
  selectedError?: SelectOption;
  setSelectedError?: (_val: SelectOption) => void;
  isOrderStatusFilter?: boolean;
  orderStatusOptions?: SelectOption[];
  selectedOrderStatus?: SelectOption;
  setSelectedOrderStatus?: (_val: SelectOption) => void;
  isAccountFilter?: boolean;
  accountOptions?: SelectOption[];
  selectedAccount?: any;
  setSelectedAccountId?: any;
  isExpenseFilter?: boolean;
  expenseOption?: SelectOption[];
  selectedExpenses?: any;
  setSelectedExpenseId?: any;
  setSelectedSubTitle?: any;
  isExpenseSubFilter?: boolean;
  expenseSubOption?: any;
  selectedSubExpenses?: any;
  subOptionLoading?: any;
  selectedExpenseId?: any;
  isDateFilter?: boolean;
  selectedMonth?: Date | null;
  setSelectedMonth?: any;
  isCategoryOptionFilter?: boolean;
  categoryOptions?: SelectOption[];
  selectedCategory?: SelectOption;
  setSelectedCategory?: any;
  isBrandOptionFilter?: boolean;
  brandOptions?: SelectOption[];
  selectedBrand?: SelectOption;
  setSelectedBrand?: any;
  isStatusOptionFilter?: boolean;
  stockStatusOptions?: SelectOption[];
  cardLoading?: boolean;

  isSeoFilter?: boolean;
  seoOptions?: SelectOption[];
  selectedSeo?: SelectOption;
  setSelectedSeo?: (_val: SelectOption) => void;

  isCourierTypeFilter?: boolean;
  courierTypeOptions?: SelectOption[];
  selectedCourierType?: SelectOption;
  setSelectedCourierType?: (_val: SelectOption) => void;

};

const AllFilter: React.FC<Props> = ({
  range,
  setRange,
  isCalendarFilter = false,
  isSourceFilter = false,
  allSourceOptions,
  selectedSource,
  setSelectedSource,
  isStatusFilter = false,
  statusOption,
  selectedStatus,
  setSelectedStatus,
  isWarehouseFilter,
  warehouseDataOption,
  selectedWarehouse,
  setSelectedWarehouse,
  isCategoryFilter,
  reportCategories,
  selectedIssueTitle,
  setSelectedIssueTitle,
  setCurrentPage,
  isErrorFilter,
  errorOption,
  selectedError,
  setSelectedError,
  isOrderStatusFilter,
  orderStatusOptions,
  selectedOrderStatus,
  setSelectedOrderStatus,
  isAccountFilter,
  accountOptions,
  selectedAccount,
  setSelectedAccountId,
  isExpenseFilter,
  expenseOption,
  selectedExpenses,
  setSelectedExpenseId,
  setSelectedSubTitle,
  isExpenseSubFilter,
  expenseSubOption,
  selectedSubExpenses,
  subOptionLoading,
  selectedExpenseId,
  isDateFilter,
  selectedMonth,
  setSelectedMonth,
  isCategoryOptionFilter,
  categoryOptions,
  selectedCategory,
  setSelectedCategory,
  isBrandOptionFilter,
  brandOptions,
  selectedBrand,
  setSelectedBrand,
  isStatusOptionFilter,
  stockStatusOptions,
  cardLoading,
  isSeoFilter,
  seoOptions,
  selectedSeo,
  setSelectedSeo,
  isCourierTypeFilter,
  courierTypeOptions,
  selectedCourierType,
  setSelectedCourierType,

}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
        {isCalendarFilter && (
          <div className="">
            <CalendarRange range={range} setRange={setRange} />
          </div>
        )}

        {isSourceFilter && (
          <label className="data-table-filter">
            <Icon name="tune" variant="outlined" size={18} />
            <SelectComponent
              options={allSourceOptions}
              value={selectedSource}
              onChange={setSelectedSource}
              placeholder="All Source"
              className="data-table-filter-select"
              size="sm"
            />
          </label>
        )}

        {isStatusFilter && (
          <div className="">
            <SelectComponent
              options={statusOption}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Select Status"
              className="md:w-48 w-full"
            />
          </div>
        )}
        {isWarehouseFilter && (
          <div className="">
            <SelectComponent
              options={warehouseDataOption}
              value={selectedWarehouse}
              onChange={setSelectedWarehouse}
              placeholder="All Warehouse"
              className="md:w-60 w-full"
            />
          </div>
        )}
        {isCategoryFilter && (
          <div className="">
            <SelectComponent
              options={reportCategories}
              value={selectedIssueTitle}
              onChange={(opt: any) => {
                setSelectedIssueTitle(opt);
                setCurrentPage(1);
              }}
              placeholder="Select Issue Title"
              className="md:w-56 w-full"
            />
          </div>
        )}
        {isErrorFilter && (
          <div className="">
            <SelectComponent
              options={errorOption}
              value={selectedError}
              onChange={setSelectedError}
              placeholder="Select Status"
              className="md:w-44 w-full"
            />
          </div>
        )}
        {isOrderStatusFilter && (
          <div className="">
            <SelectComponent
              options={orderStatusOptions}
              value={selectedOrderStatus}
              onChange={setSelectedOrderStatus}
              placeholder="Select Status"
              className="md:w-44 w-full"
            />
          </div>
        )}
        {isAccountFilter && (
          <div className="">
            <SelectComponent
              options={accountOptions}
              value={selectedAccount}
              onChange={(opt: any) => {
                setSelectedAccountId(opt?.value || null);
                setCurrentPage(1);
              }}
              placeholder="Select Account"
              className="md:w-48 w-full"
            />
          </div>
        )}
        {isExpenseFilter && (
          <div className="">
            <SelectComponent
              options={expenseOption}
              value={selectedExpenses}
              onChange={(opt: any) => {
                setSelectedExpenseId(opt?.value || null);
                setSelectedSubTitle(null);
                setCurrentPage(1);
              }}
              placeholder="Expense"
              className="md:w-48 w-full"
            />
          </div>
        )}
        {isExpenseSubFilter && (
          <div className="">
            <SelectComponent
              options={expenseSubOption}
              value={selectedSubExpenses}
              onChange={(opt: any) => {
                setSelectedSubTitle(opt?.value || null);
                setCurrentPage(1);
              }}
              placeholder={subOptionLoading ? "Loading..." : "Sub Title"}
              className="md:w-48 w-full"
              isDisabled={!selectedExpenseId || subOptionLoading}
            />
          </div>
        )}
        {isDateFilter && (
          <div className="">
            <CustomDatePicker
              selectedDate={selectedMonth ?? null}
              onChange={(date) => setSelectedMonth?.(date)}
              dateFormat="MM/yyyy"
              showMonthYearPicker
              placeholderText="All"
              wrapperClassName="w-64"
              showAllOption
              allOptionLabel="All"
            />
          </div>
        )}
        {isCategoryOptionFilter && (
          <div className="">
            <SelectComponent
              options={categoryOptions}
              value={selectedCategory}
              onChange={(value: SelectOption) => {
                setSelectedCategory(value);
                setCurrentPage(1);
              }}
              placeholder="All"
              className="md:w-44 w-full"
            />
          </div>
        )}
        {isBrandOptionFilter && (
          <div className="">
            <SelectComponent
              options={brandOptions}
              value={selectedBrand}
              onChange={(value: SelectOption) => {
                setSelectedBrand(value);
                setCurrentPage(1);
              }}
              placeholder="Select Brand"
              className="md:w-44 w-full"
            />
          </div>
        )}
        {isStatusOptionFilter && (
          <div className="">
            <SelectComponent
              options={stockStatusOptions}
              value={selectedStatus}
              onChange={(value: SelectOption) => {
                setSelectedStatus(value);
                setCurrentPage(1);
              }}
              placeholder="Select Status"
              className="md:w-60 w-full"
              isDisabled={cardLoading}
            />
          </div>
        )}
        {isSeoFilter && (
          <div className="">
            <SelectComponent
              options={seoOptions}
              value={selectedSeo}
              onChange={(value: SelectOption) => {
                setSelectedSeo?.(value);
                setCurrentPage(1);
              }}
              placeholder="SEO"
              className="md:w-44 w-full"
            />
          </div>
        )}
        {isCourierTypeFilter && (
          <label className="data-table-filter">
            <Icon name="local_shipping" variant="outlined" size={18} />
            <SelectComponent
              options={courierTypeOptions}
              value={selectedCourierType}
              onChange={(value: SelectOption) => {
                setSelectedCourierType?.(value);
                setCurrentPage?.(1);
              }}
              placeholder="Select Courier"
              className="data-table-filter-select"
              size="sm"
            />
          </label>
        )}
    </div>
  );
};

export default AllFilter;
