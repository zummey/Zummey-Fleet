import React from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import CustomerProfileCard from "./CustomerProfileCard";
import HistoryPanel from "./HistoryPanel";
import DetailTabs from "../../../components/DetailTabs";
import ErrorBox from "../../../components/ErrorBox";
import ProfileSkeleton from "../../../components/ProfileSkeleton";
import { useCustomerActions } from "../useCustomerActions";
import { CUSTOMER_DETAIL_TABS, DETAIL_TAB_QUERY_PARAM, getDetailTabById } from "./customerDetails.config";
import { useCustomerDetails } from "../../../../../api/admin.queries";

const CustomerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = getDetailTabById(searchParams.get(DETAIL_TAB_QUERY_PARAM));

  const customer = useCustomerDetails(customerId);
  const { handleAction, dialog } = useCustomerActions({
    onDeleted: () => navigate("/user-management/customers", { replace: true }),
  });

  const handleTabChange = (id) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(DETAIL_TAB_QUERY_PARAM, id);
        return next;
      },
      { replace: true }
    );
  };

  return (
    <div className="mb-6 space-y-6 font-poppins">
      <Link
        to="/user-management/customers"
        className="inline-flex items-center gap-1 text-xl font-semibold text-[#343C6A] hover:text-[#EB4827]"
      >
        <ChevronLeft size={20} />
        Customers Management
      </Link>

      {customer.isLoading ? (
        <ProfileSkeleton />
      ) : customer.isError ? (
        <ErrorBox
          title="Error loading customer"
          error={customer.error}
          onRetry={customer.refetch}
          isRetrying={customer.isFetching}
        />
      ) : (
        <>
          <CustomerProfileCard customer={customer.data} onAction={handleAction} />

          <DetailTabs
            tabs={CUSTOMER_DETAIL_TABS}
            activeTab={activeTab.id}
            onChange={handleTabChange}
            label="Customer history"
            idPrefix="customer"
          />

          <section
            key={activeTab.id}
            id={`customer-panel-${activeTab.id}`}
            role="tabpanel"
            aria-labelledby={`customer-tab-${activeTab.id}`}
            className="rounded-2xl bg-white p-5 motion-safe:animate-fade-in-up sm:p-6"
          >
            <HistoryPanel customerId={customerId} tab={activeTab} />
          </section>
        </>
      )}

      {dialog}
    </div>
  );
};

export default CustomerDetails;
