import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessModal = ({ isOpen, onClose, onProceed }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 font-poppins">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#B3B3BF]/40"></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={64} className="text-green-600" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-[#343C6A] mb-2">
            Email Verified Successfully!
          </h2>
          <p className="text-gray-600">
            Your email has been verified. Let's complete the rider onboarding process.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={onProceed}
          className="w-full px-6 py-3 bg-[#1E2A5E] text-white rounded-lg font-medium hover:bg-[#162042] transition-colors"
        >
          Go to Onboarding
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;