import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

/**
 * PasswordChangedSuccessModal
 * Shown after PUT /users/v1/reset/password/ succeeds.
 * Matches the pinned design: icon + title + subtitle + "Return to Log In" button.
 */
const PasswordChangedSuccessModal = ({ isOpen }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Frosted backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

            {/* Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-10 w-[90%] max-w-sm text-center font-poppins">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full border-2 border-[#1E2A5E] flex items-center justify-center">
                        <CheckCircle size={44} strokeWidth={1.5} className="text-[#1E2A5E]" />
                    </div>
                </div>

                {/* Text */}
                <h2 className="text-xl font-bold text-[#1E2A5E] mb-3">
                    Password Changed<br />Successfully!
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-8">
                    Your password has been updated successfully. Use your
                    new password to log in next time.
                </p>

                {/* Button */}
                <button
                    onClick={() => navigate("/login")}
                    className="w-full py-3 bg-[#1E2A5E] text-white rounded-xl font-semibold text-sm hover:bg-[#162042] transition-colors"
                >
                    Return to Log In
                </button>
            </div>
        </div>
    );
};

export default PasswordChangedSuccessModal;
