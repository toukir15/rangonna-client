import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { IAccount } from "@admin/@interfaces/account/account-list/account-list.interface";
import ToggleSwitch from "@admin/components/core/SwitchButton/ToggleSwitch";
import { AccountListContext } from "@admin/context/AccountListContext";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, noData } from "@admin/utils";

const AccountListTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const {
    accountListData,
    tableLoading,
    activeToggleLoading,
    defaultToggleLoading,
    toggleIsActive,
    toggleIsADefault,
    handleEditClick,
    setItems,
    isPriorityEditMode,
    setPriorityListData,
  } = useContext(AccountListContext);

  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [localRows, setLocalRows] = useState<IAccount[]>([]);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLocalRows(accountListData);
  }, [accountListData]);

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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLTableRowElement>,
    hoverIndex: number
  ) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === hoverIndex) return;

    const updatedRows = [...localRows];
    const draggedRow = updatedRows[draggedIndex];

    updatedRows.splice(draggedIndex, 1);
    updatedRows.splice(hoverIndex, 0, draggedRow);

    setLocalRows(updatedRows);
    setDraggedIndex(hoverIndex);

    // parent state o sync thakbe
    setPriorityListData(updatedRows);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <TableWrapper
      showCheckbox={false}
      isSwitchOn={true}
      className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
      data={localRows}
      isLoading={tableLoading}
      noDataViewCondition={localRows.length < 1 ? "No data available" : null}
      colValue={8}
    >
      <Thead>
        <Tr>
          <Th className="min-w-16">#</Th>
          <Th className="min-w-40">Account Name</Th>
          <Th className="min-w-32">Account No</Th>
          <Th className="min-w-32">Balance</Th>
          <Th className="min-w-32">Notes</Th>
          <Th className="min-w-32">Type</Th>
          <Th className="min-w-32">Active</Th>
          <Th className="min-w-32">Default</Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>

      <Tbody>
        {localRows?.map((item: IAccount, index: number) => (
          <Tr
            key={item._id}
            draggable={isPriorityEditMode}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`h-14 transition ${
              isPriorityEditMode ? "cursor-move" : ""
            } ${draggedIndex === index ? "opacity-50" : ""}`}
          >
            <Td>
              <div className="flex items-center gap-2">
                {isPriorityEditMode && (
                  <Icon
                    name="drag_indicator"
                    className="text-gray-500 cursor-grab"
                  />
                )}
                <span>{index + 1}</span>
              </div>
            </Td>

            <Td>
              <span className="data-table-primary">
                {item?.account_name || noData}
              </span>
            </Td>
            <Td>
              <span className="data-table-muted">
                {item?.account_no || noData}
              </span>
            </Td>
            <Td>
              <span
                className={`table-amount ${
                  item?.balance < 0 ? "text-red-600" : ""
                }`}
              >
                {item?.balance}
              </span>
            </Td>
            <Td>
              <span className="data-table-muted">{item?.notes || noData}</span>
            </Td>
            <Td>
              <span className="table-role-badge is-neutral">
                {item?.type === "mobile_banking"
                  ? "Mobile Banking"
                  : item?.type === "bank"
                    ? "Bank"
                    : "Cash"}
              </span>
            </Td>

            <Td>
              {activeToggleLoading[item._id] ? (
                <Icon
                  name="restart_alt"
                  size={28}
                  className="text-green-600 animate-spin ml-5"
                />
              ) : (
                <ToggleSwitch
                  isChecked={item.is_active}
                  onToggle={() => toggleIsActive(item)}
                  disabled={
                    isPriorityEditMode ||
                    activeToggleLoading[item?._id] ||
                    !hasPermission(permissionList, "account_edit")
                  }
                />
              )}
            </Td>

            <Td>
              {defaultToggleLoading[item._id] ? (
                <Icon
                  name="restart_alt"
                  size={28}
                  className="text-green-600 animate-spin ml-5"
                />
              ) : (
                <ToggleSwitch
                  isChecked={item.is_default}
                  onToggle={() => toggleIsADefault(item)}
                  disabled={
                    isPriorityEditMode ||
                    defaultToggleLoading[item?._id] ||
                    !hasPermission(permissionList, "account_edit")
                  }
                />
              )}
            </Td>

            <Td className="is-right">
              {!isPriorityEditMode &&
                hasPermission(permissionList, "account_edit") && (
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
                        <button
                          type="button"
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                          onClick={() => {
                            handleEditClick();
                            setItems(item);
                            setPopupIndex(null);
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableWrapper>
  );
};

export default AccountListTable;
