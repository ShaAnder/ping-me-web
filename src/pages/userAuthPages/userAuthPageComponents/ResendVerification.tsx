/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Button, Typography, TextField } from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import axios from "axios";
import { BASE_URL } from "../../../api/config";
import Modal from "../../../components/shared/Modal";

const ResendVerificationButton: React.FC = () => {
  const [email, setEmail] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(
        `${BASE_URL}/api/account/resend_verification/`,
        {
          email,
        }
      );
      setMessage(res.data.message);
    } catch (err: any) {
      setMessage(
        err?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
    setLoading(false);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEmail("");
    setMessage("");
    setLoading(false);
  };

  return (
    <>
      <Button
        startIcon={<MailOutlineIcon />}
        onClick={() => setModalOpen(true)}
        variant="text"
        sx={{ textTransform: "none", pl: 0.3 }}
      >
        Resend verification email
      </Button>
      <Modal
        open={modalOpen}
        onClose={handleClose}
        title="Resend Verification Email"
        actions={
          <Button
            onClick={handleResend}
            startIcon={<MailOutlineIcon />}
            variant="contained"
            disabled={loading}
          >
            {loading ? "Sending..." : "Resend"}
          </Button>
        }
      >
        <Typography sx={{ mb: 2 }}>
          Enter your email address below and we'll resend your verification link
          if your account exists and isn't already verified.
        </Typography>
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        {message && (
          <Typography
            variant="body2"
            color={message.includes("resent") ? "success.main" : "error.main"}
            sx={{ mt: 1 }}
          >
            {message}
          </Typography>
        )}
      </Modal>
    </>
  );
};

export default ResendVerificationButton;
