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
import MainLayout from "../components/Layouts/MainLayout";
import FleetManagement from "../pages/FleetManagement/FleetManagement";
import Notifications from "../pages/Notifications/Notifications";
import TrackOrders from "../pages/OngoingOrders/TrackOrders/TrackOrders";
import OrderList from "../pages/OngoingOrders/OrderList/OrderList";
import RidersManagement from "../pages/RidersManagement/RidersManagement";
import Signup from "../pages/RidersManagement/AddRider/Signup";
import PersonalInfo from "../pages/RidersManagement/AddRider/PersonalInfo";
import LegalLicensing from "../pages/RidersManagement/AddRider/LegalLicensing";
import DocumentUpload from "../pages/RidersManagement/AddRider/DocumentUpload";
import FinanceReports from "../pages/FinanceReports/FinanceReports";
import AllTransactions from "../pages/FinanceReports/TransactionHistory/AllTransactions";

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
            <Route element={<MainLayout />}>
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/fleet-management" element={<FleetManagement />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/order-management/track-orders" element={<TrackOrders />} />
                <Route path="/order-management/order-list" element={<OrderList />} />
                <Route path="/riders-management" element={<RidersManagement />} />
                <Route path="/riders-management/add-rider/signup" element={<Signup />} />
                <Route path="/riders-management/add-rider/personal-info" element={<PersonalInfo />} />
                <Route path="/riders-management/add-rider/legal-licensing" element={<LegalLicensing />} />
                <Route path="/riders-management/add-rider/document-upload" element={<DocumentUpload />} />
                <Route path="/finance-reports" element={<FinanceReports />} />
                <Route path="/finance-reports/all-transactions" element={<AllTransactions />} />
              </Route>
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
