// Export table rows as CSV, Excel (.xlsx) or PDF and trigger a download.
// columns: [{ label, value: (row) => any, width?: number (characters, Excel only) }]
//
// Excel and PDF libraries are imported on demand so they only load when used.

export const EXPORT_FORMATS = [
  { id: "csv", label: "CSV" },
  { id: "xlsx", label: "Excel" },
  { id: "pdf", label: "PDF" },
];

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const escapeCsvCell = (value) => {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const toCsv = ({ rows, columns, filename }) => {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(",");
  const body = rows.map((row) => columns.map((c) => escapeCsvCell(c.value(row))).join(","));
  // BOM so Excel opens UTF-8 (₦, accented names) correctly
  downloadBlob(new Blob(["﻿" + [header, ...body].join("\r\n")], { type: "text/csv;charset=utf-8" }), `${filename}.csv`);
};

const toXlsx = async ({ rows, columns, filename, title }) => {
  const { default: writeExcelFile } = await import("write-excel-file/universal");
  const sheetData = [
    columns.map((c) => ({ value: c.label, fontWeight: "bold" })),
    ...rows.map((row) =>
      columns.map((c) => {
        const value = c.value(row);
        return { value: value ?? "", type: typeof value === "number" ? Number : String };
      })
    ),
  ];
  const blob = await writeExcelFile(sheetData, {
    sheet: title.slice(0, 31), // Excel sheet names max 31 chars
    columns: columns.map((c) => ({ width: c.width ?? 18 })),
  }).toBlob();
  downloadBlob(blob, `${filename}.xlsx`);
};

const toPdf = async ({ rows, columns, filename, title }) => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF({ orientation: columns.length > 5 ? "landscape" : "portrait" });

  doc.setFontSize(14);
  doc.setTextColor("#343C6A");
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor("#718EBF");
  doc.text(`${rows.length.toLocaleString()} records · Exported ${new Date().toLocaleString()}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [columns.map((c) => c.label)],
    body: rows.map((row) => columns.map((c) => String(c.value(row) ?? ""))),
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [3, 2, 41] }, // --color-primary
    alternateRowStyles: { fillColor: [247, 247, 248] },
  });

  doc.save(`${filename}.pdf`);
};

const EXPORTERS = { csv: toCsv, xlsx: toXlsx, pdf: toPdf };

/** format: "csv" | "xlsx" | "pdf"; filename without extension */
export const exportRows = async ({ format, rows, columns, filename, title = "Export" }) => {
  const exporter = EXPORTERS[format];
  if (!exporter) throw new Error(`Unsupported export format "${format}"`);
  await exporter({ rows, columns, filename, title });
};
