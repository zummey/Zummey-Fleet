import { useQuery } from '@tanstack/react-query';
import { fetchFinanceSummary, fetchEarningOverview, fetchTransactionHistory } from './financeReports.service';

/**
 * GET FINANCE SUMMARY QUERY
 * Wraps GET /fleet/finance/summary
 */
export const useGetFinanceSummary = () => {
    return useQuery({
        queryKey: ['financeSummary'],
        queryFn: fetchFinanceSummary,
        select: (response) => response.data?.responseDetails ?? response.data,
        staleTime: 60 * 1000,
    });
};

/**
 * GET EARNING OVERVIEW QUERY
 * Wraps GET /fleet/finance/earning-overview
 */
export const useGetEarningOverview = () => {
    return useQuery({
        queryKey: ['earningOverview'],
        queryFn: fetchEarningOverview,
        select: (response) => response.data?.responseDetails ?? response.data,
        staleTime: 60 * 1000,
    });
};

/**
 * GET TRANSACTION HISTORY QUERY
 * Wraps GET /fleet/finance/transaction-history
 * Returns responseDetails: { currency, total_transactions, transactions[] }
 */
export const useGetTransactionHistory = () => {
    return useQuery({
        queryKey: ['transactionHistory'],
        queryFn: fetchTransactionHistory,
        select: (response) => response.data?.responseDetails ?? response.data,
        staleTime: 60 * 1000,
    });
};
