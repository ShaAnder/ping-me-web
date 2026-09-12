import React from "react";
import {
	Box,
	Typography,
	Card,
	CardMedia,
	Button,
	Avatar,
} from "@mui/material";
import { ServerInterface } from "../../@types/server";

interface PopularServerCardProps {
	server: ServerInterface;
	joined: boolean;
	actionInProgress: boolean;
	onJoin: (server: ServerInterface) => void;
	onLeave: (server: ServerInterface) => void;
	onShowDetails: (server: ServerInterface) => void;
}

const PopularServerCard: React.FC<PopularServerCardProps> = ({
	server,
	joined,
	actionInProgress,
	onJoin,
	onLeave,
	onShowDetails,
}) => {
	return (
		<Card
			sx={{
				width: 280,
				minWidth: 280,
				maxWidth: 280,
				flex: "0 0 280px",
				display: "flex",
				flexDirection: "column",
				boxShadow: "none",
				backgroundImage: "none",
				p: 0,
				pb: 2,
				overflow: "visible",
				borderRadius: 1,
				border: "1px solid",
				borderColor: "divider",
			}}
		>
			<CardMedia
				component="img"
				image={server.server_image_urls.banner_image_url}
				alt="server banner image"
				sx={{
					width: "100%",
					height: 140,
					objectFit: "cover",
					objectPosition: "center",
					display: "block",
				}}
			/>
			{/* Footer bar directly below banner */}
			<Box
				sx={{
					width: "100%",
					background: "rgba(30,30,30,0.92)",
					borderRadius: 0, // no rounding
					border: "none",
					px: 2,
					py: 1.5,
					display: "flex",
					alignItems: "center",
					position: "relative",
					minHeight: 60, // about 68 before, slightly reduced for compactness
				}}
			>
				<Avatar
					src={server.server_image_urls.server_icon_url}
					alt={server.name}
					variant="square"
					sx={{
						width: 32, // slightly smaller
						height: 32, // slightly smaller
						mr: 1.2,
						border: "none",
						background: "#222",
					}}
				/>
				<Typography
					variant="subtitle1"
					sx={{
						fontWeight: 600,
						fontSize: 16, // slightly lower font size
						color: "#fff",
						textOverflow: "ellipsis",
						overflow: "hidden",
						whiteSpace: "nowrap",
						width: "calc(100% - 40px)",
					}}
				>
					{server.name}
				</Typography>
			</Box>
			<Box
				sx={{
					display: "flex",
					gap: 2,
					mt: 2,
					px: 2,
					pb: 0,
					width: "100%",
					boxSizing: "border-box",
				}}
			>
				<Button
					variant={joined ? "outlined" : "contained"}
					color={joined ? "error" : "primary"}
					onClick={() => (joined ? onLeave(server) : onJoin(server))}
					disabled={actionInProgress}
					sx={{ flex: 1, minWidth: 0 }}
				>
					{joined ? "Leave" : "Join"}
				</Button>
				<Button
					variant="outlined"
					onClick={() => onShowDetails(server)}
					sx={{ flex: 1, minWidth: 0 }}
				>
					Details
				</Button>
			</Box>
		</Card>
	);
};

export default PopularServerCard;
