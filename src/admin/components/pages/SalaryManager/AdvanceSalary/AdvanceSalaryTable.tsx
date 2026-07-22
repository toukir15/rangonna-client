import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";

import { formateDateWithMonth } from "@admin/utils";
import { IAdvance } from "@admin/@interfaces/salaryManager/advanceSalary/AdvanceSalary.interface";
import { AdvanceSalaryContext } from "@/app/admin/team/advance-salary/page";
import { formatTimeAgo } from "@admin/utils/hook.utils";
// import { useGlobalContext } from "@admin/context/GlobalContext";

const AdvanceSalaryTable: React.FC = () => {
  // const { permissionList } = useGlobalContext();
  const { advanceData, tableLoading } = useContext(AdvanceSalaryContext);

  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  // const togglePopup = (index: number) => {
  //   setPopupIndex(popupIndex === index ? null : index);
  // };

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
      data={advanceData}
      isLoading={tableLoading}
      noDataViewCondition={advanceData?.length < 1 ? "No data available" : null}
      colValue={4}
    >
      <Thead>
        <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
          <Th className="dark:text-gray-300 2xl:min-w-40 lg:min-w-40 min-w-40">
            Date
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-40 lg:min-w-40 min-w-40">
            Name
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Salary Month
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Amount
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Note
          </Th>
          {/* <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Action
          </Th> */}
        </Tr>
      </Thead>
      <Tbody className="dark:bg-gray-800 bg-white">
        {advanceData?.map((advance: IAdvance, index: number) => {
          return (
            <Tr className="h-14" key={index}>
              <Td>{formatTimeAgo(advance?.createdAt)}</Td>
              <Td>{advance.employee.name}</Td>
              <Td className="text-base font-bold">
                {formateDateWithMonth(advance?.createdAt)}
              </Td>
              <Td className="">{advance?.amount}</Td>
              <Td className="">{advance?.note}</Td>

              {/* <Td className="">
                {hasPermission(permissionList, "adva_d") && (
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
                        {hasPermission(permissionList, "adva_d") && (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            onClick={() => handleRemove(advance?._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Td> */}
            </Tr>
          );
        })}
      </Tbody>
    </TableWrapper>
  );
};

export default AdvanceSalaryTable;
