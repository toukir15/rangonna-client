import React, { useContext, useEffect, useRef, useState } from "react";
import logo from "@admin/assets/images/user.png";
import Image from "next/image";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { TeamContext } from "@/app/admin/team/member/page";
import Icon from "@admin/components/core/Icon/Icon";
import Alert from "@admin/components/core/Aleart/Aleart";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import { useRouter } from "next/navigation";
import ToggleSwitch from "@admin/components/core/SwitchButton/ToggleSwitch";

const UsersTable: React.FC = () => {
  const router = useRouter();
  const { permissionList } = useGlobalContext();
  const {
    isLoading,
    teamData,
    // handleEditClick,
    handleRemove,
    isAlertOpen,
    confirmRemove,
    cancelRemove,
    activeToggleLoading,
    toggleIsActive
  } = useContext(TeamContext);
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
        isLoading={isLoading}
      >
        <h3 className="text-2xl font-bold">Confirm Delete</h3>
        <h6 className="text-md my-4">
          Are you sure you want to remove this group?
        </h6>
        <div className="flex items-center justify-center my-8">
          <Icon
            name="delete"
            variant="outlined"
            size={150}
            className="text-red-400"
          />
        </div>
      </Alert>

      <TableWrapper
        showCheckbox={true}
        isLoading={isLoading}
        isSwitchOn
        data={teamData}
        className="min-h-[700px]"
        colValue={7}
      >
        <Thead>
          <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
            <Th className="xl:min-w-24 min-w-20 dark:text-gray-200">
              Image
            </Th>
            <Th className="min-w-40 dark:text-gray-200">Name</Th>
            <Th className="xl:min-w-40 min-w-20 dark:text-gray-200">
              Phone No
            </Th>
            <Th className="xl:min-w-32 min-w-24 dark:text-gray-200">
              Email
            </Th>
            <Th className="xl:min-w-28 dark:text-gray-200">
              Role
            </Th>
            <Th className="xl:min-w-36 dark:text-gray-200">
              Status
            </Th>
            <Th className="xl:min-w-36 dark:text-gray-200">
              Active
            </Th>
            <Th className="xl:min-w-20 dark:text-gray-200">
              Action
            </Th>
          </Tr>
        </Thead>
        <Tbody className="dark:bg-gray-800 bg-white">
          {teamData?.data?.map((item: any, index: number) => (
            <Tr key={index} className="h-14">
              <Td>
                <Image
                  src={item?.image ? item.image : logo}
                  alt={item.name}
                  width="50"
                  height="50"
                  className={`${item.image ? "" : "bg-gray-300 rounded"}`}
                />
              </Td>

              <Td>{item.name}</Td>
              <Td>{item.phone}</Td>
              <Td>{item.email}</Td>
              <Td>{item.role}</Td>
              <Td>
                <span
                  className={`font-bold uppercase py-1.5  px-6 rounded-lg ${item?.status
                    ? "bg-green-100 text-green-600 "
                    : "bg-gray-100 text-gray-600"
                    }`}
                >
                  {item.status ? "Active" : "Inactive"}
                </span>
              </Td>
              <Td>
                {activeToggleLoading[item._id] ? (
                  <Icon
                    name="restart_alt"
                    size={28}
                    className="text-green-600 animate-spin ml-5"
                  />
                ) : (
                  <ToggleSwitch
                    isChecked={item.status}
                    onToggle={() => {
                      toggleIsActive(item);
                    }}
                    disabled={

                      activeToggleLoading[item?._id] ||
                      !hasPermission(permissionList, "team_user_edit")
                    }
                  />
                )}
              </Td>
              <Td>
                {hasPermission(
                  permissionList,
                  "team_user_edit",
                  "team_user_delete"
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
                          className="absolute top-8 right-0 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-2 z-20 min-w-40"
                        >
                          {hasPermission(permissionList, "team_user_edit") && (
                            <button

                              onClick={() => {
                                router.push(`/admin/team/member/edit/${item?._id}`);
                              }}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-600"
                            >
                              Edit
                            </button>
                          )}

                          {hasPermission(permissionList, "team_user_delete") && (
                            <button
                              onClick={() => handleRemove(item?._id)}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-600"
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
          ))}
        </Tbody>
      </TableWrapper>
    </div>
  );
};

export default UsersTable;
