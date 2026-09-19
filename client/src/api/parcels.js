import { useCallback } from "react";
import useAxios from "../hooks/useAxios";

const useParcels = () => {
  const api = useAxios();

  const getParcels = useCallback(
    (email) => api.get("/api/parcels", { params: email ? { email } : {} }),
    [api]
  );

  const getParcel = useCallback((id) => api.get(`/api/parcels/${id}`), [api]);

  const createParcel = useCallback(
    (data) => api.post("/api/parcels", data),
    [api]
  );

  const updateParcel = useCallback(
    (id, data) => api.put(`/api/parcels/${id}`, data),
    [api]
  );

  const deleteParcel = useCallback(
    (id) => api.delete(`/api/parcels/${id}`),
    [api]
  );

  return { getParcels, getParcel, createParcel, updateParcel, deleteParcel };
};

export default useParcels;