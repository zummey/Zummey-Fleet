import React from "react";
import ProfileInformationCard from "./components/ProfileInformationCard";
import PasswordCard from "./components/PasswordCard";

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
};

const Profile = () => {
  const user = readStoredUser();
  const profile = {
    fullName: user.fullName || user.full_name || user.name || "",
    email: user.email || "",
    phone: user.phone_number || user.phone || "",
    address: user.address || "",
    photo: user.profile_picture_url || user.profile_picture || user.avatar || "",
  };

  return (
    <div className="space-y-6 p-6 font-poppins">
      <h1 className="text-xl font-semibold text-[#343C6A]">Settings</h1>
      <ProfileInformationCard profile={profile} />
      <PasswordCard />
    </div>
  );
};

export default Profile;
