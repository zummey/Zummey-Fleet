import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useOngoingOrders } from "../../../api/dashboard.queries";
import OrderCard from "./OrderCard";
import MapView from "./MapView";
import OngoingOrdersSkeleton from "./OngoingOrdersSkeleton";

const OngoingOrder = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null); // Track which order is selected

  // Fetch ongoing orders from backend
  const { data, isLoading, isError, error } = useOngoingOrders();

  // Extract and map backend data to your format (do this before early returns)
  // API returns camelCase responseDetails
  const backendOrders = data?.responseDetails?.results || [];

  // Ongoing = not PENDING (not yet accepted) and not PACKAGE_DELIVERED (already done)
  const ongoingBackendOrders = backendOrders.filter(order =>
    order.progress !== 'PACKAGE_DELIVERED' &&
    order.progress !== 'PENDING'
  );

  // Limit to 3 orders for dashboard view
  const limitedOrders = ongoingBackendOrders.slice(0, 5);

  // Map backend fields to your UI format
  const orders = limitedOrders.map((order) => ({
    id: order.delivery_id,
    orderId: order.request_id,
    orderDate: new Date(order.created_at).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    riderName: order.rider_name || 'Unknown Rider',
    customerName: order.customer_name || 'Unknown Customer',
    pickupLocation: {
      name: order.sender_address?.split(',')[0] || 'Pickup Location',
      address: order.sender_address || 'Address not available',
      lat: parseFloat(order.pickup_latitude),
      lng: parseFloat(order.pickup_longitude),
    },
    destination: {
      name: order.receiver_address?.split(',')[0] || 'Destination',
      address: order.receiver_address || 'Address not available',
      lat: parseFloat(order.dropoff_latitude),
      lng: parseFloat(order.dropoff_longitude),
    },
    status: order.status,
    progress: order.progress,
    progressArray: order.progress_array || [],
    amount: order.amount,
    mapPreview: null,
  }));

  // Filter orders based on search
  const filteredOrders = orders.filter((order) =>
    order.orderId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Set first order as selected on initial load
  // MUST be called before any conditional returns!
  useEffect(() => {
    // When data loads successfully and we have orders, select the first one
    if (!isLoading && !isError && filteredOrders.length > 0 && selectedOrderId === null) {
      console.log('🎯 Auto-selecting first order:', filteredOrders[0].orderId);
      setSelectedOrderId(filteredOrders[0].id);
    }
  }, [isLoading, isError, filteredOrders.length]);

  // Now we can do early returns (after all hooks are called)
  // Loading state - Show skeleton
  if (isLoading) {
    return <OngoingOrdersSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error loading orders</h3>
        <p className="text-red-600 text-sm">{error?.response?.data?.responseMessage || error?.message || 'Something went wrong'}</p>
      </div>
    );
  }

  console.log('✅ Total Backend Orders:', backendOrders.length);
  console.log('✅ Ongoing Orders (filtered):', ongoingBackendOrders.length);
  console.log('✅ Showing (limited to 3):', orders.length);

  return (
    // sticky: once this section scrolls to the top it locks in place.
    // The height is capped so the two panels never overflow the viewport.
    <div className="sticky top-0 z-10 bg-gray-50 pt-1">
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        style={{ height: 'calc(100vh - 88px)' }}  // 88px = header height
      >
        {/* Left Side — header stays fixed, order cards scroll */}
        <div className="flex flex-col bg-white p-4 rounded-xl overflow-hidden">
          {/* Header with Search — sticks to top of left panel */}
          <div className="mb-4 flex justify-between items-center flex-shrink-0">
            <h3 className="text-[1.1rem] font-medium text-gray-900">
              Ongoing Order
            </h3>

            {/* Search Bar */}
            <div className="relative w-[45%]">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by Order ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-[2rem] text-[.7rem] focus:outline-none focus:ring-2 focus:ring-[#FFF4E8] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Order Cards — scrollable, takes remaining height */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {filteredOrders.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No ongoing orders found</p>
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

        {/* Right Side — Map fills full height and stays visible */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
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

export default OngoingOrder;