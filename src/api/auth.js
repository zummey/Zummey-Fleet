import api from "./axios";

//Register User
export const registerUser = (data) => {
  return api.post("/users/v1/register", data);
}

// Login User
export const loginUser = (data) => {
  return api.post("/users/v1/login", data);
}

// Refresh Token
export const refreshToken = () => {
  return api.post("/users/v1/refresh-token");
}