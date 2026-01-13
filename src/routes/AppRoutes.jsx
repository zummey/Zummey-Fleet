import React from "react";
import { Route, Routes } from "react-router-dom";
import AuthLayout from "../components/Layouts/AuthLayout";
import SignUp from "../pages/auth/SignUp";
import Login from "../pages/auth/Login";
import ResetPassword from "../pages/auth/ResetPassword";
import ResetPasswordMain from "../pages/auth/ResetPasswordMain";
import ScrollToTop from "../ScrollToTop";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../pages/Dashboard/Dashboard";

const AppRoutes = () => {
  return (
    <div className="route-container">
      <div className="route-wrapper">
        <ScrollToTop>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route path="/reset_password" element={<ResetPassword />} />
            <Route path="/reset_main" element={<ResetPasswordMain />} />
          </Routes>
        </ScrollToTop>
      </div>
    </div>
  );
};

export default AppRoutes;
