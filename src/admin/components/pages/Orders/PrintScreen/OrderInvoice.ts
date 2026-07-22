import { formatTimeAgo } from "@admin/utils/hook.utils";

const OrderInvoice = ({ printOrderData }: any) => {
  // helper to safely coerce numbers
  const num = (v: any, fallback = 0) =>
    typeof v === "number" && isFinite(v) ? v : fallback;

  const money = (v: any) => `৳ ${num(v).toFixed(2)}`;

  let printContent = `
    <html>
      <head>
        <title>Print Selected Orders</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .invoice-container {
            max-width: 800px;
            margin: 20px auto;
            padding: 50px;
            border: 1px solid #ddd;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .promotional-banner {
            background-color: #ff6f61;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 20px;
            border-radius: 10px;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          .invoice-header img {
            width: 120px;
            height: auto;
          }
          .invoice-header .company-info {
            text-align: right;
          }
          .invoice-header .company-info p {
            margin: 0;
            font-size: 1.2rem;
            color: #555;
            padding-bottom: 10px;
          }
          .invoice-details {
            margin-bottom: 20px;
          }
          .invoice-details table {
            width: 100%;
            border-collapse: collapse;
          }
          .invoice-details th, .invoice-details td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .invoice-details th {
            background-color: #f2f2f2;
          }
          .invoice-totals {
            margin-top: 20px;
            text-align: right;
          }
          .invoice-totals table {
            width: 100%;
            border-collapse: collapse;
          }
          .invoice-totals td {
            text-align: right;
          }
          .invoice-totals .total {
            font-weight: bold;
            font-size: 1.1rem;
          }
          .page-break {
            page-break-after: always;
          }
          .flex-end {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: flex-start;
            text-align: right;
            line-height: 0;
          }

          .order-table {
            width: 100%;
            border-collapse: collapse;
          }

          .order-table td {
            vertical-align: top;
            padding: 8px 12px;
          }

          .order-table .billing-info {
            width: 50%;
          }

          .order-table .order-details {
            width: 50%;
            text-align: right;
          }

          .discount-border {
            position: relative;
          }
          
          .discount-border::after {
            content: "";
            position: absolute;
            bottom: 0;
            right: 0;
            width: 200px;
            border-bottom: 1px solid #ccc;
          }

          .dif {
            padding: 0px !important;
            text-align: end
          }
            
          @media print {
            .invoice-container {
              box-shadow: none;
              border: none;
            }
            .page-break {
              display: block;
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
  `;

  (printOrderData || []).forEach((entry: any) => {
    const order = entry?.order || {};
    const general = entry?.general || {};

    const subtotal = num(
      (order?.line_items || []).reduce(
        (sum: number, li: any) => sum + num(li?.total),
        0,
      ),
    );
    const discount = num(order?.discount_total);
    const shipping = num(order?.shipping_line?.total);
    const computedTotal = subtotal + shipping - discount;

    const total = num(order?.total, computedTotal);
    const paid = num(order?.paid);
    const due = num(order?.due, Math.max(total - paid, 0));

    const first = (order?.customer?.first_name || "").trim();
    const last = (order?.customer?.last_name || "").trim();
    const fullName = (first + (last ? " " + last : "")).trim();

    printContent += `
      <div class="invoice-container">
        <div class="invoice-header">
          <img src="${general?.logo || ""}" alt="logo" />
          <div class="company-info">
            <p><b>${general?.shop_name || ""}</b></p>
            <p>${general?.shop_address || "Address not specified"}</p>
            <p>${general?.phone || "Phone not provided"}</p>
          </div>
        </div>
        <div><h3
            style="font-size:20px; font-weight:600; margin-top:10px;"
          >
            Customer Information 
          </h3></div>
        <div class="invoice-details">
         <table class="order-table">
            <tr>
              <td class="billing-info">
                <p><b></b> ${fullName || "N/A"}</p>
                <p><b></b> ${order?.customer?.address || "Not specified"}</p>
                <p><b></b> ${order?.customer?.phone || "Not provided"}</p>
              </td>

              <td class="order-details">
                <p><b>Order Number:</b> ${order?.sysid || ""}</p>
                <p><b></b> ${
                  order?.createdAt ? formatTimeAgo(order?.createdAt) : ""
                }</p>
                <p>${order?.payment?.title || ""}</p>
              </td>
            </tr>
          </table>
        </div>
        <div class="invoice-details">
          <h2>Order Items</h2>
          <table>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th class="dif">Total</th>
            </tr>
            ${(order?.line_items || [])
              .map(
                (li: any) => `
              <tr>
                <td>${li?.title || ""}</td>
                <td>${num(li?.quantity)}</td>
                <td>${money(li?.price)}</td>
                <td class="dif">${money(li?.total)}</td>
              </tr>`,
              )
              .join("")}
          </table>
        </div>
        <div class="invoice-totals">
          <table>
            <tr>
              <td>Subtotal: ${money(subtotal)}</td>
            </tr>
            <tr>
              <td>Shipping: ${money(shipping)}</td>
            </tr>
            ${
              discount > 0
                ? `
            <tr>
              <td class="discount-border">Discount:(-) ${money(discount)}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td class="total">Total: ${money(total)}</td>
            </tr>
            ${
              paid > 0
                ? `
            <tr>
              <td>Paid:(-) ${money(paid)}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td class="total">Due: ${money(due)}</td>
            </tr>
          </table>
        </div>
        
        <div class="page-break"></div>
      </div>
    `;
  });

  printContent += `
    </body>
  </html>
  `;

  return printContent;
};

export default OrderInvoice;
