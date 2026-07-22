import { formateDateWithMonth } from "@admin/utils";
import React, { forwardRef } from "react";

interface PackingSlipPrintProps {
  invoiceData: any;
}

const InvoiceNew = forwardRef<HTMLDivElement, PackingSlipPrintProps>(
  ({ invoiceData }, ref) => {
    const general = invoiceData?.general || {};
    const order = invoiceData?.order || {};

    return (
      <div
        ref={ref}
        className="hidden print:block bg-white text-black p-6 w-full"
      >
        <div className="w-[130mm] mx-auto">
          <div className="flex justify-between items-start border-b-[0.5px] border-gray-300 pb-2 mb-2">
            <div>
              {general?.logo && (
                <img
                  src={general.logo}
                  alt="Shop Logo"
                  className="w-24 h-24 object-contain mb-2"
                />
              )}
            </div>

            <div className="text-right">
              <h1 className="text-xl font-bold">{general?.shop_name || "-"}</h1>
              <p className="text-sm">
                {general?.shop_address
                  ? general.shop_address
                      .split(" ")
                      .map((word: string, i: number, arr: string[]) => {
                        // last 2 words শুরু হলে new line
                        if (i === arr.length - 2) {
                          return (
                            <React.Fragment key={i}>
                              <br />
                              {word + " "}
                            </React.Fragment>
                          );
                        }
                        return word + " ";
                      })
                  : "-"}
              </p>
              <p className="text-sm"> {general?.phone || "-"}</p>
              {/* <p className="text-sm">{general?.web_url || "-"}</p> */}
              {/* <h2 className="text-xl font-semibold">Packing Slip</h2>
              <p className="text-sm mt-2">
                <span className="font-semibold">Order ID:</span>{" "}
                {order?.sysid || "-"}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Date:</span>{" "}
                {order?.createdAt
                  ? new Date(order.createdAt).toLocaleString()
                  : "-"}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Payment:</span>{" "}
                {order?.payment_method_title || "-"}
              </p> */}
            </div>
          </div>

          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold  pb-1 ">
                Customer Information
              </h3>
              <p className="text-sm">
                {order?.first_name} {order?.last_name}
              </p>

              <p className="text-sm">{order?.address || "-"}</p>
              <p className="text-sm">{order?.phone || "-"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Order ID:</p>
              <p className="text-sm">{order?.sysid}</p>
              <p className="text-sm">
                {formateDateWithMonth(order?.createdAt) || "-"}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold  pb-1 ">Order Items</h3>

            <table className="w-full ">
              <thead className="border border-gray-300 border-collapse">
                <tr className="bg-gray-100">
                  <th className=" px-3 py-2 text-left text-sm">Product</th>
                  <th className=" px-3 py-2 text-left text-sm">Qty</th>
                  <th className=" px-3 py-2 text-left text-sm">Price</th>
                  <th className=" px-3 py-2  text-sm text-right">Total</th>
                </tr>
              </thead>
              <tbody className="border border-gray-300 border-collapse">
                {order?.line_items?.length > 0 ? (
                  order.line_items.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className=" px-3 py-0.5 text-sm">
                        {item?.title || "-"}
                      </td>
                      <td className=" px-3 py-0.5 text-sm">
                        {item?.quantity || 0}
                      </td>
                      <td className=" px-3 py-0.5 text-sm">
                        ৳ {item?.price || 0}
                      </td>
                      <td className=" px-3 py-0.5 text-sm text-right">
                        ৳ {item?.total || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="border border-gray-300 px-3 py-2 text-center text-sm"
                    >
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="pt-2">
                    <div className="w-64 ml-auto text-sm space-y-1">
                      {/* Subtotal */}
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>
                          ৳
                          {(
                            (order?.total || 0) +
                            (order?.discount_total || 0) -
                            (order?.shipping_total || 0)
                          ).toFixed(0)}
                        </span>
                      </div>

                      {/* Shipping */}
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>৳{order?.shipping_total || 0}</span>
                      </div>

                      {/* Total */}
                      <div className="flex justify-between border-t pt-2 font-semibold">
                        <span>Total</span>
                        <span>৳{order?.total || 0}</span>
                      </div>
                      {/* Discount */}
                      {order?.discount_total ? (
                        <div className="flex justify-between">
                          <span>Discount (-)</span>
                          <span>৳{order?.discount_total}</span>
                        </div>
                      ) : null}

                      {/* Paid */}
                      {order?.paid ? (
                        <div className="flex justify-between">
                          <span>Paid (-)</span>
                          <span>৳{order?.paid}</span>
                        </div>
                      ) : null}

                      {/* Due */}
                      <div
                        className={`flex text-base justify-between font-bold mt-1 ${
                          order?.due
                            ? "text-red-600 border bg-red-100 border-red-600 rounded-md px-4 py-2"
                            : ""
                        }`}
                      >
                        <span>Due</span>
                        <span>৳{order?.due || 0}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  },
);

InvoiceNew.displayName = "PackingSlipPrint";

export default InvoiceNew;
