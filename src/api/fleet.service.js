import api from "./axios";

// Fleet Profile
export const createFleetProfile = (data) => {
  return api.post("/fleet/create/", data);
};

export const getFleetProfile = () => {
  return api.get("/fleet/profile/");
};

// Vehicles
export const addVehicle = (data) => {
  return api.post("/fleet/vehicle/add/", data);
};

export const listVehicles = (params) => {
  return api.get("/fleet/vehicle/list/", { params });
};

export const getVehicle = (id) => {
  return api.get(`/fleet/vehicle/${id}/`);
};

export const assignVehicleToRider = (data) => {
  return api.post("/fleet/vehicle/assign/", data);
};
