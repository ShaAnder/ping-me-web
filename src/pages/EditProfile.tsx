/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import Form, { Field } from "../components/shared/Form";
import { validateFormFields } from "../utils/validateForm";
import { UserAuthContext } from "../contexts/UserAuthContext";
import { supabase } from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";

// Define your fields (order matters)
const EditProfile: React.FC = () => {
	const context = useContext(UserAuthContext);
	if (!context)
		throw new Error("UserAuthContext must be used within a provider");
	const { user, loading, refreshUser } = context;

	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const navigate = useNavigate();
	if (loading || !user) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
				<CircularProgress />
			</Box>
		);
	}

	const profileFields: Field[] = [
		{
			name: "image",
			label: "Avatar",
			type: "file",
			accept: "image/jpeg,image/png,image/gif,image/webp,image/jpg",
			defaultImage: user.image_url || undefined,
		},
		{ name: "username", label: "Username", type: "text", required: true },
		{ name: "content", label: "Bio", type: "text", multiline: true, rows: 4 },
		{ name: "location", label: "Location", type: "text" },
	];

	const initialValues = {
		image: user.image_url || "",
		username: user.username || "",
		content: user.content || "",
		location: user.location || "",
	};

	const validate = (values: typeof initialValues) =>
		validateFormFields(profileFields, values);

	function isFile(val: unknown): val is File {
		return typeof File !== "undefined" && val instanceof File;
	}

	const onSubmit = async (values: typeof initialValues, { setErrors }: any) => {
		setSubmitError(null);
		setSubmitSuccess(null);
		setSubmitting(true);

		try {
			let avatarUrl = user.image_url || null;

			if (isFile(values.image)) {
				const ext = values.image.name.split(".").pop()?.toLowerCase() || "jpg";
				const path = `avatars/${user.id}.${ext}`;
				const { error: upErr } = await supabase.storage
					.from("media")
					.upload(path, values.image, {
						upsert: true,
						contentType: values.image.type,
					});
				if (upErr) throw upErr;

				const { data } = supabase.storage.from("media").getPublicUrl(path);
				avatarUrl = `${data.publicUrl}?t=${Date.now()}`;
			}

			const { error } = await supabase
				.from("profiles")
				.update({
					username: values.username,
					bio: values.content,
					location: values.location,
					avatar_url: avatarUrl,
				})
				.eq("id", user.id);

			if (error) throw error;

			setSubmitSuccess("Profile updated successfully!");
			await refreshUser();
			navigate(-1);
		} catch (error: any) {
			console.error(error);
			setSubmitError(error?.message ?? "An error occurred. Please try again.");
			if (error?.message) setErrors({ image: error.message });
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Box
			sx={{
				maxWidth: 500,
				mx: "auto",
				mt: 6,
				px: 3,
				py: 4,
				bgcolor: "background.paper",
				borderRadius: 3,
				boxShadow: 4,
			}}
		>
			<Typography variant="h5" fontWeight={700} mb={3} align="center">
				Edit Profile
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
				fields={profileFields}
				initialValues={initialValues}
				validate={validate}
				onSubmit={onSubmit}
				submitLabel={submitting ? "Saving..." : "Save Changes"}
				disabled={submitting}
			/>
		</Box>
	);
};

export default EditProfile;
