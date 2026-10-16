import React, { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { EXPORT_FORMATS } from "./exporters";

/**
 * "Export" button with a panel to choose what to export and in which format.
 *
 * - title: panel heading, e.g. "Export Customers"
 * - noun: { one: "Customer", other: "Customers" } for button/description text
 * - scopes: [{ id, label, count, description }] — count may be undefined while loading
 * - onExport({ scope, format }): returns a promise; the panel closes when it resolves
 * - onOpenChange(open): lets the parent fetch counts only while the panel is open
 */
const ExportPanel = ({ title, noun, scopes, onExport, onOpenChange }) => {
  const [open, setOpen] = useState(false);
  const [scopeId, setScopeId] = useState(scopes[0].id);
  const [format, setFormat] = useState(EXPORT_FORMATS[0].id);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const wrapperRef = useRef(null);

  const scope = scopes.find((s) => s.id === scopeId) ?? scopes[0];
  const count = scope.count;
  const pluralize = (n) => (n === 1 ? noun.one : noun.other);

  const setPanelOpen = (next) => {
    if (isExporting) return; // don't lose an export in progress
    setOpen(next);
    setError(null);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setPanelOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-bind only when open/exporting changes
  }, [open, isExporting]);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      await onExport({ scope: scope.id, format });
      setIsExporting(false);
      setOpen(false);
      onOpenChange?.(false);
    } catch (err) {
      setIsExporting(false);
      setError(err);
    }
  };

  const confirmLabel = isExporting
    ? "Exporting..."
    : count == null
      ? "Export"
      : `Export ${count.toLocaleString()} ${pluralize(count)}`;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setPanelOpen(!open)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <Download size={15} />
        Export
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={title}
          className="absolute right-0 z-30 mt-2 w-[min(19rem,calc(100vw-2rem))] rounded-xl border border-gray-200 bg-white p-4 shadow-lg motion-safe:animate-fade-in-up"
        >
          <p className="border-b border-gray-100 pb-3 text-sm font-semibold text-[#343C6A]">{title}</p>

          {/* What to export */}
          <fieldset className="mt-4">
            <legend className="mb-2 text-xs text-gray-400">What to export</legend>
            <div className="space-y-2">
              {scopes.map((s) => {
                const selected = s.id === scope.id;
                return (
                  <label
                    key={s.id}
                    className={`relative flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                      selected ? "border-[#EB4827]/60 bg-[#FFF4E8]" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="export-scope"
                      value={s.id}
                      checked={selected}
                      onChange={() => setScopeId(s.id)}
                      disabled={isExporting}
                      className="peer sr-only"
                    />
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-300 ${
                        selected ? "border-[#EB4827]" : "border-gray-300"
                      }`}
                    >
                      {selected && <span className="h-2 w-2 rounded-full bg-[#EB4827]" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-[#343C6A]">{s.label}</span>
                      <span className="block text-[11px] text-gray-400">
                        {s.count == null ? "Counting..." : s.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Format */}
          <fieldset className="mt-4">
            <legend className="mb-2 text-xs text-gray-400">Format</legend>
            <div className="flex flex-wrap gap-2">
              {EXPORT_FORMATS.map((f) => {
                const selected = f.id === format;
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setFormat(f.id)}
                    disabled={isExporting}
                    className={`rounded-full border px-3.5 py-1 text-xs font-medium transition-colors ${
                      selected
                        ? "border-[#343C6A] bg-[#343C6A] text-white"
                        : "border-gray-200 text-[#343C6A] hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              Export failed: {error?.response?.data?.responseMessage || error?.message || "Something went wrong"}
            </p>
          )}

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              disabled={isExporting}
              className="rounded-lg border border-[#343C6A] px-4 py-2 text-sm font-medium text-[#343C6A] hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || !count}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium whitespace-nowrap text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPanel;
