"use client";
import React, { useContext } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import { DashboardShowroomContext } from "@/app/admin/dashboard/showroom/page";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { noData } from "@admin/utils";

const DashboardQuickReportTable: React.FC = () => {
  const { expenseQuickData, tableQuickLoading } = useContext(
    DashboardShowroomContext
  );

  return (
    <TableWrapper
      showCheckbox={false}
      className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
      isSwitchOn
      data={expenseQuickData}
      isLoading={tableQuickLoading}
      noDataViewCondition={
        expenseQuickData?.length < 1 ? "No return data found" : null
      }
      colValue={3}
    >
      <Thead>
        <Tr>
          <Th className="min-w-40">Date</Th>
          <Th className="min-w-40">Order Id</Th>
          <Th className="min-w-40">Amount</Th>
          <Th className="min-w-40">Payment Method</Th>
          <Th className="min-w-40">Note</Th>
          <Th className="min-w-40">User</Th>
        </Tr>
      </Thead>
      <Tbody>
        {expenseQuickData?.map((item: any, index: number) => {
          return (
            <Tr key={index}>
              <Td>
                <span className="data-table-muted">
                  {formatTimeAgo(item?.createdAt)}
                </span>
              </Td>
              <Td>
                <span className="data-table-primary">
                  {item?.reference_no || noData}
                </span>
              </Td>
              <Td>
                <span className="table-amount">{item?.amount}</span>
              </Td>
              <Td>
                <span className="table-role-badge is-neutral">
                  {item?.payment_method || noData}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">{item?.note || noData}</span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {item?.user?.name || noData}
                </span>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </TableWrapper>
  );
};

export default DashboardQuickReportTable;
