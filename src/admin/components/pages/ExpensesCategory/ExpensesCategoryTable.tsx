import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { formatDateTime } from "@admin/utils/hook.utils";
import { ExpensesCategoryContext } from "@/app/admin/account/expense-category/page";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import ToggleSwitch from "@admin/components/core/SwitchButton/ToggleSwitch";

const ExpensesCategoryTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const {
    expensesData,
    tableLoading,
    handleEditClick,
    isPriorityEditMode,
    setPriorityExpensesData,
    activeToggleLoading,
    toggleIsActive,
  } = useContext(ExpensesCategoryContext);

  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
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

  const handleDragStart = (index: number) => {
    if (!isPriorityEditMode) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLTableRowElement>,
    hoverIndex: number
  ) => {
    e.preventDefault();

    if (
      !isPriorityEditMode ||
      draggedIndex === null ||
      draggedIndex === hoverIndex
    ) {
      return;
    }

    const updatedRows = [...expensesData];
    const draggedRow = updatedRows[draggedIndex];

    updatedRows.splice(draggedIndex, 1);
    updatedRows.splice(hoverIndex, 0, draggedRow);

    setPriorityExpensesData(updatedRows);
    setDraggedIndex(hoverIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <TableWrapper
      isSwitchOn={true}
      className="min-h-[650px]"
      data={expensesData}
      isLoading={tableLoading}
      noDataViewCondition={expensesData.length < 1 ? "No data available" : null}
      colValue={10}
    >
      <Thead>
        <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
          <Th className="dark:text-gray-300 2xl:min-w-16 lg:min-w-16 min-w-16">
            #
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-28">
            Title
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-28">
            Sub Title
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Note
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
            <div className="flex items-center ">
              <div>
                <p>Date</p>
              </div>
              {!isPriorityEditMode && (
                <div className="mt-2">
                  <div className="h-1.5">
                    <Icon name={"arrow_drop_up"} className=" cursor-pointer" />
                  </div>
                  <div className="">
                    <Icon
                      name={"arrow_drop_down"}
                      className=" cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
            Active
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
            Action
          </Th>
        </Tr>
      </Thead>

      <Tbody className="dark:bg-gray-800 bg-white">
        {expensesData?.map((data: any, index: number) => {
          return (
            <Tr
              className={`h-14 transition ${isPriorityEditMode ? "cursor-move" : ""
                } ${draggedIndex === index ? "opacity-50" : ""}`}
              key={data?._id || index}
              draggable={isPriorityEditMode}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
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

              <Td>{data?.title}</Td>
              <Td>{data?.sub_titles?.join(", ")}</Td>
              <Td>{data?.note}</Td>
              <Td>{formatDateTime(data.createdAt)}</Td>
              <Td>
                {activeToggleLoading[data._id] ? (
                  <Icon
                    name="restart_alt"
                    size={28}
                    className="text-green-600 animate-spin ml-5"
                  />
                ) : (
                  <ToggleSwitch
                    isChecked={data.is_active}
                    onToggle={() => {
                      toggleIsActive(data);
                    }}
                    disabled={
                      isPriorityEditMode ||
                      activeToggleLoading[data?._id] ||
                      !hasPermission(permissionList, "purchase_supplier_edit")
                    }
                  />
                )}
              </Td>

              <Td>
                {!isPriorityEditMode &&
                  hasPermission(
                    permissionList,
                    "account_expense_category_edit"
                  ) && (
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
                          className="absolute top-8 -left-14 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-4 z-20 min-w-40"
                        >
                          {hasPermission(
                            permissionList,
                            "account_expense_category_edit"
                          ) && (
                              <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                                onClick={() => handleEditClick(data)}
                              >
                                Edit
                              </button>
                            )}

                          {/* {hasPermission(permissionList, "expe_cate_d") && (
                            <button
                              onClick={() => handleRemove(data?._id)}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            >
                              Delete
                            </button>
                          )} */}
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

export default ExpensesCategoryTable;
