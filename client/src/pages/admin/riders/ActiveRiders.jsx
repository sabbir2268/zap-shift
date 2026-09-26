import React from "react";
import { Bike } from "lucide-react";
import RiderList from "./RiderList";

const ActiveRiders = () => (
  <RiderList
    status="approved"
    title="Active Rider"
    description="All approved riders, including those currently on hold."
    empty={{
      icon: Bike,
      title: "No active riders",
      hint: "Approved riders will appear here.",
    }}
    allowSearch
    allowHold
    includeHeld
    table
  />
);

export default ActiveRiders;
