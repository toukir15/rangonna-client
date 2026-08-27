"use client";
import React, { useContext, useMemo } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import { DashboardShowroomContext } from "@/app/admin/dashboard/showroom/page";
import Icon from "@admin/components/core/Icon/Icon";
import { hasPermission, noData } from "@admin/utils";
import { useGlobalContext } from "@admin/context/GlobalContext";

const DashBoardShowroomTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const { returnListData, tableLoading, setModalOpen, setItems } = useContext(
    DashboardShowroomContext
  );
  const totalCreateAmount = useMemo(() => {
    return returnListData?.reduce((acc: number, item: any) => {
      return acc + (Number(item?.createdAt_amount) || 0);
    }, 0);
  }, [returnListData]);
  const totalDateAmount = useMemo(() => {
    return returnListData?.reduce((acc: number, item: any) => {
      return acc + (Number(item?.transaction_date_amount) || 0);
    }, 0);
  }, [returnListData]);

  return (
    <TableWrapper
      showCheckbox={false}
      className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
      isSwitchOn
      data={returnListData}
      isLoading={tableLoading}
      noDataViewCondition={
        returnListData?.length < 1 ? "No return data found" : null
      }
      colValue={4}
    >
      <Thead>
        <Tr>
          <Th className="min-w-40">Payment Method</Th>
          <Th className="min-w-40">Date By Order Amount</Th>
          <Th className="min-w-40">Daily Amount</Th>
          <Th className="is-right">Quick View</Th>
        </Tr>
      </Thead>
      <Tbody>
        {returnListData?.map((item: any, index: number) => {
          return (
            <Tr key={index}>
              <Td>
                <span className="table-role-badge is-neutral">
                  {item?.payment_method || noData}
                </span>
              </Td>
              <Td>
                <span className="table-amount">
                  {item?.transaction_date_amount}
                </span>
              </Td>
              <Td>
                <span className="table-amount">{item?.createdAt_amount}</span>
              </Td>
              <Td className="is-right">
                {hasPermission(
                  permissionList,
                  "showroom_payment_history_quick_view"
                ) && (
                  <button
                    type="button"
                    className="data-table-action-btn"
                    onClick={() => {
                      setModalOpen(true);
                      setItems(item);
                    }}
                  >
                    <Icon name={"visibility"} variant="outlined" size={18} />
                  </button>
                )}
              </Td>
            </Tr>
          );
        })}
        {returnListData?.length > 0 && (
          <Tr>
            <Td>
              <span className="data-table-primary">Total:</span>
            </Td>
            <Td>
              <span className="table-amount">{totalDateAmount}</span>
            </Td>
            <Td>
              <span className="table-amount">{totalCreateAmount}</span>
            </Td>
            <Td />
          </Tr>
        )}
      </Tbody>
    </TableWrapper>
  );
};

export default DashBoardShowroomTable;
