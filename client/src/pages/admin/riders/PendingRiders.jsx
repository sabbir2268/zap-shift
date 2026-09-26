import React from "react";
import { ClipboardList } from "lucide-react";
import RiderList from "./RiderList";

const PendingRiders = () => (
  <RiderList
    status="pending"
    title="Pending Rider"
    description="Rider applications waiting for your review. Approve or reject them here."
    empty={{
      icon: ClipboardList,
      title: "No pending riders",
      hint: "New rider applications will appear here once submitted.",
    }}
    allowSearch
  />
);

export default PendingRiders;
