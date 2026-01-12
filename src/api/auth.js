import api from "./axios";

//Register User
export const registerUser = (data) => {
  return api.post("/users/v1/register/", data);
}

// Verify Email OTP
export const verifyEmailOtp = (data) => {
  return api.post("/users/v1/email/verify/", data);
}

//resend email otp
export const resendEmailOtp = (data) => {
  return api.post("/users/v1/resend/otp/email/", data);
}

// Login User
export const loginUser = (data) => {
  return api.post("/users/v1/login/", data);
}

// Refresh Token
export const refreshToken = (refresh) => {
  return api.post("/users/v1/refresh-token/", {refresh});
}

