import { ServerInterface } from "../@types/server";
import { supabase } from "./supabaseClient";

type ServerRow = {
	id: string;
	name: string;
	description: string | null;
	owner_id: string | null;
	created_at: string;
	icon_url: string | null;
	banner_url: string | null;
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
		owner_id: server.owner_id as unknown as number,
		server_image_urls: {
			server_icon_url: server.icon_url ?? "",
			banner_image_url: server.banner_url ?? "",
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
	try {
		const { data: sessionData } = await supabase.auth.getSession();
		if (!sessionData.session) {
			console.warn("fetchMyServers: no session");
			return [];
		}

		const { data: memberRows, error: memberErr } = await supabase
			.from("server_members")
			.select("server_id");

		if (memberErr) {
			console.error("server_members", memberErr);
			return [];
		}
		if (!memberRows?.length) {
			console.warn("fetchMyServers: no memberships");
			return [];
		}

		const ids = memberRows.map((r) => r.server_id);

		const { data: serverRows, error: serverErr } = await supabase
			.from("servers")
			.select(
				"id, name, description, owner_id, created_at, icon_url, banner_url",
			)
			.in("id", ids);

		if (serverErr) {
			console.error("servers", serverErr);
			return [];
		}

		const { data: channelRows, error: channelErr } = await supabase
			.from("channels")
			.select("id, name, server_id")
			.in("server_id", ids);

		if (channelErr) console.error("channels", channelErr);

		return (serverRows ?? []).map((s) =>
			mapServer(
				s,
				(channelRows ?? []).filter((c) => c.server_id === s.id),
			),
		);
	} catch (err) {
		console.error("fetchMyServers", err);
		return [];
	}
}

export async function fetchAllServers(): Promise<ServerInterface[]> {
	try {
		const { data: sessionData } = await supabase.auth.getSession();
		if (!sessionData.session) return [];

		const { data: serverRows, error } = await supabase
			.from("servers")
			.select(
				"id, name, description, owner_id, created_at, icon_url, banner_url, server_members(count)",
			);

		if (error || !serverRows) {
			console.error("fetchAllServers", error);
			return [];
		}

		const ids = serverRows.map((s) => s.id);
		const { data: channelRows } = await supabase
			.from("channels")
			.select("id, name, server_id")
			.in("server_id", ids);

		const mapped = serverRows.map((s) => {
			const countRaw = (s as { server_members?: { count: number }[] })
				.server_members;
			const num_members = countRaw?.[0]?.count ?? 0;
			const server = mapServer(
				s,
				(channelRows ?? []).filter((c) => c.server_id === s.id),
			);
			server.num_members = num_members;
			return server;
		});

		mapped.sort((a, b) => (b.num_members ?? 0) - (a.num_members ?? 0));
		return mapped;
	} catch (err) {
		console.error("fetchAllServers", err);
		return [];
	}
}
