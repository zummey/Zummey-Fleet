import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCampaign,
  createCoupon,
  createDiscountRule,
  createPrice,
  createSurgeRule,
  deleteCampaign,
  deleteCoupon,
  deleteDiscountRule,
  deletePrice,
  deleteSurgeRule,
  updateCampaign,
  updateCoupon,
  updateDiscountRule,
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

// ---- Coupons ------------------------------------------------------------------------------

const useCouponMutation = (name, mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", name],
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pricingKeys.coupons }),
    onError: logError(name),
  });
};

/** Payload: { code, type, value, usageLimit, expiresOn } */
export const useCreateCoupon = () => useCouponMutation("createCoupon", createCoupon);

/** Payload: { id, ...changes } or { id, status } */
export const useUpdateCoupon = () => useCouponMutation("updateCoupon", updateCoupon);

/** Payload: { id } */
export const useDeleteCoupon = () => useCouponMutation("deleteCoupon", deleteCoupon);

// ---- Promo campaigns ----------------------------------------------------------------------

const useCampaignMutation = (name, mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", name],
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pricingKeys.campaigns }),
    onError: logError(name),
  });
};

/** Payload: { name, audience, discount, startsOn, endsOn } */
export const useCreateCampaign = () => useCampaignMutation("createCampaign", createCampaign);

/** Payload: { id, ...changes } or { id, status } */
export const useUpdateCampaign = () => useCampaignMutation("updateCampaign", updateCampaign);

/** Payload: { id } */
export const useDeleteCampaign = () => useCampaignMutation("deleteCampaign", deleteCampaign);

// ---- Discount rules -----------------------------------------------------------------------

const useDiscountRuleMutation = (name, mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["admin", name],
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pricingKeys.discountRules }),
    onError: logError(name),
  });
};

/** Payload: { name, trigger, threshold, discount } */
export const useCreateDiscountRule = () => useDiscountRuleMutation("createDiscountRule", createDiscountRule);

/** Payload: { id, ...changes } or { id, status } */
export const useUpdateDiscountRule = () => useDiscountRuleMutation("updateDiscountRule", updateDiscountRule);

/** Payload: { id } */
export const useDeleteDiscountRule = () => useDiscountRuleMutation("deleteDiscountRule", deleteDiscountRule);
