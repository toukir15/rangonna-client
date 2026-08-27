import { IWarehouse } from "@admin/@interfaces/setting/warehouse/warehouse.interface";
import { BkashPaymentContext } from "@/app/admin/bkash-payment/refund/page";

import Icon from "@admin/components/core/Icon/Icon";
import ToggleSwitch from "@admin/components/core/SwitchButton/ToggleSwitch";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, noData } from "@admin/utils";
import { useContext, useEffect, useRef, useState } from "react";

const RefundTable = () => {
  const { permissionList } = useGlobalContext();
  const {
    warehouseData,
    tableLoading,
    toggleIsActive,
    activeToggleLoading,
    handleEditClick,
    handleRemove,
  } = useContext(BkashPaymentContext);
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
      data={warehouseData}
      isLoading={tableLoading}
      noDataViewCondition={
        warehouseData?.length < 1 ? "No data available" : null
      }
      colValue={4}
    >
      <Thead>
        <Tr>
          <Th>Trx ID</Th>
          <Th>Redund Reason</Th>
          <Th>Refund Amount</Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {warehouseData?.map((warehouse: IWarehouse, index: number) => {
          return (
            <Tr key={index}>
              <Td>
                <span className="data-table-primary">
                  {warehouse?.title || noData}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {warehouse?.phone || noData}
                </span>
              </Td>
              <Td>
                <span className="table-amount">
                  {warehouse?.address || noData}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {warehouse?.email || noData}
                </span>
              </Td>
              <Td>
                {activeToggleLoading[warehouse._id] ? (
                  <Icon
                    name="restart_alt"
                    size={28}
                    className={`text-green-600 animate-spin ml-5`}
                  />
                ) : (
                  <ToggleSwitch
                    isChecked={warehouse.is_active}
                    onToggle={() => {
                      toggleIsActive(warehouse);
                    }}
                    disabled={
                      activeToggleLoading[warehouse?._id] ||
                      !hasPermission(permissionList, "ware_e")
                    }
                  />
                )}
              </Td>
              <Td className="is-right">
                {hasPermission(permissionList, "ware_e", "ware_d") && (
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
                        {hasPermission(permissionList, "ware_e") && (
                          <button
                            type="button"
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                            onClick={() => handleEditClick(warehouse)}
                          >
                            Edit
                          </button>
                        )}
                        {hasPermission(permissionList, "ware_d") && (
                          <button
                            type="button"
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                            onClick={() => handleRemove(warehouse?._id)}
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

export default RefundTable;
