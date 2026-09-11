import React, { useState } from "react";
import { Button, TextField, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { BASE_URL } from "../../api/config";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";

interface DeleteAccountButtonProps {
  onClose?: () => void;
}

const DeleteAccountButton: React.FC<DeleteAccountButtonProps> = ({ onClose }) => {
  const { user, logout } = useUserAuth();
  const navigate = useNavigate();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setDeleting(true);
    setDeleteError("");
    
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${BASE_URL}/api/account/delete_me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Close modal and parent UserCard if onClose provided
      setShowDeleteModal(false);
      if (onClose) onClose();
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.log(err);
      setDeleteError("Failed to delete account. Please try again.");
    }
    setDeleting(false);
  };

  if (!user) return null;

  return (
    <>
      <Button
        variant="outlined"
        fullWidth
        color="error"
        startIcon={<DeleteIcon />}
        onClick={() => setShowDeleteModal(true)}
        sx={{
          mb: 1,
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 500,
          borderColor: "error.main",
          "&:hover": {
            bgcolor: "error.light",
            color: "white",
          },
        }}
      >
        Delete Account
      </Button>

      {/* Delete Account Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        actions={
          <>
            <Button
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              color="error"
              variant="contained"
              disabled={deleteInput !== user.username || deleting}
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </Button>
          </>
        }
      >
        <Typography sx={{ mb: 2 }}>
          Are you sure you wish to delete your account <b>{user.username}</b>?<br />
          This action cannot be undone and will delete all your data including any servers you created and messages.
          <br />
          <br />
          Please type <b>{user.username}</b> to confirm.
        </Typography>
        <TextField
          label="Username"
          value={deleteInput}
          onChange={(e) => setDeleteInput(e.target.value)}
          fullWidth
          autoFocus
          error={!!deleteError}
          helperText={deleteError}
          disabled={deleting}
        />
      </Modal>
    </>
  );
};

export default DeleteAccountButton;
