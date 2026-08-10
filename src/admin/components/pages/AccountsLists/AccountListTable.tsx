import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { IAccount } from "@admin/@interfaces/account/account-list/account-list.interface";
import ToggleSwitch from "@admin/components/core/SwitchButton/ToggleSwitch";
import { AccountListContext } from "@admin/context/AccountListContext";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";

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
      isSwitchOn={true}
      className="min-h-[600px]"
      data={localRows}
      isLoading={tableLoading}
      noDataViewCondition={localRows.length < 1 ? "No data available" : null}
      colValue={8}
    >
      <Thead>
        <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
          <Th className="dark:text-gray-300 min-w-16">#</Th>
          <Th className="dark:text-gray-300 min-w-40">Account Name</Th>
          <Th className="dark:text-gray-300 min-w-32">Account No</Th>
          <Th className="dark:text-gray-300 min-w-32">Balance</Th>
          <Th className="dark:text-gray-300 min-w-32">Notes</Th>
          <Th className="dark:text-gray-300 min-w-32">Type</Th>
          <Th className="dark:text-gray-300 min-w-32">Active</Th>
          <Th className="dark:text-gray-300 min-w-32">Default</Th>
          <Th className="dark:text-gray-300 min-w-32">Action</Th>
        </Tr>
      </Thead>

      <Tbody className="dark:bg-gray-800 bg-white">
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

            <Td>{item?.account_name}</Td>
            <Td className="text-base font-bold">{item?.account_no}</Td>

            <Td className={item?.balance < 0 ? "text-red-600 font-bold" : ""}>
              {item?.balance}
            </Td>

            <Td>{item?.notes}</Td>

            <Td>
              {item?.type === "mobile_banking"
                ? "Mobile Banking"
                : item?.type === "bank"
                ? "Bank"
                : "Cash"}
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

            <Td>
              {!isPriorityEditMode &&
                hasPermission(permissionList, "account_edit") && (
                  <div className="relative">
                    <Icon
                      name={"more_horiz"}
                      variant="outlined"
                      onClick={() => togglePopup(index)}
                      className="cursor-pointer"
                    />

                    {popupIndex === index && (
                      <div
                        ref={popupRef}
                        className="absolute top-8 right-0 bg-white border shadow-md rounded-lg p-4 z-20 min-w-40 dark:bg-gray-700 dark:border-gray-500"
                      >
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
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
