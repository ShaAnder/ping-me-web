import React, { useEffect, useRef, useState } from "react";
import {
	Box,
	Typography,
	CircularProgress,
	Alert,
	Button,
} from "@mui/material";
import Form, { Field } from "../components/shared/Form";
import { validateFormFields } from "../utils/validateForm";
import { useNavigate, useParams } from "react-router-dom";
import { ServerInterface } from "../@types/server";
import { useUserAuth } from "../hooks/useUserAuth";
import { supabase } from "../api/supabaseClient";
import { mapServer } from "../api/mapServer";
import avatarPlaceholder from "../assets/img/AvatarPlaceholder.jpg";
import bannerPlaceholder from "../assets/img/BannerPlaceholder.jpeg";

interface FormActions {
	setErrors: (errors: Record<string, string>) => void;
}

const EditServer: React.FC = () => {
	const { serverId } = useParams();
	const navigate = useNavigate();
	const { user } = useUserAuth();
	const [server, setServer] = useState<ServerInterface | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [bannerFile, setBannerFile] = useState<File | null>(null);
	const [bannerPreview, setBannerPreview] = useState<string | undefined>(
		undefined,
	);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
		undefined,
	);

	const bannerInputRef = useRef<HTMLInputElement>(null);
	const avatarInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			const { data, error } = await supabase
				.from("servers")
				.select(
					"id, name, description, owner_id, created_at, icon_url, banner_url",
				)
				.eq("id", serverId)
				.maybeSingle();
			if (error || !data) {
				setServer(null);
			} else {
				setServer(mapServer(data, []));
				setBannerPreview(data.banner_url ?? undefined);
				setAvatarPreview(data.icon_url ?? undefined);
			}
			setLoading(false);
		};
		void load();
	}, [serverId]);

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (!server) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
				<Alert severity="error">Server not found.</Alert>
			</Box>
		);
	}

	if (user && String(server.owner_id) !== String(user.id)) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
				<Alert severity="error">
					You don't have permission to edit this server. Only the server owner
					can make changes.
				</Alert>
			</Box>
		);
	}

	const serverFields: Field[] = [
		{ name: "name", label: "Server Name", type: "text", required: true },
		{
			name: "description",
			label: "Description",
			type: "text",
			multiline: true,
			rows: 3,
		},
	];

	const initialValues = {
		name: server.name || "",
		description: server.description || "",
	};

	const validate = (values: typeof initialValues) =>
		validateFormFields(serverFields, values);

	const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setBannerFile(file);
			const reader = new FileReader();
			reader.onload = (event) =>
				setBannerPreview(event.target?.result as string);
			reader.readAsDataURL(file);
		}
	};

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setAvatarFile(file);
			const reader = new FileReader();
			reader.onload = (event) =>
				setAvatarPreview(event.target?.result as string);
			reader.readAsDataURL(file);
		}
	};

	const onSubmit = async (
		values: typeof initialValues,
		_actions: FormActions,
	) => {
		setSubmitError(null);
		setSubmitSuccess(null);
		setSubmitting(true);

		try {
			let iconUrl = server.server_image_urls?.server_icon_url || null;
			let bannerUrl = server.server_image_urls?.banner_image_url || null;

			if (avatarFile) {
				const ext = avatarFile.name.split(".").pop()?.toLowerCase() || "jpg";
				const path = `servers/${serverId}/icon.${ext}`;
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
				const path = `servers/${serverId}/banner.${ext}`;
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

			const { error } = await supabase
				.from("servers")
				.update({
					name: values.name,
					description: values.description,
					icon_url: iconUrl,
					banner_url: bannerUrl,
				})
				.eq("id", serverId);

			if (error) throw error;
			setSubmitSuccess("Server updated successfully!");
			setTimeout(() => navigate(`/server/${serverId}`), 1000);
		} catch (error: unknown) {
			const err = error as { message?: string };
			setSubmitError(err.message ?? "An error occurred. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	const footer = (
		<Box sx={{ display: "flex", gap: 2, mt: 2 }}>
			<Button
				variant="outlined"
				color="secondary"
				onClick={() => navigate(`/server/${serverId}`)}
				sx={{ flex: 1 }}
				disabled={submitting}
			>
				Cancel
			</Button>
			<Button
				variant="contained"
				color="primary"
				type="submit"
				disabled={submitting}
				sx={{ flex: 1 }}
			>
				{submitting ? "Saving..." : "Save Changes"}
			</Button>
		</Box>
	);

	return (
		<Box
			sx={{
				maxWidth: { xs: "95vw", sm: 500 },
				mx: { xs: 1, sm: "auto" },
				mt: 6,
				px: 0,
				py: 0,
				bgcolor: "background.paper",
				borderRadius: 3,
				boxShadow: 4,
				overflow: "hidden",
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
				title="Click to change banner"
			>
				<input
					ref={bannerInputRef}
					type="file"
					accept="image/jpeg,image/png,image/gif,image/webp,image/jpg"
					style={{ display: "none" }}
					onChange={handleBannerChange}
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
					title="Click to change server icon"
				>
					<input
						ref={avatarInputRef}
						type="file"
						accept="image/jpeg,image/png,image/gif,image/webp,image/jpg"
						style={{ display: "none" }}
						onChange={handleAvatarChange}
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
					Edit Server
				</Typography>

				{submitError && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{submitError}
					</Alert>
				)}
				{submitSuccess && (
					<Alert severity="success" sx={{ mb: 2 }}>
						{submitSuccess}
					</Alert>
				)}

				<Form
					fields={serverFields}
					initialValues={initialValues}
					validate={validate}
					onSubmit={onSubmit}
					submitLabel=""
					disabled={submitting}
					footer={footer}
				/>
			</Box>
		</Box>
	);
};

export default EditServer;
