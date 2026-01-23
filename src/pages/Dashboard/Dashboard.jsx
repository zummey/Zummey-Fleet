import React from 'react';
import Overview from './Overview/Overview';
import ActiveVehicles from './ActiveVehicles/ActiveVehicles';
import OngoingOrder from './OngoingOrder/OngoingOrder';


const Dashboard = () => {
  return (
    <div className="space-y-6 font-poppins">
      <Overview/>
      <ActiveVehicles/>
      <OngoingOrder/>
    </div>
  );
};

export default Dashboard;