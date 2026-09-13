import React, { useState } from "react";
import { Button, TextField, Stack } from "@mui/material";
import Modal from "../shared/Modal";
import { supabase } from "../../api/supabaseClient";

interface AddChannelProps {
	open: boolean;
	onClose: () => void;
	serverId: string;
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
	const [loading, setLoading] = useState(false);

	const handleAddChannel = async () => {
		setLoading(true);
		const { error } = await supabase.from("channels").insert({
			server_id: serverId,
			name: name.trim(),
		});
		if (error) console.error("add channel", error);
		setName("");
		if (onChannelAdded) onChannelAdded();
		setLoading(false);
	};

	if (!isOwner) return null;

	return (
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
		</Modal>
	);
};

export default AddChannel;
