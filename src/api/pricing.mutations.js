import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPrice,
  createSurgeRule,
  deletePrice,
  deleteSurgeRule,
  updatePrice,
  updatePricingRates,
  updateSurgeRule,
} from "./pricing.service";
import { priceListKey, pricingKeys } from "./pricing.queries";

const logError = (name) => (error) => console.error(`❌ ${name} failed:`, error.response?.data || error.message);

/** Payload: { baseFare } or { perKm } */
export const useUpdatePricingRates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", "updatePricingRates"],
    mutationFn: updatePricingRates,
    onSuccess: (rates) => queryClient.setQueryData(pricingKeys.rates, rates),
    onError: logError("updatePricingRates"),
  });
};

// Every rule write refreshes the rules list (the overview card counts from the same list)
const useSurgeRuleMutation = (name, mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", name],
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pricingKeys.surgeRules }),
    onError: logError(name),
  });
};

/** Payload: { name, appliesWhen, multiplier } */
export const useCreateSurgeRule = () => useSurgeRuleMutation("createSurgeRule", createSurgeRule);

/** Payload: { id, name?, appliesWhen?, multiplier?, status? } */
export const useUpdateSurgeRule = () => useSurgeRuleMutation("updateSurgeRule", updateSurgeRule);

/** Payload: { id } */
export const useDeleteSurgeRule = () => useSurgeRuleMutation("deleteSurgeRule", deleteSurgeRule);

// ---- Price configuration lists — every payload carries its `section` ----------------------

const usePriceListMutation = (name, mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", name],
    mutationFn,
    onSuccess: (_, { section }) => queryClient.invalidateQueries({ queryKey: priceListKey(section) }),
    onError: logError(name),
  });
};

/** Payload: { section, values } */
export const useCreatePrice = () => usePriceListMutation("createPrice", createPrice);

/** Payload: { section, id, values } */
export const useUpdatePrice = () => usePriceListMutation("updatePrice", updatePrice);

/** Payload: { section, id } */
export const useDeletePrice = () => usePriceListMutation("deletePrice", deletePrice);
