import { useMutation } from "@tanstack/react-query";
import { registerUser, verifyEmailOtp, resendEmailOtp, loginUser } from "./auth";


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


  