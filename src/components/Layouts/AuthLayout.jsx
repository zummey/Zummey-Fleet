import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="auth-container w-[100%]">
      <div className="auth-container-wrapper flex justify-between">
        <div className="left_form_section w-[50%]">
          <Outlet />
        </div>

       
        <div className="right_form_section bg-[url('/src/assets/auth-image.png')] bg-cover bg-no-repeat h-screen w-[45%] bg-[center_30%] flex items-center justify-center">
          <h1 className="text-white text-3xl font-bold text-center font-poppins max-w-[90%]">
            “Simplify, Track, and Optimize – All in One Dashboard”
          </h1>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
