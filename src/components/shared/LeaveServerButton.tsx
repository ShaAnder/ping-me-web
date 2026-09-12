import { useState } from "react";
import { IconButton, Tooltip, Typography, Button } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { leaveServer } from "../../api/leaveServer";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useUserServers } from "../../hooks/useUserServers";
import { useNavigate } from "react-router-dom";
import Modal from "../shared/Modal";

interface LeaveServerButtonProps {
	serverId: number;
	onLeft?: () => void;
	showText?: boolean;
}

const LeaveServerButton: React.FC<LeaveServerButtonProps> = ({
	serverId,
	onLeft,
	showText = true,
}) => {
	const [leaving, setLeaving] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const { refresh: refreshUserServers } = useUserServers();
	const navigate = useNavigate();

	const { user } = useUserAuth();

	const handleLeaveServer = async () => {
		if (!user) return;
		setLeaving(true);
		try {
			await leaveServer(String(serverId));
			await refreshUserServers();
			if (onLeft) onLeft();
			navigate("/");
		} catch (err) {
			console.error(err);
		} finally {
			setLeaving(false);
		}
	};

	return (
		<>
			<Tooltip title="Leave Server">
				<IconButton
					onClick={() => setModalOpen(true)}
					disabled={leaving}
					sx={{
						"bgcolor": "transparent",
						"&:hover": { bgcolor: "transparent" },
						"color": "error.main",
						"display": "flex",
						"alignItems": "center",
					}}
					aria-label="Leave Server"
				>
					{showText && <Typography sx={{ pr: 1 }}>Leave Server</Typography>}
					<ExitToAppIcon fontSize="medium" />
				</IconButton>
			</Tooltip>
			<Modal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				title="Leave Server?"
				actions={
					<>
						<Button onClick={() => setModalOpen(false)} disabled={leaving}>
							Cancel
						</Button>
						<Button
							onClick={async () => {
								await handleLeaveServer();
								setModalOpen(false);
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
		</>
	);
};

export default LeaveServerButton;
