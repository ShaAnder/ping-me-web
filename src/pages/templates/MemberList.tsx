import React, { useEffect, useState } from "react";
import {
	Drawer,
	Box,
	Typography,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Avatar,
	Chip,
	CircularProgress,
	IconButton,
	useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { supabase } from "../../api/supabaseClient";

type MemberRow = {
	user_id: string;
	profiles: { username: string; avatar_url: string | null } | null;
};

type Member = {
	id: string;
	username: string;
	avatarUrl: string | null;
};

interface MemberListProps {
	open: boolean;
	onClose: () => void;
	serverId: string | number;
	ownerId: string | number;
}

const MemberList: React.FC<MemberListProps> = ({
	open,
	onClose,
	serverId,
	ownerId,
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery("(max-width:767px)", { noSsr: true });
	const [members, setMembers] = useState<Member[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Permanently visible on desktop (like Discord's member sidebar) —
	// only mobile needs the open/onClose toggle from a button.
	const effectivelyOpen = !isMobile || open;

	useEffect(() => {
		if (!effectivelyOpen) return;

		let cancelled = false;

		const load = async () => {
			setLoading(true);
			setError(null);
			try {
				const { data, error: fetchError } = await supabase
					.from("server_members")
					.select("user_id, profiles(username, avatar_url)")
					.eq("server_id", serverId);

				if (cancelled) return;
				if (fetchError) {
					console.error("MemberList", fetchError);
					setError("Couldn't load members.");
					setMembers([]);
					return;
				}
				setMembers(
					((data ?? []) as unknown as MemberRow[]).map((row) => ({
						id: row.user_id,
						username: row.profiles?.username ?? "Unknown user",
						avatarUrl: row.profiles?.avatar_url ?? null,
					})),
				);
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		void load();

		return () => {
			cancelled = true;
		};
	}, [effectivelyOpen, serverId]);

	const content = (
		<>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					px: 2,
					height: `${theme.nav.height}px`,
					borderBottom: "1px solid",
					borderColor: "divider",
				}}
			>
				<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
					Members {members.length > 0 && `— ${members.length}`}
				</Typography>
				{isMobile && (
					<IconButton size="small" onClick={onClose} aria-label="close">
						<CloseIcon fontSize="small" />
					</IconButton>
				)}
			</Box>

			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
					<CircularProgress size={24} />
				</Box>
			) : error ? (
				<Box sx={{ p: 2 }}>
					<Typography color="error.main" variant="body2">
						{error}
					</Typography>
				</Box>
			) : members.length === 0 ? (
				<Box sx={{ p: 2 }}>
					<Typography variant="body2" color="text.secondary">
						No members found.
					</Typography>
				</Box>
			) : (
				<List dense sx={{ overflowY: "auto" }}>
					{members.map((member) => (
						<ListItem key={member.id}>
							<ListItemAvatar>
								<Avatar src={member.avatarUrl ?? undefined}>
									{member.username.charAt(0).toUpperCase()}
								</Avatar>
							</ListItemAvatar>
							<ListItemText primary={member.username} />
							{String(member.id) === String(ownerId) && (
								<Chip label="Owner" size="small" color="primary" />
							)}
						</ListItem>
					))}
				</List>
			)}
		</>
	);

	return (
		<Drawer
			anchor="right"
			variant={isMobile ? "temporary" : "permanent"}
			open={effectivelyOpen}
			onClose={onClose}
			hideBackdrop={!isMobile}
			PaperProps={{
				sx: {
					mt: isMobile ? 0 : `${theme.nav.height}px`,
					height: isMobile ? "100vh" : `calc(100vh - ${theme.nav.height}px)`,
					width: isMobile ? 260 : theme.memberList.width,
					maxWidth: "85vw",
					bgcolor: "background.paper",
				},
			}}
		>
			{content}
		</Drawer>
	);
};

export default MemberList;
