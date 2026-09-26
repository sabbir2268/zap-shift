export const ADMIN_EMAIL = "zapshiftadmin@gmail.com";

export const isAdminUser = (user) => user?.email === ADMIN_EMAIL;

export const getDashboardPath = (user) =>
  isAdminUser(user) ? "/admin" : "/dashboard";
