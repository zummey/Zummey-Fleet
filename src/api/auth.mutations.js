import { useMutation } from "@tanstack/react-query";
import { registerUser, loginUser } from "./auth";


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