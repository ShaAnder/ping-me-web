import { MessageTypeInterface } from "../@types/message";

export type MessageRow = {
	id: string;
	channel_id: string;
	sender_id: string;
	content: string;
	created_at: string;
	updated_at: string;
	profiles?: { id: string; username: string } | null;
};

export function mapMessage(row: MessageRow): MessageTypeInterface {
	const username = row.profiles?.username ?? "unknown";
	return {
		id: row.id as unknown as number,
		content: row.content,
		timestamp_created: row.created_at,
		timestamp_updated: row.updated_at,
		user: {
			id: row.sender_id as unknown as number,
			username,
			email: "",
			image: "",
			location: "",
			content: "",
			servers: [],
		},
	};
}
