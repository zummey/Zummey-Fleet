import React from "react";
import { formatMonthDayTime } from "../../components/formatters";

/**
 * Vertical timeline. Finished steps are solid green; while the incident is still
 * live, the latest step is a hollow blue ring ("where it is now").
 */
const IncidentTimeline = ({ events, isClosed }) => (
  <section aria-labelledby="incident-timeline-title" className="rounded-2xl bg-white p-5">
    <h2 id="incident-timeline-title" className="text-sm font-semibold text-[#343C6A]">
      Timeline
    </h2>

    <ol className="mt-4">
      {events.map((event, i) => {
        const isLast = i === events.length - 1;
        const isCurrent = isLast && !isClosed;
        const meta = [formatMonthDayTime(event.at), event.detail, event.by && (i === 0 ? event.by : `by ${event.by}`)]
          .filter(Boolean)
          .join(" · ");

        return (
          <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && <span aria-hidden="true" className="absolute top-3 left-[5px] h-full w-0.5 bg-green-600" />}
            <span
              aria-hidden="true"
              className={`relative mt-1 h-3 w-3 shrink-0 rounded-full ${
                isCurrent ? "border-2 border-blue-500 bg-white" : "bg-green-600"
              }`}
            />
            <div className="min-w-0">
              <p className={`text-xs text-[#343C6A] ${isCurrent ? "font-semibold" : "font-medium"}`}>
                {event.label}
                {isCurrent && <span className="sr-only"> (current)</span>}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-400">{meta}</p>
            </div>
          </li>
        );
      })}
    </ol>
  </section>
);

export default IncidentTimeline;
