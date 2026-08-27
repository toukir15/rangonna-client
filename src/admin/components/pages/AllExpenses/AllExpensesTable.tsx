import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { AllExpensesContext } from "@/app/admin/account/expense/page";
import { IExpense } from "@admin/@interfaces/account/all-expenses/all-expenses";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, noData } from "@admin/utils";
import { formatTimeAgo } from "@admin/utils/hook.utils";

const AllExpensesTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const { expensesData, tableLoading, handleEditClick } =
    useContext(AllExpensesContext);

  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
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
  return (
    <TableWrapper
      showCheckbox={false}
      isSwitchOn={true}
      className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
      data={expensesData}
      isLoading={tableLoading}
      noDataViewCondition={expensesData.length < 1 ? "No data available" : null}
      colValue={7}
    >
      <Thead>
        <Tr>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-48">Date</Th>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">Amount</Th>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-24">Account</Th>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-24">Method</Th>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-40">Expense Category</Th>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-40">Note</Th>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-40">Source</Th>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-40">User</Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {expensesData?.map((item: IExpense, index: number) => {
          return (
            <Tr key={index}>
              <Td>
                <span className="data-table-muted">
                  {item?.updatedAt && formatTimeAgo(item?.updatedAt)}
                </span>
                <p className="data-table-muted">
                  {formatTimeAgo(item?.createdAt)}
                </p>
              </Td>
              <Td>
                <span className="table-amount">{item?.amount}</span>
              </Td>
              <Td>
                <span className="data-table-primary">
                  {item?.account?.account_name || noData}
                </span>
              </Td>
              <Td>
                <span className="table-role-badge is-neutral">
                  {item?.payment_method || noData}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {item?.expense_category?.title} - {item?.expense_sub_title}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">{item?.note || noData}</span>
              </Td>
              <Td>
                <span className="table-role-badge is-neutral">
                  {item?.source || noData}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {item?.user?.name || noData}
                </span>
              </Td>
              <Td className="is-right">
                {hasPermission(permissionList, "account_expense_edit") &&
                  item?.source === "manual" && (
                    <div className="relative max-w-40">
                      <button
                        type="button"
                        className="data-table-action-btn"
                        aria-expanded={popupIndex === index}
                        onClick={() => togglePopup(index)}
                      >
                        <Icon name="more_vert" variant="outlined" size={18} />
                      </button>
                      {popupIndex === index && (
                        <div
                          ref={popupRef}
                          className="absolute top-9 right-0 z-20 min-w-40 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-1.5 shadow-[var(--shadow-soft)]"
                        >
                          {hasPermission(
                            permissionList,
                            "account_expense_edit"
                          ) && (
                            <button
                              type="button"
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                              onClick={() => handleEditClick(item)}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </TableWrapper>
  );
};

export default AllExpensesTable;
