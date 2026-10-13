import React from "react";
import { FileText } from "lucide-react";
import { formatDateTime, formatShortDate } from "../adminFleet.config";

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className="mt-1 text-sm text-[#343C6A]">{value ?? "—"}</p>
  </div>
);

const CacDetailsTab = ({ cac }) => {
  const doc = cac?.document;
  const hasFile = !!doc?.url;

  return (
    <div className="space-y-6">
      <h4 className="text-base font-semibold text-[#343C6A]">CAC Details</h4>

      <div className="flex flex-wrap gap-x-12 gap-y-4">
        <Field label="Registration Number" value={cac?.registrationNumber} />
        <Field label="Date Registered" value={formatShortDate(cac?.dateRegistered)} />
        <Field label="Registered Name" value={cac?.registeredName} />
      </div>

      {doc ? (
        <div className="max-w-sm rounded-2xl border border-gray-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                <FileText size={16} />
              </div>
              <p className="text-sm font-semibold text-[#343C6A]">{doc.name}</p>
              <p className="mt-1 text-xs text-gray-400">Uploaded {formatDateTime(doc.uploadedAt)}</p>
            </div>
            {hasFile ? (
              <a href={doc.url} target="_blank" rel="noreferrer" className="mt-9 text-sm whitespace-nowrap text-blue-600 hover:underline">
                View document
              </a>
            ) : (
              <span className="mt-9 text-sm whitespace-nowrap text-gray-300" title="File not available yet">
                View document
              </span>
            )}
          </div>

          {hasFile ? (
            <a href={doc.url} download className="mt-5 inline-block rounded-md border border-gray-300 px-3 py-1 text-xs text-[#343C6A] hover:bg-gray-50">
              Download
            </a>
          ) : (
            <button type="button" disabled title="File not available yet" className="mt-5 cursor-not-allowed rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-300">
              Download
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No CAC document uploaded.</p>
      )}
    </div>
  );
};

export default CacDetailsTab;
