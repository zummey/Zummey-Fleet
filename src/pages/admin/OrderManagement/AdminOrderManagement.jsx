import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Timer,
  Repeat,
  CircleCheck,
  CircleX,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  RefreshCw,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  ORDER_STATUS_CONFIG,
  INITIAL_ADMIN_ORDERS,
  ORDERS_PAGE_SIZE,
  normalizeOrderStatus,
} from "./adminOrders.config";
import { useAdminDashboardStats } from "../../../api/admin.queries";
import { useOngoingOrders } from "../../../api/dashboard.queries";
import OrderFilterPopover from "./components/OrderFilterPopover";
import ReassignRiderModal from "./modals/ReassignRiderModal";
import EscalateIssueModal from "./modals/EscalateIssueModal";
import CancelOrderModal from "./modals/CancelOrderModal";

const AdminOrderManagement = () => {
  const navigate = useNavigate();

  // Queries
  const { data: statsData, isLoading: isStatsLoading } = useAdminDashboardStats();
  const { data: ongoingData, isLoading: isOrdersLoading } = useOngoingOrders();

  // Local state for orders (initialized with mock and augmented by live API)
  const [orders, setOrders] = useState(INITIAL_ADMIN_ORDERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openActionRowId, setOpenActionRowId] = useState(null);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // "reassign" | "escalate" | "cancel"
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Sync ongoing API orders into our admin orders if returned
  React.useEffect(() => {
    const apiList = ongoingData?.responseDetails?.results;
    if (Array.isArray(apiList) && apiList.length > 0) {
      setOrders((prev) => {
        const existingIds = new Set(prev.map((o) => o.id));
        const newItems = apiList
          .filter((item) => !existingIds.has(item.request_id))
          .map((item) => {
            const normStatus = normalizeOrderStatus(item.status);
            return {
              id: item.request_id,
              orderId: item.request_id,
              customer: item.sender_name || "Uche Kalu",
              rider: item.rider_name || "Unassigned",
              fleet: "Swift Logistics",
              status: normStatus,
              amount: item.amount || 4500,
              placedAt: `Placed ${new Date(item.created_at || Date.now()).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })} · ${new Date(item.created_at || Date.now()).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}`,
              distance: "11.4 km",
              paymentMethod: "Card",
              packageType: "Document",
              sender: {
                name: item.sender_name || "Uche Kalu",
                phone: item.sender_phone || "07045679109",
                pickupAddress: item.sender_address || "New Benin",
              },
              recipient: {
                name: item.receiver_name || "Chinedu Okoro",
                phone: item.receiver_phone || "08033441120",
                dropoffAddress: item.receiver_address || "Oluku",
                deliveryNote: '"Call on arrival"',
              },
              riderDetails:
                normStatus === "pending"
                  ? null
                  : {
                      name: item.rider_name || "Emeka Nwankwo",
                      code: `RDR-${item.rider_profile_id || 2041}`,
                      fleet: "Swift Logistics",
                      phone: "08031120045",
                      rating: 4.8,
                      initials: "EN",
                    },
            };
          });

        return newItems.length > 0 ? [...newItems, ...prev] : prev;
      });
    }
  }, [ongoingData]);

  // Derived stats from API statsData or orders
  const stats = useMemo(() => {
    const apiOrdersStats = statsData?.orders;
    return {
      pending: apiOrdersStats?.pendingOrders?.value ?? 2,
      pendingCaption: apiOrdersStats?.pendingOrders?.caption ?? "Awaiting dispatch",
      active: apiOrdersStats?.activeOrders?.value ?? 8,
      activeCaption: apiOrdersStats?.activeOrders?.caption ?? "+8.6% vs yesterday",
      completed: apiOrdersStats?.completedOrders?.value ?? 5,
      completedCaption: apiOrdersStats?.completedOrders?.caption ?? "+6.1% this month",
      failed: apiOrdersStats?.failedOrders?.value ?? 2,
      failedCaption: apiOrdersStats?.failedOrders?.caption ?? "12% vs last week",
    };
  }, [statsData]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (selectedStatus !== "all") {
        if (normalizeOrderStatus(o.status) !== selectedStatus) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = (o.orderId || o.id || "").toLowerCase().includes(q);
        const matchesCustomer = (o.customer || "").toLowerCase().includes(q);
        const matchesRider = (o.rider || "").toLowerCase().includes(q);
        const matchesFleet = (o.fleet || "").toLowerCase().includes(q);
        if (!matchesId && !matchesCustomer && !matchesRider && !matchesFleet) {
          return false;
        }
      }

      return true;
    });
  }, [orders, selectedStatus, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PAGE_SIZE));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ORDERS_PAGE_SIZE;
    return filteredOrders.slice(start, start + ORDERS_PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Modal actions
  const handleReassignConfirm = ({ orderId, rider }) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "assigned",
              rider: rider.name,
              fleet: rider.fleet,
              riderDetails: {
                name: rider.name,
                code: rider.code || "RDR-3012",
                fleet: rider.fleet,
                phone: rider.phone || "08031234567",
                rating: rider.rating || 4.9,
                initials: rider.initials || "RN",
              },
            }
          : o
      )
    );
  };

  const handleEscalateConfirm = ({ orderId, issue, priority }) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              isEscalated: true,
              escalationMessage: `Issue escalated. ${issue} - ${priority} priority.`,
            }
          : o
      )
    );
  };

  const handleCancelConfirm = ({ orderId, reason }) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "cancelled",
              cancelledMessage: `Order cancelled. Reason: ${reason}.`,
            }
          : o
      )
    );
  };

  const handleOpenAction = (e, order, modalName) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setActiveModal(modalName);
    setOpenActionRowId(null);
  };

  return (
    <div className="space-y-6 font-poppins pb-8">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1E2A5E]">Order Management</h1>
      </div>

      {/* 4 Stat Cards in a row (Screen 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Pending Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Pending Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FFF6EE] flex items-center justify-center text-[#E06516]">
              <Timer size={18} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-gray-900">
              {stats.pending}
            </span>
            <p className="text-[11px] text-gray-400 mt-1 font-normal">
              {stats.pendingCaption}
            </p>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Active Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#EEF4FF] flex items-center justify-center text-[#2563EB]">
              <Repeat size={18} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-gray-900">
              {stats.active}
            </span>
            <p className="text-[11px] text-emerald-600 mt-1 font-medium">
              {stats.activeCaption}
            </p>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Completed Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#EDFDF5] flex items-center justify-center text-[#16A34A]">
              <CircleCheck size={18} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-gray-900">
              {stats.completed}
            </span>
            <p className="text-[11px] text-emerald-600 mt-1 font-medium">
              {stats.completedCaption}
            </p>
          </div>
        </div>

        {/* Failed Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Failed Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] flex items-center justify-center text-[#DC2626]">
              <CircleX size={18} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-gray-900">
              {stats.failed}
            </span>
            <p className="text-[11px] text-rose-500 mt-1 font-medium">
              {stats.failedCaption}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card (Screen 1 & Screen 2) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#1E2A5E]">All Orders</h2>

          <div className="flex items-center gap-3 relative">
            {/* Search Input */}
            <div className="relative w-64 sm:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search for something"
                className="w-full pl-10 pr-4 py-2 bg-[#F6F7FA] border-0 rounded-full text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E2A5E]/20 transition-all"
              />
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-semibold transition-all ${
                  selectedStatus !== "all"
                    ? "bg-[#1E2A5E] text-white border-[#1E2A5E]"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Filter size={14} />
                <span>Filter</span>
                {selectedStatus !== "all" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>

              {/* Popover Filter (Screen 2) */}
              <OrderFilterPopover
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                selectedStatus={selectedStatus}
                onSelectStatus={(status) => setSelectedStatus(status)}
                onReset={() => {
                  setSelectedStatus("all");
                  setCurrentPage(1);
                }}
                resultsCount={filteredOrders.length}
                onApply={() => setCurrentPage(1)}
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400">
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Rider</th>
                <th className="py-3.5 px-6">Fleet</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-gray-400 font-medium"
                  >
                    No orders match your search or filter.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const normStatus = normalizeOrderStatus(order.status);
                  const statusConfig =
                    ORDER_STATUS_CONFIG[normStatus] || ORDER_STATUS_CONFIG.in_transit;
                  const isActionOpen = openActionRowId === order.id;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/order-management/${order.id}`)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Order ID */}
                      <td className="py-4 px-6 font-semibold text-gray-900 group-hover:text-[#1E2A5E]">
                        {order.orderId || order.id}
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-6 font-semibold text-gray-800">
                        {order.customer}
                      </td>

                      {/* Rider */}
                      <td className="py-4 px-6">
                        {order.rider === "Unassigned" ? (
                          <span className="text-[#3B82F6] font-medium">
                            Unassigned
                          </span>
                        ) : (
                          <span className="font-semibold text-gray-800">
                            {order.rider}
                          </span>
                        )}
                      </td>

                      {/* Fleet */}
                      <td className="py-4 px-6 font-semibold text-gray-800">
                        {order.fleet}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-medium capitalize ${statusConfig.badgeClass}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        ₦{Number(order.amount).toLocaleString()}
                      </td>

                      {/* Action Menu button */}
                      <td
                        className="py-4 px-6 text-right relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenActionRowId(isActionOpen ? null : order.id)
                          }
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors ml-auto"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        {isActionOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenActionRowId(null)}
                            />
                            <div className="absolute right-6 top-10 z-20 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 text-left font-poppins animate-fade-in">
                              <button
                                type="button"
                                onClick={() => {
                                  navigate(`/order-management/${order.id}`);
                                  setOpenActionRowId(null);
                                }}
                                className="w-full px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors font-medium"
                              >
                                <Eye size={14} className="text-gray-400" />
                                <span>View Details</span>
                              </button>

                              {normStatus !== "delivered" && normStatus !== "cancelled" && normStatus !== "failed" && (
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenAction(e, order, "reassign")}
                                  className="w-full px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors font-medium"
                                >
                                  <RefreshCw size={14} className="text-gray-400" />
                                  <span>Reassign Rider</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={(e) => handleOpenAction(e, order, "escalate")}
                                className="w-full px-3.5 py-2 text-xs text-amber-700 hover:bg-amber-50/60 flex items-center gap-2.5 transition-colors font-medium"
                              >
                                <AlertTriangle size={14} className="text-amber-500" />
                                <span>Escalate Issue</span>
                              </button>

                              {normStatus !== "delivered" && normStatus !== "cancelled" && (
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenAction(e, order, "cancel")}
                                  className="w-full px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50/60 flex items-center gap-2.5 transition-colors font-medium border-t border-gray-50"
                                >
                                  <X size={14} className="text-rose-500" />
                                  <span>Cancel Order</span>
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Pagination (Screen 1: < 1 of 6 >) */}
        <div className="p-4 px-6 border-t border-gray-100 flex items-center justify-end gap-3 text-xs text-gray-500 font-medium">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-gray-700 font-semibold px-2">
            {currentPage}
          </span>
          <span className="text-gray-400 font-normal">of</span>
          <span className="text-gray-500">{totalPages}</span>

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Modals */}
      <ReassignRiderModal
        isOpen={activeModal === "reassign"}
        onClose={() => {
          setActiveModal(null);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onConfirm={handleReassignConfirm}
      />

      <EscalateIssueModal
        isOpen={activeModal === "escalate"}
        onClose={() => {
          setActiveModal(null);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onConfirm={handleEscalateConfirm}
      />

      <CancelOrderModal
        isOpen={activeModal === "cancel"}
        onClose={() => {
          setActiveModal(null);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
};

export default AdminOrderManagement;
