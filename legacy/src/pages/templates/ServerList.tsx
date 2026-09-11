import { Box, Drawer } from "@mui/material";
import { ReactNode } from "react";
import { useTheme } from "@mui/material/styles";

type ServerListProps = {
  children: ReactNode;
};

const ServerList = ({ children }: ServerListProps) => {
  const theme = useTheme();

  return (
    <Drawer
      variant="permanent"
      hideBackdrop
      PaperProps={{
        sx: {
          mt: `${theme.nav.height}px`,
          boxShadow: "none",
          height: `calc(100vh - ${theme.nav.height}px)`,
          width: theme.serverList.width,
          zIndex: 1202,
        },
      }}
    >
      <Box
        sx={{
          overflowY: "auto",
          "&::-webkit-scrollbar": { display: "none" },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {children}
      </Box>
    </Drawer>
  );
};

export default ServerList;
