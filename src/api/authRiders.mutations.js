import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  registerRider,
  verifyRiderOTP,
  resendRiderOTP,
  submitRiderStage,
  getRiderStageProgress,
  getPresignedUrl,
  uploadToS3,
  fetchRiders,
  fetchRiderById,
  updateRider,
  deleteRider,
} from './authRiders';

/**
 * REGISTER RIDER MUTATION
 * Used in: Signup.jsx
 */
export const useRegisterRider = () => {
  return useMutation({
    mutationFn: registerRider,
    onSuccess: (response) => {
      console.log('✅ Rider registered successfully:', response.data);
      // OTP and password are in response.data.otp and response.data.password
    },
    onError: (error) => {
      console.error('❌ Registration failed:', error.response?.data || error.message);
    },
  });
};

/**
 * VERIFY RIDER OTP MUTATION
 * Used in: OTPModal.jsx
 */
export const useVerifyRiderOTP = () => {
  return useMutation({
    mutationFn: verifyRiderOTP,
    onSuccess: (response) => {
      console.log('✅ OTP verified successfully:', response.data);
    },
    onError: (error) => {
      console.error('❌ OTP verification failed:', error.response?.data || error.message);
    },
  });
};

/**
 * RESEND RIDER OTP MUTATION
 * Used in: OTPModal.jsx
 */
export const useResendRiderOTP = () => {
  return useMutation({
    mutationFn: resendRiderOTP,
    onSuccess: (response) => {
      console.log('✅ OTP resent successfully:', response.data);
    },
    onError: (error) => {
      console.error('❌ Resend OTP failed:', error.response?.data || error.message);
    },
  });
};

/**
 * SUBMIT RIDER STAGE MUTATION (PERSONAL, LEGAL, DOCUMENTS)
 * Used in: PersonalInfo.jsx, LegalLicensing.jsx, DocumentUpload.jsx
 */
export const useSubmitRiderStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitRiderStage,
    onSuccess: (_, variables) => {
      // Invalidate both caches so RiderRow sees fresh data when user returns to the list
      queryClient.invalidateQueries({ queryKey: ['riders'] });
      if (variables?.riderId) {
        queryClient.invalidateQueries({ queryKey: ['rider', variables.riderId] });
      }
    },
    onError: (error) => {
      console.error('❌ Stage submission failed:', error.response?.data || error.message);
    },
  });
};

/**
 * GET RIDER STAGE PROGRESS QUERY
 * Used to check which stage the rider is on when resuming
 */
export const useGetRiderStageProgress = (riderId) => {
  return useQuery({
    queryKey: ['riderStageProgress', riderId],
    queryFn: () => getRiderStageProgress(riderId),
    enabled: !!riderId, // Only run if riderId exists
  });
};

/**
 * GET ALL RIDERS QUERY
 * Used in: RidersManagement.jsx
 */
export const useGetRiders = () => {
  return useQuery({
    queryKey: ['riders'],
    queryFn: fetchRiders,
    select: (response) => response.data,  // unwrap axios response
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * GET SINGLE RIDER BY ID QUERY
 * Used in: RiderDetailsModal.jsx
 * Fetches the full rider record including license fields not returned by the list endpoint
 */
export const useGetRiderById = (riderId) => {
  return useQuery({
    queryKey: ['rider', riderId],
    queryFn: () => fetchRiderById(riderId),
    // The single-rider endpoint returns the flat rider object directly as response.data
    // (no responseCode/responseDetails wrapper, unlike the list endpoint)
    select: (response) => response.data,
    enabled: !!riderId,
    staleTime: 0, // always refetch so the incomplete indicator reacts immediately after stage completion
  });
};

/**
 * GET PRESIGNED URL MUTATION
 * Used in: DocumentUpload.jsx
 * Visible in React Query DevTools as 'getPresignedUrl'
 */
export const useGetPresignedUrl = () => {
  return useMutation({
    mutationKey: ['getPresignedUrl'],
    mutationFn: getPresignedUrl,
    onSuccess: (response) => {
      const detail = response.data?.responseDetail || response.data?.response_detail;
      const assetId = detail?.assetId || detail?.asset_id;
      console.log('✅ Presigned URL obtained, assetId:', assetId);
      console.log('📦 Full presigned response:', response.data);
    },
    onError: (error) => {
      console.error('❌ Failed to get presigned URL:', error.response?.data || error.message);
    },
  });
};

/**
 * UPLOAD FILE TO S3 MUTATION
 * Used in: DocumentUpload.jsx
 * Visible in React Query DevTools as 'uploadToS3'
 */
export const useUploadToS3 = () => {
  return useMutation({
    mutationKey: ['uploadToS3'],
    mutationFn: ({ presignedUrl, file }) => uploadToS3(presignedUrl, file),
    onSuccess: () => {
      console.log('✅ File uploaded to S3 successfully');
    },
    onError: (error) => {
      console.error('❌ S3 upload failed:', error.message);
    },
  });
};

/**
 * UPDATE RIDER MUTATION
 * PUT /fleet/riders/update/:id
 * Used in: RiderDetailsModal.jsx
 */
export const useUpdateRider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRider,
    onSuccess: (_, variables) => {
      // Refresh both the list and the cached single-rider record
      queryClient.invalidateQueries({ queryKey: ['riders'] });
      queryClient.invalidateQueries({ queryKey: ['rider', variables.id] });
    },
    onError: (error) => {
      console.error('❌ Rider update failed:', error.response?.data || error.message);
    },
  });
};

/**
 * DELETE RIDER MUTATION
 * Used in: RidersManagement.jsx
 */
export const useDeleteRider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRider,
    onSuccess: (response) => {
      console.log('✅ Rider deleted successfully:', response.data);
      // Invalidate riders query to refetch updated list
      queryClient.invalidateQueries({ queryKey: ['riders'] });
    },
    onError: (error) => {
      console.error('❌ Rider deletion failed:', error.response?.data || error.message);
    },
  });
};