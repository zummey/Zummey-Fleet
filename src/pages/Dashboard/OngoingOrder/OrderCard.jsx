import React from "react";
import { FileText, MapPin } from "lucide-react";
import { IMAGE_BASE64 } from "./link";
import border from "../../../assets/border.png";

/**
 * OrderCard Component
 * Displays a single order with pickup/destination and mini map preview
 */
const OrderCard = ({ order, isSelected, onViewDetails }) => {
  return (
    <div className={`bg-white relative w-full max-w-3xl transition-all ${isSelected ? 'ring-2 ring-[#EB4827] shadow-lg' : ''}`}>
      <img src={border} alt="" className="w-full min-h-[320px]" />
      {/* Order Header */}
      <div className="absolute inset-0 flex flex-col justify-center p-4 ">
        <div className="flex items-center justify-between mb-8 pt-4 pb-2 border-b border-dashed border-gray-400 ">
          <div className="flex items-center gap-2 ">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="text-blue-600" size={15} />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">Order ID:</p>
              <p className="text-sm font-medium text-[#344054]">
                {order.orderId}
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-500">{order.orderDate}</span>
        </div>

        {/* Pickup & Destination */}
        <div className=" mb-4  flex flex-col gap-10 relative">
          {/* Pickup Location */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-0.5">Pickup Location</p>
              <p className="text-sm font-medium text-gray-900">
                {order.pickupLocation.name}
              </p>
              <p className="text-xs text-gray-500">
                {order.pickupLocation.address}
              </p>
            </div>
            {/* Mini Map Preview */}
            <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
              <img
                src={order.mapPreview || IMAGE_BASE64}
                alt="Map preview"
                className="w-full h-full object-cover"
                onClick={onViewDetails}
              />
            </div>
          </div>

          {/* Vertical Line */}
          <div className="flex gap-3 absolute left-[0%] top-[14%]">
            <div className="flex-shrink-0 ml-1">
              <div className="w-0.5 h-20 bg-gray-300"></div>
            </div>
          </div>

          {/* Destination */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                <MapPin className="text-white" size={9} />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-0.5">Destination</p>
              <p className="text-sm font-medium text-gray-900">
                {order.destination.name}
              </p>
              <p className="text-xs text-gray-500">
                {order.destination.address}
              </p>
            </div>
          </div>
        </div>

        {/* View Details Button */}
        <div className="border-t border-dashed border-gray-400 w-full" > 
            <button 
              onClick={onViewDetails}
              className="w-full pb-4 text-right text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors flex justify-end mt-4 cursor-pointer"
            >
              View Details
            </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;