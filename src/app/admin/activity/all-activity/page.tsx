"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { userLogsService } from "@admin/@services/apis/Activity/UserLogs/userLogs.service";
import PageSearch from "@admin/components/core/Search/PageSearch";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import {
  IUserLog,
  IUserLogsResponse,
} from "@admin/@interfaces/activity/userLogs.interface";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import Icon from "@admin/components/core/Icon/Icon";
import UserLogViewModal from "@admin/components/pages/Activity/UserLogs/UserLogViewModal";
import { renderLogMessage } from "@admin/components/pages/Lavels/RanderLoadString";

const Page: React.FC = () => {
  const [userLogsData, setUserLogsData] = useState<IUserLog[]>([]);
  const [ordersPerPage, setOrdersPerPage] = useState<number>(10);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);

  const [modalOpen, setModalOpen] = useState(false);
  const [productId, setProductId] = useState<string>();

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchUserLogs();
  }, [debouncedSearchTerm, currentPage, ordersPerPage]);

  const fetchUserLogs = async () => {
    setTableLoading(true);
    userLogsService
      .getUserLogs({
        searchTerm: debouncedSearchTerm,
        page: currentPage,
        limit: ordersPerPage,
      })
      .then((res: IUserLogsResponse) => {
        if (res?.success) {
          setUserLogsData(res.data.data);
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
  useTableRefreshRegister(fetchUserLogs);


  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap  items-center md:justify-between pb-2">
            <div className="md:flex items-center md:space-x-4 w-full">
              <div className="">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 flex text-nowrap">
                  User Logs
                </h1>
              </div>
              <div className="md:w-80 w-full md:mt-0 mt-1">
                <PageSearch
                  value={searchTerm}
                  onChange={handleSearchChange}
                  wrapperClass="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full ">
        <TableWrapper
          showCheckbox={true}
          data={userLogsData}
          noDataViewCondition={
            userLogsData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[700px]"
          isLoading={tableLoading}
          colValue={9}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-40 text-blue-900 dark:text-gray-200">
                User
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Action
              </Th>

              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Create
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Update
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Message
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                View
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {userLogsData?.map((LogsData: IUserLog, index: number) => {
              return (
                <Tr
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
                >
                  <Td>{LogsData?.user?.name}</Td>
                  <Td>{LogsData?.action}</Td>
                  <Td>{formatTimeAgo(LogsData?.createdAt)}</Td>
                  <Td>{formatTimeAgo(LogsData?.updatedAt)}</Td>

                  <Td>
                    {LogsData?.log_message
                      ? renderLogMessage(LogsData?.log_message)
                      : null}
                  </Td>
                  <Td>
                    <Icon
                      onClick={() => {
                        setModalOpen(true);
                        setProductId(LogsData?._id);
                      }}
                      name={"visibility"}
                      variant="outlined"
                      className="cursor-pointer"
                    />
                  </Td>
                </Tr>
              );
            })}
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

        <UserLogViewModal
          isModalOpen={modalOpen}
          setIsModalOpen={setModalOpen}
          productId={productId}
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
