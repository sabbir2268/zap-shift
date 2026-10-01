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

  /* the rider's own cashout history, and the wallet figures behind it. the server
     decides what is in the wallet, so the client only sends an amount */
  const getCashouts = useCallback(() => api.get("/api/rider/cashouts"), [api]);

  const requestCashout = useCallback(
    (amount) => api.post("/api/rider/cashouts", { amount }),
    [api]
  );

  return {
    getDeliveries,
    updateDeliveryStatus,
    getCashouts,
    requestCashout,
  };
};

export default useRider;
