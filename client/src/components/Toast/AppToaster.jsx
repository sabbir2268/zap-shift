import { Toaster } from "react-hot-toast";

/*
 * Every notification the site raises goes through here, so the toasts are given
 * the theme colours once instead of at each of the fifty call sites.
 *
 * The values are css variables rather than hex codes on purpose: the variables
 * are already defined for both themes, and a toast that is on screen when the
 * visitor flips the switch repaints with everything else instead of staying
 * light until it times out.
 */
const toastStyle = {
  background: "var(--surface)",
  color: "var(--text)",
  border: "1px solid var(--border-strong)",
  borderRadius: "12px",
  fontSize: "0.875rem",
  fontWeight: 500,
  padding: "12px 16px",
  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.22)",
};

const AppToaster = () => (
  <Toaster
    position="top-center"
    containerStyle={{ top: "16px" }}
    toastOptions={{
      style: toastStyle,
      success: {
        style: { ...toastStyle, borderColor: "var(--secondary)" },
        iconTheme: { primary: "var(--secondary)", secondary: "var(--text-on-secondary)" },
      },
      error: {
        style: { ...toastStyle, borderColor: "#f87171" },
        iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
      },
    }}
  />
);

export default AppToaster;
