import { formateDateWithMonth } from "@admin/utils";
import React, { forwardRef } from "react";

interface PackingSlipPrintProps {
  invoiceData: any;
}

const PackingSlipPrint = forwardRef<HTMLDivElement, PackingSlipPrintProps>(
  ({ invoiceData }, ref) => {
    const general = invoiceData?.general || {};
    const order = invoiceData?.order || invoiceData?.issue_data || {};

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
                  <th className=" px-3 py-2  text-sm text-right">Qty</th>
                </tr>
              </thead>
              <tbody className="border border-gray-300 border-collapse">
                {order?.line_items?.length > 0 ? (
                  order.line_items.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className=" px-3 py-0.5 text-sm">
                        {item?.title || "-"}
                        {item?.size ? ` (${item.size})` : ""}
                      </td>
                      <td className=" px-3 py-0.5 text-sm text-right">
                        {item?.quantity || 0}
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
            </table>
          </div>
        </div>
      </div>
    );
  },
);

PackingSlipPrint.displayName = "PackingSlipPrint";

export default PackingSlipPrint;
