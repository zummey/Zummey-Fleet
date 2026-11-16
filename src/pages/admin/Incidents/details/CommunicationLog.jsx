import React, { useId, useState } from "react";
import Avatar from "../../components/Avatar";
import SegmentedTabs from "../../components/SegmentedTabs";
import { formatMonthDayTime } from "../../components/formatters";
import { LOG_KIND_LABELS, LOG_ROLE_BADGES, NOTE_KINDS } from "../incidents.config";
import { useAddIncidentNote } from "../../../../api/incidents.mutations";

const NoteComposer = ({ incidentId }) => {
  const [kind, setKind] = useState(NOTE_KINDS[0].id);
  const [text, setText] = useState("");
  const inputId = useId();
  const addNote = useAddIncidentNote();
  const active = NOTE_KINDS.find((k) => k.id === kind);
  const canAdd = text.trim().length > 0 && !addNote.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canAdd) return;
    addNote.mutate({ incidentId, kind, text: text.trim() }, { onSuccess: () => setText("") });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t border-gray-100 pt-4">
      <SegmentedTabs
        tabs={NOTE_KINDS}
        activeTab={kind}
        onChange={setKind}
        label="Note type"
        idPrefix="incident-note"
        size="sm"
      />
      <div id="incident-note-panel" role="tabpanel" aria-labelledby={`incident-note-tab-${kind}`} className="mt-3 flex gap-3">
        <label htmlFor={inputId} className="sr-only">
          {active.label}
        </label>
        <input
          id={inputId}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={addNote.isPending}
          placeholder={active.placeholder}
          maxLength={1000}
          className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#343C6A] placeholder-gray-400 focus:border-[#EB4827]/60 focus:ring-2 focus:ring-[#FFF4E8] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!canAdd}
          className="rounded-lg bg-[#0B1437] px-5 py-2 text-sm font-medium text-white hover:bg-[#1c2657] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {addNote.isPending ? "Adding..." : kind === "reporter" ? "Send" : "Add"}
        </button>
      </div>
      {addNote.isError && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {addNote.error?.response?.data?.responseMessage || addNote.error?.message || "Couldn’t add the note"}
        </p>
      )}
    </form>
  );
};

/** Messages from the reporter and notes from admins; closed incidents are read-only. */
const CommunicationLog = ({ incident, readOnly }) => (
  <section aria-labelledby="incident-log-title" className="rounded-2xl bg-white p-5">
    <h2 id="incident-log-title" className="text-sm font-semibold text-[#343C6A]">
      Communication log
    </h2>

    {incident.log.length === 0 ? (
      <p className="mt-4 text-xs text-gray-400">No messages yet.</p>
    ) : (
      <ol className="mt-4 space-y-4" aria-live="polite">
        {incident.log.map((item) => {
          const role = LOG_ROLE_BADGES[item.role];
          const kindLabel = item.role === "admin" ? LOG_KIND_LABELS[item.kind] : null;
          return (
            <li key={item.id} className="flex gap-3">
              <Avatar name={item.author} size="h-8 w-8" colorful />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold text-[#343C6A]">{item.author}</p>
                  {role && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${role.className}`}>
                      {role.label}
                    </span>
                  )}
                  {kindLabel && <span className="text-[10px] text-gray-400">{kindLabel}</span>}
                  <time dateTime={item.at} className="ml-auto text-[11px] text-gray-400">
                    {formatMonthDayTime(item.at).replace(",", "")}
                  </time>
                </div>
                <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs leading-relaxed text-[#343C6A]">{item.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    )}

    {!readOnly && <NoteComposer incidentId={incident.id} />}
  </section>
);

export default CommunicationLog;
