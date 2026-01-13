import React, { use, useEffect, useState } from "react";
import checkmail from "../../assets/checkmail.png";
import EmailVerifiedScreen from "./EmailVerifiedScreen";
import { useVerifyEmailOtp, useResendEmailOtp } from "../../api/auth.mutations";

const EmailVerificationModal = ({ email }) => {
  const [otpValues, setOtpValues] = useState(["", "", "", ""]);
  const [isOtpComplete, setIsOtpComplete] = useState(false);
  const [counter, setCounter] = useState(30);
  const [status, setStatus] = useState(null); // success | error | null

  const { mutate: verifyOtp, isPending, isSuccess } = useVerifyEmailOtp();
  const { mutate: resendOtp } = useResendEmailOtp();

  /* ================= OTP INPUT LOGIC ================= */
  useEffect(() => {
    console.log("Verifying email:", email);
  }, [email]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otpValues];
    updatedOtp[index] = value;
    setOtpValues(updatedOtp);

    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").slice(0, 4);
    if (/^\d{4}$/.test(pasted)) {
      setOtpValues(pasted.split(""));
      document.getElementById("otp-3").focus();
    }
  };

  /* ================= VERIFY OTP ================= */

  const handleVerify = () => {
    const otp_token = otpValues.join("");

    if (otp_token.length !== 4) return;

    verifyOtp(
      { email, otp_token },
      {
        onSuccess: () => {
          setStatus("success");
          // onVerified?.(); // move to next screen
        },
        onError: (error) => {
          console.error("Otp verification failed:", error.response?.data);
          setStatus("error");
        },
      },
    );
  };

  /* ================= RESEND OTP ================= */

  const handleResend = () => {
    resendOtp(
      { email },
      {
        onSuccess: (response) => {
          console.log("Otp resent successfully:", response);
          // onVerified?.(); // move to next screen
        },
        onError: (error) => {
          console.error(
            "Resend Otp verification failed:",
            error.response?.data,
          );
        },
      },
    );
    setCounter(30);
  };

  /* ================= EFFECTS ================= */

  useEffect(() => {
    setIsOtpComplete(otpValues.every((v) => v.length === 1));
  }, [otpValues]);

  useEffect(() => {
    if (counter > 0) {
      const timer = setInterval(() => setCounter((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [counter]);

  /* ================= UI ================= */

  return (
    <>
      {isSuccess ? (
        <EmailVerifiedScreen />
      ) : (
        <div className="inset-0 z-10 flex items-center justify-center h-screen fixed">
          <div className="absolute inset-0 bg-black opacity-30"></div>

          <div className="bg-white z-20 w-[35%] rounded-lg p-6 text-center font-poppins">
            <img src={checkmail} className="mx-auto mb-4" alt="check mail" />

            <h1 className="text-lg font-semibold mb-2">Enter OTP</h1>
            <p className="text-sm text-gray-500 mb-6">
              We sent a 4-digit code to <b>{email}</b>
            </p>

            {status === "error" && (
              <p className="text-red-500 mb-3">Invalid or expired OTP</p>
            )}

            <div className="flex justify-center gap-3 mb-5">
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  value={value}
                  maxLength={1}
                  type="text"
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className={`w-[50px] h-[50px] text-center text-xl border rounded-md focus:outline-primary ${isSuccess && "border-green-500"} ${status === "error" ? "border-red-500" : "border-gray-300"}`}
                />
              ))}
            </div>

            {isSuccess && (
              <p className="text-green-500 mb-3">
                Email verified successfully!
              </p>
            )}

            <button
              disabled={!isOtpComplete || isPending}
              onClick={handleVerify}
              className={`w-full py-2 rounded-lg text-white ${
                isOtpComplete ? "bg-primary" : "bg-gray-400"
              } ${isPending ? "cursor-not-allowed" : "cursor-pointer"} `}
            >
              {isPending ? "Verifying..." : "Verify"}
            </button>

            <div className="mt-4 text-sm">
              {counter > 0 ? (
                <span>Resend in {counter}s</span>
              ) : (
                <span
                  className="text-primary cursor-pointer"
                  onClick={handleResend}
                >
                  Resend OTP
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default EmailVerificationModal;
