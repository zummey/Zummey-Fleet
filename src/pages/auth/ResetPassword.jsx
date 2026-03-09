import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useForgotPassword } from "../../api/auth.mutations";
import ForgotPasswordOtpModal from "../../components/Modal/ForgotPasswordOtpModal";

/**
 * ResetPassword — Step 1
 * User enters their email → backend sends OTP →
 * OTP modal appears → on success, navigate to /reset_main?email=...
 */
const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);

  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    forgotPassword(
      { email },
      {
        onSuccess: (res) => {
          console.log("🔑 Forgot Password Response:", res?.data);
          setShowOtpModal(true);
        },
        onError: (err) => {
          const msg =
            err?.response?.data?.response_message ||
            err?.response?.data?.responseMessage ||
            "Something went wrong. Please try again.";
          setError(msg);
        },
      }
    );
  };

  // Called by ForgotPasswordOtpModal after OTP is verified
  const handleOtpVerified = (verifiedEmail) => {
    setShowOtpModal(false);
    // Pass email via query param so ResetPasswordMain can use it
    navigate(`/reset_main?email=${encodeURIComponent(verifiedEmail)}`);
  };

  return (
    <>
      <div className="reset-container h-screen flex justify-center items-center bg-gray-50">
        <div className="reset-wrapper text-center flex flex-col items-center w-[90%] max-w-md gap-5 bg-white rounded-2xl shadow-lg p-10">
          <img src={logo} alt="Zummey Logo" className="w-12" />
          <div>
            <h1 className="font-poppins text-[1.3rem] font-semibold text-[#1E2A5E]">
              Reset Password
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter your email and we'll send you a reset code.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full text-left space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="example@gmail.com"
                className="signin-input w-full"
              />
              {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary text-white rounded-lg py-3 font-semibold text-sm cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Sending code..." : "Send Reset Code"}
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

      {/* OTP Modal — shown after email submission succeeds */}
      {showOtpModal && (
        <ForgotPasswordOtpModal
          email={email}
          onVerified={handleOtpVerified}
        />
      )}
    </>
  );
};

export default ResetPassword;