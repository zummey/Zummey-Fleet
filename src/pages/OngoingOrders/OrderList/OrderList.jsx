import React, { useState } from "react";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  MapPin,
  User,
} from "lucide-react";
import { useOngoingOrders } from "../../../api/dashboard.queries";
import Vehicle from "../../../assets/vehicle.png";
import FullScreenMapModal from "./FullScreenMapModal";
import OrderListSkeleton from "./OrderListSkelecton";

const ITEMS_PER_PAGE = 5;

const OrderList = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  // Track Live Modal State
  const [trackingOrder, setTrackingOrder] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: [],
    driverName: "",
    orderId: "",
    location: "",
  });

  // Fetch orders
  const { data, isLoading, isError, error } = useOngoingOrders();

  // Extract orders from response
  const allOrders = data?.responseDetails?.results || [];

  // Apply filters
  const filteredOrders = allOrders.filter((order) => {
    if (filters.startDate) {
      const orderDate = new Date(order.created_at);
      const startDate = new Date(filters.startDate);
      if (orderDate < startDate) return false;
    }
    if (filters.endDate) {
      const orderDate = new Date(order.created_at);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59);
      if (orderDate > endDate) return false;
    }

    if (filters.status.length > 0) {
      if (!filters.status.includes(order.status)) return false;
    }

    if (filters.orderId) {
      if (
        !order.request_id.toLowerCase().includes(filters.orderId.toLowerCase())
      ) {
        return false;
      }
    }

    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      const pickup = order.sender_address?.toLowerCase() || "";
      const dropoff = order.receiver_address?.toLowerCase() || "";
      if (!pickup.includes(locationLower) && !dropoff.includes(locationLower)) {
        return false;
      }
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleStatusToggle = (status) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      status: [],
      driverName: "",
      orderId: "",
      location: "",
    });
    setCurrentPage(1);
  };

  // Handle Track Live Click
  const handleTrackLive = (order) => {
    console.log('🎯 Track Live clicked for:', order.request_id);
    setTrackingOrder(order);
    setOpenDropdownId(null);
  };

  const getStatusStyle = (status) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "in-transit":
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.status.length > 0) count += filters.status.length;
    if (filters.driverName) count++;
    if (filters.orderId) count++;
    if (filters.location) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // ✅ SHOW SKELETON WHILE LOADING
  if (isLoading) {
    return <OrderListSkeleton />;
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-red-800 font-semibold mb-2">
          Error loading orders
        </h3>
        <p className="text-red-600 text-sm">
          {error?.response?.data?.responseMessage || error?.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 font-poppins">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[1.2rem] font-semibold text-[#343C6A]">Order List</h2>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative"
          >
            <Filter size={18} />
            <span className="text-sm font-medium">Filter</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#1E2A5E] text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="">
            <table className="w-full ">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"></th>
                  <th className="px-2 py-3 text-left text-[0.75rem] font-medium text-gray-600 uppercase">
                    Order ID
                  </th>
                  <th className="px-2 py-3 text-left text-[0.75rem] font-medium text-gray-600 uppercase">
                    Rider's Name
                  </th>
                  <th className="px-2 py-3 text-left text-[0.75rem] font-medium text-gray-600 uppercase">
                    Pickup Location
                  </th>
                  <th className="px-2 py-3 text-left text-[0.75rem] font-medium text-gray-600 uppercase">
                    Drop-off Location
                  </th>
                  <th className="px-2 py-3 text-left text-[0.75rem] font-medium text-gray-600 uppercase">
                    Vehicle Number
                  </th>
                  <th className="px-2 py-3 text-left text-[0.75rem] font-medium text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-2 py-3 text-left text-[0.75rem] font-medium text-gray-600 uppercase">
                    Date & Time
                  </th>
                  <th className="px-2 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => (
                    <tr key={order.request_id} className="hover:bg-gray-50 shadow-sm rounded-b-lg">
                      <td className="px-2 py-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center">
                          <img
                            src={Vehicle}
                            alt="Bike"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-4 font-medium text-[0.75rem] text-gray-900">
                        {order.request_id}
                      </td>
                      <td className="px-2 py-4 font-medium text-[0.75rem] text-gray-600">
                        Rider {order.rider_profile_id || "N/A"}
                      </td>
                      <td className="px-2 py-4 font-medium text-[0.75rem] text-gray-600">
                        {order.sender_address || "N/A"}
                      </td>
                      <td className="px-2 py-4 font-medium text-[0.75rem] text-gray-600">
                        {order.receiver_address || "N/A"}
                      </td>
                      <td className="px-2 py-4 font-medium text-[0.75rem] text-gray-600">
                        BEN-{order.rider_profile_id}XY
                      </td>
                      <td className="px-2 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[0.75rem] font-medium capitalize ${getStatusStyle(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-2 py-4 font-medium text-[0.75rem] text-gray-600">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-2 py-4 relative">
                        <button
                          onClick={() =>
                            setOpenDropdownId(
                              openDropdownId === order.request_id
                                ? null
                                : order.request_id,
                            )
                          }
                          className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          ...
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdownId === order.request_id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdownId(null)}
                            ></div>

                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                              <button
                                onClick={() => handleTrackLive(order)}
                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                              >
                                <MapPin size={16} className="text-gray-500" />
                                <span>Track Live</span>
                              </button>
                              <button
                                onClick={() => {
                                  console.log("View Rider Profile:", order.request_id);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                              >
                                <User size={16} className="text-gray-500" />
                                <span>View Rider's Profile</span>
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end mt-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="text-sm text-gray-600 font-medium">
                  {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filter Sidebar */}
        {isFilterOpen && (
          <>
            <div
              className="fixed h-screen inset-0 bg-[#B3B3BF]/40 z-50"
              onClick={() => setIsFilterOpen(false)}
            ></div>

            <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filter Option
                  </h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Filter by Date
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) =>
                          handleFilterChange("startDate", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2A5E]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) =>
                          handleFilterChange("endDate", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2A5E]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Order Status
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: "Pending", value: "PENDING" },
                      { label: "In Progress", value: "ACCEPTED" },
                      { label: "Delivered", value: "DELIVERED" },
                      { label: "Cancelled", value: "CANCELLED" },
                    ].map(({ label, value }) => (
                      <label
                        key={value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.status.includes(value)}
                          onChange={() => handleStatusToggle(value)}
                          className="w-4 h-4 rounded border-gray-300 text-[#EB4827] focus:ring-[#EB4827]"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Search Driver Name
                  </h4>
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search Driver's name"
                      value={filters.driverName}
                      onChange={(e) =>
                        handleFilterChange("driverName", e.target.value)
                      }
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-[2em] text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2A5E]"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Search Order ID
                  </h4>
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search Order ID"
                      value={filters.orderId}
                      onChange={(e) =>
                        handleFilterChange("orderId", e.target.value)
                      }
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-[2em] text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2A5E]"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Search Location
                  </h4>
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search by Location"
                      value={filters.location}
                      onChange={(e) =>
                        handleFilterChange("location", e.target.value)
                      }
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-[2em] text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2A5E]"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full bg-[#1E2A5E] text-white py-3 rounded-lg font-medium hover:bg-[#162042] transition-colors"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* FULL SCREEN MAP MODAL */}
      {trackingOrder && (
        <FullScreenMapModal
          orderData={trackingOrder}
          onClose={() => setTrackingOrder(null)}
        />
      )}
    </>
  );
};

export default OrderList;