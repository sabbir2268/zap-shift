/*
 * Every status the project shows, in one place.
 *
 * A bare word like "Pending" says nothing on its own. It could be a parcel
 * that has not moved yet, a payment that has not cleared, or a rider
 * application nobody has looked at. So a status is always two things: the kind
 * of thing it describes, and the value it currently holds.
 */

export const STATUS_KINDS = {
  delivery: "Delivery",
  payment: "Payment",
  rider: "Rider",
};

/* where a parcel is, keyed by the value stored on the parcel */
export const DELIVERY_STATUS = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  picked_up: { label: "Picked Up", className: "bg-blue-100 text-blue-800" },
  in_transit: { label: "In Transit", className: "bg-purple-100 text-purple-800" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
};

/* whether the money for a parcel has cleared, keyed by parcel.paymentStatus */
export const PAYMENT_STATUS = {
  paid: { label: "Paid", className: "bg-green-100 text-green-800" },
  unpaid: { label: "Unpaid", className: "bg-amber-100 text-amber-800" },
};

/* where a rider application stands, keyed by application.status */
export const RIDER_STATUS = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Approved", className: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  held: { label: "On Hold", className: "bg-orange-100 text-orange-800" },
};

const REGISTRY = {
  delivery: { values: DELIVERY_STATUS, fallback: "pending" },
  payment: { values: PAYMENT_STATUS, fallback: "unpaid" },
  rider: { values: RIDER_STATUS, fallback: "pending" },
};

const UNKNOWN = { label: "Unknown", className: "bg-gray-100 text-gray-700" };

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
