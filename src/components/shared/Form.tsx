/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Avatar,
} from "@mui/material";
import { useFormik, FormikErrors } from "formik";
import { useTheme } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";

type Field = {
  name: string;
  label: string;
  type: "text" | "password" | "email" | "file" | "checkbox" | "select";
  accept?: string;
  options?: { label: string; value: string }[];
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  defaultImage?: string;
};

interface FormProps<T> {
  fields: Field[];
  initialValues: T;
  validate: (values: T) => FormikErrors<T>;
  onSubmit: (values: T, helpers: any) => void | Promise<void>;
  submitLabel: string;
  loading?: boolean;
  footer?: React.ReactNode;
  disabled?: boolean;
}

function Form<T extends Record<string, any>>({
  fields,
  initialValues,
  validate,
  onSubmit,
  submitLabel,
  loading,
  footer,
  disabled,
}: FormProps<T>) {
  const theme = useTheme();
  const [previews, setPreviews] = useState<Record<string, string | null>>({});

  const formik = useFormik<T>({
    initialValues,
    validate,
    onSubmit,
  });

  return (
    <form onSubmit={formik.handleSubmit} autoComplete="off">
      {fields.map((field) => {
        if (field.type === "file" && field.name === "image") {
          return (
            <Box
              key={field.name}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Button
                variant="outlined"
                component="label"
                sx={{
                  borderRadius: 2,
                  width: 160,
                  height: 160,
                  p: 0,
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: 2,
                  background: "#fff",
                }}
                disabled={disabled}
              >
                <Avatar
                  src={previews[field.name] || field.defaultImage || undefined}
                  sx={{
                    width: 150,
                    height: 150,
                    borderRadius: 2,
                    fontSize: 64,
                    bgcolor: "primary.main",
                  }}
                >
                  <ImageIcon sx={{ fontSize: 64, color: "#fff" }} />
                </Avatar>
                <input
                  id={field.name}
                  name={field.name}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/jpg"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0] || null;
                    formik.setFieldValue(field.name, file, true);
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setPreviews((prev) => ({
                          ...prev,
                          [field.name]: event.target?.result as string,
                        }));
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setPreviews((prev) => ({
                        ...prev,
                        [field.name]: null,
                      }));
                    }
                  }}
                  disabled={disabled}
                />
              </Button>
              <Typography variant="caption" color="text.secondary">
                Click to change avatar
              </Typography>
              {/* Keep error display for file/image fields */}
              {formik.errors[field.name] && (
                <Typography color="error" variant="caption">
                  {formik.errors[field.name] as string}
                </Typography>
              )}
            </Box>
          );
        }

        // Default rendering for other fields (NO duplicate error message)
        return (
          <Box sx={{ mb: 2 }} key={field.name}>
            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
              {field.label}
            </Typography>
            <TextField
              id={field.name}
              name={field.name}
              type={field.type}
              size="small"
              fullWidth
              value={formik.values[field.name] ?? ""}
              onChange={formik.handleChange}
              error={Boolean(formik.errors[field.name])}
              helperText={formik.errors[field.name] as string | undefined}
              variant="outlined"
              multiline={field.multiline}
              rows={field.rows}
              disabled={disabled}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "background.default",
                },
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.default} inset`,
                  WebkitTextFillColor: theme.palette.text.primary,
                  caretColor: theme.palette.text.primary,
                },
              }}
            />
            {/* No duplicate error Typography here! */}
          </Box>
        );
      })}
      {submitLabel && (
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="medium"
          disabled={formik.isSubmitting || loading || disabled}
          sx={{
            py: 1.5,
            fontSize: 18,
            fontWeight: 700,
            borderRadius: 2,
            mb: 1.5,
            textTransform: "none",
          }}
        >
          {formik.isSubmitting || loading ? (
            <CircularProgress size={24} />
          ) : (
            submitLabel
          )}
        </Button>
      )}
      {footer}
    </form>
  );
}

export type { Field };

export default Form;
