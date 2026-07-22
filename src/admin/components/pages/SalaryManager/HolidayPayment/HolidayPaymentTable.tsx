import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import { formateDateWithMonth } from "@admin/utils";
import { IAdvance } from "@admin/@interfaces/salaryManager/advanceSalary/AdvanceSalary.interface";
import { HolidayPaymentContext } from "@/app/admin/team/holiday-payment/page";

const HolidayPaymentTable: React.FC = () => {
  const { advanceData, tableLoading } = useContext(HolidayPaymentContext);

  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

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
            Name
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Date
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Amount
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Note
          </Th>

        </Tr>
      </Thead>
      <Tbody className="dark:bg-gray-800 bg-white">
        {advanceData?.map((advance: IAdvance, index: number) => {
          return (
            <Tr className="h-14" key={index}>
              <Td>{advance.employee.name}</Td>
              <Td className="text-base font-bold">
                {formateDateWithMonth(advance?.createdAt)}
              </Td>
              <Td className="">{advance?.amount}</Td>
              <Td className="">{advance?.note}</Td>


            </Tr>
          );
        })}
      </Tbody>
    </TableWrapper>
  );
};

export default HolidayPaymentTable;
