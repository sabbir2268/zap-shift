import { createContext } from "react";

/*
 * Which theme the site is in, and who gets to change it.
 *
 * The value is "light" or "dark" and nothing else. Anything that needs to know
 * whether it is dark should read the dark: variant in css rather than ask this,
 * because a class on <html> is true for every component at once and a boolean
 * read inside one component is not.
 */
const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export default ThemeContext;
