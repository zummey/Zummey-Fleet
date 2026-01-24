import { useState } from "react";
import { createVehicle } from "../../api/fleet.service";
import { ArrowLeft, Camera, ImagePlus } from "lucide-react";

const AddVehicle = ({ onClose, onSuccess }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_name: "",
    vehicle_make: "",
    vehicle_licence_serial: "",
    gps_tracker_serial: "",
    vehicle_type: "",
    vehicle_color: "",
    main_image: null,
  });

  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);

  const manufacturers = [
    "Honda",
    "Yamaha",
    "Suzuki",
    "Kawasaki",
    "BMW",
    "KTM",
    "Ducati",
    "Harley-Davidson",
    "Bajaj",
    "Hero",
    "TVS",
    "Other",
  ];

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, main_image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...additionalImages];
      newImages[index] = file;
      setAdditionalImages(newImages);

      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...additionalImagePreviews];
        newPreviews[index] = reader.result;
        setAdditionalImagePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // If no files/images are provided, send JSON matching backend fields.
      const hasMainImage = !!formData.main_image;
      const hasAdditionalImages = additionalImages.some(Boolean);

      if (!hasMainImage && !hasAdditionalImages) {
        const payload = {
          vehicle_name: formData.vehicle_name,
          vehicle_make: formData.vehicle_make,
          vehicle_licence_serial: formData.vehicle_licence_serial,
          gps_tracker_serial: formData.gps_tracker_serial,
          vehicle_type: formData.vehicle_type || "MOTORCYCLE",
          vehicle_color: formData.vehicle_color || "",
        };

        await createVehicle(payload);
      } else {
        // If there are images, send as FormData but use backend field names.
        const fData = new FormData();
        fData.append("vehicle_name", formData.vehicle_name);
        fData.append("vehicle_make", formData.vehicle_make);
        fData.append("vehicle_licence_serial", formData.vehicle_licence_serial);
        fData.append("gps_tracker_serial", formData.gps_tracker_serial);
        fData.append("vehicle_type", formData.vehicle_type || "MOTORCYCLE");
        fData.append("vehicle_color", formData.vehicle_color || "");

        if (formData.main_image) {
          fData.append("main_image", formData.main_image);
        }

        additionalImages.forEach((img, idx) => {
          if (img) {
            fData.append(`additional_image_${idx}`, img);
          }
        });

        await createVehicle(fData);
      }
      setSubmitSuccess(true);
      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 800);
    } catch (err) {
      console.error("Failed to create vehicle", err, err.response?.data);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-400 ${
          isClosing ? "opacity-0 pointer-events-none" : "opacity-100 bg-black/30"
        }`}
        onClick={handleClose}
      />

      {/* Success Screen */}
      {submitSuccess ? (
        <div
          className={`fixed right-0 top-0 h-full w-1/4 bg-gradient-to-b from-white to-gray-50 shadow-2xl z-50 overflow-hidden flex flex-col items-center justify-center transform transition-all duration-500 ${
            isClosing ? "translate-x-full opacity-0" : "translate-x-0 opacity-100 animate-slide-in"
          }`}
        >
          {/* Success Card */}
          <div className="flex flex-col items-center space-y-6 px-8 py-16">
            {/* Checkmark Icon - Circular */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center animate-scale-in"
              style={{
                border: "3px solid #1E2A50",
                backgroundColor: "white",
                animation: "scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
              }}
            >
              <svg
                className="w-10 h-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1E2A50"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            {/* Headline */}
            <h2
              className="text-2xl font-bold text-center"
              style={{
                color: "#1E2A50",
                animation: "fadeIn 0.6s ease-out 0.2s both",
              }}
            >
              Vehicle Added Successfully
            </h2>

            {/* Body Text */}
            <p
              className="text-center text-gray-600 text-sm leading-relaxed"
              style={{
                animation: "fadeIn 0.6s ease-out 0.3s both",
              }}
            >
              The vehicle has been successfully registered and is now available for use.
            </p>

            {/* Return Button */}
            <button
              onClick={() => {
                handleClose();
                onSuccess();
              }}
              className="w-full mt-6 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              style={{
                backgroundColor: "#4B2E83",
                animation: "slideUp 0.6s ease-out 0.4s both",
              }}
            >
              Return to Fleet
            </button>
          </div>
        </div>
      ) : (
        /* Slide-out Panel - Mobile App Style */
        <div
          className={`fixed right-0 top-0 h-full w-1/4 bg-white shadow-2xl z-50 overflow-hidden flex flex-col transform transition-all duration-500 ${
            isClosing
              ? "translate-x-full opacity-0"
              : "translate-x-0 opacity-100 animate-slide-in"
          }`}
        >
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-8 flex items-center gap-3 animate-fade-in">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
              style={{ color: "#001940" }}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-semibold" style={{ color: "#001940" }}>
              Add Vehicle
            </h1>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Content Area */}
            <div className="flex-1 px-6 py-8 space-y-8 animate-fade-in-delayed">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-8 pt-4">
                {/* Circular Avatar */}
                <div className="relative" style={{ animation: "fadeIn 0.6s ease-in-out 0.1s both" }}>
                  <label
                    htmlFor="main_image"
                    className="w-28 h-28 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg active:scale-95"
                    style={{
                      backgroundColor: mainImagePreview ? "transparent" : "#f5f5f5",
                    }}
                  >
                    {mainImagePreview ? (
                      <img
                        src={mainImagePreview}
                        alt="Vehicle"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <Camera size={32} style={{ color: "#030229" }} />
                    )}
                  </label>
                  <input
                    id="main_image"
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    disabled={isSubmitting}
                    className="hidden"
                  />
                </div>

                {/* Helper Text */}
                <p
                  className="text-md text-gray-500 text-center max-w-xs"
                  style={{ animation: "fadeIn 0.6s ease-in-out 0.2s both" }}
                >
                  Kindly upload clear photo of the bike
                </p>

                {/* Additional Image Fields - Progressive Growth */}
                <div className="flex gap-3 flex-wrap justify-center" style={{ animation: "fadeIn 0.6s ease-in-out 0.15s both" }}>
                  {[0, 1, 2, 3].map((index) => (
                    <label
                      key={index}
                      className="relative cursor-pointer"
                      style={{
                        display:
                          index === 0 || additionalImagePreviews[index - 1] !== undefined
                            ? "block"
                            : "none",
                      }}
                    >
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center  transition-all duration-200 hover:shadow-md active:scale-95"
                        style={{
                          backgroundColor: additionalImagePreviews[index]
                            ? "transparent"
                            : "#f5f5f5",
                        }}
                      >
                        {additionalImagePreviews[index] ? (
                          <img
                            src={additionalImagePreviews[index]}
                            alt={`Additional ${index + 1}`}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <ImagePlus size={20} style={{ color: "#979797" }} />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAdditionalImageChange(index, e)}
                        disabled={isSubmitting}
                        className="hidden"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                {/* Bike Name */}
                <div style={{ animation: "fadeIn 0.6s ease-in-out 0.25s both" }}>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#001940" }}>
                    Bike Type
                  </label>
                  <select
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-[#FAFAFB] rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm"
                    style={{ focusRingColor: "#001940" }}
                  >
                    <option value="">Select Type</option>
                    <option value="MOTORCYCLE">Bike</option>
                    <option value="BICYCLE">Bicycle</option>
                  </select>

                  <label className="block text-sm font-medium mb-2 mt-4" style={{ color: "#001940" }}>
                    Bike Name
                  </label>
                  <input
                    type="text"
                    placeholder="Add Bike Name"
                    value={formData.vehicle_name}
                    onChange={(e) => setFormData({ ...formData, vehicle_name: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-[#FAFAFB] rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm"
                    style={{ focusRingColor: "#001940" }}
                  />
                </div>

                {/* Manufacturer */}
                <div style={{ animation: "fadeIn 0.6s ease-in-out 0.3s both" }}>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#001940" }}>
                    Manufacturer
                  </label>
                  <select
                    value={formData.vehicle_make}
                    onChange={(e) => setFormData({ ...formData, vehicle_make: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-[#FAFAFB] rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm "
                    style={{ focusRingColor: "#001940" }}
                  >
                    <option value="">Select</option>
                    {manufacturers.map((mfg) => (
                      <option key={mfg} value={mfg}>
                        {mfg}
                      </option>
                    ))}
                  </select>
                </div>

                {/* License Number */}
                <div style={{ animation: "fadeIn 0.6s ease-in-out 0.35s both" }}>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#001940" }}>
                    License Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter"
                    value={formData.vehicle_licence_serial}
                    onChange={(e) => setFormData({ ...formData, vehicle_licence_serial: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-[#FAFAFB] rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm"
                    style={{ focusRingColor: "#001940" }}
                  />
                </div>

                {/* GPS Tracker SN */}
                <div style={{ animation: "fadeIn 0.6s ease-in-out 0.4s both" }}>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#001940" }}>
                    GPS Tracker SN
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Tracker No."
                    value={formData.gps_tracker_serial}
                    onChange={(e) => setFormData({ ...formData, gps_tracker_serial: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-[#FAFAFB] rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm"
                    style={{ focusRingColor: "#001940" }}
                  />
                </div>

                {/* Vehicle Color */}
                <div style={{ animation: "fadeIn 0.6s ease-in-out 0.42s both" }}>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#001940" }}>
                    Bike Color
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Red"
                    value={formData.vehicle_color}
                    onChange={(e) => setFormData({ ...formData, vehicle_color: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-[#FAFAFB] rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm"
                    style={{ focusRingColor: "#001940" }}
                  />
                </div>
              </div>
            </div>

            {/* Fixed Bottom Button */}
            <div className="border-t flex justify-center border-gray-100 px-6 py-4 bg-white">
              <button
                type="submit"
                disabled={isSubmitting || submitSuccess}
                className={`w-[80%]  text-white py-3 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${
                  submitSuccess ? "bg-green-600" : "hover:shadow-lg active:shadow-sm"
                }`}
                style={{
                  backgroundColor: !submitSuccess ? "#001940" : undefined,
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </span>
                ) : submitSuccess ? (
                  "✓ Saved!"
                ) : (
                  "Save Vehicle"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          animation-delay: 0.2s;
        }

        .animate-fade-in-delayed {
          animation: fadeIn 0.6s ease-out forwards;
          animation-delay: 0.3s;
          opacity: 0;
        }
      `}</style>
    </>
  );
};

export default AddVehicle;
