import { PencilLine, Trash, Trash2, UserPlus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import defaultAvatar from "../../assets/avatar.png";

const statusColors = {
  online: "bg-green-100 text-green-700",
  offline: "bg-red-100 text-red-700",
  pending: "bg-orange-100 text-orange-800",
};

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const VehicleRow = ({ vehicle, onAssign, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const getImageUrl = () => {
    // Prefer a local preview (optimistic), then server image fields, then default avatar
    return (
      vehicle._localImage || vehicle.image_url || vehicle.imageUrl || vehicle.main_image_url || vehicle.main_image || vehicle.thumbnail || vehicle.photo || defaultAvatar
    );
  };

  const bikeId = vehicle.bike_id || vehicle.identifier || vehicle.id || "-";
  const bikeTypeRaw = vehicle.vehicle_type || vehicle.type || vehicle.vehicleType || "";
  const bikeType = bikeTypeRaw === "MOTORCYCLE" ? "Bike" : bikeTypeRaw === "BICYCLE" ? "Bicycle" : bikeTypeRaw || "-";
  const name = vehicle.vehicle_name || vehicle.name || vehicle.nickname || vehicle.identifier || `Vehicle ${vehicle.id}`;
  const manufacturer = vehicle.vehicle_make || vehicle.manufacturer || vehicle.brand || "-";
  const licenseNo = vehicle.vehicle_licence_serial || vehicle.license_no || vehicle.registration_number || "-";
  const gps = vehicle.gps_tracker_serial || vehicle.gps_tracker_sn || vehicle.tracker_sn || "-";

  const rawAssigned = vehicle.assigned_rider || vehicle.rider || vehicle.assigned_to || vehicle.assigned || null;
  const formatAssigned = (a) => {
    if (!a) return "None";
    if (typeof a === "string") return a;
    if (Array.isArray(a) && a.length > 0) return formatAssigned(a[0]);
    if (typeof a === "object") {
      return (
        a.fullName || a.full_name || a.name ||
        (a.first_name && a.last_name && `${a.first_name} ${a.last_name}`) ||
        a.username || a.email || String(a.id) || "None"
      );
    }
    return String(a);
  };
  const assigned = formatAssigned(rawAssigned);

  const rawStatus = (vehicle.status || vehicle.state || vehicle.online_status || (vehicle.active ? "online" : "offline") || "").toString();
  const key = rawStatus.toLowerCase();
  const statusClass = statusColors[key] || "bg-gray-100 text-gray-700";
  const statusLabel = capitalize(rawStatus);

  const imgUrl = getImageUrl();

  return (
    <tr className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg hover:bg-gray-100 animate-row-fade">
      <td className=" first:rounded-l-lg">
        {imgUrl ? (
          <img src={imgUrl} alt={name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700">
            {name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </div>
        )}
      </td>

      <td className="p-4">{bikeId}</td>
      <td className="p-4">{bikeType}</td>
      <td className="p-4">{name}</td>
      <td className="p-4">{manufacturer}</td>
      <td className="p-4">{licenseNo}</td>
      <td className="p-4">{gps}</td>
      <td className="p-4">
        <span className={`px-3 py-1 rounded-full text-xs ${statusClass}`}>{statusLabel}</span>
      </td>
      <td className="p-4">{assigned}</td>

      <td className="p-4 text-right relative last:rounded-r-lg" ref={menuRef}>
        <button onClick={() => setMenuOpen((s) => !s)} aria-haspopup="menu" aria-expanded={menuOpen} className="p-2 rounded-full hover:bg-gray-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="5" cy="12" r="2" fill="currentColor" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <circle cx="19" cy="12" r="2" fill="currentColor" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-45 bg-white gap-3 p-4 space-y-1 border border-gray-100 rounded-md shadow-lg z-50">
            <button
              onClick={() => {
                setMenuOpen(false);
                onAssign && onAssign(vehicle);
              }}
              className="w-full text-left bg-[#f0f1f3] px-4 py-4 text-sm hover:bg-gray-50"
            >
              <UserPlus className="inline-block w-4 h-4 mr-2" />Assign Rider
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onEdit && onEdit(vehicle);
              }}
              className="w-full text-left px-4 bg-[#f3f5f7] py-4 text-sm hover:bg-gray-50"
            >
              <PencilLine className="inline-block w-4 h-4 mr-2" />Edit
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onDelete && onDelete(vehicle);
              }}
              className="w-full text-left bg-[#f0e5e8] px-4 py-4 text-sm text-red-600 hover:bg-gray-50"
            >
              <Trash2 className="inline-block w-4 h-4 mr-2" />Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default VehicleRow;
