// CustomerReceipt.tsx
import { formatDate } from "@admin/utils/hook.utils";

type ReportIssueLineItem = { title?: string; image?: string };
type MaybeOrder = {
  _id?: string;
  order_sysid?: string;
  order_src?: string;
  createdAt?: string;
  updatedAt?: string;
  order_created?: string;
  description?: string;
  note?: string;
  customer?: {
    phone?: string;
    first_name?: string;
    last_name?: string;
    address?: string;
  };
  customer_phone?: string;
  order_phone?: string;
  report_issue_line_items?: ReportIssueLineItem[];
  line_items?: { title?: string }[];
};

const escapeHtml = (s?: string) =>
  s ? s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";

const getDate = (entry: MaybeOrder) =>
  entry?.createdAt || entry?.order_created || entry?.updatedAt || "";

const getId = (entry: MaybeOrder) =>
  entry?.order_sysid || entry?.order_src || entry?._id || "";

const getLineTitles = (entry: MaybeOrder) => {
  const issueItems = Array.isArray(entry?.report_issue_line_items)
    ? entry!.report_issue_line_items!
    : [];
  const orderItems = Array.isArray(entry?.line_items) ? entry!.line_items! : [];

  const titlesFromIssue = issueItems
    .map((i) => i?.title)
    .filter(Boolean) as string[];
  const titlesFromOrder = orderItems
    .map((i) => i?.title)
    .filter(Boolean) as string[];

  return titlesFromIssue.length ? titlesFromIssue : titlesFromOrder;
};

const SupplierReceipt = ({
  selectedOrdersData,
  paperWidth = "58",
  headerTitle = "Supplier Receipt",
  footerNote = "Thank you!",
}: {
  selectedOrdersData: MaybeOrder | MaybeOrder[];
  paperWidth?: "58" | "80";
  headerTitle?: string;
  footerNote?: string;
}) => {
  const entries: MaybeOrder[] = Array.isArray(selectedOrdersData)
    ? selectedOrdersData
    : selectedOrdersData
    ? [selectedOrdersData]
    : [];

  const contentWidth = paperWidth === "80" ? "72mm" : "48mm";
  const pageWidth = paperWidth === "80" ? "80mm" : "58mm";

  let printContent = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Print Selected Orders</title>
  <style>
    :root{
      --page-width: ${pageWidth};
      --content-width: ${contentWidth};
      --fs-xs: 9px;
      --fs-sm: 10px;
      --fs-md: 12px;
      --fs-lg: 14px;
      --line: 1.25;
    }
    @page {
      size: var(--page-width) auto;
      margin: 0;
    }
    * { box-sizing: border-box; }
    html, body {
      padding: 0; margin: 0;
      width: var(--page-width);
      background: #fff;
    }
    body {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: var(--fs-sm);
      line-height: var(--line);
      color: #000;
    }
    .ticket {
      width: var(--content-width);
      margin: 0 auto;
      padding: 6px 4px 10px 4px;
    }
    .header {
      text-align: center;
      margin-bottom: 4px;
    }
    .header .title {
      font-size: var(--fs-lg);
      font-weight: 700;
      letter-spacing: .5px;
    }
    .header .code {
      font-size: var(--fs-sm);
      opacity: .9;
    }
    .meta {
      margin-top: 4px;
      margin-bottom: 6px;
      font-size: var(--fs-md);
    }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 6px;
      white-space: nowrap;
    }
    .label { width: 28mm; }
    .value { flex: 1; text-align: right; max-width: calc(var(--content-width) - 28mm); overflow: hidden; text-overflow: ellipsis; }
    .sep {
      border-top: 1px dashed #000;
      margin: 6px 0;
      height: 0;
    }
    .items .items-title {
      font-weight: 700;
      margin-bottom: 2px;
    }
    .item {
      display: block;
      font-size: var(--fs-md);
      padding: 1px 0;
      word-break: break-word;
    }
    .dot {
      display: inline-block;
      width: 6px;
    }
    .desc {
      font-size: var(--fs-md);
      margin-top: 2px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .footer {
      text-align: center;
      margin-top: 8px;
      font-size: var(--fs-sm);
      opacity: .95;
    }
    .page-break { page-break-after: always; }
    @media screen {
      body { background: #f6f6f6; }
      .preview {
        margin: 8px auto;
        background: #fff;
        width: var(--page-width);
        box-shadow: 0 0 0 1px #e5e7eb, 0 6px 20px rgba(0,0,0,.08);
      }
    }
    @media print {
      .preview { box-shadow: none; }
    }
  </style>
</head>
<body>
`;

  entries.forEach((entry, idx) => {
    const created = getDate(entry);
    const dateStr = created ? formatDate(created) : "";
    const description = entry?.description ?? entry?.note ?? "";
    const titles = getLineTitles(entry);
    const orderId = getId(entry);

    printContent += `
<div class="preview">
  <div class="ticket">
    <div class="header">
      <div class="title">${escapeHtml(headerTitle)}</div>
      <div class="code">Order: ${escapeHtml(orderId || "N/A")}</div>
    </div>

    <div class="sep"></div>

    <div class="meta">
      <div class="row"><span class="label">Date</span><span class="value">${escapeHtml(
        dateStr || "—"
      )}</span></div>

    </div>

    ${
      description
        ? `<div class="sep"></div>
           <div class="desc"><strong>Note:</strong> ${escapeHtml(
             String(description)
           )}</div>`
        : ""
    }

    ${
      titles.length
        ? `<div class="sep"></div>
           <div class="items">
             <div class="items-title">Items</div>
             ${titles
               .map(
                 (t) =>
                   `<span class="item"><span class="dot">•</span> ${escapeHtml(
                     t
                   )}</span>`
               )
               .join("")}
           </div>`
        : ""
    }

    <div class="sep"></div>
    <div class="footer">${escapeHtml(footerNote)}</div>
  </div>
</div>
${idx < entries.length - 1 ? '<div class="page-break"></div>' : ""}
`;
  });

  printContent += `
</body>
</html>
`;

  return printContent;
};

export default SupplierReceipt;
