/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Alert,
  Button,
  Container,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  TextField,
} from "@mui/material";
import axios from "axios";
import { BASE_URL } from "../api/config";
import { useNavigate } from "react-router-dom";
import { useCategoriesContext } from "../hooks/useCategoryContext";
import { useServerContext } from "../hooks/useServerContext";
import { useUserServers } from "../hooks/useUserServers";

// Import your placeholder images
import avatarPlaceholder from "../assets/img/AvatarPlaceholder.jpg";
import bannerPlaceholder from "../assets/img/BannerPlaceholder.jpeg";

const AddServer: React.FC = () => {
  // File states
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategoriesContext();
  const { refreshServers } = useServerContext();
  const { refresh: refreshUserServers } = useUserServers();

  const [bannerPreview, setBannerPreview] = useState<string | undefined>(
    undefined
  );
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    undefined
  );
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<string>("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Show loading state for categories
  if (categoriesLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper
          elevation={3}
          sx={{ borderRadius: 3, p: 4, textAlign: "center" }}
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading categories...
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Prepare category options for select field
  const categoryOptions =
    categories?.map((cat) => ({
      label: cat.name,
      value: String(cat.id),
    })) || [];

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    if (!bannerFile || !avatarFile || !name || !description || !category) {
      setSubmitError("All fields are required, including both images.");
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("banner_image", bannerFile, bannerFile.name);
    formData.append("server_icon", avatarFile, avatarFile.name);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("is_private", String(isPrivate));
    formData.append("category", category);

    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.post(`${BASE_URL}/api/servers/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      // Refresh both main and user server lists before navigating
      await refreshServers();
      await refreshUserServers();
      navigate(`/server/${res.data.id}`);
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setSubmitError(error.response.data.detail);
      } else {
        setSubmitError("An error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "background.paper",
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
          title="Click to upload banner"
        >
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/jpg"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              setBannerFile(file || null);
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) =>
                  setBannerPreview(event.target?.result as string);
                reader.readAsDataURL(file);
              } else {
                setBannerPreview(undefined);
              }
            }}
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
            title="Click to upload server icon"
          >
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/jpg"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                setAvatarFile(file || null);
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) =>
                    setAvatarPreview(event.target?.result as string);
                  reader.readAsDataURL(file);
                } else {
                  setAvatarPreview(undefined);
                }
              }}
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
            Add Server
          </Typography>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          <form onSubmit={handleSubmit} autoComplete="off">
            <TextField
              label="Server Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
              <FormControl fullWidth sx={{ flex: 1 }}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {categoryOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                  />
                }
                label="Private"
                sx={{ ml: 2 }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={submitting}
                sx={{ flex: 1 }}
              >
                {submitting ? "Creating..." : "Create"}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate("/")}
                sx={{ flex: 1 }}
                disabled={submitting}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddServer;
