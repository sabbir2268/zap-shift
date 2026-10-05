/*
 * The rider dashboard chart, worked out from the counts the deliveries hook
 * already keeps.
 *
 * Only the five steps that decide how a rider's day is going are charted: what is
 * waiting to be collected, what they have collected, what is on the road, what
 * landed and what fell through. Two further statuses exist but are left out on
 * purpose, because neither is a stage a rider passes through every day:
 *
 *   pending     the status parcels booked before rider assignment existed carry,
 *               so it is empty on every current parcel and a bar of nothing but
 *               a name
 *   transferred a parcel handed to a company truck for the last leg and waiting
 *               at the destination center, which is the cross region case and
 *               rare enough to belong on the deliveries page rather than a
 *               summary chart
 *
 * The total above the chart counts every parcel whatever stage it is at, so
 * nothing a rider is waiting on goes missing, it is only the two quiet statuses
 * that have no bar.
 *
 * The bars are coloured here rather than in the chart because recharts paints
 * with a colour value and cannot use a tailwind class. Each hex is the same hue
 * as the pill the same status gets everywhere else, so a bar and the badge beside
 * it read as one status.
 *
 * Every one of the five keeps its bar even when nothing sits in it, so a rider
 * reads the whole journey rather than only the part they happen to be standing on.
 */

const BUCKETS = [
  {
    key: "assigned",
    label: "Assigned",
    caption: "Waiting to be collected",
    color: "#6366f1",
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
   chart. It is not a bar of its own, because it is the whole queue and a bar for
   it would dwarf the stages it is made of */
export const getDeliveryTotal = (counts) => Number(counts?.total) || 0;

/* the completed share, which is what a rider is judged on. A rider with nothing
   assigned yet is at zero, not at a made up hundred percent */
export const getDeliveryRate = (counts) => {
  const delivered = Number(counts?.delivered) || 0;
  const total = getDeliveryTotal(counts);

  if (!total) return 0;

  return Math.round((delivered / total) * 100);
};

/* the bars to draw, one per step that matters, so an empty step is a zero bar
   rather than a missing one */
export const getDeliveryChartRows = (counts) =>
  BUCKETS.map((bucket) => ({
    ...bucket,
    value: Number(counts?.[bucket.key]) || 0,
  }));