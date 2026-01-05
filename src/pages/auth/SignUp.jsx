import React, { useState } from "react";
import { useForm } from "react-hook-form";
import logo from "../../assets/logo.png";
import line from "../../assets/line.png";
import { FcGoogle } from "react-icons/fc";
import { FaEyeSlash } from "react-icons/fa6";
import { IoMdEye } from "react-icons/io";
import EmailVerificationModal from "../../components/Modal/EmailVerificationModal";
import EmailVerifiedScreen from "../../components/Modal/EmailVerifiedScreen";
import PasswordInput from "../../components/Ui/PasswordInput";

const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => console.log(data);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="signup-container flex justify-center items-center">
      {/* <EmailVerificationModal/> */}
      {/* <EmailVerifiedScreen/> */}
      <div className="signup-wrapper w-[70%]">
        <div className="signup-cen flex flex-col items-center gap-3 font-poppins">
          <img src={logo} alt="Zummey Logo" className="w-[60px] ml-5" />
          <h4 className="font-semibold text-[1.2rem]">Sign Up</h4>
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
          <div className="fullname form-inner">
            <label htmlFor="fullname">Full Name</label>
            <input type="text" name="fullname" id="fullname" placeholder="John Doe" className="signin-input "/>
          </div>
          <div className="email form-inner">
            <label htmlFor="email">Email Address</label>
            <input type="email" name="email" placeholder="example@gmail.com" id="email" className="signin-input"/>
          </div>
          <div className="company form-inner">
            <label htmlFor="companyname">Company/Fleet Name</label>
            <input type="text" name="companyname" placeholder="John doe fleet" id="companyname" className="signin-input"/>
          </div>
          <div className="number form-inner">
            <label htmlFor="phonenum">Phone number</label>
            <input type="tel" name="phonenum" placeholder="234-xxxx-xxx" id="phonenum" className="signin-input"/>
          </div>
          <div className="password form-inner">
            <div className="pass-wrap relative">
              <PasswordInput
                label="Password"
                name="password"
                register={register}
                errors={errors}
                placeholder="Enter your password"
              />
            </div>
          </div>
          <div className="confirmpass form-inner">
            <PasswordInput
              label="Confirm Password"
              name="confirmpass"
              register={register}
              errors={errors}
              placeholder="Confirm Password"
            />       
          </div>
          <div className="terms mt-4 mb-4">
            <input type="checkbox" name="terms" id="terms" className=""/>
            <label htmlFor="terms" className="ml-2">
              By creating an account you agree to the{" "}
              <span className="text-secondary underline underline-offset-2 cursor-pointer">
                terms of use
              </span>{" "}
              and our{" "}
              <span className="text-secondary underline underline-offset-2 cursor-pointer">
                privacy policy
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
};

export default SignUp;
