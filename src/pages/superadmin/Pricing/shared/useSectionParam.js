import { useSearchParams } from "react-router-dom";

/**
 * Sub-tab kept in ?section= (e.g. State / City pricing). The first section is the default
 * and is left out of the URL. Other params (like ?tab=) are kept.
 * Returns [activeSection, changeSection].
 */
export const useSectionParam = (sections) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = sections.find((s) => s.id === searchParams.get("section")) ?? sections[0];

  const change = (next) =>
    setSearchParams(
      (params) => {
        const updated = new URLSearchParams(params);
        if (next === sections[0].id) updated.delete("section");
        else updated.set("section", next);
        return updated;
      },
      { replace: true }
    );

  return [active, change];
};
