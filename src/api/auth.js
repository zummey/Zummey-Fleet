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
  return api.post("/users/v1/refresh-token/", { refresh });
}

/**
 * FORGOT PASSWORD — INITIATE (send OTP to email)
 * POST /users/v1/initiate/forgot/password/
 */
export const forgotPassword = (data) => {
  return api.post("/users/v1/initiate/forgot/password/", data);
};

/**
 * FORGOT PASSWORD — VERIFY OTP
 * POST /users/v1/verify/otp/password/
 * Body: { email, otp_token }
 */
export const verifyForgotPasswordOtp = (data) => {
  return api.post("/users/v1/verify/otp/password/", data);
};

/**
 * FORGOT PASSWORD — RESET PASSWORD
 * PUT /users/v1/reset/password/
 * Body: { email, new_password }
 */
export const resetPassword = (data) => {
  return api.put("/users/v1/reset/password/", data);
};

/**
 * LOGOUT
 * POST /users/v1/logout/
 * Authorization: Bearer <access_token>  (sent automatically by axios interceptor)
 * Body: { refresh }
 */
export const logoutUser = (data) => {
  return api.post("/users/v1/logout/", data);
};
