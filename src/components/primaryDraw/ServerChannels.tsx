import { useState } from "react";
import {
	List,
	ListItem,
	ListItemButton,
	Box,
	useTheme,
	Typography,
	IconButton,
	Tooltip,
	TextField,
	Button,
	Divider,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ServerInterface } from "../../@types/server";
import AddChannel from "./AddChannel";
import EditChannelModal from "./EditChannelModal";
import { useUserAuth } from "../../hooks/useUserAuth";
import Modal from "../shared/Modal";
import ServerTitleMenu from "../shared/ServerTitleMenu";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import { useServerContext } from "../../hooks/useServerContext";
import { useUserServers } from "../../hooks/useUserServers";
import { leaveServer } from "../../api/leaveServer";

export interface ServerChannelProps {
	server: ServerInterface | null;
	onChannelRefresh: () => void;
	onServerDeleted: () => void;
	onOpenMain?: () => void;
	isMobile?: boolean;
}

const ServerChannel = ({
	server,
	onChannelRefresh,
	onOpenMain,
}: ServerChannelProps) => {
	const theme = useTheme();
	const { serverId, channelId: channelIdFromRoute } = useParams();
	const { user } = useUserAuth();
	const navigate = useNavigate();

	const { refreshServers } = useServerContext();
	const { refresh: refreshUserServers } = useUserServers();

	const isOwner = String(user?.id) === String(server?.owner_id);

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteInput, setDeleteInput] = useState("");
	const [deleting, setDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState("");
	const [showAddChannel, setShowAddChannel] = useState(false);
	const [editingChannel, setEditingChannel] = useState<{
		id: number;
		name: string;
	} | null>(null);

	const handleDeleteServer = async () => {
		if (!user || !server) return;
		setDeleting(true);
		setDeleteError("");
		try {
			await leaveServer(String(server.id));
			setShowDeleteModal(false);
			await refreshServers();
			await refreshUserServers();
			navigate("/");
		} catch {
			setDeleteError("Failed to delete server. Please try again.");
		}
		setDeleting(false);
	};

	if (!server) {
		return (
			<Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
				<Typography variant="body2">No server selected.</Typography>
			</Box>
		);
	}

	return (
		<>
			<Box
				sx={{
					height: "50px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					p: 1,
					fontSize: 16,
					letterSpacing: 1,
					fontFamily: "verdana",
					borderBottom: `1px solid ${theme.palette.divider}`,
					position: "sticky",
					top: 0,
					backgroundColor: theme.palette.background.default,
					whiteSpace: "nowrap",
					overflow: "hidden",
					textOverflow: "ellipsis",
					textAlign: "center",
				}}
			>
				<ServerTitleMenu
					serverName={
						server.name.length > 20
							? `${server.name.slice(0, 20)}...`
							: server.name
					}
					serverId={server.id}
				/>
			</Box>

			{isOwner && (
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-evenly"
					sx={{ width: "100%", mt: 0, mb: 0 }}
				>
					<Tooltip title="Add Channel">
						<IconButton
							color="success"
							size="large"
							onClick={() => setShowAddChannel(true)}
							sx={{ borderRadius: 0, p: 1, m: 0, width: "33.33%" }}
						>
							<AddCircleIcon sx={{ fontSize: 28, color: "#43a047" }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Edit Server">
						<IconButton
							color="primary"
							size="large"
							onClick={() => navigate(`/server/${server.id}/edit`)}
							sx={{ borderRadius: 0, p: 1, m: 0, width: "33.33%" }}
						>
							<EditIcon sx={{ fontSize: 28, color: "#1976d2" }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete Server">
						<IconButton
							color="error"
							size="large"
							onClick={() => setShowDeleteModal(true)}
							sx={{ borderRadius: 0, p: 1, m: 0, width: "33.33%" }}
						>
							<DeleteIcon sx={{ fontSize: 28, color: "#d32f2f" }} />
						</IconButton>
					</Tooltip>
				</Box>
			)}

			{/* Add Channel Modal */}
			<AddChannel
				open={showAddChannel}
				onClose={() => setShowAddChannel(false)}
				serverId={server.id}
				isOwner={isOwner}
				onChannelAdded={() => {
					setShowAddChannel(false);
					onChannelRefresh();
				}}
			/>

			{/* Delete Server Modal */}
			<Modal
				open={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				title="Delete Server"
				actions={
					<>
						<Button
							onClick={() => setShowDeleteModal(false)}
							disabled={deleting}
						>
							Cancel
						</Button>
						<Button
							onClick={handleDeleteServer}
							color="error"
							variant="contained"
							disabled={deleteInput !== server.name || deleting}
						>
							Delete
						</Button>
					</>
				}
			>
				<Typography sx={{ mb: 2 }}>
					Are you sure you wish to delete <b>{server.name}</b>?<br />
					This action cannot be undone.
					<br />
					Please type <b>{server.name}</b> to confirm.
				</Typography>
				<TextField
					label="Server Name"
					value={deleteInput}
					onChange={(e) => setDeleteInput(e.target.value)}
					fullWidth
					autoFocus
					error={!!deleteError}
					helperText={deleteError}
					disabled={deleting}
				/>
			</Modal>
			<Divider />
			<List sx={{ py: 0 }}>
				{server.channel_server.map((channel) => (
					<ListItem
						disablePadding
						key={channel.id}
						sx={{ display: "block" }}
						dense={true}
					>
						<ListItemButton
							sx={{
								minHeight: 48,
								fontFamily: "verdana",
								display: "flex",
								justifyContent: "space-between",
							}}
							onClick={() => {
								if (onOpenMain) onOpenMain();
								setTimeout(() => {
									navigate(`/server/${serverId}/${channel.id}`);
								}, 0);
							}}
						>
							<Box sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
								{channel.type === "text" ? (
									<>#️ {channel.name}</>
								) : (
									<>🔊 {channel.name}</>
								)}
							</Box>
							{isOwner && (
								<IconButton
									size="small"
									aria-label="Edit channel"
									onClick={(e) => {
										e.stopPropagation();
										setEditingChannel({ id: channel.id, name: channel.name });
									}}
								>
									<SettingsIcon fontSize="small" />
								</IconButton>
							)}
						</ListItemButton>
					</ListItem>
				))}
			</List>

			<EditChannelModal
				open={!!editingChannel}
				onClose={() => setEditingChannel(null)}
				channel={editingChannel}
				onUpdated={onChannelRefresh}
				onDeleted={(deletedId) => {
					onChannelRefresh();
					if (String(deletedId) === String(channelIdFromRoute)) {
						navigate(`/server/${serverId}`);
					}
				}}
			/>
		</>
	);
};

export default ServerChannel;
