import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import pingMeLogo from "../assets/img/pingMe.png";

interface ErrorPageProps {
	error?: { status?: number; message?: string };
	children?: React.ReactNode;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error, children }) => {
	const navigate = useNavigate();
	const theme = useTheme();

	const handleGoBack = () => {
		if (window.history.length > 1) {
			navigate(-1);
		} else {
			navigate("/");
		}
	};

	const getErrorMessage = () => {
		if (children) return children;

		if (error?.status === 404) {
			return (
				<>
					<Typography variant="h4" gutterBottom>
						Oops! Page Not Found
					</Typography>
					<Typography variant="body1" color="text.secondary">
						We couldn't find the page you're looking for. Don't worry, it
						happens to the best of us!
					</Typography>
				</>
			);
		}

		if (error?.status === 403) {
			return (
				<>
					<Typography variant="h4" gutterBottom>
						Access Restricted
					</Typography>
					<Typography variant="body1" color="text.secondary">
						You don't have permission to view this content. Try logging in or
						contact support if you think this is a mistake.
					</Typography>
				</>
			);
		}

		if (error?.status === 500 || (error?.status && error.status >= 500)) {
			return (
				<>
					<Typography variant="h4" gutterBottom>
						Something Went Wrong
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Our servers are having a moment. Please try again in a few minutes!
					</Typography>
				</>
			);
		}

		return (
			<>
				<Typography variant="h4" gutterBottom>
					Unexpected Error
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Something unexpected happened. Don't worry, we're on it!
				</Typography>
			</>
		);
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				p: 4,
				textAlign: "center",
			}}
		>
			{/* Logo + App Name on same line */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 2,
					mb: 3,
				}}
			>
				<img
					src={pingMeLogo}
					alt="Ping Me"
					style={{
						width: "60px",
						height: "60px",
						objectFit: "contain",
					}}
				/>
				<Typography
					variant="h3"
					sx={{
						fontWeight: "bold",
						color: theme.palette.primary.main,
					}}
				>
					Ping Me
				</Typography>
			</Box>

			{/* Error Message */}
			<Box sx={{ mb: 4, maxWidth: 500 }}>{getErrorMessage()}</Box>

			{/* Back Button */}
			<Button
				variant="contained"
				onClick={handleGoBack}
				sx={{
					"px": 4,
					"py": 1.5,
					"borderRadius": 2,
					"textTransform": "none",
					"fontSize": "1rem",
					"backgroundColor": theme.palette.primary.main,
					"&:hover": {
						backgroundColor: theme.palette.primary.dark,
					},
				}}
			>
				Take Me Back
			</Button>
		</Box>
	);
};

export default ErrorPage;
