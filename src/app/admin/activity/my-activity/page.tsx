"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import {
  IUserLog,
  IUserLogsResponse,
} from "@admin/@interfaces/activity/userLogs.interface";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import Icon from "@admin/components/core/Icon/Icon";
import { renderLogMessage } from "@admin/components/pages/Lavels/RanderLoadString";
import { MyActivityService } from "@admin/@services/apis/Activity/MyActivity/myActivity.service";
import MyActivityModal from "@admin/components/pages/Activity/MyActivity/MyActivityModal";

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
    MyActivityService.getActivity({
      page: currentPage,
      limit: ordersPerPage,
      searchTerm: debouncedSearchTerm,
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
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="My Activity" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">My Activity records</p>
            <p className="premium-table-toolbar-meta">
              {totalOrders.toLocaleString()} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                <label className="data-table-search">
                  <Icon name="search" variant="outlined" size={18} />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search records..."
                    aria-label="Search records"
                  />
                </label>
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchUserLogs}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={userLogsData}
          noDataViewCondition={
            userLogsData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          isLoading={tableLoading}
          colValue={9}
        >
          <Thead>
            <Tr>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-40">
                User
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Action
              </Th>

              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Create
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Update
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Message
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                View
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {userLogsData?.map((LogsData: IUserLog, index: number) => {
              return (
                <Tr key={index}
                >
                  <Td><span className="data-table-primary">{LogsData?.user?.name}</span></Td>
                  <Td><span className="data-table-primary">{LogsData?.action}</span></Td>
                  <Td><span className="table-amount">{formatTimeAgo(LogsData?.createdAt)}</span></Td>
                  <Td><span className="data-table-muted">{formatTimeAgo(LogsData?.updatedAt)}</span></Td>

                  <Td><span className="data-table-primary">{LogsData?.log_message
                      ? renderLogMessage(LogsData?.log_message)
                      : null}</span></Td>
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
            isShowText={true}
            showRefresh={false}
            className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
          />
        </div>
        <MyActivityModal
          isModalOpen={modalOpen}
          setIsModalOpen={setModalOpen}
          productId={productId}
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
