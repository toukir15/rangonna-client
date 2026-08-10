import React, { useContext } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import Button from "@admin/components/core/Button/Button";
import { CourierManagementContext } from "@admin/context/CourierManagementContext";

const CouriersTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const {
    courierData,
    tableLoading,
    handleStoreAddClick,
    // handleEditClick,
    togglePopup,
    popupRef,
    popupIndex,
    handleRemove,
  } = useContext(CourierManagementContext);
  return (
    <div className="">
      <TableWrapper
        showCheckbox={true}
        data={courierData}
        noDataViewCondition={
          courierData.length < 1 ? "No data available" : null
        }
        isSwitchOn={true}
        isLoading={tableLoading}
        className="min-h-[700px]"
        colValue={4}
        printLabel="Label Print"
      >
        <Thead>
          <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
            <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 dark:text-gray-200">
              Courier Type
            </Th>
            <Th className="2xl:min-w-40 lg:min-w-32 min-w-48 dark:text-gray-200">
              Name
            </Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 dark:text-gray-200">
              Store
            </Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 dark:text-gray-200">
              Add Store
            </Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 dark:text-gray-200">
              Action
            </Th>
          </Tr>
        </Thead>
        <Tbody className="dark:bg-gray-800 bg-white">
          {courierData?.map((data: any, index: number) => {
            return (
              <Tr
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
                key={index}
              >
                <Td>{data.courierType || "Pathao"}</Td>
                <Td>{data.name}</Td>
                <Td>{data.store_name}</Td>

                <Td>
                  {data.courierType === "SteadFast" ? (
                    <span className="text-gray-400 text-sm">N/A</span>
                  ) : (
                    <div>
                      <Button
                        className="data-table-view-btn"
                        onClick={() => handleStoreAddClick(data)}
                      >
                        Add Store
                      </Button>
                    </div>
                  )}
                </Td>
                <Td className="">
                  {hasPermission(
                    permissionList,
                    "courier_edit",
                    "courier_delete"
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
                          className="absolute top-8 right-32 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-4 z-20 min-w-40"
                        >
                          {/* {hasPermission(permissionList, "courier_edit") && (
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                              onClick={() => handleEditClick(data)}
                            >
                              Edit
                            </button>
                          )} */}

                          {hasPermission(permissionList, "courier_delete") && (
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                              onClick={() => handleRemove(data?._id)}
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
    </div>
  );
};

export default CouriersTable;
