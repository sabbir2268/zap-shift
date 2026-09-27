import { useCallback } from "react";
import useAxios from "../hooks/useAxios";

/* every call here is rider only, the api checks the stored role again */
const useRider = () => {
  const api = useAxios();

  const getDeliveries = useCallback(
    () => api.get("/api/rider/parcels"),
    [api]
  );

  const updateDeliveryStatus = useCallback(
    (id, status) => api.patch(`/api/rider/parcels/${id}/status`, { status }),
    [api]
  );

  return { getDeliveries, updateDeliveryStatus };
};

export default useRider;
