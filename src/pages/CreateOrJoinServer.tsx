import React, { useState } from "react";
import {
	Box,
	Typography,
	Button,
	TextField,
	Alert,
	CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { joinServer } from "../api/joinServer";
import { useUserServers } from "../hooks/useUserServers";

const UUID_PATTERN =
	/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

const CreateOrJoinServer: React.FC = () => {
	const navigate = useNavigate();
	const { refresh: refreshUserServers } = useUserServers();
	const [mode, setMode] = useState<"choose" | "join">("choose");
	const [inviteInput, setInviteInput] = useState("");
	const [joining, setJoining] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleJoin = async () => {
		const match = inviteInput.match(UUID_PATTERN);
		if (!match) {
			setError("That doesn't look like a valid invite link.");
			return;
		}
		setJoining(true);
		setError(null);
		try {
			await joinServer(match[0]);
			await refreshUserServers();
			navigate(`/server/${match[0]}`);
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Couldn't join that server.";
			setError(message);
		} finally {
			setJoining(false);
		}
	};

	return (
		<Box
			sx={{
				maxWidth: 420,
				mx: "auto",
				mt: 10,
				p: 4,
				bgcolor: "background.paper",
				borderRadius: 3,
				boxShadow: 4,
				textAlign: "center",
			}}
		>
			{mode === "choose" ? (
				<>
					<Typography variant="h5" fontWeight={700} mb={1}>
						Add a Server
					</Typography>
					<Typography variant="body2" color="text.secondary" mb={4}>
						Would you like to create a new server, or join one with an invite
						link?
					</Typography>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
						<Button
							variant="contained"
							size="large"
							onClick={() => navigate("/add_server")}
						>
							Create a Server
						</Button>
						<Button
							variant="outlined"
							size="large"
							onClick={() => setMode("join")}
						>
							Join a Server
						</Button>
					</Box>
				</>
			) : (
				<>
					<Typography variant="h5" fontWeight={700} mb={1}>
						Join a Server
					</Typography>
					<Typography variant="body2" color="text.secondary" mb={3}>
						Paste an invite link you were sent.
					</Typography>
					<TextField
						fullWidth
						autoFocus
						placeholder="https://your-app.vercel.app/join/..."
						value={inviteInput}
						onChange={(e) => setInviteInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								void handleJoin();
							}
						}}
						disabled={joining}
						sx={{ mb: 2 }}
					/>
					{error && (
						<Alert severity="error" sx={{ mb: 2, textAlign: "left" }}>
							{error}
						</Alert>
					)}
					<Box sx={{ display: "flex", gap: 2 }}>
						<Button
							variant="outlined"
							sx={{ flex: 1 }}
							onClick={() => {
								setMode("choose");
								setError(null);
							}}
							disabled={joining}
						>
							Back
						</Button>
						<Button
							variant="contained"
							sx={{ flex: 1 }}
							onClick={handleJoin}
							disabled={joining || !inviteInput.trim()}
						>
							{joining ? <CircularProgress size={20} /> : "Join"}
						</Button>
					</Box>
				</>
			)}
		</Box>
	);
};

export default CreateOrJoinServer;
