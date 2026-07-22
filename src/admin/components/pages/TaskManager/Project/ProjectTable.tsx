import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { ProjectContext } from "@/app/admin/task-manager/project/page";
import { IProject } from "@admin/@interfaces/taskManager/taskManager.service";
import { taskStatusStyle } from "@admin/utils/system.utils";
import { hasPermission } from "@admin/utils";
import { useGlobalContext } from "@admin/context/GlobalContext";

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
      isSwitchOn={true}
      className="min-h-[650px]"
      data={projectData}
      isLoading={tableLoading}
      noDataViewCondition={projectData?.length < 1 ? "No data available" : null}
      colValue={10}
    >
      <Thead>
        <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px]  shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
          <Th className="dark:text-gray-300">Title</Th>
          <Th className="dark:text-gray-300">Start Date </Th>
          <Th className="dark:text-gray-300">End Date</Th>
          <Th className="dark:text-gray-300">Status</Th>
          <Th className="dark:text-gray-300">description</Th>
          <Th className="dark:text-gray-300">Action</Th>
        </Tr>
      </Thead>
      <Tbody className="dark:bg-gray-800 bg-white">
        {projectData?.map((data: IProject, index: number) => {
          return (
            <Tr className="h-14" key={index}>
              <Td className="2xl:min-w-32 lg:min-w-28 min-w-48">
                {data?.title}
              </Td>
              <Td className="2xl:min-w-32 lg:min-w-28 min-w-28">
                {data?.start_date}
              </Td>
              <Td className="2xl:min-w-32 lg:min-w-28 min-w-28">
                {data?.end_date}
              </Td>
              <Td>
                <div
                  className={`${taskStatusStyle(
                    data.status
                  )} text-center 2xl:min-w-32 lg:min-w-28 min-w-28`}
                >
                  {data?.status}
                </div>
              </Td>
              <Td className="2xl:min-w-32 lg:min-w-28 min-w-48">
                {data?.description}
              </Td>

              <Td className="">
                {hasPermission(
                  permissionList,
                  "task_project_edit",
                  "task_project_delete"
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
                        className="absolute top-8 -left-14 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-4 z-20 min-w-40"
                      >
                        {hasPermission(permissionList, "task_project_edit") && (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            onClick={() => handleEditClick(data)}
                          >
                            Edit
                          </button>
                        )}

                        {hasPermission(
                          permissionList,
                          "task_project_delete"
                        ) && (
                          <button
                            onClick={() => handleRemove(data._id)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
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
