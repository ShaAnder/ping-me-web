import { ServerInterface } from "../@types/server";
import { supabase } from "./supabaseClient";

type ServerRow = {
	id: string;
	name: string;
	description: string | null;
	owner_id: string | null;
	created_at: string;
};

type ChannelRow = {
	id: string;
	name: string;
	server_id: string;
};

export function mapServer(
	server: ServerRow,
	channels: ChannelRow[],
): ServerInterface {
	return {
		id: server.id as unknown as number,
		name: server.name,
		server: server.name,
		description: server.description ?? "",
		category: "",
		category_name: "",
		created_at: server.created_at,
		owner: server.owner_id ?? "",
		owner_id: 0,
		server_image_urls: {
			server_icon_url: "",
			banner_image_url: "",
		},
		channel_server: channels.map((c) => ({
			id: c.id as unknown as number,
			name: c.name,
			server: server.id as unknown as number,
			topic: "",
			owner: 0,
			type: "text",
		})),
	};
}

export async function fetchMyServers(): Promise<ServerInterface[]> {
	const { data: memberRows, error: memberErr } = await supabase
		.from("server_members")
		.select("server_id");

	if (memberErr || !memberRows?.length) return [];

	const ids = memberRows.map((r) => r.server_id);

	const { data: serverRows, error: serverErr } = await supabase
		.from("servers")
		.select("id, name, description, owner_id, created_at")
		.in("id", ids);

	if (serverErr || !serverRows) return [];

	const { data: channelRows } = await supabase
		.from("channels")
		.select("id, name, server_id")
		.in("server_id", ids);

	return serverRows.map((s) =>
		mapServer(
			s,
			(channelRows ?? []).filter((c) => c.server_id === s.id),
		),
	);
}
