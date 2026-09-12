import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { joinServer } from "../api/joinServer";
import { useUserServers } from "../hooks/useUserServers";

const JoinServer: React.FC = () => {
	const { serverId } = useParams();
	const navigate = useNavigate();
	const { refresh: refreshUserServers } = useUserServers();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!serverId) return;
		let cancelled = false;

		const run = async () => {
			try {
				await joinServer(serverId);
				await refreshUserServers();
				if (!cancelled) navigate(`/server/${serverId}`, { replace: true });
			} catch (err: unknown) {
				if (cancelled) return;
				const message =
					err instanceof Error ? err.message : "Couldn't join that server.";
				setError(message);
			}
		};

		void run();

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [serverId]);

	if (error) {
		return (
			<Box
				sx={{
					maxWidth: 420,
					mx: "auto",
					mt: 10,
					p: 4,
					textAlign: "center",
					bgcolor: "background.paper",
					borderRadius: 3,
					boxShadow: 4,
				}}
			>
				<Typography variant="h6" color="error.main" mb={2}>
					{error}
				</Typography>
				<Button variant="contained" onClick={() => navigate("/")}>
					Go Home
				</Button>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				width: "100vw",
				height: "100vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: 2,
			}}
		>
			<CircularProgress />
			<Typography>Joining server...</Typography>
		</Box>
	);
};

export default JoinServer;
