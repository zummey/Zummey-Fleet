import { useQuery } from "@tanstack/react-query";
import { getPriceList, getPricingRates, getSurgeRules } from "./pricing.service";

export const pricingKeys = {
  all: ["admin", "pricing"],
  rates: ["admin", "pricing", "rates"],
  surgeRules: ["admin", "pricing", "surge-rules"],
};

export const usePricingRates = () =>
  useQuery({ queryKey: pricingKeys.rates, queryFn: getPricingRates, staleTime: 60 * 1000, retry: 2 });

export const useSurgeRules = () =>
  useQuery({ queryKey: pricingKeys.surgeRules, queryFn: getSurgeRules, staleTime: 60 * 1000, retry: 2 });

export const priceListKey = (section) => ["admin", "pricing", "price-list", section];

/** section: "state" | "city" | "vehicle" | "weight" */
export const usePriceList = (section) =>
  useQuery({
    queryKey: priceListKey(section),
    queryFn: () => getPriceList(section),
    staleTime: 60 * 1000,
    retry: 2,
  });
