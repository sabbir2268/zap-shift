/* the roles this system knows about */
export const ROLES = {
  USER: "user",
  RIDER: "rider",
  ADMIN: "admin",
};

export const ADMIN_ROLE = ROLES.ADMIN;
export const RIDER_ROLE = ROLES.RIDER;

/*
 * Access is decided by the role only. The role comes from the server, which
 * reads it from the database, so no hardcoded email and nothing the browser
 * sends can grant access to the admin or rider dashboard.
 */
export const isAdminRole = (role) => role === ADMIN_ROLE;
export const isRiderRole = (role) => role === RIDER_ROLE;

/* where the arrow in the navbar points, once the role is known */
export const getDashboardPath = (role) => {
  if (isAdminRole(role)) return "/admin";
  if (isRiderRole(role)) return "/rider";

  return "/dashboard";
};

/* where to send someone right after they authenticate. a rider never lands on
   the customer dashboard, they land on their own */
export const getPostAuthPath = (role, from) => {
  if (isAdminRole(role)) return "/admin";
  if (isRiderRole(role)) return "/rider";

  return from || "/";
};

/* the pages a plain account cannot open, so they are never a valid destination */
const ROLE_GATED_PREFIXES = ["/admin", "/rider"];

const isRoleGatedPath = (path) =>
  ROLE_GATED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );

/*
 * The page the user was bounced off decides where they land after signing in or
 * registering. Anything inside a role gated panel is ignored, because the
 * account that just authenticated cannot open it, and a missing or unusable
 * destination falls back to the form the user came from.
 */
export const resolvePostAuthDestination = (requested, fallback) => {
  if (typeof requested !== "string" || !requested.startsWith("/")) {
    return fallback;
  }

  return isRoleGatedPath(requested) ? fallback : requested;
};
