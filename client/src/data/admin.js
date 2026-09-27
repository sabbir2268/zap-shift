/* the roles this system knows about */
export const ROLES = {
  USER: "user",
  RIDER: "rider",
  ADMIN: "admin",
};

export const ADMIN_ROLE = ROLES.ADMIN;

/*
 * Access is decided by the role only. The role comes from the server, which
 * reads it from the database, so no hardcoded email and nothing the browser
 * sends can grant access to the admin dashboard.
 */
export const isAdminRole = (role) => role === ADMIN_ROLE;

/* where the arrow in the navbar points, once the role is known */
export const getDashboardPath = (role) =>
  isAdminRole(role) ? "/admin" : "/dashboard";

/* where to send someone right after they authenticate */
export const getPostAuthPath = (role, from) =>
  isAdminRole(role) ? "/admin" : from || "/";
