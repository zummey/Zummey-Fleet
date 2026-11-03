import React, { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import ReasonDialog from "./ReasonDialog";

/**
 * Opens the right confirm dialog for an action on a row and runs the mutation.
 *
 * - dialogs: { [action]: { title(item), description(item), confirmLabel, tone, reasons?, noteLabel?, notePlaceholder? } }
 *   Actions with `reasons` open a ReasonDialog; the rest open a ConfirmDialog.
 * - mutation: a TanStack mutation (useMutation result)
 * - toPayload(action, item, { reason, note }): the mutation variables
 *
 * Returns { open(action, item), dialog } — render `dialog` somewhere in the page.
 */
export const useDecisionDialog = ({ dialogs, mutation, toPayload }) => {
  const [pending, setPending] = useState(null); // { action, item }

  const open = (action, item) => {
    mutation.reset();
    setPending({ action, item });
  };
  const close = () => setPending(null);

  const copy = pending && dialogs[pending.action];
  const submit = (extra = {}) =>
    mutation.mutate(toPayload(pending.action, pending.item, extra), { onSuccess: close });

  if (!copy) return { open, dialog: null };

  const shared = {
    title: copy.title(pending.item),
    description: copy.description(pending.item),
    confirmLabel: copy.confirmLabel,
    tone: copy.tone,
    isPending: mutation.isPending,
    error: mutation.error,
    onClose: close,
  };

  const dialog = copy.reasons ? (
    <ReasonDialog
      {...shared}
      reasons={copy.reasons}
      noteLabel={copy.noteLabel}
      notePlaceholder={copy.notePlaceholder}
      onConfirm={submit}
    />
  ) : (
    <ConfirmDialog {...shared} onConfirm={() => submit()} />
  );

  return { open, dialog };
};
