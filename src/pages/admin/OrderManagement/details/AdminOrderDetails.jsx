import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  RefreshCw,
  AlertTriangle,
  X,
  Camera,
  CheckCircle2,
} from "lucide-react";
import {
  ORDER_STATUS_CONFIG,
  INITIAL_ADMIN_ORDERS,
  normalizeOrderStatus,
} from "../adminOrders.config";
import { useOngoingOrders } from "../../../../api/dashboard.queries";
import ReassignRiderModal from "../modals/ReassignRiderModal";
import EscalateIssueModal from "../modals/EscalateIssueModal";
import CancelOrderModal from "../modals/CancelOrderModal";

const AdminOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState(null); // "reassign" | "escalate" | "cancel"
  const [orderState, setOrderState] = useState(null);

  // Fetch real ongoing orders if available
  const { data: ongoingData } = useOngoingOrders();

  useEffect(() => {
    // 1. Look in INITIAL_ADMIN_ORDERS first
    let found = INITIAL_ADMIN_ORDERS.find(
      (o) => o.id === orderId || o.orderId === orderId
    );

    // 2. Fallback to ongoing orders from API
    if (!found && ongoingData?.responseDetails?.results) {
      const apiOrder = ongoingData.responseDetails.results.find(
        (o) =>
          String(o.request_id) === String(orderId) ||
          String(o.delivery_id) === String(orderId)
      );
      if (apiOrder) {
        const normStatus = normalizeOrderStatus(apiOrder.status);
        found = {
          id: apiOrder.request_id,
          orderId: apiOrder.request_id,
          customer: apiOrder.sender_name || "Uche Kalu",
          rider: apiOrder.rider_name || "Emeka Okoli",
          fleet: "Swift Logistics",
          status: normStatus,
          amount: apiOrder.amount || 4500,
          placedAt: `Placed ${new Date(apiOrder.created_at || Date.now()).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })} · ${new Date(apiOrder.created_at || Date.now()).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          distance: "11.4 km",
          paymentMethod: "Card",
          packageType: "Document",
          sender: {
            name: apiOrder.sender_name || "Uche Kalu",
            phone: apiOrder.sender_phone || "07045679109",
            pickupAddress: apiOrder.sender_address || "New Benin",
          },
          recipient: {
            name: apiOrder.receiver_name || "Chinedu Okoro",
            phone: apiOrder.receiver_phone || "08033441120",
            dropoffAddress: apiOrder.receiver_address || "Oluku",
            deliveryNote: '"Call on arrival"',
          },
          riderDetails:
            normStatus === "pending"
              ? null
              : {
                  name: apiOrder.rider_name || "Emeka Nwankwo",
                  code: `RDR-${apiOrder.rider_profile_id || 2041}`,
                  fleet: "Swift Logistics",
                  phone: "08031120045",
                  rating: 4.8,
                  initials: "EN",
                },
          timeline: [
            {
              title: "Order placed",
              description: "Customer placed the order in the app",
              time: "Oct 20, 2026 · 08:05",
              status: "completed",
            },
            {
              title: "Rider assigned",
              description: `${apiOrder.rider_name || "Emeka Nwankwo"} (Swift Dispatch)`,
              time: "08:12",
              status: normStatus === "pending" ? "pending" : "completed",
            },
            {
              title: "Picked up",
              description: "Package collected from the sender",
              time: "08:31",
              status: ["in_transit", "delivered", "picked_up"].includes(normStatus)
                ? "completed"
                : "pending",
            },
            {
              title: "In transit",
              description: "Rider is heading to the recipient",
              time: "08:38",
              status: ["in_transit", "delivered"].includes(normStatus)
                ? "completed"
                : "pending",
            },
            {
              title: "Delivered",
              description: normStatus === "delivered" ? "Completed" : "Upcoming",
              time: normStatus === "delivered" ? "09:02" : "Not yet",
              status: normStatus === "delivered" ? "completed" : "pending",
            },
          ],
        };
      }
    }

    // Default fallback to first mock order if not found
    if (!found) {
      found = INITIAL_ADMIN_ORDERS[0];
    }

    setOrderState(found);
  }, [orderId, ongoingData]);

  if (!orderState) {
    return (
      <div className="p-8 text-center text-gray-500 font-poppins">
        Loading order details...
      </div>
    );
  }

  const currentStatus = normalizeOrderStatus(orderState.status);
  const statusConfig = ORDER_STATUS_CONFIG[currentStatus] || ORDER_STATUS_CONFIG.in_transit;

  const isDelivered = currentStatus === "delivered";
  const isCancelled = currentStatus === "cancelled";
  const isFailed = currentStatus === "failed";
  const isPending = currentStatus === "pending";

  const handleReassignConfirm = ({ rider, note }) => {
    setOrderState((prev) => ({
      ...prev,
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
      timeline: [
        prev.timeline[0],
        {
          title: "Rider assigned",
          description: `${rider.name} (${rider.fleet}) - Reassigned`,
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          status: "completed",
        },
        ...prev.timeline.slice(2),
      ],
    }));
  };

  const handleEscalateConfirm = ({ issue, priority, description }) => {
    setOrderState((prev) => ({
      ...prev,
      isEscalated: true,
      escalationMessage: `Issue escalated. ${issue} - ${priority.charAt(0).toUpperCase() + priority.slice(1)} priority. The operations team has been notified.`,
      timeline: [
        ...prev.timeline,
        {
          title: "Issue escalated",
          description: `${issue} · ${priority.charAt(0).toUpperCase() + priority.slice(1)} priority`,
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          status: "escalated",
        },
      ],
    }));
  };

  const handleCancelConfirm = ({ reason }) => {
    setOrderState((prev) => ({
      ...prev,
      status: "cancelled",
      cancelledMessage: `Order cancelled. Reason: ${reason}.`,
      timeline: [
        prev.timeline[0],
        prev.timeline[1] || {
          title: "Rider assigned",
          description: "Aisha Bello (Independent)",
          time: "08:12",
          status: "completed",
        },
        {
          title: "Order cancelled",
          description: `${reason} · Refund initiated`,
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          status: "cancelled",
        },
      ],
    }));
  };

  return (
    <div className="space-y-5 font-poppins pb-10">
      {/* Header matching Screen 3: "Riders Details" with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/order-management")}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          title="Back to Order Management"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-[#1E2A5E]">Riders Details</h1>
      </div>

      {/* Alert Banners (Matching Screens 8 & 11) */}
      {isCancelled && (
        <div className="p-3.5 px-4 bg-slate-100/90 border border-slate-200 text-slate-700 text-xs rounded-xl flex items-center gap-2">
          <span>{orderState.cancelledMessage || "Order cancelled. Reason: Customer requested cancellation."}</span>
        </div>
      )}

      {orderState.isEscalated && (
        <div className="p-3.5 px-4 bg-[#FFF8EE] border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2">
          <span>
            {orderState.escalationMessage ||
              "Issue escalated. Recipient unreachable - High priority. The operations team has been notified."}
          </span>
        </div>
      )}

      {isFailed && (
        <div className="p-3.5 px-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <span>
            {orderState.failedMessage ||
              "Delivery failed. Recipient was unreachable after three call attempts."}
          </span>
        </div>
      )}

      {/* Main Top Card (Order ID, Status, Actions, Metrics) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#1E2A5E]">
                {orderState.orderId || "ORD-48201"}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusConfig.badgeClass}`}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {orderState.placedAt || "Placed Oct 20, 2026 · 08:05"}
            </p>
          </div>

          {/* Action Buttons (Screen 3, 7, 9, 10, 11) */}
          {!isCancelled && (
            <div className="flex items-center gap-2.5 flex-wrap">
              {!isDelivered && !isFailed && (
                <button
                  type="button"
                  onClick={() => setActiveModal("reassign")}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors shadow-2xs"
                >
                  <RefreshCw size={13} className="text-gray-500" />
                  <span>Reassign Rider</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveModal("escalate")}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-amber-700 bg-amber-50/60 border border-amber-300/80 hover:bg-amber-100/50 rounded-xl transition-colors shadow-2xs"
              >
                <AlertTriangle size={13} className="text-amber-600" />
                <span>Escalate Issue</span>
              </button>

              {!isDelivered && !isFailed && (
                <button
                  type="button"
                  onClick={() => setActiveModal("cancel")}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-600 bg-rose-50/40 border border-rose-300 hover:bg-rose-100/40 rounded-xl transition-colors shadow-2xs"
                >
                  <X size={14} className="text-rose-600" />
                  <span>Cancel Order</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* 4 Summary Metrics (Amount, Distance, Payment, Package) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <span className="text-[11px] font-semibold text-gray-400 block mb-1">
              Amount
            </span>
            <span className="text-sm font-bold text-gray-900">
              ₦{Number(orderState.amount || 4500).toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-gray-400 block mb-1">
              Distance
            </span>
            <span className="text-sm font-bold text-gray-900">
              {orderState.distance || "11.4 km"}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-gray-400 block mb-1">
              Payment
            </span>
            <span className="text-sm font-bold text-gray-900">
              {orderState.paymentMethod || "Card"}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-gray-400 block mb-1">
              Package
            </span>
            <span className="text-sm font-bold text-gray-900">
              {orderState.packageType || "Document"}
            </span>
          </div>
        </div>
      </div>

      {/* Lower Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Details Cards (Sender, Recipient, Rider) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Sender Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Sender Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-gray-400 block">Name</span>
                <span className="text-xs font-semibold text-gray-800">
                  {orderState.sender?.name || "Uche Kalu"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block">Phone</span>
                <span className="text-xs font-semibold text-gray-800">
                  {orderState.sender?.phone || "07045679109"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block">Pickup address</span>
                <span className="text-xs font-semibold text-gray-800">
                  {orderState.sender?.pickupAddress || "New Benin"}
                </span>
              </div>
            </div>
          </div>

          {/* Recipient Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Recipient Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-gray-400 block">Name</span>
                <span className="text-xs font-semibold text-gray-800">
                  {orderState.recipient?.name || "Chinedu Okoro"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block">Phone</span>
                <span className="text-xs font-semibold text-gray-800">
                  {orderState.recipient?.phone || "08033441120"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block">Drop-off address</span>
                <span className="text-xs font-semibold text-gray-800">
                  {orderState.recipient?.dropoffAddress || "Oluku"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block">Delivery note</span>
                <span className="text-xs font-semibold text-gray-800">
                  {orderState.recipient?.deliveryNote || '"Call on arrival"'}
                </span>
              </div>
            </div>
          </div>

          {/* Rider Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Rider Details</h3>
            {isPending || !orderState.riderDetails ? (
              <p className="text-xs text-gray-400 leading-relaxed py-2">
                No rider has been assigned to this order yet.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {orderState.riderDetails.initials || "EN"}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      {orderState.riderDetails.name}
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      {orderState.riderDetails.code || "RDR-2041"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-1 border-t border-gray-50">
                  <div>
                    <span className="text-[11px] text-gray-400 block">Fleet</span>
                    <span className="text-xs font-semibold text-gray-800">
                      {orderState.riderDetails.fleet || "Swift Logistics"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 block">Phone</span>
                    <span className="text-xs font-semibold text-gray-800">
                      {orderState.riderDetails.phone || "08031120045"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 block">Rating</span>
                    <span className="text-xs font-semibold text-gray-800">
                      {orderState.riderDetails.rating || "4.8"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Timeline & Delivery Proof */}
        <div className="lg:col-span-8 space-y-5">
          {/* Timeline Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-gray-900">Timeline</h3>

            <div className="relative pl-6 space-y-6">
              {/* Stepper Vertical Line */}
              <div className="absolute left-[11px] top-2 bottom-4 w-0.5 bg-gray-200" />

              {orderState.timeline?.map((step, idx) => {
                let dotStyle = "border-2 border-gray-300 bg-white";
                if (step.status === "completed") {
                  dotStyle = "bg-emerald-600 border-2 border-emerald-600";
                } else if (step.status === "failed") {
                  dotStyle = "bg-rose-500 border-2 border-rose-500";
                } else if (step.status === "escalated") {
                  dotStyle = "bg-amber-500 border-2 border-amber-500";
                } else if (step.status === "cancelled") {
                  dotStyle = "bg-slate-400 border-2 border-slate-400";
                }

                return (
                  <div key={idx} className="relative flex items-start gap-3">
                    {/* Circle Dot */}
                    <div
                      className={`absolute -left-6 top-1 w-3 h-3 rounded-full ${dotStyle} ring-4 ring-white`}
                    />
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-gray-900">
                        {step.title}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {step.description}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {step.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Proof Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Delivery Proof</h3>

            {isDelivered ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo Proof */}
                  <div className="rounded-xl border border-gray-200 bg-[#F4F6FB] p-6 flex flex-col items-center justify-center text-center min-h-[140px]">
                    <span className="text-[11px] font-medium text-gray-400 mb-3 self-start">
                      Photo at drop-off
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 mb-2 shadow-2xs">
                      <Camera size={18} />
                    </div>
                    <span className="text-xs text-gray-500">
                      Rider photo of parcel at door
                    </span>
                  </div>

                  {/* Recipient Signature */}
                  <div className="rounded-xl border border-gray-200 bg-[#F4F6FB] p-6 flex flex-col items-center justify-center text-center min-h-[140px]">
                    <span className="text-[11px] font-medium text-gray-400 mb-3 self-start">
                      Recipient signature
                    </span>
                    <svg
                      viewBox="0 0 200 60"
                      className="w-40 h-12 text-[#1E2A5E] stroke-current fill-none stroke-[2.5]"
                    >
                      <path d="M10,40 Q30,10 50,35 T90,30 T130,45 T170,25 T190,35" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-700 mt-2">
                      {orderState.signerName || "Funke Bakare"}
                    </span>
                  </div>
                </div>

                {/* Proof Details Footer */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-100 text-xs">
                  <div>
                    <span className="text-[11px] text-gray-400 block mb-0.5">
                      Delivered at
                    </span>
                    <span className="font-semibold text-gray-800">
                      {orderState.deliveredAt || "Oct 20, 2026 · 09:02"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-gray-400 block mb-0.5">
                      Delivery code
                    </span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      {orderState.deliveryCode || "Verified by recipient"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-gray-400 block mb-0.5">
                      Location check
                    </span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      {orderState.locationCheck || "Matched drop-off address"}
                    </span>
                  </div>
                </div>
              </div>
            ) : isFailed ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-xs text-rose-800 space-y-1">
                <div className="font-bold text-rose-900">
                  Delivery attempt failed
                </div>
                <p className="text-rose-700 leading-relaxed">
                  Recipient was unreachable after three call attempts. No proof of delivery was captured. The rider returned the parcel to the sender.
                </p>
              </div>
            ) : isCancelled ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-400">
                This order was cancelled, so there is no delivery proof.
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-400">
                Delivery proof appears here once the rider completes the delivery.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReassignRiderModal
        isOpen={activeModal === "reassign"}
        onClose={() => setActiveModal(null)}
        order={orderState}
        onConfirm={handleReassignConfirm}
      />

      <EscalateIssueModal
        isOpen={activeModal === "escalate"}
        onClose={() => setActiveModal(null)}
        order={orderState}
        onConfirm={handleEscalateConfirm}
      />

      <CancelOrderModal
        isOpen={activeModal === "cancel"}
        onClose={() => setActiveModal(null)}
        order={orderState}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
};

export default AdminOrderDetails;
