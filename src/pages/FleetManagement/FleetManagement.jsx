import { useEffect, useState } from "react";
import {
  getFleetProfile,
  listVehicles,
} from "../../api/fleet.service";
import CreateFleetProfile from "./components/CreateFleetProfile";

const FleetManagement = () => {
  const [fleet, setFleet] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const initFleet = async () => {
    try {
      const profileRes = await getFleetProfile();
      setFleet(profileRes.data);

      const vehiclesRes = await listVehicles();
      setVehicles(vehiclesRes.data.data);
    } catch (err) {
      // Fleet profile does not exist
      setFleet(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initFleet();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!fleet) {
    return <CreateFleetProfile onSuccess={initFleet} />;
  }

  return (
    <>
      <FleetHeader />
      <FleetTable vehicles={vehicles} />
    </>
  );
};

export default FleetManagement;
