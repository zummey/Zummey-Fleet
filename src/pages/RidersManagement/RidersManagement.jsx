import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Car from '../../assets/car-01.png';
import RiderDetailsModal from './modals/RiderDetailsModal';
import DeleteRiderModal from './modals/DeleteRiderModal';
import DeleteSuccessModal from './modals/DeleteSuccessModal';
import RidersManagementSkeleton from './RidersManagementSkelecton';
import { useGetRiders, useDeleteRider } from '../../api/authRiders.mutations';

// Separate component so hooks (useGetRiderById) are called per-row, not inside a map
const RiderRow = ({ rider, pendingRiders = [], getStatusStyle, onViewDetails, onCompleteRegistration }) => {
  // No API calls needed — uses the non-discardable pendingRiders list

  const firstName = rider.first_name || rider.firstName || rider.user?.first_name || 'N/A';
  const lastName = rider.last_name || rider.lastName || rider.user?.last_name || '';
  const email = rider.user_email || rider.email || rider.user?.email || 'N/A';
  const phone = rider.user_phone || rider.phoneNumber || rider.phone_number || rider.user?.phone_number || 'N/A';
  const isOnline = rider.is_online;
  const status = isOnline === true ? 'Online' : isOnline === false ? 'Offline' : (rider.status || 'Offline');
  const riderId = rider.id || rider.profile_id || rider.user_id || '—';

  // Incomplete = rider is in the non-discardable pendingRiders list.
  // Persists even after the top banner is discarded.
  const isIncomplete = pendingRiders.some(
    p =>
      String(p.riderId) === String(rider?.id) ||
      p.email === (rider?.user_email || rider?.email)
  );

  return (
    <tr className={`hover:bg-gray-50 shadow-sm rounded-b-lg rounded-t-lg ${isIncomplete ? 'bg-red-50/40' : ''}`}>
      {/* Avatar */}
      <td className="px-2 py-4">
        {rider.profile_picture_url ? (
          <img
            src={rider.profile_picture_url}
            alt={`${firstName} ${lastName}`}
            className="w-12 h-12 rounded-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div
          className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full items-center justify-center"
          style={{ display: rider.profile_picture_url ? 'none' : 'flex' }}
        >
          <span className="text-white font-semibold text-lg">
            {firstName[0]}{lastName[0]}
          </span>
        </div>
      </td>

      {/* Name + incomplete indicator */}
      <td className="px-2 py-4">
        <div className="flex items-center gap-2">
          <div>
            <p className="font-medium text-sm text-gray-900">{firstName} {lastName}</p>
            <p className="text-sm text-gray-500">ID {riderId}</p>
          </div>
          {isIncomplete && (
            <div className="relative group flex-shrink-0">
              <button
                onClick={() => onCompleteRegistration(rider)}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                <AlertCircle size={18} />
              </button>
              {/* Tooltip — drops downward */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block z-10 whitespace-nowrap">
                <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mb-1" />
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 shadow-lg">
                  Complete Registration
                </div>
              </div>
            </div>
          )}
        </div>
      </td>

      {/* Phone */}
      <td className="px-2 py-4">
        <p className="text-sm font-medium text-gray-900">{phone}</p>
        <p className="text-xs text-gray-500">Contact</p>
      </td>

      {/* Email */}
      <td className="px-2 py-4">
        <p className="text-sm font-medium text-gray-900">{email}</p>
        <p className="text-xs text-gray-500">Email</p>
      </td>

      {/* Status */}
      <td className="px-2 py-4">
        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(status)}`}>
          {status}
        </span>
      </td>

      {/* Action */}
      <td className="px-2 py-4">
        <button
          onClick={() => onViewDetails(rider)}
          className="px-4 py-2 border-[.06em] cursor-pointer border-black rounded-[2em] text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          View Details
        </button>
      </td>
    </tr>
  );
};


const RidersManagement = () => {
  const navigate = useNavigate();
  const [incompleteRegistration, setIncompleteRegistration] = useState(null);
  // pendingRiders: separate from the banner — not discardable, persists until
  // the rider finishes ALL stages or is deleted by the fleet manager.
  const [pendingRiders, setPendingRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  // Fetch riders from API — React Query auto-refreshes when cache is invalidated
  const { data: ridersData, isLoading: ridersLoading } = useGetRiders();
  // API response: { responseDetails: { count, results: [...] } }
  const riders = Array.isArray(ridersData?.responseDetails?.results)
    ? ridersData.responseDetails.results
    : Array.isArray(ridersData?.results)
      ? ridersData.results
      : Array.isArray(ridersData)
        ? ridersData
        : [];

  // Reset to page 1 whenever the riders list changes length
  useEffect(() => {
    setCurrentPage(1);
  }, [riders.length]);

  const totalPages = Math.max(1, Math.ceil(riders.length / PAGE_SIZE));
  const paginatedRiders = riders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // On mount: load banner data + build the non-discardable pendingRiders list
  useEffect(() => {
    // ── Banner (discardable) ──────────────────────────────────────────────────
    const savedRegistration = localStorage.getItem('riderRegistration');
    let reg = null;
    if (savedRegistration) {
      try { reg = JSON.parse(savedRegistration); } catch (_) { }
    }
    if (reg && reg.currentStep !== 'completed') {
      setIncompleteRegistration(reg);
    }

    // ── Table icons (NOT discardable) ─────────────────────────────────────────
    let pending = [];
    const pendingRaw = localStorage.getItem('pendingRiderRegistrations');
    if (pendingRaw) {
      try { pending = JSON.parse(pendingRaw); } catch (_) { pending = []; }
    }
    // If the banner registration is incomplete, ensure it's in the pending list
    if (reg && reg.currentStep !== 'completed') {
      const exists = pending.some(
        p => String(p.riderId) === String(reg.riderId) || p.email === reg.email
      );
      if (!exists) {
        pending = [...pending, { riderId: reg.riderId, email: reg.email }];
        localStorage.setItem('pendingRiderRegistrations', JSON.stringify(pending));
      }
    }
    // If the banner registration IS completed, remove it from pending
    if (reg && reg.currentStep === 'completed') {
      pending = pending.filter(
        p => String(p.riderId) !== String(reg.riderId) && p.email !== reg.email
      );
      localStorage.setItem('pendingRiderRegistrations', JSON.stringify(pending));
    }
    setPendingRiders(pending);

    // ── React to localStorage changes triggered by RegistrationCompleteModal ──
    // The 'storage' event fires when another tab changes localStorage, but we
    // also use a custom 'registrationComplete' event for same-tab navigation.
    const handleRegistrationComplete = () => {
      setIncompleteRegistration(null);
      setPendingRiders([]);
    };
    window.addEventListener('registrationComplete', handleRegistrationComplete);
    return () => window.removeEventListener('registrationComplete', handleRegistrationComplete);
  }, []);

  const handleAddRider = () => {
    navigate('/riders-management/add-rider/signup');
  };

  const handleResumeRegistration = () => {
    const step = incompleteRegistration.currentStep;

    const stepRoutes = {
      'otp-verification': '/riders-management/add-rider/signup',
      'personal-info': '/riders-management/add-rider/personal-info',
      'legal-licensing': '/riders-management/add-rider/legal-licensing',
      'document-upload': '/riders-management/add-rider/document-upload',
    };

    navigate(stepRoutes[step] || '/riders-management/add-rider/signup');
  };

  const handleDiscardIncomplete = () => {
    // Save the current step into pendingRiders BEFORE clearing the banner,
    // so clicking the table icon later still resumes from the correct step.
    if (incompleteRegistration) {
      const updated = pendingRiders.map(p => {
        const matches =
          String(p.riderId) === String(incompleteRegistration.riderId) ||
          p.email === incompleteRegistration.email;
        return matches
          ? { ...p, currentStep: incompleteRegistration.currentStep }
          : p;
      });
      // If this rider wasn't in pendingRiders yet, add it with the step
      const exists = updated.some(
        p =>
          String(p.riderId) === String(incompleteRegistration.riderId) ||
          p.email === incompleteRegistration.email
      );
      const final = exists
        ? updated
        : [...updated, {
          riderId: incompleteRegistration.riderId,
          email: incompleteRegistration.email,
          currentStep: incompleteRegistration.currentStep,
        }];
      setPendingRiders(final);
      localStorage.setItem('pendingRiderRegistrations', JSON.stringify(final));
    }
    // Only dismisses the TOP BANNER — does NOT remove the table row icon
    localStorage.removeItem('riderRegistration');
    setIncompleteRegistration(null);
  };

  // Resume registration for a specific rider row.
  // Check localStorage first — if this rider already has a saved step, resume from there.
  // Never overwrite localStorage blindly.
  const handleCompleteRegistration = (rider) => {
    const riderEmail = rider.user_email || rider.email || '';
    const riderId = rider.id;

    // Ensure this rider is in the pendingRiders list (table icon persists)
    const alreadyPending = pendingRiders.some(
      p => String(p.riderId) === String(riderId) || p.email === riderEmail
    );
    if (!alreadyPending) {
      const updated = [...pendingRiders, { riderId, email: riderEmail }];
      setPendingRiders(updated);
      localStorage.setItem('pendingRiderRegistrations', JSON.stringify(updated));
    }

    // Check if riderRegistration localStorage has a saved step for this rider
    const saved = localStorage.getItem('riderRegistration');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const sameRider =
          String(data.riderId) === String(riderId) || data.email === riderEmail;
        if (sameRider && data.currentStep !== 'completed') {
          const stepRoutes = {
            'otp-verification': '/riders-management/add-rider/signup',
            'personal-info': '/riders-management/add-rider/personal-info',
            'legal-licensing': '/riders-management/add-rider/legal-licensing',
            'document-upload': '/riders-management/add-rider/document-upload',
          };
          navigate(stepRoutes[data.currentStep] || '/riders-management/add-rider/personal-info');
          return;
        }
      } catch (_) { }
    }

    // riderRegistration is absent (was discarded) — fall back to the step
    // saved in pendingRiders when the banner was discarded.
    const pendingEntry = pendingRiders.find(
      p => String(p.riderId) === String(riderId) || p.email === riderEmail
    );
    const savedStep = pendingEntry?.currentStep || 'personal-info';

    const stepRoutes = {
      'otp-verification': '/riders-management/add-rider/signup',
      'personal-info': '/riders-management/add-rider/personal-info',
      'legal-licensing': '/riders-management/add-rider/legal-licensing',
      'document-upload': '/riders-management/add-rider/document-upload',
    };

    // Re-seed riderRegistration with the correct step so the banner also re-appears
    const registrationData = {
      riderId,
      email: riderEmail,
      currentStep: savedStep,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('riderRegistration', JSON.stringify(registrationData));
    setIncompleteRegistration(registrationData);
    navigate(stepRoutes[savedStep] || '/riders-management/add-rider/personal-info');
  };

  const handleViewDetails = (rider) => {
    setSelectedRider(rider);
    setShowDetailsModal(true);
  };

  const handleDeleteRider = (rider) => {
    setSelectedRider(rider);
    setShowDetailsModal(false);
    setShowDeleteModal(true);
  };

  // useDeleteRider handled via API mutations
  const { mutate: deleteRiderMutation } = useDeleteRider();

  const confirmDelete = () => {
    deleteRiderMutation(selectedRider?.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setShowDeleteSuccess(true);
        // Also remove this rider from the non-discardable pendingRiders list
        if (selectedRider) {
          const updated = pendingRiders.filter(
            p =>
              String(p.riderId) !== String(selectedRider.id) &&
              p.email !== (selectedRider.user_email || selectedRider.email)
          );
          setPendingRiders(updated);
          localStorage.setItem('pendingRiderRegistrations', JSON.stringify(updated));
        }
      }
    });
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'offline':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ✅ SHOW SKELETON WHILE LOADING
  if (ridersLoading) {
    return <RidersManagementSkeleton />;
  }

  return (
    <div className="space-y-6 font-poppins">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[1.2rem] font-semibold text-[#343C6A]">Riders Management</h2>

        {riders.length > 0 ? (
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <span className="text-sm">Sort By</span>
              <ChevronDown size={16} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter size={16} />
              <span className="text-sm">Filter</span>
            </button>
            <button
              onClick={handleAddRider}
              className="flex cursor-pointer items-center gap-2 px-7 py-2 bg-[#1E2A5E] text-white rounded-lg hover:bg-[#162042] transition-colors"
            >
              <span className="text-[1rem]">+</span>
              <span>Add Rider</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddRider}
            className="flex items-center gap-2 px-7 py-2 bg-[#1E2A5E] text-white rounded-lg hover:bg-[#162042] transition-colors"
          >
            <span className="text-[1rem]">+</span>
            <span>Add Rider</span>
          </button>
        )}
      </div>

      {/* Incomplete Registration Alert */}
      {incompleteRegistration && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-1">
                Incomplete Rider Registration
              </h3>
              <p className="text-sm text-orange-800 mb-3">
                You have an incomplete rider registration from{' '}
                {new Date(incompleteRegistration.timestamp).toLocaleDateString()}.
                Email: <span className="font-medium">{incompleteRegistration.email}</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleResumeRegistration}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                >
                  Resume Registration
                </button>
                <button
                  onClick={handleDiscardIncomplete}
                  className="px-4 py-2 bg-white border border-orange-300 text-orange-800 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State or Riders List */}
      {riders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-14 h-24 flex items-center justify-center">
            <img src={Car} alt="Car" width={35} />
          </div>
          <h3 className="text-xl font-semibold text-[#343C6A] mb-2">No Drivers Added Yet</h3>
          <p className="text-[#001940] text-center max-w-md mb-6">
            You haven't added any drivers to your fleet. Add a driver to start assigning vehicles
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">

              <tbody className="divide-y divide-gray-200">
                {paginatedRiders.map((rider) => (
                  <RiderRow
                    key={rider.id || rider.profile_id}
                    rider={rider}
                    pendingRiders={pendingRiders}
                    getStatusStyle={getStatusStyle}
                    onViewDetails={handleViewDetails}
                    onCompleteRegistration={handleCompleteRegistration}
                    incompleteRegistration={incompleteRegistration}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-700 font-medium">
              {currentPage} <span className="text-gray-400 font-normal">of</span> {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <RiderDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        rider={selectedRider}
        onDelete={handleDeleteRider}
      />

      <DeleteRiderModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        riderName={selectedRider ? (selectedRider.full_name || `${selectedRider.first_name || selectedRider.firstName || ''} ${selectedRider.last_name || selectedRider.lastName || ''}`.trim()) : ''}
      />

      <DeleteSuccessModal
        isOpen={showDeleteSuccess}
        onClose={() => setShowDeleteSuccess(false)}
      />
    </div>
  );
};

export default RidersManagement;