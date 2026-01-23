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