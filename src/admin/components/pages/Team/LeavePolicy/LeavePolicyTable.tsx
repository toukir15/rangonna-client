import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import { LeavePolicyContext } from "@/app/admin/team/leave-policy/page";
import { LeavePolicy } from "@admin/@interfaces/team/leavePolicy/leavePolicy.interface";
import { formatTimeAgo } from "@admin/utils/hook.utils";

const LeavePolicyTable: React.FC = () => {
    const { permissionList } = useGlobalContext();
    const {
        leaveData,
        tableLoading,
        handleRemove,
        handleEditClick
    } = useContext(LeavePolicyContext);

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
            className="min-h-[600px]"
            data={leaveData}
            isLoading={tableLoading}
            noDataViewCondition={leaveData?.length < 1 ? "No data available" : null}
            colValue={11}
        >
            <Thead>
                <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
                    <Th className="dark:text-gray-300 2xl:min-w-40 lg:min-w-40 min-w-40">
                        Date
                    </Th>

                    <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
                        Title
                    </Th>

                    <Th className="dark:text-gray-300 2xl:min-w-20 lg:min-w-14 min-w-32">
                        Leave
                    </Th>

                    <Th className="dark:text-gray-300 ">Action</Th>
                </Tr>
            </Thead>
            <Tbody className="dark:bg-gray-800 bg-white">
                {leaveData?.map((leave: LeavePolicy, index: number) => {
                    return (
                        <Tr className="h-14" key={index}>
                            <Td className="text-base font-bold">
                                <p> {formatTimeAgo(leave.createdAt)}</p>
                            </Td>
                            <Td>
                                <p> {leave.title}</p>
                            </Td>
                            <Td className="">{leave.monthly_leaves}</Td>
                            <Td className="">
                                {hasPermission(permissionList, "leave_policy_delete", "leave_policy_edit") &&
                                    (
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
                                                    {
                                                        hasPermission(permissionList, "leave_policy_edit") && <button
                                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                                                            onClick={() => handleEditClick(leave)}
                                                        >
                                                            Edit
                                                        </button>
                                                    }

                                                    {
                                                        hasPermission(permissionList, "leave_policy_delete") && <button
                                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                                                            onClick={() => handleRemove(leave?._id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    }
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

export default LeavePolicyTable;
