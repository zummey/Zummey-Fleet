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
import { useRegister } from "../../api/auth.mutations";
import { useVerifyEmailOtp } from "../../api/auth.mutations";

const SignUp = () => {
  //code to clear form after submission

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const {
    mutate: registerUser,
    isPending,
    isError,
    error,
    isSuccess: isRegisterSuccess,
  } = useRegister();

  const { mutate: verifyEmail, isSuccess: isOtpVerified } = useVerifyEmailOtp();

  const [serverError, setServerError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const onSubmit = (formData) => {
    const payload = {
      user_type: "Fleet",
      email: formData.email,
      phone_number: formData.phone_number,
      password: formData.password,
      full_name: formData.full_name,
      company_name: formData.company_name,
    };

    registerUser(payload, {
      onSuccess: (response) => {
        console.log("Registration successful:", response);
        setRegisteredEmail(formData.email);
        reset();
      },
      onError: (error) => {
        console.error("Registration failed:", error.response?.data);
        setServerError(
          error.response?.data?.responseMessage || "Registration failed",
        );
      },
    });
  };

  return (
    <div className="signup-container flex justify-center items-center">
      {/*  */}
      {isRegisterSuccess && registeredEmail && !isOtpVerified && (
        <EmailVerificationModal
          email={registeredEmail}
          onVerify={verifyEmail}
          isLoading={isVerifying}
        />
      )}

      {isOtpVerified && <EmailVerifiedScreen />}

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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-5 font-primary font-medium"
        >
          <div className="fullname form-inner">
            <label htmlFor="fullname">Full Name</label>
            <input
              type="text"
              id="fullname"
              placeholder="John Doe"
              className="signin-input"
              {...register("full_name", { required: "Full Name is required" })}
            />
            <p className="text-red-500">{errors.full_name?.message}</p>
          </div>
          <div className="email form-inner">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              id="email"
              className="signin-input"
              {...register("email", { required: "Email is required" })}
            />
            <p className="text-red-500">{errors.email?.message}</p>
          </div>
          <div className="company form-inner">
            <label htmlFor="companyname">Company/Fleet Name</label>
            <input
              type="text"
              placeholder="John doe fleet"
              id="companyname"
              className="signin-input"
              {...register("company_name", {
                required: "Company/Fleet Name is required",
              })}
            />
            <p className="text-red-500">{errors.company_name?.message}</p>
          </div>
          <div className="number form-inner">
            <label htmlFor="phonenum">Phone number</label>
            <input
              type="tel"
              placeholder="234-xxxx-xxx"
              id="phonenum"
              className="signin-input"
              {...register("phone_number", {
                required: "Phone Number is required",
              })}
            />
            <p className="text-red-500">{errors.phone_number?.message}</p>
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
              rules={{
                validate: (value) =>
                  value === watch("password") || "Passwords do not match",
              }}
            />
          </div>
          <div className="terms mt-4 mb-4">
            <input
              type="checkbox"
              name="terms"
              id="terms"
              {...register("terms", {
                required: "You must agree to the terms and conditions",
              })}
              className=""
            />
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
            {errors.terms && (
              <p className="text-red-500">{errors.terms.message}</p>
            )}
          </div>

          {isError && (
            <p className="text-red-500 mb-4">
              {serverError || "An error occurred during registration."}
            </p>
          )}

          {isPending ? (
            <button
              type="submit"
              disabled={isPending}
              className="mb-4 bg-primary w-[100%] text-white rounded-lg py-2.5 cursor-pointer font-semibold"
            >
              Signing Up...
            </button>
          ) : (
            <button
              type="submit"
              className="mb-4 bg-primary w-[100%] text-white rounded-lg py-2.5 cursor-pointer font-semibold"
            >
              Sign Up
            </button>
          )}

          {/* <button
            type="submit"
            className="mb-4 bg-primary w-[100%] text-white rounded-lg py-2.5 cursor-pointer font-semibold"
          >
            Sign Up
          </button> */}
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
