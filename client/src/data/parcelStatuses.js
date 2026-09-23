export const DELIVERY_STATUS = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  picked_up: { label: "Picked Up", className: "bg-blue-100 text-blue-800" },
  in_transit: { label: "In Transit", className: "bg-purple-100 text-purple-800" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
};

export const PAYMENT_STATUS = {
  paid: { label: "Paid", className: "bg-green-100 text-green-800" },
  unpaid: { label: "Unpaid", className: "bg-amber-100 text-amber-800" },
};

export const getDeliveryStatus = (value) =>
  DELIVERY_STATUS[value] || DELIVERY_STATUS.pending;

export const getPaymentStatus = (value) =>
  PAYMENT_STATUS[value] || PAYMENT_STATUS.unpaid;