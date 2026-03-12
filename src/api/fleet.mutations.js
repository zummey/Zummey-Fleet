import { useMutation } from '@tanstack/react-query';
import {
  getVehiclePresignedUrl,
  uploadToS3,
} from './fleet.service';

/**
 * GET PRESIGNED URL MUTATION FOR VEHICLE FILES
 * Used in: AddVehicle.jsx
 * Visible in React Query DevTools as 'getVehiclePresignedUrl'
 */
export const useGetVehiclePresignedUrl = () => {
  return useMutation({
    mutationKey: ['getVehiclePresignedUrl'],
    mutationFn: getVehiclePresignedUrl,
    onSuccess: (response) => {
      const detail = response.data?.responseDetails || response.data?.response_detail;
      const assetId = detail?.asset_id || detail?.assetId;
      console.log('✅ Vehicle presigned URL obtained, assetId:', assetId);
      console.log('📦 Full presigned response:', response.data);
    },
    onError: (error) => {
      console.error('❌ Failed to get vehicle presigned URL:', error.response?.data || error.message);
    },
  });
};

/**
 * UPLOAD FILE TO S3 MUTATION FOR VEHICLE FILES
 * Used in: AddVehicle.jsx
 * Visible in React Query DevTools as 'uploadVehicleToS3'
 */
export const useUploadVehicleToS3 = () => {
  return useMutation({
    mutationKey: ['uploadVehicleToS3'],
    mutationFn: ({ presignedUrl, file }) => uploadToS3(presignedUrl, file),
    onSuccess: () => {
      console.log('✅ Vehicle file uploaded to S3 successfully');
    },
    onError: (error) => {
      console.error('❌ Vehicle S3 upload failed:', error.message);
    },
  });
};
