import { ExpenseSettingContext } from "@/app/admin/setting/expense/page";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, noData } from "@admin/utils";
import { useContext, useEffect, useRef, useState } from "react";

const ExpenseSettingTable = () => {
  const { permissionList } = useGlobalContext();
  const { reportIssueData, tableLoading, handleEditClick } = useContext(
    ExpenseSettingContext
  );

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
      data={reportIssueData}
      isLoading={tableLoading}
      noDataViewCondition={
        reportIssueData?.length < 1 ? "No data available" : null
      }
      colValue={3}
    >
      <Thead>
        <Tr>
          <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">User Role</Th>
          <Th className="2xl:min-w-32 lg:min-w-28 min-w-56">
            Expense Category
          </Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {reportIssueData?.map((item: any, index: number) => {
          const mappings = item?.expense_categories_mapping ?? [];

          return (
            <Tr key={item?._id || index}>
              <Td>
                <span className="table-role-badge is-neutral capitalize">
                  {item?.user_role || noData}
                </span>
              </Td>
              <Td>
                {mappings?.length ? (
                  <div className="space-y-1">
                    {mappings.map((m: any, mIndex: number) => {
                      const titles = (m?.expense_categories ?? [])
                        .map((c: any) => c?.title)
                        .filter(Boolean)
                        .join(", ");

                      return (
                        <p key={mIndex} className="leading-5 data-table-muted">
                          <span className="data-table-primary">{m?.source}</span>
                          <span className="mx-2">-</span>
                          <span>{titles || noData}</span>
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <span className="data-table-muted">{noData}</span>
                )}
              </Td>
              <Td className="is-right">
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
                        "account_settings_edit"
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
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </TableWrapper>
  );
};

export default ExpenseSettingTable;
