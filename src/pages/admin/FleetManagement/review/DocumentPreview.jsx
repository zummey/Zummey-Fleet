import React from "react";
import { FileText, ExternalLink } from "lucide-react";
import { formatDateTime, formatFileSize } from "../adminFleet.config";

/**
 * Shows the uploaded CAC certificate inline: PDFs in an iframe, images as <img>.
 * Falls back to a placeholder until the backend supplies a file URL.
 */
const DocumentPreview = ({ document: doc, title = "CAC Certificate" }) => {
  const isPdf = doc?.mimeType === "application/pdf";
  const meta = [isPdf ? "PDF" : doc?.mimeType?.split("/")[1]?.toUpperCase(), formatFileSize(doc?.sizeBytes), doc?.uploadedAt && `Uploaded ${formatDateTime(doc.uploadedAt)}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl bg-white">
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div>
          <h4 className="text-base font-semibold text-[#343C6A]">{title}</h4>
          {meta && <p className="text-xs text-gray-400">{meta}</p>}
        </div>
        {doc?.url && (
          <a
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm whitespace-nowrap text-blue-600 hover:underline"
          >
            Open <ExternalLink size={14} />
          </a>
        )}
      </div>

      <div className="flex min-h-[420px] flex-1 items-center justify-center bg-gray-100 p-4">
        {!doc ? (
          <Placeholder text="No certificate has been uploaded for this fleet." />
        ) : !doc.url ? (
          <Placeholder text="The document preview will appear here once the file is available." />
        ) : isPdf ? (
          <iframe src={doc.url} title={title} className="h-[520px] w-full rounded-lg bg-white" />
        ) : (
          <img src={doc.url} alt={title} className="max-h-[520px] w-full rounded-lg object-contain" />
        )}
      </div>
    </section>
  );
};

const Placeholder = ({ text }) => (
  <div className="flex max-w-xs flex-col items-center text-center">
    <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">
      <FileText size={26} />
    </span>
    <p className="text-sm text-gray-500">{text}</p>
  </div>
);

export default DocumentPreview;
