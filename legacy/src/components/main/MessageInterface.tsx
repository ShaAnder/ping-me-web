import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import {
  Box,
  List,
  useTheme,
  TextField,
  CircularProgress,
  Button,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Message from "./Message";
import MessageInterfaceChannels from "./MessageInterfaceChannels";
import MainScroll from "./MainScroll";
import { useMessagesContext } from "../../hooks/useMessagesContext";
import { useUserAuth } from "../../hooks/useUserAuth";
import { ServerInterface } from "../../@types/server";
import { MessageTypeInterface } from "../../@types/message";
import axios from "axios";
import { BASE_URL } from "../../api/config";
import Modal from "../shared/Modal";

export interface MessageInterfaceProps {
  server: ServerInterface | null;
  onChannelRefresh: () => void;
  isMobile?: boolean; // <-- Add this prop
}

const MessageInterface = ({
  server,
  onChannelRefresh,
  isMobile = false,
}: MessageInterfaceProps) => {
  const theme = useTheme();
  const { serverId, channelId } = useParams();
  const {
    fetchMessagesForChannel,
    messagesByChannel,
    loading: messagesLoading,
  } = useMessagesContext();
  const { user } = useUserAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageTypeInterface[]>([]);
  const [editingMsg, setEditingMsg] = useState<MessageTypeInterface | null>(
    null
  );
  const [deletingMsg, setDeletingMsg] = useState<MessageTypeInterface | null>(
    null
  );
  const [deletingChannel, setDeletingChannel] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (channelId) {
      fetchMessagesForChannel(channelId);
    }
  }, [channelId, fetchMessagesForChannel]);

  useEffect(() => {
    if (channelId && messagesByChannel[channelId]) {
      setMessages(messagesByChannel[channelId]);
    }
  }, [channelId, messagesByChannel]);

  const socketURL = channelId
    ? `wss://ping-me-pp5-backend-6aaeef173b97.herokuapp.com/${serverId}/${channelId}?token=${token}`
    : null;

  const { sendJsonMessage } = useWebSocket(socketURL, {
    onMessage: (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data?.message) {
          setMessages((prev) => [...prev, data.message]);
        }
      } catch (err) {
        console.error("Failed to parse WS message:", err);
      }
    },
    shouldReconnect: () => true,
  });

  const handleSendMessage = async () => {
    if (!user || !user.username || !message.trim()) return;

    if (editingMsg) {
      try {
        await axios.patch(
          `${BASE_URL}/api/messages/${editingMsg.id}/`,
          { content: message },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingMsg(null);
        setMessage("");
        if (channelId) fetchMessagesForChannel(channelId);
      } catch (err) {
        console.error("Failed to edit message:", err);
      }
    } else {
      sendJsonMessage({
        type: "message",
        message,
      });
      setMessage("");
    }
  };

  const handleEditMessage = (msg: MessageTypeInterface) => {
    setEditingMsg(msg);
    setMessage(msg.content);
  };

  const handleDeleteMessage = (msg: MessageTypeInterface) => {
    setDeletingMsg(msg);
  };

  const confirmDelete = async () => {
    if (!deletingMsg) return;
    try {
      await axios.delete(`${BASE_URL}/api/messages/${deletingMsg.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletingMsg(null);
      if (channelId) fetchMessagesForChannel(channelId);
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const cancelDelete = () => setDeletingMsg(null);

  const handleDeleteChannel = () => setDeletingChannel(true);
  const confirmDeleteChannel = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/channels/${channelId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletingChannel(false);
      onChannelRefresh();
      navigate(`/server/${serverId}`);
    } catch (err) {
      console.log(err);
      setDeletingChannel(false);
      alert("Failed to delete channel.");
    }
  };

  if (!server) {
    return (
      <Box sx={{ p: 4 }}>
        <span>No server data available.</span>
      </Box>
    );
  }

  // Custom delete channel button for mobile/desktop
  const deleteChannelButton = isMobile ? (
    <Tooltip title="Delete Channel">
      <IconButton
        color="error"
        sx={{ ml: 0, mr: 2 }} // move left a bit
        onClick={handleDeleteChannel}
      >
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  ) : (
    <Button
      color="error"
      variant="outlined"
      startIcon={<DeleteIcon />}
      onClick={handleDeleteChannel}
      sx={{ ml: 2 }}
    >
      Delete Channel
    </Button>
  );

  return (
    <>
      {server && (
        <MessageInterfaceChannels
          data={[server]}
          onDeleteChannel={handleDeleteChannel}
          deleteChannelButton={deleteChannelButton} // Pass the custom button
        />
      )}
      {channelId === undefined ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",

            p: 0,
          }}
        >
          <span>Welcome to {server.name ?? "Server"}</span>
          <span>{server.description ?? "This is our home"}</span>
        </Box>
      ) : messagesLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ overflow: "hidden", p: 0 }}>
            <MainScroll>
              <List sx={{ width: "100%", bgcolor: "background.paper" }}>
                {messages.map((msg) => (
                  <Message
                    key={msg.id}
                    message={msg}
                    onEdit={handleEditMessage}
                    onDelete={handleDeleteMessage}
                  />
                ))}
              </List>
            </MainScroll>
          </Box>
          <Box sx={{ position: "sticky", bottom: 0, width: "100%" }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{
                bottom: 0,
                right: 0,
                padding: "1rem",
                backgroundColor: theme.palette.background.default,
                zIndex: 1,
              }}
            >
              <Box sx={{ display: "flex" }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={1}
                  maxRows={4}
                  placeholder={
                    editingMsg ? "Edit your message..." : "Type a message..."
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{ flexGrow: 1 }}
                  value={message}
                />
                {editingMsg && (
                  <Button
                    sx={{ ml: 1 }}
                    onClick={() => {
                      setEditingMsg(null);
                      setMessage("");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </form>
          </Box>
          {/* Delete Message Confirmation Modal */}
          <Modal
            open={!!deletingMsg}
            onClose={cancelDelete}
            title="Delete this message?"
            actions={
              <Stack direction="row" spacing={2}>
                <Button onClick={cancelDelete}>Cancel</Button>
                <Button
                  onClick={confirmDelete}
                  color="error"
                  variant="contained"
                >
                  Yes
                </Button>
              </Stack>
            }
            children={<></>}
          />
          {/* Delete Channel Confirmation Modal */}
          <Modal
            open={deletingChannel}
            onClose={() => setDeletingChannel(false)}
            title="Delete this channel?"
            actions={
              <Stack direction="row" spacing={2}>
                <Button onClick={() => setDeletingChannel(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={confirmDeleteChannel}
                  color="error"
                  variant="contained"
                >
                  Delete
                </Button>
              </Stack>
            }
            children={
              <Box>
                Are you sure you want to delete this channel? This cannot be
                undone.
              </Box>
            }
          />
        </>
      )}
    </>
  );
};

export default MessageInterface;
