import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Logo from '../../../assets/logo.png';
import { useSubmitRiderStage } from '../../../api/authRiders.mutations';

const LegalLicensing = () => {
  const navigate = useNavigate();
  const [riderId, setRiderId] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const hasNoLicense = watch('hasNoLicense');

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
    if (existingData.nin) setValue('nin', existingData.nin);
    if (existingData.driverLicense) setValue('driverLicense', existingData.driverLicense);
    if (existingData.hasNoLicense) setValue('hasNoLicense', existingData.hasNoLicense);
    if (existingData.issuanceYear) setValue('issuanceYear', existingData.issuanceYear);
    if (existingData.issuanceMonth) setValue('issuanceMonth', existingData.issuanceMonth);
    if (existingData.issuanceDay) setValue('issuanceDay', existingData.issuanceDay);
    if (existingData.expiryYear) setValue('expiryYear', existingData.expiryYear);
    if (existingData.expiryMonth) setValue('expiryMonth', existingData.expiryMonth);
    if (existingData.expiryDay) setValue('expiryDay', existingData.expiryDay);
  }, [setValue]);

  // React Query mutation for submitting legal & licensing stage
  const { mutate: submitStage, isPending: isSubmitting } = useSubmitRiderStage();

  const onSubmit = async (data) => {
    console.log('📝 Legal & licensing data:', data);

    if (!riderId) {
      console.error('❌ Cannot submit: No rider ID available');
      return;
    }

    // Format dates as YYYY-MM-DD
    const formatDate = (year, month, day) => {
      if (!year || !month || !day) return null;
      const paddedMonth = String(month).padStart(2, '0');
      const paddedDay = String(day).padStart(2, '0');
      return `${year}-${paddedMonth}-${paddedDay}`;
    };

    const issuanceDate = formatDate(data.issuanceYear, data.issuanceMonth, data.issuanceDay);
    const expiryDate = formatDate(data.expiryYear, data.expiryMonth, data.expiryDay);

    // Transform data to match backend API format for LEGAL stage
    const apiData = {
      data_type: "LEGAL",
      nin: data.nin,
      driver_license_number: data.driverLicense || "",
      insuance_date: issuanceDate || "", // Backend has typo: "insuance_date" instead of "insurance_date"
      license_number_expiry_date: expiryDate || "",
    };

    console.log('🚀 Sending to API:', apiData);
    console.log('🆔 Using rider ID:', riderId);

    // Call the onboarding API
    submitStage(
      { riderId, data: apiData },
      {
        onSuccess: (response) => {
          console.log('✅ Legal & licensing info submitted successfully:', response.data);

          // Update localStorage with new data + progress
          const existingData = JSON.parse(localStorage.getItem('riderRegistration') || '{}');
          localStorage.setItem('riderRegistration', JSON.stringify({
            ...existingData,
            nin: data.nin,
            driverLicense: data.driverLicense,
            hasNoLicense: data.hasNoLicense,
            issuanceYear: data.issuanceYear,
            issuanceMonth: data.issuanceMonth,
            issuanceDay: data.issuanceDay,
            expiryYear: data.expiryYear,
            expiryMonth: data.expiryMonth,
            expiryDay: data.expiryDay,
            currentStep: 'document-upload',
            timestamp: new Date().toISOString(),
          }));

          // Navigate to document upload
          navigate('/riders-management/add-rider/document-upload');
        },
        onError: (error) => {
          console.error('❌ Legal & licensing submission failed:', error);
          console.error('❌ Error response:', error.response);
          console.error('❌ Error data:', error.response?.data);
          // Errors logged to console only, no alerts
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-poppins">
      <div className="w-full max-w-2xl ">
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
          <div className="h-2 w-16 bg-[#EB4827] rounded-full"></div>
          <div className="h-2 w-16 bg-gray-300 rounded-full"></div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[#343C6A] mb-2">Legal and Licensing Details</h2>
          <p className="text-gray-600">Your national ID and license details will be kept private</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Identification Number (NIN) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Identification Number (NIN) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('nin', {
                required: 'NIN is required',
                pattern: {
                  value: /^[0-9]{11}$/,
                  message: 'NIN must be 11 digits',
                },
              })}
              placeholder="Enter your NIN"
              maxLength={11}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.nin ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.nin && (
              <p className="mt-1 text-sm text-red-500">{errors.nin.message}</p>
            )}
          </div>

          {/* Driver License Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Driver License Number {!hasNoLicense && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              {...register('driverLicense', {
                required: !hasNoLicense && 'Driver license number is required',
                minLength: {
                  value: 18,
                  message: 'Driver license must be 18 characters',
                },
                maxLength: {
                  value: 18,
                  message: 'Driver license must be 18 characters',
                },
              })}
              placeholder="Your Driver License"
              maxLength={18}
              disabled={hasNoLicense}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.driverLicense ? 'border-red-500' : 'border-gray-300'
                } ${hasNoLicense ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            <p className="mt-1 text-xs text-gray-500">
              Each driver's license holder in Nigeria has a unique driver number, which is 18 characters long
            </p>
            {errors.driverLicense && (
              <p className="mt-1 text-sm text-red-500">{errors.driverLicense.message}</p>
            )}

            {/* Checkbox for no license */}
            <div className="mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('hasNoLicense')}
                  className="w-4 h-4 rounded border-gray-300 text-[#EB4827]"
                />
                <span className="text-sm text-gray-700">I don't have a valid Driver License</span>
              </label>
            </div>
          </div>

          {/* Issuance Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issuance Date {!hasNoLicense && <span className="text-red-500">*</span>}
            </label>
            <div className="grid grid-cols-3 gap-4">
              <select
                {...register('issuanceYear', { required: !hasNoLicense && 'Year is required' })}
                disabled={hasNoLicense}
                className={`px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${hasNoLicense ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  }`}
              >
                <option value="">Year</option>
                {Array.from({ length: 30 }, (_, i) => 2024 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                {...register('issuanceMonth', { required: !hasNoLicense && 'Month is required' })}
                disabled={hasNoLicense}
                className={`px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${hasNoLicense ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  }`}
              >
                <option value="">Month</option>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, idx) => (
                  <option key={month} value={idx + 1}>{month}</option>
                ))}
              </select>
              <select
                {...register('issuanceDay', { required: !hasNoLicense && 'Day is required' })}
                disabled={hasNoLicense}
                className={`px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${hasNoLicense ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  }`}
              >
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            {(errors.issuanceYear || errors.issuanceMonth || errors.issuanceDay) && (
              <p className="mt-1 text-sm text-red-500">Please select complete issuance date</p>
            )}
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date {!hasNoLicense && <span className="text-red-500">*</span>}
            </label>
            <div className="grid grid-cols-3 gap-4">
              <select
                {...register('expiryYear', { required: !hasNoLicense && 'Year is required' })}
                disabled={hasNoLicense}
                className={`px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${hasNoLicense ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  }`}
              >
                <option value="">Year</option>
                {Array.from({ length: 20 }, (_, i) => 2024 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                {...register('expiryMonth', { required: !hasNoLicense && 'Month is required' })}
                disabled={hasNoLicense}
                className={`px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${hasNoLicense ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  }`}
              >
                <option value="">Month</option>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, idx) => (
                  <option key={month} value={idx + 1}>{month}</option>
                ))}
              </select>
              <select
                {...register('expiryDay', { required: !hasNoLicense && 'Day is required' })}
                disabled={hasNoLicense}
                className={`px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${hasNoLicense ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  }`}
              >
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            {(errors.expiryYear || errors.expiryMonth || errors.expiryDay) && (
              <p className="mt-1 text-sm text-red-500">Please select complete expiry date</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/riders-management/add-rider/personal-info')}
              className="flex-1 cursor-pointer px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
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

export default LegalLicensing;