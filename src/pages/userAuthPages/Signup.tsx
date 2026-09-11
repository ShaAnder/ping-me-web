/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Grid, Box, Typography, Link, useTheme, Button } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import Modal from "../../components/shared/Modal";
import AuthHeader from "../../components/shared/Header";
import Form, { Field } from "../../components/shared/Form";
import { BASE_URL } from "../../api/config";
import signUpImg from "../../assets/img/signup.jpg";

const Signup: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  // Form fields
  const fields: Field[] = [
    { name: "username", label: "Username", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "email2", label: "Confirm Email", type: "email", required: true },
    { name: "password", label: "Password", type: "password", required: true },
  ];

  // Initial values
  const initialValues = {
    username: "",
    email: "",
    email2: "",
    password: "",
  };

  // Validation
  const validate = (values: typeof initialValues) => {
    const errors: Record<string, string> = {};
    if (!values.username) errors.username = "Username is required";
    if (!values.email) errors.email = "Email is required";
    if (!values.email2) errors.email2 = "Please confirm your email";
    if (values.email && values.email2 && values.email !== values.email2)
      errors.email2 = "Emails do not match";
    if (!values.password) errors.password = "Password is required";
    return errors;
  };

  // Submit handler
  const onSubmit = async (
    values: typeof initialValues,
    { setSubmitting, setErrors }: any
  ) => {
    try {
      await axios.post(`${BASE_URL}/api/account/register/`, values);
      setModalOpen(true);
      setTimeout(() => {
        setModalOpen(false);
        navigate("/login");
      }, 5000);
    } catch (err: any) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ password: "Registration failed. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Footer links
  const footer = (
    <Box>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Already have an account?
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
      <Typography variant="body2" sx={{ mt: 2 }}>
        Forgot your
        <Link
          component={RouterLink}
          to="/forgot"
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
          password?
        </Link>
      </Typography>
    </Box>
  );

  return (
    <Grid container sx={{ height: "100vh" }}>
      {/* Left: Form */}
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
          <AuthHeader title="Sign Up" />
          <Form
            fields={fields}
            initialValues={initialValues}
            validate={validate}
            onSubmit={onSubmit}
            submitLabel="Sign Up"
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
            We’ve sent a verification link to your email. Please check your
            inbox and click the link to activate your account.
          </Typography>
          <Typography
            sx={{ mt: 2, fontSize: 14, color: theme.palette.text.secondary }}
          >
            You will be redirected to the login page shortly.
          </Typography>
        </Modal>
      </Grid>
      {/* Right: Image */}
      <Grid
        item
        xs={false}
        md={8}
        sx={{
          display: { xs: "none", md: "block" },
          height: "100vh",
          backgroundImage: `url(${signUpImg})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center right",
          backgroundSize: "cover",
        }}
      />
    </Grid>
  );
};

export default Signup;
