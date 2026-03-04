import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useVerifyRiderOTP, useResendRiderOTP } from '../../../api/authRiders.mutations';

const OTPModal = ({ isOpen, onClose, email, onVerified }) => {
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [counter, setCounter] = useState(30);

  // 🔥 React Query mutations
  const { mutate: verifyOTP, isPending: isVerifying } = useVerifyRiderOTP();
  const { mutate: resendOTP, isPending: isResending } = useResendRiderOTP();

  /* ================= OTP INPUT LOGIC ================= */
  const handleChange = (value, index) => {
    // Only allow digits
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otpValues];
    updatedOtp[index] = value;
    setOtpValues(updatedOtp);

    // Auto-focus next input
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    // Clear error when user types
    setError('');
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d{4}$/.test(pasted)) {
      setOtpValues(pasted.split(''));
      document.getElementById('otp-3')?.focus();
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleVerifyOTP = async () => {
    const otp = otpValues.join('');
    
    if (otp.length !== 4) {
      setError('Please enter a 4-digit code');
      return;
    }

    console.log('🔐 Verifying OTP:', otp);

    // 🚀 Call the real API
    verifyOTP(
      { email, otp_token: otp },
      {
        onSuccess: (response) => {
          console.log('✅ OTP verified successfully!', response.data);
          // Call parent's onVerified callback
          onVerified();
        },
        onError: (error) => {
          console.error('❌ OTP verification failed:', error);
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.error ||
                              'Invalid or expired OTP. Please try again.';
          setError(errorMessage);
        },
      }
    );
  };

  /* ================= RESEND OTP ================= */
  const handleResendOTP = () => {
    console.log('📧 Resending OTP to:', email);
    
    // 🚀 Call the real API
    resendOTP(
      { email },
      {
        onSuccess: (response) => {
          console.log('✅ OTP resent successfully!', response.data);
          // Clear inputs and reset counter
          setOtpValues(['', '', '', '']);
          setError('');
          setCounter(30);
          // Focus first input
          document.getElementById('otp-0')?.focus();
        },
        onError: (error) => {
          console.error('❌ Resend OTP failed:', error);
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.error ||
                              'Failed to resend OTP. Please try again.';
          setError(errorMessage);
        },
      }
    );
  };

  /* ================= EFFECTS - ALL HOOKS MUST BE HERE, BEFORE ANY CONDITIONAL RETURNS ================= */
  // Countdown timer for resend
  useEffect(() => {
    if (counter > 0 && isOpen) {
      const timer = setInterval(() => setCounter((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [counter, isOpen]);

  // Auto-focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        document.getElementById('otp-0')?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Check if OTP is complete
  const isOtpComplete = otpValues.every((v) => v.length === 1);

  /* ================= CONDITIONAL RETURN - MUST BE AFTER ALL HOOKS ================= */
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 font-poppins">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#B3B3BF]/40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-[#343C6A] mb-2">Enter OTP</h2>
          <p className="text-gray-600">
            We sent a 4-digit code to <br />
            <span className="font-medium text-[#343C6A]">{email}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <div className="flex justify-center gap-3">
            {otpValues.map((value, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                value={value}
                maxLength={1}
                type="text"
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className={`w-14 h-14 text-center text-2xl font-semibold border-2 rounded-lg focus:outline-none transition-all ${
                  error 
                    ? 'border-red-500' 
                    : 'border-gray-300 focus:border-[#EB4827]'
                }`}
              />
            ))}
          </div>
          
          {error && (
            <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
          )}
        </div>

        {/* Resend Code */}
        <div className="text-center mb-6">
          {counter > 0 ? (
            <p className="text-gray-600 text-sm">
              Resend in <span className="font-medium">{counter}s</span>
            </p>
          ) : (
            <p className="text-gray-600 text-sm">
              Didn't receive the code?{' '}
              <button
                onClick={handleResendOTP}
                disabled={isResending}
                className="text-[#EB4827] font-medium hover:underline disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend OTP'}
              </button>
            </p>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerifyOTP}
          disabled={!isOtpComplete || isVerifying}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
            isOtpComplete && !isVerifying
              ? 'bg-[#1E2A5E] text-white hover:bg-[#162042]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </button>
      </div>
    </div>
  );
};

export default OTPModal;