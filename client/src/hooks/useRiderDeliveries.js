import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useRider from "../api/rider";

/* the one step a rider may take next on a parcel, a delivered or cancelled
   parcel is closed and the rider gets no further buttons on it */
const NEXT_STATUS = {
  pending: { status: "picked_up", label: "Mark Picked Up" },
  picked_up: { status: "in_transit", label: "Start Delivery" },
  in_transit: { status: "delivered", label: "Mark Delivered" },
};

export const canCancel = (status) =>
  status === "pending" || status === "picked_up" || status === "in_transit";

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
      pending: byStatus("pending"),
      pickedUp: byStatus("picked_up"),
      inTransit: byStatus("in_transit"),
      delivered: byStatus("delivered"),
      cancelled: byStatus("cancelled"),
    };
  }, [parcels]);

  return {
    parcels,
    loading,
    workingId,
    counts,
    loadDeliveries,
    setStatus,
    nextStep: (parcel) => NEXT_STATUS[parcel.status] || null,
  };
};

export default useRiderDeliveries;
