import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebouncedValue } from "./useDebouncedValue";
import { defaultsFor, filtersFromParams, filtersToParams } from "./filters";

const DEFAULT_PARAM_KEYS = { page: "page", search: "q" };

/**
 * Page, search and filter state for an admin table, kept in the URL so
 * refresh / back / shared links show the same view.
 *
 * - filterGroups: FilterPanel groups (each has a `param` URL key)
 * - keys: URL keys for page and search
 *
 * The search box updates instantly (`searchInput`); the URL follows once typing pauses.
 * Changing search or filters always returns to page 1.
 */
export const useTableParams = ({ filterGroups = [], keys = DEFAULT_PARAM_KEYS } = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get(keys.page)) || 1);
  const search = searchParams.get(keys.search) ?? "";
  const filters = filtersFromParams(filterGroups, searchParams);

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput);

  const updateParams = (changes, { resetPage = true } = {}) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(changes).forEach(([key, value]) => {
          if (value === "" || value == null) next.delete(key);
          else next.set(key, String(value));
        });
        if (resetPage) next.delete(keys.page);
        return next;
      },
      { replace: true }
    );
  };

  useEffect(() => {
    if (debouncedSearch.trim() !== search) updateParams({ [keys.search]: debouncedSearch.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced input
  }, [debouncedSearch]);

  const defaults = defaultsFor(filterGroups);
  const isFiltered = !!search || filterGroups.some((g) => filters[g.id] !== defaults[g.id]);

  return {
    page,
    search,
    filters,
    isFiltered,
    searchInput,
    setSearchInput,
    setPage: (next) => updateParams({ [keys.page]: next }, { resetPage: false }),
    applyFilters: (selection) => updateParams(filtersToParams(filterGroups, selection)),
    clearAll: () => {
      setSearchInput("");
      updateParams({ [keys.search]: "", ...filtersToParams(filterGroups, defaults) });
    },
  };
};
