import { useState } from "react";

export function usePreference(section, defaults) {
  const key = `platform-settings:${section}`;
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? defaults;
    } catch {
      return defaults;
    }
  });

  function save(next) {
    setValue(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Keep settings usable for the current view when storage is unavailable.
    }
  }

  return [value, save];
}
