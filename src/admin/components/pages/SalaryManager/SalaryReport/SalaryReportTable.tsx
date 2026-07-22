import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import { ISalary } from "@admin/@interfaces/salaryManager/salaryReport/SalaryReport.interface";
import { SalaryReportContext } from "@/app/admin/team/salary/page";
import { dueColor } from "@admin/utils/constant";

const SalaryReportTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const {
    salaryData,
    tableLoading,
    handleRemove,
    setItems,
    handleStatusUpdate,
  } = useContext(SalaryReportContext);

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

  const getMonthYearFromYYYYMM = (value: string): string => {
    const [year, month] = value.split("-");
    const date = new Date(Number(year), Number(month) - 1);

    return date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <TableWrapper
      isSwitchOn={true}
      className="min-h-[600px]"
      data={salaryData}
      isLoading={tableLoading}
      noDataViewCondition={salaryData?.length < 1 ? "No data available" : null}
      colValue={11}
    >
      <Thead>
        <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
          <Th className="dark:text-gray-300 2xl:min-w-40 lg:min-w-40 min-w-40">
            Employee Name
          </Th>

          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Salary Month
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Payable Salary
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-20 lg:min-w-14 min-w-32">
            Working
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-20 lg:min-w-14 min-w-32">
            Leave & Absent
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-28 lg:min-w-14 min-w-32">
            Bonus
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-20 lg:min-w-14 min-w-32">
            Late
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-28 lg:min-w-14 min-w-32">
            Advance
          </Th>

          <Th className="dark:text-gray-300 2xl:min-w-28 lg:min-w-14 min-w-32">
            Due
          </Th>

          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Status
          </Th>

          <Th className="dark:text-gray-300 ">Action</Th>
        </Tr>
      </Thead>
      <Tbody className="dark:bg-gray-800 bg-white">
        {salaryData?.map((salary: ISalary, index: number) => {
          return (
            <Tr className="h-14" key={index}>
              <Td>
                <div>
                  <p>{salary?.employee?.name}</p>
                  <p>{salary?.employee?.phone}</p>
                </div>
              </Td>
              <Td className="text-base font-bold">
                <p> Salary: {salary.base_salary}</p>
                <p className="pt-1"> {getMonthYearFromYYYYMM(salary.month)}</p>
              </Td>
              <Td className="text-base font-bold">
                <p> {salary.final_salary}</p>
              </Td>
              <Td>
                <p> {salary.working_days}</p>
              </Td>
              <Td>
                <p> Leave: {salary.leave_days}</p>
                <p> Absent: {salary.absent_days}</p>
              </Td>
              <Td>
                <p> Bonus: {salary.bonus}</p>
                <p> Leave: {salary.additional_bonus}</p>
              </Td>
              <Td className="">{salary.late_count}</Td>
              <Td className="">{salary.advance_taken}</Td>

              <Td className="">
                <p className={`${dueColor}`}> {Number(salary.final_salary - salary?.advance_taken)}</p>
              </Td>

              <Td>
                <span
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase
      ${salary.status === "paid"
                      ? "bg-green-100 text-green-700 "
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  {salary.status}
                </span>
              </Td>

              <Td className="">
                {hasPermission(permissionList, "team_salary_paid") &&
                  salary.status === "unpaid" && (
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
                          className="absolute -left-24 top-8 2xl:right-48 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-4 z-20 min-w-40"
                        >
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            onClick={() => {
                              handleStatusUpdate(salary?._id);
                              setItems(salary);
                            }}
                          >
                            Paid Status
                          </button>

                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            onClick={() => handleRemove(salary?._id)}
                          >
                            Delete
                          </button>
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

export default SalaryReportTable;
