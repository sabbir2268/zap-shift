/*
 * The rider dashboard chart, worked out from the counts the deliveries hook
 * already keeps.
 *
 * The bars are coloured here rather than in the chart because recharts paints
 * with a colour value and cannot use a tailwind class. Each hex is the same hue
 * as the pill the same status gets everywhere else, so a bar and the badge beside
 * it read as one status.
 *
 * Every step a delivery can be at is kept, including the ones nothing sits in.
 * A rider reading the chart should see the whole journey their parcels are on,
 * so a step they have already cleared, or have not reached yet, still has a bar
 * to compare against, and the shape of the queue never changes under them.
 */

const BUCKETS = [
  {
    key: "assigned",
    label: "Assigned",
    caption: "Waiting to be collected",
    color: "#6366f1",
  },
  {
    key: "pending",
    label: "Pending",
    caption: "Not collected yet",
    color: "#eab308",
  },
  {
    key: "pickedUp",
    label: "Picked Up",
    caption: "Collected from the sender",
    color: "#3b82f6",
  },
  {
    key: "inTransit",
    label: "In Transit",
    caption: "On the road with you",
    color: "#a855f7",
  },
  {
    key: "transferred",
    label: "At Center",
    caption: "Waiting at the destination center",
    color: "#06b6d4",
  },
  {
    key: "delivered",
    label: "Delivered",
    caption: "Completed deliveries",
    color: "#22c55e",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    caption: "No longer going ahead",
    color: "#ef4444",
  },
];

/* how many parcels the rider was ever given, which is the headline above the
   chart and not a bar of its own, since it is the sum of every other bar */
export const getDeliveryTotal = (counts) => Number(counts?.total) || 0;

/* the completed share, which is what a rider is judged on. A rider with nothing
   assigned yet is at zero, not at a made up hundred percent */
export const getDeliveryRate = (counts) => {
  const delivered = Number(counts?.delivered) || 0;
  const total = getDeliveryTotal(counts);

  if (!total) return 0;

  return Math.round((delivered / total) * 100);
};

/* the bars to draw, one per step a parcel can be at, so an empty step is a zero
   bar rather than a missing one */
export const getDeliveryChartRows = (counts) =>
  BUCKETS.map((bucket) => ({
    ...bucket,
    value: Number(counts?.[bucket.key]) || 0,
  }));