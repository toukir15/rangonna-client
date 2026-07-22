const InvoiceLabelPrint = ({ selectedOrdersData }: any) => {
  let printContent = `
      <html>
        <head>
          <title>Print Selected Orders</title>
          <style>
            body {
              width: 288px;
              padding: 10px;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              font-family: Arial, sans-serif;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .text-right {
              text-align: right;
              font-size: 12px
            }
            .invoice-box {
              width: 288px;
              margin: auto;
            }
            .title img {
              width: 60px;
              height: auto;
            }
            @media print {
              body {
                width: 288px;
              }
            }
          .container {
            display: flex;
            justify-content: space-between;
            
            width: 100%;
            gap: 10px
          }
          .btmcontainer{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            width: 100%;
            gap: 10px
          }
          p{
            margin: 0px
          }
          .subcontainer {
            width: 200px;
            text-align: right;
          }
          .text-brand{
              text-align: right;
              font-size: 14px
            }
          .size10{
            font-size: 14px
            }
          .size8{
             font-size: 12px
            }
          .cod {
            text-align: center;
            margin: 0px;
               font-size: 20px;
            font-weight: bold;
          }
          .pdcontainer{
            width: 160px;
            padding-left: 20px;
          }
          .codno {
            text-align: center;
            border: 3px solid black; 
            padding: 4px; 
            margin: 0px;
            font-size: 20px;
            margin-top: 4px;
            font-weight: bold;
          }
          .page-break {
            page-break-after: always;
          }
          </style>
        </head>
        <body>
        <div class="invoice-box">
    `;

  selectedOrdersData?.forEach((order: any) => {
    const general = order.general;
    printContent += `
          <table>
            <tr>
              <td class="title">
                <img src="${general?.logo}" alt="logo" />
              </td>
              <td class="text-brand size10">
                <b>${general?.shop_name}</b><br/>
                
                ${general?.shop_address}<br/>
                 ${general?.phone}
              </td>
            </tr>
          </table>
          <hr/>
          <div class="container">
          <div>
              <p class="size10">${order.customer?.first_name} ${
      order.customer?.last_name
    }</p>
              <p class="size10">${
                order.customer?.address || "Not specified"
              }</p>
              
          </div>
          <div class="subcontainer size8">
              <p class="size8">Order No: ${order.order_src}</p>
             <p class="size8">Phone:  ${
               order.customer?.phone
                 ? "******" + order.customer.phone.slice(-4)
                 : "Not provided"
             }</p>
              <p class="size8">${order.payment?.title}</p>
          </div>
        </div>
          <hr/>
          <table>
            <tr><th class="size8">Product</th><th class="size8">Qty</th><th class="text-right size8">Price</th></tr>
            ${order.line_items
              ?.map(
                (product: any) => `
                <tr>
                  <td class="size8">${product.title}</td>
                  <td class="size8">${product.quantity}</td>
                  <td class="text-right">৳${(
                    product.total / product.quantity
                  ).toFixed(2)}</td>
                </tr>`
              )
              .join("")}
          </table>
          <hr/>
          <table>
          </table>
           <div class="btmcontainer">
            <div class="pdcontainer">
            <p class="cod">COD<p>
            <p class="codno">${order?.due}<p>

            </div>
            <div class="subcontainer size8">
            <p class="size8">Subtotal: ৳${order?.total}</p>
            <p class="size8">Shipping: ৳${order?.fee || 0}</p>
            <p class="size8">Total: ৳${order?.total}</p>
              ${
                order.advance > 0
                  ? `<p class="text-right">Advance: ৳${order?.advance}</p>`
                  : ""
              }
            ${
              order.discount > 0
                ? `<p class="text-right">Discount: ৳${order?.discount}</p>`
                : ""
            }
                <p class="size8">Due: ৳${order?.due}</p>
          </div>
        </div>
        <div class="page-break"></div>
                  
              `;
  });

  printContent += `
        </div>
         
      </body>
    </html>
    `;

  return printContent;
};

export default InvoiceLabelPrint;
