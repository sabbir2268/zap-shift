/*
 * When a parcel actually moved.
 *
 * The server stamps `pickedUpAt` and `deliveredAt` the moment a rider marks a
 * parcel picked up or delivered, so these are real times and not a promise.
 *
 * Parcels that reached those stages before the stamps existed carry no field at
 * all. Rather than inventing a time, the stamp is only read, and a parcel that
 * has not reached a stage is simply left without one. The one exception is a
 * parcel still sitting at a stage: for those `updatedAt` is when it was last
 * moved there, so it is the best answer available.
 */

const ON_THE_ROAD = ["picked_up", "in_transit"];

/* when the rider collected the parcel, or null if nobody has */
export const getPickedUpAt = (parcel) => {
  if (!parcel) return null;

  if (parcel.pickedUpAt) return new Date(parcel.pickedUpAt);

  /* a delivered parcel has been picked up, but nothing records when, and
     guessing from the delivery time would be a lie */
  if (!ON_THE_ROAD.includes(parcel.status)) return null;

  return parcel.updatedAt ? new Date(parcel.updatedAt) : null;
};

/* when the parcel reached the receiver, or null if it has not */
export const getDeliveredAt = (parcel) => {
  if (!parcel || parcel.status !== "delivered") return null;

  if (parcel.deliveredAt) return new Date(parcel.deliveredAt);

  return parcel.updatedAt ? new Date(parcel.updatedAt) : null;
};

/* a date and time, or a dash when there is nothing to show */
export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "—";