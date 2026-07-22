import Image from "next/image";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { useContext, useEffect, useRef, useState } from "react";
import { GeneralSettingContext } from "@/app/admin/setting/general/page";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";

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
    <div className="px-4">
      <TableWrapper
        showCheckbox={true}
        data={generalData}
        noDataViewCondition={
          generalData?.length < 1 ? "No data available" : null
        }
        isSwitchOn={true}
        isLoading={tableLoading}
        className="min-h-[700px]"
        colValue={6}
        printLabel="Label Print"
      >
        <Thead>
          <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
            <Th className="2xl:min-w-32 lg:min-w-14 min-w-48 text-blue-900 dark:text-gray-200">
              Shop Name
            </Th>
            <Th className="2xl:min-w-40 lg:min-w-32 min-w-60  text-blue-900 dark:text-gray-200">
              Shop Address
            </Th>

            <Th className="2xl:min-w-32 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200">
              Phone Number
            </Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200">
              Website Name
            </Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200">
              Image
            </Th>

            <Th className="  text-blue-900 dark:text-gray-200 ">Actions</Th>
          </Tr>
        </Thead>
        <Tbody className="dark:bg-gray-800 bg-white">
          {generalData?.map((general: any, index: number) => {
            return (
              <Tr
                className=" hover:bg-gray-100 dark:hover:bg-gray-800"
                key={index}
              >
                <Td>{general?.shop_name}</Td>
                <Td>{general?.shop_address}</Td>
                <Td>{general?.phone}</Td>
                <Td>{general?.website_user_name}</Td>
                <Td>
                  <Image
                    src={general?.logo}
                    alt={general?.shop_name}
                    height={100}
                    width={100}
                    className="p-2 rounded-lg border bg-gray-50"
                  />
                </Td>

                <Td>
                  {hasPermission(
                    permissionList,
                    "setting_general_edit",
                    "setting_general_delete"
                  ) && (
                    <div className="relative max-w-40">
                      <Icon
                        name={"more_horiz"}
                        variant="outlined"
                        onClick={() => togglePopup(index)}
                        className="cursor-pointer"
                      />
                      {popupIndex === index && (
                        <div
                          ref={popupRef}
                          className="absolute top-8 right-0 bg-white border dark:bg-gray-700 dark:border-gray-500 shadow-md rounded-lg p-2 z-20 min-w-40"
                        >
                          {hasPermission(
                            permissionList,
                            "setting_general_edit"
                          ) && (
                            <button
                              onClick={() => handleEditClick(general)}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-600"
                            >
                              Edit
                            </button>
                          )}

                          {hasPermission(
                            permissionList,
                            "setting_general_delete"
                          ) && (
                            <button
                              onClick={() => handleRemove(general?._id)}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-600"
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

export default GeneralSettingTable;
