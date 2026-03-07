import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Loader2, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useGetTransactionHistory } from '../../../api/financeReport.queries';
import WithdrawalRequestModal from '../Modals/WithdrawalRequestModal';
import WithdrawalProcessingModal from '../Modals/WithdrawalProcessingModal';

const PAGE_SIZE = 10;

const AllTransactions = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [showWithdrawalRequestModal, setShowWithdrawalRequestModal] = useState(false);
    const [showProcessingModal, setShowProcessingModal] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState(null);

    const { data, isLoading, isError } = useGetTransactionHistory();

    const allTransactions = data?.transactions || [];
    const currency = data?.currency || 'NGN';
    const currencySymbol = currency === 'NGN' ? '₦' : currency;

    const totalPages = Math.max(1, Math.ceil(allTransactions.length / PAGE_SIZE));
    const paginated = allTransactions.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'processing': return 'bg-yellow-100 text-yellow-700';
            case 'failed': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const formatAmount = (amount) =>
        `${currencySymbol}${Number(amount).toLocaleString('en-NG')}`;

    const handleDownloadReport = () => {
        const doc = new jsPDF();
        const now = new Date().toLocaleString('en-NG', { dateStyle: 'long', timeStyle: 'short' });

        doc.setFillColor(30, 42, 94);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Zummey Fleet — Transaction Report', 14, 13);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${now}`, 14, 22);

        doc.setTextColor(50, 50, 50);
        doc.setFontSize(10);
        doc.text(`Currency: ${currency}`, 14, 40);
        doc.text(`Total Transactions: ${allTransactions.length}`, 14, 47);

        autoTable(doc, {
            startY: 55,
            head: [['Transaction ID', 'Date', 'Amount', 'Type', 'Status']],
            body: allTransactions.map(txn => [
                txn.transaction_id,
                txn.date,
                formatAmount(txn.amount),
                txn.type,
                txn.status,
            ]),
            headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold', fontSize: 10 },
            bodyStyles: { fontSize: 9, textColor: 50 },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            columnStyles: { 4: { fontStyle: 'bold' } },
            didParseCell(hookData) {
                if (hookData.section === 'body' && hookData.column.index === 4) {
                    const val = hookData.cell.raw?.toLowerCase();
                    if (val === 'completed') hookData.cell.styles.textColor = [22, 163, 74];
                    if (val === 'processing') hookData.cell.styles.textColor = [161, 98, 7];
                    if (val === 'failed') hookData.cell.styles.textColor = [220, 38, 38];
                }
            },
            margin: { left: 14, right: 14 },
        });

        const finalY = doc.lastAutoTable.finalY + 8;
        doc.setDrawColor(200, 200, 200);
        doc.line(14, finalY, 196, finalY);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Zummey Fleet Management System — Confidential', 14, finalY + 5);
        doc.save('ZummeyFleet_Transaction_Report.pdf');
    };

    const handleWithdrawalSubmit = (amount) => {
        setWithdrawalAmount(amount);
        setShowWithdrawalRequestModal(false);
        setShowProcessingModal(true);
    };

    return (
        <>
            <div className="space-y-6 font-poppins">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/finance-reports')}
                            className="p-2 cursor-pointer rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-[1.2rem] font-semibold text-[#343C6A]">Transaction History</h1>
                            {data?.total_transactions !== undefined && (
                                <p className="text-xs text-gray-400">
                                    {data.total_transactions} transaction{data.total_transactions !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleDownloadReport}
                        disabled={isLoading || allTransactions.length === 0}
                        className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 hover:text-[#EF4444] transition-colors disabled:opacity-40"
                    >
                        <Download size={16} className="text-[#EF4444]" />
                        <span>Download Financial Report</span>
                    </button>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    {/* Loading */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={28} className="animate-spin text-[#EF4444] mr-2" />
                            <span className="text-sm text-gray-400">Loading transactions...</span>
                        </div>
                    )}

                    {/* Error */}
                    {isError && !isLoading && (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-sm text-gray-400">Could not load transactions. Please try again.</p>
                        </div>
                    )}

                    {/* Table */}
                    {!isLoading && !isError && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200">
                                    <tr>
                                        {['Transaction ID', 'Date', 'Amount', 'Type', 'Status'].map(col => (
                                            <th key={col} className="px-4 py-3 text-left text-sm font-semibold text-[#1E293B]">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-12 text-center text-sm text-gray-400">
                                                No transactions found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((txn, idx) => (
                                            <tr
                                                key={`${txn.transaction_id}-${idx}`}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-4 py-4 text-sm font-medium text-gray-700">
                                                    {txn.transaction_id}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-500">{txn.date}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-700">
                                                    {formatAmount(txn.amount)}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-600">{txn.type}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(txn.status)}`}>
                                                        {txn.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && !isError && totalPages > 1 && (
                        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm text-gray-700 font-medium">
                                {currentPage} <span className="text-gray-400 font-normal">of</span> {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Request Withdrawal Button */}
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowWithdrawalRequestModal(true)}
                        className="px-10 cursor-pointer py-3 bg-[#EF4444] text-white rounded-lg font-medium hover:bg-[#DC2626] transition-colors shadow-lg hover:shadow-xl"
                    >
                        Request Withdrawal
                    </button>
                </div>
            </div>

            <WithdrawalRequestModal
                isOpen={showWithdrawalRequestModal}
                onClose={() => setShowWithdrawalRequestModal(false)}
                onSubmit={handleWithdrawalSubmit}
            />
            <WithdrawalProcessingModal
                isOpen={showProcessingModal}
                onClose={() => setShowProcessingModal(false)}
                amount={withdrawalAmount}
            />
        </>
    );
};

export default AllTransactions;
