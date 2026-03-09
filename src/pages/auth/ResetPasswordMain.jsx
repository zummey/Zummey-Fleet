import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useForm } from "react-hook-form";
import PasswordInput from "../../components/Ui/PasswordInput";
import { useResetPassword } from "../../api/auth.mutations";
import PasswordChangedSuccessModal from "../../components/Modal/PasswordChangedSuccessModal";

/**
 * ResetPasswordMain — Step 3
 * User sets a new password after OTP verification.
 * Reads email from ?email= query param (set by ResetPassword.jsx after OTP success).
 * Calls PUT /users/v1/reset/password/ with { email, new_password }.
 * On success: shows PasswordChangedSuccessModal.
 */
const ResetPasswordMain = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const { mutate: resetPassword, isPending } = useResetPassword();

  const onSubmit = (data) => {
    setApiError("");

    if (data.new_password !== data.confirm_password) {
      setApiError("Passwords do not match.");
      return;
    }

    resetPassword(
      { email, new_password: data.new_password },
      {
        onSuccess: () => {
          setShowSuccess(true);
        },
        onError: (err) => {
          const msg =
            err?.response?.data?.response_message ||
            err?.response?.data?.responseMessage ||
            "Password reset failed. Your session may have expired.";
          setApiError(msg);
        },
      }
    );
  };

  return (
    <>
      <div className="reset-container h-screen flex justify-center items-center bg-gray-50">
        <div className="reset-wrapper text-center flex flex-col items-center w-[90%] max-w-md gap-5 bg-white rounded-2xl shadow-lg p-10">
          <img src={logo} alt="Zummey Logo" className="w-12" />
          <div>
            <h1 className="font-poppins text-[1.3rem] font-semibold text-[#1E2A5E]">
              Set New Password
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Choose a strong password for <b>{email}</b>
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full text-left space-y-4"
          >
            <PasswordInput
              label="New Password"
              name="new_password"
              register={register}
              errors={errors}
              placeholder="Enter new password"
              validation={{ required: "New password is required", minLength: { value: 6, message: "Minimum 6 characters" } }}
            />

            <PasswordInput
              label="Confirm New Password"
              name="confirm_password"
              register={register}
              errors={errors}
              placeholder="Confirm your new password"
              validation={{ required: "Please confirm your password" }}
            />

            {/* API-level error */}
            {apiError && (
              <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">
                {apiError}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary text-white rounded-lg py-3 font-semibold text-sm cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Updating password..." : "Reset Your Password"}
            </button>
          </form>

          <div className="flex gap-2 text-sm text-gray-500">
            <span>Remember your password?</span>
            <span
              className="cursor-pointer text-secondary font-medium hover:underline"
              onClick={() => navigate("/login")}
            >
              Return to Login
            </span>
          </div>
        </div>
      </div>

      {/* Success modal */}
      <PasswordChangedSuccessModal isOpen={showSuccess} />
    </>
  );
};

export default ResetPasswordMain;
