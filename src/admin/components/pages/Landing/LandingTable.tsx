import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import { LandingContext } from "@/app/admin/landing-page/page";
import { useRouter } from "next/navigation";

const LandingTable: React.FC = () => {
  const router = useRouter();
  const { permissionList } = useGlobalContext();
  const { landingData, tableLoading, handleRemove } =
    useContext(LandingContext);

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
      data={landingData}
      isLoading={tableLoading}
      noDataViewCondition={landingData.length < 1 ? "No data available" : null}
      colValue={7}
    >
      <Thead>
        <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-36">
            <div>
              <p>HeadLine</p>
            </div>
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-24">
            Slug
          </Th>

          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
            Action
          </Th>
        </Tr>
      </Thead>
      <Tbody className="dark:bg-gray-800 bg-white">
        {landingData?.map((item: any, index: number) => {
          return (
            <Tr className="h-14" key={index}>
              <Td>{item?.headline}</Td>
              <Td className="text-base font-bold">{item?.slug}</Td>

              <Td className="">
                {hasPermission(
                  permissionList,
                  "landing_page_edit",
                  "landing_page_delete"
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
                          className="absolute top-8  bg-white border shadow-md rounded-lg p-4 z-20 min-w-40 dark:bg-gray-700 dark:border-gray-500"
                        >
                          {hasPermission(permissionList, "landing_page_edit") && (
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600  rounded-lg"
                              onClick={() => {
                                router.push(`/landing-page/edit/${item?._id}`);
                              }}
                            >
                              Edit
                            </button>
                          )}
                          {hasPermission(
                            permissionList,

                            "landing_page_delete"
                          ) && (
                              <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600  rounded-lg"
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

export default LandingTable;
