"use client";
import React, { useContext, useMemo } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { hasPermission } from "@admin/utils";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { DashboardShowroomReportContext } from "@/app/admin/dashboard/showroom-report/page";

const DashBoardShowroomTableAdmin: React.FC = () => {
    const { permissionList } = useGlobalContext();
    const { returnListData, tableLoading, setModalOpen, setItems } = useContext(
        DashboardShowroomReportContext
    );
    const totalCreateAmount = useMemo(() => {
        return returnListData?.reduce((acc: number, item: any) => {
            return acc + (Number(item?.createdAt_amount) || 0);
        }, 0);
    }, [returnListData]);
    const totalDateAmount = useMemo(() => {
        return returnListData?.reduce((acc: number, item: any) => {
            return acc + (Number(item?.transaction_date_amount) || 0);
        }, 0);
    }, [returnListData]);

    return (
        <TableWrapper
            className=""
            isSwitchOn
            data={returnListData}
            isLoading={tableLoading}
            noDataViewCondition={
                returnListData?.length < 1 ? "No return data found" : null
            }
            colValue={3}
        >
            <Thead>
                <Tr className="bg-blue-100 dark:bg-gray-700 h-[40px]">
                    <Th className="dark:text-gray-300 min-w-40">Payment Method</Th>
                    <Th className="dark:text-gray-300 min-w-40">Date By Order Amount</Th>
                    <Th className="dark:text-gray-300 min-w-40">Daily Amount</Th>
                    <Th className="dark:text-gray-300 min-w-40">Quick View</Th>
                </Tr>
            </Thead>

            <Tbody className="bg-white dark:bg-gray-800">
                {returnListData?.map((item: any, index: number) => {
                    return (
                        <Tr key={index} className="h-8 align-top">
                            <Td>{item?.payment_method}</Td>

                            <Td>{item?.transaction_date_amount}</Td>
                            <Td>{item?.createdAt_amount}</Td>

                            <Td>
                                {hasPermission(
                                    permissionList,
                                    "showroom_payment_history_quick_view"
                                ) && (
                                        <Icon
                                            onClick={() => {
                                                setModalOpen(true);
                                                setItems(item);
                                            }}
                                            name={"visibility"}
                                            variant="outlined"
                                            className="cursor-pointer"
                                        />
                                    )}
                            </Td>
                        </Tr>
                    );
                })}

                {/* ✅ Footer Row */}
                {returnListData?.length > 0 && (
                    <Tr className=" font-semibold">
                        <Td className="text-right">Total:</Td>
                        <Td>{totalDateAmount}</Td>
                        <Td>{totalCreateAmount}</Td>
                    </Tr>
                )}
            </Tbody>
        </TableWrapper>
    );
};

export default DashBoardShowroomTableAdmin;
