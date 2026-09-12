import { supabase } from "./supabaseClient";

export async function leaveServer(serverId: string) {
	const { data: sessionData } = await supabase.auth.getSession();
	const userId = sessionData.session?.user.id;
	if (!userId) throw new Error("No session");

	const { data: server, error: serverErr } = await supabase
		.from("servers")
		.select("id, owner_id")
		.eq("id", serverId)
		.maybeSingle();
	if (serverErr) throw serverErr;
	if (!server) throw new Error("Server not found");

	const { data: members, error: memberErr } = await supabase
		.from("server_members")
		.select("user_id, created_at")
		.eq("server_id", serverId)
		.order("created_at", { ascending: true });
	if (memberErr) throw memberErr;

	const others = (members ?? []).filter(
		(m) => String(m.user_id) !== String(userId),
	);
	const isOwner = String(server.owner_id) === String(userId);

	if (others.length === 0) {
		const { error } = await supabase
			.from("servers")
			.delete()
			.eq("id", serverId);
		if (error) throw error;
		return { action: "deleted" as const };
	}

	if (isOwner) {
		const { error } = await supabase
			.from("servers")
			.update({ owner_id: others[0].user_id })
			.eq("id", serverId);
		if (error) throw error;
	}

	const { error } = await supabase
		.from("server_members")
		.delete()
		.eq("server_id", serverId)
		.eq("user_id", userId);
	if (error) throw error;

	return { action: isOwner ? ("transferred" as const) : ("left" as const) };
}
