import { useEffect, useMemo, useState, useCallback } from "react";
import {
	Box,
	CardMedia,
	CircularProgress,
	IconButton,
	useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import GroupIcon from "@mui/icons-material/Group";

import Nav from "./templates/Nav";
import ServerList from "./templates/ServerList";
import PrimaryDraw from "./templates/PrimaryDraw";
import Main from "./templates/Main";
import MemberList from "./templates/MemberList";
import UserServer from "../components/serverList/UserServers";
import MessageInterface from "../components/main/MessageInterface";
import ServerChannel from "../components/primaryDraw/ServerChannels";
import UserPanel from "../components/shared/UserPanel";
import { useServerContext } from "../hooks/useServerContext";
import { useUserServers } from "../hooks/useUserServers";
import { useParams, useNavigate } from "react-router-dom";
import ErrorPage from "./ErrorPage";

const Server = () => {
	const navigate = useNavigate();
	const theme = useTheme();
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
	const [membersOpen, setMembersOpen] = useState(false);

	const currentServer = useMemo(() => {
		// Check user servers first (most likely), then public servers
		const userServer = userServers?.find(
			(s) => String(s.id) === String(serverId),
		);
		if (userServer) return userServer;

		const publicServer = publicServers?.find(
			(s) => String(s.id) === String(serverId),
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
				(channel) => String(channel.id) === String(channelId),
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
					isMobile ? (
						<IconButton
							onClick={() => setMembersOpen(true)}
							aria-label="Show members"
							size="small"
						>
							<GroupIcon />
						</IconButton>
					) : null
				}
				serverName={currentServer.name}
			/>
			<Box sx={{ display: "flex", width: "100%" }}>
				<ServerList>
					<UserServer />
				</ServerList>

				<PrimaryDraw>
					<Box
						sx={{
							mb: 0,
							textAlign: "center",
							overflow: "hidden",
							bgcolor: "background.paper",
							lineHeight: 0,
						}}
					>
						<CardMedia
							component="img"
							image={currentServer.server_image_urls?.banner_image_url}
							alt={currentServer.name}
							sx={{
								width: "100%",
								height: { xs: 96, md: 137 },
								objectFit: "cover",
								objectPosition: "center",
								display: isMobile ? "none" : "block",
								verticalAlign: "top",
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
					rightOffset={!isMobile ? theme.memberList.width : 0}
				>
					<MessageInterface server={currentServer} />
				</Main>

				<UserPanel />

				<MemberList
					open={membersOpen}
					onClose={() => setMembersOpen(false)}
					serverId={currentServer.id}
					ownerId={currentServer.owner_id}
				/>
			</Box>
		</>
	);
};

export default Server;
