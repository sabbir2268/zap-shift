import { useLocation } from "react-router";
import { resolvePostAuthDestination } from "../data/admin";

/*
 * Where to send somebody once they sign in or register.
 *
 * The page they were trying to reach wins, but only if it is a page their role
 * can actually open, and only if that page survived the trip through the auth
 * forms. With nothing remembered, a brand new account lands on its own
 * dashboard while a returning one lands on the marketing page.
 *
 * `linkState` is the state to spread onto the link to the other form, so the
 * remembered page is not lost when the user switches between login and register.
 */
const usePostAuthPath = () => {
  const location = useLocation();

  /* set by the route guards when they bounce a signed out visitor to /login,
     hash included so a deep link survives the trip */
  const origin = location.state?.from?.pathname ? location.state.from : null;

  const requested = origin
    ? origin.pathname + (origin.search || "") + (origin.hash || "")
    : null;

  /* a brand new account has no history, so it belongs on its own dashboard */
  const fallback = location.pathname === "/register" ? "/dashboard" : "/";

  return {
    destination: resolvePostAuthDestination(requested, fallback),
    linkState: origin ? { from: origin } : undefined,
  };
};

export default usePostAuthPath;
