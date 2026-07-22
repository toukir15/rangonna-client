import React, { useContext, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import { BalanceListContext } from "@/app/admin/account/balance-sheet/page";
import Icon from "@admin/components/core/Icon/Icon";
import { hasPermission } from "@admin/utils";
import { useGlobalContext } from "@admin/context/GlobalContext";

const BalanceSheetTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const { balanceData, tableLoading, handleUpdateBalance, setModalOpen, setQuickId } =
    useContext(BalanceListContext);

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleClick = (id: string) => {
    setLoadingId(id);

    handleUpdateBalance(id);

    setTimeout(() => {
      setLoadingId(null);
    }, 1500);
  };

  return (
    <TableWrapper
      isSwitchOn={true}
      className="min-h-[600px]"
      data={balanceData}
      isLoading={tableLoading}
      noDataViewCondition={balanceData.length < 1 ? "No data available" : null}
      colValue={7}
    >
      <Thead>
        <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] border-b border-gray-300">
          <Th>Account Name</Th>
          <Th>Balance</Th>
          <Th>Last Balance</Th>
          <Th>Deposit</Th>
          <Th>Expense</Th>
        </Tr>
      </Thead>

      <Tbody className="dark:bg-gray-800 bg-white">
        {balanceData?.map((item: any, index: number) => {
          const currentBalance =
            Number(item?.total_deposit || 0) - Number(item?.total_expense || 0);

          const isLoading = loadingId === item?._id;

          return (
            <Tr className="h-14" key={index}>
              <Td>
                <div className="flex items-center gap-4">
                  <div>
                    {item?.account_name}
                  </div>
                  <div>
                    <Icon
                      onClick={() => {
                        setModalOpen(true);
                        setQuickId(item?._id);
                      }}
                      name={"visibility"}
                      variant="outlined"
                      className="cursor-pointer"
                      size={20}
                    />
                  </div>
                </div>


              </Td>
              <Td className="font-bold !text-[16px]">
                {currentBalance}{" "}
                <span className="!text-xs text-green-500 ml-2 ">
                  +{item?.total_deposit - item?.total_expense - item?.balance}
                </span>
              </Td>
              <Td>
                <div className="flex items-center gap-2">
                  <p className="font-bold">{item?.balance}</p>
                  {/* acount_balance_sync */}
                  <button
                    disabled={isLoading}
                    onClick={() => handleClick(item?._id)}
                    className="flex items-center"
                  >
                    {hasPermission(permissionList, "account_balance_sync") && (
                      <div className={isLoading ? "animate-spin" : ""}>
                        <Icon
                          name="sync"
                          size={20}
                          className={
                            isLoading ? "text-gray-400" : "text-green-600"
                          }
                        />
                      </div>
                    )}
                  </button>
                </div>
              </Td>

              <Td>{item?.total_deposit}</Td>
              <Td>{item?.total_expense}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </TableWrapper>
  );
};

export default BalanceSheetTable;
