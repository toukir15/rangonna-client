"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import { DutyContext } from "@/app/admin/duty-plan/duty/page";
import DutyQuickModal from "./DutyQuickModal";

const DutyTable: React.FC = () => {
    const { permissionList } = useGlobalContext();
    const {
        dutyTimeData,
        tableLoading,
        handleEditClick,
        handleRemove,
    } = useContext(DutyContext);

    const [popupIndex, setPopupIndex] = useState<number | null>(null);
    const popupRef = useRef<HTMLDivElement | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [userInfo, setUserInfo] = useState();

    const togglePopup = (index: number) => {
        setPopupIndex((prev) => (prev === index ? null : index));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setPopupIndex(null);
            }
        };

        if (popupIndex !== null) {
            document.addEventListener("mousedown", handleClickOutside);
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
                data={dutyTimeData}
                isLoading={tableLoading}
                noDataViewCondition={
                    dutyTimeData?.length < 1 ? "No data available" : null
                }
                colValue={6}
            >
                <Thead>
                    <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300">
                        <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
                            Shift
                        </Th>
                        <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
                            Team Leader
                        </Th>
                        <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-24">
                            Break Time
                        </Th>
                        <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-24">
                            Month
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
                    {dutyTimeData?.map((duty: any, index: number) => {
                        return (
                            <Tr className="h-14" key={duty?._id}>
                                <Td>
                                    <p className="capitalize">{duty?.shift_time || "-"}</p>
                                    <p className="pt-1 text-sm text-gray-500">
                                        {duty?.start_time || "-"} - {duty?.end_time || "-"}
                                    </p>
                                    <p className="pt-1 text-sm text-gray-500">
                                        {duty?.from_date || "-"} - {duty?.to_date || "-"}
                                    </p>
                                </Td>

                                <Td>
                                    <p className="font-medium">
                                        {duty?.team_leader?.name || "-"}
                                    </p>
                                    <p className="pt-1 text-sm text-gray-500">
                                        {duty?.team_leader?.email || ""}
                                    </p>
                                </Td>

                                <Td>{duty?.break_time || "-"}</Td>
                                <Td>{duty?.month || "-"}</Td>

                                <Td>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() => {
                                            setModalOpen(true);
                                            setUserInfo(duty || []);
                                        }}
                                    >
                                        <Icon
                                            name="visibility"
                                            variant="outlined"
                                            className="cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                            View ({duty?.team_members?.length || 0})
                                        </span>
                                    </button>
                                </Td>

                                <Td>
                                    {hasPermission(permissionList, "roster_plan_edit", "roster_plan_delete") && (
                                        <div className="relative">
                                            <Icon
                                                name="more_horiz"
                                                variant="outlined"
                                                onClick={() => togglePopup(index)}
                                                className="cursor-pointer"
                                            />

                                            {popupIndex === index && (
                                                <div
                                                    ref={popupRef}
                                                    className="absolute top-8 right-0 bg-white border shadow-md rounded-lg p-4 z-20 min-w-40 dark:bg-gray-700 dark:border-gray-500"
                                                >
                                                    {hasPermission(permissionList, "roster_plan_edit") && (
                                                        <button
                                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                                                            onClick={() => {
                                                                handleEditClick(duty);
                                                                setPopupIndex(null);
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                    )}

                                                    {hasPermission(permissionList, "roster_plan_delete") && (
                                                        <button
                                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                                                            onClick={() => {
                                                                handleRemove(duty?._id);
                                                                setPopupIndex(null);
                                                            }}
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

            <DutyQuickModal
                isModalOpen={modalOpen}
                setIsModalOpen={setModalOpen}
                userInfo={userInfo}
            />
        </div>
    );
};

export default DutyTable;