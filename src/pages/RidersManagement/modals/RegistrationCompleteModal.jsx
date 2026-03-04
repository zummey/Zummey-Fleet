import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RegistrationCompleteModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleDone = () => {
    // Clean up ALL registration state — banner AND table icon
    localStorage.removeItem('riderRegistration');
    localStorage.removeItem('pendingRiderRegistrations');
    // Notify RidersManagement (same tab) so it clears state without needing a remount
    window.dispatchEvent(new Event('registrationComplete'));
    // Close the modal
    onClose();
    // Navigate to riders list — the list already refreshed via React Query invalidation
    navigate('/riders-management');
  };

  // Helper function to convert month number to name
  const getMonthName = (monthNum) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(monthNum) - 1] || '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 font-poppins">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#B3B3BF]/40"></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-white border-4 border-[#1E2A5E] rounded-full flex items-center justify-center">
            <CheckCircle size={48} className="text-[#1E2A5E]" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-[#1E2A5E] mb-3">
            Driver Successfully Added 🎉
          </h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            The driver has been successfully added to your fleet and is awaiting admin approval. Once approved, you can assign a vehicle, track their activity, and manage their profile.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={handleDone}
          className="w-full px-6 py-3 bg-[#1E2A5E] text-white rounded-lg font-medium hover:bg-[#162042] transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default RegistrationCompleteModal;