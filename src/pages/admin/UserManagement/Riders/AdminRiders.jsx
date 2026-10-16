import React from "react";
import { Bike } from "lucide-react";

// Placeholder until the admin Riders screen is designed/built.
const AdminRiders = () => (
  <div className="mb-6 space-y-6 font-poppins">
    <h3 className="text-xl font-semibold text-[#343C6A]">Riders Management</h3>
    <section className="flex flex-col items-center rounded-2xl bg-white px-6 py-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        <Bike size={26} />
      </span>
      <p className="text-base font-semibold text-[#343C6A]">Riders screen coming soon</p>
      <p className="mt-1 max-w-sm text-sm text-gray-400">
        This is where admins will manage every rider on Zummey.
      </p>
    </section>
  </div>
);

export default AdminRiders;
