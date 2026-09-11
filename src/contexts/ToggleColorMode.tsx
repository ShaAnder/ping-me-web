import React, { useState, useMemo, useEffect, useCallback } from "react";
import { CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";
import createMuiTheme from "../theme/Theme";
import { ColorModeContext } from "./DarkModeContext";
import Cookies from "js-cookie";

interface ToggleColorModeProps {
  children: React.ReactNode;
}

const ToggleColorMode: React.FC<ToggleColorModeProps> = ({ children }) => {
  const storedMode = Cookies.get("colorMode") as "light" | "dark";
  const prefersDarkMode = useMediaQuery("([prefers-color-scheme: dark])");
  const defaultMode = storedMode || (prefersDarkMode ? "dark" : "light");

  const [mode, setMode] = useState<"light" | "dark">(defaultMode);

  const toggleColorMode = useCallback(() => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    Cookies.set("colorMode", mode);
  }, [mode]);

  const colorMode = useMemo(() => ({ toggleColorMode }), [toggleColorMode]);
  const theme = useMemo(() => createMuiTheme(mode || "light"), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ToggleColorMode;
