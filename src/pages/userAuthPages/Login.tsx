/* eslint-disable @typescript-eslint/no-explicit-any */
import { Grid, Box, Typography, Link, useTheme } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import AuthHeader from "../../components/shared/Header";
import Form from "../../components/shared/Form";
import { Field } from "../../components/shared/Form";
import { useUserAuth } from "../../hooks/useUserAuth";
import loginImg from "../../assets/img/login.jpg";

import ResendVerificationButton from "./userAuthPageComponents/ResendVerification";

const Login: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login, loading } = useUserAuth();

  // Fields for the form
  const fields: Field[] = [
    { name: "username", label: "Username", type: "text", required: true },
    { name: "password", label: "Password", type: "password", required: true },
  ];

  // Initial values
  const initialValues = {
    username: "",
    password: "",
  };

  // Validation
  const validate = (values: typeof initialValues) => {
    const errors: Record<string, string> = {};
    if (!values.username) errors.username = "Username is required";
    if (!values.password) errors.password = "Password is required";
    return errors;
  };

  // On submit
  const onSubmit = async (
    values: typeof initialValues,
    { setSubmitting, setErrors }: any
  ) => {
    try {
      await login(values.username, values.password);
      navigate("/");
    } catch (err: any) {
      console.log(err);
      setErrors({
        password: "Invalid credentials, please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Don't have an account?
        <Link
          component={RouterLink}
          to="/signup"
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
          Sign up
        </Link>
      </Typography>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Forgot Your
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
          Password?
        </Link>
      </Typography>
    </>
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
          <AuthHeader title="Login" />

          <Form
            fields={fields}
            initialValues={initialValues}
            validate={validate}
            onSubmit={onSubmit}
            submitLabel="Login"
            loading={loading}
            footer={footer}
          />
        </Box>
        <Box
          sx={{
            width: "100%",
            maxWidth: 350,
            display: "flex",
            justifyContent: "left",
            mt: 1,
          }}
        >
          {/* ...your form and footer... */}
          <ResendVerificationButton />
        </Box>
      </Grid>
      {/* Right: Image (67%) */}
      <Grid
        item
        xs={false}
        md={8}
        sx={{
          display: { xs: "none", md: "block" },
          height: "100vh",
          backgroundImage: `url(${loginImg})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center right",
          backgroundSize: "cover",
        }}
      />
    </Grid>
  );
};

export default Login;
