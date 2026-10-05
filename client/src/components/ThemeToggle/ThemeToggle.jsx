import { Moon, Sun } from "lucide-react";
import useTheme from "../../hooks/useTheme";

/*
 * The one control that flips the whole site between light and dark.
 *
 * It sits in front of the account button wherever the account button is, on the
 * public navbar and in each dashboard sidebar alike, so a visitor never has to
 * walk back to the home page to change the theme.
 *
 * The icon names the theme it will switch to rather than the one already on, so
 * it is a promise about what pressing it does instead of a picture of the
 * present. The two themes are also told apart for anyone who cannot see the
 * icon, through the label rather than colour alone.
 *
 * onDark is for the places that stay dark in both themes, such as the dashboard
 * sidebars, where the toggle has to be readable without ever changing colour.
 */
const ThemeToggle = ({ className = "", iconSize = 20, onDark = false }) => {
  const { theme, toggleTheme } = useTheme();

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className={`
        p-2
        rounded-lg
        transition-all
        duration-200
        ${
          onDark
            ? "text-[var(--text-on-ink)] hover:bg-white/10"
            : "text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
        }
        ${className}
      `}
    >
      {theme === "dark" ? (
        <Sun style={{ width: iconSize, height: iconSize }} aria-hidden="true" />
      ) : (
        <Moon style={{ width: iconSize, height: iconSize }} aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeToggle;
