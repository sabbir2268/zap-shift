export const ADMIN_EMAIL = "zapshiftadmin@gmail.com";

/* email comparison is case and whitespace insensitive */
export const isAdminEmail = (email) =>
  (email || "").trim().toLowerCase() === ADMIN_EMAIL;

/* the owner account, or anyone promoted to admin on the administration page */
export const isAdminUser = (user, role) =>
  isAdminEmail(user?.email) || role === "admin";

export const getDashboardPath = (user, role) =>
  isAdminUser(user, role) ? "/admin" : "/dashboard";

/* where to send someone right after they authenticate */
export const getPostAuthPath = (email, from) =>
  isAdminEmail(email) ? "/admin" : from || "/";
