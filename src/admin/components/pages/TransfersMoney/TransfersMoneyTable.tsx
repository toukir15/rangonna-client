import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { TransfersMoneyContext } from "@/app/admin/account/transfer-money/page";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, noData } from "@admin/utils";

const TransfersMoneyTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const { transfersMoneyData, tableLoading, handleEditClick, setItems } =
    useContext(TransfersMoneyContext);

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
      data={transfersMoneyData}
      isLoading={tableLoading}
      noDataViewCondition={
        transfersMoneyData.length < 1 ? "No data available" : null
      }
      colValue={7}
    >
      <Thead>
        <Tr>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-40">From Account</Th>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">To Account</Th>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">Amount</Th>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-40">Create Date</Th>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-40">Update Date</Th>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">Note</Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {transfersMoneyData?.map((item: any, index: number) => {
          return (
            <Tr key={index}>
              <Td>
                <span className="data-table-primary">
                  {item?.from_account?.account_name || noData}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {item?.to_account?.account_name || noData}
                </span>
              </Td>
              <Td>
                <span className="table-amount">{item?.amount}</span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {formatTimeAgo(item?.createdAt)}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {formatTimeAgo(item?.updatedAt)}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">{item?.note || noData}</span>
              </Td>
              <Td className="is-right">
                {hasPermission(
                  permissionList,
                  "account_transfer_money_edit"
                ) && (
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
                          "account_transfer_money_edit"
                        ) && (
                          <button
                            type="button"
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                            onClick={() => {
                              handleEditClick();
                              setItems(item);
                            }}
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

export default TransfersMoneyTable;
