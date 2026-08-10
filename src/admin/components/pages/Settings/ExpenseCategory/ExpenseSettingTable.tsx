import { ExpenseSettingContext } from "@/app/admin/setting/expense/page";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import { useContext, useEffect, useRef, useState } from "react";

const ExpenseSettingTable = () => {
  const { permissionList } = useGlobalContext();
  const { reportIssueData, tableLoading, handleEditClick } = useContext(
    ExpenseSettingContext
  );

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
    <div>
      <TableWrapper
        isSwitchOn={true}
        className="min-h-[650px]"
        data={reportIssueData}
        isLoading={tableLoading}
        noDataViewCondition={
          reportIssueData?.length < 1 ? "No data available" : null
        }
        colValue={3}
      >
        <Thead>
          <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-28 min-w-32">
              User Role
            </Th>

            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-28 min-w-56">
              Expense Category
            </Th>

            <Th className="dark:text-gray-300">Action</Th>
          </Tr>
        </Thead>

        <Tbody className="dark:bg-gray-800 bg-white">
          {reportIssueData?.map((item: any, index: number) => {
            const mappings = item?.expense_categories_mapping ?? [];

            return (
              <Tr className="h-14" key={item?._id || index}>
                {/* User Role */}
                <Td className="capitalize">{item?.user_role || "-"}</Td>

                {/* Expense Category */}
                <Td className="text-sm">
                  {mappings?.length ? (
                    <div className="space-y-1">
                      {mappings.map((m: any, mIndex: number) => {
                        const titles = (m?.expense_categories ?? [])
                          .map((c: any) => c?.title)
                          .filter(Boolean)
                          .join(", ");

                        return (
                          <p key={mIndex} className="leading-5">
                            <span className="font-semibold">{m?.source}</span>
                            <span className="mx-2">-</span>
                            <span>{titles || "-"}</span>
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    "-"
                  )}
                </Td>

                {/* Action */}
                <Td>
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
                        className="absolute top-8 right-0 bg-white border shadow-md rounded-lg p-2 z-20 min-w-40 dark:bg-gray-700 dark:border-gray-500"
                      >
                        {hasPermission(
                          permissionList,
                          "account_settings_edit"
                        ) && (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            onClick={() => handleEditClick(item)}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </TableWrapper>
    </div>
  );
};

export default ExpenseSettingTable;
