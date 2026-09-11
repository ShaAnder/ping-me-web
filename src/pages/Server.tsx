import { useEffect, useMemo, useState, useCallback } from "react";
import { Box, CardMedia, CircularProgress, useMediaQuery } from "@mui/material";

import Nav from "./templates/Nav";
import ServerList from "./templates/ServerList";
import PrimaryDraw from "./templates/PrimaryDraw";
import Main from "./templates/Main";
import UserServer from "../components/serverList/UserServers";
import MessageInterface from "../components/main/MessageInterface";
import ServerChannel from "../components/primaryDraw/ServerChannels";
import UserPanel from "../components/shared/UserPanel";
import { useServerContext } from "../hooks/useServerContext";
import { useUserServers } from "../hooks/useUserServers";
import { useParams, useNavigate } from "react-router-dom";
import LeaveServerButton from "../components/shared/LeaveServerButton";
import ErrorPage from "./ErrorPage";

const Server = () => {
	const navigate = useNavigate();
	const { serverId, channelId } = useParams();
	const {
		servers: publicServers,
		loading: loadingPublicServers,
		refreshServers,
	} = useServerContext();
	const {
		servers: userServers,
		loading: loadingUserServers,
		refresh: refreshUserServers,
	} = useUserServers();

	const isMobile = useMediaQuery("(max-width:767px)", { noSsr: true });
	const [mainOpen, setMainOpen] = useState(false);

	const currentServer = useMemo(() => {
		// Check user servers first (most likely), then public servers
		const userServer = userServers?.find(
			(s) => String(s.id) === String(serverId)
		);
		if (userServer) return userServer;

		const publicServer = publicServers?.find(
			(s) => String(s.id) === String(serverId)
		);
		return publicServer || null;
	}, [userServers, publicServers, serverId]);

	const refreshAllServers = useCallback(async () => {
		await Promise.all([refreshServers?.(), refreshUserServers?.()]);
	}, [refreshServers, refreshUserServers]);

	// Loading if either context is loading
	const isLoading = loadingPublicServers || loadingUserServers;

	useEffect(() => {
		if (
			!isLoading &&
			currentServer &&
			channelId &&
			!currentServer.channel_server.some(
				(channel) => String(channel.id) === String(channelId)
			)
		) {
			navigate(`/server/${serverId}`);
		}
	}, [isLoading, currentServer, channelId, navigate, serverId]);

	if (isLoading) {
		return (
			<Box
				sx={{
					width: "100vw",
					height: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (!currentServer) {
		return (
			<ErrorPage
				error={{
					status: 404,
					message: "That server doesn't exist or was removed.",
				}}
			/>
		);
	}

	// Pass this to ServerChannel or PrimaryDraw to open Main on click
	const handleOpenMain = () => setMainOpen(true);
	const handleCloseMain = () => setMainOpen(false);

	return (
		<>
			<Nav
				rightAction={
					<LeaveServerButton serverId={currentServer.id} showText={!isMobile} />
				}
				serverName={currentServer.name}
			/>
			<Box sx={{ display: "flex", width: "100%" }}>
				<ServerList>
					<UserServer />
				</ServerList>

				<PrimaryDraw>
					<Box sx={{ mb: 0, textAlign: "center" }}>
						<CardMedia
							component="img"
							image={currentServer.server_image_urls?.banner_image_url}
							alt={currentServer.name}
							sx={{
								width: "100%",
								height: 137,
								objectFit: "cover",
								display: isMobile ? "none" : "block",
							}}
						/>
					</Box>

					<ServerChannel
						server={currentServer}
						onChannelRefresh={refreshAllServers}
						onServerDeleted={refreshAllServers}
						onOpenMain={handleOpenMain}
						isMobile={isMobile}
					/>
				</PrimaryDraw>

				<Main
					open={!isMobile || mainOpen}
					onClose={isMobile ? handleCloseMain : undefined}
				>
					<MessageInterface
						server={currentServer}
						onChannelRefresh={refreshAllServers}
						isMobile={isMobile} // Pass isMobile here!
					/>
				</Main>

				<UserPanel />
			</Box>
		</>
	);
};

export default Server;
