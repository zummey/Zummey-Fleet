import React, { useState } from 'react';
import { X } from 'lucide-react';

/**
 * WithdrawalRequestModal Component
 * Modal for requesting withdrawal with amount input
 * Opens WithdrawalProcessingModal on submit
 */
const WithdrawalRequestModal = ({ isOpen, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    console.log('💰 Withdrawal Amount:', amount);
    
    // Call parent's onSubmit to open processing modal
    onSubmit(amount);
    
    // Reset form
    setAmount('');
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
        onClick={handleClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex-1"></div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-8">
            {/* Amount Input */}
            <div className="mb-8">
              <label className="block text-sm text-gray-600 mb-2">
                Enter Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:border-transparent"
                autoFocus
              />
            </div>

            {/* Withdraw Button */}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-[#1E293B] text-white rounded-lg font-medium hover:bg-[#0F172A] transition-colors"
            >
              Withdraw
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default WithdrawalRequestModal;