import React from "react";
import { Construction } from "lucide-react";
import EmptyState from "../../../admin/components/EmptyState";

/** Placeholder for pricing sections whose designs haven't been built yet. */
const ComingSoon = ({ title }) => (
  <div className="rounded-2xl bg-white">
    <EmptyState icon={Construction} title={`${title} is coming soon`} description="This section is still being built." />
  </div>
);

export default ComingSoon;
