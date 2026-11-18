// Preview history for the admin shown in the design references.
export const sampleActivity = {
  "amara-eze": [
    ["Nov 18, 09:12", "Assigned order ZM-1042 to a rider", "orders"],
    ["Nov 17, 16:40", "Resolved incident INC-1318", "incidents"],
    ["Nov 12, 14:05", "Approved a rider application", "riders"],
    ["Nov 12, 10:32", "Reassigned order ZM-1207", "dispatch"],
    ["Nov 11, 18:21", "Checked a delayed delivery", "tracking"],
    ["Nov 11, 12:16", "Assigned order ZM-1042 to a rider", "orders"],
    ["Nov 10, 15:48", "Resolved incident INC-1318", "incidents"],
    ["Nov 10, 09:04", "Approved a rider application", "riders"],
  ].map(([dateLabel, message, module], index) => ({ id: index, dateLabel, message, module })),
};

export const sampleLogins = {
  "amara-eze": [
    ["Nov 18, 08:15", "Chrome on Windows", "Lagos", "102.89.64.x"],
    ["Nov 17, 18:13", "Safari on iPhone", "Lagos", "105.112.38.x"],
    ["Nov 12, 16:05", "Chrome on Android", "Benin City", "102.91.21.x"],
    ["Nov 11, 08:22", "Chrome on Windows", "Abuja", "154.113.16.x", "Failed: wrong password"],
    ["Nov 10, 17:44", "Edge on Windows", "Lagos", "102.89.70.x"],
    ["Nov 9, 09:31", "Safari on iPhone", "Port Harcourt", "105.112.41.x"],
    ["Nov 8, 14:18", "Chrome on Android", "Lagos", "102.91.31.x", "Failed: wrong password"],
    ["Nov 7, 11:52", "Chrome on Windows", "Lagos", "102.89.54.x"],
    ["Nov 6, 15:49", "Edge on Windows", "Abuja", "154.113.22.x"],
    ["Nov 5, 08:16", "Safari on iPhone", "Lagos", "105.112.35.x"],
  ].map(([dateLabel, device, place, ip, result = "Signed in"], index) => ({
    id: index, dateLabel, device, place, ip, result,
  })),
};
