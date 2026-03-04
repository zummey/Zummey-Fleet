import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Upload, X, FileText, Edit2, Trash2 } from 'lucide-react';
import Logo from '../../../assets/logo.png';
import RegistrationCompleteModal from '../modals/RegistrationCompleteModal';
import { useSubmitRiderStage, useGetPresignedUrl, useUploadToS3 } from '../../../api/authRiders.mutations';
import { useQueryClient } from '@tanstack/react-query';

const DocumentUpload = () => {
  const navigate = useNavigate();
  const [riderId, setRiderId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // State for uploaded files
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [licenseFront, setLicenseFront] = useState(null);
  const [licenseBack, setLicenseBack] = useState(null);
  const [transportLicense, setTransportLicense] = useState(null);

  // State for asset IDs from S3 uploads
  const [assetIds, setAssetIds] = useState({
    profilePhoto: null,
    licenseFront: null,
    licenseBack: null,
    transportLicense: null
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // React Query
  const queryClient = useQueryClient();
  const { mutate: submitStage, isPending: isSubmitting } = useSubmitRiderStage();
  const { mutateAsync: getPresignedUrlAsync } = useGetPresignedUrl();
  const { mutateAsync: uploadToS3Async } = useUploadToS3();

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

    // Load expiry date fields (only for front and transport license)
    if (existingData.licenseFrontYear) setValue('licenseFrontYear', existingData.licenseFrontYear);
    if (existingData.licenseFrontMonth) setValue('licenseFrontMonth', existingData.licenseFrontMonth);
    if (existingData.licenseFrontDay) setValue('licenseFrontDay', existingData.licenseFrontDay);

    if (existingData.transportLicenseYear) setValue('transportLicenseYear', existingData.transportLicenseYear);
    if (existingData.transportLicenseMonth) setValue('transportLicenseMonth', existingData.transportLicenseMonth);
    if (existingData.transportLicenseDay) setValue('transportLicenseDay', existingData.transportLicenseDay);

    // Note: Files cannot be restored from localStorage
    // User will need to re-upload if they resume at this step
  }, [setValue]);

  const handleFileUpload = (e, setFile) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPG, JPEG, and PNG files are allowed');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setFile({
          file,
          preview: reader.result,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteFile = (setFile) => {
    setFile(null);
  };

  /**
   * Upload a single file to S3
   * 1. Get presigned URL from backend
   * 2. Upload file to S3 using presigned URL
   * 3. Return asset_id
   */
  const uploadFileToS3 = async (file, useCase) => {
    try {
      console.log(`📤 Uploading ${useCase}:`, file.name, `(${file.size} bytes)`);

      // Step 1: Get presigned URL via React Query mutation
      const presignedResponse = await getPresignedUrlAsync({
        filename: file.name,
        filesize: file.size,
        use_case: useCase,
        rider_id: riderId,
      });

      // Log full response for debugging
      console.log(`📦 Presigned URL response for ${useCase}:`, presignedResponse.data);

      // Backend returns: responseDetails.asset_id + responseDetails.presigned_url
      const responseDetail = presignedResponse.data?.responseDetails;
      const assetId = responseDetail?.asset_id;
      const presignedUrl = responseDetail?.presigned_url;

      if (!assetId || !presignedUrl) {
        console.error('❌ Invalid presigned URL response:', presignedResponse.data);
        throw new Error(`Missing assetId or presignedUrl for ${useCase}`);
      }

      console.log(`✅ Got presigned URL for ${useCase}, assetId: ${assetId}`);

      // Step 2: Upload file bytes to S3 via React Query mutation
      await uploadToS3Async({ presignedUrl, file });
      console.log(`✅ S3 upload done for ${useCase}`);

      return assetId;
    } catch (error) {
      console.error(`❌ Upload failed for ${useCase}:`, error);
      throw error;
    }
  };

  const onSubmit = async (data) => {
    // Validate all required files are uploaded
    if (!profilePhoto) {
      console.error('❌ Profile photo is required');
      return;
    }
    if (!licenseFront) {
      console.error('❌ Driver license (front) is required');
      return;
    }
    if (!licenseBack) {
      console.error('❌ Driver license (back) is required');
      return;
    }
    if (!transportLicense) {
      console.error('❌ Transport operator license is required');
      return;
    }

    if (!riderId) {
      console.error('❌ Cannot submit: No rider ID available');
      return;
    }

    console.log('📝 Document upload data:', data);
    console.log('📷 Files:', { profilePhoto, licenseFront, licenseBack, transportLicense });

    try {
      // Upload all files to S3 and get asset IDs
      setUploadProgress('Uploading profile photo...');
      const profilePhotoId = await uploadFileToS3(profilePhoto.file, 'RIDER_PROFILE_PIC');

      setUploadProgress('Uploading driver license (front)...');
      const licenseFrontId = await uploadFileToS3(licenseFront.file, 'RIDER_DRIVER_LICENSE_FRONT');

      setUploadProgress('Uploading driver license (back)...');
      const licenseBackId = await uploadFileToS3(licenseBack.file, 'RIDER_DRIVER_LICENSE_BACK');

      setUploadProgress('Uploading transport operator license...');
      const transportLicenseId = await uploadFileToS3(transportLicense.file, 'RIDER_TRANSPORT_OPERATOR_LICENSE');

      console.log('✅ All files uploaded successfully');
      console.log('🆔 Asset IDs:', {
        profilePhotoId,
        licenseFrontId,
        licenseBackId,
        transportLicenseId
      });

      // Format dates as YYYY-MM-DD
      const formatDate = (year, month, day) => {
        if (!year || !month || !day) return null;
        const paddedMonth = String(month).padStart(2, '0');
        const paddedDay = String(day).padStart(2, '0');
        return `${year}-${paddedMonth}-${paddedDay}`;
      };

      const driverLicenseExpiryDate = formatDate(
        data.licenseFrontYear,
        data.licenseFrontMonth,
        data.licenseFrontDay
      );

      const transportOperatorExpiryDate = formatDate(
        data.transportLicenseYear,
        data.transportLicenseMonth,
        data.transportLicenseDay
      );

      // Transform data to match backend API format for DOCUMENTS stage
      const apiData = {
        data_type: "DOCUMENTS",
        transport_operator_expiry_date: transportOperatorExpiryDate || "",
        driver_license_expiry_date: driverLicenseExpiryDate || "",
        profile_photo: profilePhotoId,
        transport_operator_license: transportLicenseId
        // Note: driver license front/back are auto-assigned by backend based on use_case
      };

      console.log('🚀 Sending to onboarding API:', apiData);
      console.log('🆔 Using rider ID:', riderId);

      setUploadProgress('Completing registration...');

      // Submit to onboarding endpoint
      submitStage(
        { riderId, data: apiData },
        {
          onSuccess: (response) => {
            console.log('✅ Document stage submitted successfully:', response.data);

            // Invalidate riders list so RidersManagement refreshes immediately
            queryClient.invalidateQueries({ queryKey: ['riders'] });

            // Clean up registration data from localStorage
            localStorage.removeItem('riderRegistration');

            setUploadProgress('');
            // Show success modal immediately
            setShowSuccessModal(true);
          },
          onError: (error) => {
            console.error('❌ Document stage submission failed:', error);
            console.error('❌ Error response:', error.response);
            console.error('❌ Error data:', error.response?.data);
            setUploadProgress('');
            // Errors logged to console only, no alerts
          },
        }
      );
    } catch (error) {
      console.error('❌ File upload failed:', error);
      setUploadProgress('');
      // Error already logged in uploadFileToS3
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Navigate to riders list
    navigate('/riders-management');
  };

  const FileUploadCard = ({
    title,
    file,
    onUpload,
    onDelete,
    expiryFields,
    register,
    errors
  }) => (
    <div className="border border-gray-300 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {title} <span className="text-red-500">*</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Upload a good quality passport-format of yourself with a light background
          </p>
        </div>
      </div>

      {!file ? (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#EB4827] transition-colors bg-gray-50">
          <Upload size={32} className="text-gray-400 mb-2" />
          <span className="text-sm text-gray-600 font-medium">Upload File</span>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={(e) => onUpload(e)}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FileText size={24} className="text-[#EB4827]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <Edit2 size={18} className="text-[#EB4827] hover:text-[#d63f1f]" />
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => onUpload(e)}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={onDelete}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Preview */}
          <img
            src={file.preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )}

      {/* Expiry Date Fields */}
      {expiryFields && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <select
              {...register(`${expiryFields}Year`, { required: 'Year required' })}
              className="px-3 py-2 text-sm border rounded-lg focus:outline-none bg-white"
            >
              <option value="">Year</option>
              {Array.from({ length: 20 }, (_, i) => 2024 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              {...register(`${expiryFields}Month`, { required: 'Month required' })}
              className="px-3 py-2 text-sm border rounded-lg focus:outline-none bg-white"
            >
              <option value="">Month</option>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => (
                <option key={month} value={idx + 1}>{month}</option>
              ))}
            </select>
            <select
              {...register(`${expiryFields}Day`, { required: 'Day required' })}
              className="px-3 py-2 text-sm border rounded-lg focus:outline-none bg-white"
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          {(errors[`${expiryFields}Year`] || errors[`${expiryFields}Month`] || errors[`${expiryFields}Day`]) && (
            <p className="mt-1 text-xs text-red-500">Complete date required</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className=" bg-gray-50  px-6 font-poppins">
      <div className="max-w-4xl mx-auto">
        <div className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <img src={Logo} alt="Zummey Logo" className="w-12 h-12 object-contain" />
              <span className="text-2xl font-bold text-[#343C6A]">Zummey</span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-2 w-16 bg-[#EB4827] rounded-full"></div>
            <div className="h-2 w-16 bg-[#EB4827] rounded-full"></div>
            <div className="h-2 w-16 bg-[#EB4827] rounded-full"></div>
            <div className="h-2 w-16 bg-[#EB4827] rounded-full"></div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[#343C6A] mb-2">Document Details</h2>
            <p className="text-gray-600">
              Only valid documents scans and good quality photos are accepted
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Photo */}
            <FileUploadCard
              title="Profile Photo"
              file={profilePhoto}
              onUpload={(e) => handleFileUpload(e, setProfilePhoto)}
              onDelete={() => handleDeleteFile(setProfilePhoto)}
            />

            {/* Driver's License (front) */}
            <FileUploadCard
              title="Driver's License (front)"
              file={licenseFront}
              onUpload={(e) => handleFileUpload(e, setLicenseFront)}
              onDelete={() => handleDeleteFile(setLicenseFront)}
              expiryFields="licenseFront"
              register={register}
              errors={errors}
            />

            {/* Driver's License (back) */}
            <FileUploadCard
              title="Driver's License (back)"
              file={licenseBack}
              onUpload={(e) => handleFileUpload(e, setLicenseBack)}
              onDelete={() => handleDeleteFile(setLicenseBack)}
            />

            {/* Transport Operator License */}
            <FileUploadCard
              title="Transport Operator License"
              file={transportLicense}
              onUpload={(e) => handleFileUpload(e, setTransportLicense)}
              onDelete={() => handleDeleteFile(setTransportLicense)}
              expiryFields="transportLicense"
              register={register}
              errors={errors}
            />

            {/* Info Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> All owners of a car should have it. If the motorcycle or bike is
                not yours and you need to have a copy of the document from the owner.
              </p>
            </div>

            {/* Upload Progress Indicator */}
            {uploadProgress && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-blue-700 font-medium">{uploadProgress}</p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/riders-management/add-rider/legal-licensing')}
                className="cursor-pointer flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer flex-1 px-6 py-3 bg-[#001940] text-white rounded-lg font-medium hover:bg-[#001940] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || uploadProgress ? (uploadProgress || 'Uploading...') : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Registration Complete Modal */}
      <RegistrationCompleteModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default DocumentUpload;