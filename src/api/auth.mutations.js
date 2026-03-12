import { useMutation } from "@tanstack/react-query";
import {
  registerUser,
  verifyEmailOtp,
  resendEmailOtp,
  loginUser,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
  logoutUser,
} from "./auth";

//SIGN UP MUTATION
export const useRegister = () =>
  useMutation({
    mutationFn: registerUser,
  });

//Verify Email OTP MUTATION
export const useVerifyEmailOtp = () =>
  useMutation({
    mutationFn: verifyEmailOtp,
  });

// Resend email otp
export const useResendEmailOtp = () =>
  useMutation({
    mutationFn: resendEmailOtp,
  });

//LOGIN MUTATION
export const useLogin = () =>
  useMutation({
    mutationFn: loginUser,
  });

// FORGOT PASSWORD — INITIATE (sends OTP to email)
export const useForgotPassword = () =>
  useMutation({
    mutationFn: forgotPassword,
  });

// FORGOT PASSWORD — VERIFY OTP
export const useVerifyForgotPasswordOtp = () =>
  useMutation({
    mutationFn: verifyForgotPasswordOtp,
  });

// FORGOT PASSWORD — RESET PASSWORD
export const useResetPassword = () =>
  useMutation({
    mutationFn: resetPassword,
  });

// LOGOUT
export const useLogout = () =>
  useMutation({
    mutationFn: logoutUser,
  });