"use client";
import { formateDateWithMonth } from "@admin/utils";

const PrintableOrderSummary = ({ orderDetails, printOnCallDocument }: any) => {
  const totalQuantity =
    orderDetails?.order?.line_items?.reduce(
      (sum: number, item: any) => sum + (item?.quantity || 0),
      0,
    ) || 0;
  const subtotal =
    orderDetails?.order?.line_items?.reduce(
      (sum: number, item: any) => sum + (item?.total || 0),
      0,
    ) || 0;
  return (
    <div
      id="printableContent"
      style={{
        display: printOnCallDocument ? "block" : "none",
        maxWidth: "800px",
        margin: "auto",
        // padding: "30px",
        border: "1px solid #eee",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.15)",
        fontSize: "16px",
        // lineHeight: "24px",
        fontFamily: "'Helvetica Neue', 'Helvetica', Arial, sans-serif",
        color: "#555",
      }}
    >
      {orderDetails && (
        <div style={{ margin: "30px 40px" }}>
          {/* Header Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <img
                src={orderDetails?.general?.logo}
                width={100}
                alt="Shop Logo"
                height={90}
              />
            </div>
            <div style={{ textAlign: "right", width: "200px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "bold", margin: "0" }}>
                {orderDetails?.general?.shop_name}
              </h3>
              <p style={{ margin: "5px 0", fontSize: "14px" }}>
                {orderDetails?.general?.shop_address}
              </p>
              <p style={{ margin: "5px 0", fontSize: "14px" }}>
                {orderDetails?.general?.phone}
              </p>
              <p style={{ margin: "5px 0" }}>
                {formateDateWithMonth(orderDetails?.order?.createdAt)}
              </p>
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "600",
                margin: "1px 0",
              }}
            >
              Customer Information
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              <div>
                <p style={{ margin: "5px 0" }}>
                  <strong></strong> {orderDetails?.order?.first_name}
                  {orderDetails?.order?.last_name}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong></strong> {orderDetails?.order?.address}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong></strong> {orderDetails?.order?.phone}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <h2 style={{ margin: "5px 0", fontSize: "50px" }}>
                  {/* <strong>Order ID:</strong>{" "} */}
                  <strong>{orderDetails?.order?.sysid}</strong>
                </h2>

                <p style={{ margin: "5px 0px" }}>
                  <strong></strong> {orderDetails?.order?.payment?.title}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div style={{ marginBottom: "1px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                // justifyContent: "space-between",

                marginBottom: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: 0,
                }}
              >
                Order Items
              </h2>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  background: "#EEF2FF",
                  color: "#4338CA",
                  fontSize: "20px",
                  fontWeight: "600",
                  border: "1px solid #C7D2FE",
                  textTransform: "capitalize",
                  marginLeft: "10px",
                }}
              >
                {orderDetails?.order?.courier_type || "N/A"}
              </span>
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #ddd",
                borderRadius: "10px",
              }}
              className="border"
            >
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5" }}>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    Product
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    Quantity ({totalQuantity})
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    Price
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      fontWeight: 600,
                    }}
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {orderDetails?.order?.line_items?.map(
                  (item: any, index: number) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid #ddd",
                        backgroundColor:
                          index % 2 === 0 ? "#ffffff" : "transparent",
                      }}
                    >
                      <td style={{ padding: "8px", textAlign: "left" }}>
                        {item?.title}
                      </td>
                      <td style={{ padding: "8px", textAlign: "left" }}>
                        {item?.quantity}
                      </td>
                      <td style={{ padding: "8px", textAlign: "left" }}>
                        ৳{item?.price}
                      </td>
                      <td style={{ padding: "8px", textAlign: "right" }}>
                        ৳{item?.total}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              textAlign: "right",
              marginBottom: "40px",
              padding: "4px",
              width: "200px",
              marginLeft: "auto",
            }}
          >
            {/* Subtotal */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "1px 0",
              }}
            >
              <span>Subtotal</span>
              <span>৳{subtotal.toFixed(0)}</span>
            </div>

            {/* Shipping */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "1px 0",
              }}
            >
              <span>Shipping</span>
              <span>৳{orderDetails?.order?.shipping_total || 0}</span>
            </div>

            {/* Discount */}
            {orderDetails?.order?.discount_total ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "1px 0",
                }}
              >
                <span>Discount(-)</span>
                <span>৳{orderDetails?.order?.discount_total || 0}</span>
              </div>
            ) : null}

            {/* Total */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "1px 0",
                borderTop: "1px solid #ccc",
                paddingTop: "5px",
              }}
            >
              <strong>Total</strong>
              <strong>
                ৳
                {(
                  subtotal +
                  orderDetails?.order?.shipping_total -
                  orderDetails?.order?.discount_total
                ).toFixed(0)}
              </strong>
            </div>

            {/* Paid */}
            {orderDetails?.order?.paid ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "1px 0",
                }}
              >
                <span>Paid(-)</span>
                <span>৳{orderDetails?.order?.paid || 0}</span>
              </div>
            ) : null}

            {/* Due */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "1px 0",
              }}
            >
              <strong>Due</strong>
              <strong>৳{orderDetails?.order?.due || 0}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintableOrderSummary;
