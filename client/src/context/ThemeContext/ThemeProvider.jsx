import { useCallback, useEffect, useMemo, useState } from "react";
import ThemeContext from "./ThemeContext";

const STORAGE_KEY = "zapshift-theme";

/*
 * Which of the two themes the site is in.
 *
 * The first visit follows the operating system, because someone who has asked
 * their computer for a dark screen should not have to ask this site as well.
 * After that the choice is theirs: it is written down and the system is no
 * longer consulted, so a site set to light does not flip at sunset.
 *
 * The class lands on <html> rather than on a wrapper div, which is what makes
 * body, any portal, and the leaflet map agree on the theme.
 */

const readStoredTheme = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* a browser with storage turned off still gets a theme, just not a saved one */
  }

  return null;
};

const systemTheme = () =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => readStoredTheme() || systemTheme());

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;

    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* nothing to do: the theme still applies for this visit */
    }
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next === "dark" ? "dark" : "light");
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
