import React from 'react';
import { X, CheckCircle } from 'lucide-react';

/**
 * WithdrawalProcessingModal Component
 * Confirmation modal showing withdrawal request is being processed
 */
const WithdrawalProcessingModal = ({ isOpen, onClose, amount }) => {
  if (!isOpen) return null;

  const handleReturnToFinance = () => {
    console.log('🔙 Returning to Finance page');
    onClose();
    // TODO: Could navigate or just close modal
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl border-2 border-blue-500"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-end p-6">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-gray-900 flex items-center justify-center">
                <CheckCircle size={40} className="text-gray-900" strokeWidth={2} />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Withdrawal Request
            </h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Processing
            </h3>

            {/* Message */}
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              Your withdrawal request is being processed. We will notify you once the transaction is completed.
            </p>

            {/* Return Button */}
            <button
              onClick={handleReturnToFinance}
              className="w-full px-6 py-3 bg-[#1E293B] text-white rounded-lg font-medium hover:bg-[#0F172A] transition-colors"
            >
              Return to Finance
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WithdrawalProcessingModal;