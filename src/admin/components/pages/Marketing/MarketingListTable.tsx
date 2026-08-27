import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { MarketingContext } from "@/app/admin/marketing/monthly-cost/page";
import { formatMonthYear } from "@admin/utils/hook.utils";
import { IMarketing } from "@admin/@interfaces/marketing/marketing.interface";
import { hasPermission, noData } from "@admin/utils";

const MarketingListTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const { marketingData, tableLoading, handleEditClick, handleRemove, setItems } =
    useContext(MarketingContext);

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
      data={marketingData}
      isLoading={tableLoading}
      noDataViewCondition={
        marketingData?.length < 1 ? "No data available" : null
      }
      colValue={4}
    >
      <Thead>
        <Tr>
          <Th className="2xl:min-w-40 lg:min-w-40 min-w-40">Month</Th>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">BDT</Th>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">USD</Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {marketingData?.map((marketing: IMarketing, index: number) => {
          return (
            <Tr key={index}>
              <Td>
                <span className="data-table-primary">
                  {formatMonthYear(marketing?.date) || noData}
                </span>
              </Td>
              <Td>
                <span className="table-amount">
                  {marketing?.marketing_cost_bdt}
                </span>
              </Td>
              <Td>
                <span className="table-amount">
                  {marketing?.marketing_cost_usd}
                </span>
              </Td>
              <Td className="is-right">
                {hasPermission(
                  permissionList,
                  "marketing_edit",
                  "marketing_delete"
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
                        {hasPermission(permissionList, "marketing_edit") && (
                          <button
                            type="button"
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                            onClick={() => {
                              handleEditClick();
                              setItems(marketing);
                            }}
                          >
                            Edit
                          </button>
                        )}
                        {hasPermission(permissionList, "marketing_delete") && (
                          <button
                            type="button"
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                            onClick={() => handleRemove(marketing?._id)}
                          >
                            Delete
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

export default MarketingListTable;
