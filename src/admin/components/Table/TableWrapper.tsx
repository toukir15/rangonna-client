"use client";
import React, { ReactNode, useEffect, useState } from "react";
import TableNoData from "./TableNoData";
import Button from "../core/Button/Button";
import Icon from "../core/Icon/Icon";
import BulkAction from "../pages/Orders/BulkAction";
import TableLoading from "./TableLoading";
import SelectWebsite from "./SelectWebsite";

interface TableWrapperProps {
  data?: any[] | any;
  noDataViewCondition?: any;
  nodataView?: ReactNode;
  className?: string;
  dataTestId?: string;
  showCheckbox?: boolean;
  children: ReactNode;
  isLoading?: boolean;
  isSwitchOn?: boolean | null;
  isSelect?: boolean;
  handleListPrintSelected?: () => void;
  handleOrderPrintSelected?: () => void;
  handleOrderLabelPrintSelected?: () => void;
  handleOrderCouponPrint?: () => void;
  colValue?: number;
  printLabel?: string;
  printCoupon?: string;
  selectedAction?: any;
  setSelectedAction?: any;
  handleBulkAction?: any;
  handleOrderInvoicePrint?: () => void;
  handleOrderPrintSelectedTwo?: () => void;
  statusSubmitting?: boolean;
  orderListPrintBtn?: boolean;
  orderInvoicePrintBtn?: boolean;
  labelPrintBtn?: boolean;
  bulkActionBtn?: boolean;
  openBulk?: boolean;
  selectedWebsite?: boolean;
}

const bulkBtnClass =
  "!inline-flex !h-8 !items-center !gap-1.5 !rounded-lg !border !border-green-200 !bg-green-50 !px-3 !py-0 !text-sm !font-medium !text-green-700 hover:!bg-green-100 dark:!border-green-500/30 dark:!bg-green-950/40 dark:!text-green-300 dark:hover:!bg-green-900/50";

const TableWrapper: React.FC<TableWrapperProps> = ({
  isSwitchOn,
  data = [],
  noDataViewCondition = data.length === 0,
  className,
  dataTestId,
  children,
  isLoading,
  isSelect,
  handleListPrintSelected,
  handleOrderLabelPrintSelected,
  handleOrderCouponPrint,
  colValue,
  printLabel,
  printCoupon,
  selectedAction,
  setSelectedAction,
  handleBulkAction,
  handleOrderInvoicePrint,
  statusSubmitting,
  orderListPrintBtn,
  orderInvoicePrintBtn,
  labelPrintBtn,
  bulkActionBtn,
  openBulk,
  selectedWebsite,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [styles, setStyles] = useState({
    maxHeight: "0px",
    opacity: 0,
  });

  useEffect(() => {
    if (isSelect) {
      setIsVisible(true);
      setTimeout(() => {
        setStyles({
          maxHeight: "700px",
          opacity: 1,
        });
      }, 100);
    } else {
      setStyles({
        maxHeight: "0px",
        opacity: 0,
      });
      setTimeout(() => {
        setIsVisible(false);
      }, 900);
    }
  }, [isSelect]);

  return (
    <div
      className={`admin-table-shell flex min-h-[560px] w-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900 md:mt-2 mt-2 lg:mt-0 ${
        className ?? ""
      }`}
    >
      {isVisible && (
        <div
          className="overflow-hidden border-b border-black/5 dark:border-white/10"
          style={{
            ...styles,
            visibility: isVisible ? "visible" : "hidden",
            transition: "max-height 0.9s ease-in-out, opacity 0.9s ease-in-out",
          }}
        >
          <div className="relative flex flex-wrap items-center gap-2 px-3 py-2.5">
            {orderListPrintBtn && (
              <Button onClick={handleListPrintSelected} className={bulkBtnClass}>
                <Icon name="list_alt" variant="outlined" size={18} />
                <span>Order List</span>
              </Button>
            )}
            {orderInvoicePrintBtn && (
              <Button onClick={handleOrderInvoicePrint} className={bulkBtnClass}>
                <Icon name="inventory" variant="outlined" size={18} />
                <span>Order Invoice</span>
              </Button>
            )}
            {labelPrintBtn && (
              <Button
                onClick={handleOrderLabelPrintSelected}
                className={bulkBtnClass}
              >
                <Icon name="label_important" variant="outlined" size={18} />
                <span>{printLabel}</span>
              </Button>
            )}
            {labelPrintBtn && (
              <Button onClick={handleOrderCouponPrint} className={bulkBtnClass}>
                <Icon name="label_important" variant="outlined" size={18} />
                <span>{printCoupon}</span>
              </Button>
            )}
            {bulkActionBtn && openBulk && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <BulkAction
                  selectedAction={selectedAction}
                  setSelectedAction={setSelectedAction}
                  handleBulkAction={handleBulkAction}
                  statusSubmitting={statusSubmitting}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative min-h-0 w-full flex-1 overflow-x-auto">
        {selectedWebsite === null ? <SelectWebsite /> : null}
        {isLoading && <TableLoading />}
        <table
          data-test-id={dataTestId ?? "data-table"}
          className="admin-data-table w-full min-w-[680px] border-collapse text-left text-sm"
          cellSpacing="0"
        >
          {children}
        </table>
        {!isLoading && noDataViewCondition ? (
          <div
            className="absolute inset-x-0 bottom-0 top-[50px] z-[1] flex items-center justify-center bg-white dark:bg-gray-900"
            aria-live="polite"
          >
            <TableNoData isSwitch={isSwitchOn} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TableWrapper;
