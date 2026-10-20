// src/pages/admin/UserManagement/Riders/details/DocumentViewerModal.jsx
//
// Lightbox shown when clicking "View" on a rider document row.
// Matches "screen 2 ride details.PNG":
//   title bar (Drivers License) + X button
//   image carousel with prev/next arrows
//   blurred backdrop

import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const DocumentViewerModal = ({ document: doc, allDocuments = [], onClose }) => {
  const initialIndex = allDocuments.findIndex((d) => d.id === doc?.id);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  if (!doc) return null;
  const current = allDocuments[currentIndex] ?? doc;

  const canPrev = currentIndex > 0;
  const canNext = currentIndex < allDocuments.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-viewer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 id="doc-viewer-title" className="text-base font-semibold text-[#343C6A]">
            {current.title}
          </h3>
          <button
            id="doc-viewer-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Close document viewer"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Image area with prev/next arrows */}
        <div className="relative flex items-center justify-center bg-gray-50 p-4">
          {/* Prev */}
          {allDocuments.length > 1 && (
            <button
              id="doc-viewer-prev-btn"
              type="button"
              disabled={!canPrev}
              onClick={() => setCurrentIndex((i) => i - 1)}
              aria-label="Previous document"
              className="absolute left-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow transition disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {current.mimeType?.startsWith("image") ? (
            <img
              src={current.url}
              alt={current.title}
              className="max-h-72 w-full rounded-lg object-contain"
            />
          ) : (
            <div className="flex h-48 w-full items-center justify-center rounded-lg border border-gray-200 bg-white">
              <p className="text-sm text-gray-400">Preview not available</p>
            </div>
          )}

          {/* Next */}
          {allDocuments.length > 1 && (
            <button
              id="doc-viewer-next-btn"
              type="button"
              disabled={!canNext}
              onClick={() => setCurrentIndex((i) => i + 1)}
              aria-label="Next document"
              className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow transition disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        {/* Dot indicators */}
        {allDocuments.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pb-4 pt-1">
            {allDocuments.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Document ${idx + 1}`}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  idx === currentIndex ? "w-4 bg-[#EB4827]" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewerModal;
