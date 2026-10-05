import { useContext } from "react";
import ThemeContext from "../context/ThemeContext/ThemeContext";

const useTheme = () => useContext(ThemeContext);

export default useTheme;
