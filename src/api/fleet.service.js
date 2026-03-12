// import api from "./axios";

// // Fleet Profile
// export const createFleetProfile = (payload) => {
//   return api.post("/fleet/profile/", payload);
// };

// export const getFleetProfile = () => {
//   return api.get("/fleet/profile/");
// };

// // Vehicles
// export const addVehicle = (data) => {
//   return api.post("/fleet/vehicle/add/", data);
// };

// export const listVehicles = (params) => {
//   return api.get("/fleet/vehicle/list/", { params });
// };

// export const getVehicle = (id) => {
//   return api.get(`/fleet/vehicle/${id}/`);
// };

// export const assignVehicleToRider = (data) => {
//   return api.post("/fleet/vehicle/assign/", data);
// };


import api from "./axios";

// Simple GET for components that expect full axios response
export const getVehicles = () => {
  return api.get("/fleet/vehicles/");
};

export const createVehicle = (data) => {
  // POST to the list-create endpoint.
  // If data is FormData, do not set Content-Type so the browser sets the multipart boundary.
  const isForm = typeof FormData !== "undefined" && data instanceof FormData;
  if (isForm) {
    return api.post("/fleet/vehicles/", data);
  }
  return api.post("/fleet/vehicles/", data);
};

export const getDashboardMetrics = async () => {
  const response = await api.get('/fleet/dashboard');
  return response.data;
};

export const getAllVehicles = async () => {
  const response = await api.get('/fleet/vehicles/');
  return response.data;
};

// Assign a rider to a vehicle
export const assignVehicleToRider = (data) => {
  if (!data || (!data.rider_id && data.rider_id !== 0) || (!data.vehicle_id && data.vehicle_id !== 0)) {
    return Promise.reject(new Error("Both rider_id and vehicle_id are required for assignment"));
  }
  return api.post("/fleet/vehicles/assign/", data);
};

export const getOngoingOrders = async () => {
  const response = await api.get('/bookings/v1/bookings/requests/');
  return response.data;
};

// Update a vehicle
export const updateVehicle = (id, data) => {
  if (!id && id !== 0) {
    return Promise.reject(new Error("Vehicle id is required for update"));
  }
  // Backend endpoint: /fleet/vehicles/<id>/update/
  return api.put(`/fleet/vehicles/${id}/update/`, data);
};

// Delete a vehicle
export const deleteVehicle = (id) => {
  if (!id && id !== 0) {
    return Promise.reject(new Error("Vehicle id is required for deletion"));
  }
  // Backend endpoint: /fleet/vehicles/<id>/delete/
  return api.delete(`/fleet/vehicles/${id}/delete/`);
};

/**
 * GET PRESIGNED URL FOR VEHICLE FILE UPLOAD
 * POST /common/v1/files/uploads/
 * Returns presigned S3 URL and asset_id for uploading vehicle files
 */
export const getVehiclePresignedUrl = ({ filename, filesize, use_case, vehicle_id }) => {
  const payload = {
    filename,
    filesize,
    use_case,
  };
  if (vehicle_id) {
    payload.vehicle_id = vehicle_id;
  }
  return api.post('/common/v1/files/uploads/', payload);
};

/**
 * UPLOAD FILE TO S3
 * PUT to presigned URL
 * Uploads file directly to S3 using presigned URL
 */
export const uploadToS3 = async (presignedUrl, file) => {
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
