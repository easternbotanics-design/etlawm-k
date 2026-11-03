import React, { useState, useMemo } from "react";
import { ChevronDown, Pencil, Trash2, Check } from "lucide-react";

/* ============================================================================
   DATATABLE — reusable table template
   ----------------------------------------------------------------------------
   Usage — just the table, no header/search/filter above it:

   <DataTable
     columns={[
       { key: "id", label: "ID", type: "id", sub: (row) => `₹${row.amount}` },
       { key: "date", label: "DATE", type: "text", sub: (row) => row.relativeDate, sortable: true },
       { key: "name", label: "PERSONAL DETAILS", type: "contact", sub: (row) => row.phone },
       { key: "address", label: "SHIPPING DETAILS", type: "address" },
     ]}
     data={rows}
   />

   Any search box, "All Time" filter, or page title lives in the parent
   page — this component is only the bordered table card.

   Column "type" options (this is the part you swap per page):
     "id"       -> bold/mono primary value + optional sub line   (sub)
     "text"     -> plain value + optional sub line                (sub)
     "contact"  -> name + phone/email shown as a link              (sub)
     "address"  -> two-line wrapping address block
     "badge"    -> colored read-only status pill                   (tone map)
     "toggle"   -> on/off switch                                   (onToggle)
     "dropdown" -> click-to-change status select                   (options, onChange)
     "actions"  -> row of icon buttons (edit / delete / custom)     (actions)
     "custom"   -> you supply render(row, column)

   Every column can also just pass `render: (row, column) => <>...</>` to
   fully override rendering regardless of type.
   ============================================================================ */

