// Helpers for FilterPanel groups: [{ id, param, options: [{ value, label }] }].
// The first option of each group is its default ("no filter").

export const defaultsFor = (groups) => Object.fromEntries(groups.map((g) => [g.id, g.options[0].value]));

// Read the applied selection from URL search params
export const filtersFromParams = (groups, searchParams) =>
  Object.fromEntries(groups.map((g) => [g.id, searchParams.get(g.param) ?? g.options[0].value]));

// URL param changes for a selection; defaults are removed to keep URLs clean
export const filtersToParams = (groups, selection) =>
  Object.fromEntries(groups.map((g) => [g.param, selection[g.id] === g.options[0].value ? "" : selection[g.id]]));
