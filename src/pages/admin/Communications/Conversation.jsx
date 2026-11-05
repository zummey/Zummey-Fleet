import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText, MessageSquare, Megaphone, Paperclip, Send, X } from "lucide-react";
import Avatar from "../components/Avatar";
import ErrorBox from "../components/ErrorBox";
import { useConversation } from "../../../api/communications.queries";
import { useSendReply } from "../../../api/communications.mutations";
import { cardClass, inputClass, primaryClass } from "./communications.config";

export default function Conversation() {
  const { conversationId } = useParams();
  const query = useConversation(conversationId);
  const reply = useSendReply();
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const fileInput = useRef(null);
  const bottom = useRef(null);
  const conversation = query.data;
  useEffect(() => { bottom.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [conversation?.messages.length]);
  const submit = (event) => {
    event.preventDefault();
    if (reply.isPending || (!text.trim() && !file)) return;
    reply.mutate({ conversationId, text, file }, { onSuccess: () => {
      setText(""); setFile(null); if (fileInput.current) fileInput.current.value = "";
    } });
  };
  return (
    <div className="space-y-5 font-poppins text-[#1D2B4F]">
      <Link to={`/communications?tab=${conversation?.group ?? "customers"}`} className="inline-flex items-center gap-2 text-sm text-[#343C6A] hover:underline"><ArrowLeft size={17} /> Back to messages</Link>
      {query.isLoading ? <div className="h-96 animate-pulse rounded-2xl bg-gray-200" /> : query.isError ? <ErrorBox error={query.error} onRetry={query.refetch} /> : conversation && <>
        <header className="flex items-center gap-3"><Avatar name={conversation.name} colorful /><div><h1 className="text-lg font-semibold">{conversation.name}</h1><p className="mt-1 text-xs text-[#7182A4]">{conversation.role} · {conversation.order} · {conversation.subject}</p></div></header>
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(260px,1fr)]">
          <section aria-label="Conversation" className="overflow-hidden rounded-2xl border border-[#E3E9F6] bg-white">
            <div role="log" aria-label="Messages" aria-live="polite" className="flex h-[440px] flex-col gap-4 overflow-y-auto bg-[#FAFBFE] p-5">
              {conversation.messages.map((message) => <div key={message.id} className={`max-w-[85%] ${message.sender === "admin" ? "self-end" : "self-start"}`}>
                <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${message.sender === "admin" ? "bg-[#001B44] text-white" : "bg-[#F0F3FA]"}`}>
                  {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}
                  {message.attachment && <div className="mt-1 flex items-center gap-2 rounded-lg border border-current/10 p-3"><FileText size={18} /><div><p className="break-all text-xs">{message.attachment.name}</p><p className="mt-1 text-[10px] opacity-60">{(message.attachment.size / 1024).toFixed(1)} KB · Demo attachment</p></div></div>}
                </div>
                <p className={`mt-1 text-[10px] text-[#8B9ABD] ${message.sender === "admin" ? "text-right" : ""}`}>{message.time}</p>
              </div>)}
              <div ref={bottom} />
            </div>
            <form onSubmit={submit} className="space-y-3 border-t border-[#E3E9F6] p-4">
              {reply.isError && <ErrorBox error={reply.error} />}
              {fileError && <p role="alert" className="text-xs text-red-600">{fileError}</p>}
              {file && <div className="flex items-center gap-2 text-xs"><FileText size={15} /><span className="min-w-0 truncate">{file.name}</span><button type="button" aria-label="Remove attachment" disabled={reply.isPending} onClick={() => { setFile(null); fileInput.current.value = ""; }}><X size={15} /></button></div>}
              <div className="flex items-center gap-2">
                <input ref={fileInput} type="file" className="sr-only" tabIndex={-1} onChange={(event) => {
                  const selected = event.target.files?.[0]; setFileError("");
                  if (selected?.size > 10 * 1024 * 1024) { setFileError("Choose a file smaller than 10 MB."); event.target.value = ""; return; }
                  setFile(selected ?? null);
                }} />
                <button type="button" aria-label="Attach file" disabled={reply.isPending} onClick={() => fileInput.current.click()} className="rounded-lg border border-[#D9E2F3] p-3 hover:bg-gray-50"><Paperclip size={18} /></button>
                <input aria-label="Message" value={text} onChange={(event) => setText(event.target.value)} disabled={reply.isPending} placeholder="Type a message" className={inputClass} />
                <button aria-label="Send message" disabled={reply.isPending || (!text.trim() && !file)} className={`${primaryClass} px-4`}><Send size={19} /></button>
              </div>
            </form>
          </section>
          <aside className="space-y-5">
            <section className={cardClass}><h2 className="mb-5 font-semibold">Contact</h2><dl className="space-y-4 text-xs"><div className="flex flex-wrap justify-between gap-2"><dt className="text-[#7182A4]">Phone</dt><dd><a href={`tel:${conversation.phone.replaceAll(" ", "")}`} className="hover:underline">{conversation.phone}</a></dd></div><div className="flex flex-wrap justify-between gap-2"><dt className="text-[#7182A4]">Email</dt><dd className="break-all"><a href={`mailto:${conversation.email}`} className="hover:underline">{conversation.email}</a></dd></div></dl></section>
            <section className={cardClass}><h2 className="mb-5 font-semibold">Communication history</h2><ul className="divide-y divide-gray-100">{conversation.history.map((item, i) => {
              const Icon = i === 2 ? Megaphone : MessageSquare;
              return <li key={item.id} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"><span className={`rounded-lg p-2 ${i === 2 ? "bg-violet-50 text-violet-600" : "bg-blue-50 text-blue-500"}`}><Icon size={16} /></span><div className="min-w-0 flex-1"><p className="text-xs">{item.title}</p><p className="mt-1 text-[11px] text-[#8B9ABD]">{item.description}</p></div><span className="text-[10px] text-[#8B9ABD]">{item.date}</span></li>;
            })}</ul></section>
          </aside>
        </div>
      </>}
    </div>
  );
}
