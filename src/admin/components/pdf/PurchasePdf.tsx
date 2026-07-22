"use client";
import React from "react";
import Image from "next/image";

interface Props {
  data: any;
}

const PurchasePdf: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  // Decide Watermark text
  const watermarkText = data?.due === 0 ? "PAID" : "DUE";

  return (
    <div className="relative bg-white text-black p-6 text-sm font-sans leading-6">
      {/* ------- WATERMARK -------- */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-35deg)",
          fontSize: "120px",
          fontWeight: "bold",
          color: "rgba(0,0,0,0.07)",
          pointerEvents: "none",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        {watermarkText}
      </div>

      {/* ------- TOP INFO -------- */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div>
          <h3 className="font-semibold text-base mb-1">Supplier Info</h3>
          <p>{data?.supplier?.name}</p>
          <p>{data?.supplier?.email}</p>
          <p>{data?.supplier?.phone}</p>
          <p>{data?.supplier?.address}</p>
        </div>

        <div>
          <h3 className="font-semibold text-base mb-1">Company Info</h3>
          <p>Naviforce</p>
          <p>admin@example.com</p>
          <p>01841544590</p>
          <p>14, Purana Paltan, Dhaka-1000</p>
        </div>

        <div>
          <h3 className="font-semibold text-base mb-1">Purchase Info</h3>
          <p>Invoice : {data?.invoice}</p>
          <p>Status : {data?.status}</p>
          <p>Warehouse : {data?.warehouse?.title}</p>
          <p>Payment : {data?.payment_status?.toUpperCase()}</p>
        </div>
      </div>

      {/* ------- TABLE -------- */}
      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr className="border">
            <th className="py-2 px-2 border">Product</th>
            <th className="py-2 px-2 border text-center">Net Cost</th>
            <th className="py-2 px-2 border text-center">Qty</th>
            <th className="py-2 px-2 border text-right">Unit Cost</th>
            <th className="py-2 px-2 border text-right">Discount</th>
            <th className="py-2 px-2 border text-right">Subtotal</th>
          </tr>
        </thead>

        <tbody>
          {data?.purchase_products?.map((p: any, i: number) => (
            <tr key={i} className="border">
              <td className="py-3 px-2 border">
                <div className="flex items-center gap-3">
                  <Image
                    src={p?.product?.featured_image?.src}
                    alt="product"
                    width={45}
                    height={45}
                    className="rounded"
                  />
                  <span>{p?.product?.title}</span>
                </div>
              </td>
              <td className="py-2 px-2 border text-center">{p?.unit_cost}</td>
              <td className="py-2 px-2 border text-center">{p?.quantity}</td>
              <td className="py-2 px-2 border text-right">{p?.unit_cost}</td>
              <td className="py-2 px-2 border text-right">{p?.discount}</td>
              <td className="py-2 px-2 border text-right">{p?.subtotal}</td>
            </tr>
          ))}

          {/* totals */}
          <tr>
            <td colSpan={4}></td>
            <td className="border px-2 py-1 font-semibold">Discount</td>
            <td className="border px-2 py-1 text-right">{data?.discount}</td>
          </tr>
          <tr>
            <td colSpan={4}></td>
            <td className="border px-2 py-1 font-semibold">Shipping</td>
            <td className="border px-2 py-1 text-right">{data?.shipping}</td>
          </tr>
          <tr>
            <td colSpan={4}></td>
            <td className="border px-2 py-1 font-semibold">Grand Total</td>
            <td className="border px-2 py-1 text-right font-bold">
              {data?.grand_total}
            </td>
          </tr>
          <tr>
            <td colSpan={4}></td>
            <td className="border px-2 py-1 font-semibold">Paid</td>
            <td className="border px-2 py-1 text-right">{data?.paid}</td>
          </tr>
          <tr>
            <td colSpan={4}></td>
            <td className="border px-2 py-1 font-semibold">Due</td>
            <td className="border px-2 py-1 text-right">{data?.due}</td>
          </tr>
        </tbody>
      </table>

      <p className="text-xs text-center mt-8">
        This is a system generated invoice
      </p>
    </div>
  );
};

export default PurchasePdf;
