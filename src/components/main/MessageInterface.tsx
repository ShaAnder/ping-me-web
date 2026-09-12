import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import Modal from "../shared/Modal";
import { supabase } from "../../api/supabaseClient";
import { mapMessage, MessageRow } from "../../api/mapMessages";

export interface MessageInterfaceProps {
	server: ServerInterface | null;
	onChannelRefresh: () => void;
	isMobile?: boolean;
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
		null,
	);
	const [deletingMsg, setDeletingMsg] = useState<MessageTypeInterface | null>(
		null,
	);
	const [deletingChannel, setDeletingChannel] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		if (channelId) fetchMessagesForChannel(channelId);
	}, [channelId, fetchMessagesForChannel]);

	useEffect(() => {
		if (channelId && messagesByChannel[channelId]) {
			setMessages(messagesByChannel[channelId]);
		}
	}, [channelId, messagesByChannel]);

	useEffect(() => {
		if (!channelId) return;

		const channel = supabase
			.channel(`room:${channelId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "messages",
					filter: `channel_id=eq.${channelId}`,
				},
				(payload) => {
					if (payload.eventType === "INSERT") {
						const row = payload.new as MessageRow;
						void (async () => {
							let profiles = row.profiles;
							if (!profiles) {
								if (user && String(user.id) === String(row.sender_id)) {
									profiles = {
										id: String(user.id),
										username: user.username,
									};
								} else {
									const { data } = await supabase
										.from("profiles")
										.select("id, username")
										.eq("id", row.sender_id)
										.maybeSingle();
									profiles = data;
								}
							}
							const mapped = mapMessage({ ...row, profiles });
							setMessages((prev) => {
								if (prev.some((m) => String(m.id) === String(row.id))) {
									return prev.map((m) =>
										String(m.id) === String(row.id) ? mapped : m,
									);
								}
								return [...prev, mapped];
							});
						})();
					}
					if (payload.eventType === "UPDATE") {
						const row = payload.new as MessageRow;
						setMessages((prev) =>
							prev.map((m) =>
								String(m.id) === String(row.id) ? mapMessage(row) : m,
							),
						);
					}
					if (payload.eventType === "DELETE") {
						const row = payload.old as { id: string };
						setMessages((prev) =>
							prev.filter((m) => String(m.id) !== String(row.id)),
						);
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [channelId, user]);

	const handleSendMessage = async () => {
		if (!user || !channelId || !message.trim()) return;

		if (editingMsg) {
			const { error } = await supabase
				.from("messages")
				.update({ content: message.trim() })
				.eq("id", editingMsg.id);
			if (error) {
				console.error("edit message", error);
				return;
			}
			setEditingMsg(null);
			setMessage("");
			return;
		}

		const { error } = await supabase.from("messages").insert({
			channel_id: channelId,
			sender_id: user.id,
			content: message.trim(),
		});
		if (error) {
			console.error("send message", error);
			return;
		}
		setMessage("");
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
		const { error } = await supabase
			.from("messages")
			.delete()
			.eq("id", deletingMsg.id);
		if (error) {
			console.error("delete message", error);
			return;
		}
		setDeletingMsg(null);
	};

	const cancelDelete = () => setDeletingMsg(null);

	const handleDeleteChannel = () => setDeletingChannel(true);
	const confirmDeleteChannel = async () => {
		setDeletingChannel(false);
		onChannelRefresh();
		navigate(`/server/${serverId}`);
	};

	if (!server) {
		return (
			<Box sx={{ p: 4 }}>
				<span>No server data available.</span>
			</Box>
		);
	}

	const deleteChannelButton = isMobile ? (
		<Tooltip title="Delete Channel">
			<IconButton
				color="error"
				sx={{ ml: 0, mr: 2 }}
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
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				minHeight: 0,
			}}
		>
			<Box sx={{ flexShrink: 0 }}>
				<MessageInterfaceChannels
					data={[server]}
					onDeleteChannel={handleDeleteChannel}
					deleteChannelButton={deleteChannelButton}
				/>
			</Box>

			{channelId === undefined ? (
				<Box
					sx={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<span>Welcome to {server.name ?? "Server"}</span>
					<span>{server.description ?? "This is our home"}</span>
				</Box>
			) : messagesLoading ? (
				<Box
					sx={{
						flex: 1,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<CircularProgress />
				</Box>
			) : (
				<>
					<Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
						<MainScroll>
							<List sx={{ width: "100%", bgcolor: "background.paper" }}>
								{messages.map((msg) => (
									<Message
										key={String(msg.id)}
										message={msg}
										onEdit={handleEditMessage}
										onDelete={handleDeleteMessage}
									/>
								))}
							</List>
						</MainScroll>
					</Box>
					<Box
						sx={{
							flexShrink: 0,
							width: "100%",
							bgcolor: theme.palette.background.default,
							borderTop: "1px solid",
							borderColor: "divider",
						}}
					>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleSendMessage();
							}}
							style={{ padding: "1rem" }}
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
				</>
			)}

			<Modal
				open={!!deletingMsg}
				onClose={cancelDelete}
				title="Delete this message?"
				actions={
					<Stack direction="row" spacing={2}>
						<Button onClick={cancelDelete}>Cancel</Button>
						<Button onClick={confirmDelete} color="error" variant="contained">
							Yes
						</Button>
					</Stack>
				}
				children={<></>}
			/>
			<Modal
				open={deletingChannel}
				onClose={() => setDeletingChannel(false)}
				title="Delete this channel?"
				actions={
					<Stack direction="row" spacing={2}>
						<Button onClick={() => setDeletingChannel(false)}>Cancel</Button>
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
						Are you sure you want to delete this channel? This cannot be undone.
					</Box>
				}
			/>
		</Box>
	);
};

export default MessageInterface;
