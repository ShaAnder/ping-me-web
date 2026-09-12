import React, { useState } from "react";
import { Box, Typography, Container } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useServerContext } from "../../hooks/useServerContext";
import { useUserServers } from "../../hooks/useUserServers";
import { ServerInterface } from "../../@types/server";
import PopularServerCard from "./PopularServerCard";
import { supabase } from "../../api/supabaseClient";
import { useUserAuth } from "../../hooks/useUserAuth";

const ExplorePopularServers: React.FC = () => {
	const { categoryName } = useParams();
	const navigate = useNavigate();
	const { user } = useUserAuth();
	const { servers, loading: serversLoading } = useServerContext();
	const {
		servers: userServers,
		loading: userServersLoading,
		refresh: refreshUserServers,
	} = useUserServers();

	const [actionInProgress, setActionInProgress] = useState<string | null>(null);

	const handleShowServerDetails = (server: ServerInterface) => {
		navigate(`/server/${server.id}`);
	};

	const handleJoinServer = async (server: ServerInterface) => {
		if (!user) return;
		setActionInProgress(String(server.id));
		const { error } = await supabase.from("server_members").insert({
			server_id: server.id,
			user_id: user.id,
		});
		if (error) console.error("join", error);
		await refreshUserServers();
		setActionInProgress(null);
	};

	const handleLeaveServer = async (server: ServerInterface) => {
		if (!user) return;
		setActionInProgress(String(server.id));
		const { error } = await supabase
			.from("server_members")
			.delete()
			.eq("server_id", server.id)
			.eq("user_id", user.id);
		if (error) console.error("leave", error);
		await refreshUserServers();
		setActionInProgress(null);
	};

	return (
		<Container maxWidth="lg" disableGutters sx={{ height: "100%" }}>
			<Box
				sx={{ height: "100%", overflowY: "auto", pt: 4, px: { xs: 2, md: 4 } }}
			>
				<Typography
					variant="h3"
					component="h1"
					sx={{
						fontWeight: 700,
						fontSize: { xs: 22, md: 32 },
						letterSpacing: "-0.5px",
						textAlign: "left",
					}}
				>
					{categoryName
						? `Explore ${
								categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
							} Servers`
						: "All Popular Servers"}
				</Typography>
				<Typography
					variant="h6"
					component="h2"
					sx={{
						fontWeight: 400,
						fontSize: { xs: 14, md: 18 },
						textAlign: "left",
						opacity: 0.7,
						mb: 3,
					}}
				>
					{categoryName
						? `Talking about all things ${
								categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
							}`
						: "Here's all of the most popular servers!"}
				</Typography>

				{serversLoading || userServersLoading ? (
					<Typography sx={{ py: 4 }}>Loading servers...</Typography>
				) : !servers || servers.length === 0 ? (
					<Typography sx={{ py: 4 }}>No servers found.</Typography>
				) : (
					<Box
						sx={{
							display: "flex",
							flexWrap: "wrap",
							gap: 3,
							alignContent: "flex-start",
							pb: 4,
						}}
					>
						{servers.map((item) => {
							const joined = userServers.some(
								(s) => String(s.id) === String(item.id),
							);
							return (
								<PopularServerCard
									key={String(item.id)}
									server={item}
									joined={joined}
									actionInProgress={actionInProgress === String(item.id)}
									onJoin={handleJoinServer}
									onLeave={handleLeaveServer}
									onShowDetails={handleShowServerDetails}
								/>
							);
						})}
					</Box>
				)}
			</Box>
		</Container>
	);
};

export default ExplorePopularServers;
