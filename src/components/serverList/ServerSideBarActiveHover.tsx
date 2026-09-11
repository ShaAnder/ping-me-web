import React from "react";
import { ListItem, ListItemButton, ListItemIcon, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";

interface ServerSideBarActiveHoverProps {
  to: string;
  tooltip: string;
  active: boolean;
  children: React.ReactNode;
}

const ServerSideBarActiveHover: React.FC<ServerSideBarActiveHoverProps> = ({
  to,
  tooltip,
  active,
  children,
}) => (
  <ListItem disablePadding sx={{ display: "block" }} dense>
    <Tooltip title={tooltip}>
      <ListItemButton
        component={Link}
        to={to}
        sx={{
          minHeight: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          backgroundColor: "transparent !important",
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            // If active, start higher (grow up & down), else center on icon for hover
            top: active ? "20%" : "35%",
            height: active ? "60%" : "0%",
            width: active ? "4px" : "0px",
            bgcolor: "white",
            borderRadius: "0 3px 3px 0",
            transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
            opacity: active ? 1 : 0,
            zIndex: 2,
          },
          "&:hover::before": {
            height: active ? "60%" : "30%", // half height if not active, full if active
            top: active ? "20%" : "35%", // center bar when not active
            width: "4px",
            opacity: 1,
          },
          "&:hover": {
            backgroundColor: "transparent",
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: "auto",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {children}
        </ListItemIcon>
      </ListItemButton>
    </Tooltip>
  </ListItem>
);

export default ServerSideBarActiveHover;
