"use client";

import React, { useEffect, useRef } from "react";

const DEFAULT_CSS = `
.editor-preview {
  font-family: ui-sans-serif, system-ui;
  line-height: 1.6;
  color: #0f172a;
}

.editor-preview .table-wrapper {
  width: 100%;
  overflow-x: auto;
  margin: 1rem 0;
  border: 1px solid #e2e8f0;
}

.editor-preview table {
  width: 100%;
  border-collapse: collapse;
}

.editor-preview th,
.editor-preview td {
  border: 1px solid #e2e8f0;
  padding: 10px;
}
`;

interface Props {
    htmlContent?: string;
}

/* =====================
   Bangla Digit Convert
===================== */
const bnDigitMap: Record<string, string> = {
    "০": "0",
    "১": "1",
    "২": "2",
    "৩": "3",
    "৪": "4",
    "৫": "5",
    "৬": "6",
    "৭": "7",
    "৮": "8",
    "৯": "9",
};

const convertBanglaDigits = (val: string) =>
    val.replace(/[০-৯]/g, (d) => bnDigitMap[d] || d);

/* =====================
   Month Map
===================== */
const bnMonthMap: Record<string, number> = {
    "জানুয়ারি": 0,
    "জানুয়ারি": 0,
    "ফেব্রুয়ারি": 1,
    "ফেব্রুয়ারি": 1,
    "মার্চ": 2,
    "এপ্রিল": 3,
    "মে": 4,
    "জুন": 5,
    "জুলাই": 6,
    "আগস্ট": 7,
    "সেপ্টেম্বর": 8,
    "অক্টোবর": 9,
    "নভেম্বর": 10,
    "ডিসেম্বর": 11,
};

/* =====================
   Date Parser (Strong)
===================== */
const parseBanglaDate = (value: string): Date | null => {
    if (!value) return null;

    const cleaned = convertBanglaDigits(value)
        .replace(/[,\u09E4\u0964،]/g, " ")
        .replace(/[-–—]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const parts = cleaned.split(" ").filter(Boolean);
    if (parts.length < 2) return null;

    const day = Number(parts[0]);
    const month = bnMonthMap[parts[1]];

    if (Number.isNaN(day) || month === undefined) return null;

    const now = new Date();
    const date = new Date(now.getFullYear(), month, day);

    date.setHours(0, 0, 0, 0);
    return date;
};

/* =====================
   Main Component
===================== */
const HolidayParser: React.FC<Props> = ({ htmlContent = "" }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = ref.current;
        if (!root) return;

        root.querySelectorAll("table").forEach((table) => {
            // wrapper add
            if (!table.parentElement?.classList.contains("table-wrapper")) {
                const wrap = document.createElement("div");
                wrap.className = "table-wrapper";
                table.parentNode?.insertBefore(wrap, table);
                wrap.appendChild(table);
            }

            const rows = Array.from(table.querySelectorAll("tr"));
            if (rows.length <= 1) return;

            const header = rows[0];
            const body = rows.slice(1);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const upcoming = body.filter((row) => {
                const tds = row.querySelectorAll("td");
                if (tds.length < 2) return false;

                const dateText = tds[1].textContent?.trim() || "";
                const parsed = parseBanglaDate(dateText);

                return parsed && parsed > today;
            });

            const next3 = upcoming.slice(0, 3);

            // clear table
            table.innerHTML = "";

            const tbody = document.createElement("tbody");

            // header
            tbody.appendChild(header.cloneNode(true));

            if (next3.length) {
                next3.forEach((r) => tbody.appendChild(r.cloneNode(true)));
            } else {
                const empty = document.createElement("tr");
                empty.innerHTML = `
          <td colspan="4" style="text-align:center;padding:12px;">
            No upcoming holidays
          </td>
        `;
                tbody.appendChild(empty);
            }

            table.appendChild(tbody);
        });
    }, [htmlContent]);

    return (
        <div className="editor-preview">
            <style jsx global>{DEFAULT_CSS}</style>

            <div
                ref={ref}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
        </div>
    );
};

export default HolidayParser;