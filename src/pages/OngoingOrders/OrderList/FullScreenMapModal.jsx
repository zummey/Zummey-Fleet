import React from 'react';
import { X } from 'lucide-react';
import MapView from './MapView'; // Your existing MapView component

/**
 * FullScreenMapModal - Simple wrapper around your existing MapView
 * Just formats the order data and displays it full-screen
 */
const FullScreenMapModal = ({ orderData, onClose }) => {
  if (!orderData) return null;

  // Format order data to match your MapView's expected format
  const formattedOrder = {
    id: orderData.delivery_id || orderData.request_id,
    orderId: orderData.request_id,
    orderDate: new Date(orderData.created_at).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    pickupLocation: {
      name: orderData.sender_address?.split(',')[0] || 'Pickup Location',
      address: orderData.sender_address || 'Address not available',
      lat: orderData.pickup_latitude,
      lng: orderData.pickup_longitude,
    },
    destination: {
      name: orderData.receiver_address?.split(',')[0] || 'Destination',
      address: orderData.receiver_address || 'Address not available',
      lat: orderData.dropoff_latitude,
      lng: orderData.dropoff_longitude,
    },
    status: orderData.status,
    progress: orderData.progress,
    amount: orderData.amount,
    mapPreview: null,
  };

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white shadow-md z-10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#343C6A]">
              Track Order - {orderData.request_id}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Live route from pickup to destination
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close (ESC)"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Order Info Card */}
      <div className="absolute top-24 left-6 bg-white rounded-xl shadow-lg p-4 z-10 max-w-sm">
        <div className="space-y-3">
          {/* Pickup */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Pickup Location</p>
              <p className="text-sm font-medium text-gray-900">
                {formattedOrder.pickupLocation.address}
              </p>
            </div>
          </div>

          {/* Vertical Line */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 ml-[6px]">
              <div className="w-0.5 h-8 bg-gray-300"></div>
            </div>
          </div>

          {/* Destination */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Destination</p>
              <p className="text-sm font-medium text-gray-900">
                {formattedOrder.destination.address}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                orderData.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                orderData.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
                orderData.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {orderData.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Map - Using your existing MapView component */}
      <div className="w-full h-full pt-20">
        <MapView 
          orders={[formattedOrder]} 
          selectedOrderId={formattedOrder.id}
          isLoading={false}
        />
      </div>
    </div>
  );
};

export default FullScreenMapModal;