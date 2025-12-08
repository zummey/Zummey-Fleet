import React from "react";
import { Route, Routes } from "react-router-dom";
import AuthLayout from "../components/Layouts/AuthLayout";
import SignUp from "../pages/auth/SignUp";


const AppRoutes = () => {
  return (
    <div className="route-container">
      <div className="route-wrapper" >
        <Routes>
          <Route element={<AuthLayout/>}>
            <Route path="/" element={<SignUp/>}/>
          </Route>
        </Routes>
      </div>
    </div>
  );
};

export default AppRoutes;
