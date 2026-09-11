import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { MessageTypeInterface } from "../../@types/message";
import { useUserAuth } from "../../hooks/useUserAuth";

interface MessageProps {
  message: MessageTypeInterface;
  onEdit?: (msg: MessageTypeInterface) => void;
  onDelete?: (msg: MessageTypeInterface) => void;
}

const Message = ({ message, onEdit, onDelete }: MessageProps) => {
  const { user } = useUserAuth();

  const formatTimeStamp = (timestamp: string) => {
    const date = new Date(Date.parse(timestamp));
    if (isNaN(date.getTime())) return ["", ""];
    const formattedDate = `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;
    const formattedTime = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return [formattedTime, formattedDate];
  };
  const [formattedTime, formattedDate] = formatTimeStamp(
    message.timestamp_created
  );

  // Updated: check by user ID
  const isOwnMessage = user && message.user && user.id === message.user.id;

  return (
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar alt={message.user?.username} src={message.user?.image_url}>
          {!message.user?.image_url && message.user?.username
            ? message.user.username[0].toUpperCase()
            : null}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box display="flex" alignItems="center">
            <Typography
              component="span"
              variant="body1"
              color="text.primary"
              sx={{ fontWeight: "600", mr: 1 }}
            >
              {message.user?.username}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              color="textSecondary"
              sx={{ fontSize: 10, mr: 1 }}
            >
              {`${formattedTime} | ${formattedDate}`}
            </Typography>
            {isOwnMessage && (
              <Stack direction="row" spacing={0.75} sx={{ ml: 1 }}>
                <IconButton
                  size="small"
                  sx={{ p: "1px", color: "grey.500" }}
                  onClick={() => onEdit && onEdit(message)}
                  aria-label="edit"
                >
                  <EditIcon fontSize="inherit" sx={{ fontSize: 14 }} />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{ p: "1px", color: "grey.500" }}
                  onClick={() => onDelete && onDelete(message)}
                  aria-label="delete"
                >
                  <DeleteIcon fontSize="inherit" sx={{ fontSize: 14 }} />
                </IconButton>
              </Stack>
            )}
          </Box>
        }
        secondary={
          <Box>
            <Typography
              component="div"
              variant="body1"
              style={{
                overflow: "visible",
                whiteSpace: "normal",
                textOverflow: "clip",
              }}
              sx={{
                display: "inline",
                lineHeight: 1.2,
                fontWeight: "400",
                letterSpacing: "-0.2px",
              }}
              color="text.primary"
            >
              {message.content}
            </Typography>
          </Box>
        }
        secondaryTypographyProps={{ component: "span" }}
      />
    </ListItem>
  );
};

export default Message;
