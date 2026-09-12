/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Box, Typography, Button, useTheme, Alert } from "@mui/material";
import Modal from "../../components/shared/Modal";
import AuthHeader from "../../components/shared/Header";
import Form from "../../components/shared/Form";
import { Field } from "../../components/shared/Form";
import { supabase } from "../../api/supabaseClient";
import resetImg from "../../assets/img/reset.jpg";

// v2 note: there is no :uid/:token here anymore. Supabase's recovery email
// links back to this page and the client library reads the recovery token
// out of the URL itself (see supabaseClient.ts detectSessionInUrl), firing a
// PASSWORD_RECOVERY auth event once a temporary session is established.
const ResetPassword: React.FC = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const [modalOpen, setModalOpen] = useState(false);
	const [ready, setReady] = useState(false);
	const [checking, setChecking] = useState(true);

	useEffect(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((event) => {
			if (event === "PASSWORD_RECOVERY") {
				setReady(true);
				setChecking(false);
			}
		});

		// Fallback for the case where the recovery session was already applied
		// (event fired) before this listener attached.
		supabase.auth.getSession().then(({ data }) => {
			if (data.session) setReady(true);
			setChecking(false);
		});

		return () => sub.subscription.unsubscribe();
	}, []);

	// Form fields definition
	const fields: Field[] = [
		{
			name: "new_password1",
			label: "New Password",
			type: "password",
			required: true,
		},
		{
			name: "new_password2",
			label: "Confirm New Password",
			type: "password",
			required: true,
		},
	];

	// Formik initial values
	const initialValues = {
		new_password1: "",
		new_password2: "",
	};

	// Formik validation
	const validate = (values: typeof initialValues) => {
		const errors: Record<string, string> = {};
		if (!values.new_password1)
			errors.new_password1 = "New password is required";
		if (!values.new_password2)
			errors.new_password2 = "Please confirm your new password";
		if (
			values.new_password1 &&
			values.new_password2 &&
			values.new_password1 !== values.new_password2
		)
			errors.new_password2 = "Passwords do not match";
		return errors;
	};

	// Formik submit handler
	const onSubmit = async (
		values: typeof initialValues,
		{ setSubmitting, setErrors }: any,
	) => {
		try {
			const { error } = await supabase.auth.updateUser({
				password: values.new_password1,
			});
			if (error) throw error;

			setModalOpen(true);
			setTimeout(() => {
				setModalOpen(false);
				navigate("/login");
			}, 2500);
		} catch (err: any) {
			setErrors({
				new_password1:
					err?.message ?? "Password reset failed. Please try again.",
			});
		} finally {
			setSubmitting(false);
		}
	};

	// Footer: Back to login
	const footer = (
		<Typography variant="body2" sx={{ mt: 2 }}>
			Remembered your password?
			<Button
				onClick={() => navigate("/login")}
				sx={{
					"fontWeight": 600,
					"ml": 1,
					"textDecoration": "none",
					"color": "primary.main",
					"cursor": "pointer",
					"&:hover": {
						textDecoration: "underline",
						color: "primary.dark",
					},
				}}
			>
				Login
			</Button>
		</Typography>
	);

	return (
		<Grid container sx={{ height: "100vh" }}>
			{/* Left: Form (33%) */}
			<Grid
				item
				xs={12}
				md={4}
				sx={{
					minWidth: 340,
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
					boxShadow: { md: 3, xs: 0 },
					bgcolor: theme.palette.background.paper,
				}}
			>
				<Box sx={{ width: "80%", maxWidth: 350 }}>
					<AuthHeader title="Reset Password" />
					{!checking && !ready ? (
						<>
							<Alert severity="error" sx={{ mb: 2 }}>
								This reset link is invalid or has expired. Please request a new
								one.
							</Alert>
							<Button
								fullWidth
								variant="contained"
								onClick={() => navigate("/forgot")}
							>
								Back to Forgot Password
							</Button>
						</>
					) : (
						<Form
							fields={fields}
							initialValues={initialValues}
							validate={validate}
							onSubmit={onSubmit}
							submitLabel="Reset Password"
							disabled={checking}
							footer={footer}
						/>
					)}
				</Box>
				<Modal
					open={modalOpen}
					onClose={() => {
						setModalOpen(false);
						navigate("/login");
					}}
					title="Password Reset Successful!"
					actions={
						<Button
							onClick={() => {
								setModalOpen(false);
								navigate("/login");
							}}
							variant="contained"
							color="primary"
						>
							Go to Login
						</Button>
					}
				>
					<Typography>
						Your password has been reset successfully. You can now log in with
						your new password.
					</Typography>
				</Modal>
			</Grid>
			{/* Right: Image (67%) */}
			<Grid
				item
				xs={false}
				md={8}
				sx={{
					display: { xs: "none", md: "block" },
					height: "100vh",
					backgroundImage: `url(${resetImg})`,
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center left",
					backgroundSize: "cover",
				}}
			/>
		</Grid>
	);
};

export default ResetPassword;
