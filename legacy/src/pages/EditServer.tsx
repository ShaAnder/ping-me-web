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
import axios, { AxiosError } from "axios";
import { BASE_URL } from "../api/config";
import { useNavigate, useParams } from "react-router-dom";
import { ServerInterface } from "../@types/server";
import { useUserAuth } from "../hooks/useUserAuth";

import avatarPlaceholder from "../assets/img/AvatarPlaceholder.jpg";
import bannerPlaceholder from "../assets/img/BannerPlaceholder.jpeg";

// Type for form submission actions
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

  // Banner and avatar file/preview state
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | undefined>(
    undefined
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    undefined
  );

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchServer = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(`${BASE_URL}/api/servers/${serverId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServer(res.data);
        setBannerPreview(res.data.server_image_urls?.banner_image_url);
        setAvatarPreview(res.data.server_image_urls?.server_icon_url);
      } catch {
        setServer(null);
      }
      setLoading(false);
    };
    fetchServer();
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

  // Check if the current user is the owner of the server
  if (user && server.owner_id !== user.id) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <Alert severity="error">
          You don't have permission to edit this server. Only the server owner can make changes.
        </Alert>
      </Box>
    );
  }

  // Only include name and description in the form fields
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

  const onSubmit = async (values: typeof initialValues, { setErrors }: FormActions) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitting(true);

    // Build FormData
    const formData = new FormData();
    if (bannerFile) {
      formData.append("banner_image", bannerFile, bannerFile.name);
    }
    if (avatarFile) {
      formData.append("server_icon", avatarFile, avatarFile.name);
    }
    formData.append("name", values.name);
    formData.append("description", values.description);

    try {
      const token = localStorage.getItem("access_token");
      await axios.patch(`${BASE_URL}/api/servers/${serverId}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSubmitSuccess("Server updated successfully!");
      setTimeout(() => navigate(`/server/${serverId}`), 1000);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<Record<string, string>>;
      if (axiosError.response?.data) {
        setErrors(axiosError.response.data);
      } else {
        setSubmitError("An error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- Custom footer for Save and Cancel buttons ---
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

  // --- Banner and Avatar Layout as clickable upload fields ---
  return (
    <Box
      sx={{
        maxWidth: { xs: "95vw", sm: 500 }, // Responsive width for mobile
        mx: { xs: 1, sm: "auto" }, // Margin on mobile, centered otherwise
        mt: 6,
        px: 0,
        py: 0,
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: 4,
        overflow: "hidden",
      }}
    >
      {/* Banner image as upload */}
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
        {/* Server icon (avatar) as upload */}
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
          submitLabel="" // Hides the default button
          disabled={submitting}
          footer={footer}
        />
      </Box>
    </Box>
  );
};

export default EditServer;
