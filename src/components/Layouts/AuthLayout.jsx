import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="auth-container w-[100%] ">
      <div className="auth-container-wrapper flex justify-between ">
        <div className="left_form_section w-[50%] py-[2em]">
          <Outlet />
        </div>

       
        <div className="right_form_section  bg-[url('/src/assets/auth-image.png')] bg-cover bg-no-repeat  w-[45%] bg-[center_30%] flex  justify-center">
          <h1 className="text-white text-3xl font-bold text-center flex items-center font-poppins max-w-[40%]  h-screen fixed">
            “Simplify, Track, and Optimize – All in One Dashboard”
          </h1>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
