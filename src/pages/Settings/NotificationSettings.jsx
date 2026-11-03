import React, { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import Switch from "../../components/Ui/Switch";
import SectionHeader from "./components/SectionHeader";
import { OutlineButton, PrimaryButton } from "./components/Buttons";

const ALERTS = [
  {
    key: "transactionAlerts",
    label: "Transaction Alerts",
    description: "Enable/disable payment and withdrawal notifications.",
  },
  {
    key: "orderUpdates",
    label: "Order Updates",
    description: "Get notified on live orders, cancellations, and delays.",
  },
  {
    key: "geoFenceAlerts",
    label: "Geo-Fence Alerts",
    description: "Receive alerts when a vehicle enters/exits a restricted zone.",
  },
];

const DELIVERY_CHANNELS = ["Email", "SMS", "Email & SMS"];

const DEFAULT_PREFERENCES = {
  transactionAlerts: true,
  orderUpdates: true,
  geoFenceAlerts: true,
  channel: "Email",
};

const NotificationSettings = () => {
  const [saved, setSaved] = useState(DEFAULT_PREFERENCES);
  const [draft, setDraft] = useState(DEFAULT_PREFERENCES);

  const isDirty = Object.keys(draft).some((key) => draft[key] !== saved[key]);

  const setPreference = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    // UI only — persisting preferences is wired up separately.
    setSaved(draft);
  };

  return (
    <div className="space-y-6 p-6 font-poppins">
      <h1 className="text-xl font-semibold text-[#343C6A]">Settings</h1>

      <section className="rounded-lg bg-white p-6 shadow-sm">
        <SectionHeader
          title="Notifications & Alerts"
          description="Customize your notification preferences to receive alerts that matter most to you."
        >
          <OutlineButton onClick={() => setDraft(saved)} disabled={!isDirty}>
            Cancel
          </OutlineButton>
          <PrimaryButton onClick={handleSave} disabled={!isDirty}>
            Save preferences
          </PrimaryButton>
        </SectionHeader>

        <div className="mt-5 border-t border-gray-100 pt-5">
          <ul className="max-w-xl space-y-5">
            {ALERTS.map((alert) => (
              <li key={alert.key} className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-sm font-semibold text-[#343C6A]">{alert.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{alert.description}</p>
                </div>
                <Switch
                  checked={draft[alert.key]}
                  onChange={(next) => setPreference(alert.key, next)}
                  ariaLabel={alert.label}
                />
              </li>
            ))}
          </ul>

          <div className="mt-8 max-w-xl">
            <p className="text-sm font-semibold text-[#343C6A]">Email & SMS Preferences</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Choose how you receive important updates.
            </p>
            <div className="relative mt-3 max-w-xs">
              <select
                value={draft.channel}
                onChange={(e) => setPreference("channel", e.target.value)}
                aria-label="Delivery channel"
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-gray-700 focus:ring-2 focus:ring-[#FFF4E8] focus:outline-none"
              >
                {DELIVERY_CHANNELS.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
              <ChevronsUpDown
                size={16}
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotificationSettings;
