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

// Vehicles (returns normalized array)
export const getAllVehicles = async () => {
  const response = await api.get("/fleet/vehicles/");
  console.log("API Response:", response.data);
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.responseDetails?.results && Array.isArray(data.responseDetails.results)) return data.responseDetails.results;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
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