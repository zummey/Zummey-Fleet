import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Logo from '../../../assets/logo.png';
import OTPModal from '../modals/OTPModal';
import SuccessModal from '../modals/SuccessModal';
import { useRegisterRider } from '../../../api/authRiders.mutations';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT - Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const Signup = () => {
  const navigate = useNavigate();
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [signupData, setSignupData] = useState(null);
  const [serverOTP, setServerOTP] = useState(null);
  const [serverPassword, setServerPassword] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // 🔥 React Query mutation for rider registration
  const { mutate: registerRider, isPending: isSubmitting } = useRegisterRider();

  const onSubmit = async (data) => {
    console.log('📝 Form data:', data);

    // Transform data to match backend API format
    const apiData = {
      email: data.email,
      phone_number: data.phoneNumber,
      password: "DefaultPassword123", // TODO: Remove when backend removes password requirement
      city: data.city,
      state: data.state,
    };

    console.log('🚀 Sending to API:', apiData);

    // Call the real API
    registerRider(apiData, {
      onSuccess: (response) => {
        console.log('✅ Full response:', response);
        console.log('✅ Response data:', response.data);

        // Extract rider ID from response (nested in rider object)
        const riderId = response.data.rider?.profile_id;
        console.log('🆔 Rider Profile ID:', riderId);
        console.log('🆔 Rider User ID:', response.data.rider?.user_id);

        // Check if we have otp and password in response
        if (response.data.otp && response.data.password) {
          console.log('📧 OTP:', response.data.otp);
          console.log('🔑 Password:', response.data.password);

          // Store OTP and password from server
          setServerOTP(response.data.otp);
          setServerPassword(response.data.password);

          // Store original form data with step progress in localStorage
          const registrationData = {
            ...data, // Original form data (phoneNumber, not phone_number)
            riderId, // ⭐ Store rider profile ID for subsequent stages
            userId: response.data.rider?.user_id, // Also store user ID
            currentStep: 'otp-verification',
            timestamp: new Date().toISOString(),
            serverPassword: response.data.password,
          };
          localStorage.setItem('riderRegistration', JSON.stringify(registrationData));

          setSignupData(data);

          // Open OTP modal
          setShowOTPModal(true);
        } else {
          console.error('⚠️ Response missing OTP or password:', response.data);
          // Check console for error details
        }
      },
      onError: (error) => {
        console.error('❌ Registration failed:', error);
        console.error('❌ Error response:', error.response);
        console.error('❌ Error data:', error.response?.data);
        console.error('❌ Error status:', error.response?.status);

        // Get detailed error message
        let errorMessage = 'Registration failed. Please try again.';

        if (error.response?.data) {
          const errorData = error.response.data;

          // Handle different error formats
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.email) {
            errorMessage = `Email: ${errorData.email[0]}`;
          } else if (errorData.phone_number) {
            errorMessage = `Phone: ${errorData.phone_number[0]}`;
          } else {
            // Show all errors
            errorMessage = JSON.stringify(errorData);
          }
        }

        console.error('📋 Error message:', errorMessage);
        // Removed alert - check console for errors
      },
    });
  };

  const handleOTPVerified = () => {
    // Close OTP modal and show success modal
    setShowOTPModal(false);
    setShowSuccessModal(true);

    // Update progress
    const existingData = JSON.parse(localStorage.getItem('riderRegistration') || '{}');
    localStorage.setItem('riderRegistration', JSON.stringify({
      ...existingData,
      currentStep: 'personal-info',
      otpVerified: true,
      timestamp: new Date().toISOString(),
    }));
  };

  const handleProceedToOnboarding = () => {
    // Close success modal and navigate to personal info
    setShowSuccessModal(false);
    navigate('/riders-management/add-rider/personal-info');
  };

  return (
    <>
      <div className="bg-gray-50 flex items-center justify-center p-3 font-poppins">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <img src={Logo} alt="Zummey Logo" className="w-12 h-12 object-contain" />
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-2 w-16 bg-[#EB4827] rounded-full"></div>
            <div className="h-2 w-16 bg-gray-300 rounded-full"></div>
            <div className="h-2 w-16 bg-gray-300 rounded-full"></div>
            <div className="h-2 w-16 bg-gray-300 rounded-full"></div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-[#343C6A] mb-2">Add New Rider</h2>
            <p className="text-gray-600">Enter rider's basic information to get started</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('email', {
                  required: 'Email is required',
                  validate: (value) => {
                    if (/[A-Z]/.test(value)) {
                      return 'Email must not contain capital letters';
                    }
                    if (!/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(value)) {
                      return 'Please enter a valid email address (e.g. example@email.com)';
                    }
                    return true;
                  },
                })}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/[A-Z]/.test(val)) {
                    setEmailError('Email must not contain capital letters');
                  } else if (val && !/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(val)) {
                    setEmailError('Please enter a valid email address (e.g. example@email.com)');
                  } else {
                    setEmailError('');
                  }
                  setValue('email', val, { shouldValidate: false });
                }}
                placeholder="Enter email address"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.email || emailError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                  }`}
              />
              {(emailError || errors.email) && (
                <p className="mt-1 text-sm text-red-500">
                  {emailError || errors.email?.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                  validate: (value) => {
                    if (value.startsWith('+234')) {
                      return 'Please enter your number starting with 0 (e.g. 09012345678), not +234';
                    }
                    if (!/^0[0-9]{10}$/.test(value)) {
                      return 'Phone number must be 11 digits and start with 0 (e.g. 09012345678)';
                    }
                    return true;
                  },
                })}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('+234')) {
                    setPhoneError('Please enter your number starting with 0 (e.g. 09012345678), not +234');
                  } else if (val && !/^0[0-9]{0,10}$/.test(val)) {
                    setPhoneError('Phone number must start with 0 and contain only digits');
                  } else if (val.length === 11 && !/^0[0-9]{10}$/.test(val)) {
                    setPhoneError('Phone number must be 11 digits and start with 0 (e.g. 09012345678)');
                  } else {
                    setPhoneError('');
                  }
                  setValue('phoneNumber', val, { shouldValidate: false });
                }}
                placeholder="09012345678"
                maxLength={14}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.phoneNumber || phoneError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                  }`}
              />
              {(phoneError || errors.phoneNumber) && (
                <p className="mt-1 text-sm text-red-500">
                  {phoneError || errors.phoneNumber?.message}
                </p>
              )}
            </div>

            {/* State and City in Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('state', { required: 'State is required' })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white ${errors.state ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                    }`}
                >
                  <option value="">Select State</option>
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && (
                  <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('city', { required: 'City is required' })}
                  placeholder="Enter city"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/riders-management')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-[#1E2A5E] text-white rounded-lg font-medium hover:bg-[#162042] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={signupData?.email}
        onVerified={handleOTPVerified}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onProceed={handleProceedToOnboarding}
      />
    </>
  );
};

export default Signup;