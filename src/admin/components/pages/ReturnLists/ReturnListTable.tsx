"use client";
import React, { useContext } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Image from "next/image";
import Button from "@admin/components/core/Button/Button";
import { ReturnListContext } from "@/app/admin/orders/return/page";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { formatTimeAgo } from "@admin/utils/hook.utils";

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    return: "bg-red-100 text-red-700",
    exchange: "bg-blue-100 text-blue-700",
    issue: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        map[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status?.toUpperCase()}
    </span>
  );
};

const ReturnListTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const { returnListData, tableLoading, handleStatusUpdate } =
    useContext(ReturnListContext);

  return (
    <TableWrapper
      className="min-h-[650px]"
      isSwitchOn
      data={returnListData}
      isLoading={tableLoading}
      noDataViewCondition={
        returnListData?.length < 1 ? "No return data found" : null
      }
      colValue={8}
    >
      <Thead>
        <Tr className="bg-blue-100 dark:bg-gray-700 h-[50px]">
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-32 min-w-40 ">
            Order ID
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-32 min-w-40">
            Product
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-32 min-w-40">
            Return Status
          </Th>

          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-32 min-w-40">
            Issue
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-32 min-w-40">
            Creator
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-32 min-w-40">
            New Order
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-32 min-w-40">
            Update Status
          </Th>
        </Tr>
      </Thead>

      <Tbody className="bg-white dark:bg-gray-800">
        {returnListData?.map((item: any, index: number) => {
          const oldItems = item?.return_line_items || [];
          const newItems = item?.exchange_line_items || [];

          return (
            <Tr key={index} className="h-20 align-top">
              <Td>
                <div className="max-w-96">
                  <p className="font-semibold pt-2">{item?.old_order?.sysid}</p>
                  {/* <p className="font-semibold pt-2">
                    {item?.old_order?.status}
                  </p> */}
                  <StatusBadge status={item?.old_order?.status} />
                  <p className="font-semibold pt-2">
                    {formatTimeAgo(item?.createdAt)}
                  </p>
                </div>
              </Td>
              <Td>
                <div className="space-y-4 max-w-80">
                  {oldItems.map((p: any, index: number) => (
                    <div key={index} className="flex gap-3 items-center">
                      <Image
                        src={p?.product?.featured_image?.src || ""}
                        alt={p?.title}
                        width={45}
                        height={45}
                        className="rounded border"
                      />
                      <div>
                        <p className="text-sm font-medium">{p?.title}</p>
                        <p className="text-sm font-medium">
                          Qty: {p?.quantity}
                        </p>
                        {/* {item?.status === "exchange" ? (
                          <p className="text-xs text-blue-600">New Product</p>
                        ) : null} */}
                      </div>
                    </div>
                  ))}

                  {/* NEW / EXCHANGE */}
                  {item?.status === "exchange" &&
                    newItems.map((p: any, index: number) => (
                      <div key={index} className="flex gap-3 items-center">
                        <Image
                          src={p?.product?.featured_image?.src || ""}
                          alt={p?.title}
                          width={45}
                          height={45}
                          className="rounded border"
                        />
                        <div>
                          <p className="text-sm font-medium">{p?.title}</p>
                          {item?.status === "exchange" ? (
                            <p className="text-xs text-gray-500">Old Product</p>
                          ) : null}
                        </div>
                      </div>
                    ))}

                  <p className="font-semibold py-2">
                    Note: {item?.old_order?.last_note?.text} -{" "}
                    {item?.old_order?.last_note?.user_name}
                  </p>
                </div>
              </Td>

              <Td className="max-w-56">
                <StatusBadge status={item?.status} />
              </Td>
              <Td className="max-w-56">
                <p className="text-sm">{item?.issue_title || "--"}</p>
              </Td>
              <Td className="max-w-56">
                <p className="text-sm">{item?.user?.name || "--"}</p>
                <p className="text-sm">
                  {formatTimeAgo(item?.updatedAt) || "--"}
                </p>
              </Td>
              <Td>
                <div className="max-w-96">
                  <p className="font-semibold mb-1">{item?.new_order?.sysid}</p>

                  <StatusBadge status={item?.new_order?.status} />
                  <p className="font-semibold py-2">
                    Note: {item?.new_order?.last_note?.text} -{" "}
                    {item?.new_order?.last_note?.user_name}
                  </p>
                </div>
              </Td>

              <Td>
                {permissionList.includes("order_return_edit") &&
                  item?.status === "issue" &&
                  item?.is_partial === false && (
                    <div>
                      <Button
                        className="bg-blue-500 !px-8 !py-1 !text-xs"
                        onClick={() => {
                          handleStatusUpdate(item?._id);
                        }}
                      >
                        Fix it
                      </Button>
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

export default ReturnListTable;
