import React from 'react';
import Overview from './Overview/Overview';
import ActiveVehicles from './ActiveVehicles/ActiveVehicles';
import OngoingOrder from './OngoingOrder/OngoingOrder';
import AdminDashboard from '../admin/Dashboard/AdminDashboard';
import { useAdminStore } from '../../store/admin.store';


const Dashboard = () => {
  const isAdmin = useAdminStore((state) => state.isAdmin);

  if (isAdmin) {
    return (
      <>
      <AdminDashboard />
      <OngoingOrder/>
      </>
    );
  }

  return (
    <div className="space-y-6 font-poppins">
      <Overview/>
      <ActiveVehicles/>
      <OngoingOrder/>
    </div>
  );
};

export default Dashboard;
