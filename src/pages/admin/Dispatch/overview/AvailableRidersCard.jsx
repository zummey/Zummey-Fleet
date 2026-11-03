import React from "react";
import { Link } from "react-router-dom";
import Avatar from "../../components/Avatar";
import ErrorBox from "../../components/ErrorBox";
import { AVAILABLE_RIDERS_PREVIEW } from "../dispatch.config";
import { useAvailableRiders } from "../../../../api/admin.queries";

const AvailableRidersCard = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useAvailableRiders({
    limit: AVAILABLE_RIDERS_PREVIEW,
  });
  const riders = data?.results ?? [];

  return (
    <section aria-labelledby="available-riders-title" className="rounded-2xl bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="available-riders-title" className="text-sm font-semibold text-[#343C6A]">
          Available Riders
        </h2>
        <Link
          to="/user-management/riders"
          className="text-xs font-medium text-[#343C6A] hover:text-[#EB4827] hover:underline"
        >
          View All
        </Link>
      </div>

      {isError ? (
        <ErrorBox title="Error loading riders" error={error} onRetry={refetch} isRetrying={isFetching} />
      ) : isLoading ? (
        <ul className="animate-pulse space-y-3" aria-hidden="true">
          {Array.from({ length: AVAILABLE_RIDERS_PREVIEW }).map((_, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-full bg-gray-200" />
              <span className="h-3 w-28 rounded bg-gray-200" />
            </li>
          ))}
        </ul>
      ) : riders.length === 0 ? (
        <p className="py-4 text-center text-xs text-gray-400">No riders are free right now.</p>
      ) : (
        <ul className="space-y-3">
          {riders.map((rider) => (
            <li key={rider.id} className="flex items-center gap-3">
              <Avatar name={rider.name} size="h-9 w-9" colorful />
              <div className="min-w-0">
                <p className="truncate text-sm text-[#343C6A]">{rider.name}</p>
                <p className="truncate text-xs text-gray-400">{rider.fleet}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default AvailableRidersCard;
