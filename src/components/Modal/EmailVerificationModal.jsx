import React from "react";
import checkmail from "../../assets/checkmail.png";

const EmailVerificationModal = () => {
  return (
    <div className="emailver-container    absolute top-0 left-0 w-[100%] h-screen fixed z-10">
      <div className="outer-black bg-black opacity-25 z-[-1]  absolute top-0 left-0 w-[100%] h-screen fixed"></div>
      <div className="flex justify-center h-[100%] items-center">
        <div className="emailver-wrapper z-10 opacity-100 bg-white w-[35%] h-[80%] rounded-[.8em] p-3">
          <div className="emailver-main flex flex-col items-center justify-center h-[100%] font-poppins text-center gap-6">
            <img src={checkmail} alt="" />
            <h1 className="text-[1.2rem] font-semibold max-w-[60%]">Check Your Email to Verify Your Account</h1>
            <p className="text-[0.8rem] max-w-[90%]">
              We've sent a verification email to your email address. Please
              check your inbox and click the link to verify your email and
              continue with the registration.
            </p>
            <button className="bg-primary text-white w-[50%] py-2 rounded-lg cursor-pointer">Resend Email</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationModal;
