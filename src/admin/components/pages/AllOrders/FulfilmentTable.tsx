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
                className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
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
                    <Tr>
                        <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">
                            Order ID
                        </Th>
                        <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                            Products
                        </Th>
                        <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">
                            Status
                        </Th>
                        <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">
                            Total
                        </Th>
                        <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">
                            Paid
                        </Th>
                        <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">
                            Due
                        </Th>
                        <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 !text-nowrap">
                            Last Note
                        </Th>
                        <Th className="is-center min-w-40">View</Th>
                        <Th className="is-right">Actions</Th>
                    </Tr>
                </Thead>

                <Tbody>
                    {orderList?.map((order: any, index: number) => {
                        return (
                            <Tr key={index}>
                                <Td>
                                    <div className="table-user-info">
                                        <div className="table-id-row">
                                            <span className="table-id-chip">
                                                {order?.sysid || noData}
                                            </span>
                                            <button
                                                type="button"
                                                className="table-copy-btn"
                                                aria-label="Copy order ID"
                                                title="Copy order ID"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(String(order?.sysid ?? ""));
                                                    ToastService.success("Order ID copied to clipboard!");
                                                }}
                                            >
                                                <Icon
                                                    size={13}
                                                    name="content_copy"
                                                    variant="outlined"
                                                />
                                            </button>
                                        </div>
                                        <span className="table-contact-line">
                                            <Icon name="call" size={14} variant="outlined" />
                                            <a href={`tel:${order?.customer?.phone}`}>
                                                {order?.customer?.phone}
                                            </a>
                                            <button
                                                type="button"
                                                className="table-copy-btn"
                                                aria-label="Copy phone number"
                                                title="Copy phone number"
                                                onClick={() => copyToClipboard(order?.customer?.phone)}
                                            >
                                                <Icon name="content_copy" size={13} variant="outlined" />
                                            </button>
                                        </span>
                                        <span className="table-date-cell">
                                            <Icon name="calendar_today" size={13} variant="outlined" />
                                            {formatTimeAgo(order?.createdAt) || noData}
                                        </span>
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
                                    <span className="table-amount">
                                        ৳ {order?.total || 0}
                                    </span>
                                </Td>

                                <Td>
                                    <span className={`${paidColor} table-amount`}>
                                        ৳ {order?.paid || 0}
                                    </span>
                                </Td>

                                <Td>
                                    <span className={`${dueColor} table-amount`}>
                                        ৳ {order?.due || 0}
                                    </span>
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

                                <Td className="is-right">
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