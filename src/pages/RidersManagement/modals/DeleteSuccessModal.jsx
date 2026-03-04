import React from 'react';
import { CheckCircle } from 'lucide-react';

const DeleteSuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Auto-close after 2 seconds
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 font-poppins">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#B3B3BF]/40"></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-white border-4 border-[#1E2A5E] rounded-full flex items-center justify-center">
            <CheckCircle size={48} className="text-[#1E2A5E]" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-[#1E2A5E] mb-2">
            Driver Account Deleted Successfully
          </h2>
          <p className="text-gray-600 text-sm">
            The driver's account has been successfully removed. All related data has been deleted from the system.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-[#1E2A5E] text-white rounded-lg font-medium hover:bg-[#162042] transition-colors"
        >
          Back to Drivers List
        </button>
      </div>
    </div>
  );
};

export default DeleteSuccessModal;