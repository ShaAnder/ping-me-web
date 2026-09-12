import { useEffect, useRef, useState } from "react";
import {
	Box,
	Typography,
	Button,
	Paper,
	MenuList,
	MenuItem,
	ListItemIcon,
	ListItemText,
	ClickAwayListener,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Modal from "./Modal";
import { leaveServer } from "../../api/leaveServer";
import { supabase } from "../../api/supabaseClient";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useUserServers } from "../../hooks/useUserServers";
import { useNavigate } from "react-router-dom";

interface ServerTitleMenuProps {
	serverName: string;
	serverId: number;
	isOwner: boolean;
	onAddChannel: () => void;
	onDeleteServer: () => void;
}

const ServerTitleMenu: React.FC<ServerTitleMenuProps> = ({
	serverName,
	serverId,
	isOwner,
	onAddChannel,
	onDeleteServer,
}) => {
	const [open, setOpen] = useState(false);
	const [memberCount, setMemberCount] = useState<number | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [leaving, setLeaving] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const { user } = useUserAuth();
	const { refresh: refreshUserServers } = useUserServers();
	const navigate = useNavigate();

	// Fetch the member count only while the panel is open, and only when
	// it's actually needed (owner-only rule below) - not on every render.
	useEffect(() => {
		if (!open || !isOwner) return;
		let cancelled = false;
		supabase
			.from("server_members")
			.select("*", { count: "exact", head: true })
			.eq("server_id", serverId)
			.then(({ count }) => {
				if (!cancelled) setMemberCount(count ?? null);
			});
		return () => {
			cancelled = true;
		};
	}, [open, isOwner, serverId]);

	// Escape closes the panel, matching the Modal's own Escape behavior.
	useEffect(() => {
		if (!open) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [open]);

	const handleLeaveServer = async () => {
		if (!user) return;
		setLeaving(true);
		try {
			await leaveServer(String(serverId));
			await refreshUserServers();
			navigate("/");
		} catch (err) {
			console.error(err);
		} finally {
			setLeaving(false);
		}
	};

	// Owner can't leave while other members are present (no ownership
	// transfer UI exists for this menu) - leaveServer() would otherwise
	// hand ownership to the next-oldest member without asking. Non-owners
	// can always leave; a sole owner leaving deletes the server, which
	// leaveServer() already handles.
	const showLeave = !isOwner || memberCount === 1;

	return (
		<Box ref={containerRef}>
			<Box
				onClick={() => setOpen((v) => !v)}
				sx={{
					display: "flex",
					alignItems: "center",
					cursor: "pointer",
					userSelect: "none",
				}}
			>
				<Typography sx={{ fontWeight: "bold" }}>{serverName}</Typography>
				<ArrowDropDownIcon
					fontSize="small"
					sx={{
						transform: open ? "rotate(180deg)" : "none",
						transition: "transform 0.15s",
					}}
				/>
			</Box>

			{open && (
				<ClickAwayListener onClickAway={() => setOpen(false)}>
					<Paper
						sx={{
							position: "absolute",
							top: "100%",
							left: "50%",
							transform: "translateX(-50%)",
							mt: 0.5,
							width: "92%",
							zIndex: 1400,
							borderRadius: 2,
							boxShadow: 6,
							overflow: "hidden",
						}}
					>
						<MenuList dense>
							{isOwner && (
								<MenuItem
									onClick={() => {
										setOpen(false);
										onAddChannel();
									}}
								>
									<ListItemIcon>
										<AddCircleIcon fontSize="small" color="success" />
									</ListItemIcon>
									<ListItemText>Add Channel</ListItemText>
								</MenuItem>
							)}
							{isOwner && (
								<MenuItem
									onClick={() => {
										setOpen(false);
										navigate(`/server/${serverId}/edit`);
									}}
								>
									<ListItemIcon>
										<EditIcon fontSize="small" color="primary" />
									</ListItemIcon>
									<ListItemText>Edit Server</ListItemText>
								</MenuItem>
							)}
							{isOwner && (
								<MenuItem
									onClick={() => {
										setOpen(false);
										onDeleteServer();
									}}
									sx={{ color: "error.main" }}
								>
									<ListItemIcon>
										<DeleteIcon fontSize="small" color="error" />
									</ListItemIcon>
									<ListItemText>Delete Server</ListItemText>
								</MenuItem>
							)}
							{showLeave && (
								<MenuItem
									onClick={() => {
										setOpen(false);
										setConfirmOpen(true);
									}}
									sx={{ color: "error.main" }}
								>
									<ListItemIcon>
										<ExitToAppIcon fontSize="small" color="error" />
									</ListItemIcon>
									<ListItemText>Leave Server</ListItemText>
								</MenuItem>
							)}
						</MenuList>
					</Paper>
				</ClickAwayListener>
			)}

			<Modal
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				title="Leave Server?"
				actions={
					<>
						<Button onClick={() => setConfirmOpen(false)} disabled={leaving}>
							Cancel
						</Button>
						<Button
							onClick={async () => {
								await handleLeaveServer();
								setConfirmOpen(false);
							}}
							color="error"
							variant="contained"
							disabled={leaving}
						>
							{leaving ? "Leaving..." : "Leave"}
						</Button>
					</>
				}
			>
				<Typography>
					If you leave the server you cannot participate unless you rejoin. Are
					you sure?
				</Typography>
			</Modal>
		</Box>
	);
};

export default ServerTitleMenu;
