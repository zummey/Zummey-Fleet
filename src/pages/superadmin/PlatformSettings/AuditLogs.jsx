import { useState } from "react";
import { Card, Choice, Sections } from "./shared";

const names = ["Nosa Okoro", "Amara Eze", "Tolu Adeyemi", "Ibrahim Musa", "Chiamaka Obi", "Hadiza Bello", "Funmi Alabi", "Ngozi Chukwu"];
const actions = [
  ["Assigned order ZM-1042 to a rider", "Orders", "ZM-1042"],
  ["Approved payout PAY-1121", "Finance & Reports", "PAY-1121"],
  ["Resolved incident INC-1318", "Incidents", "INC-1318"],
  ["Approved a rider application", "Riders", "Rider application"],
  ["Paused coupon BLACKFRI", "Pricing", "BLACKFRI"],
  ["Updated a customer profile", "Customers", "Customer profile"],
  ["Approved refund RF-1310", "Finance & Reports", "RF-1310"],
  ["Reassigned order ZM-1207", "Dispatch", "ZM-1207"],
  ["Sent a broadcast to all riders", "Communication", "All riders"],
  ["Suspended an admin account", "Admin Management", "Admin account"],
];
const devices = ["Chrome on Windows", "Safari on iPhone", "Chrome on Android", "Edge on Windows"];
const changes = [
  ["Tolu Adeyemi", "Pricing", "Benin City base fee", "₦1,100 → ₦1,200"],
  ["Nosa Okoro", "Settings: Security", "Session timeout", "60 minutes → 30 minutes"],
  ["Amara Eze", "Settings: Integrations", "SMS provider", "Twilio → Termii"],
  ["System", "System", "Nightly backup", "Pending → Completed"],
];
const ranges = ["Today", "Last 7 days", "Last 30 days"];

const sections = [
  {
    id: "admin-actions", label: "Admin actions", columns: ["Time", "Admin", "Action", "Module", "Target"], range: ranges[1],
    rows: actions.map((action, index) => ({
      daysAgo: index < 4 ? 0 : 1,
      values: [index < 4 ? `Today, ${["09:12", "09:40", "10:12", "10:40"][index]}` : "Yesterday, 16:40", names[index % names.length], ...action],
    })),
  },
  {
    id: "login-history", label: "Login history", columns: ["Time", "Admin", "Device", "Place", "IP address", "Result"], range: ranges[2],
    rows: ["Segun Ajayi", ...names.slice(1), ...names.slice(0, 2)].map((name, index) => ({
      daysAgo: index < 5 ? 0 : 1,
      values: [index < 5 ? "Today, 09:12" : "Yesterday, 16:40", name, devices[index % devices.length], "Benin City", `102.89.${64 + index}.x`, "Signed in"],
    })),
  },
  {
    id: "system-changes", label: "System changes", columns: ["Time", "Changed by", "Area", "What changed", "From → to"], range: ranges[2],
    rows: Array.from({ length: 10 }, (_, index) => ({
      daysAgo: index < 3 ? 0 : 12,
      values: [index < 3 ? "Today, 08:02" : "Nov 12, 14:05", ...changes[index % changes.length]],
    })),
  },
];

export default function AuditLogs() {
  return <Sections label="Audit logs" sections={sections}>{(section) => <AuditTable section={section} />}</Sections>;
}

function AuditTable({ section }) {
  const [range, setRange] = useState(section.range);
  const days = [0, 6, 29][ranges.indexOf(range)];
  const rows = section.rows.filter(({ daysAgo }) => daysAgo <= days);

  function exportRows() {
    const csv = [section.columns, ...rows.map(({ values }) => values)].map((cells) =>
      cells.map((value) => '"' + value.replaceAll('"', '""') + '"').join(","),
    ).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${section.id}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <Card title={section.label} action={<button className="ps-button ps-primary ps-export" onClick={exportRows}>Export</button>}>
      <div className="ps-audit-filters"><Choice label="Date range" options={ranges} value={range} onChange={setRange} segmented /></div>
      <div className="ps-scroll">
        <table className="ps-table ps-audit-table">
          <thead><tr>{section.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
          <tbody>
            {rows.map(({ values }, index) => (
              <tr key={index}>{values.map((value, column) => column === 1
                ? <th key={column} scope="row">{value}</th>
                : <td key={column}>{value === "Signed in" ? <span className="ps-badge ps-good">{value}</span> : value}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
