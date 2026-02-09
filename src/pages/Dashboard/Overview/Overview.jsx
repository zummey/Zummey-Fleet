// src/pages/Dashboard/Overview.jsx

import React from 'react';
import { Truck, PauseCircle } from 'lucide-react';
import Rocket from '../../../assets/rocket.png'
import InactiveVeh from '../../../assets/inactive_vehicle.png'
import StatCard from './StatCard';
import OverviewSkeleton from './OverviewSkeleton';
import { useDashboardMetrics } from '../../../api/dashboard.queries'

const Overview = () => {
  // Fetch dashboard metrics using React Query
  const { data, isLoading, isError, error } = useDashboardMetrics();

  // Loading state - Show skeleton
  if (isLoading) {
    return <OverviewSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error loading dashboard</h3>
        <p className="text-red-600 text-sm">{error?.response?.data?.responseMessage || error?.message || 'Something went wrong'}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Extract metrics from response
  const metrics = data?.responseDetails || {};
  const totalVehicles = metrics.total_vehicles || 0;
  const activeVehicles = metrics.active_vehicles || 0;
  const inactiveVehicles = metrics.inactive_vehicles || 0;

  console.log('✅ Dashboard Metrics:', metrics);

  return (
    <div className="space-y-6 font-poppins">
      {/* Page Title */}
      <div>
        <h3 className="text-2xl font-medium text-gray-900">Overview</h3>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Vehicles"
          value={totalVehicles}
          icon={Truck}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
        />
        
        <StatCard
          label="Active Vehicles"
          value={activeVehicles}
          img={Rocket}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
        />
        
        <StatCard
          label="Inactive Vehicles"
          value={inactiveVehicles}
          img={InactiveVeh}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
        />
      </div>
    </div>
  );
};

export default Overview;