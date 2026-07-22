export function ReportIssueListPrint(
  selectedOrdersData: any[],
  formattedDate: any
) {
  let printContent = `
        <html>
          <head>
            <title>Report Issues List</title>
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
                background-color: #f2f2f2;
              }
              .row-white {
                background-color: #ffffff;
              }
            </style>
          </head>
          <body>
            <h2>Report Issues List</h2>
            <div class='date'>${formattedDate}</div>
            <table>
              <thead>
                <tr>
                  <th>SL</th>
                  <th>Order Id</th>
                  <th>Customer Number</th>
                  <th>Products</th>
               
                </tr>
              </thead>
              <tbody>
      `;

  selectedOrdersData?.forEach((order, index) => {
    const productsData = order.report_issue_line_items || [];
    const productsCellContent = productsData
      .map(
        (product: { title: string; image: string }) => `${product.title}<br/>`
      )
      .join("<br/>");

    const rowClass = index % 2 === 0 ? "row-white" : "row-gray";

    printContent += `
                <tr class="${rowClass}">
                  <td>${index + 1}</td>
                  <td>${order?.order_sysid}</td>
                  <td>${order?.order?.customer?.phone || "--"}</td>
                  <td>${productsCellContent}</td>
             
                </tr>
              `;
  });

  printContent += `
              </tbody>
            </table>
          </body>
        </html>
      `;

  return printContent;
}
