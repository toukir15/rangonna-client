import { IReportIssueCategory } from "@admin/@interfaces/setting/reportIssueCategory/reporIssueCategory.interface";
import { ReportIssueCategoryContext } from "@/app/admin/setting/report-issue-category/page";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { useContext, useEffect, useRef, useState } from "react";
const ReportIssueCategoryTable = () => {
  const { permissionList } = useGlobalContext();
  const { reportIssueData, tableLoading, handleEditClick, handleRemove } =
    useContext(ReportIssueCategoryContext);

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
        colValue={7}
      >
        <Thead>
          <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-28 min-w-32">
              <div className="flex items-center">
                <div>
                  <p>Title</p>
                </div>
                <div className="mt-2">
                  {" "}
                  <div className="h-1.5">
                    <Icon name={"arrow_drop_up"} className="cursor-pointer" />
                  </div>
                  <div className="">
                    <Icon
                      name={"arrow_drop_down"}
                      className="cursor-pointer"
                    />{" "}
                  </div>
                </div>
              </div>
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-28 min-w-36">
              Issue Subtitle
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-28 min-w-44">
              Issue CreateAt
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-28 min-w-44">
              Issue UpdateAt
            </Th>
            <Th className="dark:text-gray-300">Action</Th>
          </Tr>
        </Thead>
        <Tbody className="dark:bg-gray-800 bg-white">
          {reportIssueData?.map((item: IReportIssueCategory, index: number) => {
            return (
              <Tr className="h-14" key={index}>
                <Td>{item?.issue_title}</Td>
                <Td className="text-base font-bold">
                  {Array.isArray(item?.issue_sub_title)
                    ? item.issue_sub_title.join(", ")
                    : item?.issue_sub_title}
                </Td>
                <Td className="">{formatTimeAgo(item?.createdAt)}</Td>
                <Td>{formatTimeAgo(item?.updatedAt)}</Td>

                <Td className="">
                  {hasPermission(
                    permissionList,
                    "setting_report_issue_category_edit",
                    "setting_report_issue_category_delete"
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
                            className="absolute top-8 right-0 bg-white border shadow-md rounded-lg p-4 z-20 min-w-40 dark:bg-gray-700 dark:border-gray-500"
                          >
                            {hasPermission(
                              permissionList,
                              "setting_report_issue_category_edit"
                            ) && (
                                <button
                                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                                  onClick={() => handleEditClick(item)}
                                >
                                  Edit
                                </button>
                              )}

                            {hasPermission(
                              permissionList,
                              "setting_report_issue_category_delete"
                            ) && (
                                <button
                                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
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
    </div>
  );
};

export default ReportIssueCategoryTable;
