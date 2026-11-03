import React from "react";
import { useNavigate } from "react-router-dom";
import { PackageCheck } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import ErrorBox from "../../components/ErrorBox";
import { DISPATCH_PAGE_SIZE, PRIORITY_BADGES } from "../dispatch.config";
import { useUnassignedOrders } from "../../../../api/admin.queries";

const HEAD = "px-4 pb-1 text-left text-sm font-medium text-[#343C6A] whitespace-nowrap";
const CELL = "bg-white px-4 py-4 text-sm text-[#343C6A] first:rounded-l-xl last:rounded-r-xl";

const SkeletonRows = ({ count }) =>
  Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      {Array.from({ length: 5 }).map((__, j) => (
        <td key={j} className={CELL}>
          <div className="h-4 w-20 rounded bg-gray-200" />
        </td>
      ))}
    </tr>
  ));

/** Orders waiting for a rider, shown as one white card per row (Dispatch dashboard). */
const UnassignedOrders = ({ page, onPageChange }) => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch, isFetching, isPlaceholderData } = useUnassignedOrders({
    page,
    pageSize: DISPATCH_PAGE_SIZE,
  });

  if (isError) {
    return <ErrorBox title="Error loading orders" error={error} onRetry={refetch} isRetrying={isFetching} />;
  }

  const rows = data?.results ?? [];

  if (!isLoading && rows.length === 0) {
    return (
      <div className="rounded-2xl bg-white">
        <EmptyState
          icon={PackageCheck}
          title="All caught up"
          description="Every order has a rider. New orders will show up here."
        />
      </div>
    );
  }

  return (
    <section aria-labelledby="unassigned-orders-title">
      <h2 id="unassigned-orders-title" className="sr-only">
        Unassigned orders
      </h2>
      <div className="overflow-x-auto">
        <table
          className={`w-full min-w-[640px] border-separate border-spacing-y-3 transition-opacity ${
            isPlaceholderData ? "opacity-60" : ""
          }`}
        >
          <thead>
            <tr>
              <th scope="col" className={HEAD}>Order ID</th>
              <th scope="col" className={HEAD}>Customer</th>
              <th scope="col" className={HEAD}>Pick-up to drop-off</th>
              <th scope="col" className={HEAD}>Priority</th>
              <th scope="col" className={HEAD}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows count={4} />
            ) : (
              rows.map((order) => (
                <tr key={order.id}>
                  <td className={`${CELL} whitespace-nowrap`}>{order.id}</td>
                  <td className={`${CELL} whitespace-nowrap font-medium`}>{order.customer}</td>
                  <td className={CELL}>
                    <p className="font-medium">
                      {order.pickup} – {order.dropoff}
                    </p>
                    <p className="text-xs text-gray-400">{order.distanceKm}km</p>
                  </td>
                  <td className={CELL}>
                    <StatusBadge status={order.priority} badges={PRIORITY_BADGES} />
                  </td>
                  <td className={`${CELL} text-right`}>
                    <button
                      type="button"
                      onClick={() => navigate(`/dispatch-management/${order.id}/assign`)}
                      aria-label={`Assign rider to ${order.id}`}
                      className="rounded-lg bg-[#0B1437] px-4 py-2 text-xs font-medium whitespace-nowrap text-white hover:bg-[#1c2657] focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none"
                    >
                      Assign Rider
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data?.totalPages > 1 && (
        <div className="mt-2">
          <Pagination page={page} totalPages={data.totalPages} onChange={onPageChange} disabled={isFetching} />
        </div>
      )}
    </section>
  );
};

export default UnassignedOrders;
