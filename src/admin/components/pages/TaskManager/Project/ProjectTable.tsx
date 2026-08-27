import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { ProjectContext } from "@/app/admin/task-manager/project/page";
import { IProject } from "@admin/@interfaces/taskManager/taskManager.service";
import { hasPermission, noData } from "@admin/utils";
import { useGlobalContext } from "@admin/context/GlobalContext";

const taskBadgeClass = (status?: string) => {
  const s = String(status || "").toLowerCase();
  if (s === "completed" || s === "done") return "is-approved";
  if (s === "cancelled" || s === "rejected") return "is-rejected";
  if (s === "pending" || s === "in-progress") return "is-pending";
  return "is-neutral";
};

const ProjectTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const { projectData, tableLoading, handleEditClick, handleRemove } =
    useContext(ProjectContext);
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
      data={projectData}
      isLoading={tableLoading}
      noDataViewCondition={projectData?.length < 1 ? "No data available" : null}
      colValue={10}
    >
      <Thead>
        <Tr>
          <Th>Title</Th>
          <Th>Start Date</Th>
          <Th>End Date</Th>
          <Th>Status</Th>
          <Th>description</Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {projectData?.map((data: IProject, index: number) => {
          return (
            <Tr key={index}>
              <Td className="2xl:min-w-32 lg:min-w-28 min-w-48">
                <span className="data-table-primary">
                  {data?.title || noData}
                </span>
              </Td>
              <Td className="2xl:min-w-32 lg:min-w-28 min-w-28">
                <span className="data-table-muted">
                  {data?.start_date || noData}
                </span>
              </Td>
              <Td className="2xl:min-w-32 lg:min-w-28 min-w-28">
                <span className="data-table-muted">
                  {data?.end_date || noData}
                </span>
              </Td>
              <Td>
                <span className={`table-role-badge ${taskBadgeClass(data.status)}`}>
                  {data?.status || noData}
                </span>
              </Td>
              <Td className="2xl:min-w-32 lg:min-w-28 min-w-48">
                <span className="data-table-muted">
                  {data?.description || noData}
                </span>
              </Td>
              <Td className="is-right">
                {hasPermission(
                  permissionList,
                  "task_project_edit",
                  "task_project_delete",
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
                        {hasPermission(permissionList, "task_project_edit") && (
                          <button
                            type="button"
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                            onClick={() => handleEditClick(data)}
                          >
                            Edit
                          </button>
                        )}
                        {hasPermission(
                          permissionList,
                          "task_project_delete",
                        ) && (
                          <button
                            type="button"
                            onClick={() => handleRemove(data._id)}
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
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

export default ProjectTable;
