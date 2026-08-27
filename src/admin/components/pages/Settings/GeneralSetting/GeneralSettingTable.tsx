import Image from "next/image";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { useContext, useEffect, useRef, useState } from "react";
import { GeneralSettingContext } from "@/app/admin/setting/general/page";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, noData } from "@admin/utils";

const GeneralSettingTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const { generalData, tableLoading, handleEditClick, handleRemove } =
    useContext(GeneralSettingContext);
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <TableWrapper
      showCheckbox={false}
      data={generalData}
      noDataViewCondition={
        generalData?.length < 1 ? "No data available" : null
      }
      isSwitchOn={true}
      isLoading={tableLoading}
      className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
      colValue={6}
      printLabel="Label Print"
    >
      <Thead>
        <Tr>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-48">Shop Name</Th>
          <Th className="2xl:min-w-40 lg:min-w-32 min-w-60">Shop Address</Th>
          <Th className="2xl:min-w-32 lg:min-w-28 min-w-36">Phone Number</Th>
          <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">Website Name</Th>
          <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">Image</Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {generalData?.map((general: any, index: number) => {
          return (
            <Tr key={index}>
              <Td>
                <span className="data-table-primary">
                  {general?.shop_name || noData}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {general?.shop_address || noData}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {general?.phone || noData}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {general?.website_user_name || noData}
                </span>
              </Td>
              <Td>
                {general?.logo ? (
                  <Image
                    src={general?.logo}
                    alt={general?.shop_name}
                    height={100}
                    width={100}
                    className="p-2 rounded-lg border bg-gray-50"
                  />
                ) : (
                  <span className="data-table-muted">{noData}</span>
                )}
              </Td>
              <Td className="is-right">
                {hasPermission(
                  permissionList,
                  "setting_general_edit",
                  "setting_general_delete"
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
                          "setting_general_edit"
                        ) && (
                          <button
                            type="button"
                            onClick={() => handleEditClick(general)}
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                          >
                            Edit
                          </button>
                        )}
                        {hasPermission(
                          permissionList,
                          "setting_general_delete"
                        ) && (
                          <button
                            type="button"
                            onClick={() => handleRemove(general?._id)}
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
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

export default GeneralSettingTable;
