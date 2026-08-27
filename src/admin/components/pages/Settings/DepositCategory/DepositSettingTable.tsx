import { DepositSettingContext } from "@/app/admin/setting/deposit/page";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, noData } from "@admin/utils";

import { useContext, useEffect, useRef, useState } from "react";
const DepositSettingTable = () => {
  const { permissionList } = useGlobalContext();
  const {
    reportIssueData,
    tableLoading,
    handleEditClick,
    // handleRemove
  } = useContext(DepositSettingContext);

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
      colValue={7}
    >
      <Thead>
        <Tr>
          <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">Payment Method</Th>
          <Th className="2xl:min-w-32 lg:min-w-28 min-w-36">
            Source & Category
          </Th>
          <Th className="2xl:min-w-32 lg:min-w-28 min-w-44">Account</Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {reportIssueData?.map((item: any, index: number) => {
          return (
            <Tr key={index}>
              <Td>
                <span className="data-table-primary">
                  {item?.payment_method || noData}
                </span>
              </Td>
              <Td>
                {item?.deposit_categories?.length ? (
                  item.deposit_categories.map((source: any, i: number) => (
                    <p key={i} className="data-table-muted">
                      {source?.source} - {source?.deposit_category?.title}
                    </p>
                  ))
                ) : (
                  <span className="data-table-muted">{noData}</span>
                )}
              </Td>
              <Td>
                <span className="data-table-muted">
                  {item?.account?.account_name || noData}
                </span>
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

export default DepositSettingTable;
