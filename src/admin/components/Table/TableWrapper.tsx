"use client";
import React, { ReactNode, useEffect, useState } from "react";
import TableNoData from "./TableNoData";
import Button from "../core/Button/Button";
import Icon from "../core/Icon/Icon";
import BulkAction from "../pages/Orders/BulkAction";
import TableLoading from "./TableLoading";

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
}

const bulkBtnClass =
  "!inline-flex !h-8 !items-center !gap-1.5 !rounded-xl !border !border-[var(--brand-border-soft)] !bg-[var(--color-primary-soft)] !px-3 !py-0 !text-sm !font-medium !text-[var(--accent)] hover:!bg-[var(--brand-bg-medium)]";

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

  const showEmpty = !isLoading && Boolean(noDataViewCondition);

  return (
    <div
      className={`data-table-card glass-card rounded-2xl admin-table-wrap min-h-[560px] md:mt-2 mt-2 lg:mt-0 ${
        className ?? ""
      }`}
    >
      {isVisible && (
        <div
          className="data-table-fixed"
          style={{
            ...styles,
            visibility: isVisible ? "visible" : "hidden",
            transition: "max-height 0.9s ease-in-out, opacity 0.9s ease-in-out",
            overflow: "hidden",
          }}
        >
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start relative flex flex-wrap items-center gap-2">
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
            </div>
            {bulkActionBtn && openBulk && (
              <div className="data-table-toolbar-end">
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

      <div className="data-table-viewport">
        {isLoading ? (
          <div className="data-table-loading">
            <TableLoading />
          </div>
        ) : null}

        {showEmpty ? (
          <div className="data-table-state" aria-live="polite">
            <TableNoData isSwitch={isSwitchOn} />
          </div>
        ) : (
          <div className="data-table-scroll">
            <table
              data-test-id={dataTestId ?? "data-table"}
              className="data-table admin-data-table"
              style={{ minWidth: 680 }}
              cellSpacing="0"
            >
              {children}
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableWrapper;
