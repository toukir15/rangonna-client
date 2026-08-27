// import { IWebsiteResponse } from "@admin/@interfaces/common.interface";
import { WebsiteContext } from "@/app/admin/setting/website/page";
import Icon from "@admin/components/core/Icon/Icon";
import ToggleSwitch from "@admin/components/core/SwitchButton/ToggleSwitch";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { useContext, useEffect, useRef, useState } from "react";

const WebsiteTable = () => {
  const { permissionList } = useGlobalContext();
  const {
    websiteData,
    tableLoading,
    handleEditClick,
    handleRemove,
    isPriorityEditMode,
    setPriorityWebsiteData,
    activeToggleLoading,
    toggleIsActive,
  } = useContext(WebsiteContext);

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

    const updatedRows = [...websiteData];
    const draggedRow = updatedRows[draggedIndex];

    updatedRows.splice(draggedIndex, 1);
    updatedRows.splice(hoverIndex, 0, draggedRow);

    setPriorityWebsiteData(updatedRows);
    setDraggedIndex(hoverIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <TableWrapper
      showCheckbox={false}
      isSwitchOn={true}
      className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
      data={websiteData}
      isLoading={tableLoading}
      noDataViewCondition={
        websiteData?.length < 1 ? "No data available" : null
      }
      colValue={7}
    >
      <Thead>
        <Tr>
          <Th className="2xl:min-w-16 lg:min-w-16 min-w-16">#</Th>
          <Th className="2xl:min-w-32 lg:min-w-28 min-w-40">
              <div className="flex items-center">
                <div>
                  <p>Website Name</p>
                </div>
                {!isPriorityEditMode && (
                  <div className="mt-2">
                    <div className="h-1.5">
                      <Icon
                        name={"arrow_drop_up"}
                        className="cursor-pointer"
                      />
                    </div>
                    <div className="">
                      <Icon
                        name={"arrow_drop_down"}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-36">Website Url</Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-40">Date</Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-40">Active</Th>
            <Th className="is-right">Actions</Th>
          </Tr>
        </Thead>

        <Tbody>
          {websiteData?.map((item: any, index: number) => {
            return (
              <Tr
                className={`h-14 transition ${isPriorityEditMode ? "cursor-move" : ""
                  } ${draggedIndex === index ? "opacity-50" : ""}`}
                key={item?._id || index}
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

                <Td>
                  <span className="data-table-primary">
                    {item?.web_name}
                  </span>
                </Td>
                <Td>
                  <span className="data-table-muted">{item.web_url}</span>
                </Td>
                <Td>
                  <span className="data-table-muted">
                    {formatTimeAgo(item?.createdAt)}
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
                      onToggle={() => {
                        toggleIsActive(item);
                      }}
                      disabled={
                        isPriorityEditMode ||
                        activeToggleLoading[item?._id] ||
                        !hasPermission(permissionList, "purchase_supplier_edit")
                      }
                    />
                  )}
                </Td>

                <Td className="is-right">
                  {!isPriorityEditMode &&
                    hasPermission(
                      permissionList,
                      "setting_website_edit",
                      "setting_website_delete"
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
                              "setting_website_edit"
                            ) && (
                              <button
                                type="button"
                                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                                onClick={() => handleEditClick(item)}
                              >
                                Edit
                              </button>
                            )}
                            {hasPermission(
                              permissionList,
                              "setting_website_delete"
                            ) && (
                              <button
                                type="button"
                                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                                onClick={() => handleRemove(item?._id)}
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

export default WebsiteTable;
