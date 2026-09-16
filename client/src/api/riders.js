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

export const getRiderApplications = () => request("/api/rider-applications");

export const createRiderApplication = (data) =>
  request("/api/rider-applications", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteRiderApplications = () =>
  request("/api/rider-applications", { method: "DELETE" });