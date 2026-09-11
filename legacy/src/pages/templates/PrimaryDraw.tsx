import { Drawer, Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ReactNode } from "react";

type PrimaryDrawProps = {
  children: ReactNode;
};

const PrimaryDraw = ({ children }: PrimaryDrawProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:767px)", { noSsr: true });

  return (
    <Drawer
      variant="permanent"
      hideBackdrop
      PaperProps={{
        sx: {
          mt: `${theme.nav.height}px`,
          marginLeft: `${theme.serverList.width}px`,
          boxShadow: "none",
          height: `calc(100vh - ${theme.nav.height}px )`,
          width: isMobile
            ? `calc(100vw - ${theme.serverList.width}px)`
            : theme.primaryDraw.width,
          maxWidth: "100vw",
          display: "flex",
          flexDirection: "column",
          zIndex: 1300,
          transition: "width 0.2s",
        },
      }}
      anchor="left"
    >
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </Box>
    </Drawer>
  );
};

export default PrimaryDraw;
