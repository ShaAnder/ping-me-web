import React, { useRef, useState } from "react";
import {
	Box,
	Typography,
	Alert,
	Button,
	Container,
	Paper,
	TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useServerContext } from "../hooks/useServerContext";
import { useUserServers } from "../hooks/useUserServers";
import { useUserAuth } from "../hooks/useUserAuth";
import { supabase } from "../api/supabaseClient";
import avatarPlaceholder from "../assets/img/AvatarPlaceholder.jpg";
import bannerPlaceholder from "../assets/img/BannerPlaceholder.jpeg";

const AddServer: React.FC = () => {
	const [bannerFile, setBannerFile] = useState<File | null>(null);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [bannerPreview, setBannerPreview] = useState<string | undefined>();
	const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const bannerInputRef = useRef<HTMLInputElement>(null);
	const avatarInputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();
	const { user } = useUserAuth();
	const { refreshServers } = useServerContext();
	const { refresh: refreshUserServers } = useUserServers();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(null);
		if (!user) return;
		if (!name.trim()) {
			setSubmitError("Name is required.");
			return;
		}
		setSubmitting(true);

		try {
			const { data: server, error: serverErr } = await supabase
				.from("servers")
				.insert({
					name: name.trim(),
					description: description.trim(),
					owner_id: user.id,
				})
				.select("id")
				.single();
			if (serverErr || !server) throw serverErr;

			const { error: memberErr } = await supabase
				.from("server_members")
				.insert({
					server_id: server.id,
					user_id: user.id,
				});
			if (memberErr) throw memberErr;

			const { error: channelErr } = await supabase.from("channels").insert({
				server_id: server.id,
				name: "general",
			});
			if (channelErr) throw channelErr;

			let iconUrl: string | null = null;
			let bannerUrl: string | null = null;

			if (avatarFile) {
				const ext = avatarFile.name.split(".").pop()?.toLowerCase() || "jpg";
				const path = `servers/${server.id}/icon.${ext}`;
				const { error: upErr } = await supabase.storage
					.from("media")
					.upload(path, avatarFile, {
						upsert: true,
						contentType: avatarFile.type,
					});
				if (upErr) throw upErr;
				iconUrl = `${
					supabase.storage.from("media").getPublicUrl(path).data.publicUrl
				}?t=${Date.now()}`;
			}

			if (bannerFile) {
				const ext = bannerFile.name.split(".").pop()?.toLowerCase() || "jpg";
				const path = `servers/${server.id}/banner.${ext}`;
				const { error: upErr } = await supabase.storage
					.from("media")
					.upload(path, bannerFile, {
						upsert: true,
						contentType: bannerFile.type,
					});
				if (upErr) throw upErr;
				bannerUrl = `${
					supabase.storage.from("media").getPublicUrl(path).data.publicUrl
				}?t=${Date.now()}`;
			}

			if (iconUrl || bannerUrl) {
				const { error: imgErr } = await supabase
					.from("servers")
					.update({ icon_url: iconUrl, banner_url: bannerUrl })
					.eq("id", server.id);
				if (imgErr) throw imgErr;
			}

			await refreshServers();
			await refreshUserServers();
			navigate(`/server/${server.id}`);
		} catch (error: unknown) {
			const err = error as { message?: string };
			setSubmitError(err.message ?? "An error occurred. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Container maxWidth="sm" sx={{ py: 6 }}>
			<Paper
				elevation={3}
				sx={{
					borderRadius: 3,
					overflow: "hidden",
					bgcolor: "background.paper",
				}}
			>
				<Box
					sx={{
						width: "100%",
						height: 120,
						background: `url(${
							bannerPreview || bannerPlaceholder
						}) center/cover no-repeat`,
						position: "relative",
						cursor: "pointer",
					}}
					onClick={() => bannerInputRef.current?.click()}
				>
					<input
						ref={bannerInputRef}
						type="file"
						accept="image/jpeg,image/png,image/gif,image/webp,image/jpg"
						style={{ display: "none" }}
						onChange={(e) => {
							const file = e.target.files?.[0] || null;
							setBannerFile(file);
							if (file) {
								const reader = new FileReader();
								reader.onload = (ev) =>
									setBannerPreview(ev.target?.result as string);
								reader.readAsDataURL(file);
							} else setBannerPreview(undefined);
						}}
					/>
					<Box
						sx={{
							position: "absolute",
							left: 24,
							bottom: -40,
							zIndex: 2,
							borderRadius: 2,
							border: "4px solid white",
							width: 80,
							height: 80,
							overflow: "hidden",
							bgcolor: "background.paper",
							boxShadow: 3,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							cursor: "pointer",
						}}
						onClick={(e) => {
							e.stopPropagation();
							avatarInputRef.current?.click();
						}}
					>
						<input
							ref={avatarInputRef}
							type="file"
							accept="image/jpeg,image/png,image/gif,image/webp,image/jpg"
							style={{ display: "none" }}
							onChange={(e) => {
								const file = e.target.files?.[0] || null;
								setAvatarFile(file);
								if (file) {
									const reader = new FileReader();
									reader.onload = (ev) =>
										setAvatarPreview(ev.target?.result as string);
									reader.readAsDataURL(file);
								} else setAvatarPreview(undefined);
							}}
						/>
						<img
							src={avatarPreview || avatarPlaceholder}
							alt="Server Icon"
							style={{ width: 80, height: 80, objectFit: "cover" }}
						/>
					</Box>
				</Box>
				<Box sx={{ px: 3, pt: 6, pb: 4 }}>
					<Typography variant="h5" fontWeight={700} mb={3} align="center">
						Add Server
					</Typography>
					{submitError && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{submitError}
						</Alert>
					)}
					<form onSubmit={handleSubmit} autoComplete="off">
						<TextField
							label="Server Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							fullWidth
							required
							sx={{ mb: 2 }}
						/>
						<TextField
							label="Description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							multiline
							rows={3}
							fullWidth
							sx={{ mb: 2 }}
						/>
						<Box sx={{ display: "flex", gap: 2, mt: 2 }}>
							<Button
								variant="contained"
								type="submit"
								disabled={submitting}
								sx={{ flex: 1 }}
							>
								{submitting ? "Creating..." : "Create"}
							</Button>
							<Button
								variant="outlined"
								color="secondary"
								onClick={() => navigate("/")}
								disabled={submitting}
								sx={{ flex: 1 }}
							>
								Cancel
							</Button>
						</Box>
					</form>
				</Box>
			</Paper>
		</Container>
	);
};

export default AddServer;
