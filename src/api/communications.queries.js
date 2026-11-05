import { useQuery } from "@tanstack/react-query";
import { getConversation, getConversations } from "./communications.service";

export const useConversations = () => useQuery({ queryKey: ["admin", "communications"], queryFn: getConversations });
export const useConversation = (id) => useQuery({ queryKey: ["admin", "communications", id], queryFn: () => getConversation(id), enabled: Boolean(id) });
