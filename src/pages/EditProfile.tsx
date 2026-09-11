/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import Form, { Field } from "../components/shared/Form";
import { validateFormFields } from "../utils/validateForm";
import { UserAuthContext } from "../contexts/UserAuthContext";
import axios from "axios";
import { BASE_URL } from "../api/config";
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

  const authAxios = axios.create({ baseURL: BASE_URL });
  authAxios.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  function isFile(val: unknown): val is File {
    return typeof File !== "undefined" && val instanceof File;
  }

  const onSubmit = async (values: typeof initialValues, { setErrors }: any) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitting(true);

    // Build FormData
    const formData = new FormData();
    if (isFile(values.image)) {
      formData.append("image", values.image, values.image.name);
    }
    formData.append("username", values.username);
    formData.append("content", values.content);
    formData.append("location", values.location);

    try {
      await authAxios.patch("/api/account/edit_me/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitSuccess("Profile updated successfully!");
      await refreshUser();
      navigate(-1);
    } catch (error: any) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setSubmitError("An error occurred. Please try again.");
      }
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
