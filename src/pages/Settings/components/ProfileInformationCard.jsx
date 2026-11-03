import React, { useRef, useState } from "react";
import { Camera, Pencil } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";
import SectionHeader from "./SectionHeader";
import TextField from "./TextField";
import { OutlineButton, PrimaryButton } from "./Buttons";

const AVATAR_SIZE = 112;

const ProfileInformationCard = ({ profile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(profile);
  const [draft, setDraft] = useState(profile);
  const fileInputRef = useRef(null);

  const shown = isEditing ? draft : saved;
  const isDirty = Object.keys(draft).some((key) => draft[key] !== saved[key]);

  const setField = (key) => (value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const handlePhotoPick = (event) => {
    const file = event.target.files?.[0];
    if (file) setField("photo")(URL.createObjectURL(file));
    event.target.value = "";
  };

  const handleCancel = () => {
    setDraft(saved);
    setIsEditing(false);
  };

  const handleSave = () => {
    // UI only — persisting the profile is wired up separately.
    setSaved(draft);
    setIsEditing(false);
  };

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <SectionHeader
        title="Profile Information"
        description="Your personal admin account details."
      >
        {isEditing ? (
          <>
            <OutlineButton onClick={handleCancel}>Cancel</OutlineButton>
            <PrimaryButton onClick={handleSave} disabled={!isDirty}>
              Save Changes
            </PrimaryButton>
          </>
        ) : (
          <PrimaryButton onClick={() => setIsEditing(true)}>
            <Pencil size={16} />
            Edit Profile
          </PrimaryButton>
        )}
      </SectionHeader>

      <div className="relative mt-6" style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}>
        <ProfileAvatar name={shown.fullName} src={shown.photo} size={AVATAR_SIZE} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Change profile photo"
          className="absolute right-1 bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow ring-1 ring-gray-200 transition-colors hover:text-[#EB4827]"
        >
          <Camera size={16} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoPick}
          className="hidden"
        />
      </div>

      <div className="mt-8 grid gap-x-8 gap-y-5 md:grid-cols-2">
        <TextField
          label="Full Name"
          value={shown.fullName}
          onChange={setField("fullName")}
          readOnly={!isEditing}
          placeholder="Enter full name"
        />
        <TextField
          label="Email Address"
          type="email"
          value={shown.email}
          onChange={setField("email")}
          readOnly={!isEditing}
          placeholder="Enter email address"
        />
        <TextField
          label="Phone Number"
          value={shown.phone}
          onChange={setField("phone")}
          readOnly={!isEditing}
          placeholder="Enter phone number"
        />
        <TextField
          label="Address"
          value={shown.address}
          onChange={setField("address")}
          readOnly={!isEditing}
          placeholder="Enter address"
        />
      </div>
    </section>
  );
};

export default ProfileInformationCard;
