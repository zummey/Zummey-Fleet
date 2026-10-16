import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, totalPages, onChange, disabled = false }) => {
  const canPrev = page > 1 && !disabled;
  const canNext = page < totalPages && !disabled;

  const navBtn =
    "flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#343C6A] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-end gap-2 text-sm text-gray-500">
      <button type="button" aria-label="Previous page" disabled={!canPrev} onClick={() => onChange(page - 1)} className={navBtn}>
        <ChevronLeft size={18} />
      </button>
      <span className="rounded-md border border-gray-200 px-2.5 py-1 text-[#343C6A] tabular-nums">{page}</span>
      <span>of</span>
      <span className="rounded-md border border-gray-200 px-2.5 py-1 tabular-nums">{totalPages}</span>
      <button type="button" aria-label="Next page" disabled={!canNext} onClick={() => onChange(page + 1)} className={navBtn}>
        <ChevronRight size={18} />
      </button>
    </nav>
  );
};

export default Pagination;
