/*
 * The admin dashboard charts, worked out from the three lists the page already
 * loads: every parcel, every rider application and every payment.
 *
 * Five figures each, because five is what an admin can hold in their head at a
 * glance. Anything past that belongs on the page that goes into detail, which for
 * riders is Manage User and for parcels is Manage Parcel.
 *
 * The colours are hex because the chart paints them itself and cannot use a
 * tailwind class. Each is the same hue as the pill that status gets everywhere
 * else, so a bar and a badge read as one status.
 */

const list = (value) => (Array.isArray(value) ? value : []);

const countWhere = (items, predicate) => items.filter(predicate).length;

/* an application saved before the status field existed reads as pending, the
   same resting state the rider pipeline lists it under */
const applicationStatus = (application) => application?.status || "pending";

/* the accounts behind the parcels, which is how this page has always counted
   users. An account that registered and sent nothing is not in here, and the
   caption on the bar says so rather than letting the number read as every account
   on the platform */
const distinctSenders = (parcels) =>
  new Set(
    list(parcels)
      .map((parcel) => parcel?.userEmail)
      .filter(Boolean)
  ).size;

const PEOPLE_ROWS = [
  {
    key: "users",
    label: "Total Users",
    caption: "Accounts that have sent a parcel",
    color: "#3b82f6",
  },
  {
    key: "riders",
    label: "Total Riders",
    caption: "Approved, the paused ones included",
    color: "#6366f1",
  },
  {
    key: "active",
    label: "Active Riders",
    caption: "Approved and out on the road",
    color: "#22c55e",
  },
  {
    key: "held",
    label: "On Hold",
    caption: "Approved but paused by an admin",
    color: "#f97316",
  },
  {
    key: "pending",
    label: "Pending",
    caption: "Applications waiting for a decision",
    color: "#eab308",
  },
];

/*
 * Total riders counts approved and held together, because a rider an admin paused
 * is still a rider and would otherwise vanish from the total the moment they are
 * put on hold. Active is the approved ones alone, so the two figures together say
 * how much of the fleet is actually moving.
 */
export const getPeopleRows = (parcels, applications) => {
  const applied = list(applications);

  const approved = countWhere(applied, (a) => applicationStatus(a) === "approved");
  const held = countWhere(applied, (a) => applicationStatus(a) === "held");
  const pending = countWhere(
    applied,
    (a) => applicationStatus(a) === "pending"
  );

  const values = {
    users: distinctSenders(parcels),
    riders: approved + held,
    active: approved,
    held,
    pending,
  };

  return PEOPLE_ROWS.map((row) => ({ ...row, value: values[row.key] }));
};

const PARCEL_ROWS = [
  {
    key: "total",
    label: "Total Parcels",
    caption: "Every parcel booked on the platform",
    color: "#6366f1",
  },
  {
    key: "delivered",
    label: "Delivered",
    caption: "Arrived at the receiver",
    color: "#22c55e",
  },
  {
    key: "inTransit",
    label: "In Transit",
    caption: "On the road right now",
    color: "#a855f7",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    caption: "No longer going ahead",
    color: "#ef4444",
  },
  {
    key: "waiting",
    label: "Awaiting Delivery",
    caption: "Booked, or collected and waiting to go",
    color: "#3b82f6",
  },
];

/*
 * Four of these five add up to the total. Awaiting delivery is the remainder, so
 * every parcel lands in exactly one bar and nothing is counted twice: it is
 * whatever has not been delivered, cancelled or put on the road yet.
 */
export const getParcelRows = (parcels) => {
  const booked = list(parcels);

  const byStatus = (status) =>
    countWhere(booked, (parcel) => parcel?.status === status);

  const delivered = byStatus("delivered");
  const cancelled = byStatus("cancelled");
  const inTransit = byStatus("in_transit");

  const values = {
    total: booked.length,
    delivered,
    inTransit,
    cancelled,
    waiting: booked.length - delivered - cancelled - inTransit,
  };

  return PARCEL_ROWS.map((row) => ({ ...row, value: values[row.key] }));
};