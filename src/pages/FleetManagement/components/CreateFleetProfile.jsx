import { useState } from "react";
import { createFleetProfile } from "../../../api/fleet.service";
import logo from "../../../assets/logo.png";

const CreateFleetProfile = ({ onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    contact_phone: "",
    contact_email: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Business name is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.contact_phone.trim())
      newErrors.contact_phone = "Phone is required";
    if (!form.contact_email.trim())
      newErrors.contact_email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.contact_email))
      newErrors.contact_email = "Invalid email format";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsLoading(true);
    try {
      await createFleetProfile(form);
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          error.message || 
                          "Failed to create fleet profile";
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" bg-gradient-to-br  flex items-center justify-center ">
      <div className="w-full max-w-md">
        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-8">
            <img src={logo} alt="Zummey Logo" className="h-16 w-auto" />
          </div>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Create Fleet Profile
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Set up your fleet information to get started
            </p>
          </div>

          {/* Error Alert */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">
                {errors.submit}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Business Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Business Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your business name"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.name
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              />
              {errors.name && (
                <p className="text-red-600 text-xs mt-1 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter your business address"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.address
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              />
              {errors.address && (
                <p className="text-red-600 text-xs mt-1 font-medium">
                  {errors.address}
                </p>
              )}
            </div>

            {/* Phone and Email - Side by Side on Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label
                  htmlFor="contact_phone"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Phone
                </label>
                <input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  value={form.contact_phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.contact_phone
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                />
                {errors.contact_phone && (
                  <p className="text-red-600 text-xs mt-1 font-medium">
                    {errors.contact_phone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="contact_email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={form.contact_email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.contact_email
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                />
                {errors.contact_email && (
                  <p className="text-red-600 text-xs mt-1 font-medium">
                    {errors.contact_email}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Fleet Profile</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-6">
            Your fleet information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateFleetProfile;
