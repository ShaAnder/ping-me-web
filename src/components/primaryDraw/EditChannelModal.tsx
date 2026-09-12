import React, { useEffect, useState } from "react";
import { Button, TextField, Stack, Typography, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Modal from "../shared/Modal";
import { supabase } from "../../api/supabaseClient";

interface EditChannelModalProps {
	open: boolean;
	onClose: () => void;
	channel: { id: number; name: string } | null;
	onUpdated?: () => void;
	// Called after a successful delete — parent decides whether to
	// navigate away (e.g. if this was the currently active channel).
	onDeleted?: (channelId: number) => void;
}

const EditChannelModal: React.FC<EditChannelModalProps> = ({
	open,
	onClose,
	channel,
	onUpdated,
	onDeleted,
}) => {
	const [name, setName] = useState("");
	const [mode, setMode] = useState<"edit" | "confirmDelete">("edit");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (open && channel) {
			setName(channel.name);
			setMode("edit");
			setError(null);
		}
	}, [open, channel]);

	const handleClose = () => {
		setMode("edit");
		setError(null);
		onClose();
	};

	const handleSave = async () => {
		if (!channel || !name.trim()) return;
		setSaving(true);
		setError(null);
		const { error: updateError } = await supabase
			.from("channels")
			.update({ name: name.trim() })
			.eq("id", channel.id);
		setSaving(false);
		if (updateError) {
			console.error("rename channel", updateError);
			setError(updateError.message);
			return;
		}
		if (onUpdated) onUpdated();
		handleClose();
	};

	const handleDelete = async () => {
		if (!channel) return;
		setSaving(true);
		setError(null);
		const { error: deleteError } = await supabase
			.from("channels")
			.delete()
			.eq("id", channel.id);
		setSaving(false);
		if (deleteError) {
			console.error("delete channel", deleteError);
			setError(deleteError.message);
			return;
		}
		if (onDeleted) onDeleted(channel.id);
		handleClose();
	};

	if (!channel) return null;

	if (mode === "confirmDelete") {
		return (
			<Modal
				open={open}
				onClose={handleClose}
				title="Delete this channel?"
				actions={
					<Stack direction="row" spacing={2}>
						<Button onClick={() => setMode("edit")} disabled={saving}>
							Cancel
						</Button>
						<Button
							onClick={handleDelete}
							color="error"
							variant="contained"
							disabled={saving}
						>
							{saving ? "Deleting..." : "Delete"}
						</Button>
					</Stack>
				}
			>
				<Typography>
					Are you sure you want to delete <b>#{channel.name}</b>? This cannot
					be undone.
				</Typography>
				{error && (
					<Box sx={{ color: "error.main", mt: 2, fontSize: 14 }}>{error}</Box>
				)}
			</Modal>
		);
	}

	return (
		<Modal
			open={open}
			onClose={handleClose}
			title="Edit Channel"
			actions={
				<Stack direction="row" spacing={2}>
					<Button onClick={handleClose} disabled={saving}>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						variant="contained"
						disabled={saving || !name.trim()}
					>
						Save
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
				error={!!error}
				helperText={error}
				disabled={saving}
			/>
			<Button
				color="error"
				startIcon={<DeleteIcon />}
				onClick={() => setMode("confirmDelete")}
				sx={{ mt: 1 }}
				disabled={saving}
			>
				Delete Channel
			</Button>
		</Modal>
	);
};

export default EditChannelModal;
