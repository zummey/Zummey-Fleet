import React from "react";
import logo from "../../assets/logo.png";
import { useForm } from "react-hook-form";
import PasswordResetModalMain from "../../components/Modal/PasswordResetModalMain";
import PasswordInput from "../../components/Ui/PasswordInput";

const ResetPasswordMain = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => console.log(data);
  return (
    <div className="reset-container  h-screen flex justify-center items-center">
      {/* <PasswordResetModalMain/> */}
      <div className="reset-wrapper  text-center flex flex-col items-center w-[50%]  gap-5">
        <img src={logo} alt="" />
        <h1 className="font-poppins text-[1.1rem] font-semibold">
          Reset Password
        </h1>

        <div className="email form-inner w-[70%] text-left">
          <PasswordInput
            label="New Password"
            name="confirmpass"
            register={register}
            errors={errors}
            placeholder="Confirm Password"
          />
        </div>
        <div className="email form-inner w-[70%] text-left">
          <PasswordInput
            label="Confirm New Password"
            name="confirmpass"
            register={register}
            errors={errors}
            placeholder="Confirm Password"
          />
        </div>
        <button
          type="submit"
          className="mb-4 bg-primary w-[70%] text-white rounded-lg py-2.5 cursor-pointer font-semibold text-[.8rem]"
        >
          Reset Your Password
        </button>
        <div className="remember-return flex gap-4 text-[0.9rem]">
          <p>Remember Password?</p>
          <p className="cursor-pointer text-secondary">Return to Login</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordMain;
