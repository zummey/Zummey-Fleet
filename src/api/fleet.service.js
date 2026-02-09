import api from './axios'


export const getDashboardMetrics = async () => {
  const response = await api.get('/fleet/dashboard');
  return response.data;
};

export const getAllVehicles = async () => {
  const response = await api.get('/fleet/vehicles/');
  return response.data;
};

export const getOngoingOrders = async () => {
  const response = await api.get('/bookings/v1/bookings/requests/');
  return response.data;
}

export const createVehicle = (data) => {
  // POST to the list-create endpoint.
  // If data is FormData, do not set Content-Type so the browser sets the multipart boundary.
  const isForm = typeof FormData !== "undefined" && data instanceof FormData;
  if (isForm) {
    return api.post("/fleet/vehicles/", data);
  }
  return api.post("/fleet/vehicles/", data);
};