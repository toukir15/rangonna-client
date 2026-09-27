"use client";
import React, { ReactNode, useEffect, useState } from "react";
import TableNoData from "./TableNoData";
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
                <button
                  type="button"
                  onClick={handleListPrintSelected}
                  className="data-table-bulk-btn"
                >
                  <Icon name="list_alt" variant="outlined" size={18} />
                  <span className="data-table-bulk-btn__label">Order List</span>
                </button>
              )}
              {orderInvoicePrintBtn && (
                <button
                  type="button"
                  onClick={handleOrderInvoicePrint}
                  className="data-table-bulk-btn"
                >
                  <Icon name="inventory" variant="outlined" size={18} />
                  <span className="data-table-bulk-btn__label">Order Invoice</span>
                </button>
              )}
              {labelPrintBtn && (
                <button
                  type="button"
                  onClick={handleOrderLabelPrintSelected}
                  className="data-table-bulk-btn"
                >
                  <Icon name="label_important" variant="outlined" size={18} />
                  <span className="data-table-bulk-btn__label">{printLabel}</span>
                </button>
              )}
              {labelPrintBtn && (
                <button
                  type="button"
                  onClick={handleOrderCouponPrint}
                  className="data-table-bulk-btn"
                >
                  <Icon name="label_important" variant="outlined" size={18} />
                  <span className="data-table-bulk-btn__label">{printCoupon}</span>
                </button>
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

      <div className={`data-table-viewport${isLoading ? " is-loading" : ""}`}>
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
