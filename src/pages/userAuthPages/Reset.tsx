/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Box, Typography, Button, useTheme } from "@mui/material";
import axios from "axios";
import Modal from "../../components/shared/Modal";
import AuthHeader from "../../components/shared/Header";
import Form from "../../components/shared/Form";
import { Field } from "../../components/shared/Form";
import { BASE_URL } from "../../api/config";
import resetImg from "../../assets/img/reset.jpg";

const ResetPassword: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const [modalOpen, setModalOpen] = useState(false);

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
    { setSubmitting, setErrors }: any
  ) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/account/password_reset_confirm/`,
        {
          uid,
          token,
          new_password1: values.new_password1,
          new_password2: values.new_password2,
        }
      );

      setModalOpen(true);

      // Use redirect_url from backend if provided, else fallback to /login
      const redirectUrl = response.data.redirect_url || "/login";
      setTimeout(() => {
        setModalOpen(false);
        // If the redirectUrl is an absolute URL, use window.location.href
        if (redirectUrl.startsWith("http")) {
          window.location.href = redirectUrl;
        } else {
          navigate(redirectUrl);
        }
      }, 2500); // 2.5 seconds delay before redirect
    } catch (err: any) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({
          new_password1: "Password reset failed. Please try again.",
        });
      }
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
          <Form
            fields={fields}
            initialValues={initialValues}
            validate={validate}
            onSubmit={onSubmit}
            submitLabel="Reset Password"
            footer={footer}
          />
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
