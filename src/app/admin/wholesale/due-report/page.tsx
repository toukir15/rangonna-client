"use client";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useRef, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { WholesaleReturnService } from "@admin/@services/apis/WholesaleService/wholesale.service";
import {
  IWholesaleUserReport,
  IWholesaleUserReportResponse,
} from "@admin/@interfaces/wholesale/wholesaleReport.interface";
import Icon from "@admin/components/core/Icon/Icon";
import WholeSaleCreatePaymentModal from "@admin/components/pages/wholesale/WholeSalePaymentModal/WholeSalePaymentModal";
import { dueColor, paidColor } from "@admin/utils/constant";

const Page: React.FC = () => {
  const [wholeSaleReportData, setWholeSaleReportData] = useState<
    IWholesaleUserReport[]
  >([]);
  const [ordersPerPage, setOrdersPerPage] = useState<number>(10);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
  };
  //  const [modalIsOpen, setIsModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<any>();
  // const [order, setOrder] = useState<string>();
  const [modalMode, setModalMode] = useState<"Add" | "Edit" | "View">("View");

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setPopupIndex(null);
      }
    };

    if (popupIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupIndex]);

  useEffect(() => {
    fetchMarketingReport();
  }, [currentPage, ordersPerPage]);

  const fetchMarketingReport = async () => {
    setTableLoading(true);
    WholesaleReturnService.getWholesaleReport({
      page: currentPage,
      limit: ordersPerPage,
    })
      .then((res: IWholesaleUserReportResponse) => {
        if (res?.success) {
          setWholeSaleReportData(res.data.data);
          setTotalOrders(res?.data?.meta?.total_record);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setTableLoading(false);
      });
  };

  const handleCreatePayment = (item: any) => {
    setModalMode("Add");
    setModalOpen(true);
    setPaymentData(item);
  };
  const handleShowPayments = (item: any) => {
    setModalMode("View");
    setModalOpen(true);
    setPaymentData(item);
  };

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap  items-center md:justify-between pb-2">
            <div className="md:flex items-center md:space-x-4 w-full">
              <div className="">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 flex text-nowrap">
                  Wholesale Report
                </h1>
              </div>
            </div>
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full ">
        <TableWrapper
          showCheckbox={true}
          data={wholeSaleReportData}
          noDataViewCondition={
            wholeSaleReportData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[700px]"
          isLoading={tableLoading}
          colValue={9}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-40 text-blue-900 dark:text-gray-200">
                User Details
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Total Order
              </Th>
              <Th className="2xl:min-w-20 lg:min-w-32 min-w-20  text-blue-900 dark:text-gray-200">
                Active Amount
              </Th>
              <Th className="2xl:min-w-20 lg:min-w-32 min-w-20  text-blue-900 dark:text-gray-200">
                Total
              </Th>

              <Th className="2xl:min-w-20 lg:min-w-32 min-w-20  text-blue-900 dark:text-gray-200">
                Delivery
              </Th>
              <Th className="2xl:min-w-20 lg:min-w-32 min-w-20  text-blue-900 dark:text-gray-200">
                Discount
              </Th>
              <Th className="2xl:min-w-20 lg:min-w-32 min-w-20  text-blue-900 dark:text-gray-200">
                Return
              </Th>

              <Th className="2xl:min-w-20 lg:min-w-32 min-w-20  text-blue-900 dark:text-gray-200">
                Paid
              </Th>
              <Th className="2xl:min-w-20 lg:min-w-32 min-w-20  text-blue-900 dark:text-gray-200">
                Due
              </Th>

              <Th className="2xl:min-w-20 lg:min-w-32 min-w-20  text-blue-900 dark:text-gray-200">
                Cancel
              </Th>
              <Th className="text-blue-900 dark:text-gray-200">Action</Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {wholeSaleReportData?.map(
              (wholesaleReport: IWholesaleUserReport, index: number) => {
                return (
                  <Tr
                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    key={index}
                  >
                    <Td>
                      <div>
                        <p>{wholesaleReport?._id?.user_name}</p>
                        <p className="pt-1">
                          {wholesaleReport?._id?.user_phone}
                        </p>
                      </div>
                    </Td>
                    <Td>{wholesaleReport?.total_order}</Td>
                    <Td>{wholesaleReport?.active_amount}</Td>
                    <Td>{wholesaleReport?.total_amount}</Td>
                    <Td>{wholesaleReport?.delivery_amount}</Td>
                    <Td>{wholesaleReport?.discount_total}</Td>
                    <Td>{wholesaleReport?.return_amount}</Td>
                    <Td>
                      <p className={`${paidColor}`}>{wholesaleReport?.total_paid}</p>
                    </Td>
                    <Td>
                      <p className={`${dueColor}`}>{Number(
                        wholesaleReport?.delivery_amount -
                        wholesaleReport?.total_paid -
                        wholesaleReport?.return_amount -
                        wholesaleReport?.discount_total
                      )}</p>
                    </Td>

                    <Td>{wholesaleReport?.cancel_amount}</Td>
                    <Td className="">
                      {/* {permissionList.includes("wholesale_user_edit") && ( */}
                      <div className="relative">
                        <Icon
                          name={"more_horiz"}
                          variant="outlined"
                          onClick={() => togglePopup(index)}
                          className="cursor-pointer"
                        />
                        {popupIndex === index && (
                          <div
                            ref={popupRef}
                            className="absolute top-8 right-0 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-4 z-20 min-w-40"
                          >

                            <button
                              className="block w-52  text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                              onClick={() =>
                                handleCreatePayment(wholesaleReport)
                              }
                            >
                              Create Payment
                            </button>
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg "
                              onClick={() =>
                                handleShowPayments(wholesaleReport)
                              }
                            >
                              Payment History
                            </button>
                          </div>
                        )}
                      </div>
                      {/* )} */}
                    </Td>
                  </Tr>
                );
              }
            )}
          </Tbody>
        </TableWrapper>

        <PaginationComponent
          ordersPerPage={ordersPerPage}
          handleOrdersPerPageChange={handleLogsPerPageChange}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          totalData={totalOrders}
        />

        <WholeSaleCreatePaymentModal
          isModalOpen={modalOpen}
          setIsModalOpen={setModalOpen}
          paymentData={paymentData}
          modalMode={modalMode}
          refreshData={fetchMarketingReport}
          setModalMode={setModalMode}
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
