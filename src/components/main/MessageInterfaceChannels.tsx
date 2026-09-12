import { AppBar, Toolbar, Typography, useTheme, Box } from "@mui/material";
import { ServerInterface } from "../../@types/server";
import { useParams } from "react-router-dom";

interface ServerChannelProps {
	data: ServerInterface[];
}

const MessageInterfaceChannels = (props: ServerChannelProps) => {
	const theme = useTheme();
	const { data } = props;
	const { serverId, channelId } = useParams();

	const server = data?.find((s) => String(s.id) === String(serverId));
	const channel = server?.channel_server?.find(
		(c) => String(c.id) === String(channelId),
	);
	const channelName = channel?.name || "home";

	return (
		<AppBar
			sx={{
				backgroundColor: theme.palette.background.default,
				borderBottom: `1px solid ${theme.palette.divider}`,
			}}
			color="default"
			position="sticky"
			elevation={0}
		>
			<Toolbar
				variant="dense"
				sx={{
					minHeight: "49px",
					height: "49px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Box sx={{ flex: 1, textAlign: "left" }}>
					<Typography noWrap component="div" fontWeight={600} fontSize="1.1rem">
						#{channelName}
					</Typography>
				</Box>
			</Toolbar>
		</AppBar>
	);
};

export default MessageInterfaceChannels;
