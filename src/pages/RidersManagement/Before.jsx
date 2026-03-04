import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Logo from '../../../assets/logo.png';

const Signup = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  /* ================= PREVENT HMR REFRESH ON MOUNT ================= */
  // Note: Signup doesn't read from localStorage on mount, but it's good practice
  // to ensure no side effects happen at component level
  useEffect(() => {
    // Any initialization that reads from storage or localStorage should go here
    // This prevents HMR from triggering full page refreshes
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    console.log('📝 Signup data:', data);

    // TODO: Replace with React Query mutation
    // const response = await api.post('/riders/signup', data);
    
    // Simulate API call
    setTimeout(() => {
      // ✅ Store data in localStorage (only after form submission, not on render)
      localStorage.setItem('riderSignupData', JSON.stringify(data));
      
      setIsSubmitting(false);
      // Navigate to OTP verification
      navigate('/riders-management/add-rider/otp-verification');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 font-poppins">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Zummey Logo" className="w-12 h-12 object-contain" />
          </div>
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
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              placeholder="Enter email address"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2  transition-all ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
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
                pattern: {
                  value: /^[0-9]{11}$/,
                  message: 'Please enter a valid 11-digit phone number',
                },
              })}
              placeholder="08012345678"
              maxLength={11}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>
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
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select State</option>
                <option value="Lagos">Lago</option>
                <option value="Abuja">Abuja</option>
                <option value="Edo">Edo</option>
                <option value="Rivers">Rivers</option>
                <option value="Kano">Kano</option>
                {/* Add more Nigerian states */}
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
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
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
  );
};

export default Signup;