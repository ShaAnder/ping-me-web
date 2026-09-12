import { useState } from "react";
import {
	Box,
	Typography,
	Menu,
	MenuItem,
	Button,
	ListItemIcon,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Modal from "../shared/Modal";
import { leaveServer } from "../../api/leaveServer";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useUserServers } from "../../hooks/useUserServers";
import { useNavigate } from "react-router-dom";

interface ServerTitleMenuProps {
	serverName: string;
	serverId: number;
}

const ServerTitleMenu: React.FC<ServerTitleMenuProps> = ({
	serverName,
	serverId,
}) => {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [leaving, setLeaving] = useState(false);

	const { user } = useUserAuth();
	const { refresh: refreshUserServers } = useUserServers();
	const navigate = useNavigate();

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

	return (
		<>
			<Box
				onClick={(e) => setAnchorEl(e.currentTarget)}
				sx={{
					display: "flex",
					alignItems: "center",
					cursor: "pointer",
					userSelect: "none",
				}}
			>
				<Typography sx={{ fontWeight: "bold" }}>{serverName}</Typography>
				<ArrowDropDownIcon fontSize="small" />
			</Box>

			<Menu
				anchorEl={anchorEl}
				open={!!anchorEl}
				onClose={() => setAnchorEl(null)}
			>
				<MenuItem
					onClick={() => {
						setAnchorEl(null);
						setConfirmOpen(true);
					}}
					sx={{ color: "error.main" }}
				>
					<ListItemIcon>
						<ExitToAppIcon fontSize="small" color="error" />
					</ListItemIcon>
					Leave Server
				</MenuItem>
			</Menu>

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
					If you leave the server you cannot participate unless you rejoin.
					Are you sure?
				</Typography>
			</Modal>
		</>
	);
};

export default ServerTitleMenu;
