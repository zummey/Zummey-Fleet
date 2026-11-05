import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendBroadcast, sendReply } from "./communications.service";

export const useSendReply = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: sendReply, onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "communications"] }) });
};
export const useSendBroadcast = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: sendBroadcast, onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "communications"] }) });
};
