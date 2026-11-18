import { requireAdminEdit } from "../auth/useAdminAbility";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendBroadcast, sendReply } from "./communications.service";

export const useSendReply = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: (payload) => {
      requireAdminEdit("communications");
      return sendReply(payload);
    }, onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "communications"] }) });
};
export const useSendBroadcast = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: (payload) => {
      requireAdminEdit("communications");
      return sendBroadcast(payload);
    }, onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "communications"] }) });
};
