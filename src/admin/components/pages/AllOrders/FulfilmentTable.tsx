"use client";

import React, { useContext } from "react";
import { Thead, Tbody, Tr, Th, Td } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { getStatusStyle } from "@admin/utils/system.utils";
import Image from "next/image";
import notFoundImage from "@admin/assets/images/Image-not-found.png";
import { noData, trimString } from "@admin/utils";
import Icon from "@admin/components/core/Icon/Icon";
import { ToastService } from "@admin/utils/toastr.service";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import Link from "next/link";
import { fulfillmentContext } from "@/app/admin/fulfillment/page";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { dueColor, paidColor } from "@admin/utils/constant";

const FulfillmentTable: React.FC = () => {
    const {
        orderList,
        tableLoading,
        selectedOrders,
        handleListPrintSelected,
        handleOrderPrintSelected,
        selectedAction,
        setSelectedAction,
        handleOrderInvoicePrint,
        handleBalkUpdate,
        statusSubmitting,
        handleImageClick,
        filter,
        handleAddAdvance,
        payLoadingId,
    } = useContext(fulfillmentContext);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            ToastService.success("Number copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };

    return (
        <div className="">
            <TableWrapper
                showCheckbox={true}
                data={orderList}
                noDataViewCondition={orderList?.length < 1 ? "No data available" : null}
                isSwitchOn={true}
                isLoading={tableLoading}
                isSelect={selectedOrders?.length > 0}
                handleListPrintSelected={handleListPrintSelected}
                handleOrderPrintSelected={handleOrderPrintSelected}
                className="min-h-[700px]"
                colValue={11}
                printLabel="Label Print"
                selectedAction={selectedAction}
                setSelectedAction={setSelectedAction}
                handleOrderInvoicePrint={handleOrderInvoicePrint}
                statusSubmitting={statusSubmitting}
                orderListPrintBtn={true}
                orderInvoicePrintBtn={true}
                bulkActionBtn={true}
                openBulk={filter === "ready-for-box"}
                handleBulkAction={handleBalkUpdate}
            >
                <Thead>
                    <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
                        <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 dark:text-gray-200">
                            Order ID
                        </Th>

                        <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 dark:text-gray-200">
                            Products
                        </Th>

                        <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 dark:text-gray-200 ps-10">
                            Status
                        </Th>

                        <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 dark:text-gray-200">
                            Total
                        </Th>

                        <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 dark:text-gray-200">
                            Paid
                        </Th>

                        <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 dark:text-gray-200">
                            Due
                        </Th>

                        <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 dark:text-gray-200 !text-nowrap">
                            Last Note
                        </Th>

                        <Th className="dark:text-gray-200 min-w-40 ps-8">
                            View
                        </Th>

                        <Th className="dark:text-gray-200">Actions</Th>
                    </Tr>
                </Thead>

                <Tbody className="dark:bg-gray-800 bg-white">
                    {orderList?.map((order: any, index: number) => {
                        return (
                            <Tr
                                className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                key={index}
                            >
                                <Td>
                                    <div className="flex text-base font-bold items-center text-nowrap">
                                        <span>{order?.sysid || noData}</span>

                                        <Icon
                                            size={16}
                                            name="content_copy"
                                            variant="outlined"
                                            className="ml-2 cursor-pointer"
                                            onClick={() => {
                                                navigator.clipboard.writeText(String(order?.sysid ?? ""));
                                                ToastService.success("Order ID copied to clipboard!");
                                            }}
                                        />
                                    </div>

                                    <div className="mt-2 flex items-center">
                                        <a href={`tel:${order?.customer?.phone}`}>
                                            {order?.customer?.phone}
                                        </a>
                                        <Icon
                                            onClick={() => copyToClipboard(order?.customer?.phone)}
                                            name="content_copy"
                                            size={16}
                                            className="ml-2 cursor-pointer"
                                        />
                                    </div>

                                    <div className="mt-1 flex items-center gap-1 text-nowrap min-w-32">
                                        <Icon name="calendar_month" size={20} variant="outlined" />
                                        <span>{formatTimeAgo(order?.createdAt) || noData}</span>
                                    </div>
                                </Td>

                                <Td>
                                    <div className="flex gap-2">
                                        {order?.line_items
                                            ?.slice(0, 3)
                                            ?.map((item: any, itemIndex: number) => {
                                                const src =
                                                    item?.product_id?.featured_image?.src || notFoundImage;

                                                return (
                                                    <div key={itemIndex} className="flex items-center">
                                                        <div className="w-16 h-12 relative cursor-pointer">
                                                            <Image
                                                                src={src}
                                                                quality={50}
                                                                alt={item?.title || "Product Image"}
                                                                className="rounded"
                                                                title={item?.title}
                                                                width={90}
                                                                height={20}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (typeof src === "string") {
                                                                        handleImageClick(src);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </Td>

                                <Td>
                                    <div
                                        className={`${getStatusStyle(
                                            order?.payment?.payment_status
                                        )} min-w-20 max-w-24 text-center`}
                                    >
                                        {order?.payment?.payment_status}
                                    </div>
                                </Td>

                                <Td>
                                    <div className="flex flex-wrap">
                                        <span className="text-md font-semibold text-gray-600 dark:text-gray-300">
                                            ৳ {order?.total || 0}
                                        </span>
                                    </div>
                                </Td>

                                <Td>
                                    <div className="flex flex-wrap">
                                        <span className={`${paidColor}`}>
                                            ৳ {order?.paid || 0}
                                        </span>
                                    </div>
                                </Td>

                                <Td>
                                    <div className="flex flex-wrap">
                                        <span className={`${dueColor}`}>
                                            ৳ {order?.due || 0}
                                        </span>
                                    </div>
                                </Td>

                                <Td>
                                    <div className="">
                                        <p>
                                            {Array.isArray(order?.notes) && order.notes.length > 0
                                                ? trimString(
                                                    order?.notes[order.notes.length - 1]?.text,
                                                    100
                                                )
                                                : noData}
                                        </p>

                                        <div className="mt-0.5 text-nowrap">
                                            <span>{order?.payment?.title || noData}</span>
                                        </div>
                                    </div>
                                </Td>

                                <Td>
                                    <Link
                                        href={`/admin/orders/view/${order?._id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => {
                                            if (order?.status) {
                                                localStorage.setItem("viewOrderStatus", order.status);
                                            }
                                        }}
                                        className="data-table-view-btn"
                                    >
                                        View
                                    </Link>
                                </Td>

                                <Td>
                                    <Button
                                        onClick={() => handleAddAdvance(order?._id)}
                                        disabled={payLoadingId === order?._id}
                                        className="!px-4 !py-0.5 rounded-lg !text-blue-600 text-center cursor-pointer inline-block text-nowrap !text-sm min-w-[90px]"
                                    >
                                        {payLoadingId === order?._id ? <ButtonLoader /> : "Pay"}
                                    </Button>
                                </Td>
                            </Tr>
                        );
                    })}
                </Tbody>
            </TableWrapper>
        </div>
    );
};

export default FulfillmentTable;