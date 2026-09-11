import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogProps,
  useTheme,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export interface ModalProps extends Omit<DialogProps, "title"> {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  ...dialogProps
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 1000000, // Ensures Dialog root is on top
      }}
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          borderRadius: 3,
          boxShadow: 12,
          position: "relative",
          zIndex: 1000001, // Ensures Paper is above everything else
        },
      }}
      {...dialogProps}
    >
      {/* Close X in top right */}
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
          zIndex: 10,
        }}
      >
        <CloseIcon />
      </IconButton>
      {title && (
        <DialogTitle
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 700,
            letterSpacing: 1,
            pb: 1,
            pr: 5,
          }}
        >
          {title}
        </DialogTitle>
      )}
      <DialogContent sx={{ pb: 2 }}>{children}</DialogContent>
      {actions && (
        <DialogActions
          sx={{
            justifyContent: "flex-end",
            pr: 3,
            pb: 3,
            pt: 0,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;
