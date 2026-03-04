import React, { useState, useEffect } from 'react';
import { X, Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useGetRiderById, useUpdateRider } from '../../../api/authRiders.mutations';

const RiderDetailsModal = ({ isOpen, onClose, rider, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    user_email: '',
    user_phone: '',
    license_number: '',
    license_expiry: '',
    state: '',
    city: '',
    profile_picture_url: '',
  });

  // Fetch full rider details by ID — the list endpoint omits license fields
  const { data: fullRider, isLoading: loadingDetails } = useGetRiderById(
    isOpen ? rider?.id : null
  );

  const { mutate: updateRider, isPending: isSaving } = useUpdateRider();

  // Merge list-level data with full detail data (full detail wins)
  const riderData = fullRider ? { ...rider, ...fullRider } : rider;

  // Build formData from merged rider data whenever it changes
  useEffect(() => {
    if (riderData) {
      setFormData({
        full_name: riderData.full_name || `${riderData.first_name || ''} ${riderData.last_name || ''}`.trim(),
        user_email: riderData.user_email || riderData.email || '',
        user_phone: riderData.user_phone || riderData.phone || '',
        license_number: riderData.license_info?.driver_license_number || '',
        license_expiry: riderData.license_info?.license_number_expiry_date || '',
        state: riderData.state || '',
        city: riderData.city || '',
        profile_picture_url: riderData.profile_picture_url || '',
      });
    }
  }, [fullRider, rider]);

  // Reset edit mode + feedback whenever modal opens for a different rider
  useEffect(() => {
    if (isOpen) {
      setIsEditing(false);
      setSaveError('');
      setSaveSuccess(false);
    }
  }, [rider?.id]);

  if (!isOpen || !rider) return null;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setSaveError('');
    setSaveSuccess(false);

    // Split full_name back into first_name / last_name for the API
    const nameParts = formData.full_name.trim().split(' ');
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    const payload = {
      first_name,
      last_name,
      state: formData.state,
      city: formData.city,
      driver_license_number: formData.license_number,
      license_number_expiry_date: formData.license_expiry,
    };

    updateRider(
      { id: rider.id, data: payload },
      {
        onSuccess: () => {
          setIsEditing(false);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        },
        onError: (error) => {
          const msg =
            error.response?.data?.responseMessage ||
            error.response?.data?.message ||
            'Failed to save changes. Please try again.';
          setSaveError(msg);
        },
      }
    );
  };

  const handleCancel = () => {
    setFormData({
      full_name: riderData.full_name || `${riderData.first_name || ''} ${riderData.last_name || ''}`.trim(),
      user_email: riderData.user_email || riderData.email || '',
      user_phone: riderData.user_phone || riderData.phone || '',
      license_number: riderData.license_info?.driver_license_number || '',
      license_expiry: riderData.license_info?.license_number_expiry_date || '',
      state: riderData.state || '',
      city: riderData.city || '',
      profile_picture_url: riderData.profile_picture_url || '',
    });
    setSaveError('');
    setIsEditing(false);
  };

  // Derive initials for avatar fallback
  const nameParts = formData.full_name?.split(' ') || [];
  const initials = nameParts.length >= 2
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
    : nameParts[0]?.[0] || '?';

  // Shared styles
  const inputClass =
    'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E2A5E] focus:border-transparent transition-colors';
  const displayClass =
    'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900';
  const readonlyClass =
    'w-full px-4 py-3 bg-[#F5F6FA] border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-poppins">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#B3B3BF]/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#1E2A5E]">Driver's Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-7 max-h-[80vh] overflow-y-auto">

          {loadingDetails ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-[#1E2A5E]" />
            </div>
          ) : (
            <>
              {/* Profile row */}
              <div className="flex items-center gap-5 mb-8">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                  {formData.profile_picture_url ? (
                    <img
                      src={formData.profile_picture_url}
                      alt={formData.full_name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-white font-bold text-2xl">{initials}</span>
                  )}
                </div>

                {/* Name + email */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{formData.full_name || '—'}</h3>
                  <p className="text-sm text-gray-500 truncate">{formData.user_email || '—'}</p>
                  {(formData.state || formData.city) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {[formData.city, formData.state].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-5 py-2 bg-[#1E2A5E] text-white rounded-lg text-sm font-medium hover:bg-[#162042] disabled:opacity-60 flex items-center gap-2 transition-colors"
                      >
                        {isSaving && <Loader2 size={14} className="animate-spin" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setSaveError(''); setSaveSuccess(false); setIsEditing(true); }}
                        className="px-5 py-2 bg-[#1E2A5E] text-white rounded-lg text-sm font-medium hover:bg-[#162042] transition-colors"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={() => onDelete(rider)}
                        className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Save success banner */}
              {saveSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5 text-sm text-green-800">
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                  Rider details updated successfully.
                </div>
              )}

              {/* Save error banner */}
              {saveError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm text-red-800">
                  <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                  {saveError}
                </div>
              )}

              {/* Fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className={inputClass}
                      placeholder="Full name"
                    />
                  ) : (
                    <p className={displayClass}>{formData.full_name || '—'}</p>
                  )}
                </div>

                {/* Email Address — always locked */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Email Address
                    <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-normal normal-case tracking-normal bg-gray-100 px-1.5 py-0.5 rounded-full">
                      <Lock size={9} /> not editable
                    </span>
                  </label>
                  <div className="relative">
                    <input type="email" value={formData.user_email} readOnly className={readonlyClass} />
                    <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Phone Number — always locked */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Phone Number
                    <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-normal normal-case tracking-normal bg-gray-100 px-1.5 py-0.5 rounded-full">
                      <Lock size={9} /> not editable
                    </span>
                  </label>
                  <div className="relative">
                    <input type="tel" value={formData.user_phone} readOnly className={readonlyClass} />
                    <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Driver's License Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Driver's License Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.license_number}
                      onChange={(e) => handleInputChange('license_number', e.target.value)}
                      className={inputClass}
                      placeholder="License number"
                    />
                  ) : (
                    <p className={displayClass}>{formData.license_number || '—'}</p>
                  )}
                </div>

                {/* Driver's License Expiry Date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Driver's License Expiry Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.license_expiry}
                      onChange={(e) => handleInputChange('license_expiry', e.target.value)}
                      className={inputClass}
                    />
                  ) : (
                    <p className={displayClass}>
                      {formData.license_expiry
                        ? new Date(formData.license_expiry).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })
                        : '—'}
                    </p>
                  )}
                </div>

                {/* State / City */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    State / City
                  </label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className={inputClass}
                        placeholder="State"
                      />
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={inputClass}
                        placeholder="City"
                      />
                    </div>
                  ) : (
                    <p className={displayClass}>
                      {[formData.city, formData.state].filter(Boolean).join(', ') || '—'}
                    </p>
                  )}
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderDetailsModal;