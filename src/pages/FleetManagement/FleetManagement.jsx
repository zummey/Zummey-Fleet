import { useEffect, useState } from "react";
import VehicleTable from "./VehicleTable";
import AddVehicle from "./AddVehicle";
import { getVehicles } from "../../api/fleet.service";
import { FunnelIcon } from "lucide-react";

const FleetManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await getVehicles();

      // SAFELY extract array
      const vehicleList =
        Array.isArray(res.data)
          ? res.data
          : res.data?.data || res.data?.results || res.data?.responseDetails?.results || [];
      setVehicles(vehicleList);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch vehicles", err);
      setVehicles([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#001940] to-[#003366] bg-clip-text text-transparent">
          Fleet Management
        </h1>

        <div className="flex gap-3">
          <button className="border border-[#001940] px-4 py-2 rounded-lg text-[#001940] font-semibold transition-all duration-300 hover:bg-gray-50 hover:shadow-md active:scale-95 transform hover:scale-105">
            <FunnelIcon className="inline-block w-4 h-4 mr-2" />Filter
          </button>

          <button
            onClick={() => setShowAddVehicle(true)}
            className="bg-[#001940] text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg active:scale-95 transform hover:scale-105"
          >
            + Add Vehicle
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <VehicleTable vehicles={vehicles} loading={loading} />
      </div>

      {/* Error State */}
      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded">{error.message ? error.message : String(error)}</div>
      )}

      {/* Drawer */}
      {showAddVehicle && (
        <AddVehicle onClose={() => setShowAddVehicle(false)} onSuccess={fetchVehicles} />
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default FleetManagement;
