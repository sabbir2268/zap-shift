import { useCallback } from "react";
import useParcels from "../api/parcels";

const useTrackingUpdate = () => {
  const { updateParcel } = useParcels();

  const updateTracking = useCallback(
    (parcelId, data) => updateParcel(parcelId, data),
    [updateParcel]
  );

  const updateDeliveryStatus = useCallback(
    (parcelId, status) => updateParcel(parcelId, { status }),
    [updateParcel]
  );

  const updatePaymentStatus = useCallback(
    (parcelId, paymentStatus) => updateParcel(parcelId, { paymentStatus }),
    [updateParcel]
  );

  return { updateTracking, updateDeliveryStatus, updatePaymentStatus };
};

export default useTrackingUpdate;