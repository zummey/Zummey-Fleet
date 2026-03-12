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

export const getOngoingOrders = async () => {
  const response = await api.get('/fleet/riders/booking/requests/');
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
