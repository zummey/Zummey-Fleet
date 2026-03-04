import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useOngoingOrders } from "../../../api/dashboard.queries";
import OrderCard from "./Ordercard";
import MapView from "../../Dashboard/OngoingOrder/MapView";
import OngoingOrdersSkeleton from "../../Dashboard/OngoingOrder/OngoingOrdersSkeleton";

const TrackOrders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Fetch ongoing orders from backend
  const { data, isLoading, isError, error } = useOngoingOrders();

  // Extract and map backend data to your format
  const backendOrders = data?.responseDetails?.results || [];

  // Filter out delivered orders (only show ongoing ones)
  const ongoingBackendOrders = backendOrders.filter(
    (order) => order.progress !== "PACKAGE_DELIVERED",
  );

  // NO LIMIT - Show all ongoing orders
  const orders = ongoingBackendOrders.map((order) => ({
    id: order.delivery_id,
    orderId: order.request_id,
    orderDate: new Date(order.created_at).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    pickupLocation: {
      name: order.sender_address?.split(",")[0] || "Pickup Location",
      address: order.sender_address || "Address not available",
      lat: order.pickup_latitude,
      lng: order.pickup_longitude,
    },
    destination: {
      name: order.receiver_address?.split(",")[0] || "Destination",
      address: order.receiver_address || "Address not available",
      lat: order.dropoff_latitude,
      lng: order.dropoff_longitude,
    },
    status: order.status,
    progress: order.progress,
    amount: order.amount,
    mapPreview: null,
  }));

  // Filter orders based on search
  const filteredOrders = orders.filter((order) =>
    order.orderId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Set first order as selected on initial load
  useEffect(() => {
    if (
      !isLoading &&
      !isError &&
      filteredOrders.length > 0 &&
      selectedOrderId === null
    ) {
      console.log("🎯 Auto-selecting first order:", filteredOrders[0].orderId);
      setSelectedOrderId(filteredOrders[0].id);
    }
  }, [isLoading, isError, filteredOrders.length, selectedOrderId]);

  // Loading state
  if (isLoading) {
    return <OngoingOrdersSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <div className="h-screen flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">
            Error loading orders
          </h3>
          <p className="text-red-600 text-sm">
            {error?.response?.data?.responseMessage ||
              error?.message ||
              "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  console.log("✅ Total Backend Orders:", backendOrders.length);
  console.log("✅ Ongoing Orders (filtered):", ongoingBackendOrders.length);
  console.log("✅ Showing all:", orders.length);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
        {/* Left Side - Scrollable Order List */}
        <div className="bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {/* Orders Container with Scroll */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col-reverse gap-3  justify-between">
              <div>
                <h1 className="text-[1.1rem] font-semibold text-gray-900">
                  Track Ongoing Orders
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredOrders.length}{" "}
                  {filteredOrders.length === 1 ? "order" : "orders"} in progress
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-[100%]">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by Order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[90%] pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-[2rem] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
          ;
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No orders found
                </h3>
                <p className="text-sm text-gray-500">
                  {searchQuery
                    ? `No orders match "${searchQuery}"`
                    : "No ongoing orders at the moment"}
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isSelected={selectedOrderId === order.id}
                  onViewDetails={() => setSelectedOrderId(order.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Side - Fixed Map (No Scroll) */}
        <div className="bg-gray-100 relative overflow-hidden">
          <MapView
            orders={filteredOrders}
            selectedOrderId={selectedOrderId}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default TrackOrders;
