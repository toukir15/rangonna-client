"use client";
import React, { useContext } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Image from "next/image";
import { ReturnListContext } from "@/app/admin/orders/return/page";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { getStatusLabel, getStatusStyle } from "@admin/utils/system.utils";
import NodataImage from "@admin/assets/images/Image-not-found.png";

const ReturnListTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const { returnListData, tableLoading, handleStatusUpdate } =
    useContext(ReturnListContext);

  return (
    <TableWrapper
      className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
      isSwitchOn
      data={returnListData}
      isLoading={tableLoading}
      noDataViewCondition={
        returnListData?.length < 1 ? "No return data found" : null
      }
      colValue={8}
    >
      <Thead>
        <Tr>
          <Th className="min-w-40">Order ID</Th>
          <Th className="min-w-48">Product</Th>
          <Th className="min-w-32">Return Status</Th>
          <Th className="min-w-32">Issue</Th>
          <Th className="min-w-32">Creator</Th>
          <Th className="min-w-40">New Order</Th>
          <Th className="min-w-28 is-center">Update Status</Th>
        </Tr>
      </Thead>

      <Tbody>
        {returnListData?.map((item: any, index: number) => {
          const oldItems = item?.return_line_items || [];
          const newItems = item?.exchange_line_items || [];

          return (
            <Tr key={index}>
              <Td>
                <div className="table-user-info">
                  <span className="table-id-chip">
                    {item?.old_order?.sysid || "--"}
                  </span>
                  <span className={getStatusStyle(item?.old_order?.status)}>
                    {getStatusLabel(item?.old_order?.status)}
                  </span>
                  <span className="table-date-cell">
                    {formatTimeAgo(item?.createdAt)}
                  </span>
                </div>
              </Td>
              <Td>
                <div className="table-contact-stack max-w-80">
                  <div className="table-product-thumbs flex-wrap">
                    {oldItems.map((p: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="table-product-thumb !cursor-default">
                          <Image
                            src={p?.product?.featured_image?.src || NodataImage}
                            alt={p?.title || "Product"}
                            width={120}
                            height={108}
                          />
                        </div>
                        <div className="edit-order-product-meta">
                          <p className="edit-order-product-title !text-sm">
                            {p?.title}
                          </p>
                          <p className="edit-order-product-sub">
                            Qty: {p?.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {item?.status === "exchange" &&
                    newItems.map((p: any, i: number) => (
                      <div key={`new-${i}`} className="flex items-center gap-2">
                        <div className="table-product-thumb !cursor-default">
                          <Image
                            src={p?.product?.featured_image?.src || NodataImage}
                            alt={p?.title || "Product"}
                            width={120}
                            height={108}
                          />
                        </div>
                        <div className="edit-order-product-meta">
                          <p className="edit-order-product-title !text-sm">
                            {p?.title}
                          </p>
                          <p className="edit-order-product-sub">Old Product</p>
                        </div>
                      </div>
                    ))}

                  <p className="data-table-muted">
                    Note: {item?.old_order?.last_note?.text || "--"} —{" "}
                    {item?.old_order?.last_note?.user_name || ""}
                  </p>
                </div>
              </Td>

              <Td>
                <span className={getStatusStyle(item?.status)}>
                  {getStatusLabel(item?.status)}
                </span>
              </Td>
              <Td>
                <p className="data-table-secondary">
                  {item?.issue_title || "--"}
                </p>
              </Td>
              <Td>
                <div className="table-contact-stack">
                  <span className="data-table-primary">
                    {item?.user?.name || "--"}
                  </span>
                  <span className="table-date-cell">
                    {formatTimeAgo(item?.updatedAt) || "--"}
                  </span>
                </div>
              </Td>
              <Td>
                <div className="table-contact-stack">
                  <span className="table-id-chip">
                    {item?.new_order?.sysid || "--"}
                  </span>
                  <span className={getStatusStyle(item?.new_order?.status)}>
                    {getStatusLabel(item?.new_order?.status)}
                  </span>
                  <p className="data-table-muted">
                    Note: {item?.new_order?.last_note?.text || "--"} —{" "}
                    {item?.new_order?.last_note?.user_name || ""}
                  </p>
                </div>
              </Td>

              <Td className="is-center">
                {permissionList.includes("order_return_edit") &&
                  item?.status === "issue" &&
                  item?.is_partial === false && (
                    <button
                      type="button"
                      className="btn-primary btn-primary-inline !px-3 !py-1.5 !text-xs"
                      onClick={() => handleStatusUpdate(item?._id)}
                    >
                      Fix it
                    </button>
                  )}
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </TableWrapper>
  );
};

export default ReturnListTable;
