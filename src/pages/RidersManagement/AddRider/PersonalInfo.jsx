import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Logo from '../../../assets/logo.png';
import { useSubmitRiderStage } from '../../../api/authRiders.mutations';

const PersonalInfo = () => {
  const navigate = useNavigate();
  const [riderId, setRiderId] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Load existing data if resuming
  useEffect(() => {
    const existingData = JSON.parse(localStorage.getItem('riderRegistration') || '{}');

    // Get rider ID from localStorage
    if (existingData.riderId) {
      setRiderId(existingData.riderId);
      console.log('🆔 Retrieved rider ID:', existingData.riderId);
    } else {
      console.error('⚠️ No rider ID found in localStorage. User may need to start registration again.');
    }

    // Load existing form data if any
    if (existingData.firstName) {
      setValue('firstName', existingData.firstName);
    }
    if (existingData.lastName) {
      setValue('lastName', existingData.lastName);
    }

  }, [setValue]);

  // React Query mutation for submitting personal info stage
  const { mutate: submitStage, isPending: isSubmitting } = useSubmitRiderStage();

  const onSubmit = async (data) => {
    console.log('📝 Personal info data:', data);

    if (!riderId) {
      console.error('❌ Cannot submit: No rider ID available');
      return;
    }

    // Transform data to match backend API format for PERSONAL stage
    const apiData = {
      data_type: "PERSONAL",
      first_name: data.firstName,
      last_name: data.lastName,
    };

    console.log('🚀 Sending to API:', apiData);
    console.log('🆔 Using rider ID:', riderId);

    // Call the stages API
    submitStage(
      { riderId, data: apiData },
      {
        onSuccess: (response) => {
          console.log('✅ Personal info submitted successfully:', response.data);

          // Update localStorage with new data + progress
          const existingData = JSON.parse(localStorage.getItem('riderRegistration') || '{}');
          localStorage.setItem('riderRegistration', JSON.stringify({
            ...existingData,
            firstName: data.firstName,
            lastName: data.lastName,
            currentStep: 'legal-licensing',
            timestamp: new Date().toISOString(),
          }));

          // Navigate to legal & licensing
          navigate('/riders-management/add-rider/legal-licensing');
        },
        onError: (error) => {
          console.error('❌ Personal info submission failed:', error);
          console.error('❌ Error response:', error.response);
          console.error('❌ Error data:', error.response?.data);
          // Errors logged to console only, no alerts
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-poppins">
      <div className="w-full max-w-2xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Zummey Logo" className="w-12 h-12 object-contain" />
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-2 w-16 bg-[#EB4827] rounded-full"></div>
          <div className="h-2 w-16 bg-[#EB4827] rounded-full"></div>
          <div className="h-2 w-16 bg-gray-300 rounded-full"></div>
          <div className="h-2 w-16 bg-gray-300 rounded-full"></div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-[#343C6A] mb-2">Personal Information</h2>
          <p className="text-gray-600">Enter rider's personal details</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('firstName', {
                required: 'First name is required',
                minLength: {
                  value: 2,
                  message: 'First name must be at least 2 characters',
                },
              })}
              placeholder="Enter first name"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('lastName', {
                required: 'Last name is required',
                minLength: {
                  value: 2,
                  message: 'Last name must be at least 2 characters',
                },
              })}
              placeholder="Enter last name"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/riders-management')}
              className="flex-1 cursor-pointer px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 cursor-pointer px-6 py-3 bg-[#1E2A5E] text-white rounded-lg font-medium hover:bg-[#162042] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfo;