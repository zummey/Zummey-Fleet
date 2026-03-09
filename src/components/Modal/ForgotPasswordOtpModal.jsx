import { useEffect, useState } from "react";
import checkmail from "../../assets/checkmail.png";
import { useVerifyForgotPasswordOtp, useForgotPassword } from "../../api/auth.mutations";

/**
 * ForgotPasswordOtpModal
 * Shown after the user submits their email on ResetPassword.jsx.
 * Verifies the 4-digit OTP against POST /users/v1/verify/otp/password/
 * On success: calls onVerified(email) so the parent can navigate to the new-password page.
 */
const ForgotPasswordOtpModal = ({ email, onVerified }) => {
    const [otpValues, setOtpValues] = useState(["", "", "", ""]);
    const [isOtpComplete, setIsOtpComplete] = useState(false);
    const [counter, setCounter] = useState(30);
    const [errorMsg, setErrorMsg] = useState("");
    const [resendStatus, setResendStatus] = useState(null); // 'success' | 'error' | null

    const { mutate: verifyOtp, isPending } = useVerifyForgotPasswordOtp();
    const { mutate: resendOtp, isPending: isResending } = useForgotPassword();

    /* ── OTP INPUT ─────────────────────────────────────────────────── */
    const handleChange = (value, index) => {
        if (!/^\d?$/.test(value)) return;
        const updated = [...otpValues];
        updated[index] = value;
        setOtpValues(updated);
        setErrorMsg("");
        if (value && index < 3) {
            document.getElementById(`reset-otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            document.getElementById(`reset-otp-${index - 1}`)?.focus();
        }
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData("text").slice(0, 4);
        if (/^\d{4}$/.test(pasted)) {
            setOtpValues(pasted.split(""));
            document.getElementById("reset-otp-3")?.focus();
        }
    };

    useEffect(() => {
        setIsOtpComplete(otpValues.every((v) => v.length === 1));
    }, [otpValues]);

    /* ── COUNTDOWN ───────────────────────────────────────────────────── */
    useEffect(() => {
        if (counter <= 0) return;
        const t = setInterval(() => setCounter((c) => c - 1), 1000);
        return () => clearInterval(t);
    }, [counter]);

    /* ── VERIFY ─────────────────────────────────────────────────────── */
    const handleVerify = () => {
        const otp_token = otpValues.join("");
        if (otp_token.length !== 4) return;

        verifyOtp(
            { email, otp_token },
            {
                onSuccess: () => {
                    onVerified(email); // advance to new-password page
                },
                onError: (err) => {
                    const msg =
                        err?.response?.data?.response_message ||
                        err?.response?.data?.responseMessage ||
                        "Invalid or expired OTP. Please try again.";
                    setErrorMsg(msg);
                    // Clear inputs on error
                    setOtpValues(["", "", "", ""]);
                    document.getElementById("reset-otp-0")?.focus();
                },
            }
        );
    };

    /* ── RESEND ──────────────────────────────────────────────────────── */
    const handleResend = () => {
        setResendStatus(null);
        setErrorMsg("");
        resendOtp(
            { email },
            {
                onSuccess: (res) => {
                    console.log("🔑 Resend OTP Response:", res?.data);
                    setResendStatus("success");
                    setCounter(30);
                    // Clear existing OTP inputs so user enters the new code
                    setOtpValues(["", "", "", ""]);
                    document.getElementById("reset-otp-0")?.focus();
                },
                onError: () => {
                    setResendStatus("error");
                },
            }
        );
    };

    return (
        <div className="inset-0 z-50 flex items-center justify-center h-screen fixed">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black opacity-30" />

            <div className="bg-white z-20 w-[90%] max-w-md rounded-2xl p-8 text-center font-poppins shadow-xl">
                <img src={checkmail} className="mx-auto mb-4 w-16" alt="check mail" />

                <h1 className="text-lg font-semibold text-[#1E2A5E] mb-2">Check Your Email</h1>
                <p className="text-sm text-gray-500 mb-6">
                    We sent a 4-digit code to <b>{email}</b>.<br />
                    Enter it below to continue resetting your password.
                </p>

                {/* Error */}
                {errorMsg && (
                    <p className="text-red-500 text-sm mb-3 bg-red-50 py-2 px-3 rounded-lg">
                        {errorMsg}
                    </p>
                )}

                {/* OTP Inputs */}
                <div className="flex justify-center gap-3 mb-5">
                    {otpValues.map((value, index) => (
                        <input
                            key={index}
                            id={`reset-otp-${index}`}
                            value={value}
                            maxLength={1}
                            type="text"
                            inputMode="numeric"
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={handlePaste}
                            className={`w-[54px] h-[54px] text-center text-xl border-2 rounded-xl focus:outline-none transition-colors
                ${errorMsg ? "border-red-400" : "border-gray-300 focus:border-[#1E2A5E]"}`}
                        />
                    ))}
                </div>

                {/* Verify Button */}
                <button
                    disabled={!isOtpComplete || isPending}
                    onClick={handleVerify}
                    className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition-colors
            ${isOtpComplete && !isPending
                            ? "bg-[#1E2A5E] hover:bg-[#162042] cursor-pointer"
                            : "bg-gray-300 cursor-not-allowed"}`}
                >
                    {isPending ? "Verifying..." : "Verify OTP"}
                </button>

                {/* Resend */}
                <div className="mt-4 text-sm">
                    {resendStatus === "success" && (
                        <p className="text-green-600 mb-1">✓ A new code has been sent to your email.</p>
                    )}
                    {resendStatus === "error" && (
                        <p className="text-red-500 mb-1">Failed to resend code. Please try again.</p>
                    )}
                    {counter > 0 ? (
                        <span className="text-gray-500">Resend code in {counter}s</span>
                    ) : (
                        <span
                            className={`font-medium ${isResending
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-[#EB4827] cursor-pointer hover:underline"
                                }`}
                            onClick={!isResending ? handleResend : undefined}
                        >
                            {isResending ? "Sending new code..." : "Resend OTP"}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordOtpModal;
