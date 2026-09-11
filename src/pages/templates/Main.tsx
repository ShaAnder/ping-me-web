import { Box, IconButton, useMediaQuery, Slide } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ReactNode } from "react";
import CloseIcon from "@mui/icons-material/Close";

type MainProps = {
  children: ReactNode;
  open?: boolean; // For mobile: whether Main is visible
  onClose?: () => void; // For mobile: close handler
};

const Main = ({ children, open = true, onClose }: MainProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:767px)", { noSsr: true });

  // On mobile, hide Main if open is false
  if (isMobile && !open) return null;

  return (
    <Slide
      in={open}
      direction="left" // Slides in from the right
      mountOnEnter
      unmountOnExit
      appear
      timeout={350}
    >
      <Box
        sx={{
          flexGrow: 1,
          mt: `${theme.nav.height}px`,
          ml: isMobile
            ? `calc(${theme.serverList.width}px)`
            : `calc(${theme.serverList.width}px + ${theme.primaryDraw.width}px)`,
          overflow: "hidden",
          position: isMobile ? "fixed" : "relative",
          top: isMobile ? 0 : undefined,
          left: isMobile ? 0 : undefined,
          width: isMobile
            ? `calc(100vw - ${theme.serverList.width}px)`
            : "auto",
          bgcolor: "background.default",
          zIndex: isMobile ? 1500 : "auto",
          display: "flex",
          flexDirection: "column",
          boxShadow: isMobile ? 8 : "none",
          transition: "left 0.2s, box-shadow 0.2s",
          height: `calc(100vh - 100px)`, // <-- Your requested height
        }}
      >
        {/* Absolutely positioned close icon on mobile */}
        {isMobile && onClose && (
          <IconButton
            onClick={onClose}
            color="primary"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 2000,
              background: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: 2,
              width: 36,
              height: 36,
            }}
            aria-label="Close main drawer"
          >
            <CloseIcon />
          </IconButton>
        )}
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>{children}</Box>
      </Box>
    </Slide>
  );
};

export default Main;
