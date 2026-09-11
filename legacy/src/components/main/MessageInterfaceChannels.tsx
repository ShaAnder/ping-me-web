import {
  AppBar,
  Toolbar,
  Typography,
  useTheme,
  Button,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ServerInterface } from "../../@types/server";
import { useParams } from "react-router-dom";
import { useUserAuth } from "../../hooks/useUserAuth";
import React from "react";

interface ServerChannelProps {
  data: ServerInterface[];
  onDeleteChannel?: () => void;
  deleteChannelButton?: React.ReactNode; // <-- added
}

const MessageInterfaceChannels = (props: ServerChannelProps) => {
  const theme = useTheme();
  const { data, onDeleteChannel, deleteChannelButton } = props;
  const { serverId, channelId } = useParams();
  const { user } = useUserAuth();

  const server = data?.find((server) => server.id == Number(serverId));
  const channel = server?.channel_server?.find(
    (channel) => channel.id === Number(channelId)
  );
  const channelName = channel?.name || "home";

  const isServerOwner = user && server && user.id === server.owner_id;

  return (
    <AppBar
      sx={{
        backgroundColor: theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
      color="default"
      position="sticky"
      elevation={0}
    >
      <Toolbar
        variant="dense"
        sx={{
          minHeight: "49px",
          height: "49px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ flex: 1, textAlign: "left" }}>
          <Typography noWrap component="div" fontWeight={600} fontSize="1.1rem">
            #{channelName}
          </Typography>
        </Box>
        {isServerOwner &&
          onDeleteChannel &&
          (deleteChannelButton ? (
            deleteChannelButton // <-- use the custom button if provided
          ) : (
            <Button
              color="error"
              startIcon={<DeleteIcon />}
              onClick={onDeleteChannel}
              size="small"
              sx={{ mr: 5 }}
            >
              Delete
            </Button>
          ))}
      </Toolbar>
    </AppBar>
  );
};

export default MessageInterfaceChannels;
