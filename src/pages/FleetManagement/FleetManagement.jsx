import { useEffect, useMemo, useState } from "react";
import VehicleTable from "./VehicleTable";
import AddVehicle from "./AddVehicle";
import { deleteVehicle, getVehicles, updateVehicle } from "../../api/fleet.service";
import { FunnelIcon, Trash2 } from "lucide-react";

const FleetManagement = () => {
  const PAGE_SIZE = 10;
  const [vehicles, setVehicles] = useState([]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("status");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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

  const getStatusKey = (vehicle) => {
    const raw = (
      vehicle.status ||
      vehicle.state ||
      vehicle.online_status ||
      (vehicle.active ? "online" : "offline") ||
      ""
    )
      .toString()
      .toLowerCase();
    if (raw.includes("online")) return "online";
    if (raw.includes("offline")) return "offline";
    if (raw.includes("pending")) return "pending";
    return raw || "unknown";
  };

  const normalized = useMemo(() => {
    return vehicles.map((vehicle) => {
      const bikeId = vehicle.bike_id || vehicle.identifier || vehicle.id || "";
      const bikeTypeRaw = vehicle.vehicle_type || vehicle.type || vehicle.vehicleType || "";
      const bikeType = bikeTypeRaw === "MOTORCYCLE" ? "Bike" : bikeTypeRaw === "BICYCLE" ? "Bicycle" : bikeTypeRaw || "";
      const name = vehicle.vehicle_name || vehicle.name || vehicle.nickname || vehicle.identifier || `Vehicle ${vehicle.id || ""}`;
      const manufacturer = vehicle.vehicle_make || vehicle.manufacturer || vehicle.brand || "";
      const licenseNo = vehicle.vehicle_licence_serial || vehicle.license_no || vehicle.registration_number || "";
      const gps = vehicle.gps_tracker_serial || vehicle.gps_tracker_sn || vehicle.tracker_sn || "";
      const assigned =
        vehicle.assigned_rider ||
        vehicle.rider ||
        vehicle.assigned_to ||
        vehicle.assigned ||
        "";
      const assignedText = typeof assigned === "string" ? assigned : JSON.stringify(assigned);

      return {
        vehicle,
        statusKey: getStatusKey(vehicle),
        bikeId: String(bikeId),
        bikeType: String(bikeType),
        name: String(name),
        manufacturer: String(manufacturer),
        licenseNo: String(licenseNo),
        gps: String(gps),
        assignedText: String(assignedText),
      };
    });
  }, [vehicles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchesQuery = (item) => {
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.bikeId.toLowerCase().includes(q) ||
        item.bikeType.toLowerCase().includes(q) ||
        item.manufacturer.toLowerCase().includes(q) ||
        item.licenseNo.toLowerCase().includes(q) ||
        item.gps.toLowerCase().includes(q) ||
        item.assignedText.toLowerCase().includes(q) ||
        item.statusKey.toLowerCase().includes(q)
      );
    };

    return normalized.filter((item) => {
      if (statusFilter !== "all" && item.statusKey !== statusFilter) return false;
      return matchesQuery(item);
    });
  }, [normalized, query, statusFilter]);

  const sorted = useMemo(() => {
    const statusOrder = { online: 0, pending: 1, offline: 2, unknown: 3 };
    const dir = sortDir === "desc" ? -1 : 1;
    const copy = [...filtered];

    copy.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "status") {
        cmp = (statusOrder[a.statusKey] ?? 99) - (statusOrder[b.statusKey] ?? 99);
        if (cmp === 0) {
          cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        }
      } else if (sortBy === "name") {
        cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      } else if (sortBy === "bikeId") {
        cmp = a.bikeId.localeCompare(b.bikeId, undefined, { numeric: true, sensitivity: "base" });
      } else if (sortBy === "type") {
        cmp = a.bikeType.localeCompare(b.bikeType, undefined, { sensitivity: "base" });
      }
      return cmp * dir;
    });

    return copy;
  }, [filtered, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const startIndex = (clampedPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, sorted.length);
  const pagedVehicles = sorted.slice(startIndex, endIndex).map((item) => item.vehicle);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, sortBy, sortDir]);

  useEffect(() => {
    if (page !== clampedPage) setPage(clampedPage);
  }, [page, clampedPage]);

  // Open edit modal
  const handleEditRequest = (vehicle) => {
    setEditing(vehicle);
    setEditError(null);
    setEditForm({
      vehicle_name: vehicle.vehicle_name || vehicle.name || vehicle.nickname || "",
      vehicle_make: vehicle.vehicle_make || vehicle.manufacturer || "",
      vehicle_licence_serial: vehicle.vehicle_licence_serial || vehicle.license_no || "",
      gps_tracker_serial: vehicle.gps_tracker_serial || vehicle.gps_tracker_sn || vehicle.tracker_sn || "",
      vehicle_type: vehicle.vehicle_type || vehicle.type || vehicle.vehicleType || "MOTORCYCLE",
      vehicle_color: vehicle.vehicle_color || "",
    });
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    if (!editing) return;
    const id = editing.id || editing.identifier || editing.bike_id;
    if (!id && id !== 0) {
      setEditError(new Error("Vehicle id missing. Cannot update."));
      return;
    }
    try {
      setEditLoading(true);
      await updateVehicle(id, editForm);
      await fetchVehicles();
      setEditing(null);
    } catch (err) {
      console.error("Failed to update vehicle", err);
      setEditError(err);
    } finally {
      setEditLoading(false);
    }
  };

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setSortBy("status");
    setSortDir("asc");
  };

  // Delete handlers
  const handleDeleteRequest = (vehicle) => {
    setConfirmDelete(vehicle);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const id = confirmDelete.id || confirmDelete.identifier || confirmDelete.bike_id;
    if (!id && id !== 0) {
      setDeleteError(new Error("Vehicle id missing. Please try again."));
      return;
    }
    try {
      setDeleteLoading(true);
      // Optimistic removal
      setVehicles((prev) => prev.filter((v) => (v.id || v.identifier || v.bike_id) !== id));
      await deleteVehicle(id);
      await fetchVehicles();
      setConfirmDelete(null);
    } catch (err) {
      console.error("Failed to delete vehicle", err);
      setDeleteError(err);
      await fetchVehicles(); // revert optimistic removal
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#001940] to-[#003366] bg-clip-text text-transparent">
          Fleet Management
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => setFilterOpen((s) => !s)}
            aria-expanded={filterOpen}
            aria-controls="fleet-filter-panel"
            className="border border-[#001940] px-4 py-2 rounded-lg text-[#001940] font-semibold transition-all duration-300 hover:bg-gray-50 hover:shadow-md active:scale-95 transform hover:scale-105"
          >
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

      {filterOpen && (
        <div
          id="fleet-filter-panel"
          className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-filter-pop"
        >
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-2 min-w-[220px]">
              <label className="text-xs font-semibold text-gray-600">Search</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, bike ID, type, status..."
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#001940] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2 min-w-[160px]">
              <label className="text-xs font-semibold text-gray-600">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#001940] focus:outline-none"
              >
                <option value="all">All</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="pending">Pending</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 min-w-[160px]">
              <label className="text-xs font-semibold text-gray-600">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#001940] focus:outline-none"
              >
                <option value="status">Status</option>
                <option value="name">Bike Name</option>
                <option value="bikeId">Bike ID</option>
                <option value="type">Bike Type</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 min-w-[140px]">
              <label className="text-xs font-semibold text-gray-600">Direction</label>
              <div className="flex rounded-lg border border-gray-200">
                <button
                  onClick={() => setSortDir("asc")}
                  className={`flex-1 px-3 py-2 text-sm ${
                    sortDir === "asc" ? "bg-[#001940] text-white" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Asc
                </button>
                <button
                  onClick={() => setSortDir("desc")}
                  className={`flex-1 px-3 py-2 text-sm ${
                    sortDir === "desc" ? "bg-[#001940] text-white" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Desc
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={clearFilters}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="rounded-lg bg-[#001940] px-4 py-2 text-sm font-semibold text-white hover:shadow-md"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div key={clampedPage} className="animate-page" style={{ animationDelay: "0.2s" }}>
        <VehicleTable
          vehicles={pagedVehicles}
          loading={loading}
          onEdit={handleEditRequest}
          onDelete={handleDeleteRequest}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
        <span>
          Showing {sorted.length === 0 ? 0 : startIndex + 1}-{endIndex} of {sorted.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={clampedPage === 1}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-2">
            Page {clampedPage} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={clampedPage === totalPages}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded">{error.message ? error.message : String(error)}</div>
      )}

      {/* Drawer */}
      {showAddVehicle && (
        <AddVehicle onClose={() => setShowAddVehicle(false)} onSuccess={fetchVehicles} />
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40 animate-fade-in"
            onClick={() => !deleteLoading && setConfirmDelete(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-7 animate-slide-up border border-gray-100 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                  <Trash2 size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Confirm Delete</p>
                  <h3 className="text-xl font-bold text-gray-900">Delete vehicle?</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action cannot be undone. The vehicle will be removed from your fleet.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700 space-y-1">
                <div className="font-semibold text-gray-900">
                  {confirmDelete.vehicle_name || confirmDelete.name || confirmDelete.identifier || `Vehicle ${confirmDelete.id}`}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                  <span>Bike ID: {confirmDelete.bike_id || confirmDelete.id || "-"}</span>
                  <span>License: {confirmDelete.vehicle_licence_serial || confirmDelete.license_no || "-"}</span>
                  <span>Tracker: {confirmDelete.gps_tracker_serial || confirmDelete.tracker_sn || "-"}</span>
                </div>
              </div>

              {deleteError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-2">
                  {deleteError.response?.data?.message || deleteError.message || "Unable to delete vehicle. Please try again."}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                  className="px-5 py-2 text-sm rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                  {deleteLoading && (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editing && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
            onClick={() => !editLoading && setEditing(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <form
              onSubmit={handleUpdateVehicle}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 md:p-8 animate-slide-up space-y-6 border border-gray-100"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#4B5563] font-semibold">Fleet · Vehicle</p>
                  <h3 className="text-2xl font-bold text-gray-900">Edit Vehicle</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Update key details like plate, tracker ID, and color. Changes save instantly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="text-gray-400 hover:text-gray-600 transition rounded-full p-2 hover:bg-gray-100"
                  disabled={editLoading}
                  aria-label="Close edit modal"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Bike Name</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#001940] focus:border-[#001940]"
                    value={editForm?.vehicle_name || ""}
                    onChange={(e) => setEditForm({ ...editForm, vehicle_name: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Manufacturer</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#001940] focus:border-[#001940]"
                    value={editForm?.vehicle_make || ""}
                    onChange={(e) => setEditForm({ ...editForm, vehicle_make: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">License No.</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#001940] focus:border-[#001940]"
                    value={editForm?.vehicle_licence_serial || ""}
                    onChange={(e) => setEditForm({ ...editForm, vehicle_licence_serial: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">GPS Tracker SN</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#001940] focus:border-[#001940]"
                    value={editForm?.gps_tracker_serial || ""}
                    onChange={(e) => setEditForm({ ...editForm, gps_tracker_serial: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Bike Type</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#001940] focus:border-[#001940]"
                    value={editForm?.vehicle_type || "MOTORCYCLE"}
                    onChange={(e) => setEditForm({ ...editForm, vehicle_type: e.target.value })}
                  >
                    <option value="MOTORCYCLE">MOTORCYCLE</option>
                    <option value="BICYCLE">BICYCLE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Bike Color</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#001940] focus:border-[#001940]"
                    value={editForm?.vehicle_color || ""}
                    onChange={(e) => setEditForm({ ...editForm, vehicle_color: e.target.value })}
                  />
                </div>
              </div>

              {editError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-2">
                  {editError.response?.data?.message || editError.message || "Update failed. Please try again."}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 flex-wrap gap-3">
                <div className="text-xs text-gray-500">
                  Editing: <span className="font-semibold text-gray-700">{editing?.vehicle_name || editing?.name || editing?.identifier}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 text-sm rounded-lg bg-[#001940] text-white font-semibold hover:shadow-md disabled:opacity-70 flex items-center gap-2"
                >
                  {editLoading && (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </>
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
          from { transform: translateY(12px); opacity: 0.4; }
          to { transform: translateY(0); opacity: 1; }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }

        @keyframes rowFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-row-fade {
          animation: rowFade 0.35s ease;
        }

        @keyframes filterPop {
          from { opacity: 0; transform: translateY(-6px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes pageIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-page {
          animation: pageIn 0.45s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default FleetManagement;
