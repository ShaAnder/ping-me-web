import { Box, AppBar, Toolbar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ReactNode } from "react";

interface NavProps {
  rightAction?: ReactNode;
  serverName?: string;
}

const Nav = ({ rightAction, serverName }: NavProps) => {
  const theme = useTheme();
  const pageTitle = serverName;
  return (
    <AppBar
      sx={{
        backgroundColor: theme.palette.background.default,
        zIndex: 10000,
        boxShadow: "none",
      }}
      elevation={0}
    >
      <Toolbar
        variant="dense"
        sx={{
          height: theme.nav.height,
          minHeight: theme.nav.height,
          position: "relative", // so the centered text can be absolute
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Empty box to reserve space on the left */}
        <Box sx={{ width: 120 }} />

        {/* Centered title */}
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            fontWeight: "bold",
          }}
        >
          {pageTitle}
        </Box>

        {/* Right-side actions */}
        <Box sx={{ display: "flex", gap: 1 }}>{rightAction}</Box>
      </Toolbar>
      {/* Divider at the bottom */}
      <Box
        sx={{
          width: "100%",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      />
    </AppBar>
  );
};

export default Nav;
