import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { AllExpensesContext } from "@/app/admin/account/expense/page";
import { IExpense } from "@admin/@interfaces/account/all-expenses/all-expenses";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import { formatTimeAgo } from "@admin/utils/hook.utils";

const AllExpensesTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const {
    expensesData,
    tableLoading,
    // formatDateTime,
    handleEditClick,
    // handleRemove,
  } = useContext(AllExpensesContext);

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
      data={expensesData}
      isLoading={tableLoading}
      noDataViewCondition={expensesData.length < 1 ? "No data available" : null}
      colValue={7}
    >
      <Thead>
        <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-48">
            Date
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Amount
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-24">
            Account
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-24">
            Method
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
            Expense Category
          </Th>

          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
            Note
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
            Source
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
            User
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
            Action
          </Th>
        </Tr>
      </Thead>
      <Tbody className="dark:bg-gray-800 bg-white">
        {expensesData?.map((item: IExpense, index: number) => {
          return (
            <Tr className="h-14" key={index}>
              <Td>
                <p>{item?.updatedAt && formatTimeAgo(item?.updatedAt)}</p>
                <p>{formatTimeAgo(item?.createdAt)}</p>
              </Td>
              <Td className="">{item?.amount}</Td>
              {/* <Td>{item?.warehouse?.title}</Td> */}
              <Td className="text-base font-bold">
                {item?.account?.account_name}
              </Td>
              <Td className="text-base font-bold">{item?.payment_method}</Td>
              <Td className="">
                {item?.expense_category?.title} - {item?.expense_sub_title}
              </Td>

              <Td>{item?.note}</Td>
              <Td>{item?.source}</Td>
              <Td>{item?.user?.name}</Td>

              <Td className="">
                {hasPermission(permissionList, "account_expense_edit") &&
                  item?.source === "manual" && (
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
                          {hasPermission(
                            permissionList,
                            "account_expense_edit"
                          ) && (
                              <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg rounded-lg"
                                onClick={() => handleEditClick(item)}
                              >
                                Edit
                              </button>
                            )}
                          {/* {hasPermission(
                          permissionList,

                          "expe_d"
                        ) && (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg rounded-lg"
                            onClick={() => handleRemove(item?._id)}
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

export default AllExpensesTable;
