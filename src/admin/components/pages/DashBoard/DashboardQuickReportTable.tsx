"use client";
import React, { useContext } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import { DashboardShowroomContext } from "@/app/admin/dashboard/showroom/page";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import PageSearch from "@admin/components/core/Search/PageSearch";

const DashboardQuickReportTable: React.FC = () => {
  const {
    expenseQuickData,
    tableQuickLoading,
    searchTerm,
    handleSearchChange,
  } = useContext(DashboardShowroomContext);

  return (
    <TableWrapper
      className="min-h-40"
      isSwitchOn
      data={expenseQuickData}
      isLoading={tableQuickLoading}
      noDataViewCondition={
        expenseQuickData?.length < 1 ? "No return data found" : null
      }
      colValue={3}
    >
      <Thead>
        <Tr className="dark:bg-gray-700 h-[40px]">
          <Th className="dark:text-gray-300 min-w-40">
            <div className="flex items-center gap-2">
              <p>Date</p>
              <PageSearch
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search Orders"
                wrapperClass="w-full"
              />
            </div>
          </Th>
          <Th className="dark:text-gray-300 min-w-40">Order Id</Th>
          <Th className="dark:text-gray-300 min-w-40">Amount</Th>
          <Th className="dark:text-gray-300 min-w-40">Payment Method</Th>
          <Th className="dark:text-gray-300 min-w-40">Note</Th>
          <Th className="dark:text-gray-300 min-w-40">User</Th>
        </Tr>
      </Thead>

      <Tbody className="bg-white dark:bg-gray-800">
        {expenseQuickData?.map((item: any, index: number) => {
          return (
            <Tr key={index} className="h-8 align-top">
              <Td>{formatTimeAgo(item?.createdAt)}</Td>

              <Td>{item?.reference_no}</Td>
              <Td>{item?.amount}</Td>
              <Td>{item?.payment_method}</Td>
              <Td>{item?.note}</Td>
              <Td>{item?.user?.name}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </TableWrapper>
  );
};

export default DashboardQuickReportTable;
