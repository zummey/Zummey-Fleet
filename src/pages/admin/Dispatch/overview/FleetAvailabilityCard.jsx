import React from "react";
import ErrorBox from "../../components/ErrorBox";
import { fleetAvailabilityBadge } from "../dispatch.config";
import { useFleetAvailability } from "../../../../api/admin.queries";

const FleetAvailabilityCard = () => {
  const { data: fleets = [], isLoading, isError, error, refetch, isFetching } = useFleetAvailability();

  return (
    <section aria-labelledby="fleet-availability-title" className="rounded-2xl bg-white p-5">
      <h2 id="fleet-availability-title" className="mb-4 text-sm font-semibold text-[#343C6A]">
        Fleet availability
      </h2>

      {isError ? (
        <ErrorBox title="Error loading fleets" error={error} onRetry={refetch} isRetrying={isFetching} />
      ) : isLoading ? (
        <ul className="animate-pulse space-y-5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="space-y-2">
              <span className="block h-3 w-24 rounded bg-gray-200" />
              <span className="block h-1.5 w-full rounded-full bg-gray-200" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-4">
          {fleets.map((fleet) => {
            const badge = fleetAvailabilityBadge(fleet);
            const percent = fleet.totalRiders ? Math.round((fleet.freeRiders / fleet.totalRiders) * 100) : 0;
            return (
              <li key={fleet.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-xs font-medium text-[#343C6A]">{fleet.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label={`${fleet.name} free riders`}
                  aria-valuemin={0}
                  aria-valuemax={fleet.totalRiders}
                  aria-valuenow={fleet.freeRiders}
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100"
                >
                  <div className={`h-full rounded-full ${badge.bar}`} style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  {fleet.freeRiders} of {fleet.totalRiders} riders free
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default FleetAvailabilityCard;
