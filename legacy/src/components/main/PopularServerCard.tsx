import React from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  Button,
  Avatar,
} from "@mui/material";
import { ServerInterface } from "../../@types/server";

interface PopularServerCardProps {
  server: ServerInterface;
  joined: boolean;
  actionInProgress: boolean;
  onJoin: (server: ServerInterface) => void;
  onLeave: (server: ServerInterface) => void;
  onShowDetails: (server: ServerInterface) => void;
}

const PopularServerCard: React.FC<PopularServerCardProps> = ({
  server,
  joined,
  actionInProgress,
  onJoin,
  onLeave,
  onShowDetails,
}) => {
  return (
    <Card
      sx={{
        // 5% bigger than default, adjust as needed for your grid
        width: "105%",
        height: "105%",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 32px rgba(0,0,0,0.28)", // strong shadow[1][2][3][4]
        backgroundImage: "none",
        p: 0,
        overflow: "visible",
        position: "relative",
        borderRadius: 0, // remove rounding
        border: "none", // remove border
      }}
    >
      {/* Banner */}
      <CardMedia
        component="img"
        image={server.server_image_urls.banner_image_url}
        alt="server banner image"
        sx={{
          width: "100%",
          height: 105, // 5% more than 100px
          objectFit: "cover",
          borderRadius: 0, // no rounding
          border: "none",
          margin: "0 auto",
          display: "block",
        }}
      />
      {/* Footer bar directly below banner */}
      <Box
        sx={{
          width: "100%",
          background: "rgba(30,30,30,0.92)",
          borderRadius: 0, // no rounding
          border: "none",
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          position: "relative",
          minHeight: 60, // about 68 before, slightly reduced for compactness
        }}
      >
        <Avatar
          src={server.server_image_urls.server_icon_url}
          alt={server.name}
          variant="square"
          sx={{
            width: 32, // slightly smaller
            height: 32, // slightly smaller
            mr: 1.2,
            border: "none",
            background: "#222",
          }}
        />
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            fontSize: 16, // slightly lower font size
            color: "#fff",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            width: "calc(100% - 40px)",
          }}
        >
          {server.name}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 2,
          px: 2,
          width: "100%",
        }}
      >
        <Button
          variant={joined ? "outlined" : "contained"}
          color={joined ? "error" : "primary"}
          onClick={() => (joined ? onLeave(server) : onJoin(server))}
          disabled={actionInProgress}
          sx={{ flex: 1, minWidth: 0 }}
        >
          {joined ? "Leave" : "Join"}
        </Button>
        <Button
          variant="outlined"
          onClick={() => onShowDetails(server)}
          sx={{ flex: 1, minWidth: 0 }}
        >
          Details
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
    </Card>
  );
};

export default PopularServerCard;
