import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { MarketingContext } from "@/app/admin/marketing/monthly-cost/page";
import { formatMonthYear } from "@admin/utils/hook.utils";
import { IMarketing } from "@admin/@interfaces/marketing/marketing.interface";
import { hasPermission } from "@admin/utils";

const MarketingListTable: React.FC = () => {
  const { permissionList } = useGlobalContext();

  const {
    marketingData,
    tableLoading,
    handleEditClick,
    handleRemove,
    setItems,
  } = useContext(MarketingContext);

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
      className="min-h-[600px]"
      data={marketingData}
      isLoading={tableLoading}
      noDataViewCondition={
        marketingData?.length < 1 ? "No data available" : null
      }
      colValue={4}
    >
      <Thead>
        <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
          <Th className="dark:text-gray-300 2xl:min-w-40 lg:min-w-40 min-w-40">
            Month
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            BDT
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            USD
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Action
          </Th>
        </Tr>
      </Thead>
      <Tbody className="dark:bg-gray-800 bg-white">
        {marketingData?.map((marketing: IMarketing, index: number) => {
          return (
            <Tr className="h-14" key={index}>
              <Td>{formatMonthYear(marketing?.date)}</Td>
              <Td className="text-base font-bold">
                {marketing?.marketing_cost_bdt}
              </Td>
              <Td className="">{marketing?.marketing_cost_usd}</Td>

              <Td className="">
                {hasPermission(
                  permissionList,
                  "marketing_edit",
                  "marketing_delete"
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
                        className="absolute top-8 2xl:right-48 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-4 z-20 min-w-40"
                      >
                        {hasPermission(permissionList, "marketing_edit") && (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            onClick={() => {
                              handleEditClick();
                              setItems(marketing);
                            }}
                          >
                            Edit
                          </button>
                        )}
                        {hasPermission(permissionList, "marketing_delete") && (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            onClick={() => handleRemove(marketing?._id)}
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

export default MarketingListTable;
