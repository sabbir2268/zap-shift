import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useRider from "../api/rider";

/* What a rider earns on a delivery, read from the parcel rather than worked out
   here. The server decides the tier and the amount and ships both on every
   parcel, because a rider's pay is money and the browser is not the place to
   calculate it. A parcel booked before earnings existed carries no `earning`
   object, so every read below tolerates its absence. */
export const getEarning = (parcel) => parcel?.earning || null;

/* the tiers, mirrored from the server so the table can label a rate it is given
   rather than hard coding the number in the view */
const EARNING_TIERS = {
  same_center: {
    label: "Same service center",
    className: "bg-blue-100 dark:bg-blue-400/15 text-blue-800 dark:text-blue-300",
  },
  same_region: {
    label: "Same region",
    className: "bg-emerald-100 dark:bg-emerald-400/15 text-emerald-800 dark:text-emerald-300",
  },
};

export const getEarningTier = (tier) =>
  EARNING_TIERS[tier] || {
    label: "Unrated",
    className: "bg-[var(--surface-muted)] text-[var(--text)]",
  };

/* the money a rider has actually earned, which is only the delivered deliveries.
   anything still open is shown on the row but is not money in hand, so it is
   kept out of the total */
const settledAmount = (parcel) => {
  const earning = getEarning(parcel);

  return earning?.settled ? Number(earning.amount) || 0 : 0;
};

/* the money the open deliveries will pay once they land */
const pendingAmount = (parcel) => {
  const earning = getEarning(parcel);

  if (!earning || earning.settled || earning.status === "cancelled") return 0;

  return Number(earning.amount) || 0;
};

/* the one step a rider may take next on a parcel, a delivered or cancelled
   parcel is closed and the rider gets no further buttons on it. a parcel the
   truck has carried to the destination center is back at the start of the
   rider's part of the journey, waiting to be collected from that center */
const NEXT_STATUS = {
  rider_assigned: { status: "picked_up", label: "Mark Picked Up" },
  pending: { status: "picked_up", label: "Mark Picked Up" },
  picked_up: { status: "in_transit", label: "Start Delivery" },
  in_transit: { status: "delivered", label: "Mark Delivered" },
  transferred: { status: "picked_up", label: "Collect from Center" },
};

export const canCancel = (status) =>
  status === "rider_assigned" ||
  status === "pending" ||
  status === "picked_up" ||
  status === "in_transit" ||
  status === "transferred";

/*
 * Loads the parcels assigned to the signed in rider and moves them along their
 * delivery. Shared by the rider dashboard and the deliveries page.
 */
const useRiderDeliveries = () => {
  const { getDeliveries, updateDeliveryStatus } = useRider();

  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);

  const loadDeliveries = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getDeliveries();
      setParcels(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Failed to load your deliveries");
    } finally {
      setLoading(false);
    }
  }, [getDeliveries]);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const setStatus = useCallback(
    async (parcel, status, message) => {
      setWorkingId(parcel._id);

      try {
        const updated = await updateDeliveryStatus(parcel._id, status);

        setParcels((prev) =>
          prev.map((item) => (item._id === parcel._id ? updated : item))
        );

        toast.success(message || "Delivery updated!");
      } catch (error) {
        toast.error(error.message || "Failed to update the delivery");
      } finally {
        setWorkingId(null);
      }
    },
    [updateDeliveryStatus]
  );

  const counts = useMemo(() => {
    const byStatus = (value) =>
      parcels.filter((parcel) => parcel.status === value).length;

    return {
      total: parcels.length,
      assigned: byStatus("rider_assigned"),
      pending: byStatus("pending"),
      pickedUp: byStatus("picked_up"),
      inTransit: byStatus("in_transit"),
      transferred: byStatus("transferred"),
      delivered: byStatus("delivered"),
      cancelled: byStatus("cancelled"),
    };
  }, [parcels]);

  /* the money split, so the dashboard and the deliveries page read the same
     totals. settled is earned money, pending is what the open deliveries are
     worth, and the two are kept apart so an undelivered parcel is never added up
     as though it had been paid */
  const earnings = useMemo(() => {
    const settled = parcels.reduce((sum, parcel) => sum + settledAmount(parcel), 0);
    const pending = parcels.reduce((sum, parcel) => sum + pendingAmount(parcel), 0);

    return { settled, pending, total: settled + pending };
  }, [parcels]);

  return {
    parcels,
    loading,
    workingId,
    counts,
    earnings,
    loadDeliveries,
    setStatus,
    nextStep: (parcel) => NEXT_STATUS[parcel.status] || null,
  };
};

export default useRiderDeliveries;
