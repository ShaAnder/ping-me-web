import React, { useState } from "react";
import { Button, TextField, MenuItem, Stack } from "@mui/material";
import Modal from "../shared/Modal";
import axios from "axios";
import { BASE_URL } from "../../api/config";

interface AddChannelProps {
  open: boolean;
  onClose: () => void;
  serverId: number;
  onChannelAdded?: () => void;
  isOwner: boolean;
}

const AddChannel: React.FC<AddChannelProps> = ({
  open,
  onClose,
  serverId,
  onChannelAdded,
  isOwner,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"text">("text");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddChannel = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${BASE_URL}/api/channels/`,
        {
          name,
          type,
          server: serverId,
          description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setType("text");
      setDescription("");
      if (onChannelAdded) onChannelAdded();
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  if (!isOwner) return null;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Add Channel"
        actions={
          <Stack direction="row" spacing={2}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleAddChannel}
              variant="contained"
              disabled={loading || !name.trim()}
            >
              Add
            </Button>
          </Stack>
        }
      >
        <TextField
          label="Channel Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          autoFocus
        />
        <TextField
          select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value as "text")}
          fullWidth
          margin="normal"
        >
          <MenuItem value="text">Text</MenuItem>
        </TextField>
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
        />
      </Modal>
    </>
  );
};

export default AddChannel;
