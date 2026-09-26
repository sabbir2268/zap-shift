import { useCallback } from "react";
import useAxios from "../hooks/useAxios";

const usePayments = () => {
  const api = useAxios();

  const getPayments = useCallback(
    (email) => api.get("/api/payments", { params: email ? { email } : {} }),
    [api]
  );

  const createPayment = useCallback(
    (data) => api.post("/api/payments", data),
    [api]
  );

  return { getPayments, createPayment };
};

export default usePayments; 