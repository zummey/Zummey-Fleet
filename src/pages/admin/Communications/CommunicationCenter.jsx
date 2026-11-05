import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Radio } from "lucide-react";
import Avatar from "../components/Avatar";
import DetailTabs from "../components/DetailTabs";
import ErrorBox from "../components/ErrorBox";
import { useConversations } from "../../../api/communications.queries";
import { MESSAGE_TABS, primaryClass } from "./communications.config";

export default function CommunicationCenter() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const tab = MESSAGE_TABS.some((item) => item.id === params.get("tab")) ? params.get("tab") : "customers";
  const query = useConversations();
  const conversations = query.data ?? [];
  const rows = conversations.filter((item) => item.group === tab);
  return (
    <div className="space-y-8 font-poppins text-[#343C6A]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Communication Center</h1>
        <Link to="/communications/new-broadcast" className={primaryClass}><Radio size={19} /> New Broadcast</Link>
      </div>
      {location.state?.broadcastCreated && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Broadcast created successfully in demo mode. Live delivery requires a connected communications API.</p>}
      <section>
        <h2 className="text-lg font-medium">Messages</h2>
        <p className="mb-5 text-xs text-gray-400">{conversations.filter((item) => item.unread).length} unread across all channels</p>
        <DetailTabs tabs={MESSAGE_TABS} activeTab={tab} onChange={(value) => setParams({ tab: value })} label="Message channels" idPrefix="comms" activeTabClassName="text-[#343C6A]" />
        <div role="tabpanel" id={`comms-panel-${tab}`} aria-labelledby={`comms-tab-${tab}`} className="mt-5 space-y-3">
          {query.isLoading ? Array.from({ length: 4 }, (_, i) => <div key={i} className="h-24 animate-pulse bg-gray-200" />) : query.isError ? <ErrorBox error={query.error} onRetry={query.refetch} /> : rows.length === 0 ? <p className="py-12 text-center text-sm text-gray-400">No messages in this channel.</p> : rows.map((item) => (
            <Link key={item.id} to={`/communications/${item.id}`} className={`flex items-center gap-4 border-l-[3px] bg-white px-5 py-6 shadow-sm transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-400 ${item.unread ? "border-[#001B44]" : "border-transparent"}`}>
              <Avatar name={item.name} colorful />
              <div className="min-w-0 flex-1"><h3 className="font-semibold">{item.name}</h3><p className="mt-2 truncate text-sm text-gray-900">{item.preview}</p></div>
              <span className="shrink-0 self-start text-xs italic text-gray-400">{item.messages.length > 3 ? "Just now" : "2 min ago"}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
