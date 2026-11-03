import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { OutlineButton, PrimaryButton } from "./Buttons";

const MASKED_PASSWORD = "••••••••";

const PasswordField = ({ label, name, placeholder, register, rules, error }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-[#343C6A]">{label}</label>
    <input
      type="password"
      placeholder={placeholder}
      {...register(name, rules)}
      className="w-full rounded-lg bg-[#F7F7F8] px-4 py-2.5 text-sm text-gray-900 placeholder-[#979797] focus:ring-2 focus:ring-[#FFF4E8] focus:outline-none"
    />
    {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
  </div>
);

const PasswordCard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const newPassword = watch("newPassword");

  const closeEditor = () => {
    reset();
    setIsEditing(false);
  };

  const onSubmit = () => {
    // UI only — the change-password request is wired up separately.
    closeEditor();
  };

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <SectionHeader
          title="Password"
          description="Use a strong password that you don't use anywhere else."
        >
          {isEditing ? (
            <>
              <OutlineButton onClick={closeEditor}>Cancel</OutlineButton>
              <PrimaryButton type="submit" disabled={!isDirty}>
                Update password
              </PrimaryButton>
            </>
          ) : (
            <PrimaryButton onClick={() => setIsEditing(true)}>
              <KeyRound size={16} />
              Change Password
            </PrimaryButton>
          )}
        </SectionHeader>

        {isEditing ? (
          <div className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-3">
            <PasswordField
              label="Current Password"
              name="currentPassword"
              placeholder="Enter current password"
              register={register}
              rules={{ required: "Current password is required" }}
              error={errors.currentPassword}
            />
            <PasswordField
              label="New Password"
              name="newPassword"
              placeholder="Enter new password"
              register={register}
              rules={{
                required: "New password is required",
                minLength: { value: 8, message: "Use at least 8 characters" },
              }}
              error={errors.newPassword}
            />
            <PasswordField
              label="Confirm New Password"
              name="confirmPassword"
              placeholder="Confirm new password"
              register={register}
              rules={{
                required: "Please confirm your new password",
                validate: (value) => value === newPassword || "Passwords do not match",
              }}
              error={errors.confirmPassword}
            />
          </div>
        ) : (
          <div className="mt-6 max-w-md">
            <label className="mb-1 block text-xs text-gray-500">Password</label>
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <span className="text-sm tracking-widest text-gray-500 select-none">
                {MASKED_PASSWORD}
              </span>
              <button
                type="button"
                onClick={() => setRevealed((prev) => !prev)}
                aria-label={revealed ? "Hide password" : "Show password"}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                {revealed ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>
        )}
      </form>
    </section>
  );
};

export default PasswordCard;
