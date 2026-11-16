import React, { useId, useState } from "react";
import Modal from "../../components/Modal";
import Avatar from "../../components/Avatar";
import { DIALOGS } from "../incidents.config";
import { useIncidentAdmins } from "../../../../api/incidents.queries";

/** Pick the admin who owns an incident. The current owner is preselected when reassigning. */
const AssignIncidentModal = ({ incident, isPending, error, onConfirm, onClose }) => {
  const currentId = incident.assignedAdmin?.id ?? null;
  const [selected, setSelected] = useState(currentId);
  const admins = useIncidentAdmins();
  const titleId = useId();
  const descId = useId();
  const groupName = useId();
  const copy = DIALOGS.assign;

  const canConfirm = !!selected && selected !== currentId && !isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canConfirm) onConfirm({ adminId: selected });
  };

  return (
    <Modal onClose={onClose} canClose={!isPending} labelledBy={titleId} describedBy={descId} className="max-w-md">
      <form onSubmit={handleSubmit}>
        <h2 id={titleId} className="text-base font-semibold text-[#343C6A]">
          {copy.title(incident)}
        </h2>
        <p id={descId} className="mt-1 text-xs text-gray-500">
          {copy.description}
        </p>

        <fieldset className="mt-4 space-y-2" disabled={isPending}>
          <legend className="sr-only">Admin</legend>
          {admins.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[54px] animate-pulse rounded-xl bg-gray-100" />)
          ) : admins.isError ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              Couldn’t load admins.{" "}
              <button type="button" onClick={() => admins.refetch()} className="font-medium underline">
                Retry
              </button>
            </p>
          ) : (
            admins.data.map((admin) => {
              const isSelected = selected === admin.id;
              return (
                <label
                  key={admin.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-orange-300 ${
                    isSelected ? "border-[#EB4827]/60 bg-[#FFF4E8]" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={groupName}
                    value={admin.id}
                    checked={isSelected}
                    onChange={() => setSelected(admin.id)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected ? "border-[#EB4827]" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <span className="h-2 w-2 rounded-full bg-[#EB4827]" />}
                  </span>
                  <Avatar name={admin.name} size="h-8 w-8" colorful />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-[#343C6A]">
                      {admin.name}
                      {admin.id === currentId && <span className="ml-1 font-normal text-gray-400">(current)</span>}
                    </span>
                    <span className="block truncate text-[11px] text-gray-400">{admin.role}</span>
                  </span>
                  <span className="shrink-0 text-[11px] text-gray-400 tabular-nums">{admin.openCount} open</span>
                </label>
              );
            })
          )}
        </fieldset>

        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {error?.response?.data?.responseMessage || error?.message || "Something went wrong"}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-[#343C6A] hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canConfirm}
            className="rounded-lg bg-[#0B1437] px-5 py-2 text-sm font-medium text-white hover:bg-[#1c2657] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isPending ? "Assigning..." : "Assign"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignIncidentModal;
