import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useChangePassword } from '../../api/auth.mutations';
import SuccessModal from '../../components/Modal/SuccessModal';

const Security = () => {
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const newPassword = watch('newPassword');
  const h2Ref = useRef(null);
  const [tabWidth, setTabWidth] = useState(0);

  useEffect(() => {
    if (h2Ref.current) {
      setTabWidth(h2Ref.current.offsetWidth);
    }
  }, []);

  const mutation = useChangePassword();

  const onSubmit = (data) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const payload = {
      email: user.email,
      new_password: data.newPassword,
    };
    mutation.mutate(payload, {
      onSuccess: () => setShowModal(true),
    });
  };

  return (
    <div className="h-full flex flex-col font-poppins p-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="bg-white rounded-lg shadow flex-1 flex flex-col p-6 mt-6">
        <div className="mb-4">
          <h2 ref={h2Ref} className="text-xl font-medium pb-2">Change Password</h2>
          <div className="border-b border-gray-300 relative">
            <div className="absolute bottom-0 left-0 border-b-2 border-orange-500" style={{ width: tabWidth }}></div>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col justify-between ">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input
                type="password"
                {...register('currentPassword', { required: 'Current password is required' })}
                className="signin-input w-[45%]"
                placeholder="Enter current password"
              />
              {errors.currentPassword && <p className="text-red-500 text-sm">{errors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                {...register('newPassword', { required: 'New password is required' })}
                className="signin-input w-[45%]"
                placeholder="Enter new password"
              />
              {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: value => value === newPassword || 'Passwords do not match'
                })}
                className="signin-input w-[45%]"
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
            </div>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#001940] text-white px-4 py-2 rounded"
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
      {showModal && <SuccessModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Security;