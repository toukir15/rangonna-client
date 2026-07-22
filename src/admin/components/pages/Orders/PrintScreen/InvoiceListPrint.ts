import { formatDateTime } from "@admin/utils/hook.utils";

const InvoicePrint = ({ selectedOrdersData, baseAPI }: any) => {
  let printContent = `
    <html>
      <head>
        <title>Print Selected Orders</title>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .text-right {
            text-align: right;
          }
          .page-break {
            page-break-after: always;
          }
          .title img {
            width: 120px;
            height: 80px;
          }
          .invoice-box {
            font-family: 'Arial', sans-serif;
            color: #555;
            margin-top: 20px;
          }
          .text-lg {
            font-size: 1.25rem;
            font-weight: bold;
          }
          .bg-black {
            background-color: black;
          }
          .text-white {
            color: white;
          }
          .font-bold {
            font-weight: bold;
          }
          @media print {
            .page-break {
              display: block;
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
  `;

  selectedOrdersData.forEach(
    (order: {
      productsData: any[];
      name: any;
      address: any;
      timeRemaining: any;
      contactNumber: any;
      id: any;
      payment: any;
      fee: any;
      total: any;
      advance: number;
      discount: number;
      due: any;
      invoice_logo: any;
    }) => {
      const totalProductPrice = order.productsData.reduce(
        (acc, product) => acc + Number(product.total),
        0
      );

      printContent += `
      <div class="invoice-box">
        <table cellPadding="0" cellSpacing="0">
          <tbody>
            <tr class="top">
              <td colSpan="3">
                <table>
                  <tr>
                    <td class="title">

                       <img src="${baseAPI}/${
        order.invoice_logo
      }" alt="logo" style="width: 140px; height: 140px;" />

                    </td>
                    <td></td>
                    <td class="text-right">
                      <b>Naviforce Bangladesh</b>
                      <p class="text-gray-500">
                        Room # 04 (6th Floor)<br />
                        14, Darussalam Arcade<br />
                        Purana Paltan, Dhaka.<br />
                        Mobile: 01841800593
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr class="information">
              <td class="text-lg font-bold">INVOICE</td>
              <td></td>
              <td></td>
            </tr>

            <tr class="information">
              <td colSpan="3">
                <table>
                  <tr>
                    <td>
                      Name: ${order.name}<br />
                      Location: ${order.address}<br />
                      Contact No: ${order.contactNumber}
                    </td>
                    <td></td>
                    <td class="text-right">
                      Order Number: ${order.id}<br />
                      Order Date: ${formatDateTime(order.timeRemaining)}<br />
                      Payment Method: ${order.payment}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr class=" text-black font-bold">
              <td>Product</td>
              <td>Quantity</td>
              <td class="text-right">Price</td>
            </tr>

            ${order.productsData
              .map(
                (product) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td class="text-right">৳ ${(
                      product.total / product.quantity
                    ).toFixed(2)}</td>
                  </tr>
                `
              )
              .join("")}

            <tr class="total">
              <td></td>
              <td></td>
              <td class="text-right font-bold">Subtotal: ৳ ${totalProductPrice}</td>
            </tr>
            <tr class="total">
              <td></td>
              <td></td>
              <td class="text-right">Shipping: ৳ ${order.fee || 0}</td>
            </tr>
            <tr class="total">
              <td></td>
              <td></td>
              <td class="text-right font-bold">Total: ৳ ${order.total}</td>
            </tr>
            <tr class="advance">
              ${
                order.advance > 0
                  ? `<td></td><td></td><td class="text-right">Advance: ৳ ${order.advance}</td>`
                  : ""
              }
            </tr>
            <tr class="discount">
              ${
                order.discount > 0
                  ? `<td></td><td></td><td class="text-right">Discount: ৳ ${order.discount}</td>`
                  : ""
              }
            </tr>
            <tr class="total">
              <td></td>
              <td></td>
              <td class="text-right font-bold">Due: ৳ ${order.due}</td>
            </tr>
          </tbody>
        </table>
        <div class="page-break"></div>
      </div>
    `;
    }
  );

  printContent += `
    </body>
  </html>
  `;

  return printContent;
};

export default InvoicePrint;
