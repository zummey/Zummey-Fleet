import React from 'react'
import { useForm } from "react-hook-form";
import logo from "../../assets/logo.png";
import line from "../../assets/line.png";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm();
  
    const onSubmit = (data) => console.log(data);
  
    return (
      <div className="signup-container flex justify-center items-center h-screen"> 
        <div className="signup-wrapper w-[70%]">
          <div className="signup-cen flex flex-col items-center gap-3 font-poppins">
            <img src={logo} alt="Zummey Logo" className="w-[60px] ml-5" />
            <h4 className="font-semibold text-[1.2rem]">Log In</h4>
            <div className="google flex items-center justify-center gap-1 bg-[#F7F7F8] w-[100%] py-2.5 rounded-lg cursor-pointer">
              <FcGoogle />
              <p>Google</p>
            </div>
            <div className="or flex items-center gap-3">
              <img src={line} alt="" />
              <p className="font-semibold">Or</p>
              <img src={line} alt="" />
            </div>
          </div>
  
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 font-primary font-medium">
            <div className="email form-inner">
              <label htmlFor="email">Email Address</label>
              <input type="email" name="email" placeholder="example@gmail.com" id="email" className="signin-input"/>
            </div>
            <div className="password form-inner">
              <label htmlFor="password">Password</label>
              <input type="password" name="password" placeholder="Input Password" id="password" className="signin-input"/>
            </div>
            <div className="terms mt-4 mb-4 flex">
              <input type="checkbox" name="terms" id="terms" className=""/>
              <label htmlFor="terms" className="ml-2 flex justify-between w-[100%]">
                <span className="text-primary cursor-pointer">
                  Remember me
                </span>
                <span className="text-secondary cursor-pointer">
                  Reset Password?
                </span>
              </label>
            </div>
  
            <button type="submit" className="mb-4 bg-primary w-[100%] text-white rounded-lg py-2.5 cursor-pointer font-semibold">Sign Up</button>
          </form>
  
          <p className="text-center">
            Already have an account?{" "}
            <span className="text-secondary">Log in</span>
          </p>
        </div>
      </div>
    );
}

export default Login