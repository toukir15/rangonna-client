export function orderListPrit(selectedOrdersData: any[], formattedDate: any) {
  // Calculate totals
  let totalQuantity = 0;
  let totalPrice = 0;

  selectedOrdersData?.forEach((order) => {
    const productsData = order.line_items || [];
    productsData.forEach((product: { quantity: number; total: number }) => {
      totalQuantity += product.quantity;
      totalPrice += product.total;
    });
  });

  const formatDomainName = (domain?: string) => {
    if (!domain) return "-";

    const cleanDomain = domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "")
      .replace(".com.bd", "")
      .replace(".com", "")
      .replace(".bd", "");

    return cleanDomain.charAt(0).toUpperCase() + cleanDomain.slice(1);
  };

  let printContent = `
    <html>
      <head>
        <title>Courier Orders List</title>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black;
            padding: 2px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          h2 {
            text-align: center;
            margin-bottom: 0;
          }
          .date {
            text-align: center;
            margin-top: 5px;
            font-size: 12px;
          }
          .row-gray {
            background-color: #f2f2f2; /* Light gray */
          }
          .row-white {
            background-color: #ffffff; /* White */
          }
          .totals {
            text-align: right;
            margin-top: 20px;
            margin-right: 40px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <h2>Courier Orders List</h2>
        <div class='date'>${formattedDate}</div>
        <table>
          <thead>
            <tr>
              <th>SL</th>
              <th>Order Id</th>
              <th>Number</th>
              <th>Website</th>
              <th>Products Name</th>
            </tr>
          </thead>
          <tbody>
  `;

  selectedOrdersData?.forEach((order, index) => {
    const productsData = order.line_items || [];
    const productsCellContent = productsData
      .map((product: { title: any; quantity: number; total: number }) => {
        return `${product.title} (Qty: ${product.quantity}, Price: ৳ ${(
          product.total / product.quantity
        ).toFixed(2)})`;
      })
      .join("<br/>");

    const rowClass = index % 2 === 0 ? "row-white" : "row-gray";

    printContent += `
            <tr class="${rowClass}">
              <td>${index + 1}</td>
              <td>${order?.sysid}</td>
              <td>${order?.customer?.phone}</td>
           <td>${formatDomainName(order?.domain)}</td>
              <td>${productsCellContent}</td>
            </tr>
          `;
  });

  printContent += `
          </tbody>
        </table>
        <div class="totals">
          <p>Total Quantity: ${totalQuantity}</p>
          <p>Total Price: ৳ ${totalPrice.toFixed(2)}</p>
        </div>
      </body>
    </html>
  `;

  return printContent;
}
