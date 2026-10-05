/*
 * Every status the project shows, in one place.
 *
 * A bare word like "Pending" says nothing on its own. It could be a parcel
 * that has not moved yet, a payment that has not cleared, or a rider
 * application nobody has looked at. So a status is always two things: the kind
 * of thing it describes, and the value it currently holds.
 *
 * Each entry carries a pill className for the status itself and a dot className
 * for the small swatch a legend uses, so both read as the same status.
 */

export const STATUS_KINDS = {
  delivery: "Delivery",
  payment: "Payment",
  rider: "Rider",
  account: "Account",
};

/* where a parcel is, keyed by the value stored on the parcel */
export const DELIVERY_STATUS = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300",
    dot: "bg-yellow-400",
  },
  /* booked and given to a rider, but the rider has not collected it yet. it sits
     between the sender handing the parcel in and the rider picking it up, so the
     two ends of a delivery are not squashed into one step */
  rider_assigned: {
    label: "Rider Assigned",
    className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300",
    dot: "bg-indigo-400",
  },
  picked_up: {
    label: "Picked Up",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
    dot: "bg-blue-400",
  },
  in_transit: {
    label: "In Transit",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300",
    dot: "bg-purple-400",
  },
  /* A parcel going to another region is not carried the whole way by one rider.
     A company truck takes it to the service center nearest the customer and it
     waits there to be picked up by a rider based in that region, so this status
     is the truck leg and the parcel is still on its way. */
  transferred: {
    label: "Transferred",
    className: "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300",
    dot: "bg-cyan-400",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
    dot: "bg-green-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
    dot: "bg-red-400",
  },
};

/* whether the money for a parcel has cleared, keyed by parcel.paymentStatus */
export const PAYMENT_STATUS = {
  paid: {
    label: "Paid",
    className: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
    dot: "bg-green-400",
  },
  unpaid: {
    label: "Unpaid",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    dot: "bg-amber-400",
  },
};

/* where a rider application stands, keyed by application.status */
export const RIDER_STATUS = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300",
    dot: "bg-yellow-400",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
    dot: "bg-green-400",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
    dot: "bg-red-400",
  },
  held: {
    label: "On Hold",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
    dot: "bg-orange-400",
  },
};

/* whether an account is allowed to act, keyed by user.blocked */
export const ACCOUNT_STATUS = {
  active: {
    label: "Active",
    className: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
    dot: "bg-green-400",
  },
  blocked: {
    label: "Blocked",
    className: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
    dot: "bg-red-400",
  },
};

const REGISTRY = {
  delivery: { values: DELIVERY_STATUS, fallback: "pending" },
  payment: { values: PAYMENT_STATUS, fallback: "unpaid" },
  rider: { values: RIDER_STATUS, fallback: "pending" },
  account: { values: ACCOUNT_STATUS, fallback: "active" },
};

const UNKNOWN = {
  label: "Unknown",
  className:
    "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300",
  dot: "bg-gray-400",
};

/*
 * Resolves any status into the pair the ui needs: the name of what it
 * describes, the value it holds, and the colours for that value. A value that
 * is missing or unrecognised falls back to the kind's resting state rather
 * than rendering blank, so a status is never shown as an empty pill.
 */
export const getStatus = (kind, value) => {
  const entry = REGISTRY[kind];
  const name = STATUS_KINDS[kind] || "";

  if (!entry) {
    return { ...UNKNOWN, name, caption: name ? `${name} Status` : "Status" };
  }

  const status = entry.values[value] || entry.values[entry.fallback];

  return {
    ...status,
    name,
    caption: name ? `${name} Status` : "Status",
  };
};

/* the options for a status <select>, built from the same source as the badge
   so a form can never offer a value the ui cannot label */
export const getStatusOptions = (kind) =>
  Object.entries(REGISTRY[kind]?.values || {}).map(([value, status]) => ({
    value,
    label: status.label,
  }));
