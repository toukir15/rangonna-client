import React, { useContext } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, noData } from "@admin/utils";
import { CourierManagementContext } from "@admin/context/CourierManagementContext";

const CouriersTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const {
    courierData,
    tableLoading,
    handleStoreAddClick,
    togglePopup,
    popupRef,
    popupIndex,
    handleRemove,
  } = useContext(CourierManagementContext);

  return (
    <TableWrapper
      showCheckbox={false}
      data={courierData}
      noDataViewCondition={
        courierData.length < 1 ? "No data available" : null
      }
      isSwitchOn={true}
      isLoading={tableLoading}
      className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
      colValue={5}
    >
      <Thead>
        <Tr>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">Courier Type</Th>
          <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">Name</Th>
          <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">Store</Th>
          <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">Add Store</Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {courierData?.map((data: any, index: number) => {
          const typeLabel = data.courierType || "Pathao";

          return (
            <Tr key={data?._id || index}>
              <Td>
                <span className="table-role-badge is-approved">{typeLabel}</span>
              </Td>
              <Td>
                <span className="data-table-primary">
                  {data.name || noData}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {data.store_name || noData}
                </span>
              </Td>
              <Td>
                {typeLabel === "SteadFast" ? (
                  <span className="data-table-muted">N/A</span>
                ) : (
                  <button
                    type="button"
                    className="data-table-view-btn"
                    onClick={() => handleStoreAddClick(data)}
                  >
                    <Icon name="add" variant="outlined" size={14} />
                    Add Store
                  </button>
                )}
              </Td>
              <Td className="is-right">
                {hasPermission(
                  permissionList,
                  "courier_edit",
                  "courier_delete",
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
                        {hasPermission(permissionList, "courier_delete") && (
                          <button
                            type="button"
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
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
  );
};

export default CouriersTable;
