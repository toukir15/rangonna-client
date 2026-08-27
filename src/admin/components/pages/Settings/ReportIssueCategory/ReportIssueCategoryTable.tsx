import { IReportIssueCategory } from "@admin/@interfaces/setting/reportIssueCategory/reporIssueCategory.interface";
import { ReportIssueCategoryContext } from "@/app/admin/setting/report-issue-category/page";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, noData } from "@admin/utils";
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
    <TableWrapper
      showCheckbox={false}
      isSwitchOn={true}
      className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
      data={reportIssueData}
      isLoading={tableLoading}
      noDataViewCondition={
        reportIssueData?.length < 1 ? "No data available" : null
      }
      colValue={7}
    >
      <Thead>
        <Tr>
          <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">Title</Th>
          <Th className="2xl:min-w-32 lg:min-w-28 min-w-36">Issue Subtitle</Th>
          <Th className="2xl:min-w-32 lg:min-w-28 min-w-44">Issue CreateAt</Th>
          <Th className="2xl:min-w-32 lg:min-w-28 min-w-44">Issue UpdateAt</Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {reportIssueData?.map((item: IReportIssueCategory, index: number) => {
          return (
            <Tr key={index}>
              <Td>
                <span className="data-table-primary">
                  {item?.issue_title || noData}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {Array.isArray(item?.issue_sub_title)
                    ? item.issue_sub_title.join(", ")
                    : item?.issue_sub_title || noData}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {formatTimeAgo(item?.createdAt)}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {formatTimeAgo(item?.updatedAt)}
                </span>
              </Td>
              <Td className="is-right">
                {hasPermission(
                  permissionList,
                  "setting_report_issue_category_edit",
                  "setting_report_issue_category_delete"
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
                          "setting_report_issue_category_edit"
                        ) && (
                          <button
                            type="button"
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
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
                            type="button"
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
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

export default ReportIssueCategoryTable;
