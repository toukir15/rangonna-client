import { formatDateTime } from "@admin/utils/hook.utils";

const InvoiceTwo = ({ selectedOrdersData, baseAPI }: any) => {
  let printContent = `
    <html>
      <head>
        <title>Invoice - ${selectedOrdersData[0].name}</title>
        <style>
          body {
            font-family: 'Roboto', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f7fc;
          }
          .invoice-container {
            max-width: 900px;
            margin: 30px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #f2f2f2;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header .logo img {
            max-width: 120px;
          }
          .header .company-info {
            text-align: right;
            font-size: 0.9rem;
            color: #555;
          }
          .header .company-info p {
            margin: 0;
          }
          .invoice-details {
            margin-bottom: 20px;
          }
          .invoice-details table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .invoice-details th, .invoice-details td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .invoice-details th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          .invoice-totals {
            text-align: right;
            margin-top: 30px;
            border-top: 2px solid #f2f2f2;
            padding-top: 20px;
          }
          .invoice-totals table {
            width: 100%;
            border-collapse: collapse;
          }
          .invoice-totals td {
            padding: 12px;
            font-size: 1.1rem;
            color: #555;
          }
          .invoice-totals .total {
            font-weight: bold;
            font-size: 1.2rem;
            color: #333;
          }
          .page-break {
            page-break-after: always;
          }
          @media print {
            body {
              background-color: #fff;
            }
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
        <div class="invoice-container">
          <div class="header">
            <div class="logo">
              <img src="${baseAPI}/${order.invoice_logo}" alt="Logo" />
            </div>
            <div class="company-info">
              <p><b>Naviforce Bangladesh</b></p>
              <p>Room # 04 (6th Floor)</p>
              <p>14, Darussalam Arcade</p>
              <p>Purana Paltan, Dhaka</p>
              <p>Mobile: 01841800593</p>
            </div>
          </div>
          
          <div class="invoice-details">
            <table>
              <tr>
                <th>INVOICE DETAILS</th>
                <th></th>
                <th></th>
              </tr>
              <tr>
                <td>
                  <p><strong>Name:</strong> ${order.name}</p>
                  <p><strong>Location:</strong> ${order.address}</p>
                  <p><strong>Contact No:</strong> ${order.contactNumber}</p>
                </td>
                <td></td>
                <td>
                  <p><strong>Order Number:</strong> ${order.id}</p>
                  <p><strong>Order Date:</strong> ${formatDateTime(
                    order.timeRemaining
                  )}</p>
                  <p><strong>Payment Method:</strong> ${order.payment}</p>
                </td>
              </tr>
            </table>
          </div>
          
          <div class="invoice-details">
            <table>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price (৳)</th>
              </tr>
              ${order.productsData
                .map(
                  (product) => `
                    <tr>
                      <td>${product.name}</td>
                      <td>${product.quantity}</td>
                      <td>${(product.total / product.quantity).toFixed(2)}</td>
                    </tr>
                  `
                )
                .join("")}
            </table>
          </div>
          
          <div class="invoice-totals">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td>৳ ${totalProductPrice.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Shipping Fee:</td>
                <td>৳ ${order.fee || 0}</td>
              </tr>
              <tr>
                <td><strong>Total:</strong></td>
                <td class="total"><strong>৳ ${order.total}</strong></td>
              </tr>
              ${
                order.advance > 0
                  ? `<tr><td>Advance:</td><td>৳ ${order.advance}</td></tr>`
                  : ""
              }
              ${
                order.discount > 0
                  ? `<tr><td>Discount:</td><td>৳ ${order.discount}</td></tr>`
                  : ""
              }
              <tr>
                <td><strong>Due:</strong></td>
                <td class="total"><strong>৳ ${order.due}</strong></td>
              </tr>
            </table>
          </div>
          
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

export default InvoiceTwo;
