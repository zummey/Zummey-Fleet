import React, { useMemo, useState } from "react";
import { Plus, TicketPercent } from "lucide-react";
import DataTable from "../../../admin/components/DataTable";
import EmptyState from "../../../admin/components/EmptyState";
import ErrorBox from "../../../admin/components/ErrorBox";
import FilterPanel from "../../../admin/components/FilterPanel";
import RowActionsMenu from "../../../admin/components/RowActionsMenu";
import StatusBadge from "../../../admin/components/StatusBadge";
import ConfirmDialog from "../../../admin/components/ConfirmDialog";
import { defaultsFor } from "../../../admin/components/filters";
import CouponFormModal from "./CouponFormModal";
import {
  COUPON_BADGES,
  COUPON_FILTERS,
  DELETE_COUPON,
  couponActions,
  couponState,
  filterCoupons,
  formatDiscount,
  formatExpiry,
} from "./promotions.config";
import { useCoupons } from "../../../../api/pricing.queries";
import { useCreateCoupon, useDeleteCoupon, useUpdateCoupon } from "../../../../api/pricing.mutations";

/**
 * Coupons table with a status / type filter, pause / resume, and create / edit / delete dialogs.
 * dialog: { type: "create" } | { type: "edit", coupon } | { type: "delete", coupon }
 */
const Coupons = () => {
  const coupons = useCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const setStatus = useUpdateCoupon(); // separate so pause errors don't show in the edit dialog
  const [dialog, setDialog] = useState(null);
  const [filters, setFilters] = useState(() => defaultsFor(COUPON_FILTERS));
  const [draftFilters, setDraftFilters] = useState(null);

  const all = useMemo(() => coupons.data ?? [], [coupons.data]);
  const rows = useMemo(() => filterCoupons(all, filters), [all, filters]);
  const isFiltered = Object.values(filters).some((v) => v !== "all");

  const open = (next, mutation) => {
    mutation.reset();
    setStatus.reset();
    setDialog(next);
  };
  const close = () => setDialog(null);

  const handleAction = (action, coupon) => {
    if (action === "pause" || action === "resume") {
      setStatus.mutate({ id: coupon.id, status: action === "pause" ? "paused" : "active" });
    } else if (action === "edit") open({ type: "edit", coupon }, updateCoupon);
    else open({ type: "delete", coupon }, deleteCoupon);
  };

  const pendingId = setStatus.isPending ? setStatus.variables?.id : null;

  const columns = [
    { key: "code", label: "Code", render: (c) => <span className="font-semibold tracking-wide">{c.code}</span> },
    { key: "discount", label: "Discount", render: formatDiscount },
    {
      key: "used",
      label: "Used",
      render: (c) => `${c.used.toLocaleString()} of ${c.usageLimit.toLocaleString()}`,
    },
    { key: "expiresOn", label: "Expires", render: (c) => formatExpiry(c.expiresOn) },
    {
      key: "status",
      label: "Status",
      render: (c) =>
        c.id === pendingId ? (
          <span className="text-xs text-gray-400">Saving...</span>
        ) : (
          <StatusBadge status={couponState(c)} badges={COUPON_BADGES} />
        ),
    },
    {
      key: "actions",
      label: "Actions",
      srOnlyLabel: true,
      render: (c) => (
        <div className="flex justify-end">
          <RowActionsMenu label={`Actions for ${c.code}`} actions={couponActions(c)} onSelect={(a) => handleAction(a, c)} />
        </div>
      ),
    },
  ];

  return (
    <section aria-labelledby="coupons-title" className="rounded-2xl bg-white p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 id="coupons-title" className="text-base font-semibold text-[#343C6A]">
          Coupons
        </h3>
        <div className="flex items-center gap-3">
          <FilterPanel
            groups={COUPON_FILTERS}
            value={filters}
            onApply={setFilters}
            onDraftChange={setDraftFilters}
            resultCount={draftFilters ? filterCoupons(all, draftFilters).length : null}
          />
          <button
            type="button"
            onClick={() => open({ type: "create" }, createCoupon)}
            className="flex items-center gap-1.5 rounded-lg bg-[#343C6A] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#2a3058] focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none"
          >
            <Plus size={14} aria-hidden="true" />
            Create coupon
          </button>
        </div>
      </div>

      {setStatus.error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {setStatus.error?.response?.data?.responseMessage || setStatus.error?.message || "Couldn’t update the coupon"}
        </p>
      )}

      {coupons.isError ? (
        <ErrorBox title="Couldn’t load coupons" error={coupons.error} onRetry={coupons.refetch} isRetrying={coupons.isFetching} />
      ) : (
        <div className="min-h-[200px] rounded-xl border border-gray-100 px-4 pb-2">
          {!coupons.isLoading && rows.length === 0 ? (
            isFiltered ? (
              <EmptyState
                icon={TicketPercent}
                title="No coupons match these filters"
                action={{ label: "Clear filters", onClick: () => setFilters(defaultsFor(COUPON_FILTERS)) }}
              />
            ) : (
              <EmptyState
                icon={TicketPercent}
                title="No coupons yet"
                description="Create a code customers can enter at checkout for a discount."
                action={{ label: "Create coupon", onClick: () => open({ type: "create" }, createCoupon) }}
              />
            )
          ) : (
            <DataTable columns={columns} rows={rows} isLoading={coupons.isLoading} skeletonRows={4} cellClassName="py-3.5 text-xs" />
          )}
        </div>
      )}

      {(dialog?.type === "create" || dialog?.type === "edit") && (
        <CouponFormModal
          coupon={dialog.coupon}
          isPending={dialog.coupon ? updateCoupon.isPending : createCoupon.isPending}
          error={dialog.coupon ? updateCoupon.error : createCoupon.error}
          onConfirm={(values) =>
            dialog.coupon
              ? updateCoupon.mutate({ id: dialog.coupon.id, ...values }, { onSuccess: close })
              : createCoupon.mutate(values, { onSuccess: close })
          }
          onClose={close}
        />
      )}

      {dialog?.type === "delete" && (
        <ConfirmDialog
          title={DELETE_COUPON.title}
          description={DELETE_COUPON.description(dialog.coupon)}
          confirmLabel="Delete"
          tone="danger"
          isPending={deleteCoupon.isPending}
          error={deleteCoupon.error}
          onConfirm={() => deleteCoupon.mutate({ id: dialog.coupon.id }, { onSuccess: close })}
          onClose={close}
        />
      )}
    </section>
  );
};

export default Coupons;
