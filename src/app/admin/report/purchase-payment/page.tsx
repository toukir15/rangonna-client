// "use client";
// import CalendarRange from "@admin/components/core/Calendar/CalendarRange";
// import Icon from "@admin/components/core/Icon/Icon";
// import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
// import TableWrapper from "@admin/components/Table/TableWrapper";
// import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
// import {
//   formatDateRange,
//   formatDateTime,
//   useDebounce,
// } from "@admin/utils/hook.utils";
// import { ToastService } from "@admin/utils/toastr.service";
// import React, { useEffect, useState } from "react";
// import PaginationComponent from "@admin/components/core/Pazination/Pazination";
// import { PurchasesService } from "@admin/@services/apis/PurchasesService/Purchases.service";
// import { last30DaysRange } from "@admin/utils/helper";
// import { useLocalStorageDateRange } from "@admin/utils";
// import PageSearch from "@admin/components/core/Search/PageSearch";

// const DEFAULT_DATE_RANGE = {
//   ...last30DaysRange(),
//   label: "Last 30 Days",
// };

// const Page: React.FC = () => {
//   const [range, setRange] = useLocalStorageDateRange(
//     "purchasePaymentReportDate",
//     DEFAULT_DATE_RANGE
//   );
//   const [ordersPerPage, setOrdersPerPage] = useState<number>(20);
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//   };

//   const [tableLoading, setTableLoading] = useState<boolean>(true);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [totalOrders, setTotalOrders] = useState<number>(0);
//   const totalPages = Math.ceil(totalOrders / ordersPerPage);
//   const [reportIssueData, setReportIssueData] = useState<any[]>([]);

//   const handleLogsPerPageChange = (newLogsPerPage: number) => {
//     setOrdersPerPage(newLogsPerPage);
//     localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
//   };

//   const fetchPurchasePaymentReport = () => {
//     const formattedFrom = formatDateRange(range.startDate).trim();
//     const formattedTo = formatDateRange(range.endDate).trim();
//     setTableLoading(true);
//     PurchasesService.getPurchasePaymentReport({
//       searchTerm: debouncedSearchTerm,
//       page: currentPage,
//       limit: ordersPerPage,
//       startDate: formattedFrom,
//       endDate: formattedTo,
//     })
//       .then((res: any) => {
//         if (res?.success) {
//           setReportIssueData(res?.data.data);
//           setTotalOrders(res?.data?.meta?.total_record);
//         } else {
//           ToastService.error(res?.message);
//         }
//       })
//       .catch((err: { message: string }) => {
//         ToastService.error(err.message);
//       })
//       .finally(() => {
//         setTableLoading(false);
//       });
//   };

//   useEffect(() => {
//     fetchPurchasePaymentReport();
//   }, [debouncedSearchTerm, currentPage, ordersPerPage]);

//   return (
//     <AuthLayout>
//       <NoScrollLayout>
//         <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full mb-2">
//           <div className="lg:flex lg:flex-wrap items-center md:justify-between md:pb-2 pb-0">
//             <div className="md:flex items-center md:space-x-4 w-full">
//               <div className="">
//                 <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 flex text-nowrap">
//                   Purchase Payment Report
//                 </h1>
//               </div>
//               <div className="sm:flex items-center w-full justify-between">
//                 <CalendarRange
//                   range={range}
//                   setRange={setRange}
//                   className="sm:w-72 w-full"
//                 />

//                 <div className="sm:w-80 w-full sm:mt-0 mt-2">
//                   <PageSearch
//                     value={searchTerm}
//                     onChange={handleSearchChange}
//                     wrapperClass="w-full"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </NoScrollLayout>

//       <div className="2xl:px-4 px-3 relative md:min-h-[85%] w-full">
//         <TableWrapper
//           showCheckbox={true}
//           data={reportIssueData}
//           noDataViewCondition={
//             reportIssueData.length < 1 ? "No data available" : null
//           }
//           isSwitchOn={true}
//           className="min-h-[650px]"
//           isLoading={tableLoading}
//           colValue={9}
//         >
//           <Thead>
//             <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
//               <Th className="2xl:min-w-36 lg:min-w-28 min-w-28 dark:text-gray-200 text-nowrap">
//                 Reference
//               </Th>
//               <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200 text-nowrap">
//                 Supplier
//               </Th>

//               <Th className="2xl:min-w-36 lg:min-w-28 min-w-32 dark:text-gray-200 text-nowrap">
//                 Payment Method
//               </Th>

//               <Th className="2xl:min-w-36 lg:min-w-28 min-w-32 dark:text-gray-200">
//                 Account
//               </Th>
//               <Th className="2xl:min-w-36 lg:min-w-28 min-w-32 dark:text-gray-200">
//                 Amount
//               </Th>
//               <Th className="2xl:min-w-36 lg:min-w-28 min-w-40 dark:text-gray-200">
//                 Date
//               </Th>
//             </Tr>
//           </Thead>
//           <Tbody className="dark:bg-gray-800 bg-white">
//             {reportIssueData?.map((paymentData: any, index: number) => {
//               return (
//                 <Tr
//                   className="hover:bg-gray-100 dark:hover:bg-gray-800"
//                   key={index}
//                 >
//                   <Td>{paymentData?.ref_no}</Td>
//                   <Td>{paymentData?.purchase?.supplier?.name}</Td>

//                   <Td className="capitalize">
//                     {paymentData?.payment_method === "mobile_banking"
//                       ? "Mobile Banking"
//                       : paymentData?.payment_method === "bank_transfer"
//                       ? "Bank Transfer"
//                       : paymentData?.payment_method}
//                   </Td>
//                   <Td>{paymentData?.account?.account_name}</Td>
//                   <Td>{paymentData?.amount}</Td>
//                   <Td>{formatDateTime(paymentData?.createdAt)}</Td>
//                 </Tr>
//               );
//             })}
//           </Tbody>
//         </TableWrapper>

//         <PaginationComponent
//           ordersPerPage={ordersPerPage}
//           handleOrdersPerPageChange={handleLogsPerPageChange}
//           currentPage={currentPage}
//           setCurrentPage={setCurrentPage}
//           totalPages={totalPages}
//           totalData={totalOrders}
//         />
//       </div>
//     </AuthLayout>
//   );
// };

// export default Page;
