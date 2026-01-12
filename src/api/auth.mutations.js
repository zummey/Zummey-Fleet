import { useMutation } from "@tanstack/react-query";
import { registerUser, loginUser, verifyEmailOtp, resendEmailOtp } from "./auth";


//SIGN UP MUTATION
export const useRegister = () => 
  useMutation({
    mutationFn: registerUser,
  });


//LOGIN MUTATION
export const useLogin = () => 
  useMutation({
    mutationFn: loginUser,
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