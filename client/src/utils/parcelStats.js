/*
 * What a sender's parcels are up to, worked out from the parcel list itself.
 *
 * Three groups, because three is what a sender can be usefully told: it arrived,
 * it is still on the way, or it fell through. Grouping rather than charting every
 * status is deliberate. The statuses a parcel passes through on the road belong to
 * the rider's dashboard, which counts them step by step, and a sender only ever
 * cares which end of the journey the parcel is at. The groups also add up to the
 * whole list, so the ring is never a share of something other than everything.
 *
 * The colours are hex because the chart paints them itself and cannot use a
 * tailwind class. Each is the same hue as the pill that status gets everywhere
 * else, so a slice and a badge read as one status.
 */

const GROUPS = [
  {
    key: "delivered",
    label: "Delivered",
    caption: "Arrived at the receiver",
    color: "#22c55e",
  },
  {
    key: "moving",
    label: "On the way",
    caption: "Booked and not delivered yet",
    color: "#a855f7",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    caption: "No longer going ahead",
    color: "#ef4444",
  },
];

/* how many parcels the sender has on file */
export const getParcelTotal = (parcels) =>
  Array.isArray(parcels) ? parcels.length : 0;

/* the share of the list a group holds, so a slice can be read as a percentage.
   An empty list is zero percent rather than a division by nothing */
export const getParcelShare = (value, parcels) => {
  const total = getParcelTotal(parcels);

  if (!total) return 0;

  return Math.round((Number(value) / total) * 100);
};

/* the slices to draw, one per group, in a fixed order so the ring does not
   rearrange itself as parcels are added */
export const getParcelMix = (parcels) => {
  const counts = { delivered: 0, moving: 0, cancelled: 0 };

  for (const parcel of parcels || []) {
    if (parcel?.status === "delivered") counts.delivered += 1;
    else if (parcel?.status === "cancelled") counts.cancelled += 1;
    /* everything else, whichever step of the road it is at, is still on its way */
    else counts.moving += 1;
  }

  return GROUPS.map((group) => ({ ...group, value: counts[group.key] }));
};