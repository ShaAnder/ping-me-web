/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Grid, Box, Typography, Link, useTheme, Button } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import Modal from "../../components/shared/Modal";
import AuthHeader from "../../components/shared/Header";
import Form from "../../components/shared/Form";
import { Field } from "../../components/shared/Form";
import { BASE_URL } from "../../api/config";
import forgotImg from "../../assets/img/forgot.jpg";

const ForgotPassword: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  // Form fields definition
  const fields: Field[] = [
    { name: "email", label: "Email", type: "email", required: true },
  ];

  // Formik initial values
  const initialValues = {
    email: "",
  };

  // Formik validation
  const validate = (values: typeof initialValues) => {
    const errors: Record<string, string> = {};
    if (!values.email) errors.email = "Email is required";
    return errors;
  };

  // Formik submit handler
  const onSubmit = async (
    values: typeof initialValues,
    { setSubmitting, setErrors }: any
  ) => {
    try {
      await axios.post(`${BASE_URL}/api/account/password_reset/`, values);
      setModalOpen(true);
      setTimeout(() => {
        setModalOpen(false);
        navigate("/login");
      }, 6000);
    } catch (err: any) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ email: "Unable to send reset email. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Footer: Back to login
  const footer = (
    <Typography variant="body2" sx={{ mt: 2 }}>
      Remember your password?
      <Link
        component={RouterLink}
        to="/login"
        sx={{
          fontWeight: 600,
          ml: 1,
          textDecoration: "none",
          color: "primary.main",
          cursor: "pointer",
          "&:hover": {
            textDecoration: "underline",
            color: "primary.dark",
          },
        }}
      >
        Login
      </Link>
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
          <AuthHeader title="Forgot Password" />
          <Form
            fields={fields}
            initialValues={initialValues}
            validate={validate}
            onSubmit={onSubmit}
            submitLabel="Send Reset Link"
            footer={footer}
          />
        </Box>
        <Modal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            navigate("/login");
          }}
          title="Check Your Email!"
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
            If this email is registered, you’ll receive a password reset link
            shortly.
          </Typography>
          <Typography
            sx={{ mt: 2, fontSize: 14, color: theme.palette.text.secondary }}
          >
            You will be redirected to the login page shortly.
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
          backgroundImage: `url(${forgotImg})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center left",
          backgroundSize: "cover",
        }}
      />
    </Grid>
  );
};

export default ForgotPassword;
