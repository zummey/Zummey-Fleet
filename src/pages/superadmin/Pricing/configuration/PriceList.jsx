import React, { useMemo, useState } from "react";
import { MapPin, Plus } from "lucide-react";
import DataTable from "../../../admin/components/DataTable";
import EmptyState from "../../../admin/components/EmptyState";
import ErrorBox from "../../../admin/components/ErrorBox";
import RowActionsMenu from "../../../admin/components/RowActionsMenu";
import ConfirmDialog from "../../../admin/components/ConfirmDialog";
import PriceFormModal from "./PriceFormModal";
import { CELL_FORMATS, ROW_ACTIONS, priceDialogs, rowName } from "./configuration.config";
import { usePriceList } from "../../../../api/pricing.queries";
import { useCreatePrice, useDeletePrice, useUpdatePrice } from "../../../../api/pricing.mutations";

/**
 * One configurable price list (e.g. State pricing): table + create / edit / delete.
 * dialog: { type: "create" } | { type: "edit", row } | { type: "delete", row }
 */
const PriceList = ({ section }) => {
  const list = usePriceList(section.id);
  const createPrice = useCreatePrice();
  const updatePrice = useUpdatePrice();
  const deletePrice = useDeletePrice();
  const [dialog, setDialog] = useState(null);
  const copy = priceDialogs(section);

  // Text sorts A–Z, numbers smallest first (e.g. vehicles by maximum weight)
  const rows = useMemo(() => {
    const key = section.sortBy ?? "name";
    return [...(list.data ?? [])].sort((a, b) =>
      typeof a[key] === "number" ? a[key] - b[key] : String(a[key]).localeCompare(String(b[key]))
    );
  }, [list.data, section.sortBy]);
  const takenNames = useMemo(() => new Set(rows.map((r) => rowName(section, r).toLowerCase())), [rows, section]);

  const open = (next, mutation) => {
    mutation.reset();
    setDialog(next);
  };
  const close = () => setDialog(null);

  const columns = [
    ...section.columns.map((col) => ({
      key: col.key,
      label: col.label,
      render: (row) => {
        const raw = col.value ? col.value(row) : row[col.key];
        const text = col.format ? CELL_FORMATS[col.format](raw) : raw;
        return col.strong ? <span className="font-semibold">{text}</span> : text;
      },
    })),
    {
      key: "actions",
      label: "Actions",
      srOnlyLabel: true,
      render: (row) => (
        <div className="flex justify-end">
          <RowActionsMenu
            label={`Actions for ${rowName(section, row)}`}
            actions={ROW_ACTIONS}
            onSelect={(action) =>
              action === "edit" ? open({ type: "edit", row }, updatePrice) : open({ type: "delete", row }, deletePrice)
            }
          />
        </div>
      ),
    },
  ];

  return (
    <section aria-labelledby={`price-list-${section.id}`} className="rounded-2xl bg-white p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 id={`price-list-${section.id}`} className="text-base font-semibold text-[#343C6A]">
          {section.title}
        </h3>
        <button
          type="button"
          onClick={() => open({ type: "create" }, createPrice)}
          className="flex items-center gap-1.5 rounded-lg bg-[#343C6A] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#2a3058] focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none"
        >
          <Plus size={14} aria-hidden="true" />
          {section.createButton}
        </button>
      </div>

      {list.isError ? (
        <ErrorBox title={`Couldn’t load ${section.title.toLowerCase()}`} error={list.error} onRetry={list.refetch} isRetrying={list.isFetching} />
      ) : (
        <div className="min-h-[200px] rounded-xl border border-gray-100 px-4 pb-2">
          {!list.isLoading && rows.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title={section.empty.title}
              description={section.empty.description}
              action={{ label: section.createButton, onClick: () => open({ type: "create" }, createPrice) }}
            />
          ) : (
            <DataTable columns={columns} rows={rows} isLoading={list.isLoading} skeletonRows={3} cellClassName="py-3.5 text-xs" />
          )}
        </div>
      )}

      {(dialog?.type === "create" || dialog?.type === "edit") && (
        <PriceFormModal
          section={section}
          row={dialog.row}
          takenNames={takenNames}
          rows={rows}
          isPending={dialog.row ? updatePrice.isPending : createPrice.isPending}
          error={dialog.row ? updatePrice.error : createPrice.error}
          onConfirm={(values) =>
            dialog.row
              ? updatePrice.mutate({ section: section.id, id: dialog.row.id, values }, { onSuccess: close })
              : createPrice.mutate({ section: section.id, values }, { onSuccess: close })
          }
          onClose={close}
        />
      )}

      {dialog?.type === "delete" && (
        <ConfirmDialog
          title={copy.delete.title}
          description={copy.delete.description(dialog.row)}
          confirmLabel={copy.delete.confirmLabel}
          tone="danger"
          isPending={deletePrice.isPending}
          error={deletePrice.error}
          onConfirm={() => deletePrice.mutate({ section: section.id, id: dialog.row.id }, { onSuccess: close })}
          onClose={close}
        />
      )}
    </section>
  );
};

export default PriceList;
