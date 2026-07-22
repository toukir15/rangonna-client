import { formatDate } from "@admin/utils/hook.utils";

const CouponPrint = ({ selectedOrdersData }: any) => {
  let printContent = `
      <html>
        <head>
          <title>Print Selected Orders</title>
          <style>
            body {
              width: 100%;
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
              width: 370px;
              margin: auto;
            }
            .title img {
              width: 60px;
              height: auto;
            }
            @media print {
              body {
                width: 370px;
              }
            }
            .container {
              display: flex;
              justify-content: space-between;
              align-items: center;
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
              font-size: 22px
            }
            .size8{
              font-size: 18px
            }
            .len {
              display: inline-block; /* Ensure the span behaves like a block */
              width: 80px; /* Fixed width for the left side */
              text-align: left; /* Align text to the left */
            }
            .coupon{
              margin-top: 20px;
              margin-bottom: 20px;
            }
            .page-break {
              page-break-after: always;
            }
          </style>
        </head>
        <body>
        <div class="invoice-box">
    `;

  selectedOrdersData.forEach((order: any) => {
    printContent += `
          <div class="coupon">
            <p class="size10"><span class="len">ID</span> : #${
              order?.order_src
            }</p>
           <p class="size10"><span class="len">Date</span> : ${formatDate(
             order?.order_created
           )}</p>
            <p class="size10"><span class="len">Name</span> : ${
              order?.customer?.first_name
            } ${order?.customer?.last_name}</p>
            <p class="size10"><span class="len">Phone</span> : ${
              order.customer?.phone
                ? "******" + order.customer.phone.slice(-4)
                : "Not provided"
            }</p>
            <p class="size8"><span class="len">Address</span> : ${
              order?.customer?.address
            }</p>
            
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

export default CouponPrint;
