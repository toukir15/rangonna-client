import { IWarehouse } from "@admin/@interfaces/setting/warehouse/warehouse.interface";
import { WareHouseContext } from "@/app/admin/setting/warehouse/page";

import Icon from "@admin/components/core/Icon/Icon";
import ToggleSwitch from "@admin/components/core/SwitchButton/ToggleSwitch";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import { useContext, useEffect, useRef, useState } from "react";

const WarehouseTable = () => {
  const { permissionList } = useGlobalContext();
  const {
    warehouseData,
    tableLoading,
    toggleIsActive,
    activeToggleLoading,
    handleEditClick,
    // handleRemove,
  } = useContext(WareHouseContext);
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
      isSwitchOn={true}
      className="min-h-[650px]"
      data={warehouseData}
      isLoading={tableLoading}
      noDataViewCondition={
        warehouseData?.length < 1 ? "No data available" : null
      }
      colValue={7}
    >
      <Thead>
        <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
          <Th className="dark:text-gray-300">
            <div className="flex items-center">
              <div>
                <p>Title</p>
              </div>
              <div className="mt-2">
                {" "}
                <div className="h-1.5">
                  <Icon name={"arrow_drop_up"} className="cursor-pointer" />
                </div>
                <div className="">
                  <Icon name={"arrow_drop_down"} className="cursor-pointer" />{" "}
                </div>
              </div>
            </div>
          </Th>
          <Th className="dark:text-gray-300">Phone No</Th>
          <Th className="dark:text-gray-300">Address</Th>
          <Th className="dark:text-gray-300">Email</Th>
          <Th className="dark:text-gray-300">Active</Th>
          <Th className="dark:text-gray-300">Action</Th>
        </Tr>
      </Thead>
      <Tbody className="dark:bg-gray-800 bg-white">
        {warehouseData?.map((warehouse: IWarehouse, index: number) => {
          return (
            <Tr className="h-14" key={index}>
              <Td>{warehouse?.title}</Td>
              <Td className="text-base font-bold">{warehouse?.phone}</Td>
              <Td className="">{warehouse?.address}</Td>
              <Td>{warehouse?.email}</Td>

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
                      !hasPermission(permissionList, "warehouse_edit")
                    }
                  />
                )}
              </Td>

              <Td className="">
                {hasPermission(permissionList, "warehouse_edit") && (
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
                        {hasPermission(permissionList, "warehouse_edit") && (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            onClick={() => handleEditClick(warehouse)}
                          >
                            Edit
                          </button>
                        )}

                        {/* {hasPermission(permissionList, "ware_d") && (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            onClick={() => handleRemove(warehouse?._id)}
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

export default WarehouseTable;
