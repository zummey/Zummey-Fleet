import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import ErrorBox from "../components/ErrorBox";
import { useSendBroadcast } from "../../../api/communications.mutations";
import { AUDIENCES, CHANNELS, CUSTOMER_GROUPS, cardClass, inputClass, primaryClass } from "./communications.config";

export default function NewBroadcast() {
  const [audience, setAudience] = useState("all");
  const [groups, setGroups] = useState([]);
  const [channels, setChannels] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const mutation = useSendBroadcast();
  const navigate = useNavigate();
  const toggle = (setter, value) => setter((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  const valid = title.trim() && message.trim() && channels.length > 0 && (audience !== "groups" || groups.length > 0);
  const submit = (event) => {
    event.preventDefault();
    if (!valid || mutation.isPending) return;
    mutation.mutate({ audience, groups: audience === "groups" ? groups : [], channels, title, message }, { onSuccess: () => navigate("/communications", { state: { broadcastCreated: true } }) });
  };
  return (
    <div className="space-y-5 font-poppins text-[#1D2B4F]">
      <div className="flex items-center gap-3"><Link to="/communications" aria-label="Back to Communication Center" className="rounded-lg p-1 hover:bg-gray-100"><ArrowLeft size={20} /></Link><h1 className="text-xl font-semibold">New broadcast</h1></div>
      <form onSubmit={submit} className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(260px,1fr)]">
        <fieldset disabled={mutation.isPending} className="min-w-0 space-y-5">
          <legend className="sr-only">Compose broadcast</legend>
          <section className={cardClass}>
            <fieldset><legend className="mb-4 font-semibold">1. Who should get it?</legend><div className="grid gap-3 sm:grid-cols-2">{AUDIENCES.map((item) => <label key={item.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${audience === item.id ? "border-blue-300 bg-blue-50/30" : "border-[#E3E9F6]"}`}><input type="radio" name="audience" value={item.id} checked={audience === item.id} onChange={() => setAudience(item.id)} className="accent-[#001B44]" /><span><span className="block text-sm font-medium">{item.label}</span><span className="mt-1 block text-xs text-[#7182A4]">{item.description}</span></span></label>)}</div></fieldset>
            {audience === "groups" && (
              <fieldset className="mt-5">
                <legend className="mb-3 text-xs text-[#7182A4]">Choose one or more group</legend>
                <div className="flex flex-wrap gap-3">
                  {CUSTOMER_GROUPS.map((item) => {
                    const selected = groups.includes(item.id);
                    return (
                      <label key={item.id} className={`relative inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors focus-within:ring-2 focus-within:ring-blue-300 ${selected ? "border-[#001B44] bg-[#001B44] text-white" : "border-[#D9E2F3] bg-white text-[#343C6A] hover:bg-blue-50"}`}>
                        <input type="checkbox" name="customer-groups" value={item.id} checked={selected} onChange={() => toggle(setGroups, item.id)} className="peer sr-only" />
                        {selected && <Check size={14} aria-hidden="true" />}
                        <span>{item.label}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${selected ? "bg-white/15 text-white" : "bg-[#F0F3FA] text-[#7182A4]"}`}>{item.count.toLocaleString("en-US")}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}
          </section>
          <section className={cardClass}><fieldset><legend className="font-semibold">2. How should we send it?</legend><p className="mb-4 mt-1 text-xs text-[#7182A4]">Pick one or more channels.</p><div className="grid gap-3 sm:grid-cols-2">{CHANNELS.map((item) => {
            const Icon = item.icon;
            return <label key={item.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${channels.includes(item.id) ? "border-blue-300 bg-blue-50/30" : "border-[#E3E9F6]"}`}><span className={`rounded-xl p-3 ${item.tone}`}><Icon size={17} /></span><span className="flex-1"><span className="block text-sm font-medium">{item.label}</span><span className="mt-1 block text-xs text-[#7182A4]">{item.description}</span></span><input type="checkbox" checked={channels.includes(item.id)} onChange={() => toggle(setChannels, item.id)} className="accent-[#001B44]" /></label>;
          })}</div></fieldset></section>
          <section className={cardClass}><h2 className="mb-4 font-semibold">3. What should it say?</h2><label htmlFor="broadcast-title" className="mb-2 block text-xs text-[#7182A4]">Title</label><input id="broadcast-title" required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="For example: Scheduled maintenance tonight" className={inputClass} /><label htmlFor="broadcast-message" className="mb-2 mt-5 block text-xs text-[#7182A4]">Message</label><textarea id="broadcast-message" required maxLength={5000} rows={6} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write your message here" className={`${inputClass} resize-y`} /></section>
        </fieldset>
        <aside className={`${cardClass} space-y-5 xl:sticky xl:top-0`}>
          <h2 className="font-semibold">Preview</h2>
          <div className="rounded-xl border border-[#EEF1F8] bg-[#F7F8FC] p-4 text-[#8B9ABD]"><p className="text-[10px]">Zummey</p><p className="mt-3 break-words text-sm font-semibold">{title.trim() || "Your title appears here"}</p><p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed">{message.trim() || "Your message appears here."}</p></div>
          <dl className="space-y-3 text-xs"><div className="flex justify-between gap-4"><dt className="text-[#7182A4]">Audience</dt><dd className="text-right">{audience === "groups" ? groups.map((id) => CUSTOMER_GROUPS.find((item) => item.id === id)?.label).join(", ") || "No groups selected" : AUDIENCES.find((item) => item.id === audience)?.label}</dd></div><div className="flex justify-between"><dt className="text-[#7182A4]">Channels</dt><dd>{channels.length}</dd></div></dl>
          {mutation.isError && <ErrorBox error={mutation.error} />}
          <button type="submit" disabled={!valid || mutation.isPending} className={`${primaryClass} w-full`}>{mutation.isPending ? "Sending..." : "Send broadcast"}</button>
        </aside>
      </form>
    </div>
  );
}
