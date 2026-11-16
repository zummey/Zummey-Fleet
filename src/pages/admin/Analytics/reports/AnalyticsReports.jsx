import React, { useId, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { exportRows } from "../../components/exporters";
import { DATE_PRESETS, REPORT_FORMATS, REPORT_TYPES, getReportType } from "../analytics.config";
import { checkCustomRange, formatShort, maskDate, presetRange, toIso } from "./reportDates";
import { generateReport } from "../../../../api/analytics.service";

const Step = ({ number, title, children }) => {
  const id = useId();
  return (
    <section aria-labelledby={id} className="rounded-2xl bg-white p-5 sm:p-6">
      <h2 id={id} className="mb-4 text-sm font-semibold text-[#343C6A]">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
};

const RadioDot = ({ checked }) => (
  <span
    aria-hidden="true"
    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
      checked ? "border-[#EB4827]" : "border-gray-300"
    }`}
  >
    {checked && <span className="h-2 w-2 rounded-full bg-[#EB4827]" />}
  </span>
);

const optionCard = (checked) =>
  `flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-orange-300 ${
    checked ? "border-[#EB4827]/60 bg-[#FFF4E8]" : "border-gray-200 hover:bg-gray-50"
  }`;

const DateField = ({ label, value, onChange, error, hintId }) => {
  const id = useId();
  const errorId = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs text-gray-500">
        {label}
      </label>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        placeholder="DD/MM/YYYY"
        value={value}
        onChange={(e) => onChange(maskDate(e.target.value))}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : hintId}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-[#343C6A] placeholder-gray-400 focus:ring-2 focus:outline-none ${
          error ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-[#EB4827]/60 focus:ring-[#FFF4E8]"
        }`}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

const SummaryRow = ({ label, value, detail }) => (
  <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-3 last:border-b-0">
    <dt className="text-xs text-gray-500">{label}</dt>
    <dd className="text-right text-xs font-medium text-[#343C6A]">
      {value ?? <span className="text-gray-500">Not chosen</span>}
      {detail && <span className="block font-normal text-gray-400">{detail}</span>}
    </dd>
  </div>
);

/** Report builder: pick a report, a date range and a file format, then download it. */
const AnalyticsReports = () => {
  const [reportId, setReportId] = useState(null);
  const [presetId, setPresetId] = useState(null);
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const [formatId, setFormatId] = useState(null);
  const reportGroup = useId();
  const formatGroup = useId();
  const presetGroup = useId();
  const dateHintId = useId();

  const report = getReportType(reportId);
  const format = REPORT_FORMATS.find((f) => f.id === formatId);
  const preset = DATE_PRESETS.find((p) => p.id === presetId);

  const custom = presetId === "custom" ? checkCustomRange(fromText, toText) : null;
  const range = preset ? (preset.days ? presetRange(preset.days) : custom.range) : null;
  const datesLabel = preset && range ? (preset.days ? preset.label : "Custom range") : null;

  const creator = useMutation({
    mutationKey: ["admin", "analytics", "report"],
    mutationFn: async () => {
      const { rows } = await generateReport({ report: report.id, from: toIso(range.from), to: toIso(range.to) });
      await exportRows({
        format: format.id,
        rows,
        columns: report.columns,
        title: `${report.label} · ${formatShort(range.from)} – ${formatShort(range.to)}`,
        filename: `${report.id.replace(/_/g, "-")}-${toIso(range.from)}-to-${toIso(range.to)}`,
      });
    },
  });

  // Any change to the choices hides the last "downloaded" / error message
  const change = (setter) => (value) => {
    creator.reset();
    setter(value);
  };

  const missing = [
    !report && "choose a report",
    !range && (presetId === "custom" ? "enter valid dates" : "choose the dates"),
    !format && "choose a format",
  ].filter(Boolean);
  const canCreate = missing.length === 0 && !creator.isPending;

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-5">
        <Step number={1} title="Which report?">
          <fieldset>
            <legend className="sr-only">Report</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {REPORT_TYPES.map((type) => {
                const checked = type.id === reportId;
                return (
                  <label key={type.id} className={optionCard(checked)}>
                    <input
                      type="radio"
                      name={reportGroup}
                      value={type.id}
                      checked={checked}
                      onChange={() => change(setReportId)(type.id)}
                      className="sr-only"
                    />
                    <span className="mt-0.5">
                      <RadioDot checked={checked} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-[#343C6A]">{type.label}</span>
                      <span className="block text-xs text-gray-400">{type.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </Step>

        <Step number={2} title="Which dates?">
          <fieldset>
            <legend className="sr-only">Dates</legend>
            <div className="flex flex-wrap gap-2">
              {DATE_PRESETS.map((p) => {
                const checked = p.id === presetId;
                return (
                  <label
                    key={p.id}
                    className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-orange-300 ${
                      checked ? "border-[#0B1437] bg-[#0B1437] text-white" : "border-gray-300 text-[#343C6A] hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={presetGroup}
                      value={p.id}
                      checked={checked}
                      onChange={() => change(setPresetId)(p.id)}
                      className="sr-only"
                    />
                    {p.label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {presetId === "custom" && (
            <div className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <DateField
                  label="From"
                  value={fromText}
                  onChange={change(setFromText)}
                  error={custom.errors?.from}
                  hintId={dateHintId}
                />
                <DateField
                  label="To"
                  value={toText}
                  onChange={change(setToText)}
                  error={custom.errors?.to}
                  hintId={dateHintId}
                />
              </div>
              <p id={dateHintId} className="mt-2 text-[11px] text-gray-400">
                Use the format DD/MM/YYYY
              </p>
            </div>
          )}
        </Step>

        <Step number={3} title="Which format?">
          <fieldset>
            <legend className="sr-only">Format</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {REPORT_FORMATS.map((f) => {
                const checked = f.id === formatId;
                const Icon = f.icon;
                return (
                  <label key={f.id} className={`${optionCard(checked)} items-center`}>
                    <input
                      type="radio"
                      name={formatGroup}
                      value={f.id}
                      checked={checked}
                      onChange={() => change(setFormatId)(f.id)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`flex h-11 w-10 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg ${f.tile}`}
                    >
                      <Icon size={16} />
                      <span className="text-[8px] font-semibold">{f.badge}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-[#343C6A]">{f.label}</span>
                      <span className="block text-[11px] text-gray-400">{f.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </Step>
      </div>

      <aside aria-labelledby="your-report-title" className="rounded-2xl bg-white p-5 lg:sticky lg:top-4">
        <h2 id="your-report-title" className="text-sm font-semibold text-[#343C6A]">
          Your report
        </h2>
        <dl className="mt-3">
          <SummaryRow label="Report" value={report?.label} />
          <SummaryRow
            label="Dates"
            value={datesLabel}
            detail={range ? `${formatShort(range.from)} – ${formatShort(range.to)}` : null}
          />
          <SummaryRow label="Format" value={format?.label} />
        </dl>

        <div aria-live="polite">
          {missing.length > 0 ? (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              To create it, {missing.join(", ")}.
            </p>
          ) : creator.isSuccess ? (
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              Your report was downloaded. Check your downloads folder.
            </p>
          ) : creator.isError ? (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {creator.error?.response?.data?.responseMessage || creator.error?.message || "Couldn’t create the report"}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => creator.mutate()}
          disabled={!canCreate}
          className="mt-5 w-full rounded-lg bg-[#0B1437] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1c2657] focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {creator.isPending ? "Creating report..." : "Create report"}
        </button>
      </aside>
    </div>
  );
};

export default AnalyticsReports;
