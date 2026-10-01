/*
 * What a rider earns on a single delivery.
 *
 * A rider only ever carries a parcel the final leg, inside their own region. A
 * parcel going to another region is moved there by a company truck and handed to
 * a rider based at the destination service center, so the rider who delivers it
 * is always working in the region it is being delivered to.
 *
 * That leaves two tiers:
 *   delivered to the rider's own
 *   service center                80% of the delivery fee
 *   delivered to another center
 *   in the rider's region         65% of the delivery fee
 *
 * The percentage comes off the delivery fee only, not the total the customer
 * paid. The service charge is the platform's own cut and is never shared.
 *
 * This runs on the server on purpose. A rider's earnings are money, so the tier
 * and the amount are decided here and handed to the client already worked out.
 * The browser is only told the answer, it never gets to pick one.
 */

/* the fee a rider is paid on, keyed by the tier it falls into. the captions are
   what the rider reads, so they say what happened rather than which branch of a
   switch was taken */
const EARNING_RULES = {
  same_center: {
    rate: 0.8,
    label: "Same service center",
    caption: "80% of the delivery fee",
  },
  same_region: {
    rate: 0.65,
    label: "Same region",
    caption: "65% of the delivery fee",
  },
};

/* a service center is picked from a fixed list, but it is stored as free text on
   both the parcel and the rider, so the two are compared without regard to case
   or surrounding spaces */
const sameName = (a, b) =>
  String(a || "")
    .trim()
    .toLowerCase() === String(b || "")
    .trim()
    .toLowerCase();

/* the tier a delivery falls into.
   the parcel's receiver service center is compared against the rider's own
   service center, so a parcel delivered to the center a rider works out of is
   the same_center tier and pays the most. every other delivery a rider carries
   is the same-region rate: the truck moves cross-region parcels to the
   destination center first, so the rider delivering it is already in that
   region and there is no lower tier for them to fall into. */
const getEarningTier = (parcel, rider) => {
  if (
    parcel?.receiverServiceCenter &&
    rider?.serviceCenter &&
    sameName(parcel.receiverServiceCenter, rider.serviceCenter)
  ) {
    return "same_center";
  }

  return "same_region";
};

/* the delivery fee on a parcel, as a plain number.
   the booking form posts the fee the browser worked out, which means it can
   arrive as a string, as a decimal, or not at all. anything that is not a
   usable number reads as 0 so an earning is never NaN */
const toFee = (value) => {
  const fee = Number(value);

  return Number.isFinite(fee) && fee > 0 ? Math.round(fee) : 0;
};

/*
 * The full earning for one parcel: which tier applied, the percentage, what the
 * rider actually gets, and whether that money has been earned yet.
 *
 * A pending, cancelled or still in transit delivery shows what it will pay, but
 * it is not counted as money in hand. Only a delivered parcel is settled, so
 * `settled` is what the totals add up.
 */
const getEarning = (parcel, rider) => {
  const tier = getEarningTier(parcel, rider);
  const rule = EARNING_RULES[tier];

  const fee = toFee(parcel?.productDeliveryCost);
  const amount = Math.round(fee * rule.rate);

  const settled = parcel?.status === "delivered";

  return {
    tier,
    label: rule.label,
    caption: rule.caption,
    rate: rule.rate,
    /* the delivery fee the percentage was taken off, so the rider can see the
       number their share came from */
    fee,
    amount,
    settled,
    /* false means the amount is what this delivery will pay, not money already
       in the rider's hand */
    status: settled
      ? "earned"
      : parcel?.status === "cancelled"
        ? "cancelled"
        : "pending",
  };
};

/* the earnings for a whole list of a rider's deliveries, plus the totals.
   settledTotal is the money actually earned, pendingTotal is what the open
   deliveries are worth, and total is the two together */
const getEarningsSummary = (parcels, rider) => {
  const earnings = (parcels || []).map((parcel) => getEarning(parcel, rider));

  const sum = (predicate) =>
    earnings
      .filter(predicate)
      .reduce((total, entry) => total + entry.amount, 0);

  const settledTotal = sum((entry) => entry.settled);
  const pendingTotal = sum(
    (entry) => !entry.settled && entry.status !== "cancelled"
  );
  const cancelledTotal = sum((entry) => entry.status === "cancelled");

  return {
    earnings,
    settledTotal,
    pendingTotal,
    cancelledTotal,
    total: settledTotal + pendingTotal,
    deliveryCount: earnings.length,
  };
};

module.exports = {
  EARNING_RULES,
  getEarningTier,
  getEarning,
  getEarningsSummary,
};
