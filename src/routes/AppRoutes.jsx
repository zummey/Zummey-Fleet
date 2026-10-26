import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
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
import Security from "../pages/Settings/Security";
import FinanceReports from "../pages/FinanceReports/FinanceReports";
import AllTransactions from "../pages/FinanceReports/TransactionHistory/AllTransactions";
import AdminDashboard from "../pages/admin/Dashboard/AdminDashboard";
import AdminSwitch from "../pages/admin/AdminSwitch";
import AdminFleetManagement from "../pages/admin/FleetManagement/AdminFleetManagement";
import AdminFleetDetails from "../pages/admin/FleetManagement/details/AdminFleetDetails";
import FleetReview from "../pages/admin/FleetManagement/review/FleetReview";
import Customers from "../pages/admin/UserManagement/Customers/Customers";
import CustomerDetails from "../pages/admin/UserManagement/Customers/details/CustomerDetails";
import AdminRiders from "../pages/admin/UserManagement/Riders/AdminRiders";
import AdminFinance from "../pages/admin/Finance/AdminFinance";

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
                <Route
                  path="/fleet-management"
                  element={<AdminSwitch admin={<AdminFleetManagement />} fallback={<FleetManagement />} />}
                />
                <Route
                  path="/fleet-management/:fleetId"
                  element={<AdminSwitch admin={<AdminFleetDetails />} fallback={<Navigate to="/fleet-management" replace />} />}
                />
                <Route
                  path="/fleet-management/:fleetId/review"
                  element={<AdminSwitch admin={<FleetReview />} fallback={<Navigate to="/fleet-management" replace />} />}
                />
                <Route
                  path="/user-management"
                  element={<AdminSwitch admin={<Navigate to="/user-management/customers" replace />} fallback={<Navigate to="/dashboard" replace />} />}
                />
                <Route
                  path="/user-management/customers"
                  element={<AdminSwitch admin={<Customers />} fallback={<Navigate to="/dashboard" replace />} />}
                />
                <Route
                  path="/user-management/customers/:customerId"
                  element={<AdminSwitch admin={<CustomerDetails />} fallback={<Navigate to="/dashboard" replace />} />}
                />
                <Route
                  path="/user-management/riders"
                  element={<AdminSwitch admin={<AdminRiders />} fallback={<Navigate to="/riders-management" replace />} />}
                />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/order-management/track-orders" element={<TrackOrders/>} />
                <Route path="/order-management/order-list" element={<OrderList/>} />
                <Route path="/riders-management" element={<AdminSwitch admin={<Navigate to="/user-management/riders" replace />} fallback={<RidersManagement />} />} />
                <Route path="/riders-management/add-rider/signup" element={<Signup/>} />
                <Route path="/riders-management/add-rider/personal-info" element={<PersonalInfo/>} />
                <Route path="/riders-management/add-rider/legal-licensing" element={<LegalLicensing/>} />
                <Route path="/riders-management/add-rider/document-upload" element={<DocumentUpload/>} />
                <Route path="/settings/security" element={<Security />} />
                <Route path="/order-management/track-orders" element={<TrackOrders />} />
                <Route path="/order-management/order-list" element={<OrderList />} />
                <Route path="/riders-management" element={<AdminSwitch admin={<Navigate to="/user-management/riders" replace />} fallback={<RidersManagement />} />} />
                <Route path="/riders-management/add-rider/signup" element={<Signup />} />
                <Route path="/riders-management/add-rider/personal-info" element={<PersonalInfo />} />
                <Route path="/riders-management/add-rider/legal-licensing" element={<LegalLicensing />} />
                <Route path="/riders-management/add-rider/document-upload" element={<DocumentUpload />} />
                <Route path="/finance-reports" element={<AdminSwitch admin={<AdminFinance />} fallback={<FinanceReports />} />} />
                <Route
                  path="/finance-reports/all-transactions"
                  element={<AdminSwitch admin={<Navigate to="/finance-reports?tab=transactions" replace />} fallback={<AllTransactions />} />}
                />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
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
