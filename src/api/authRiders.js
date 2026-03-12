import api from "./axios";

/**
 * RIDER REGISTRATION API
 * POST /fleet/riders/register/
 */
export const registerRider = (data) => {
    return api.post("/fleet/riders/register/", data);
};

/**
 * VERIFY RIDER EMAIL OTP
 * POST /fleet/riders/verify/email/
 */
export const verifyRiderOTP = (data) => {
    return api.post("/fleet/riders/verify/email/", data);
};

/**
 * RESEND RIDER EMAIL OTP
 * POST /fleet/riders/resend/otp/
 */
export const resendRiderOTP = (data) => {
    return api.post("/fleet/riders/resend/otp/", data);
};

/**
 * SUBMIT RIDER ONBOARDING STAGE (PERSONAL, LEGAL, DOCUMENTS)
 * PUT /fleet/riders/onboarding/:riderId
 * This endpoint handles all three stages based on data_type
 */
export const submitRiderStage = ({ riderId, data }) => {
    return api.put(`/fleet/riders/onboarding/${riderId}`, data);
};

/**
 * GET RIDER STAGE PROGRESS
 * GET /fleet/riders/stages/:riderId
 * Returns which stage the rider is currently on
 */
export const getRiderStageProgress = (riderId) => {
    return api.get(`/fleet/riders/stages/${riderId}`);
};

/**
 * GET PRESIGNED URL FOR FILE UPLOAD
 * POST /common/v1/files/uploads/
 * Returns presigned S3 URL and asset_id for uploading files
 */
export const getPresignedUrl = ({ filename, filesize, use_case, rider_id }) => {
    const payload = {
        filename,
        filesize,
        use_case,
    };
    if (rider_id) {
        payload.rider_id = rider_id;
    }
    return api.post('/common/v1/files/uploads/', payload);
};

/**
 * UPLOAD FILE TO S3
 * PUT to presigned URL
 * Uploads file directly to S3 using presigned URL
 */
export const uploadToS3 = async (presignedUrl, file) => {
    // Use native fetch for S3 upload (no auth headers needed)
    const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type,
        },
    });

    if (!response.ok) {
        throw new Error(`S3 upload failed: ${response.statusText}`);
    }

    return response;
};

/**
 * GET ALL RIDERS   
 * GET /fleet/riders/
 */
export const fetchRiders = () => {
    return api.get("/fleet/riders/");
};

/**
 * GET RIDER BY ID
 * GET /fleet/riders/:id/
 */
export const fetchRiderById = (id) => {
    return api.get(`/fleet/riders/${id}/`);
};

/**
 * UPDATE RIDER DETAILS
 * PUT /fleet/riders/:id/update/
 */
export const updateRider = ({ id, data }) => {
    return api.put(`/fleet/riders/update/${id}`, data);
};

/**
 * DELETE RIDER
 * DELETE /fleet/riders/delete/:id
 */
export const deleteRider = (id) => {
    return api.delete(`/fleet/riders/delete/${id}`);
};