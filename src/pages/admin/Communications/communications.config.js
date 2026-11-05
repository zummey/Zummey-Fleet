import { Bell, Mail, MessageSquare } from "lucide-react";

export const MESSAGE_TABS = [
  { id: "customers", label: "Customers" },
  { id: "riders", label: "Riders" },
  { id: "fleet", label: "Fleet" },
];
export const AUDIENCES = [
  { id: "all", label: "All Users", description: "Customers, riders and fleet owners · 25,634" },
  { id: "riders", label: "Riders", description: "Everyone who delivers · 1,240" },
  { id: "fleet", label: "Fleet Owners", description: "Owners and managers · 86" },
  { id: "groups", label: "Selected Groups", description: "Pick specific groups" },
];
// Sample audience counts until the communications API provides segment totals.
export const CUSTOMER_GROUPS = [
  { id: "new-customers", label: "New Customers", count: 312 },
  { id: "inactive-customers", label: "Inactive Customers", count: 1280 },
];
export const CHANNELS = [
  { id: "push", label: "Push Notification", description: "In the Zummey apps", icon: Bell, tone: "bg-blue-50 text-blue-500" },
  { id: "email", label: "Email", description: "To their inbox", icon: Mail, tone: "bg-violet-50 text-violet-600" },
  { id: "sms", label: "SMS", description: "Text message", icon: MessageSquare, tone: "bg-orange-50 text-orange-500" },
  { id: "whatsapp", label: "WhatsApp", description: "Message on WhatsApp", icon: MessageSquare, tone: "bg-emerald-50 text-emerald-500" },
];
export const cardClass = "rounded-2xl border border-[#E3E9F6] bg-white p-5";
export const inputClass = "w-full rounded-lg border border-[#D9E2F3] bg-white px-3 py-2.5 text-sm text-[#1D2B4F] placeholder:text-[#8B9ABD] focus:outline-none focus:ring-2 focus:ring-blue-200";
export const primaryClass = "inline-flex items-center justify-center gap-2 rounded-lg bg-[#001B44] px-5 py-3 text-sm font-medium text-white hover:bg-[#102F59] disabled:cursor-not-allowed disabled:bg-[#B5C0D3]";
