import React from "react";
import { useSearchParams } from "react-router-dom";
import DetailTabs from "../components/DetailTabs";
import AnalyticsDashboard from "./dashboard/AnalyticsDashboard";
import AnalyticsReports from "./reports/AnalyticsReports";
import { ANALYTICS_TABS, getAnalyticsTab } from "./analytics.config";

const PANELS = { dashboard: AnalyticsDashboard, reports: AnalyticsReports };

/** Analytics Management: dashboard and report builder, tab kept in ?tab= */
const AdminAnalytics = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = getAnalyticsTab(searchParams.get("tab")).id;
  const Panel = PANELS[tab];

  const changeTab = (next) =>
    setSearchParams(next === ANALYTICS_TABS[0].id ? {} : { tab: next }, { replace: true });

  return (
    <div className="space-y-5 font-poppins">
      <h1 className="text-xl font-semibold text-[#343C6A]">Analytics Management</h1>

      <DetailTabs tabs={ANALYTICS_TABS} activeTab={tab} onChange={changeTab} label="Analytics" idPrefix="analytics" />

      <div id={`analytics-panel-${tab}`} role="tabpanel" aria-labelledby={`analytics-tab-${tab}`}>
        <Panel />
      </div>
    </div>
  );
};

export default AdminAnalytics;
