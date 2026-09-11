import React, { useState, useRef } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTheme } from "@mui/material/styles";
import UserCard from "./UserCard";
import { useNavigate } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";

const UserPanel: React.FC = () => {
  const theme = useTheme();
  const { user, logout } = useUserAuth();
  const [cardOpen, setCardOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:767px)", { noSsr: true });

  if (!user) return null;

  // Panel width for desktop
  const panelWidth = `calc(${theme.serverList.width}px + ${theme.primaryDraw.width}px - 1px)`;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <Box
        ref={anchorRef}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          ...(isMobile
            ? {
                right: 0,
                width: "100vw",
                borderRadius: 0,
                zIndex: 1000000, // Insanely high z-index on mobile
                px: 2,
              }
            : {
                width: panelWidth,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                zIndex: 1000000, // Insanely high z-index on desktop
              }),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          p: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            ml: isMobile ? 0 : 1,
            cursor: "pointer",
          }}
          onClick={() => setCardOpen(true)}
        >
          <Avatar src={user.image_url || undefined} alt={user.username} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            {user.username}
          </Typography>
        </Box>
        <IconButton onClick={handleLogout} size="small" sx={{ p: 0 }}>
          <LogoutIcon />
        </IconButton>
      </Box>
      <UserCard
        open={cardOpen}
        anchorEl={anchorRef.current}
        onClose={() => setCardOpen(false)}
        user={user}
      />
    </>
  );
};

export default UserPanel;
