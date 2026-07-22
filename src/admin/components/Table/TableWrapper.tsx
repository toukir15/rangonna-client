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
      className={`w-full md:mt-2 mt-2 lg:mt-0 rounded-lg shadow-sm overflow-x-auto dark:bg-gray-800 bg-white scrollbar-hide ${
        className ?? ""
      }`}
    >
      {isVisible && (
        <div
          className="overflow-hidden md:mb-3 mb-2"
          style={{
            ...styles,
            visibility: isVisible ? "visible" : "hidden",
            transition: "max-height 0.9s ease-in-out, opacity 0.9s ease-in-out",
          }}
        >
          <div className="flex flex-wrap items-center md:gap-6 gap-4 px-2 pt-2">
            {orderListPrintBtn && (
              <Button
                onClick={handleListPrintSelected}
                className="!py-1 !px-4 bg-blue-100 !text-blue-700 flex items-center"
              >
                <Icon name={"list_alt"} variant="outlined" />
                <span className="ml-1">Order List</span>
              </Button>
            )}
            {orderInvoicePrintBtn && (
              <Button
                onClick={handleOrderInvoicePrint}
                className="!py-1 !px-4 bg-blue-100 !text-blue-700 flex items-center"
              >
                <Icon name={"inventory"} variant="outlined" />
                <span className="ml-1">Order Invoice</span>
              </Button>
            )}

            {labelPrintBtn && (
              <Button
                onClick={handleOrderLabelPrintSelected}
                className="!py-1 !px-4 bg-blue-100 !text-blue-700 flex items-center"
              >
                <Icon name={"label_important"} variant="outlined" />
                <span className="ml-1">{printLabel}sss</span>
              </Button>
            )}
            {labelPrintBtn && (
              <Button
                onClick={handleOrderCouponPrint}
                className="!py-1 !px-4 bg-blue-100 !text-blue-700 flex items-center"
              >
                <Icon name={"label_important"} variant="outlined" />
                <span className="ml-1">{printCoupon}</span>
              </Button>
            )}

            {bulkActionBtn && openBulk && (
              <div className="absolute right-6 mt-2">
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
      <div className="relative">
        {selectedWebsite === null ? <SelectWebsite /> : null}
        {isLoading && <TableLoading />}
        <table
          data-test-id={dataTestId ?? "data-table"}
          className="w-full text-left"
          cellSpacing="0"
        >
          {children}
          {!isLoading && noDataViewCondition && (
            <tbody>
              <tr>
                <td
                  colSpan={colValue ? colValue : 5}
                  className="text-center text-gray-500 align-middle"
                  // style={{ height: "200px" }}
                >
                  <TableNoData isSwitch={isSwitchOn} />
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};

export default TableWrapper;

// "use client";
// import React, { ReactNode, useEffect, useState } from "react";
// import TableNoData from "./TableNoData";
// import Button from "../core/Button/Button";
// import Icon from "../core/Icon/Icon";
// import BulkAction from "../pages/Orders/BulkAction";
// import TableLoading from "./TableLoading";

// interface TableWrapperProps {
//   data?: any[] | any;
//   noDataViewCondition?: any;
//   nodataView?: ReactNode;
//   className?: string;
//   dataTestId?: string;
//   showCheckbox?: boolean;
//   children: ReactNode;
//   isLoading?: boolean;
//   isSwitchOn?: boolean | null;
//   isSelect?: boolean;
//   handleListPrintSelected?: () => void;
//   handleOrderPrintSelected?: () => void;
//   handleOrderLabelPrintSelected?: () => void;
//   handleOrderCouponPrint?: () => void;
//   colValue?: number;
//   printLabel?: string;
//   printCoupon?: string;
//   selectedAction?: any;
//   setSelectedAction?: any;
//   handleBulkAction?: any;
//   handleOrderInvoicePrint?: () => void;
//   handleOrderPrintSelectedTwo?: () => void;
//   statusSubmitting?: boolean;
//   orderListPrintBtn?: boolean;
//   orderInvoicePrintBtn?: boolean;
//   labelPrintBtn?: boolean;
//   bulkActionBtn?: boolean;
// }

// const TableWrapper: React.FC<TableWrapperProps> = ({
//   isSwitchOn,
//   data = [],
//   noDataViewCondition = data.length === 0,
//   nodataView = "",
//   className,
//   dataTestId,
//   showCheckbox = false,
//   children,
//   isLoading,
//   isSelect,
//   handleListPrintSelected,
//   handleOrderLabelPrintSelected,
//   handleOrderCouponPrint,
//   colValue,
//   printLabel,
//   printCoupon,
//   selectedAction,
//   setSelectedAction,
//   handleBulkAction,
//   handleOrderInvoicePrint,
//   statusSubmitting,
//   orderListPrintBtn,
//   orderInvoicePrintBtn,
//   labelPrintBtn,
//   bulkActionBtn,
// }) => {
//   const [isVisible, setIsVisible] = useState(false);
//   const [styles, setStyles] = useState({
//     maxHeight: "0px",
//     opacity: 0,
//   });

//   useEffect(() => {
//     if (isSelect) {
//       setIsVisible(true);
//       setTimeout(() => {
//         setStyles({
//           maxHeight: "1000px",
//           opacity: 1,
//         });
//       }, 100);
//     } else {
//       setStyles({
//         maxHeight: "0px",
//         opacity: 0,
//       });
//       setTimeout(() => {
//         setIsVisible(false);
//       }, 900);
//     }
//   }, [isSelect]);

//   return (
//     <div
//       className={`w-full md:mt-5 mt-2 lg:mt-0 rounded-lg shadow-sm overflow-x-auto dark:bg-gray-800 bg-white scrollbar-hide  ${
//         className ?? ""
//       }`}
//     >
//       {isVisible && (
//         <div
//           className="overflow-hidden md:mb-3 mb-2"
//           style={{
//             ...styles,
//             visibility: isVisible ? "visible" : "hidden",
//             transition: "max-height 0.9s ease-in-out, opacity 0.9s ease-in-out",
//           }}
//         >
//           <div className="flex flex-wrap items-center md:gap-6 gap-4 px-2 pt-2">
//             {orderListPrintBtn && (
//               <Button
//                 onClick={handleListPrintSelected}
//                 className="!py-1 !px-4 bg-blue-100 !text-blue-700 flex items-center"
//               >
//                 <Icon name={"list_alt"} variant="outlined" />
//                 <span className="ml-1">Order List</span>
//               </Button>
//             )}
//             {orderInvoicePrintBtn && (
//               <Button
//                 onClick={handleOrderInvoicePrint}
//                 className="!py-1 !px-4 bg-blue-100 !text-blue-700 flex items-center"
//               >
//                 <Icon name={"inventory"} variant="outlined" />
//                 <span className="ml-1">Order Invoice</span>
//               </Button>
//             )}
//             {labelPrintBtn && (
//               <Button
//                 onClick={handleOrderLabelPrintSelected}
//                 className="!py-1 !px-4 bg-blue-100 !text-blue-700 flex items-center"
//               >
//                 <Icon name={"label_important"} variant="outlined" />
//                 <span className="ml-1">{printLabel}</span>
//               </Button>
//             )}
//             {labelPrintBtn && (
//               <Button
//                 onClick={handleOrderCouponPrint}
//                 className="!py-1 !px-4 bg-blue-100 !text-blue-700 flex items-center"
//               >
//                 <Icon name={"label_important"} variant="outlined" />
//                 <span className="ml-1">{printCoupon}</span>
//               </Button>
//             )}
//             {bulkActionBtn && (
//               <div className="absolute right-6 mt-2">
//                 <BulkAction
//                   selectedAction={selectedAction}
//                   setSelectedAction={setSelectedAction}
//                   handleBulkAction={handleBulkAction}
//                   statusSubmitting={statusSubmitting}
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       <div className="relative max-h-[1000px] overflow-y-auto scrollbar-hide">
//         {isLoading && <TableLoading />}
//         <table
//           data-test-id={dataTestId ?? "data-table"}
//           className="w-full text-left min-w-[700px]"
//           cellSpacing="0"
//         >
//           {children}
//           {!isLoading && noDataViewCondition && (
//             <tbody>
//               <tr>
//                 <td
//                   colSpan={colValue ? colValue : 5}
//                   className="text-center text-gray-500 align-middle"
//                 >
//                   <TableNoData isSwitch={isSwitchOn} />
//                 </td>
//               </tr>
//             </tbody>
//           )}
//         </table>
//       </div>
//     </div>
//   );
// };

// export default TableWrapper;
