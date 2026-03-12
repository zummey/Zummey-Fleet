import api from "./axios";

/**
 * GET FINANCE SUMMARY
 * GET /fleet/finance/summary
 */
export const fetchFinanceSummary = () => {
    return api.get("/fleet/finance/summary");
};

/**
 * GET EARNING OVERVIEW
 * GET /fleet/finance/earning-overview
 */
export const fetchEarningOverview = () => {
    return api.get("/fleet/finance/earning-overview");
};

/**
 * GET TRANSACTION HISTORY
 * GET /fleet/finance/transaction-history
 * Returns: currency, total_transactions, transactions[]
 */
export const fetchTransactionHistory = () => {
    return api.get("/fleet/finance/transaction-history");
};