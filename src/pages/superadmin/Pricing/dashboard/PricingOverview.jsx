import React from "react";
import { RATE_CARDS } from "../pricing.config";

const Card = ({ title, action, children, caption }) => (
  <div className="flex min-h-[150px] flex-col rounded-2xl bg-white p-5">
    <div className="flex items-start justify-between gap-3">
      <h3 className="text-sm text-[#343C6A]">{title}</h3>
      {action}
    </div>
    <div className="mt-auto pt-6">{children}</div>
    {caption && <p className="mt-3 text-[11px] text-gray-400">{caption}</p>}
  </div>
);

const CardSkeleton = () => (
  <div className="min-h-[150px] animate-pulse rounded-2xl bg-white p-5">
    <div className="h-4 w-28 rounded bg-gray-200" />
    <div className="mt-8 h-8 w-24 rounded bg-gray-200" />
    <div className="mt-4 h-3 w-20 rounded bg-gray-100" />
  </div>
);

/** Base delivery, distance charge and active surge rule cards. */
const PricingOverview = ({ rates, rules, onEditRate }) => (
  <section aria-labelledby="pricing-overview-title">
    <h2 id="pricing-overview-title" className="mb-4 text-lg font-medium text-[#343C6A]">
      Pricing Overview
    </h2>

    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {RATE_CARDS.map((card) =>
        rates.isLoading ? (
          <CardSkeleton key={card.id} />
        ) : (
          <Card
            key={card.id}
            title={card.title}
            caption={rates.data ? card.caption(rates.data) : null}
            action={
              rates.data && (
                <button
                  type="button"
                  onClick={() => onEditRate(card)}
                  aria-label={card.edit.title}
                  className="rounded px-1 text-xs text-[#343C6A] hover:text-[#EB4827] hover:underline focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none"
                >
                  Edit
                </button>
              )
            }
          >
            {rates.isError ? (
              <p className="text-xs text-red-500">
                Couldn’t load.{" "}
                <button type="button" onClick={() => rates.refetch()} className="font-medium underline">
                  Retry
                </button>
              </p>
            ) : (
              <p className="text-3xl font-semibold text-[#343C6A]">
                ₦{rates.data[card.id].toLocaleString()}
                {card.suffix && <span className="text-sm font-medium">{card.suffix}</span>}
              </p>
            )}
          </Card>
        )
      )}

      {rules.isLoading ? (
        <CardSkeleton />
      ) : (
        <Card
          title="Surge Pricing Rules"
          caption={rules.data ? `${rules.data.length} rule${rules.data.length === 1 ? "" : "s"} in total` : null}
        >
          {rules.isError ? (
            <p className="text-xs text-red-500">Couldn’t load.</p>
          ) : (
            <p className="text-3xl font-semibold text-[#343C6A]">
              {rules.data.filter((r) => r.status === "active").length}{" "}
              <span className="text-sm font-medium">active</span>
            </p>
          )}
        </Card>
      )}
    </div>
  </section>
);

export default PricingOverview;