const TONES = {
  neutral: "bg-[#EFEAE2] text-[#6B655A]",
  good: "bg-[#E7EFE4] text-[#4C7A3E]",
  warn: "bg-[#F6EBD9] text-[#A97A2E]",
  bad: "bg-[#F4E4E1] text-[#B4553F]",
  accent: "bg-[#F1E6E1] text-[#A9695C]",
};

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange && onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-40
        ${checked ? "bg-[#A9695C]" : "bg-[#DCD5C8]"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200
          ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}`}
      />
    </button>
  );
}

function Dropdown({ value, options, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value) || {
    label: value,
    tone: "neutral",
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase
          ${TONES[current.tone] || TONES.neutral} disabled:opacity-40`}
      >
        {current.label}
        <ChevronDown size={12} strokeWidth={2.5} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-20 mt-1 w-40 overflow-hidden rounded-lg border border-[#E5E0D5] bg-white py-1 shadow-lg">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange && onChange(opt.value);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] text-[#3A362F] hover:bg-[#F7F5EF]"
              >
                {opt.label}
                {opt.value === value && <Check size={13} className="text-[#A9695C]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Cell({ row, column }) {
  if (column.render) return <>{column.render(row, column)}</>;

  const value = row[column.key];
  const subValue = typeof column.sub === "function" ? column.sub(row) : column.sub;

  switch (column.type) {
    case "id":
      return (
        <div>
          <div className="font-mono text-[13px] font-semibold text-[#2B2620]">
            {String(value).length > 12 ? `${String(value).slice(0, 8)}...` : value}
          </div>
          {subValue !== undefined && (
            <div className="mt-0.5 text-[13px] text-[#8A8477]">{subValue}</div>
          )}
        </div>
      );

    case "text":
      return (
        <div>
          <div className="text-[14px] text-[#3A362F]">{value}</div>
          {subValue !== undefined && (
            <div className="mt-0.5 text-[12.5px] text-[#A6A091]">{subValue}</div>
          )}
        </div>
      );

    case "contact":
      return (
        <div>
          <div className="text-[14px] font-medium text-[#2B2620]">{value}</div>
          {subValue !== undefined && (
            <a
              href={`tel:${subValue}`}
              className="mt-0.5 block text-[13px] text-[#8A8477] underline decoration-[#D8D2C4] underline-offset-2 hover:text-[#A9695C]"
              onClick={(e) => e.stopPropagation()}
            >
              {subValue}
            </a>
          )}
        </div>
      );

    case "address":
      return (
        <div className="max-w-[280px] text-[13.5px] leading-snug text-[#6B655A]">
          {value}
        </div>
      );

    case "badge": {
      const tone = column.tone ? column.tone(row) : "neutral";
      return (
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase ${TONES[tone]}`}
        >
          {value}
        </span>
      );
    }

    case "toggle":
      return (
        <Toggle
          checked={!!value}
          onChange={(next) => column.onToggle && column.onToggle(row, next)}
        />
      );

    case "dropdown":
      return (
        <Dropdown
          value={value}
          options={column.options || []}
          onChange={(next) => column.onChange && column.onChange(row, next)}
        />
      );

    case "actions":
      return (
        <div className="flex items-center gap-1.5">
          {(column.actions || []).map((action) => (
            <button
              key={action.key}
              type="button"
              title={action.label}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick && action.onClick(row);
              }}
              className={`flex h-7 w-7 items-center justify-center rounded-md text-[#8A8477] transition-colors hover:bg-[#F1ECE2]
                ${action.tone === "danger" ? "hover:text-[#B4553F]" : "hover:text-[#A9695C]"}`}
            >
              {action.icon || (action.key === "edit" ? <Pencil size={14} /> : action.key === "delete" ? <Trash2 size={14} /> : null)}
            </button>
          ))}
        </div>
      );

    default:
      return <span className="text-[14px] text-[#3A362F]">{value}</span>;
  }
}

export function DataTable({
  columns = [],
  data = [],
  rowKey = "id",
  sortKey: sortKeyProp,
  sortDir: sortDirProp,
  onSortChange,
  onRowClick,
  emptyLabel = "Nothing to show yet",
}) {
  // Sorting can be controlled (pass sortKey/sortDir/onSortChange) or left
  // uncontrolled (component manages its own state) — same table either way.
  const [internalSortKey, setInternalSortKey] = useState(null);
  const [internalSortDir, setInternalSortDir] = useState("desc");
  const sortKey = sortKeyProp !== undefined ? sortKeyProp : internalSortKey;
  const sortDir = sortDirProp !== undefined ? sortDirProp : internalSortDir;

  const rows = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      const dir = sortDir === "asc" ? 1 : -1;
      return av > bv ? dir : -dir;
    });
  }, [data, sortKey, sortDir]);

  const toggleSort = (col) => {
    if (!col.sortable) return;
    const nextDir = sortKey === col.key && sortDir === "desc" ? "asc" : "desc";
    if (onSortChange) {
      onSortChange(col.key, nextDir);
    } else {
      setInternalSortKey(col.key);
      setInternalSortDir(nextDir);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#E5E0D5] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#E5E0D5] bg-[#F1ECE2]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col)}
                  className={`whitespace-nowrap px-6 py-3.5 text-left text-[11.5px] font-semibold tracking-[0.06em] text-[#8A8477] ${
                    col.sortable ? "cursor-pointer select-none" : ""
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <ChevronDown
                        size={12}
                        className={`transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`}
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-[13.5px] text-[#A6A091]">
                  {emptyLabel}
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={row[rowKey]}
                onClick={() => onRowClick && onRowClick(row)}
                className={`border-b border-[#EFEBE1] last:border-b-0 ${
                  onRowClick ? "cursor-pointer hover:bg-[#FAF8F3]" : "hover:bg-[#FAF8F3]"
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 align-top">
                    <Cell row={row} column={col} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================================
   Default export is the table itself — no page background, no title, no
   tabs, no breadcrumbs. Pre-filled with sample data below just so it's
   visible standalone; pass your own columns/data when you import it.
   ============================================================================ */

const sampleColumns = [
  { key: "id", label: "ID", type: "id", sub: (row) => `₹${row.amount}` },
  { key: "date", label: "DATE", type: "text", sub: (row) => row.relativeDate, sortable: true },
  { key: "name", label: "PERSONAL DETAILS", type: "contact", sub: (row) => row.phone },
  { key: "address", label: "SHIPPING DETAILS", type: "address" },
];

const sampleData = [
  { id: "318FC6E1...", amount: "6,233.00", date: "12.08.2026 16:59", relativeDate: "22:08h ago", name: "Vishnu Agarwal", phone: "919235682651", address: "22, M L N Engg.Coll. Allahabad, Uttar Pradesh 211004" },
  { id: "060FB486...", amount: "1,886.00", date: "10.08.2026 18:35", relativeDate: "2d 20:32h ago", name: "Vishnu Agarwal", phone: "919235682651", address: "1, Ahmadganj Allahabad, Uttar Pradesh 211003" },
  { id: "D73E410B...", amount: "539.00", date: "09.08.2026 21:22", relativeDate: "3d 17:45h ago", name: "Test Test", phone: "919876543219", address: "kjh, Adgaon, Cavellary Lines Allahabad, Uttar Pradesh 211004" },
  { id: "EB9C861B...", amount: "539.00", date: "09.08.2026 21:20", relativeDate: "3d 17:47h ago", name: "Test Test", phone: "919876543219", address: "kjh, Adgaon Nashik, Maharashtra 422003" },
];

export default function DataTableStandalone(props) {
  return (
    <DataTable
      columns={props.columns || sampleColumns}
      data={props.data || sampleData}
      {...props}
    />
  );
}