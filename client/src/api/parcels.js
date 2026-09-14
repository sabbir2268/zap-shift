const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const request = async (url, options = {}) => {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Something went wrong");
  }

  return response.json();
};

export const getParcels = () => request("/api/parcels");

export const getParcel = (id) => request(`/api/parcels/${id}`);

export const createParcel = (data) =>
  request("/api/parcels", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateParcel = (id, data) =>
  request(`/api/parcels/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteParcel = (id) =>
  request(`/api/parcels/${id}`, {
    method: "DELETE",
  });