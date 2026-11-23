import { useSearchParams } from "react-router-dom";
import PillTabs from "../../admin/components/PillTabs";
import { General, Notifications, Security } from "./Preferences";
import ServiceAreas from "./ServiceAreas";
import Integrations from "./Integrations";
import AuditLogs from "./AuditLogs";
import "./platform-settings.css";

const tabs = [
  { id: "general", label: "General", Panel: General },
  { id: "service-areas", label: "Service areas", Panel: ServiceAreas },
  { id: "notifications", label: "Notifications", Panel: Notifications },
  { id: "integrations", label: "Integrations", Panel: Integrations },
  { id: "security", label: "Security", Panel: Security },
  { id: "audit-logs", label: "Audit logs", Panel: AuditLogs },
];

export default function PlatformSettings() {
  const [params, setParams] = useSearchParams();
  const { id, Panel } = tabs.find((tab) => tab.id === params.get("tab")) ?? tabs[0];

  return (
    <div className="platform-settings font-poppins">
      <h1>Platform Settings</h1>
      <div className="ps-tabs">
        <PillTabs tabs={tabs} activeTab={id} label="Platform settings" idPrefix="platform"
          onChange={(tab) => setParams(tab === "general" ? {} : { tab })} />
      </div>
      <div id={`platform-panel-${id}`} role="tabpanel" aria-labelledby={`platform-tab-${id}`}>
        <Panel />
      </div>
    </div>
  );
}
